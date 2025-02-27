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
import { Grid, IconButton, Paper, Typography } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FFBreadcrumb } from '../../../components/Breadcrumbs/FFBreadcrumb';
import { FFCopyButton } from '../../../components/Buttons/CopyButton';
import { EventCardWrapper } from '../../../components/Cards/EventCards/EventCardWrapper';
import { OpCardWrapper } from '../../../components/Cards/EventCards/OpCardWrapper';
import { FireFlyCard } from '../../../components/Cards/FireFlyCard';
import { Header } from '../../../components/Header';
import { TxList } from '../../../components/Lists/TxList';
import { FFCircleLoader } from '../../../components/Loaders/FFCircleLoader';
import { EventSlide } from '../../../components/Slides/EventSlide';
import { OperationSlide } from '../../../components/Slides/OperationSlide';
import { ApplicationContext } from '../../../contexts/ApplicationContext';
import { SlideContext } from '../../../contexts/SlideContext';
import { SnackbarContext } from '../../../contexts/SnackbarContext';
import {
  FF_NAV_PATHS,
  FF_Paths,
  IEvent,
  IFFBreadcrumb,
  IFireFlyCard,
  IOperation,
  ITransaction,
  ITxStatus,
} from '../../../interfaces';
import { FF_TX_CATEGORY_MAP } from '../../../interfaces/enums/transactionTypes';
import { DEFAULT_BORDER_RADIUS, DEFAULT_PADDING } from '../../../theme';
import { fetchCatcher, getShortHash } from '../../../utils';

