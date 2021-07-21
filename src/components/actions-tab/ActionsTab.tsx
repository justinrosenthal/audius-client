import React, { useContext } from 'react'

import cn from 'classnames'
import { useDispatch, useSelector } from 'react-redux'

import {
  IconKebabHorizontal,
  IconRepost,
  IconShare,
  PopupMenu
} from '@audius/stems'
import Toast from 'components/toast/Toast'
import Tooltip from 'components/tooltip/Tooltip'
import { ComponentPlacement } from 'components/types'
import { ToastContext } from 'components/toast/ToastContext'
import { ShareSource, RepostSource } from 'services/analytics'
import { getUserHandle } from 'store/account/selectors'
import {
  repostCollection,
  undoRepostCollection,
  shareCollection
} from 'store/social/collections/actions'
import {
  repostTrack,
  undoRepostTrack,
  shareTrack
} from 'store/social/tracks/actions'
import { isShareToastDisabled } from 'utils/clipboardUtil'
import {
  REPOST_TOAST_TIMEOUT_MILLIS,
  SHARE_TOAST_TIMEOUT_MILLIS
} from 'utils/constants'

import styles from './ActionsTab.module.css'
import { useMenuItems } from 'hooks/useMenuItems/useMenuItems'
import { MenuVariant } from 'hooks/useMenuItems/types'

type ActionsTabVariant = 'track' | 'playlist' | 'album'

type ActionsTabProps = {
  containerStyles?: string
  currentUserReposted?: boolean
  currentUserSaved?: boolean
  direction?: 'vertical' | 'horizontal'
  handle?: string
  id?: number
  includeEdit?: boolean
  isArtistPick?: boolean
  isDisabled?: boolean
  isHidden?: boolean
  isPublic?: boolean
  standalone?: boolean
  title?: string
  userHandle?: string
  variant?: ActionsTabVariant
}

const variantToMenuVariant: { [k in ActionsTabVariant]: MenuVariant } = {
  track: 'track',
  playlist: 'collection',
  album: 'collection'
}

export const ActionsTab = ({
  containerStyles,
  currentUserReposted,
  currentUserSaved,
  direction = 'vertical',
  handle = 'handle',
  id,
  includeEdit,
  isArtistPick,
  isDisabled,
  isHidden,
  isPublic,
  standalone,
  title,
  variant = 'track'
}: ActionsTabProps) => {
  // TODO: sk - use toastcontext
  const { toast } = useContext(ToastContext)

  const dispatch = useDispatch()
  const userHandle = useSelector(getUserHandle)

  const isOwner = handle === userHandle

  const menuItemOptions = useMenuItems(variantToMenuVariant[variant], {
    handle: handle,
    id,
    isFavorited: currentUserSaved,
    isReposted: currentUserReposted,
    isOwner,
    isArtistPick,
    isPublic,
    title
  })

  const menuItems =
    variant === 'track'
      ? [
          menuItemOptions.favorite,
          menuItemOptions.addToPlaylist,
          menuItemOptions.visitTrackPage,
          menuItemOptions.setArtistPick,
          menuItemOptions.visitArtistPage,
          ...(includeEdit ? [menuItemOptions.edit] : []),
          menuItemOptions.embed
        ]
      : [
          // TODO: sk - collection menu
          menuItemOptions.favorite,
          menuItemOptions.addToPlaylist,
          menuItemOptions.visitTrackPage,
          menuItemOptions.setArtistPick,
          menuItemOptions.visitArtistPage,
          ...(includeEdit ? [menuItemOptions.edit] : []),
          menuItemOptions.embed
        ]

  const onToggleRepost = () => {
    if (id) {
      if (variant === 'track') {
        const action = currentUserReposted ? undoRepostTrack : repostTrack
        dispatch(action(id, RepostSource.TILE))
      } else if (variant === 'playlist' || variant === 'album') {
        const action = currentUserReposted
          ? undoRepostCollection
          : repostCollection
        dispatch(action(id, RepostSource.TILE))
      }
    }
  }

  const onShare = () => {
    if (id) {
      if (variant === 'track') {
        dispatch(shareTrack(id, ShareSource.TILE))
      } else if ((variant === 'playlist' || variant === 'album') && id) {
        dispatch(shareCollection(id, ShareSource.TILE))
      }
    }
  }

  return (
    <div
      className={cn(
        styles.actionsSection,
        {
          [styles.show]: !isHidden,
          [styles.hide]: isHidden,
          [styles.horizontal]: direction === 'horizontal',
          [styles.vertical]: direction === 'vertical',
          [styles.disabled]: isDisabled,
          [styles.standalone]: standalone
        },
        containerStyles
      )}
    >
      <Tooltip
        text={currentUserReposted ? 'Unrepost' : 'Repost'}
        disabled={isHidden || isDisabled || isOwner}
        placement={direction === 'horizontal' ? 'bottom' : 'right'}
      >
        <div
          className={cn(styles.actionButton, {
            [styles.disabled]: isOwner
          })}
          onClick={isDisabled || isOwner ? () => {} : onToggleRepost}
        >
          <Toast
            text={'Reposted!'}
            disabled={currentUserReposted || isHidden || isDisabled || isOwner}
            delay={REPOST_TOAST_TIMEOUT_MILLIS}
            containerClassName={styles.actionIconContainer}
            placement={
              direction === 'horizontal'
                ? ComponentPlacement.BOTTOM
                : ComponentPlacement.RIGHT
            }
          >
            <IconRepost
              className={cn(styles.iconRepost, {
                [styles.reposted]: currentUserReposted
              })}
            />
          </Toast>
        </div>
      </Tooltip>
      <Tooltip
        text='Share'
        disabled={isHidden || isDisabled}
        placement={direction === 'horizontal' ? 'bottom' : 'right'}
      >
        <div
          className={styles.actionButton}
          onClick={isDisabled ? () => {} : onShare}
        >
          <Toast
            text={'Copied To Clipboard!'}
            disabled={isHidden || isDisabled || isShareToastDisabled}
            requireAccount={false}
            delay={SHARE_TOAST_TIMEOUT_MILLIS}
            containerClassName={styles.actionIconContainer}
            placement={
              direction === 'horizontal'
                ? ComponentPlacement.BOTTOM
                : ComponentPlacement.RIGHT
            }
          >
            <IconShare className={styles.iconShare} />
          </Toast>
        </div>
      </Tooltip>
      <div className={styles.actionButton}>
        {isDisabled || isHidden ? (
          <div className={styles.iconKebabHorizontalWrapper}>
            <IconKebabHorizontal className={styles.iconKebabHorizontal} />
          </div>
        ) : (
          <PopupMenu
            items={menuItems}
            renderTrigger={(ref, triggerPopup) => (
              <div
                className={styles.iconKebabHorizontalWrapper}
                onClick={triggerPopup}
              >
                <IconKebabHorizontal
                  className={styles.iconKebabHorizontal}
                  ref={ref}
                />
              </div>
            )}
          />
        )}
      </div>
    </div>
  )
}

export default ActionsTab
