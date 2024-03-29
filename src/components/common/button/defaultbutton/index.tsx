/*
 * Copyright 2022 Sony Semiconductor Solutions Corp. All rights reserved.
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

import { Button } from '@chakra-ui/react'
import React from 'react'
import styles from '../../../../styles/main-page.module.scss'
import buttonStyles from './defaultbutton.module.scss'

type Props = {
  isLoading: boolean
  icon: JSX.Element
  text: string
  disabled: boolean
  action: React.MouseEventHandler<HTMLButtonElement>
}

export default function DefaultButton (props: Props) {
  return (
    <Button
      className={props.isLoading ? `${styles['action-disable']}` : `${buttonStyles['default-button']}`}
      leftIcon={props.icon}
      style={{ color: '#ffffff', backgroundColor: '#2d78be' }}
      variant='solid'
      size='md'
      isDisabled={props.disabled}
      onClick={props.action}>
      {props.text}</Button>
  )
}
