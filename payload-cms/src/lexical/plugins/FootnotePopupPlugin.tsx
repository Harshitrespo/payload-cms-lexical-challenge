'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNodeByKey, NodeKey } from 'lexical'
import { modalActions } from '../modalStore'
import {
  FootnoteNode,
  SHOW_FOOTNOTE_POPUP_COMMAND,
  HIDE_FOOTNOTE_POPUP_COMMAND,
} from '../nodes/FootnoteNode'
import { mergeRegister } from '@lexical/utils'
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// Import necessary components for the read-only editor
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { LinkNode } from '@lexical/link'
import { HeadingNode } from '@lexical/rich-text'
import { ListItemNode, ListNode } from '@lexical/list'

const popupEditorConfig = {
  namespace: 'FootnotePopupEditor',
  nodes: [HeadingNode, LinkNode, ListNode, ListItemNode],
  onError: (error: Error) => {
    console.error('Popup editor error:', error)
  },
  editable: false, // Make it read-only
  theme: {
    text: {
      bold: 'font-bold',
      italic: 'italic',
      strikethrough: 'line-through',
    },
    link: 'text-blue-600 underline',
  },
}

interface FootnotePopupProps {
  anchorElement: HTMLElement
  nodeKey: NodeKey
  initialContent: string
  onMouseEnter: () => void
  onMouseLeave: () => void
}

const FootnotePopup: React.FC<FootnotePopupProps> = ({
  anchorElement,
  nodeKey,
  initialContent,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [editor] = useLexicalComposerContext()
  const [position, setPosition] = useState({ top: 0, left: 0 })

  const initialConfig = {
    ...popupEditorConfig,
    editorState: initialContent,
  }

  useEffect(() => {
    const rect = anchorElement.getBoundingClientRect()
    setPosition({
      top: rect.bottom + 5, // Position below the footnote
      left: rect.left,
    })
  }, [anchorElement])

  const handleDelete = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (node) node.remove()
    })
  }, [editor, nodeKey])

  const handleEdit = useCallback(() => {
    modalActions.open(nodeKey)
  }, [nodeKey])

  return (
    <div
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 1001,
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        minWidth: '250px',
        maxWidth: '400px',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          color: '#333',
        }}
      >
        <LexicalComposer initialConfig={initialConfig}>
          <RichTextPlugin
            contentEditable={<ContentEditable />}
            placeholder={null}
            ErrorBoundary={React.Fragment}
          />
          <LinkPlugin />
        </LexicalComposer>
      </div>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px solid #f0f0f0',
        }}
      >
        <button
          onClick={handleEdit}
          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#555' }}
        >
          <FontAwesomeIcon icon={faEdit} />
        </button>
        <button
          onClick={handleDelete}
          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#e53e3e' }}
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    </div>
  )
}

interface ActiveFootnote {
  nodeKey: NodeKey
  anchorElement: HTMLElement
  content: string
}

export const FootnotePopupPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext()
  const [activeFootnote, setActiveFootnote] = useState<ActiveFootnote | null>(null)
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null)

  const showPopup = useCallback(
    (payload: { nodeKey: NodeKey; anchorElement: HTMLElement }) => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
      }
      let content = '{}' // Default to empty state
      editor.getEditorState().read(() => {
        const node = $getNodeByKey(payload.nodeKey) as FootnoteNode
        if (node && node.__content) {
          content = node.__content
        }
      })
      setActiveFootnote({ ...payload, content })
    },
    [editor],
  )

  const hidePopup = useCallback(() => {
    hideTimerRef.current = setTimeout(() => {
      setActiveFootnote(null)
    }, 200)
  }, [])

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        SHOW_FOOTNOTE_POPUP_COMMAND,
        (payload) => {
          showPopup(payload)
          return true
        },
        1,
      ),
      editor.registerCommand(
        HIDE_FOOTNOTE_POPUP_COMMAND,
        () => {
          hidePopup()
          return true
        },
        1,
      ),
    )
  }, [editor, showPopup, hidePopup])

  if (!activeFootnote) return null

  return createPortal(
    <FootnotePopup
      anchorElement={activeFootnote.anchorElement}
      nodeKey={activeFootnote.nodeKey}
      initialContent={activeFootnote.content}
      onMouseEnter={() => {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      }}
      onMouseLeave={hidePopup}
    />,
    document.body,
  )
}
