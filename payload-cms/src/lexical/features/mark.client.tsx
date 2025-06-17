'use client'

import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import { MarkNode } from '../nodes/MarkNode'
import { MarkToolbarButton } from '../plugins/MarkToolbarButton'

export const MarkFeature = createClientFeature({
  nodes: [MarkNode],
  toolbarInline: {
    groups: [
      {
        key: 'format',
        type: 'buttons',
        items: [
          {
            key: 'mark',
            order: 4.5,
            Component: MarkToolbarButton,
          },
        ],
      },
    ],
  },
})
