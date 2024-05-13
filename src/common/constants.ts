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

// Mode
export const REALTIME_MODE = 'Realtime Mode'
export const HISTORY_MODE = 'History Mode'

export const ModeTab = [REALTIME_MODE, HISTORY_MODE] as const
export type ModeTabType = typeof ModeTab[number]

// AI task
export const OBJECT_DETECTION = 'Object Detection'
export const CLASSIFICATION = 'Classification'
export const SEGMENTATION = 'Segmentation'

export const AiTaskTab = [OBJECT_DETECTION, CLASSIFICATION, SEGMENTATION] as const
export type AiTaskTabType = typeof AiTaskTab[number]

// Polling interval(Realtime Mode) and Interval time(History Mode)
export const MIN_INTERVAL_SEC = 10
export const MAX_INTERVAL_SEC = 120
export const STEP_INTERVAL_SEC = 1
export const MIN_HISH_FPS_INTERVAL_SEC = 0.5
export const STEP_HISH_FPS_INTERVAL_SEC = 0.5
export const DEFAULT_INTERVAL_SEC = MIN_INTERVAL_SEC
