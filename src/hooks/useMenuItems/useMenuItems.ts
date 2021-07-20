import { useContext } from 'react'

import { ToastContext } from 'components/toast/ToastContext'
import { useDispatch } from 'react-redux'

import { getTrackMenuItems, GetTrackMenuItemsOptions } from './trackMenuItems'
import { MenuVariant } from './types'

export const useMenuItems = (
  variant: MenuVariant,
  options: GetTrackMenuItemsOptions
) => {
  const dispatch = useDispatch()
  const { toast } = useContext(ToastContext)

  return {
    collection: getTrackMenuItems,
    notification: getTrackMenuItems,
    track: getTrackMenuItems,
    user: getTrackMenuItems
  }[variant](options, dispatch, toast)
}
