import { Chip } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApplicationContext } from '../../contexts/ApplicationContext';
import { IOperation, OpStatusColorMap } from '../../interfaces';
import { IDataListItem } from '../../interfaces/lists';
import { FFCopyButton } from '../Buttons/CopyButton';
import { TxButton } from '../Buttons/TxButton';
import { FFCircleLoader } from '../Loaders/FFCircleLoader';
import { FFListItem } from './FFListItem';
import { FFListText } from './FFListText';
import { FFListTimestamp } from './FFListTimestamp';
import { FFSkeletonList } from './FFSkeletonList';

interface Props {
  op?: IOperation;
  showTxLink?: boolean;
}

export const OperationList: React.FC<Props> = ({ op, showTxLink = true }) => {
  const { selectedNamespace } = useContext(ApplicationContext);
  const { t } = useTranslation();
  const [dataList, setDataList] = useState<IDataListItem[]>(FFSkeletonList);

  useEffect(() => {
    if (op) {
      setDataList([
        {
          label: t('id'),
          value: <FFListText color="primary" text={op.id} />,
          button: <FFCopyButton value={op.id} />,
        },
        {
          label: t('transactionID'),
          value: <FFListText color="primary" text={op.tx} />,
          button: (
            <>
              {showTxLink && (
                <TxButton ns={selectedNamespace} txID={op.tx ?? ''} />
              )}
              <FFCopyButton value={op.tx ?? ''} />
            </>
          ),
        },
        {
          label: t('plugin'),
          value: <FFListText color="primary" text={op.plugin} />,
        },
        {
          label: t('status'),
          value: op.status && (
            // TODO: Fix when https://github.com/hyperledger/firefly/issues/628 is resolved
            <Chip
              label={
                op.status?.toLocaleUpperCase() === 'PENDING'
                  ? 'SUCCEEDED'
                  : op.status?.toLocaleUpperCase()
              }
              sx={{
                backgroundColor:
                  OpStatusColorMap[
                    op.status === 'Pending' ? 'Succeeded' : op.status
                  ],
              }}
            ></Chip>
          ),
        },
        {
          label: t('updated'),
          value: <FFListTimestamp ts={op.updated} />,
        },
      ]);
    }
  }, [op]);

  return (
    <>
      {!op ? (
        <FFCircleLoader color="warning" />
      ) : (
        <>
          {dataList.map((d, idx) => (
            <FFListItem key={idx} item={d} />
          ))}
        </>
      )}
    </>
  );
};
