import { BNWei } from 'common/models/Wallet'
import { CommonState } from 'common/store'
import { Nullable } from 'common/utils/typeUtils'
import { stringWeiToBN } from 'common/utils/wallet'

export const getSendData = (
  state: CommonState
): Nullable<{ recipientWallet: string; amount: BNWei }> => {
  const modalState = state.pages.tokenDashboard.modalState
  if (
    !(
      modalState?.stage === 'SEND' &&
      (modalState.flowState.stage === 'CONFIRMED_SEND' ||
        modalState.flowState.stage === 'SENDING' ||
        modalState.flowState.stage === 'AWAITING_CONFIRMATION')
    )
  )
    return null
  const { recipientWallet, amount } = modalState.flowState
  return { recipientWallet, amount: stringWeiToBN(amount) }
}

export const getModalState = (state: CommonState) =>
  state.pages.tokenDashboard.modalState
export const getModalVisible = (state: CommonState) =>
  state.pages.tokenDashboard.modalVisible
export const getDiscordCode = (state: CommonState) =>
  state.pages.tokenDashboard.discordCode ?? ''
export const getAssociatedWallets = (state: CommonState) =>
  state.pages.tokenDashboard.associatedWallets
export const getHasAssociatedWallets = (state: CommonState) => {
  const {
    connectedEthWallets: ethWallets,
    connectedSolWallets: solWallets
  } = state.pages.tokenDashboard.associatedWallets
  return (ethWallets?.length ?? 0) + (solWallets?.length ?? 0) > 0
}
export const getRemoveWallet = (state: CommonState) =>
  state.pages.tokenDashboard.associatedWallets.removeWallet
