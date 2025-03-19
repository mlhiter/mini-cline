import { useEvent } from 'react-use'
import { useCallback, useState } from 'react'

import ChatView from './components/chat/ChatView'
import WelcomeView from './components/welcome/WelcomeView'
import HistoryView from './components/history/HistoryView'
import SettingsView from './components/settings/SettingsView'
import { ExtensionMessage } from '../../src/shared/ExtensionMessage'
import { ExtensionStateContextProvider, useExtensionState } from './context/ExtensionStateContext'

const AppContent = () => {
  const { didHydrateState, showWelcome, shouldShowAnnouncement, vscMachineId } = useExtensionState()
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showMcp, setShowMcp] = useState(false)
  const [showAccount, setShowAccount] = useState(false)
  const [showAnnouncement, setShowAnnouncement] = useState(false)

  const handleMessage = useCallback((e: MessageEvent) => {
    const message: ExtensionMessage = e.data
    switch (message.type) {
      case 'action':
        switch (message.action!) {
          case 'settingsButtonClicked':
            setShowSettings(true)
            setShowHistory(false)
            setShowMcp(false)
            setShowAccount(false)
            break
          case 'historyButtonClicked':
            setShowSettings(false)
            setShowHistory(true)
            setShowMcp(false)
            setShowAccount(false)
            break
          case 'mcpButtonClicked':
            setShowSettings(false)
            setShowHistory(false)
            setShowMcp(true)
            setShowAccount(false)
            break
          case 'accountLoginClicked':
            setShowSettings(false)
            setShowHistory(false)
            setShowMcp(false)
            setShowAccount(true)
            break
          case 'chatButtonClicked':
            setShowSettings(false)
            setShowHistory(false)
            setShowMcp(false)
            setShowAccount(false)
            break
        }
        break
    }
  }, [])

  useEvent('message', handleMessage)

  // useEffect(() => {
  //   if (shouldShowAnnouncement) {
  //     setShowAnnouncement(true)
  //     vscode.postMessage({ type: 'didShowAnnouncement' })
  //   }
  // }, [shouldShowAnnouncement])

  // if (!didHydrateState) {
  //   return null
  // }

  return (
    <>
      {showWelcome ? (
        <WelcomeView />
      ) : (
        <>
          {showSettings && <SettingsView onDone={() => setShowSettings(false)} />}
          {showHistory && <HistoryView onDone={() => setShowHistory(false)} />}
          {/* {showMcp && <McpView onDone={() => setShowMcp(false)} />} */}
          {/* {showAccount && <AccountView onDone={() => setShowAccount(false)} />} */}
          {/* Do not conditionally load ChatView, it's expensive and there's state we don't want to lose (user input, disableInput, askResponse promise, etc.) */}
          <ChatView
            showHistoryView={() => {
              setShowSettings(false)
              setShowMcp(false)
              setShowHistory(true)
            }}
            isHidden={showSettings || showHistory || showMcp || showAccount}
            showAnnouncement={showAnnouncement}
            hideAnnouncement={() => {
              setShowAnnouncement(false)
            }}
          />
        </>
      )}
    </>
  )
}

const App = () => {
  return (
    <ExtensionStateContextProvider>
      <AppContent />
    </ExtensionStateContextProvider>
  )
}

export default App
