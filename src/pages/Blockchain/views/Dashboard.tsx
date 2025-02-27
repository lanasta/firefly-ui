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

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Grid, IconButton } from '@mui/material';
import { BarDatum } from '@nivo/bar';
import dayjs from 'dayjs';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FireFlyCard } from '../../../components/Cards/FireFlyCard';
import { SmallCard } from '../../../components/Cards/SmallCard';
import { Histogram } from '../../../components/Charts/Histogram';
import { Header } from '../../../components/Header';
import { HashPopover } from '../../../components/Popovers/HashPopover';
import { FFTableText } from '../../../components/Tables/FFTableText';
import { MediumCardTable } from '../../../components/Tables/MediumCardTable';
import { DataTable } from '../../../components/Tables/Table';
import { ApplicationContext } from '../../../contexts/ApplicationContext';
import { DateFilterContext } from '../../../contexts/DateFilterContext';
import { SnackbarContext } from '../../../contexts/SnackbarContext';
import {
  BucketCollectionEnum,
  BucketCountEnum,
  EVENTS_PATH,
  FF_NAV_PATHS,
  FF_Paths,
  IBlockchainEvent,
  IContractInterface,
  IContractListener,
  IDataTableRecord,
  IFireFlyCard,
  IGenericPagedResponse,
  IMetric,
  INTERFACES_PATH,
  IPagedBlockchainEventResponse,
  ISmallCard,
  LISTENERS_PATH,
} from '../../../interfaces';
import { FF_BE_CATEGORY_MAP } from '../../../interfaces/enums/blockchainEventTypes';
import {
  DEFAULT_PADDING,
  DEFAULT_PAGE_LIMITS,
  DEFAULT_SPACING,
  FFColors,
} from '../../../theme';
import { fetchCatcher, getFFTime } from '../../../utils';
import {
  isHistogramEmpty,
  makeColorArray,
  makeKeyArray,
} from '../../../utils/charts';
import { makeBlockchainEventHistogram } from '../../../utils/histograms/blockchainEventHistogram';
import { hasBlockchainEvent } from '../../../utils/wsEvents';

