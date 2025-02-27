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

import { Box, Grid } from '@mui/material';
import { BarDatum } from '@nivo/bar';
import dayjs from 'dayjs';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Histogram } from '../../../components/Charts/Histogram';
import { FilterButton } from '../../../components/Filters/FilterButton';
import { FilterModal } from '../../../components/Filters/FilterModal';
import { Header } from '../../../components/Header';
import { ChartTableHeader } from '../../../components/Headers/ChartTableHeader';
import { HashPopover } from '../../../components/Popovers/HashPopover';
import { EventSlide } from '../../../components/Slides/EventSlide';
import { FFTableText } from '../../../components/Tables/FFTableText';
import { DataTable } from '../../../components/Tables/Table';
import { ApplicationContext } from '../../../contexts/ApplicationContext';
import { DateFilterContext } from '../../../contexts/DateFilterContext';
import { FilterContext } from '../../../contexts/FilterContext';
import { SlideContext } from '../../../contexts/SlideContext';
import { SnackbarContext } from '../../../contexts/SnackbarContext';
import {
  BucketCollectionEnum,
  BucketCountEnum,
  EventFilters,
  FF_EVENTS_CATEGORY_MAP,
  FF_Paths,
  getEnrichedEventText,
  IDataTableRecord,
  IEvent,
  IMetric,
  IPagedEventResponse,
} from '../../../interfaces';
import {
  DEFAULT_HIST_HEIGHT,
  DEFAULT_PADDING,
  DEFAULT_PAGE_LIMITS,
} from '../../../theme';
import { fetchCatcher, getFFTime, makeEventHistogram } from '../../../utils';
import {
  isHistogramEmpty,
  makeColorArray,
  makeKeyArray,
} from '../../../utils/charts';

export const ActivityEvents: () => JSX.Element = () => {
  const { newEvents, lastRefreshTime, clearNewEvents, selectedNamespace } =
    useContext(ApplicationContext);
  const { dateFilter } = useContext(DateFilterContext);
  const { filterAnchor, setFilterAnchor, filterString } =
    useContext(FilterContext);
  const { slideID, setSlideSearchParam } = useContext(SlideContext);
  const { reportFetchError } = useContext(SnackbarContext);
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  // Events
  const [events, setEvents] = useState<IEvent[]>();
  // Event totals
  const [eventTotal, setEventTotal] = useState(0);
  // Event types histogram
  const [eventHistData, setEventHistData] = useState<BarDatum[]>();
  // View transaction slide out
  const [viewEvent, setViewEvent] = useState<IEvent | undefined>();
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_LIMITS[1]);
  const [isHistLoading, setIsHistLoading] = useState(false);

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
        `${FF_Paths.nsPrefix}/${selectedNamespace}${FF_Paths.eventsById(
          slideID
        )}`
      )
        .then((eventRes: IEvent) => {
          setViewEvent(eventRes);
        })
        .catch((err) => {
          reportFetchError(err);
        });
  }, [slideID, isMounted]);

  // Events list
  useEffect(() => {
    isMounted &&
      dateFilter &&
      fetchCatcher(
        `${FF_Paths.nsPrefix}/${selectedNamespace}${
          FF_Paths.events
        }?limit=${rowsPerPage}&fetchreferences&count&skip=${
          rowsPerPage * currentPage
        }${dateFilter.filterString}${filterString ?? ''}`
      )
        .then((eventRes: IPagedEventResponse) => {
          if (isMounted) {
            setEvents(eventRes.items);
            setEventTotal(eventRes.total);
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
    lastRefreshTime,
  ]);

  // Histogram
  useEffect(() => {
    setIsHistLoading(true);
    const currentTime = dayjs().unix();
    isMounted &&
      dateFilter &&
      fetchCatcher(
        `${FF_Paths.nsPrefix}/${selectedNamespace}${FF_Paths.chartsHistogram(
          BucketCollectionEnum.Events,
          dateFilter.filterTime,
          currentTime,
          BucketCountEnum.Large
        )}`
      )
        .then((histTypes: IMetric[]) => {
          isMounted && setEventHistData(makeEventHistogram(histTypes));
        })
        .catch((err) => {
          setEventHistData([]);
          reportFetchError(err);
        })
        .finally(() => setIsHistLoading(false));
  }, [selectedNamespace, dateFilter, isMounted, lastRefreshTime]);

  const eventsColumnHeaders = [
    t('type'),
    t('details'),
    t('id'),
    t('reference'),
    t('transactionID'),
    t('created'),
  ];

  const eventsRecords: IDataTableRecord[] | undefined = events?.map(
    (event) => ({
      key: event.id,
      columns: [
        {
          value: (
            <FFTableText
              color="primary"
              text={t(FF_EVENTS_CATEGORY_MAP[event.type]?.nicename)}
            />
          ),
        },
        {
          value: (
            <FFTableText color="secondary" text={getEnrichedEventText(event)} />
          ),
        },
        {
          value: (
            <HashPopover shortHash={true} address={event.id}></HashPopover>
          ),
        },
        {
          value: (
            <HashPopover
              shortHash={true}
              address={event.reference}
            ></HashPopover>
          ),
        },
        {
          value: (
            <HashPopover shortHash={true} address={event.tx}></HashPopover>
          ),
        },
        {
          value: (
            <FFTableText color="secondary" text={getFFTime(event.created)} />
          ),
        },
      ],
      onClick: () => {
        setViewEvent(event);
        setSlideSearchParam(event.id);
      },
      leftBorderColor: FF_EVENTS_CATEGORY_MAP[event.type]?.color,
    })
  );

  return (
    <>
      <Header
        title={t('events')}
        subtitle={t('activity')}
        showRefreshBtn={newEvents.length > 0}
        onRefresh={clearNewEvents}
      ></Header>
      <Grid container px={DEFAULT_PADDING}>
        <Grid container item wrap="nowrap" direction="column">
          <ChartTableHeader
            title={t('allEvents')}
            filter={
              <FilterButton
                onSetFilterAnchor={(e: React.MouseEvent<HTMLButtonElement>) =>
                  setFilterAnchor(e.currentTarget)
                }
              />
            }
          />
          <Box height={DEFAULT_HIST_HEIGHT}>
            <Histogram
              colors={makeColorArray(FF_EVENTS_CATEGORY_MAP)}
              data={eventHistData}
              indexBy="timestamp"
              keys={makeKeyArray(FF_EVENTS_CATEGORY_MAP)}
              includeLegend={true}
              emptyText={t('noEvents')}
              isLoading={isHistLoading}
              isEmpty={isHistogramEmpty(eventHistData ?? [])}
            />
          </Box>
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
            records={eventsRecords}
            columnHeaders={eventsColumnHeaders}
            paginate={true}
            emptyStateText={t('noEventsToDisplay')}
            dataTotal={eventTotal}
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
          fields={EventFilters}
        />
      )}
      {viewEvent && (
        <EventSlide
          event={viewEvent}
          open={!!viewEvent}
          onClose={() => {
            setViewEvent(undefined);
            setSlideSearchParam(null);
          }}
        />
      )}
    </>
  );
};
