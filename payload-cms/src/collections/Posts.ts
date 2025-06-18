import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { MarkFeature } from '../lexical/features/markFeature.server'
import { CustomSuperscriptFeature } from '../lexical/features/CustomSuperscript.server'
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => {
          const filtered = defaultFeatures.filter(
            (feature) => feature.key !== 'superscript' && feature.key !== 'subscript',
          )
          return [...filtered, MarkFeature(), CustomSuperscriptFeature()]
        },
      }),
    },
  ],
}
