'use client'
import React, { useState, useCallback, useEffect } from 'react'
import { useSnapshot } from 'valtio'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getSelection,
  $isRangeSelection,
  $insertNodes,
  $getNodeByKey,
  FORMAT_TEXT_COMMAND,
  RangeSelection,
  LexicalEditor,
  NodeKey,
  EditorConfig,
  $createTextNode,
} from 'lexical'
import { modalStore, modalActions } from '../modalStore'
import { $createFootnoteNode, $isFootnoteNode, FootnoteNode } from '../nodes/FootnoteNode'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { LinkNode, $isLinkNode, TOGGLE_LINK_COMMAND, SerializedLinkNode } from '@lexical/link'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { ListItemNode, ListNode } from '@lexical/list'
import { HeadingNode } from '@lexical/rich-text'
import { $isAtNodeEnd } from '@lexical/selection'

export class CustomLinkNode extends LinkNode {
  static getType(): string {
    return 'link'
  }

  static clone(node: CustomLinkNode): CustomLinkNode {
    return new CustomLinkNode(node.__url, { rel: node.__rel, target: node.__target }, node.__key)
  }

  constructor(
    url: string,
    attributes: { rel?: string | null; target?: string | null } = {},
    key?: NodeKey,
  ) {
    super(url, attributes, key)
    this.__target = '_blank'
    this.__rel = 'noopener noreferrer'
  }

  createDOM(config: EditorConfig): HTMLAnchorElement {
    const dom = super.createDOM(config)
    if (dom instanceof HTMLAnchorElement) {
      dom.target = '_blank'
      dom.rel = 'noopener noreferrer'
      return dom
    }
    const anchor = document.createElement('a')
    anchor.href = this.__url
    anchor.target = '_blank'
    anchor.rel = 'noopener noreferrer'
    if (config.theme?.link) {
      anchor.className = config.theme.link
    }
    return anchor
  }

  static importJSON(serializedNode: SerializedLinkNode): CustomLinkNode {
    const node = new CustomLinkNode(serializedNode.url)
    node.setFormat(serializedNode.format)
    node.setIndent(serializedNode.indent)
    node.setDirection(serializedNode.direction)
    return node
  }

  exportJSON(): SerializedLinkNode {
    return {
      ...super.exportJSON(),
      target: '_blank',
      rel: 'noopener noreferrer',
      type: 'link',
      version: 1,
    }
  }
}

export function $createCustomLinkNode(
  url: string,
  attributes?: { rel?: string | null; target?: string | null },
): CustomLinkNode {
  return new CustomLinkNode(url, attributes)
}

const footnoteEditorConfig = {
  namespace: 'FootnoteEditor',
  nodes: [HeadingNode, ListNode, ListItemNode, CustomLinkNode],
  onError: (error: Error) => {
    console.error('Footnote editor error:', error)
  },
  theme: {
    text: {
      bold: 'font-bold',
      italic: 'italic',
      strikethrough: 'line-through',
    },
    link: 'text-blue-600 underline',
  },
}

function getSelectedNode(selection: RangeSelection) {
  const anchor = selection.anchor
  const focus = selection.focus
  const anchorNode = selection.anchor.getNode()
  const focusNode = selection.focus.getNode()
  if (anchorNode === focusNode) {
    return anchorNode
  }
  const isBackward = selection.isBackward()
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode
  } else {
    return $isAtNodeEnd(anchor) ? focusNode : anchorNode
  }
}

