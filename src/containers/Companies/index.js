import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import moment from 'moment';

import { useCompany } from '../../context/company.context';
import { useDebounce } from '../../hooks/use-debounce';
import CommonButton from '../../components/Buttons/CommonButton';
import DataTable from '../../components/Table/DataTable';
import { SUPER_ADMIN } from '../../constants/UserRoles';
import { useAuth } from '../../context/auth.context';
import Modal from '../../components/Modals/Modal';

const PREFIX = 'Companies';
const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  action: `${PREFIX}-action`,
  deleteMsg: `${PREFIX}-deleteMsg`,
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.root}`]: {},
  [`& .${classes.title}`]: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '1.5rem',
    marginBottom: '1.5rem',
  },
  [`& .${classes.action}`]: {
    height: '2rem',
    minWidth: '2rem',
    padding: '0',
    borderRadius: '50%',
    color: theme.palette.surface[0],
    '&:not(:last-of-type)': {
      marginRight: '0.5rem !important',
    },
    '&.view': {
      background: theme.palette.primary.main,
    },
    '&.delete': {
      background: theme.palette.error.main,
    },
    [theme.breakpoints.down('md')]: {
      marginLeft: '0 !important',
      marginRight: '1.5rem !important',
      order: '1 !important',
    },
  },
}));

const DeleteMsg = styled('p')(() => ({
  [`&.${classes.deleteMsg}`]: {
    margin: 0,
    fontSize: '1rem',
  },
}));

const Companies = () => {
  const { me } = useAuth();
  const { companies, getCompaniesList, pagination, removeCompany, setFilterCompany } = useCompany();
  const history = useHistory();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('DESC');
  const [deletingCompany, setDeletingCompany] = useState();

  const debouncedSearchWord = useDebounce(search, 300);

  const fetchCompaniesList = useCallback(() => {
    let params = { order, sortBy, page, limit };

    if (search) {
      params = { ...params, search: debouncedSearchWord };
    }

    getCompaniesList(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchWord, page, order, sortBy, limit]);

  useEffect(() => {
    fetchCompaniesList();
  }, [fetchCompaniesList]);

  const columns = [
    {
      title: 'Name',
      key: 'name',
      link: true,
      sortable: true,
    },
    {
      title: 'Contact Email',
      key: 'primaryContactEmailAddress',
      sortable: true,
    },
    {
      title: 'Contact Package Type',
      key: 'packageType',
      sortable: true,
    },
    {
      title: 'Created At',
      key: 'createdAt',
      sortable: true,
      render: (data) => moment(data?.createdAt).format('DD.MM.YYYY HH:mm'),
    },
  ];
  
  if (me?.userRole?.role === SUPER_ADMIN) {
    columns.push(
      {
        title: 'Actions',
        key: 'actions',
        render: ((data) => (
            <>
              <Button className={`${classes.action} view`} onClick={() => history.push(`/companies/${data.id}`)}>
                <EditIcon />
              </Button>
              <Button className={`${classes.action} delete`} onClick={() => handleDelete(data.id)}>
                <DeleteIcon />
              </Button>
            </>
          )
        ),
      },
    );
  }

  const handleDelete = (id) => {
    setDeletingCompany(id);
  };

  const deleteUser = useCallback((isDelete) => {
    if (isDelete) {
      removeCompany(deletingCompany).then(() => {
        setFilterCompany(companies[0]?.id);
        fetchCompaniesList();
      });
    }
    setDeletingCompany(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletingCompany, fetchCompaniesList]);

  const handleChangeSort = (value) => {
    if (value === sortBy) {
      setOrder(order === 'DESC' ? 'ASC' : 'DESC');
    } else {
      setSortBy(value);
      setOrder('ASC');
    }
  };

  return (
    <Root className={classes.root}>
      <Box className={classes.title}>
        <Typography variant="title">Companies</Typography>
        {[SUPER_ADMIN].includes(me.userRole.role) && <CommonButton onClick={() => history.push('/companies/create')}>Create company</CommonButton>}
      </Box>
      <DataTable
        columns={columns}
        tableData={companies}
        search={search}
        order={order}
        sortBy={sortBy}
        pagination={pagination}
        onChangePage={setPage}
        onChangeLimit={setLimit}
        onChangeSearch={setSearch}
        onChangeSortBy={handleChangeSort}
      />
      {!!deletingCompany && (
        <Modal open title="Company Deletion" handleCloseModal={deleteUser}>
          <DeleteMsg className={classes.deleteMsg}>Are you sure to delete this company?</DeleteMsg>
        </Modal>
      )}
    </Root>
  );
};

export default Companies;
