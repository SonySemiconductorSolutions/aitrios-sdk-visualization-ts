/*
 * Copyright 2023 Sony Semiconductor Solutions Corp. All rights reserved.
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

import { Button, Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay, Progress, useDisclosure, Spinner } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import styles from './savedialog.module.scss'
import { writeZip, SaveDialogProps, handleResponseErr, ErrorData } from '../../../../hooks/util'
import { CLASSIFICATION, OBJECT_DETECTION, SEGMENTATION } from '../../../../common/constants'

const buttonStyle = {
  bg: '#dcdcdc',
  _hover: { bg: '#dcdcdc' },
  mr: 3
}

async function sleep (ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default function SaveDialog (props: SaveDialogProps) {
  const { isOpen, onOpen } = useDisclosure()
  const [progressRate, setprogressRate] = useState<number>(0)
  const [isCancel, setIsCancel] = useState<boolean>(false)
  const [isdisplay, setIsDisplay] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')

  const onCancel = () => {
    setIsCancel(true)
    setIsDisplay(true)
  }

  useEffect(() => {
    (async () => {
      try {
        if (props.saveDataCategory === 'Original Image') {
          setMessage('Saving Original Image')
        } else if (props.saveDataCategory === 'Overlaid Image') {
          setMessage('Saving Overlaid Image')
        }
        onOpen()
        setIsCancel(false)
        setprogressRate(0)
        const body = {
          subDirectory: props.subDirectory
        }
        const resIni = await fetch(`/api/initializeDirectory/${props.deviceId}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body)
        })
        if (resIni.status !== 200) {
          const errorMessage: ErrorData = await resIni.json()
          handleResponseErr(errorMessage)
          props.setFs(undefined)
        } else {
          setprogressRate(20)
        }
      } catch (e) {
        console.error(e)
        handleResponseErr({ message: 'An error has occurred.' })
        props.setFs(undefined)
      }
    })()
  }, [])

  useEffect(() => {
    (async () => {
      if (!isCancel) {
        if (props.saveDataCategory === 'Original Image') {
          saveOriginalImage()
        } else if (props.saveDataCategory === 'Overlaid Image') {
          saveOverlaidImageData()
        }
      } else {
        props.setFs(undefined)
        setIsDisplay(false)
      }
    })()
  }, [progressRate])

  async function saveOriginalImage () {
    try {
      if (progressRate === 20) {
        const body = {
          subDirectory: props.subDirectory,
          startIndex: props.startIndex,
          endIndex: props.endIndex
        }
        const resImage = await fetch(`/api/saveImage/${props.deviceId}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body)
        })
        if (resImage.status !== 200) {
          const errorMessage: ErrorData = await resImage.json()
          handleResponseErr(errorMessage)
          props.setFs(undefined)
        } else {
          setprogressRate(50)
        }
      } else if (progressRate === 50) {
        const body = {
          subDirectory: props.subDirectory,
          aiTask: props.aiTask
        }
        const resIns = await fetch(`/api/saveInferences/${props.deviceId}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body)
        })
        if (resIns.status !== 200) {
          const errorMessage: ErrorData = await resIns.json()
          handleResponseErr(errorMessage)
          props.setFs(undefined)
        } else {
          setprogressRate(80)
        }
      } else if (progressRate === 80) {
        writeZip(props).then(result => {
          if (!result) {
            props.setFs(undefined)
          } else {
            setprogressRate(100)
          }
        })
      } else if (progressRate === 100) {
        await sleep(1000)
        props.setFs(undefined)
      }
    } catch (e) {
      console.error(e)
      handleResponseErr({ message: 'An error has occurred.' })
      props.setFs(undefined)
    }
  }

  async function saveOverlaidImageData () {
    try {
      if (progressRate === 20) {
        const body = {
          subDirectory: props.subDirectory,
          startIndex: props.startIndex,
          endIndex: props.endIndex
        }
        const resImage = await fetch(`/api/saveImage/${props.deviceId}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body)
        })
        if (resImage.status !== 200) {
          const errorMessage: ErrorData = await resImage.json()
          handleResponseErr(errorMessage)
          props.setFs(undefined)
        } else {
          setprogressRate(50)
        }
      } else if (progressRate === 50) {
        const body = {
          subDirectory: props.subDirectory,
          aiTask: props.aiTask
        }
        const resIns = await fetch(`/api/saveInferences/${props.deviceId}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body)
        })
        if (resIns.status !== 200) {
          const errorMessage: ErrorData = await resIns.json()
          handleResponseErr(errorMessage)
          props.setFs(undefined)
        } else {
          setprogressRate(60)
        }
      } else if (progressRate === 60) {
        let body
        if (props.aiTask === OBJECT_DETECTION) {
          body = {
            subDirectory: props.subDirectory,
            aiTask: props.aiTask,
            isDisplayTs: props.isDisplayTs,
            labelData: props.labelDataOD,
            probability: props.probability
          }
        } else if (props.aiTask === CLASSIFICATION) {
          body = {
            subDirectory: props.subDirectory,
            aiTask: props.aiTask,
            isDisplayTs: props.isDisplayTs,
            labelData: props.labelDataCLS,
            probability: props.probability,
            isOverlayIR: props.isOverlayIR,
            isOverlayIRC: props.overlayIRC
          }
        } else if (props.aiTask === SEGMENTATION) {
          body = {
            subDirectory: props.subDirectory,
            aiTask: props.aiTask,
            isDisplayTs: props.isDisplayTs,
            labelListData: props.labelDataSEG,
            transparency: props.transparency
          }
        }

        const resIns = await fetch(`/api/createOverlaidImage/${props.deviceId}`,
          {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body)
          })
        if (resIns.status !== 200) {
          const errorMessage: ErrorData = await resIns.json()
          handleResponseErr(errorMessage)
          props.setFs(undefined)
        } else {
          setprogressRate(80)
        }
      } else if (progressRate === 80) {
        writeZip(props).then(result => {
          if (!result) {
            props.setFs(undefined)
          } else {
            setprogressRate(100)
          }
        })
      } else if (progressRate === 100) {
        await sleep(1000)
        props.setFs(undefined)
      }
    } catch (e) {
      console.error(e)
      handleResponseErr({ message: 'An error has occurred.' })
      props.setFs(undefined)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={() => {}} size={'xs'}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader />
        <ModalBody>
          <div className={styles['save-dialog']}>
            <div className={styles['message-area']}>
              {message}
            </div>
            <div className={styles['message-area']}>
              {` ${progressRate} % `}
            </div>
            <div className={styles['progress-area']} >
              <Progress value={progressRate} size='md' hasStripe isAnimated />
            </div>
            <div className={styles['button-area']}>
              <Button sx={buttonStyle} size='lg' mr="0" onClick={() => { onCancel() }}>Cancel</Button>
            </div>
            <div className={isdisplay ? styles['loading-area'] : styles['loading-area-hide']} >
              <div className={styles['spinner-area']}>
                <Spinner thickness='4px'speed='0.8s' emptyColor='gray.200' color='blue.500' size='xl' />
              </div>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
