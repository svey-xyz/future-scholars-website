import {CogIcon} from '@sanity/icons/Cog'
import {BlockElementIcon} from '@sanity/icons/BlockElement'
import {BlockquoteIcon} from '@sanity/icons/Blockquote'
import type {StructureBuilder, StructureResolver, StructureResolverContext} from 'sanity/structure'
import {DocumentActionComponent, DocumentActionsContext, Template} from 'sanity'
import pluralize from 'pluralize-esm'

/**
 * Structure builder is useful whenever you want to control how documents are grouped and
 * listed in the studio or for adding additional in-studio previews or content to documents.
 * Learn more: https://www.sanity.io/docs/structure-builder-introduction
 */

// Listed in their own ordered sections, so dropped from the generic
// alphabetical list rather than showing each type twice.
const PROMOTED_TYPES = ['program', 'testimonial']

const DISABLED_TYPES = ['settings', 'assist.instruction.context']

// Define the actions that should be available for singleton documents
const singletonActions = new Set(['publish', 'discardChanges', 'restore'])

// Define the singleton document types
const singletonTypes = new Set(['settings'])

export const structure = (S: StructureBuilder, context: StructureResolverContext) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings')
        .icon(CogIcon)
        .child(S.document().title('Site Settings').schemaType('settings').documentId('settings')),
      S.divider(),

      // Programs and testimonials get their own sections, sorted by `order`.
      S.listItem()
        .title('Programs')
        .icon(BlockElementIcon)
        .child(
          S.documentTypeList('program')
            .title('Programs')
            .defaultOrdering([{field: 'order', direction: 'asc'}]),
        ),
      S.listItem()
        .title('Testimonials')
        .icon(BlockquoteIcon)
        .child(
          S.documentTypeList('testimonial')
            .title('Testimonials')
            .defaultOrdering([{field: 'order', direction: 'asc'}]),
        ),
      S.divider(),

      ...S.documentTypeListItems()
        // Remove the "assist.instruction.context" and "settings" content  from the list of content types
        .filter(
          (listItem: any) =>
            !DISABLED_TYPES.includes(listItem.getId()) &&
            !PROMOTED_TYPES.includes(listItem.getId()),
        )
        // Pluralize the title of each document type.  This is not required but just an option to consider.
        .map((listItem) => {
          return listItem.title(pluralize(listItem.getTitle() as string))
        }),
    ])

export const schemaOptions = {
  // Keep singletons out of the global "New document" menu.
  templates: (templates: Template<any, any>[]) =>
    templates.filter(({schemaType}: {schemaType: string}) => !singletonTypes.has(schemaType)),
}
export const documentOptions = {
  // For singleton types, filter out actions that are not explicitly included
  // in the `singletonActions` list defined above
  actions: (input: DocumentActionComponent[], context: DocumentActionsContext) =>
    singletonTypes.has(context.schemaType)
      ? input.filter(({action}) => action && singletonActions.has(action))
      : input,
}
