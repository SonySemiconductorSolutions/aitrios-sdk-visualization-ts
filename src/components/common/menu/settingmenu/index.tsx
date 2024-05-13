/*
 * Copyright 2022, 2023, 2024 Sony Semiconductor Solutions Corp. All rights reserved.
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
import React, { useContext } from 'react'
import { CLASSIFICATION, SEGMENTATION } from '../../../../common/constants'
import { DisplaySetting } from '../../../../hooks/util'
import DefaultButton from '../../button/defaultbutton'
import SettingSVG from '../../button/defaultbutton/setting-svg'
import RadioButton from '../../button/radiobutton'
import DropDownList from '../../dropdownlist'
import CustomSlider from '../../slider'
import ProbabilitySVG from '../../slider/probability-svg'
import styles from './settingmenu.module.scss'
import { UserContext } from '../../../../hooks/context'
import ColorPicker from '../../colorPicker'

export type SettingMenuProps = {
  displaySetting: DisplaySetting
  setDisplaySetting: (value: React.SetStateAction<DisplaySetting>) => void
}

export default function SettingMenu (props: SettingMenuProps) {
  const { aiTask } = useContext(UserContext)
  const RADIO_TEXT: string[] = ['ON', 'OFF']
  const { isOpen, onOpen, onClose } = useDisclosure()
  const scoreList = [...Array(21)].map((_, num) => num)

  const setDisplayTs = () => {
    const setting = { ...props.displaySetting, isDisplayTs: !props.displaySetting.isDisplayTs }
    props.setDisplaySetting(setting)
  }

  const setOverlay = () => {
    const setting = { ...props.displaySetting, isOverlayIR: !props.displaySetting.isOverlayIR }
    props.setDisplaySetting(setting)
  }

  const setProbability = (currValue: number) => {
    const setting = { ...props.displaySetting, probability: currValue }
    props.setDisplaySetting(setting)
  }

  const setTransparency = (currValue: number) => {
    const setting = { ...props.displaySetting, transparency: currValue }
    props.setDisplaySetting(setting)
  }

  const setDisplayScore = (value: number) => {
    const setting = { ...props.displaySetting, displayScore: value }
    props.setDisplaySetting(setting)
  }

  const setOverlayIRC = (value: string) => {
    const setting = { ...props.displaySetting, overlayIRC: value }
    props.setDisplaySetting(setting)
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
            {aiTask !== SEGMENTATION
              ? <div className={styles['probability-area']}>
                <div>Probability</div>
                <div className={styles['slider-area']}>
                  <CustomSlider icon={<ProbabilitySVG />} currValue={props.displaySetting.probability} setCurrValue={setProbability} max={100} />
                  <div className={styles['unit-area']}>
                    {` >= ${props.displaySetting.probability}  %`}
                  </div>
                </div>
              </div>
              : null
            }

            {aiTask === SEGMENTATION
              ? <div className={styles['probability-area']}>
              <div>Transparency</div>
              <div className={styles['slider-area']}>
                <CustomSlider icon={<ProbabilitySVG />} currValue={props.displaySetting.transparency} setCurrValue={setTransparency} max={100} />
                <div className={styles['unit-area']}>
                  {`${props.displaySetting.transparency}  %`}
                </div>
              </div>
            </div>
              : null
            }
            <div className={styles['radio-button']}>
              Display Timestamp
              <RadioButton name={'tsRadio'} radioValue={props.displaySetting.isDisplayTs ? RADIO_TEXT[0] : RADIO_TEXT[1]} setRadioValue={setDisplayTs} text={RADIO_TEXT} />
            </div>
            {aiTask === CLASSIFICATION
              ? <div className={styles['display-top-score']}>Display Top
                <div className={styles['number-list']}>
                  <DropDownList
                    id={'device-id-list'}
                    name={'score'}
                    className={styles['']}
                    list={scoreList}
                    onChange={(event) => {
                      setDisplayScore(Number(event.target.value))
                    }
                    }
                    value={props.displaySetting.displayScore}
                    defaultSpace= {true}
                    disabled={false}
                  />
                </div>
                Score</div>
              : null
            }
            {aiTask === CLASSIFICATION
              ? <div className={styles['radio-button']}>Overlay Inference Result
                <RadioButton name={'overlayRadio'} radioValue={props.displaySetting.isOverlayIR ? RADIO_TEXT[0] : RADIO_TEXT[1]} setRadioValue={setOverlay} text={RADIO_TEXT} />
              </div>
              : null
            }
            {aiTask === CLASSIFICATION
              ? <div className={styles['overlay-inference-result-color']}>Overlay Inference Result Color
                  <div>
                    <ColorPicker color={props.displaySetting.overlayIRC} changeColor={setOverlayIRC} />
                  </div>
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
