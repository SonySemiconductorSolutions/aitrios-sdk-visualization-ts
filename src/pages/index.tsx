/*
 * Copyright 2022, 2023 Sony Semiconductor Solutions Corp. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import LoadingDialog from '../components/common/dialog/loading'
import Layout from '../components/common/layout'
import SettingMenu from '../components/common/menu/settingmenu'
import DropDownList from '../components/common/dropdownlist'
import DefaultButton from '../components/common/button/defaultbutton'
import ReloadSVG from '../components/common/button/defaultbutton/reload-svg'
import ObjectiveDetection from '../components/tabs/aiTask/objectdetection'
import History from '../components/tabs/mode/history'
import Realtime from '../components/tabs/mode/realtime'
import useInterval from '../hooks/useInterval'
import { BoundingBoxProps, ClsInferenceProps, SegInferenceProps, PollingData, PollingHandlerProps, setDataProps, pollingHandler, setData, ErrorData, handleResponseErr, SegmentationLabelType, DeviceListData } from '../hooks/util'
import styles from '../styles/main-page.module.scss'
import dynamic from 'next/dynamic'

export const REALTIME_MODE = 'realtimeMode'
export const HISTORY_MODE = 'historyMode'
export const OBJECT_DETECTION = 'objectDetection'
export const CLASSIFICATION = 'classification'
export const SEGMENTATION = 'segmentation'

const Classification = dynamic(() => import('../components/tabs/aiTask/classification'), { ssr: false })
const Segmentation = dynamic(() => import('../components/tabs/aiTask/segmentation'), { ssr: false })

function Home () {
  const [aiTask, setAiTask] = useState<string>(OBJECT_DETECTION)
  const [mode, setMode] = useState<string>(REALTIME_MODE)
  const [timestamp, setTimestamp] = useState<string>('')
  const [image, setImage] = useState<string>('')
  const [imageCls, setImageCls] = useState<string>('')
  const [imageSEG, setImageSEG] = useState<string>('')
  const [inferencesOD, setInferencesOD] = useState<BoundingBoxProps[] | undefined>(undefined)
  const [inferencesCls, setInferencesCls] = useState<ClsInferenceProps[] | undefined>(undefined)
  const [inferencesSEG, setInferencesSEG] = useState<SegInferenceProps | undefined>(undefined)

  const [inferenceRawData, setInferencesRawData] = useState<string | undefined>(undefined)
  const [labelDataOD, setLabelDataOD] = useState<string[]>(['id0', 'id1', 'id2', 'id3', 'id4'])
  const [labelDataCLS, setLabelDataCLS] = useState<string[]>(['id0', 'id1', 'id2', 'id3', 'id4'])
  const [labelDataSEG, setLabelDataSEG] = useState<SegmentationLabelType[]>([
    { isVisible: true, label: 'label1', color: '#000000' },
    { isVisible: false, label: 'label2', color: '#0000ff' },
    { isVisible: true, label: 'label3', color: '#ff0000' }
  ])
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [probability, setProbability] = useState<number>(0)
  const [isDisplayTs, setIsDisplayTs] = useState<boolean>(true)
  const [displayScore, setDisplayScore] = useState<number>(5)
  const [isOverlayIR, setIsOverlayIR] = useState<boolean>(true)
  const [overlayIRC, setOverlayIRC] = useState<string>('#FFFFFF')
  const [intervalTimeValue, setIntervalTimeValue] = useState<number>(10)
  const [deviceId, setDeviceId] = useState<string>('')
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [imagePath, setImagePath] = useState<string>('')
  const [imageCount, setImageCount] = useState<number>(0)
  const [totalCount, setTotalCount] = useState<number>(1)
  const [loadingDialogFlg, setLoadingDialogFlg] = useState<boolean>(false)
  const [deviceIdList, setDeviceIdList] = useState<DeviceListData>({})
  const [isFirst, setIsFirst] = useState<boolean>(true)
  const [displayCount, setDisplayCount] = useState<number>(-1)
  const [pollingData, setPollingData] = useState<PollingData | undefined>(undefined)
  const [abortContoroller, setAbortContoroller] = useState<AbortController>(new AbortController())

  const [transparency, setTransparency] = useState<number>(50)

  const pollingHandlerProps: PollingHandlerProps = {
    deviceId,
    imagePath,
    aiTask,
    mode,
    imageCount,
    totalCount,
    isFirst,
    setImageCount,
    setIsFirst,
    setLoadingDialogFlg,
    setIsPlaying
  }

  const setDataProps: setDataProps = {
    pollingData,
    aiTask,
    imageCount,
    totalCount,
    setImage,
    setImageCls,
    setImageSEG,
    setTimestamp,
    setImageCount,
    setIsFirst,
    setInferencesRawData,
    setInferencesOD,
    setInferencesCls,
    setInferencesSEG,
    setLoadingDialogFlg
  }

  useInterval(async () => {
    setAbortContoroller(new AbortController())
  }, isPlaying ? intervalTimeValue * 1000 : null)

  useEffect(() => {
    if (isPlaying) {
      setData(setDataProps)
    }
  }, [pollingData])

  useEffect(() => {
    (async () => {
      if (isPlaying) {
        const pollingData = await pollingHandler(pollingHandlerProps, intervalTimeValue, abortContoroller)
        setPollingData(pollingData)
      }
    })()
  }, [abortContoroller])

  useEffect(() => {
    (async () => {
      if (isPlaying) {
        setAbortContoroller(new AbortController())
      } else {
        abortContoroller.abort('STOP')
        setLoadingDialogFlg(false)
      }
    })()
  }, [isPlaying])

  return (
    <>
      <LoadingDialog display={loadingDialogFlg} />
      <Layout title="edge AI device Visualization">
        <div className={styles['main-page-container']}>
          <div className={styles['main-page-stage']}>
            <Tabs isFitted className={styles['aitask-tabs']} onChange={(taskNum: number) => {
              if (taskNum === 0) {
                setAiTask(OBJECT_DETECTION)
              } else if (taskNum === 1) {
                setAiTask(CLASSIFICATION)
              } else if (taskNum === 2) {
                setAiTask(SEGMENTATION)
              }
            }}>
              <TabList className={styles['aitask-tablist']}>
                <Tab isDisabled={isPlaying || isUploading}>Object Detection</Tab>
                <Tab isDisabled={isPlaying || isUploading}>Classification</Tab>
                <Tab isDisabled={isPlaying || isUploading}>Segmentation</Tab>
              </TabList>
              <div className={styles['display-setting-button']}>
                {aiTask === OBJECT_DETECTION
                  ? <SettingMenu
                    aiTask={aiTask}
                    mode={mode}
                    probability={probability}
                    setProbability={setProbability}
                    isDisplayTs={isDisplayTs}
                    setIsDisplayTs={setIsDisplayTs}
                  />
                  : null
                }
                {aiTask === CLASSIFICATION
                  ? <SettingMenu
                    aiTask={aiTask}
                    mode={mode}
                    probability={probability}
                    setProbability={setProbability}
                    isDisplayTs={isDisplayTs}
                    setIsDisplayTs={setIsDisplayTs}
                    displayScore={displayScore}
                    setDisplayScore={setDisplayScore}
                    isOverlayIR={isOverlayIR}
                    setIsOverlayIR={setIsOverlayIR}
                    overlayIRC={overlayIRC}
                    setOverlayIRC={setOverlayIRC}
                  />
                  : null
                }
                {aiTask === SEGMENTATION
                  ? <SettingMenu
                    aiTask={aiTask}
                    mode={mode}
                    probability={probability}
                    setProbability={setProbability}
                    isDisplayTs={isDisplayTs}
                    setIsDisplayTs={setIsDisplayTs}
                    displayScore={displayScore}
                    setDisplayScore={setDisplayScore}
                    isOverlayIR={isOverlayIR}
                    setIsOverlayIR={setIsOverlayIR}
                    overlayIRC={overlayIRC}
                    setOverlayIRC={setOverlayIRC}
                    transparency={transparency}
                    setTransparency={setTransparency}
                  />
                  : null
                }
              </div>
              <TabPanels>
                <TabPanel className={styles['aitask-tab-panel']}>
                  <ObjectiveDetection
                    aiTask={aiTask}
                    timestamp={timestamp}
                    image={image}
                    inferences={inferencesOD}
                    inferenceRawData={inferenceRawData}
                    labelData={labelDataOD}
                    setLabelData={setLabelDataOD}
                    probability={probability}
                    isDisplayTs={isDisplayTs}
                    imageCount={imageCount}
                    setDisplayCount={setDisplayCount}
                    setLoadingDialogFlg={setLoadingDialogFlg}
                  />
                </TabPanel>
                <TabPanel className={styles['aitask-tab-panel']}>
                  <Classification
                    aiTask={aiTask}
                    timestamp={timestamp}
                    image={imageCls}
                    inferences={inferencesCls}
                    inferenceRawData={inferenceRawData}
                    labelData={labelDataCLS}
                    setLabelData={setLabelDataCLS}
                    probability={probability}
                    isDisplayTs={isDisplayTs}
                    displayScore={displayScore}
                    isOverlayIR={isOverlayIR}
                    overlayIRC={overlayIRC}
                    imageCount={imageCount}
                    setDisplayCount={setDisplayCount}
                    setLoadingDialogFlg={setLoadingDialogFlg}
                    isFirst={isFirst}
                    setIsFirst={setIsFirst}
                  />
                </TabPanel>
                <TabPanel className={styles['aitask-tab-panel']}>
                  <Segmentation
                    aiTask={aiTask}
                    timestamp={timestamp}
                    inferenceRawData={inferenceRawData}
                    image={imageSEG}
                    inferences={inferencesSEG}
                    transparency={transparency}
                    isDisplayTs={isDisplayTs}
                    labelDataSEG={labelDataSEG}
                    setLabelDataSEG={setLabelDataSEG}
                    imageCount={imageCount}
                    setDisplayCount={setDisplayCount}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
            <Tabs isFitted className={styles['mode-tabs']} onChange={(tabNum: number) => {
              switch (tabNum) {
                case 0:
                  setMode(REALTIME_MODE)
                  break
                case 1:
                  setMode(HISTORY_MODE)
                  break
              }
            }}>
              <TabList className={styles['mode-tablist']}>
                <Tab isDisabled={isPlaying || isUploading}>Realtime Mode</Tab>
                <Tab isDisabled={isPlaying || isUploading}>History Mode</Tab>
              </TabList>
              <div className={styles['deviceid-area']}>
                Device Name
                <DropDownList
                    id={'device-id-list'}
                    name={deviceId} className={isPlaying || isUploading ? styles.disabled : styles.select}
                    list={Object.keys(deviceIdList)}
                    onChange={(event) => { setDeviceId(deviceIdList[event.target.value]) }}
                    disabled={mode === REALTIME_MODE
                      ? (isUploading)
                      : (isPlaying)
                    }
                    defaultSpace={true}
                />
                <DefaultButton isLoading={false}
                  icon={<ReloadSVG />}
                  text={'Reload'}
                  disabled={mode === REALTIME_MODE
                    ? (isUploading)
                    : (isPlaying)
                  }
                  action={async () => {
                    setDeviceId('')
                    setDeviceIdList({})
                    setLoadingDialogFlg(true)
                    const res = await fetch('/api/deviceInfo/deviceInfo', { method: 'GET' })
                    setLoadingDialogFlg(false)
                    if (res.status === 200) {
                      await res.json().then((data) => {
                        if (Object.keys(data).length === 0) {
                          return window.alert('Connected device not found.')
                        }
                        setDeviceIdList(data)
                      })
                    } else {
                      const errorMessage: ErrorData = await res.json()
                      handleResponseErr(errorMessage)
                    }
                  }
                }
                />
              </div>
              <TabPanels>
                <TabPanel className={styles['realtime-mode-block']}>
                  <Realtime
                    deviceId={deviceId}
                    subDirectory={imagePath}
                    setDeviceId={setDeviceId}
                    deviceIdList={deviceIdList}
                    setDeviceIdList={setDeviceIdList}
                    isPlaying={isPlaying}
                    mode={mode}
                    intervalTimeValue={intervalTimeValue}
                    isLoading={isLoading}
                    setIsPlaying={setIsPlaying}
                    setImagePath={setImagePath}
                    isUploading={isUploading}
                    setIsUploading={setIsUploading}
                    setIsLoading={setIsLoading}
                    setIntervalTimeValue={setIntervalTimeValue}
                    setLoadingDialogFlg={setLoadingDialogFlg}
                  />
                </TabPanel>
                <TabPanel className={styles['history-mode-block']}>
                  <History
                    deviceId={deviceId}
                    setDeviceId={setDeviceId}
                    deviceIdList={deviceIdList}
                    setDeviceIdList={setDeviceIdList}
                    isPlaying={isPlaying}
                    mode={mode}
                    intervalTimeValue={intervalTimeValue}
                    subDirectory={imagePath}
                    imageCount={imageCount}
                    totalCount={totalCount}
                    isFirst={isFirst}
                    setIsPlaying={setIsPlaying}
                    setSubDirectory={setImagePath}
                    setImageCount={setImageCount}
                    setTotalCount={setTotalCount}
                    setIntervalTimeValue={setIntervalTimeValue}
                    setLoadingDialogFlg={setLoadingDialogFlg}
                    setIsFirst={setIsFirst}
                    displayCount={displayCount}
                    setDisplayCount={setDisplayCount}
                    aiTask={aiTask}
                    labelDataOD={labelDataOD}
                    labelDataCLS={labelDataCLS}
                    labelDataSEG={labelDataSEG}
                    isDisplayTs={isDisplayTs}
                    probability={probability}
                    isOverlayIR={isOverlayIR}
                    overlayIRC={overlayIRC}
                    transparency={transparency}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </div>
        </div>
      </Layout >
    </>
  )
}

export default Home
