import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Grid,
  makeStyles,
} from '@material-ui/core';
import { IDataTableRecord } from '../../interfaces';
import { DataTableRow } from './DataTableRow';

interface Props {
  records?: IDataTableRecord[];
  columnHeaders?: string[];
  stickyHeader?: boolean;
  pagination?: JSX.Element;
  header?: string;
  height?: string;
  maxHeight?: string;
}

export const DataTable: React.FC<Props> = ({
  records,
  columnHeaders,
  stickyHeader,
  pagination,
  header,
  height,
  maxHeight,
}) => {
  const classes = useStyles();

  return (
    <>
      {header && (
        <Grid>
          <Typography className={classes.header}>{header}</Typography>
        </Grid>
      )}
      <Grid item xs={12}>
        <TableContainer
          style={{ maxHeight, height }}
          className={classes.tableContainer}
        >
          <Table stickyHeader={stickyHeader}>
            <TableHead>
              <TableRow>
                {columnHeaders?.map((header, index) => (
                  <TableCell className={classes.cell} key={index}>
                    <Typography className={classes.tableHeader} noWrap>
                      {header}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {records?.map((record) => (
                <DataTableRow key={record.key} {...{ record }} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {pagination}
      </Grid>
    </>
  );
};

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    whiteSpace: 'nowrap',
  },
  cell: {
    borderBottom: 0,
    color: theme.palette.text.secondary,
  },
  header: {
    fontWeight: 'bold',
  },
  tableHeader: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
}));
