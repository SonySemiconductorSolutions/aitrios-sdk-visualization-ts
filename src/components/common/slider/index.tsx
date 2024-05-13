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

import { Box, Slider, SliderFilledTrack, SliderThumb, SliderTrack } from '@chakra-ui/react'
import React from 'react'
import Nouislider from 'nouislider-react'
import 'nouislider/distribute/nouislider.css'
import styles from './slider.module.scss'
import SliderThumbSVG from './sliderthumb-svg'

type SliderProps = {
  icon: JSX.Element
  isPlaying? : boolean
  currValue: number
  setCurrValue: (currValue: number) => void
  min?: number
  max: number
  step?: number
}

type RangeSliderProps = {
  setCurrminValue: (currminValue: number) => void
  setCurrmaxValue: (currmaxValue: number) => void
  min?: number
  max: number
  start: number
  end: number
}

export default function CustomSlider (props: SliderProps) {
  return (
    <>
      {props.icon}
      <div className={styles['custom-slider']}>
        <Slider
          value={props.currValue}
          onChange={(val: number) => props.setCurrValue(val)}
          min={(props.min) ? props.min : 0}
          max={props.max}
          step={(props.step) ? props.step : 1}
          focusThumbOnChange={false}
          isDisabled={props.isPlaying}
        >
          <SliderTrack backgroundColor="#8A8C99" height="2px" borderRadius="0px" >
            <SliderFilledTrack backgroundColor="#8A8C99" height="2px"/>
          </SliderTrack>
          <SliderThumb boxShadow="none">
            <Box as={SliderThumbSVG} boxShadow="none" />
          </SliderThumb>
        </Slider>
      </div>
    </>)
}

export function RangeSlider (props: RangeSliderProps) {
  const onChange = (value: number[]) => {
    props.setCurrminValue(Math.round(value[0]))
    props.setCurrmaxValue(Math.round(value[1]))
  }

  return (
    <>
      <div className={styles['noUi-slider']}>
      <Nouislider
        range={{ min: (props.min) ? props.min : 1, max: props.max }}
        start={[props.start, props.end]}
        step={1}
        connect={true}
        onChange={(val: number[]) => onChange(val)}
      />
      </div>
    </>)
}
