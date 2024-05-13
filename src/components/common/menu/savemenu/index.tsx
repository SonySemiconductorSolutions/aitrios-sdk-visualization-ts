/*
 * Copyright 2023, 2024 Sony Semiconductor Solutions Corp. All rights reserved.
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

import React, { useState, useEffect } from 'react'
import { Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalHeader, ModalBody, useDisclosure } from '@chakra-ui/react'
import styles from './savemenu.module.scss'
import DefaultButton from '../../button/defaultbutton'
import SaveSVG from '../../button/defaultbutton/save-svg'
import SaveDialog from '../../dialog/savedialog'
import RadioButton from '../../button/radiobutton'
import { RangeSlider } from '../../slider/index'
import { createZip, createZipProps, SegmentationLabelType } from '../../../../hooks/util'

type SaveMenuProps = {
  deviceId: string
  max: number
  subDirectory: string
  isPlaying: boolean
  aiTask: string
  labelDataOD: string[]
  labelDataCLS:string[]
  labelDataSEG: SegmentationLabelType[]
  isDisplayTs:boolean
  probability:number
  isOverlayIR:boolean
  overlayIRC:string
  transparency: number
}

export default function SaveMenu (props: SaveMenuProps) {
  const defaultMinValue = 1
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [radioValue, setRadioValue] = useState<string>('Original Image')
  const [fs, setFs] = useState<FileSystemFileHandle | undefined>(undefined)
  const [rangemin, setRangemin] = useState<number>(defaultMinValue)
  const [rangemax, setRangemax] = useState<number>(props.max)
  const subDirName = props.subDirectory

  const createZipProps: createZipProps = {
    subDirName,
    fs,
    setFs
  }

  useEffect(() => {
    setRangemin(defaultMinValue)
    setRangemax(props.max)
  }, [props.max])

  return (
    <>
      <DefaultButton isLoading={false} icon={<SaveSVG />} text='Save Data' disabled={!props.subDirectory || props.isPlaying} action={onOpen}></DefaultButton>
      <Modal closeOnOverlayClick={false} closeOnEsc={false} isOpen={isOpen} onClose={onClose} size={'xl'}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader />
          <ModalCloseButton />
          <ModalBody>
            <div className={styles['radio-button']}>
              <div>Select save data</div>
              <div className={styles['type-label']}>Type</div>
              <div className={styles['top-block']}>
                <RadioButton name={'saveDataRadio'} radioValue={radioValue} setRadioValue={setRadioValue} text={['Original Image', 'Overlaid Image']} />
              </div>
            </div>
            <div className={styles['saverange-area']}>
              <div>Range(No. {rangemin} ~ {rangemax})</div>
              { props.max !== defaultMinValue
                ? <div className={styles['slider-area']}>
                  <div className={styles['rangeslider-area']}>
                    <RangeSlider setCurrminValue={setRangemin} setCurrmaxValue={setRangemax} max={props.max} start={rangemin} end={rangemax} />
                  </div>
                </div>
                : <div className={styles['text-area']}>
                  <div>Only one item can be saved</div>
                </div>
              }
            </div>
          </ModalBody>
          <div className={styles['button-area']}>
            <DefaultButton isLoading={false} icon={<SaveSVG />} text='Save' disabled={false} action={() => { createZip(createZipProps) }}></DefaultButton>
          </div>
          <div className={styles['button-area']}>
            {fs
              ? <SaveDialog
                  deviceId={props.deviceId}
                  subDirectory={props.subDirectory}
                  startIndex={rangemin - 1}
                  endIndex={rangemax - 1}
                  aiTask={props.aiTask}
                  fs={fs}
                  setFs={setFs}
                  saveDataCategory={radioValue}
                  labelDataOD={props.labelDataOD}
                  labelDataCLS={props.labelDataCLS}
                  labelDataSEG={props.labelDataSEG}
                  isDisplayTs={props.isDisplayTs}
                  probability={props.probability}
                  isOverlayIR={props.isOverlayIR}
                  overlayIRC={props.overlayIRC}
                  transparency={props.transparency}
                />
              : null
            }
          </div>
        </ModalContent>
      </Modal>
    </>
  )
}
