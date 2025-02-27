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
import { useParams } from 'react-router-dom';
import { ApplicationContext } from '../../contexts/ApplicationContext';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import {
  FF_NAV_PATHS,
  IBlockchainEvent,
  IOperation,
  ITokenTransfer,
  ITxStatus,
} from '../../interfaces';
import { FF_Paths } from '../../interfaces/constants';
import { FF_TRANSFER_CATEGORY_MAP } from '../../interfaces/enums';
import { DEFAULT_PADDING } from '../../theme';
import { fetchCatcher } from '../../utils';
import { BlockchainEventAccordion } from '../Accordions/BlockchainEventAccordion';
import { OperationAccordion } from '../Accordions/OperationAccordion';
import { TransferList } from '../Lists/TransferList';
import { DisplaySlide } from './DisplaySlide';
import { SlideHeader } from './SlideHeader';
import { SlideSectionHeader } from './SlideSectionHeader';

interface Props {
  transfer: ITokenTransfer;
  open: boolean;
  onClose: () => void;
}

export const TransferSlide: React.FC<Props> = ({ transfer, open, onClose }) => {
  const { t } = useTranslation();
  const { selectedNamespace } = useContext(ApplicationContext);
  const { reportFetchError } = useContext(SnackbarContext);
  const { poolID } = useParams<{ poolID: string }>();

  const [transferBlockchainEvent, setTransferBlockchainEvent] =
    useState<IBlockchainEvent>();
  const [txOperations, setTxOperations] = useState<IOperation[]>([]);
  const [txStatus, setTxStatus] = useState<ITxStatus>();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    // Transaction Status
    isMounted &&
      transfer.tx.id &&
      fetchCatcher(
        `${
          FF_Paths.nsPrefix
        }/${selectedNamespace}${FF_Paths.transactionByIdStatus(transfer.tx.id)}`
      )
        .then((txStatus: ITxStatus) => {
          isMounted && setTxStatus(txStatus);
        })
        .catch((err) => {
          reportFetchError(err);
        });
    // Transaction Operations
    isMounted &&
      transfer.tx.id &&
      fetchCatcher(
        `${
          FF_Paths.nsPrefix
        }/${selectedNamespace}${FF_Paths.transactionByIdOperations(
          transfer.tx.id
        )}`
      )
        .then((txOperations: IOperation[]) => {
          isMounted && setTxOperations(txOperations);
        })
        .catch((err) => {
          reportFetchError(err);
        });
    // Transfer Blockchain Event
    isMounted &&
      transfer.tx.id &&
      fetchCatcher(
        `${
          FF_Paths.nsPrefix
        }/${selectedNamespace}${FF_Paths.blockchainEventsById(
          transfer.blockchainEvent
        )}`
      )
        .then((txBlockchainEvent: IBlockchainEvent) => {
          isMounted && setTransferBlockchainEvent(txBlockchainEvent);
        })
        .catch((err) => {
          reportFetchError(err);
        });
  }, [transfer, isMounted]);

  return (
    <>
      <DisplaySlide open={open} onClose={onClose}>
        <Grid container direction="column" p={DEFAULT_PADDING}>
          {/* Header */}
          <SlideHeader
            subtitle={t('tokenTransfer')}
            title={t(FF_TRANSFER_CATEGORY_MAP[transfer.type]?.nicename)}
          />
          {/* Data list */}
          <Grid container item>
            <TransferList
              transfer={transfer}
              txStatus={txStatus}
              showPoolLink={poolID !== transfer.pool}
            />
          </Grid>
          {/* Operations */}
          {txOperations.length > 0 && (
            <>
              <SlideSectionHeader
                clickPath={FF_NAV_PATHS.activityOpPath(
                  selectedNamespace,
                  transfer.tx.id
                )}
                title={t('operations')}
              />
              <Grid container item>
                {txOperations?.map((op, idx) => (
                  <OperationAccordion op={op} key={idx} />
                ))}
              </Grid>
            </>
          )}
          {/* Blockchain Events */}
          {transferBlockchainEvent && (
            <>
              <SlideSectionHeader
                clickPath={FF_NAV_PATHS.blockchainEventsPath(
                  selectedNamespace,
                  transfer.tx.id
                )}
                title={t('blockchainEvents')}
              />
              <Grid container item>
                <BlockchainEventAccordion be={transferBlockchainEvent} />
              </Grid>
            </>
          )}
        </Grid>
      </DisplaySlide>
    </>
  );
};
