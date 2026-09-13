import {CogIcon} from '@sanity/icons/Cog'
import {TagIcon} from '@sanity/icons/Tag'
import type {StructureBuilder, StructureResolver, StructureResolverContext} from 'sanity/structure'
import {DocumentActionComponent, DocumentActionsContext, Template} from 'sanity'
import pluralize from 'pluralize-esm'

/**
 * Structure builder is useful whenever you want to control how documents are grouped and
 * listed in the studio or for adding additional in-studio previews or content to documents.
 * Learn more: https://www.sanity.io/docs/structure-builder-introduction
 */

// FSMA fork (build plan D13/S2): the template's blog/portfolio document types
// are hidden from the Studio rather than deleted, so merges from
// `sanity-next-clean` stay clean. Restore by removing them from this list.
const FSMA_HIDDEN_TYPES = ['post', 'project', 'technology', 'category']

const DISABLED_TYPES = ['settings', 'assist.instruction.context', ...FSMA_HIDDEN_TYPES]

// Define the actions that should be available for singleton documents
const singletonActions = new Set(['publish', 'discardChanges', 'restore'])

// Define the singleton document types
const singletonTypes = new Set(['settings'])

export const structure = (S: StructureBuilder, context: StructureResolverContext) =>
  S.list()
    .title('Content')
    .items([
      /** ABOUT */
      S.listItem()
        .title('Site Settings')
        .icon(CogIcon)
        .child(S.document().title('Site Settings').schemaType('settings').documentId('settings')),
      // S.documentTypeListItem('taxonomy').title('Taxonomies').icon(_TagIcon),
      S.divider(),

      ...S.documentTypeListItems()
        // Remove the "assist.instruction.context" and "settings" content  from the list of content types
        .filter((listItem: any) => !DISABLED_TYPES.includes(listItem.getId()))
        // Pluralize the title of each document type.  This is not required but just an option to consider.
        .map((listItem) => {
          return listItem.title(pluralize(listItem.getTitle() as string))
        }),
    ])

export const schemaOptions = {
  // types: types,
  // Filter out singleton types from the global “New document” menu options
  // Also keep the FSMA-hidden types out of the global "New document" menu —
  // filtering the structure list alone still leaves them creatable there.
  templates: (templates: Template<any, any>[]) =>
    templates.filter(
      ({schemaType}: {schemaType: string}) =>
        !singletonTypes.has(schemaType) && !FSMA_HIDDEN_TYPES.includes(schemaType),
    ),
}
export const documentOptions = {
  // For singleton types, filter out actions that are not explicitly included
  // in the `singletonActions` list defined above
  actions: (input: DocumentActionComponent[], context: DocumentActionsContext) =>
    singletonTypes.has(context.schemaType)
      ? input.filter(({action}) => action && singletonActions.has(action))
      : input,
}
