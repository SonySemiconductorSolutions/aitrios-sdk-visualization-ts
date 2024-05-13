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

import React from 'react'
import { Td } from '@chakra-ui/react'
import { labelProps } from '../../../hooks/util'
import ColorPicker from '../colorPicker'

export default function Label (props: labelProps) {
  const changeColor = (color:string) => {
    props.updateColor(color, props.index, props)
  }

  return (
    <>
      <Td py='1' textAlign='center' width={'50px'} borderWidth="1px" borderColor="gray.200" bg="white">
        <input type={'checkbox'} checked={props.isVisible} onChange={() => props.updateIsVisible(props.index, props)} />
      </Td>
      <Td py='1' textAlign='center' width={'50px'} borderWidth="1px" borderColor="gray.200" bg="white">
        {props.id}
      </Td>
      <Td py='1' borderWidth="1px" borderColor="gray.200" bg="white">
        <input type={'text'} name={props.label} value={props.label} placeholder={'Label Name'} onChange={(event) => props.updateLabel(event.target.value, props.index, props)} />
      </Td>
      <Td py='1' textAlign='center' width={'50px'} borderWidth="1px" borderColor="gray.200" bg="white">
        <ColorPicker color={props.color} changeColor={changeColor}/>
      </Td>
    </>
  )
}
