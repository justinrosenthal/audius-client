import { push as pushRoute } from 'connected-react-router'

import * as embedModalActions from 'containers/embed-modal/store/actions'
import { ID, PlayableType } from 'models/common/Identifiers'
import { useDispatch } from 'react-redux'
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
import { trackPage, profilePage } from 'utils/route'

import { asMenuItems } from './types'

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
    title
  }: GetTrackMenuItemsOptions,
  dispatch: ReturnType<typeof useDispatch>,
  toast: (text: string) => void
) =>
  asMenuItems({
    share: {
      text: messages.share,
      onClick: () => {
        if (id) {
          dispatch(shareTrack(id, ShareSource.OVERFLOW))
          toast(messages.copiedToClipboard)
        }
      },
      condition: () => !isDeleted
    },
    repost: {
      text: isReposted ? messages.undoRepost : messages.repost,
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
      condition: () => !isOwner && !isDeleted
    },
    favorite: {
      text: isFavorited ? messages.unfavorite : messages.favorite,
      // Set timeout so the menu has time to close before we propagate the change.
      onClick: () =>
        setTimeout(() => {
          dispatch(
            (isFavorited ? saveTrack : unsaveTrack)(id, FavoriteSource.OVERFLOW)
          )
        }, 0),
      condition: () => !isOwner && (!isDeleted || !!isFavorited)
    },
    addToPlaylist: {
      text: messages.addToPlaylist,
      onClick: () => console.log('show modal here'),
      condition: () => !isDeleted
    },
    visitTrackPage: {
      text: messages.visitTrackPage,
      onClick: () => dispatch(pushRoute(trackPage(handle, title, id))),
      condition: () => !!id && !!title && !isDeleted
    },
    // TODO: Add back go to album when we have better album linking.
    // 'visitAlbumPage': {
    //   text: 'Visit Album Page',
    //   onClick: () => dispatch(goToRoute(albumPage(handle, albumName, albumId))),
    //   condition: () => albumId && albumName
    // }
    setArtistPick: {
      text: isArtistPick ? messages.unsetArtistPick : messages.setArtistPick,
      onClick: () =>
        dispatch(
          isArtistPick
            ? showSetAsArtistPickConfirmation()
            : showSetAsArtistPickConfirmation(id)
        ),
      condition: () => !!id && !!isOwner && !isDeleted
    },
    visitArtistPage: {
      text: messages.visitArtistPage,
      onClick: () => dispatch(pushRoute(profilePage(handle))),
      condition: () => !!handle
    },
    edit: {
      text: messages.edit,
      onClick: () => dispatch(editTrackModalActions.open(id)),
      condition: () => !!isOwner && !isDeleted
    },
    embed: {
      text: messages.embed,
      onClick: () => dispatch(embedModalActions.open(id, PlayableType.TRACK)),
      condition: () => !!isPublic
    }
  })
