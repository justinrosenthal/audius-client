import { push as pushRoute } from 'connected-react-router'
import { useDispatch } from 'react-redux'

import * as embedModalActions from 'containers/embed-modal/store/actions'
import { requestOpen as openAddToPlaylist } from 'containers/add-to-playlist/store/actions'
import { requestOpen as openTikTokModal } from 'containers/share-sound-to-tiktok-modal/store/slice'
import { ID, PlayableType } from 'models/common/Identifiers'
import { FavoriteSource, RepostSource, ShareSource } from 'services/analytics'
import * as editTrackModalActions from 'store/application/ui/editTrackModal/actions'
import { showSetAsArtistPickConfirmation } from 'store/application/ui/setAsArtistPickConfirmation/actions'
import {
  saveTrack,
  unsaveTrack,
  repostTrack,
  undoRepostTrack,
  shareTrack
} from 'store/social/tracks/actions'
import { profilePage } from 'utils/route'

import { asConditionalMenuItems } from './types'
import { FeatureFlags, getFeatureEnabled } from 'services/remote-config'

const messages = {
  addToPlaylist: 'Add to Playlist',
  copiedToClipboard: 'Copied To Clipboard!',
  edit: 'Edit Track',
  embed: 'Embed',
  favorite: 'Favorite',
  repost: 'Repost',
  reposted: 'Reposted!',
  setArtistPick: 'Set as Artist Pick',
  share: 'Share',
  shareToTikTok: 'Share to TikTok',
  undoRepost: 'Undo Repost',
  unfavorite: 'Unfavorite',
  unreposted: 'Un-Reposted!',
  unsetArtistPick: 'Unset as Artist Pick',
  visitArtistPage: 'Visit Artist Page',
  visitTrackPage: 'Visit Track Page'
}

export type GetTrackMenuItemsOptions = {
  handle: string
  id: ID
  isArtistPick?: boolean
  isDeleted?: boolean
  isFavorited?: boolean
  isOwner?: boolean
  isPublic?: boolean
  isReposted?: boolean
  title: string
  trackPermaLink: string
}

export const getTrackMenuItems = (
  {
    handle,
    id,
    isArtistPick,
    isDeleted,
    isFavorited,
    isOwner,
    isPublic,
    isReposted,
    title,
    trackPermaLink
  }: GetTrackMenuItemsOptions,
  dispatch: ReturnType<typeof useDispatch>,
  toast: (text: string) => void
) =>
  asConditionalMenuItems({
    addToPlaylist: {
      condition: () => !isDeleted,
      item: {
        onClick: () => dispatch(openAddToPlaylist(id, title)),
        text: messages.addToPlaylist
      }
    },
    edit: {
      condition: () => !!isOwner && !isDeleted,
      item: {
        onClick: () => dispatch(editTrackModalActions.open(id)),
        text: messages.edit
      }
    },
    embed: {
      condition: () => !!isPublic,
      item: {
        onClick: () => dispatch(embedModalActions.open(id, PlayableType.TRACK)),
        text: messages.embed
      }
    },
    favorite: {
      condition: () => !isOwner && (!isDeleted || !!isFavorited),
      item: {
        // Set timeout so the menu has time to close before we propagate the change.
        onClick: () =>
          setTimeout(() => {
            dispatch(
              (isFavorited ? saveTrack : unsaveTrack)(
                id,
                FavoriteSource.OVERFLOW
              )
            )
          }, 0),
        text: isFavorited ? messages.unfavorite : messages.favorite
      }
    },
    repost: {
      condition: () => !isOwner && !isDeleted,
      item: {
        // Set timeout so the menu has time to close before we propagate the change.
        onClick: () =>
          setTimeout(() => {
            dispatch(
              (isReposted ? undoRepostTrack : repostTrack)(
                id,
                RepostSource.OVERFLOW
              )
            )
            toast(isReposted ? messages.unreposted : messages.reposted)
          }, 0),
        text: isReposted ? messages.undoRepost : messages.repost
      }
    },
    // TODO: Add back go to album when we have better album linking.
    // visitAlbumPage: {
    //   condition: () => albumId && albumName,
    //   item: {
    //     onClick: () =>
    //       dispatch(goToRoute(albumPage(handle, albumName, albumId))),
    //     text: 'Visit Album Page'
    //   }
    // },
    setArtistPick: {
      condition: () => !!id && !!isOwner && !isDeleted,
      item: {
        onClick: () =>
          dispatch(
            isArtistPick
              ? showSetAsArtistPickConfirmation()
              : showSetAsArtistPickConfirmation(id)
          ),
        text: isArtistPick ? messages.unsetArtistPick : messages.setArtistPick
      }
    },
    share: {
      condition: () => !isDeleted,
      item: {
        onClick: () => {
          if (id) {
            dispatch(shareTrack(id, ShareSource.OVERFLOW))
            toast(messages.copiedToClipboard)
          }
        },
        text: messages.share
      }
    },
    shareToTikTok: {
      condition: () =>
        !!getFeatureEnabled(FeatureFlags.SHARE_SOUND_TO_TIKTOK) &&
        !!id &&
        !!isOwner &&
        !isDeleted,
      item: {
        onClick: () => dispatch(openTikTokModal({ id })),
        text: messages.shareToTikTok
      }
    },
    visitArtistPage: {
      condition: () => !!handle,
      item: {
        onClick: () => dispatch(pushRoute(profilePage(handle))),
        text: messages.visitArtistPage
      }
    },
    visitTrackPage: {
      condition: () => !!id && !!title && !isDeleted,
      item: {
        onClick: () => dispatch(pushRoute(trackPermaLink)),
        text: messages.visitTrackPage
      }
    }
  })
