import { useContext } from 'react'

import { push as pushRoute } from 'connected-react-router'
import { connect, useDispatch } from 'react-redux'
import { Dispatch } from 'redux'

import { PopupMenuItem } from 'components/general/PopupMenu'
import { ToastContext } from 'components/toast/ToastContext'
import { requestOpen as openAddToPlaylist } from 'containers/add-to-playlist/store/actions'
import { getCollectionId } from 'containers/collection-page/store/selectors'
import * as embedModalActions from 'containers/embed-modal/store/actions'
import { ID, PlayableType } from 'models/common/Identifiers'
import { newCollectionMetadata } from 'schemas'
import {
  FavoriteSource,
  RepostSource,
  ShareSource,
  CreatePlaylistSource
} from 'services/analytics'
import { getAccountOwnedPlaylists } from 'store/account/selectors'
import * as editTrackModalActions from 'store/application/ui/editTrackModal/actions'
import { showSetAsArtistPickConfirmation } from 'store/application/ui/setAsArtistPickConfirmation/actions'
import {
  createPlaylist,
  addTrackToPlaylist
} from 'store/cache/collections/actions'
import {
  saveTrack,
  unsaveTrack,
  repostTrack,
  undoRepostTrack,
  shareTrack
} from 'store/social/tracks/actions'
import { AppState } from 'store/types'
import { trackPage, profilePage } from 'utils/route'

const toastMessages = {
  copiedToClipboard: 'Copied To Clipboard!',
  reposted: 'Reposted!',
  unreposted: 'Un-Reposted!'
}

// TODO: sk - is this separate object really necessary
const itemLabels = {
  addToPlaylist: 'Add to Playlist',
  edit: 'Edit Track',
  embed: 'Embed',
  favorite: 'Favorite',
  repost: 'Repost',
  setArtistPick: 'Set as Artist Pick',
  share: 'Share',
  undoRepost: 'Undo Repost',
  unfavorite: 'Unfavorite',
  unsetArtistPick: 'Unset as Artist Pick',
  visitArtistPage: 'Visit Artist Page',
  visitTrackPage: 'Visit Track Page'
}

type GetTrackMenuItemsOptions = {
  handle: string
  isArtistPick: boolean
  isDeleted: boolean
  isFavorited: boolean
  isOwner: boolean
  isReposted: boolean
  trackId: ID
  trackTitle: string
}

const asPopupMenuItems = <T, _>(et: { [K in keyof T]: PopupMenuItem }) => et

export const getTrackMenuItems = (
  {
    handle,
    isArtistPick,
    isDeleted,
    isFavorited,
    isOwner,
    isReposted,
    trackId,
    trackTitle
  }: GetTrackMenuItemsOptions,
  dispatch: ReturnType<typeof useDispatch>
) =>
  asPopupMenuItems({
    share: {
      text: itemLabels.share,
      onClick: () => {
        if (trackId) {
          dispatch(shareTrack(trackId, ShareSource.OVERFLOW))
        }
      },
      // TODO: sk - handle toasts w/ new menu
      // showToast: true,
      // toastText: messages.copiedToClipboard,
      condition: () => !isDeleted
    },
    repost: {
      text: isReposted ? itemLabels.undoRepost : itemLabels.repost,
      // Set timeout so the menu has time to close before we propagate the change.
      onClick: () =>
        setTimeout(() => {
          dispatch(
            (isReposted ? undoRepostTrack : repostTrack)(
              trackId,
              RepostSource.OVERFLOW
            )
          )
        }, 0),
      // showToast: true,
      // toastText: isReposted ? messages.unreposted : messages.reposted,
      condition: () => !isOwner && !isDeleted
    },
    favorite: {
      text: isFavorited ? itemLabels.unfavorite : itemLabels.favorite,
      // Set timeout so the menu has time to close before we propagate the change.
      onClick: () =>
        setTimeout(() => {
          dispatch(
            (isFavorited ? saveTrack : unsaveTrack)(
              trackId,
              FavoriteSource.OVERFLOW
            )
          )
        }, 0),
      condition: () => !isOwner && (!isDeleted || isFavorited)
    },
    addToPlaylist: {
      text: itemLabels.addToPlaylist,
      onClick: () => console.log('show modal here'),
      condition: () => !isDeleted
    },
    visitTrackPage: {
      text: itemLabels.visitTrackPage,
      onClick: () =>
        dispatch(pushRoute(trackPage(handle, trackTitle, trackId))),
      condition: () => !!trackId && !!trackTitle && !isDeleted
    },
    // TODO: Add back go to album when we have better album linking.
    // 'visitAlbumPage': {
    //   text: 'Visit Album Page',
    //   onClick: () => dispatch(goToRoute(albumPage(handle, albumName, albumId))),
    //   condition: () => albumId && albumName
    // }
    setArtistPick: {
      text: isArtistPick
        ? itemLabels.unsetArtistPick
        : itemLabels.setArtistPick,
      onClick: () =>
        dispatch(
          isArtistPick
            ? showSetAsArtistPickConfirmation()
            : showSetAsArtistPickConfirmation(trackId)
        ),
      condition: () => !!trackId && isOwner && !isDeleted
    },
    visitArtistPage: {
      text: itemLabels.visitArtistPage,
      onClick: () => dispatch(pushRoute(profilePage(handle))),
      condition: () => !!handle
    },
    edit: {
      text: itemLabels.edit,
      onClick: () => dispatch(editTrackModalActions.open(trackId)),
      condition: () => isOwner && !isDeleted
    },
    embed: {
      text: itemLabels.embed,
      onClick: () =>
        dispatch(embedModalActions.open(trackId, PlayableType.TRACK))
    }
  })