export const TransactionDetails: () => JSX.Element = () => {
  const { selectedNamespace } = useContext(ApplicationContext);
  const { slideID, setSlideSearchParam } = useContext(SlideContext);
  const { reportFetchError } = useContext(SnackbarContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMounted, setIsMounted] = useState(false);

  const { txID } = useParams<{ txID: string }>();
  // Transactions
  const [tx, setTx] = useState<ITransaction>();

  const [txEvents, setTxEvents] = useState<IEvent[]>([]);
  const [txOperations, setTxOperations] = useState<IOperation[]>([]);
  const [txStatus, setTxStatus] = useState<ITxStatus>();
  const [viewEvent, setViewEvent] = useState<IEvent | undefined>(
    location.state as IEvent
  );
  const [viewOp, setViewOp] = useState<IOperation>();

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (isMounted && slideID) {
      fetchCatcher(
        `${FF_Paths.nsPrefix}/${selectedNamespace}${FF_Paths.events}?id=${slideID}`
      ).then((eventRes: IEvent[]) => {
        isMounted && eventRes.length > 0 && setViewEvent(eventRes[0]);
      });
      fetchCatcher(
        `${FF_Paths.nsPrefix}/${selectedNamespace}${FF_Paths.operations}?id=${slideID}`
      ).then((opRes: IOperation[]) => {
        isMounted && opRes.length > 0 && setViewOp(opRes[0]);
      });
    }
  }, [slideID, isMounted]);

  // Transaction details
  useEffect(() => {
    if (txID && isMounted) {
      fetchCatcher(
        `${FF_Paths.nsPrefix}/${selectedNamespace}${FF_Paths.transactionById(
          txID
        )}`
      )
        .then((tx: ITransaction) => {
          isMounted && setTx(tx);
        })
        .catch((err) => {
          reportFetchError(err);
        });
      // Transaction Status
      fetchCatcher(
        `${
          FF_Paths.nsPrefix
        }/${selectedNamespace}${FF_Paths.transactionByIdStatus(txID)}`
      )
        .then((txStatus: ITxStatus) => {
          isMounted && setTxStatus(txStatus);
        })
        .catch((err) => {
          reportFetchError(err);
        });
      // Transaction Operations
      fetchCatcher(
        `${
          FF_Paths.nsPrefix
        }/${selectedNamespace}${FF_Paths.transactionByIdOperations(txID)}`
      )
        .then((txOperations: IOperation[]) => {
          isMounted && setTxOperations(txOperations);
        })
        .catch((err) => {
          reportFetchError(err);
        });
      // Transaction events
      fetchCatcher(
        `${FF_Paths.nsPrefix}/${selectedNamespace}${FF_Paths.events}?tx=${txID}&fetchreferences`
      )
        .then((events: IEvent[]) => {
          isMounted && setTxEvents(events);
        })
        .catch((err) => {
          reportFetchError(err);
        });
    }
  }, [txID, isMounted]);

  const breadcrumbs: IFFBreadcrumb[] = [
    {
      link: FF_NAV_PATHS.activityTxPath(selectedNamespace),
      content: t('transactions'),
    },
    {
      content: (
        <>
          {getShortHash(txID ?? '')}
          <FFCopyButton value={txID ?? ''} />
        </>
      ),
    },
  ];

  const operationsCard: IFireFlyCard = {
    headerText: t('blockchainOperations'),
    headerComponent: (
      <IconButton
        onClick={() =>
          navigate(FF_NAV_PATHS.activityOpPath(selectedNamespace, tx?.id))
        }
      >
        <ArrowForwardIcon />
      </IconButton>
    ),
    component: (
      <>
        {!txOperations ? (
          <FFCircleLoader color="warning" />
        ) : (
          txOperations.map((op, idx) => (
            <React.Fragment key={idx}>
              <OpCardWrapper
                onHandleViewOp={(op: IOperation) => {
                  setViewOp(op);
                  setSlideSearchParam(op.id);
                }}
                {...{ op }}
              />
              <Grid sx={{ padding: '6px' }} />
            </React.Fragment>
          ))
        )}
      </>
    ),
  };

  const networkEventsCard: IFireFlyCard = {
    headerText: t('events'),
    headerComponent: (
      <IconButton
        onClick={() =>
          navigate(FF_NAV_PATHS.activityEventsPath(selectedNamespace, tx?.id))
        }
      >
        <ArrowForwardIcon />
      </IconButton>
    ),
    component: (
      <>
        {!txEvents ? (
          <FFCircleLoader color="warning" />
        ) : (
          txEvents.map((event, idx) => (
            <React.Fragment key={idx}>
              <EventCardWrapper
                onHandleViewEvent={(event: IEvent) => {
                  setViewEvent(event);
                  setSlideSearchParam(event.id);
                }}
                {...{ event }}
              />
              <Grid sx={{ padding: '6px' }} />
            </React.Fragment>
          ))
        )}
      </>
    ),
  };

  return (
    <>
      <Header
        title={<FFBreadcrumb breadcrumbs={breadcrumbs} />}
        subtitle={t('activity')}
      ></Header>
      <Grid container px={DEFAULT_PADDING}>
        {/* Left hand side */}
        <Grid
          container
          item
          direction="row"
          justifyContent="flex-center"
          alignItems="flex-start"
          xs={6}
          pr={DEFAULT_PADDING}
        >
          {/* TX Card */}
          {tx && (
            <Paper
              elevation={0}
              sx={{
                width: '100%',
                backgroundColor: 'background.paper',
                padding: DEFAULT_PADDING,
                borderRadius: DEFAULT_BORDER_RADIUS,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 'bold',
                  fontSize: '14',
                }}
                pb={1}
              >
                {t(FF_TX_CATEGORY_MAP[tx.type]?.nicename)}
              </Typography>
              <TxList tx={tx} txStatus={txStatus} showTxLink={false} />
            </Paper>
          )}
          <Grid
            container
            item
            direction="row"
            justifyContent="flex-center"
            alignItems="flex-start"
            pt={DEFAULT_PADDING}
            overflow={'auto'}
            height="100%"
          >
            {/* Operations */}
            <Grid
              direction="column"
              alignItems="center"
              justifyContent="center"
              container
              item
              height="100%"
            >
              <FireFlyCard height="100%" card={operationsCard} />
            </Grid>
          </Grid>
        </Grid>
        {/* Right hand side */}
        <Grid
          pl={DEFAULT_PADDING}
          container
          item
          direction="row"
          justifyContent="flex-center"
          alignItems="flex-start"
          xs={6}
          overflow={'auto'}
          height="calc(100vh - 250px)"
        >
          {/* Events */}
          <Grid
            direction="column"
            alignItems="center"
            justifyContent="center"
            container
            item
          >
            <FireFlyCard height="100%" card={networkEventsCard} />
          </Grid>
        </Grid>
      </Grid>
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
      {viewOp && (
        <OperationSlide
          op={viewOp}
          open={!!viewOp}
          onClose={() => {
            setViewOp(undefined);
            setSlideSearchParam(null);
          }}
        />
      )}
    </>
  );
};
