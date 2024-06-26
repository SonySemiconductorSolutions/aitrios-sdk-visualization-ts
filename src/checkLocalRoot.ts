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

import * as fs from 'fs'
import * as path from 'path'
import { SERVICE, CONNECTION_DESTINATION, LOCAL_ROOT } from './common/settings'
export function checkLocalRoot () {
  if (CONNECTION_DESTINATION === SERVICE.Local) {
    if (!fs.existsSync(LOCAL_ROOT)) {
      console.error('LOCAL_ROOT is not exists')
      process.exit(1)
    }
    if (!path.isAbsolute(LOCAL_ROOT)) {
      console.error('LOCAL_ROOT is only absolute paths are supported.')
      process.exit(1)
    }
  }
  return true
}

checkLocalRoot()
