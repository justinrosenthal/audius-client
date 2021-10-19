import React, { useEffect, useCallback } from 'react'

import { push as pushRoute } from 'connected-react-router'
import { connect } from 'react-redux'
import { useParams } from 'react-router'
import { Dispatch } from 'redux'

import { ID } from 'common/models/Identifiers'
import { LineupVariant } from 'containers/lineup/types'
import { makeGetLineupMetadatas } from 'store/lineup/selectors'
import { getPlaying, getBuffering } from 'store/player/selectors'
import { makeGetCurrent } from 'store/queue/selectors'
import { AppState } from 'store/types'
import { profilePage } from 'utils/route'

import { RemixesPageProps as DesktopRemixesPageProps } from './components/desktop/RemixesPage'
import { RemixesPageProps as MobileRemixesPageProps } from './components/mobile/RemixesPage'
import { tracksActions } from './store/lineups/tracks/actions'
import { getTrack, getUser, getLineup, getCount } from './store/selectors'
import { fetchTrack, reset } from './store/slice'

const messages = {
  title: 'Remixes',
  description: 'Remixes'
}

type OwnProps = {
  containerRef: React.RefObject<HTMLDivElement>
  children:
    | React.ComponentType<DesktopRemixesPageProps>
    | React.ComponentType<MobileRemixesPageProps>
}

type mapStateProps = ReturnType<typeof makeMapStateToProps>
type RemixesPageProviderProps = OwnProps &
  ReturnType<mapStateProps> &
  ReturnType<typeof mapDispatchToProps>

const RemixesPageProvider = ({
  containerRef,
  children: Children,
  count,
  originalTrack,
  user,
  tracks,
  fetchTrack,
  currentQueueItem,
  isPlaying,
  isBuffering,
  pause,
  play,
  loadMore,
  goToRoute,
  reset,
  resetTracks
}: RemixesPageProviderProps) => {
  const { handle, slug } = useParams<{ handle: string; slug: string }>()
  useEffect(() => {
    fetchTrack(handle, slug)
  }, [handle, slug, fetchTrack])

  useEffect(() => {
    return function cleanup() {
      reset()
      resetTracks()
    }
  }, [reset, resetTracks])

  const goToTrackPage = useCallback(() => {
    if (user && originalTrack) {
      goToRoute(originalTrack.permalink)
    }
  }, [goToRoute, originalTrack, user])

  const goToArtistPage = useCallback(() => {
    if (user) {
      goToRoute(profilePage(user?.handle))
    }
  }, [goToRoute, user])

  const getLineupProps = () => {
    return {
      selfLoad: true,
      variant: LineupVariant.MAIN,
      containerRef,
      lineup: tracks,
      playingUid: currentQueueItem.uid,
      playingSource: currentQueueItem.source,
      playingTrackId: currentQueueItem.track && currentQueueItem.track.track_id,
      playing: isPlaying,
      buffering: isBuffering,
      pauseTrack: pause,
      playTrack: play,
      actions: tracksActions,
      scrollParent: containerRef as any,
      loadMore: (offset: number, limit: number) => {
        loadMore(offset, limit, { trackId: originalTrack?.track_id ?? null })
      }
    }
  }

  const childProps = {
    title: messages.title,
    count,
    originalTrack,
    user,
    goToTrackPage,
    goToArtistPage,
    getLineupProps
  }

  return <Children {...childProps} />
}

function makeMapStateToProps() {
  const getRemixesTracksLineup = makeGetLineupMetadatas(getLineup)
  const getCurrentQueueItem = makeGetCurrent()

  const mapStateToProps = (state: AppState) => {
    return {
      user: getUser(state),
      originalTrack: getTrack(state),
      count: getCount(state),
      tracks: getRemixesTracksLineup(state),
      currentQueueItem: getCurrentQueueItem(state),
      isPlaying: getPlaying(state),
      isBuffering: getBuffering(state)
    }
  }
  return mapStateToProps
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    goToRoute: (route: string) => dispatch(pushRoute(route)),
    fetchTrack: (handle: string, slug: string) =>
      dispatch(fetchTrack({ handle, slug })),
    loadMore: (
      offset: number,
      limit: number,
      payload: { trackId: ID | null }
    ) =>
      dispatch(
        tracksActions.fetchLineupMetadatas(offset, limit, false, payload)
      ),
    pause: () => dispatch(tracksActions.pause()),
    play: (uid?: string) => dispatch(tracksActions.play(uid)),
    reset: () => dispatch(reset()),
    resetTracks: () => dispatch(tracksActions.reset())
  }
}

export default connect(
  makeMapStateToProps,
  mapDispatchToProps
)(RemixesPageProvider)
