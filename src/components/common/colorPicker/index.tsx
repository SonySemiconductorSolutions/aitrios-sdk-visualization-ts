/*
 * Copyright 2024 Sony Semiconductor Solutions Corp. All rights reserved.
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
import { colorPickerProps } from '../../../hooks/util'
import { ChromePicker } from 'react-color'
import styles from './colorPicker.module.scss'

export default function ColorPicker (props: colorPickerProps) {
  const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false)
  const [color, setColor] = useState<string>(props.color)

  useEffect(() => {
    setColor(props.color)
  }, [props.color])

  const handleChangeComplete = (color: any, event: any) => {
    setColor(color.hex)
  }
  const colorPickerOpen = () => {
    setDisplayColorPicker(true)
  }

  const colorPickerClose = () => {
    props.changeColor(color)
    setDisplayColorPicker(false)
  }

  return (
    <>
      <div className={styles['color-button']} onClick={colorPickerOpen}>
        <div className={styles['color-label']} style={{ background: color }} />
      </div>
      {displayColorPicker
        ? <div className={styles['label-popover']}>
          <div className={styles['label-cover']} onClick={colorPickerClose} />
          <ChromePicker color={color} onChange={handleChangeComplete} disableAlpha={true} />
        </div>
        : null}
    </>
  )
}
