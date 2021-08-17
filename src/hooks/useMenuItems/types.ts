import { PopupMenuItem } from '@audius/stems'

export type CollectionVariant = 'album' | 'playlist'

// A helper function that allows Typescript to infer the type of the keys
// while specifying the type of the values
export const asConditionalMenuItems = <T, _>(
  et: { [K in keyof T]: { item: PopupMenuItem; condition?: () => boolean } }
) => et
