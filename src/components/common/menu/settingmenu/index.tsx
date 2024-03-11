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

import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure } from '@chakra-ui/react'
import React from 'react'
import { CLASSIFICATION, SEGMENTATION } from '../../../../pages'
import DefaultButton from '../../button/defaultbutton'
import SettingSVG from '../../button/defaultbutton/setting-svg'
import RadioButton from '../../button/radiobutton'
import DropDownList from '../../dropdownlist'
import CustomSlider from '../../slider'
import ProbabilitySVG from '../../slider/probability-svg'
import styles from './settingmenu.module.scss'

type SettingMenuProps = {
  aiTask: string
  mode: string
  probability: number
  setProbability: (probability: number) => void
  isDisplayTs: boolean
  setIsDisplayTs: (isDisplayTs: boolean) => void
  displayScore?: number
  setDisplayScore?: (displayScore: number) => void
  isOverlayIR?: boolean
  setIsOverlayIR?: (isOverlayIR: boolean) => void
  overlayIRC?: string
  setOverlayIRC?: (isOverlayIRC: string) => void
  transparency?: number
  setTransparency?: (transparency: number) => void
}

export default function SettingMenu (props: SettingMenuProps) {
  const RADIO_TEXT: string[] = ['ON', 'OFF']
  const { isOpen, onOpen, onClose } = useDisclosure()
  const scoreList = [...Array(21)].map((_, num) => num)

  const changeDisplayTs = () => {
    props.setIsDisplayTs(!props.isDisplayTs)
  }

  const changeOverlay = () => {
    if (props.setIsOverlayIR !== undefined) {
      props.setIsOverlayIR(!props.isOverlayIR)
    }
  }

  return (
    <>
      <DefaultButton isLoading={false} icon={<SettingSVG />} text='Display Setting' disabled={false} action={onOpen}></DefaultButton>
      <Modal isOpen={isOpen} onClose={onClose} size={'xl'}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader />
          <ModalCloseButton />
          <ModalBody>
            {props.aiTask !== SEGMENTATION
              ? <div className={styles['probability-area']}>
                <div>Probability</div>
                <div className={styles['slider-area']}>
                  <CustomSlider icon={<ProbabilitySVG />} currValue={props.probability} setCurrValue={props.setProbability} max={100} />
                  <div className={styles['unit-area']}>
                    {` >= ${props.probability}  %`}
                  </div>
                </div>
              </div>
              : null
            }

            {props.aiTask === SEGMENTATION && props.transparency !== undefined && props.setTransparency !== undefined
              ? <div className={styles['probability-area']}>
              <div>Transparency</div>
              <div className={styles['slider-area']}>
                <CustomSlider icon={<ProbabilitySVG />} currValue={props.transparency} setCurrValue={props.setTransparency} max={100} />
                <div className={styles['unit-area']}>
                  {`${props.transparency}  %`}
                </div>
              </div>
            </div>
              : null
            }
            <div className={styles['radio-button']}>
              Display Timestamp
              <RadioButton name={'tsRadio'} radioValue={props.isDisplayTs ? RADIO_TEXT[0] : RADIO_TEXT[1]} setRadioValue={changeDisplayTs} text={RADIO_TEXT} />
            </div>
            {props.aiTask === CLASSIFICATION
              ? <div className={styles['display-top-score']}>Display Top
                <div className={styles['number-list']}>
                  <DropDownList
                    id={'device-id-list'}
                    name={'score'}
                    className={styles['']}
                    list={scoreList}
                    onChange={(event) => {
                      if (props.displayScore !== undefined && props.setDisplayScore !== undefined) {
                        props.setDisplayScore(Number(event.target.value))
                      }
                    }
                    }
                    value={props.displayScore}
                    defaultSpace= {true}
                    disabled={false}
                  />
                </div>
                Score</div>
              : null
            }
            {props.aiTask === CLASSIFICATION
              ? <div className={styles['radio-button']}>Overlay Inference Result
                <RadioButton name={'overlayRadio'} radioValue={props.isOverlayIR ? RADIO_TEXT[0] : RADIO_TEXT[1]} setRadioValue={changeOverlay} text={RADIO_TEXT} />
              </div>
              : null
            }
            {props.aiTask === CLASSIFICATION
              ? <div className={styles['overlay-inference-result-color']}>Overlay Inference Result Color
                <input id="select-inferencecolor"
                  role='color'
                  type='color'
                  onChange={(event) => {
                    if (props.overlayIRC !== undefined && props.setOverlayIRC !== undefined) {
                      props.setOverlayIRC(event.target.value)
                    }
                  }
                  }
                  value={props.overlayIRC}
                />
              </div>
              : null
            }

          </ModalBody>
          <ModalFooter>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
