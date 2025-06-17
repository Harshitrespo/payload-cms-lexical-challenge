import { BLACK_COLOR, HIGHLIGHT_COLOR } from '@/constant'
import { TextNode, LexicalNode, SerializedTextNode, Spread } from 'lexical'

export type SerializedMarkNode = Spread<
  {
    type: 'mark'
    version: 1
  },
  SerializedTextNode
>

export class MarkNode extends TextNode {
  static getType(): string {
    return 'mark'
  }

  static clone(node: MarkNode): MarkNode {
    return new MarkNode(node.__text, node.__key)
  }

  static importJSON(serializedNode: SerializedMarkNode): MarkNode {
    const node = new MarkNode(serializedNode.text)
    node.setFormat(serializedNode.format)
    node.setDetail(serializedNode.detail)
    node.setMode(serializedNode.mode)
    node.setStyle(serializedNode.style)
    return node
  }

  exportJSON(): SerializedMarkNode {
    return {
      ...super.exportJSON(),
      type: 'mark',
      version: 1,
    }
  }

  createDOM(): HTMLElement {
    const dom = document.createElement('mark')
    dom.style.backgroundColor = HIGHLIGHT_COLOR
    dom.style.color = BLACK_COLOR
    if (this.__style) {
      dom.setAttribute('style', this.__style)
    }
    return dom
  }

  updateDOM(prevNode: MarkNode, dom: HTMLElement): boolean {
    if (this.__style !== prevNode.__style) {
      if (this.__style) {
        dom.setAttribute('style', this.__style)
      }
    }
    return false
  }

  // Override to ensure proper serialization to HTML
  exportDOM(): { element: HTMLElement } {
    const element = document.createElement('mark')
    element.style.backgroundColor = HIGHLIGHT_COLOR
    element.style.color = BLACK_COLOR
    element.textContent = this.getTextContent()
    return { element }
  }
}

export function $createMarkNode(text = ''): MarkNode {
  return new MarkNode(text)
}

export function $isMarkNode(node: LexicalNode | null | undefined): node is MarkNode {
  return node instanceof MarkNode
}
