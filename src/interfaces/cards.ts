// Copyright © 2022 Kaleido, Inc.
//
// SPDX-License-Identifier: Apache-2.0
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

export interface IDataWithHeader {
  header?: string;
  data: string | number | undefined | JSX.Element;
}

export interface ISmallCard {
  header: string;
  numErrors?: number;
  errorLink?: string;
  data: IDataWithHeader[];
  clickPath?: string;
}

export interface IFireFlyCard {
  headerComponent?: JSX.Element | string;
  headerText: string;
  component: JSX.Element;
}
