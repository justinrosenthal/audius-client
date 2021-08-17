import { push as pushRoute } from 'connected-react-router'
import { useDispatch } from 'react-redux'

import * as embedModalActions from 'containers/embed-modal/store/actions'
import { ID, PlayableType } from 'models/common/Identifiers'
import { FavoriteSource, RepostSource, ShareSource } from 'services/analytics'
import * as socialActions from 'store/social/collections/actions'
import { open as openEditCollectionModal } from 'store/application/ui/editPlaylistModal/slice'
import { albumPage, playlistPage, profilePage } from 'utils/route'

import { asConditionalMenuItems, CollectionVariant } from './types'

const messages = {
  addToPlaylist: 'Add to Playlist',
  copiedToClipboard: 'Copied To Clipboard!',
  edit: (label: string) => `Edit ${label}`,
  embed: 'Embed',
  favorite: (label: string) => `Favorite ${label}`,
  repost: 'Repost',
  reposted: 'Reposted!',
  share: 'Share',
  undoRepost: 'Undo Repost',
  unfavorite: (label: string) => `Unfavorite ${label}`,
  unreposted: 'Un-Reposted!',
  visitArtistPage: (label: string) => `Visit ${label} Page`,
  visitCollectionPage: (label: string) => `Visit ${label} Page`
}

export type GetCollectionMenuItemsOptions = {
  handle: string
  id: ID
  isArtist: boolean
  isFavorited: boolean
  isOwner: boolean
  isPublic: boolean
  isReposted: boolean
  onRepost?: () => void
  onShare?: () => void
  title: string
  variant: CollectionVariant
}

export const getCollectionMenuItems = (
  {
    handle,
    id,
    isArtist,
    isFavorited,
    isOwner,
    isPublic,
    isReposted,
    onRepost,
    onShare,
    title,
    variant
  }: GetCollectionMenuItemsOptions,
  dispatch: ReturnType<typeof useDispatch>,
  toast: (text: string) => void
) => {
  const routePage = variant === 'album' ? albumPage : playlistPage
  const variantLabel = variant === 'album' ? 'Album' : 'Playlist'

  return asConditionalMenuItems({
    edit: {
      condition: () => isOwner,
      item: {
        onClick: () => dispatch(openEditCollectionModal(id)),
        text: messages.edit(variantLabel)
      }
    },
    embed: {
      condition: () => isPublic,
      item: {
        onClick: () =>
          dispatch(
            embedModalActions.open(
              id,
              variant === 'album' ? PlayableType.ALBUM : PlayableType.PLAYLIST
            )
          ),
        text: messages.embed
      }
    },
    favorite: {
      condition: () => !isOwner,
      item: {
        text: messages[isFavorited ? 'unfavorite' : 'favorite'](variantLabel),
        onClick: () =>
          isFavorited
            ? socialActions.unsaveCollection(id, FavoriteSource.OVERFLOW)
            : socialActions.saveCollection(id, FavoriteSource.OVERFLOW)
      }
    },
    repost: {
      condition: () => !isOwner,
      item: {
        text: isReposted ? messages.undoRepost : messages.repost,
        onClick: () => {
          if (isReposted) {
            socialActions.undoRepostCollection(id, RepostSource.OVERFLOW)
          } else {
            socialActions.repostCollection(id, RepostSource.OVERFLOW)
            if (onRepost) onRepost()
          }
        }
      }
    },
    share: {
      item: {
        text: messages.share,
        onClick: () => {
          dispatch(socialActions.shareCollection(id, ShareSource.OVERFLOW))
          if (onShare) onShare()
        }
      }
    },
    visitArtistPage: {
      item: {
        onClick: () => dispatch(pushRoute(profilePage(handle))),
        text: messages.visitArtistPage(isArtist ? 'Artist' : 'User')
      }
    },
    visitCollectionPage: {
      item: {
        onClick: () => dispatch(pushRoute(routePage(handle, title, id))),
        text: messages.visitCollectionPage(variantLabel)
      }
    }
  })
}
