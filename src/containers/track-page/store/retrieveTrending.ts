import { call, put, select } from 'redux-saga/effects'

import { ID } from 'common/models/Identifiers'
import TimeRange from 'common/models/TimeRange'
import { Track, UserTrackMetadata } from 'common/models/Track'
import { StringKeys } from 'common/services/remote-config'
import { getTracks } from 'common/store/cache/tracks/selectors'
import { processAndCacheTracks } from 'common/store/cache/tracks/utils'
import { Nullable } from 'common/utils/typeUtils'
import { setLastFetchedTrendingGenre } from 'containers/trending-page/store/actions'
import { getTrendingEntries } from 'containers/trending-page/store/lineups/trending/selectors'
import {
  getLastFetchedTrendingGenre,
  getTrendingGenre
} from 'containers/trending-page/store/selectors'
import apiClient from 'services/audius-api-client/AudiusAPIClient'
import { remoteConfigInstance } from 'services/remote-config/remote-config-instance'
import { AppState } from 'store/types'

type RetrieveTrendingArgs = {
  timeRange: TimeRange
  genre: Nullable<string>
  offset: number
  limit: number
  currentUserId: Nullable<ID>
}

export function* retrieveTrending({
  timeRange,
  genre,
  offset,
  limit,
  currentUserId
}: RetrieveTrendingArgs): Generator<any, Track[], any> {
  yield call(remoteConfigInstance.waitForRemoteConfig)
  const TF = new Set(
    remoteConfigInstance.getRemoteVar(StringKeys.TF)?.split(',') ?? []
  )

  const cachedTracks: ReturnType<ReturnType<
    typeof getTrendingEntries
  >> = yield select(getTrendingEntries(timeRange))

  const lastGenre = yield select(getLastFetchedTrendingGenre)
  yield put(setLastFetchedTrendingGenre(genre))

  const useCached = lastGenre === genre && cachedTracks.length > offset + limit

  if (useCached) {
    const trackIds = cachedTracks.slice(offset, limit + offset).map(t => t.id)
    const tracksMap: ReturnType<typeof getTracks> = yield select(
      (state: AppState) => getTracks(state, { ids: trackIds })
    )
    const tracks = trackIds.map(id => tracksMap[id])
    return tracks
  }

  let apiTracks: UserTrackMetadata[] = yield apiClient.getTrending({
    genre,
    offset,
    limit,
    currentUserId,
    timeRange
  })
  if (TF.size > 0) {
    apiTracks = apiTracks.filter(t => {
      const shaId = window.Web3.utils.sha3(t.track_id.toString())
      return !TF.has(shaId)
    })
  }

  const currentGenre = yield select(getTrendingGenre)

  // If we changed genres, do nothing
  if (currentGenre !== genre) return []

  const processed: Track[] = yield processAndCacheTracks(apiTracks)
  return processed
}
