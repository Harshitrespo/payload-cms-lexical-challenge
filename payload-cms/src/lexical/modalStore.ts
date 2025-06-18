import { proxy } from 'valtio'
import { NodeKey } from 'lexical'

interface ModalStore {
  isOpen: boolean
  content: string
  nodeKey: NodeKey | null
}

export const modalStore = proxy<ModalStore>({
  isOpen: false,
  content: '',
  nodeKey: null,
})

export const modalActions = {
  open: (nodeKey: NodeKey | null = null) => {
    modalStore.isOpen = true
    modalStore.nodeKey = nodeKey
  },
  close: () => {
    modalStore.isOpen = false
    modalStore.content = ''
    modalStore.nodeKey = null
  },
  setContent: (content: string) => {
    modalStore.content = content
  },
}
