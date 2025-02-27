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

import { Grid, Typography } from '@mui/material';
import React from 'react';

interface Props {
  subtitle?: string;
  title: string;
}

export const SlideHeader: React.FC<Props> = ({ subtitle, title }) => {
  return (
    <Grid item pb={5}>
      <Typography variant="subtitle1">{subtitle}</Typography>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 'bold',
          fontSize: '14',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </Typography>
    </Grid>
  );
};
