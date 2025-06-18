import { createServerFeature } from '@payloadcms/richtext-lexical'
import { FootnoteNode } from '../nodes/FootnoteNode'

export const CustomSuperscriptFeature = createServerFeature({
  key: 'superscript', //INFO: Hijack the superscript key
  feature: {
    ClientFeature: '/lexical/features/CustomSuperscript.client#CustomSuperscriptFeature',
    nodes: [{ node: FootnoteNode }],
  },
})
