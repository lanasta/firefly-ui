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

import LaunchIcon from '@mui/icons-material/Launch';
import { Grid, IconButton, Link } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FilterButton } from '../../../components/Filters/FilterButton';
import { FilterModal } from '../../../components/Filters/FilterModal';
import { Header } from '../../../components/Header';
import { ChartTableHeader } from '../../../components/Headers/ChartTableHeader';
import { HashPopover } from '../../../components/Popovers/HashPopover';
import { FFTableText } from '../../../components/Tables/FFTableText';
import { DataTable } from '../../../components/Tables/Table';
import { ApplicationContext } from '../../../contexts/ApplicationContext';
import { DateFilterContext } from '../../../contexts/DateFilterContext';
import { FilterContext } from '../../../contexts/FilterContext';
import { SnackbarContext } from '../../../contexts/SnackbarContext';
import {
  ApiFilters,
  FF_Paths,
  IDataTableRecord,
  IFireflyApi,
  IPagedFireFlyApiResponse,
} from '../../../interfaces';
import { DEFAULT_PADDING, DEFAULT_PAGE_LIMITS } from '../../../theme';
import { fetchCatcher } from '../../../utils';
import { hasApiEvent } from '../../../utils/wsEvents';

export const BlockchainApis: () => JSX.Element = () => {
  const { newEvents, lastRefreshTime, clearNewEvents, selectedNamespace } =
    useContext(ApplicationContext);
  const { dateFilter } = useContext(DateFilterContext);
  const { filterAnchor, setFilterAnchor, filterString } =
    useContext(FilterContext);
  const { reportFetchError } = useContext(SnackbarContext);
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  // APIs
  const [apis, setApis] = useState<IFireflyApi[]>();
  // API Totals
  const [apiTotal, setApiTotal] = useState(0);

  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_LIMITS[1]);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  // APIs
  useEffect(() => {
    isMounted &&
      dateFilter &&
      fetchCatcher(
        `${FF_Paths.nsPrefix}/${selectedNamespace}${
          FF_Paths.apis
        }?limit=${rowsPerPage}&count&skip=${rowsPerPage * currentPage}${
          dateFilter.filterString
        }${filterString ?? ''}`
      )
        .then((apis: IPagedFireFlyApiResponse) => {
          if (isMounted) {
            setApis(apis.items);
            setApiTotal(apis.total);
          }
        })
        .catch((err) => {
          reportFetchError(err);
        });
  }, [
    rowsPerPage,
    currentPage,
    selectedNamespace,
    dateFilter,
    filterString,
    lastRefreshTime,
    isMounted,
  ]);

  const apiColHeaders = [
    t('name'),
    t('id'),
    t('interfaceID'),
    t('location'),
    t('openApi'),
    t('swagger'),
  ];

  const apiRecords: IDataTableRecord[] | undefined = apis?.map((api) => ({
    key: api.id,
    columns: [
      {
        value: <FFTableText color="primary" text={api.name} />,
      },
      {
        value: <HashPopover shortHash={true} address={api.id}></HashPopover>,
      },
      {
        value: (
          <HashPopover
            shortHash={true}
            address={api.interface.id}
          ></HashPopover>
        ),
      },
      {
        value: (
          <HashPopover
            shortHash={true}
            address={api.location?.address ?? ''}
          ></HashPopover>
        ),
      },
      {
        value: (
          <Link target="_blank" href={api.urls.openapi} underline="always">
            <IconButton>
              <LaunchIcon />
            </IconButton>
          </Link>
        ),
      },
      {
        value: (
          <Link target="_blank" href={api.urls.ui} underline="always">
            <IconButton>
              <LaunchIcon />
            </IconButton>
          </Link>
        ),
      },
    ],
  }));

  return (
    <>
      <Header
        title={t('apis')}
        subtitle={t('blockchain')}
        showRefreshBtn={hasApiEvent(newEvents)}
        onRefresh={clearNewEvents}
      ></Header>
      <Grid container px={DEFAULT_PADDING}>
        <Grid container item wrap="nowrap" direction="column">
          <ChartTableHeader
            title={t('allApis')}
            filter={
              <FilterButton
                onSetFilterAnchor={(e: React.MouseEvent<HTMLButtonElement>) =>
                  setFilterAnchor(e.currentTarget)
                }
              />
            }
          />
          <DataTable
            onHandleCurrPageChange={(currentPage: number) =>
              setCurrentPage(currentPage)
            }
            onHandleRowsPerPage={(rowsPerPage: number) =>
              setRowsPerPage(rowsPerPage)
            }
            stickyHeader={true}
            minHeight="300px"
            maxHeight="calc(100vh - 340px)"
            records={apiRecords}
            columnHeaders={apiColHeaders}
            paginate={true}
            emptyStateText={t('noApisToDisplay')}
            dataTotal={apiTotal}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
          />
        </Grid>
      </Grid>
      {filterAnchor && (
        <FilterModal
          anchor={filterAnchor}
          onClose={() => {
            setFilterAnchor(null);
          }}
          fields={ApiFilters}
        />
      )}
    </>
  );
};
