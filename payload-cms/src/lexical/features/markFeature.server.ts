import { createServerFeature } from '@payloadcms/richtext-lexical'
import { MarkNode } from '../nodes/MarkNode'

export const MarkFeature = createServerFeature({
  key: 'mark',
  feature: {
    ClientFeature: '/lexical/features/mark.client#MarkFeature',
    nodes: [{ node: MarkNode }],
  },
})
