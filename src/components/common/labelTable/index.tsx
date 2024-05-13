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

import React from 'react'
import Label from '../label'
import { ChakraProvider, Box, Table, TableContainer, Tbody, Th, Thead, Tr } from '@chakra-ui/react'
import { LabelTableProps } from '../../../hooks/util'

export default function LabelTable (props: LabelTableProps) {
  return (
    <ChakraProvider>
      <Box bg="blue.100" w="100%" borderWidth="1px">
        <TableContainer overflowX="unset" overflowY="unset">
          <Table variant="simple">
            <Thead position="sticky" top={-1} zIndex="docked">
              <Tr bg="gray.50">
                {props.headerList.map((value, index) => {
                  return (
                    <Th key={index} py='1' textAlign='center' textTransform='capitalize' borderWidth='1px' paddingLeft='0' paddingRight='0' borderColor="gray.200">
                      {value}
                    </Th>
                  )
                })}
              </Tr>
            </Thead>
            <Tbody style={{ maxHeight: '200px' }}>
              {props.data.labelData.map((value, index) => {
                return (
                  <Tr key={index} >
                    <Label
                      index={index}
                      isVisible={value.isVisible}
                      updateIsVisible={props.updateIsVisible}
                      data={props.data}
                      setData={props.setData}
                      id={index}
                      label={value.label}
                      updateLabel={props.updateLabel}
                      color={value.color}
                      updateColor={props.updateColor}
                    />
                  </Tr>
                )
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </ChakraProvider>
  )
}
