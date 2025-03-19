import { useEvent } from 'react-use'
import { memo, useCallback, useEffect, useState } from 'react'
import { VSCodeButton, VSCodeCheckbox, VSCodeLink, VSCodeTextArea } from '@vscode/webview-ui-toolkit/react'

import ApiOptions from './ApiOptions'
import { TabButton } from '../mcp/McpView'
import { vscode } from '../../utils/vscode'
import SettingsButton from '../common/SettingsButton'
import { validateApiConfiguration } from '../../utils/validate'
import { useExtensionState } from '../../context/ExtensionStateContext'
import { ExtensionMessage } from '../../../../src/shared/ExtensionMessage'

const { IS_DEV } = process.env

type SettingsViewProps = {
  onDone: () => void
}

const SettingsView = ({ onDone }: SettingsViewProps) => {
  const {
    apiConfiguration,
    version,
    customInstructions,
    setCustomInstructions,
    chatSettings,
    planActSeparateModelsSetting,
    setPlanActSeparateModelsSetting,
  } = useExtensionState()
  const [pendingTabChange, setPendingTabChange] = useState<'plan' | 'act' | null>(null)
  const [apiErrorMessage, setApiErrorMessage] = useState<string | undefined>(undefined)
  const [modelIdErrorMessage, setModelIdErrorMessage] = useState<string | undefined>(undefined)

  const handleSubmit = (withoutDone: boolean = false) => {
    const apiValidationResult = validateApiConfiguration(apiConfiguration)

    let apiConfigurationToSubmit = apiConfiguration
    if (!apiValidationResult) {
      // vscode.postMessage({ type: "apiConfiguration", apiConfiguration })
      // vscode.postMessage({
      // 	type: "customInstructions",
      // 	text: customInstructions,
      // })
      // vscode.postMessage({
      // 	type: "telemetrySetting",
      // 	text: telemetrySetting,
      // })
      // console.log("handleSubmit", withoutDone)
      // vscode.postMessage({
      // 	type: "separateModeSetting",
      // 	text: separateModeSetting,
      // })
    } else {
      // if the api configuration is invalid, we don't save it
      apiConfigurationToSubmit = undefined
    }

    vscode.postMessage({
      type: 'updateSettings',
      planActSeparateModelsSetting,
      customInstructionsSetting: customInstructions,
      // telemetrySetting,
      apiConfiguration: apiConfigurationToSubmit,
    })

    if (!withoutDone) {
      onDone()
    }
  }

  useEffect(() => {
    setApiErrorMessage(undefined)
    setModelIdErrorMessage(undefined)
  }, [apiConfiguration])

  // validate as soon as the component is mounted
  /*
    useEffect will use stale values of variables if they are not included in the dependency array.
    so trying to use useEffect with a dependency array of only one value for example will use any
    other variables' old values. In most cases you don't want this, and should opt to use react-use
    hooks.

        // uses someVar and anotherVar
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [someVar])
	If we only want to run code once on mount we can use react-use's useEffectOnce or useMount
    */

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      const message: ExtensionMessage = event.data
      switch (message.type) {
        case 'didUpdateSettings':
          if (pendingTabChange) {
            vscode.postMessage({
              type: 'togglePlanActMode',
              chatSettings: {
                mode: pendingTabChange,
              },
            })
            setPendingTabChange(null)
          }
          break
      }
    },
    [pendingTabChange]
  )

  useEvent('message', handleMessage)

  const handleResetState = () => {
    vscode.postMessage({ type: 'resetState' })
  }

  const handleTabChange = (tab: 'plan' | 'act') => {
    if (tab === chatSettings.mode) {
      return
    }
    setPendingTabChange(tab)
    handleSubmit(true)
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        padding: '10px 0px 0px 20px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '13px',
          paddingRight: 17,
        }}>
        <h3 style={{ color: 'var(--vscode-foreground)', margin: 0 }}>Settings</h3>
        <VSCodeButton onClick={() => handleSubmit(false)}>Done</VSCodeButton>
      </div>
      <div
        style={{
          flexGrow: 1,
          overflowY: 'scroll',
          paddingRight: 8,
          display: 'flex',
          flexDirection: 'column',
        }}>
        {/* Tabs container */}
        {planActSeparateModelsSetting ? (
          <div
            style={{
              border: '1px solid var(--vscode-panel-border)',
              borderRadius: '4px',
              padding: '10px',
              marginBottom: '20px',
              background: 'var(--vscode-panel-background)',
            }}>
            <div
              style={{
                display: 'flex',
                gap: '1px',
                marginBottom: '10px',
                marginTop: -8,
                borderBottom: '1px solid var(--vscode-panel-border)',
              }}>
              <TabButton isActive={chatSettings.mode === 'plan'} onClick={() => handleTabChange('plan')}>
                Plan Mode
              </TabButton>
              <TabButton isActive={chatSettings.mode === 'act'} onClick={() => handleTabChange('act')}>
                Act Mode
              </TabButton>
            </div>

            {/* Content container */}
            <div style={{ marginBottom: -12 }}>
              <ApiOptions
                key={chatSettings.mode}
                showModelOptions={true}
                apiErrorMessage={apiErrorMessage}
                modelIdErrorMessage={modelIdErrorMessage}
              />
            </div>
          </div>
        ) : (
          <ApiOptions
            key={'single'}
            showModelOptions={true}
            apiErrorMessage={apiErrorMessage}
            modelIdErrorMessage={modelIdErrorMessage}
          />
        )}

        <div style={{ marginBottom: 5 }}>
          <VSCodeTextArea
            value={customInstructions ?? ''}
            style={{ width: '100%' }}
            resize="vertical"
            rows={4}
            placeholder={'e.g. "Run unit tests at the end", "Use TypeScript with async/await", "Speak in Spanish"'}
            onInput={(e: any) => setCustomInstructions(e.target?.value ?? '')}>
            <span style={{ fontWeight: '500' }}>Custom Instructions</span>
          </VSCodeTextArea>
          <p
            style={{
              fontSize: '12px',
              marginTop: '5px',
              color: 'var(--vscode-descriptionForeground)',
            }}>
            These instructions are added to the end of the system prompt sent with every request.
          </p>
        </div>

        <div style={{ marginBottom: 5 }}>
          <VSCodeCheckbox
            style={{ marginBottom: '5px' }}
            checked={planActSeparateModelsSetting}
            onChange={(e: any) => {
              const checked = e.target.checked === true
              setPlanActSeparateModelsSetting(checked)
            }}>
            Use different models for Plan and Act modes
          </VSCodeCheckbox>
          <p
            style={{
              fontSize: '12px',
              marginTop: '5px',
              color: 'var(--vscode-descriptionForeground)',
            }}>
            Switching between Plan and Act mode will persist the API and model used in the previous mode. This may be helpful e.g.
            when using a strong reasoning model to architect a plan for a cheaper coding model to act on.
          </p>
        </div>

        {IS_DEV && (
          <>
            <div style={{ marginTop: '10px', marginBottom: '4px' }}>Debug</div>
            <VSCodeButton onClick={handleResetState} style={{ marginTop: '5px', width: 'auto' }}>
              Reset State
            </VSCodeButton>
            <p
              style={{
                fontSize: '12px',
                marginTop: '5px',
                color: 'var(--vscode-descriptionForeground)',
              }}>
              This will reset all global state and secret storage in the extension.
            </p>
          </>
        )}

        <div
          style={{
            marginTop: 'auto',
            paddingRight: 8,
            display: 'flex',
            justifyContent: 'center',
          }}>
          <SettingsButton
            onClick={() => vscode.postMessage({ type: 'openExtensionSettings' })}
            style={{
              margin: '0 0 16px 0',
            }}>
            <i className="codicon codicon-settings-gear" />
            Advanced Settings
          </SettingsButton>
        </div>
        <div
          style={{
            textAlign: 'center',
            color: 'var(--vscode-descriptionForeground)',
            fontSize: '12px',
            lineHeight: '1.2',
            padding: '0 8px 15px 0',
          }}>
          <p
            style={{
              wordWrap: 'break-word',
              margin: 0,
              padding: 0,
            }}>
            If you have any questions or feedback, feel free to open an issue at{' '}
            <VSCodeLink href="https://github.com/cline/cline" style={{ display: 'inline' }}>
              https://github.com/cline/cline
            </VSCodeLink>
          </p>
          <p
            style={{
              fontStyle: 'italic',
              margin: '10px 0 0 0',
              padding: 0,
            }}>
            v{version}
          </p>
        </div>
      </div>
    </div>
  )
}

export default memo(SettingsView)
