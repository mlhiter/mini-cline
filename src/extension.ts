import * as vscode from 'vscode'

import { Logger } from './common/logger'

let outputChannel: vscode.OutputChannel

export async function activate(context: vscode.ExtensionContext) {
  // Logger
  outputChannel = vscode.window.createOutputChannel('Devbox')
  context.subscriptions.push(outputChannel)

  Logger.init(outputChannel)
  Logger.log('Devbox extension activated')

  // Devbox AI Sidebar
  const sidebarProvider = new MiniClineProvider(context)

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(MiniClineProvider.sideBarId, sidebarProvider, {
      webviewOptions: { retainContextWhenHidden: true },
    })
  )

  // Click this button to start a new chat
  context.subscriptions.push(
    vscode.commands.registerCommand('mini-cline.plusButtonClicked', async () => {
      Logger.log('Plus button Clicked')
      await sidebarProvider.clearTask()
      await sidebarProvider.postStateToWebview()
      await sidebarProvider.postMessageToWebview({
        type: 'action',
        action: 'chatButtonClicked',
      })
    })
  )

  // Click this button to open AI settings
  context.subscriptions.push(
    vscode.commands.registerCommand('devbox.settingsButtonClicked', () => {
      //vscode.window.showInformationMessage(message)
      sidebarProvider.postMessageToWebview({
        type: 'action',
        action: 'settingsButtonClicked',
      })
    })
  )
  console.log('Your extension "mini-cline" is now active!')
}

export function deactivate() {}