const FootnoteToolbar = () => {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [isLink, setIsLink] = useState(false)

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))
      setIsStrikethrough(selection.hasFormat('strikethrough'))
      const node = getSelectedNode(selection)
      const parent = node.getParent()
      setIsLink($isLinkNode(parent) || $isLinkNode(node))
    }
  }, [])

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar()
      })
    })
  }, [editor, updateToolbar])

  const insertLink = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const node = getSelectedNode(selection)
        const parent = node.getParent()

        if ($isLinkNode(parent) || $isLinkNode(node)) {
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
        } else {
          if (selection.getTextContent()) {
            const url = prompt('Enter URL:', 'https://')
            if (url && url.trim()) {
              const linkNode = $createCustomLinkNode(url.trim())
              if (selection.isCollapsed()) {
                linkNode.append($createTextNode(url))
                $insertNodes([linkNode])
              } else {
                // Wrap selected text in link
                const textContent = selection.getTextContent()
                linkNode.append($createTextNode(textContent))
                selection.insertNodes([linkNode])
              }
            }
          } else {
            const url = prompt('Enter URL:', 'https://')
            if (url && url.trim()) {
              editor.dispatchCommand(TOGGLE_LINK_COMMAND, url.trim())
            }
          }
        }
      }
    })
  }, [editor])

  return (
    <div
      style={{
        display: 'flex',
        gap: '5px',
        marginBottom: '10px',
        borderBottom: '1px solid #eee',
        paddingBottom: '10px',
      }}
    >
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        style={{ fontWeight: isBold ? 'bold' : 'normal' }}
      >
        B
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        style={{ fontStyle: isItalic ? 'italic' : 'normal' }}
      >
        I
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
        style={{ textDecoration: isStrikethrough ? 'line-through' : 'none' }}
      >
        S
      </button>
      <button
        type="button"
        onClick={insertLink}
        style={{ textDecoration: isLink ? 'underline' : 'none' }}
      >
        Link
      </button>
    </div>
  )
}

export const FootnoteModal: React.FC = () => {
  const [editor] = useLexicalComposerContext()
  const modalState = useSnapshot(modalStore)
  const [modalEditor, setModalEditor] = useState<LexicalEditor | null>(null)

  const initialConfig = {
    ...footnoteEditorConfig,
    editorState: (e: LexicalEditor) => {
      const nodeKey = modalState.nodeKey
      if (nodeKey) {
        const node = editor.getEditorState()._nodeMap.get(nodeKey) as FootnoteNode
        if (node && node.__content) {
          try {
            const parsedState = e.parseEditorState(node.__content)
            e.setEditorState(parsedState)
          } catch (error) {
            console.error('Error parsing footnote content:', error)
          }
        }
      }
    },
  }

  const getNextFootnoteId = React.useCallback(() => {
    let maxId = 0
    editor.getEditorState().read(() => {
      const allNodes = editor.getEditorState()._nodeMap
      allNodes.forEach((node) => {
        if ($isFootnoteNode(node)) {
          maxId = Math.max(maxId, node.__footnoteID)
        }
      })
    })
    return maxId + 1
  }, [editor])

  const handleSave = React.useCallback(() => {
    if (!modalEditor) return

    const editorState = modalEditor.getEditorState()
    const contentToSave = JSON.stringify(editorState.toJSON())
    const nodeKey = modalState.nodeKey

    if (nodeKey) {
      editor.update(() => {
        const node = $getNodeByKey<FootnoteNode>(nodeKey)
        if ($isFootnoteNode(node)) {
          node.setContent(contentToSave)
        }
      })
    } else {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          const nextId = getNextFootnoteId()
          const footnoteNode = $createFootnoteNode(nextId, contentToSave)
          $insertNodes([footnoteNode])
        }
      })
    }

    modalActions.close()
  }, [editor, getNextFootnoteId, modalState.nodeKey, modalEditor])

  if (!modalState.isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={modalActions.close}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          minWidth: '500px',
          maxWidth: '700px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 15px 0' }}>{modalState.nodeKey ? 'Edit' : 'Add'} Footnote</h3>
        <div
          style={{
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '10px',
            minHeight: '150px',
            position: 'relative',
          }}
        >
          <LexicalComposer initialConfig={initialConfig}>
            <FootnoteToolbar />
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  style={{
                    minHeight: '120px',
                    outline: 'none',
                    color: '#000',
                  }}
                />
              }
              placeholder={
                <div
                  style={{
                    color: '#999',
                    position: 'absolute',
                    top: '55px',
                    left: '10px',
                    pointerEvents: 'none',
                  }}
                >
                  Enter footnote content...
                </div>
              }
              ErrorBoundary={React.Fragment}
            />
            <OnChangePlugin
              onChange={(editorState, editor) => {
                setModalEditor(editor)
              }}
            />
            <HistoryPlugin />
            <LinkPlugin validateUrl={(url) => url.startsWith('http')} />
            <ListPlugin />
          </LexicalComposer>
        </div>
        <div
          style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}
        >
          <button
            type="button"
            onClick={modalActions.close}
            style={{
              padding: '10px 20px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#0066cc',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            {modalState.nodeKey ? 'Update' : 'Insert'}
          </button>
        </div>
      </div>
    </div>
  )
}
