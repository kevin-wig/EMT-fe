import React from 'react';
import { useLocation } from 'react-router';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import { Link } from 'react-router-dom';

const PREFIX = 'Table';
const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  table: `${PREFIX}-table`,
  tableWrapper: `${PREFIX}-table-wrapper`,
  head: `${PREFIX}-head`,
  body: `${PREFIX}-body`,
  empty: `${PREFIX}-empty`,
};

const Root = styled(Card)(({ theme }) => ({
  [`&.${classes.root}`]: {
    boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important',
    padding: '0.5rem',
  },
  [`& .${classes.title}`]: {
    padding: '0.75rem 1.5rem',
    margin: '0',
  },
  [`& .${classes.table}`]: {
    padding: '1.5rem',
    minWidth: '100%',
    marginBottom: '1rem',
    borderSpacing: '0',
    whiteSpace: 'nowrap',
  },
  [`& .${classes.tableWrapper}`]: {
    width: '100%',
    overflow: 'auto',
  },
  [`& .${classes.head}`]: {
    '& th': {
      textAlign: 'left',
      padding: '0.5rem',
      borderBottom: '1px solid',
      borderColor: 'inherit',
      fontSize: '0.9rem',
    },
  },
  [`& .${classes.body}`]: {
    '& td': {
      textAlign: 'left',
      padding: '0.5rem',
      borderBottom: '1px solid',
      borderColor: theme.palette.border.secondary,
      fontSize: '0.9rem',
      '& a': {
        textDecoration: 'none',
        color: '#247aff',
        '&:hover': {
          color: '#1d62cc',
        },
      },
    },

    '& .MuiCircularProgress-svg': {
      color: '#ced4da',
    },
  },
  [`& .${classes.empty}`]: {
    textAlign: 'center !important',
    padding: '1rem !important',
  },
}));

const DataList = ({
  title,
  columns,
  tableData,
  loading,
}) => {
  const location = useLocation();

  return (
    <Root className={classes.root}>
      <p className={classes.title}>{title}</p>
      <div className={classes.tableWrapper}>
        <table className={classes.table}>
          <thead className={classes.head}>
          <tr>
            {columns.map((column, key) => (
              <th key={key}>
                {column.title}
              </th>
            ))}
          </tr>
          </thead>
          <tbody className={classes.body}>
          {loading && (
            <tr>
              <td colSpan={columns.length} className={classes.empty}>
                <CircularProgress size={40} />
              </td>
            </tr>
          )}

          {!loading && tableData && tableData.map((row, key) => (
            <tr key={key}>
              {columns.map((column, columnKey) => (
                <td key={columnKey}>
                  {column.render
                    ? column.render(row)
                    : !column.link
                      ? (
                          column.fixed
                            ? (row[column.key] ? parseFloat(row[column.key]).toFixed(3) : parseFloat(0).toFixed(3))
                            : row[column.key]
                        )
                      : <Link to={`${location.pathname}/${row.id}`}>{row[column.key]}</Link>
                  }
                </td>
              ))}
            </tr>
          ))}
          {!loading && (!tableData || tableData.length === 0) && (
            <tr>
              <td colSpan={columns.length} className={classes.empty}>
                No data found
              </td>
            </tr>
          )}
          </tbody>
        </table>
      </div>
    </Root>
  );
};

export default DataList;
