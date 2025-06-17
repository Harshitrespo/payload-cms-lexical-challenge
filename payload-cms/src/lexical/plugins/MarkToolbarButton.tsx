'use client'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getSelection, $isRangeSelection, $isTextNode, LexicalNode } from 'lexical'
import { useEffect, useState, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHighlighter } from '@fortawesome/free-solid-svg-icons'
import { $patchStyleText } from '@lexical/selection'
import { HIGHLIGHT_COLOR, HIGHLIGHT_COLOR_RGB } from '@/constant'

export const MarkToolbarButton: React.FC = () => {
  const [editor] = useLexicalComposerContext()
  const [active, setActive] = useState(false)

  const checkHighlightState = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        let hasHighlight = false

        const selectedNodes = selection.getNodes()

        for (const node of selectedNodes) {
          if ($isTextNode(node)) {
            const style = node.getStyle()
            if (style && style.includes('background-color')) {
              if (
                style.includes(HIGHLIGHT_COLOR) ||
                style.includes(HIGHLIGHT_COLOR_RGB) ||
                style.includes('#ffff00') ||
                style.includes('rgb(255, 255, 0)') ||
                style.includes('yellow')
              ) {
                hasHighlight = true
                break
              }
            }
          }

          const element = editor.getElementByKey(node.getKey())
          if (element) {
            const computedStyle = window.getComputedStyle(element)
            const bgColor = computedStyle.backgroundColor
            const inlineStyle = element.style.backgroundColor

            if (
              (bgColor &&
                (bgColor.includes('255, 235, 59') ||
                  bgColor.includes('255, 255, 0') ||
                  bgColor === HIGHLIGHT_COLOR ||
                  bgColor === '#ffff00')) ||
              (inlineStyle &&
                (inlineStyle.includes(HIGHLIGHT_COLOR) ||
                  inlineStyle.includes('#ffff00') ||
                  inlineStyle.includes('rgb(255, 235, 59)') ||
                  inlineStyle.includes('rgb(255, 255, 0)')))
            ) {
              hasHighlight = true
              break
            }
          }
        }

        if (!hasHighlight && selection.getTextContent()) {
          try {
            const anchorNode = selection.anchor.getNode()
            const focusNode = selection.focus.getNode()

            const checkParentHighlight = (node: LexicalNode) => {
              const element = editor.getElementByKey(node.getKey())
              if (element) {
                let current: HTMLElement | null = element
                const rootElement = editor.getRootElement()
                while (current && current !== rootElement) {
                  const style = window.getComputedStyle(current)
                  const bgColor = style.backgroundColor
                  const inlineStyle = current.style.backgroundColor

                  if (
                    (bgColor &&
                      (bgColor.includes('255, 235, 59') || bgColor.includes('255, 255, 0'))) ||
                    (inlineStyle &&
                      (inlineStyle.includes(HIGHLIGHT_COLOR) || inlineStyle.includes('#ffff00')))
                  ) {
                    return true
                  }
                  current = current.parentElement
                }
              }
              return false
            }

            hasHighlight = checkParentHighlight(anchorNode) || checkParentHighlight(focusNode)
          } catch (e) {
            // Fallback: continue with existing logic
            console.error(e)
          }
        }

        setActive(hasHighlight)
      } else {
        setActive(false)
      }
    })
  }, [editor])

  useEffect(() => {
    const unregister = editor.registerUpdateListener(() => {
      checkHighlightState()
    })

    const handleSelectionChange = () => {
      setTimeout(checkHighlightState, 10)
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    const rootElement = editor.getRootElement()
    if (rootElement) {
      rootElement.addEventListener('mouseup', handleSelectionChange)
      rootElement.addEventListener('dblclick', handleSelectionChange)
    }

    return () => {
      unregister()
      document.removeEventListener('selectionchange', handleSelectionChange)
      const rootElement = editor.getRootElement()
      if (rootElement) {
        rootElement.removeEventListener('mouseup', handleSelectionChange)
        rootElement.removeEventListener('dblclick', handleSelectionChange)
      }
    }
  }, [editor, checkHighlightState])

  const toggle = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return

      if (active) {
        $patchStyleText(selection, {
          'background-color': '',
          color: '',
        })
      } else {
        $patchStyleText(selection, {
          'background-color': HIGHLIGHT_COLOR,
          color: 'black',
        })
      }
    })
  }, [editor, active])

  return (
    <button
      type="button"
      title="Highlight"
      aria-label="Highlight"
      onClick={toggle}
      className={`toolbar-popup__button ${active ? 'toolbar-popup__button--active' : ''}`}
      style={{
        backgroundColor: active ? 'var(--theme-elevation-200)' : 'transparent',
      }}
    >
      <FontAwesomeIcon icon={faHighlighter} />
    </button>
  )
}
