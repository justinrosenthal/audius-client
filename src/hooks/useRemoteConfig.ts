import { createUseFeatureFlagHook } from 'common/hooks/useFeatureFlag'
import { createUseRemoteVarHook } from 'common/hooks/useRemoteVar'
import { FeatureFlags } from 'common/services/remote-config'
import { remoteConfigInstance } from 'services/remote-config/remote-config-instance'

export const useFlag = createUseFeatureFlagHook(remoteConfigInstance)
export const useRemoteVar = createUseRemoteVarHook(remoteConfigInstance)

export const useArePlaylistUpdatesEnabled = () => {
  return useFlag(FeatureFlags.PLAYLIST_UPDATES_ENABLED)
}
