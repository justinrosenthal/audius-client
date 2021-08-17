import { useContext } from 'react'

import { pickBy } from 'lodash'

import { ToastContext } from 'components/toast/ToastContext'
import { useDispatch } from 'react-redux'

import { getTrackMenuItems } from './getTrackMenuItems'

const menuItemGetterByVariant = {
  collection: getTrackMenuItems,
  notification: getTrackMenuItems,
  track: getTrackMenuItems,
  user: getTrackMenuItems
}

type MenuItemGetterByVariant = typeof menuItemGetterByVariant

export const useMenuItems = <MenuVariant extends keyof MenuItemGetterByVariant>(
  variant: MenuVariant,
  options: Parameters<MenuItemGetterByVariant[MenuVariant]>[0]
) => {
  const dispatch = useDispatch()
  const { toast } = useContext(ToastContext)

  return pickBy(
    menuItemGetterByVariant[variant](options, dispatch, toast),
    ({ condition }) => !condition || condition()
  )
}
