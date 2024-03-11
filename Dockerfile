# Copyright 2023 Sony Semiconductor Solutions Corp. All rights reserved.
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
#     http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

FROM node:18-alpine

RUN apk upgrade --update-cache --available \
  && apk add fontconfig --no-cache \
  && apk add ttf-dejavu --no-cache \
  && apk add openssl --no-cache \
  && rm -rf /var/cache/apk/*

WORKDIR /app

COPY --chown=node:node package*.json ./
COPY --chown=node:node ./src ./src
COPY --chown=node:node ./LICENSE ./
COPY --chown=node:node ./appLaunch.sh ./

RUN npm ci --omit=dev
RUN npm uninstall -g pnpm

WORKDIR /app/src

RUN npx next telemetry disable

RUN ["../node_modules/.bin/next", "build"]

USER node

EXPOSE 3000

CMD ["/bin/sh","/app/appLaunch.sh"]
