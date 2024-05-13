/*
 * Copyright 2022, 2023 Sony Semiconductor Solutions Corp. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export type State = {
  isPlaying: boolean
  isUploading: boolean
  imageCount: number
  totalCount: number
  isFirst: boolean
  displayCount: number
  intervalTimeValue: number
  imagePath: string
}

export type Action =
  | {
      type: 'setImageCount'
      payload: {
        imageCount: number
      }
    }
  | {
      type: 'setDisplayCount'
      payload: {
        displayCount: number
      }
    }
  | {
      type: 'updateDisplayCount'
    }
  | {
      type: 'notFirst'
    }
  | {
      type: 'clearFirst'
    }
  | {
      type: 'setTotalCount'
      payload: {
        totalCount: number
      }
    }
  | {
      type: 'startUpload'
      payload: {
        imagePath: string
      }
    }
  | {
      type: 'stopUpload'
    }
  | {
      type: 'startPlaying'
    }
  | {
      type: 'stopPlaying'
    }
  | {
      type: 'stopPlayingFailure'
    }
  | {
      type: 'startPlayingHistory'
    }
  | {
      type: 'stopPlayingHistory'
    }
  | {
      type: 'setIntervalTimeValue'
      payload: {
        intervalTimeValue: number
      }
    }
  | {
      type: 'setImagePath'
      payload: {
        imagePath: string
      }
    }

export function reducer (state: State, action: Action): State {
  switch (action.type) {
    case 'setImageCount':
      return { ...state, imageCount: action.payload.imageCount }
    case 'setDisplayCount':
      return { ...state, displayCount: action.payload.displayCount }
    case 'updateDisplayCount':
      return { ...state, displayCount: state.imageCount }
    case 'notFirst':
      return { ...state, isFirst: false }
    case 'clearFirst':
      return { ...state, isFirst: true }
    case 'startUpload':
      return { ...state, isUploading: true, imagePath: action.payload.imagePath }
    case 'stopUpload':
      return { ...state, isUploading: false, isPlaying: false, imagePath: '' }
    case 'startPlaying':
      return { ...state, isPlaying: true }
    case 'stopPlaying':
      return { ...state, isPlaying: false }
    case 'stopPlayingFailure':
      return { ...state, isPlaying: state.isPlaying, isUploading: state.isUploading }
    case 'setTotalCount':
      return { ...state, totalCount: action.payload.totalCount, imageCount: 0, displayCount: 0 }
    case 'startPlayingHistory':
      return { ...state, isPlaying: true, imageCount: state.displayCount }
    case 'stopPlayingHistory':
      return { ...state, isPlaying: false, imageCount: state.displayCount }
    case 'setIntervalTimeValue':
      return { ...state, intervalTimeValue: action.payload.intervalTimeValue }
    case 'setImagePath':
      return { ...state, imagePath: action.payload.imagePath }
  }
}