export const BlockchainDashboard: () => JSX.Element = () => {
  const { t } = useTranslation();
  const { newEvents, lastRefreshTime, clearNewEvents, selectedNamespace } =
    useContext(ApplicationContext);
  const { dateFilter } = useContext(DateFilterContext);
  const { reportFetchError } = useContext(SnackbarContext);
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);
  // Small cards
  // Blockchain Operations
  const [blockchainOpCount, setBlockchainOpCount] = useState<number>();
  const [blockchainOpErrorCount, setBlockchainOpErrorCount] =
    useState<number>(0);
  // Blockchain Transactions
  const [blockchainTxCount, setBlockchainTxCount] = useState<number>();
  // Blockchain Events
  const [blockchainEventCount, setBlockchainEventCount] = useState<number>();
  // Contract interfaces count
  const [contractInterfacesCount, setContractInterfacesCount] =
    useState<number>();

  // Medium cards
  // Events histogram
  const [beHistData, setBeHistData] = useState<BarDatum[]>();
  // Contract interfaces
  const [contractInterfaces, setContractInterfaces] =
    useState<IContractInterface[]>();
  // Contract listeners
  const [contractListeners, setContractListeners] =
    useState<IContractListener[]>();

  const [blockchainEvents, setBlockchainEvents] =
    useState<IBlockchainEvent[]>();
  const [blockchainEventsTotal, setBlockchainEventsTotal] = useState(0);

  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_LIMITS[0]);

  const [isHistLoading, setIsHistLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  const smallCards: ISmallCard[] = [
    {
      header: t('blockchainOperations'),
      numErrors: blockchainOpErrorCount,
      data: [{ data: blockchainOpCount }],
      clickPath: FF_NAV_PATHS.activityOpPath(selectedNamespace),
    },
    {
      header: t('blockchainTransactions'),
      data: [{ data: blockchainTxCount }],
      clickPath: FF_NAV_PATHS.activityTxPath(selectedNamespace),
    },
    {
      header: t('blockchainEvents'),
      data: [{ data: blockchainEventCount }],
      clickPath: FF_NAV_PATHS.blockchainEventsPath(selectedNamespace),
    },
    {
      header: t('contractInterfaces'),
      data: [{ data: contractInterfacesCount }],
      clickPath: FF_NAV_PATHS.blockchainInterfacesPath(selectedNamespace),
    },
  ];

  // Small Card UseEffect
  useEffect(() => {
    const qParams = `?count=true&limit=1${dateFilter?.filterString ?? ''}`;
    const qParamsNoRange = `?count=true&limit=1`;

    isMounted &&
      dateFilter &&
      Promise.all([
        // Blockchain Operations
        fetchCatcher(
          `${FF_Paths.nsPrefix}/${selectedNamespace}${FF_Paths.operations}${qParams}`
        ),
        fetchCatcher(
          `${FF_Paths.nsPrefix}/${selectedNamespace}${FF_Paths.operations}${qParams}&error=!`
        ),
        // Blockchain Transactions
        fetchCatcher(
          `${FF_Paths.nsPrefix}/${selectedNamespace}${FF_Paths.transactions}${qParams}`
        ),
        // Blockchain Events
        fetchCatcher(
          `${FF_Paths.nsPrefix}/${selectedNamespace}${FF_Paths.blockchainEvents}${qParams}`
        ),
        // Contract interfaces
        fetchCatcher(
          `${FF_Paths.nsPrefix}/${selectedNamespace}${FF_Paths.contractInterfaces}${qParamsNoRange}`
        ),
      ])
        .then(
          ([
            // Blockchain Operations
            ops,
            opsErr,
            // Blockchain Transactions
            txs,
            // Blockchain Events
            events,
            // Contract interfaces
            interfaces,
          ]: IGenericPagedResponse[] | any[]) => {
            if (isMounted) {
              // Operations
              setBlockchainOpCount(ops.total);
              setBlockchainOpErrorCount(opsErr.total);
              // Transactions
              setBlockchainTxCount(txs.total);
              // Events
              setBlockchainEventCount(events.total);
              // Interfaces
              setContractInterfacesCount(interfaces.total);
            }
          }
        )
        .catch((err) => {
          reportFetchError(err);
        });
  }, [selectedNamespace, lastRefreshTime, dateFilter, isMounted]);

  const ciColHeaders = [t('name'), t('version'), t('interfaceID')];
  const ciRecords: IDataTableRecord[] | undefined = contractInterfaces?.map(
    (ci) => ({
      key: ci.id,
      columns: [
        {
          value: <FFTableText color="primary" text={ci.name} />,
        },
        {
          value: <FFTableText color="primary" text={ci.version} />,
        },
        {
          value: <HashPopover shortHash address={ci.id} />,
        },
      ],
      onClick: () =>
        navigate(
          FF_NAV_PATHS.blockchainInterfacesPath(selectedNamespace, ci.id)
        ),
    })
  );

  const clColHeaders = [t('name'), t('eventName')];
  const clRecords: IDataTableRecord[] | undefined = contractListeners?.map(
    (cl) => ({
      key: cl.id,
      columns: [
        { value: <HashPopover shortHash address={cl.name} /> },
        { value: <FFTableText color="primary" text={cl.event.name} /> },
      ],
      onClick: () =>
        navigate(
          FF_NAV_PATHS.blockchainListenersSinglePath(selectedNamespace, cl.id)
        ),
    })
  );

  const mediumCards: IFireFlyCard[] = [
    {
      headerText: t('recentBlockchainEvents'),
      headerComponent: (
        <IconButton onClick={() => navigate(EVENTS_PATH)}>
          <ArrowForwardIcon />
        </IconButton>
      ),
      component: (
        <Histogram
          height={'100%'}
          colors={makeColorArray(FF_BE_CATEGORY_MAP)}
          data={beHistData}
          indexBy="timestamp"
          keys={makeKeyArray(FF_BE_CATEGORY_MAP)}
          includeLegend={true}
          emptyText={t('noBlockchainEvents')}
          isLoading={isHistLoading}
          isEmpty={isHistogramEmpty(beHistData ?? [])}
        />
      ),
    },
    {
      headerText: t('contractInterfaces'),
      headerComponent: (
        <IconButton onClick={() => navigate(INTERFACES_PATH)}>
          <ArrowForwardIcon />
        </IconButton>
      ),
      component: (
        <MediumCardTable
          records={ciRecords}
          columnHeaders={ciColHeaders}
          emptyMessage={t('noContractInterfaces')}
          stickyHeader={true}
        ></MediumCardTable>
      ),
    },
    {
      headerText: t('contractListeners'),
      headerComponent: (
        <IconButton onClick={() => navigate(LISTENERS_PATH)}>
          <ArrowForwardIcon />
        </IconButton>
      ),
      component: (
        <MediumCardTable
          records={clRecords}
          columnHeaders={clColHeaders}
          emptyMessage={t('noContractListeners')}
          stickyHeader={true}
        ></MediumCardTable>
      ),
    },
  ];

  // Medium Card UseEffect
  useEffect(() => {
    if (isMounted) {
      fetchCatcher(
        `${FF_Paths.nsPrefix}/${selectedNamespace}${FF_Paths.contractInterfaces}?limit=25`
      )
        .then((interfaces: IContractInterface[]) => {
          isMounted && setContractInterfaces(interfaces);
        })
        .catch((err) => {
          reportFetchError(err);
        });
      fetchCatcher(
        `${FF_Paths.nsPrefix}/${selectedNamespace}${FF_Paths.contractListeners}?limit=25`
      )
        .then((listeners: IContractListener[]) => {
          isMounted && setContractListeners(listeners);
        })
        .catch((err) => {
          reportFetchError(err);
        });
    }
  }, [selectedNamespace, lastRefreshTime, isMounted]);

  // Histogram
  useEffect(() => {
    setIsHistLoading(true);
    const currentTime = dayjs().unix();

    isMounted &&
      dateFilter &&
      fetchCatcher(
        `${FF_Paths.nsPrefix}/${selectedNamespace}${FF_Paths.chartsHistogram(
          BucketCollectionEnum.BlockchainEvents,
          dateFilter.filterTime,
          currentTime,
          BucketCountEnum.Small
        )}`
      )
        .then((histTypes: IMetric[]) => {
          isMounted && setBeHistData(makeBlockchainEventHistogram(histTypes));
        })
        .catch((err) => {
          reportFetchError(err);
        })
        .finally(() => setIsHistLoading(false));
  }, [selectedNamespace, lastRefreshTime, dateFilter, isMounted]);

  const beColHeaders = [
    t('name'),
    t('id'),
    t('protocolID'),
    t('source'),
    t('timestamp'),
  ];
  const beRecords: IDataTableRecord[] | undefined = blockchainEvents?.map(
    (be) => ({
      key: be.id,
      columns: [
        {
          value: <FFTableText color="primary" text={be.name} />,
        },
        {
          value: <HashPopover shortHash={true} address={be.id}></HashPopover>,
        },
        {
          value: <FFTableText color="primary" text={be.protocolId} />,
        },
        {
          value: <FFTableText color="primary" text={be.source} />,
        },
        {
          value: (
            <FFTableText color="secondary" text={getFFTime(be.timestamp)} />
          ),
        },
      ],
      leftBorderColor: FFColors.Yellow,
    })
  );

  // Recent blockchain events
  useEffect(() => {
    isMounted &&
      dateFilter &&
      fetchCatcher(
        `${FF_Paths.nsPrefix}/${selectedNamespace}${
          FF_Paths.blockchainEvents
        }?limit=${rowsPerPage}&count&skip=${rowsPerPage * currentPage}${
          dateFilter.filterString
        }`
      )
        .then((blockchainEvents: IPagedBlockchainEventResponse) => {
          if (isMounted) {
            setBlockchainEvents(blockchainEvents.items);
            setBlockchainEventsTotal(blockchainEvents.total);
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
    lastRefreshTime,
    isMounted,
  ]);

  return (
    <>
      <Header
        title={t('dashboard')}
        subtitle={t('blockchain')}
        showRefreshBtn={hasBlockchainEvent(newEvents)}
        onRefresh={clearNewEvents}
      ></Header>
      <Grid container px={DEFAULT_PADDING}>
        <Grid container item wrap="nowrap" direction="column">
          {/* Small Cards */}
          <Grid
            spacing={DEFAULT_SPACING}
            container
            item
            direction="row"
            pb={DEFAULT_PADDING}
          >
            {smallCards.map((card) => {
              return (
                <Grid
                  key={card.header}
                  xs={DEFAULT_PADDING}
                  direction="column"
                  alignItems="center"
                  justifyContent="center"
                  container
                  item
                >
                  <SmallCard card={card} />
                </Grid>
              );
            })}
          </Grid>
          {/* Medium Cards */}
          <Grid
            spacing={DEFAULT_SPACING}
            container
            justifyContent="center"
            alignItems="flex-start"
            direction="row"
            pb={DEFAULT_PADDING}
          >
            {mediumCards.map((card) => {
              return (
                <Grid
                  key={card.headerText}
                  direction="column"
                  justifyContent="center"
                  container
                  item
                  xs={4}
                >
                  <FireFlyCard card={card} position="flex-start" />
                </Grid>
              );
            })}
          </Grid>
          <DataTable
            header={t('recentBlockchainEvents')}
            onHandleCurrPageChange={(currentPage: number) =>
              setCurrentPage(currentPage)
            }
            onHandleRowsPerPage={(rowsPerPage: number) =>
              setRowsPerPage(rowsPerPage)
            }
            stickyHeader={true}
            minHeight="300px"
            maxHeight="calc(100vh - 800px)"
            records={beRecords}
            columnHeaders={beColHeaders}
            paginate={true}
            emptyStateText={t('noBlockchainEvents')}
            dataTotal={blockchainEventsTotal}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            dashboardSize
            headerBtn={
              <IconButton onClick={() => navigate(EVENTS_PATH)}>
                <ArrowForwardIcon />
              </IconButton>
            }
          />
        </Grid>
      </Grid>
    </>
  );
};
