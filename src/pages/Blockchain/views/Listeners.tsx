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

import { Grid } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FilterButton } from '../../../components/Filters/FilterButton';
import { FilterModal } from '../../../components/Filters/FilterModal';
import { Header } from '../../../components/Header';
import { ChartTableHeader } from '../../../components/Headers/ChartTableHeader';
import { HashPopover } from '../../../components/Popovers/HashPopover';
import { ListenerSlide } from '../../../components/Slides/ListenerSlide';
import { FFTableText } from '../../../components/Tables/FFTableText';
import { DataTable } from '../../../components/Tables/Table';
import { ApplicationContext } from '../../../contexts/ApplicationContext';
import { DateFilterContext } from '../../../contexts/DateFilterContext';
import { FilterContext } from '../../../contexts/FilterContext';
import { SlideContext } from '../../../contexts/SlideContext';
import { SnackbarContext } from '../../../contexts/SnackbarContext';
import {
  FF_Paths,
  IContractListener,
  IDataTableRecord,
  IPagedContractListenerResponse,
  ListenerFilters,
} from '../../../interfaces';
import { DEFAULT_PADDING, DEFAULT_PAGE_LIMITS } from '../../../theme';
import { fetchCatcher, getFFTime } from '../../../utils';

export const BlockchainListeners: () => JSX.Element = () => {
  const { selectedNamespace } = useContext(ApplicationContext);
  const { dateFilter } = useContext(DateFilterContext);
  const { filterAnchor, setFilterAnchor, filterString } =
    useContext(FilterContext);
  const { slideID, setSlideSearchParam } = useContext(SlideContext);
  const { reportFetchError } = useContext(SnackbarContext);
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  // Listeners
  const [listeners, setListeners] = useState<IContractListener[]>();
  // Listener totals
  const [listenerTotal, setListenerTotal] = useState(0);
  // View listener slide out
  const [viewListener, setViewListener] = useState<
    IContractListener | undefined
  >();
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_LIMITS[1]);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    isMounted &&
      slideID &&
      fetchCatcher(
        `${
          FF_Paths.nsPrefix
        }/${selectedNamespace}${FF_Paths.contractListenersByNameId(slideID)}`
      )
        .then((listenerRes: IContractListener) => {
          setViewListener(listenerRes);
        })
        .catch((err) => {
          reportFetchError(err);
        });
  }, [slideID, isMounted]);

  // Listeners
  useEffect(() => {
    isMounted &&
      dateFilter &&
      fetchCatcher(
        `${FF_Paths.nsPrefix}/${selectedNamespace}${
          FF_Paths.contractListeners
        }?limit=${rowsPerPage}&count&skip=${rowsPerPage * currentPage}${
          dateFilter.filterString
        }${filterString ?? ''}`
      )
        .then((listeners: IPagedContractListenerResponse) => {
          if (isMounted) {
            setListeners(listeners.items);
            setListenerTotal(listeners.total);
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
    isMounted,
  ]);

  const listenerColHeaders = [
    t('eventName'),
    t('id'),
    t('interfaceID'),
    t('protocolID'),
    t('location'),
    t('created'),
  ];

  const listenerRecords: IDataTableRecord[] | undefined = listeners?.map(
    (l) => ({
      key: l.id,
      columns: [
        {
          value: <FFTableText color="primary" text={l.event.name} />,
        },
        {
          value: (
            <HashPopover
              shortHash={true}
              address={l.interface.id}
            ></HashPopover>
          ),
        },
        {
          value: <HashPopover shortHash={true} address={l.id}></HashPopover>,
        },
        {
          value: (
            <HashPopover shortHash={true} address={l.protocolId}></HashPopover>
          ),
        },
        {
          value: (
            <HashPopover
              shortHash={true}
              address={l.location?.address ?? ''}
            ></HashPopover>
          ),
        },
        {
          value: <FFTableText color="secondary" text={getFFTime(l.created)} />,
        },
      ],
      onClick: () => {
        setViewListener(l);
        setSlideSearchParam(l.id);
      },
    })
  );

  return (
    <>
      <Header title={t('listeners')} subtitle={t('blockchain')}></Header>
      <Grid container px={DEFAULT_PADDING}>
        <Grid container item wrap="nowrap" direction="column">
          <ChartTableHeader
            title={t('allListeners')}
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
            records={listenerRecords}
            columnHeaders={listenerColHeaders}
            paginate={true}
            emptyStateText={t('noListenersToDisplay')}
            dataTotal={listenerTotal}
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
          fields={ListenerFilters}
        />
      )}
      {viewListener && (
        <ListenerSlide
          listener={viewListener}
          open={!!viewListener}
          onClose={() => {
            setViewListener(undefined);
            setSlideSearchParam(null);
          }}
        />
      )}
    </>
  );
};
