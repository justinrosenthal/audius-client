import { NativeMobileMessage } from './helpers'
import { MessageType } from './types'

export class DownloadTrackMessage extends NativeMobileMessage {
  constructor(downloadProps: { title: string; urls: string }) {
    super(MessageType.DOWNLOAD_TRACK, { ...downloadProps, saveToFiles: true })
  }
}
