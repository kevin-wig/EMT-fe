import React from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

import CommonSelect from '../Forms/CommonSelect';
import CommonTextField from '../Forms/CommonTextField';

const PREFIX = 'DataTable';
const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  titleWrapper: `${PREFIX}-title-wrapper`,
  table: `${PREFIX}-table`,
  tableWrapper: `${PREFIX}-table-wrapper`,
  head: `${PREFIX}-head`,
  body: `${PREFIX}-body`,
  empty: `${PREFIX}-empty`,
  limit: `${PREFIX}-per-page`,
  limitWrapper: `${PREFIX}-per-page-wrapper`,
  search: `${PREFIX}-search`,
  pagination: `${PREFIX}-pagination`,
  sortArrow: `${PREFIX}-sort-arrow`,
  label: `${PREFIX}-label`,
  sortable: `${PREFIX}-sortable`,
};

const Root = styled(Card)(({ theme }) => ({
  [`&.${classes.root}`]: {
    padding: '1.5rem 1.5rem',
    boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important',
    '& table, td, th': {
      border: '1px solid',
      borderColor: theme.palette.border.secondary,
    },
  },
  [`& .${classes.titleWrapper}`]: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: '0.75rem 0',
  },
  [`& .${classes.title}`]: {
    marginBottom: '2rem',
  },
  [`& .${classes.table}`]: {
    minWidth: '100%',
    marginBottom: '0.5rem',
    whiteSpace: 'nowrap',
    borderCollapse: 'collapse',
  },
  [`& .${classes.tableWrapper}`]: {
    width: '100%',
    marginBottom: '1rem',
    overflow: 'auto',
  },
  [`& .${classes.head}`]: {
    '& th': {
      textAlign: 'left',
      padding: '0.5rem',
      borderColor: 'inherit',

      '& p': {
        fontSize: '0.9rem',
        fontWeight: 'bold',
      },
    },
  },
  [`& .${classes.sortable}`]: {
    cursor: 'pointer',
  },
  [`& .${classes.body}`]: {
    '& tr': {
      '&:hover': {
        background: '#ededed',
      },
    },
    '& td': {
      textAlign: 'left',
      padding: '0.5rem',
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
  [`& .${classes.limitWrapper}`]: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  [`& .${classes.limit}`]: {
    width: '80px',
    marginRight: '1rem',
  },
  [`& .${classes.search}`]: {
    marginLeft: 'auto',
  },
  [`& .${classes.pagination}`]: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  [`& .${classes.label}`]: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  [`& .${classes.sortArrow}`]: {
    position: 'relative',
    width: '20px',
    height: '30px',
    color: theme.palette.border.secondary,
    '& svg': {
      position: 'absolute',
      '&.active': {
        color: theme.palette.text.primary,
      },
      '&:first-of-type': {
        top: '-1px',
      },
      '&:last-of-type': {
        bottom: '-1px',
      },
    },
  },
}));

const DataTable = ({
  title,
  columns,
  tableData,
  loading,
  isSearchable = true,
  search,
  order,
  sortBy,
  pagination: {
    totalCount,
    totalPages,
    page,
    limit,
  } = {
    totalCount: 0,
    totalPages: 1,
    page: 1,
    limit: 5,
  },
  onChangePage,
  onChangeLimit,
  onChangeSearch,
  onChangeSortBy,
  openFilterModal,
}) => {
  const location = useLocation();

  const handlePageChange = (event, value) => {
    onChangePage(value);
  };

  const handleLimitChange = (event) => {
    onChangeLimit(event.target.value);
    onChangePage(1);
  };

  const handleSearchChange = (event) => {
    onChangeSearch(event.target.value);
    onChangePage(1);
  };

  const handleSortChange = (value) => {
    onChangeSortBy(value);
  };

  return (
    <Root className={classes.root}>
      {(title || openFilterModal) && (
        <Box className={classes.titleWrapper}>
          {openFilterModal && (
            <Button variant="contained" startIcon={<FilterAltIcon />} onClick={openFilterModal}>Filter</Button>
          )}
          {title && (
            <Typography component="p" className={classes.title}>{title}</Typography>
          )}
        </Box>
      )}
      <Box className={classes.limitWrapper}>
        <CommonSelect
          className={classes.limit}
          value={limit}
          options={[
            { value: 5, label: '5' },
            { value: 10, label: '10' },
            { value: 25, label: '25' },
            { value: 50, label: '50' },
          ]}
          onChange={handleLimitChange}
        />
        entries per page
        {isSearchable && (
          <CommonTextField
            id={`${title}_input`}
            className={classes.search}
            placeholder="Search..."
            value={search}
            onChange={handleSearchChange}
          />
        )}
      </Box>
      <Box className={classes.tableWrapper}>
        <table className={classes.table}>
          <thead className={classes.head}>
          <tr>
            {columns.map((column, key) => (
              <th
                key={key}
                className={column.sortable ? classes.sortable : ''}
                onClick={() => column.sortable && handleSortChange(column.key)}
              >
                <Box className={classes.label}>
                  <Typography>
                    {column.title}
                  </Typography>
                  {column.sortable && (
                    <Box className={classes.sortArrow}>
                      <ArrowDropUpIcon className={(order === 'ASC' && sortBy === column.key) ? 'active' : ''} />
                      <ArrowDropDownIcon className={(order === 'DESC' && sortBy === column.key) ? 'active' : ''} />
                    </Box>
                  )}
                </Box>
              </th>
            ))
            }
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
                  {
                    column.render
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
      </Box>
      <Box className={classes.pagination}>
        <Typography>
          {totalCount > 0 && `Showing ${(page - 1) * limit + 1} to ${(page - 1) * limit + tableData?.length} of ${totalCount} entries`}
        </Typography>
        <Pagination count={totalPages} shape="rounded" page={page} onChange={handlePageChange} />
      </Box>
    </Root>
  );
};

export default DataTable;
