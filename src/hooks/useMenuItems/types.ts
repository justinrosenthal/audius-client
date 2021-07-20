import { PopupMenuItem } from '@audius/stems'
import { useDispatch } from 'react-redux'

import { GetTrackMenuItemsOptions } from './trackMenuItems'

export type MenuVariant = 'collection' | 'notification' | 'track' | 'user'
export type GetMenuItemsOptions = GetTrackMenuItemsOptions

// type GetMenuItems<Options> = (o: Options, dispatch: ReturnType<typeof useDispatch>, toast: (text: string) => void)) => MenuItem

// A helper function that allows Typescript to infer the type of the keys
// while specifying the type of the values
export const asMenuItems = <T, _>(et: { [K in keyof T]: PopupMenuItem }) => et
