import type { OutputChannel } from 'vscode'

export class Logger {
  private static outputChannel: OutputChannel

  static init(outputChannel: OutputChannel) {
    Logger.outputChannel = outputChannel
  }

  static log(message: string) {
    Logger.outputChannel.appendLine(message)
  }
}
