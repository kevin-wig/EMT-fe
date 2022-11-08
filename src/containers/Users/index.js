/* eslint-disable react-hooks/exhaustive-deps */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';

import { useUser } from '../../context/user.context';
import { useAuth } from '../../context/auth.context';
import { useDebounce } from '../../hooks/use-debounce';
import { useCompany } from '../../context/company.context';
import CommonButton from '../../components/Buttons/CommonButton';
import CommonSelect from '../../components/Forms/CommonSelect';
import DataTable from '../../components/Table/DataTable';
import { COMPANY_EDITOR, SUPER_ADMIN, UserRoles } from '../../constants/UserRoles';
import Modal from '../../components/Modals/Modal';
import moment from 'moment';

const PREFIX = 'Users';
const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  filter: `${PREFIX}-filter`,
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
  [`& .${classes.filter}`]: {
    marginRight: '1rem',
    marginBottom: '1rem',
  },
  [classes.deleteMsg]: {
    fontSize: '1.5rem',
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

const Users = () => {
  const { me } = useAuth();
  const { users, removeUser, getUsersList, pagination } = useUser();
  const { companies, getCompanies, filterCompany } = useCompany();
  const history = useHistory();

  const [, setTableData] = useState([]);
  const [deletingUser, setDeletingUser] = useState();
  const [companyId, setCompanyId] = useState(-1);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('DESC');

  const debouncedSearchWord = useDebounce(search, 300);

  const companyFilters = useMemo(() => {
    const all = { name: 'All companies', id: -1 };
    if (companies?.length > 0) {
      return [all, ...companies];
    } else {
      return [all];
    }
  }, [companies]);

  useEffect(() => {
    getUsersList({ page, limit });
    if (me?.userRole?.role === SUPER_ADMIN) {
      getCompanies().then(() => {
        setCompanyId(filterCompany);
      });
    }
  }, []);

  useEffect(() => {
    if (users?.length > 0) {
      setTableData(users.map((data) => {
        return {
          name: `${data.firstname} ${data.lastname}`,
          companyName: data.company?.name,
          role: data.userRole?.role, ...data,
        };
      }));
    } else {
      setTableData(null);
    }
  }, [users]);

  const fetchUsersList = useCallback(() => {
    let params = { order, sortBy, page, limit };

    if (companyId !== -1) {
      params = { ...params, companyId };
    }

    if (search) {
      params = { ...params, search: debouncedSearchWord };
    }

    getUsersList(params);
  }, [debouncedSearchWord, companyId, page, order, sortBy, limit]);

  useEffect(() => {
    fetchUsersList();
  }, [fetchUsersList]);

  const columns = [
    {
      title: 'Name',
      key: 'firstname',
      render: ((data) => (
          [SUPER_ADMIN, COMPANY_EDITOR].includes(me.userRole.role) || me?.id === data.id
            ? <Link to={`users/${data.id}`}>{`${data.firstname} ${data.lastname}`}</Link>
            : <>{`${data.firstname} ${data.lastname}`}</>
        )
      ),
      sortable: true,
    },
    {
      title: 'Email',
      key: 'email',
      sortable: true,
    },
    {
      title: 'Company',
      key: 'company',
      sortable: true,
    },
    {
      title: 'Role',
      key: 'userRole',
      render: (data) => UserRoles[data.userRole] || 'Unknown',
      sortable: true,
    },
    {
      title: 'Created At',
      key: 'createdAt',
      sortable: true,
      render: (data) => moment(data?.createdAt).format('DD.MM.YYYY HH:mm'),
    }
  ];
  
  if (me?.userRole?.role === SUPER_ADMIN) {
    columns.push(
      {
        title: 'Actions',
        key: 'actions',
        render: ((data) => (
            <>
              <Button className={`${classes.action} view`} onClick={() => history.push(`/users/${data.id}`)}>
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

  const handleFilter = (e) => {
    setCompanyId(e.target.value);
  };

  const handleChangeSort = (value) => {
    if (value === sortBy) {
      setOrder(order === 'DESC' ? 'ASC' : 'DESC');
    } else {
      setSortBy(value);
      setOrder('ASC');
    }
  };

  const handleDelete = (id) => {
    setDeletingUser(id);
  };

  const deleteUser = useCallback((isDelete) => {
    if (isDelete) {
      removeUser(deletingUser).then(() => fetchUsersList());
    }
    setDeletingUser(null);
  }, [deletingUser]);

  return (
    <Root className={classes.root}>
      <div className={classes.title}>
        <Typography variant="title">Users</Typography>
        {
          [SUPER_ADMIN].includes(me.userRole.role) &&
          <CommonButton onClick={() => history.push('/users/create')}>Create user</CommonButton>
        }
      </div>
      <div>
        {me?.userRole?.role === SUPER_ADMIN && (
          <CommonSelect
            className={classes.filter}
            options={companyFilters}
            optionLabel="name"
            optionValue="id"
            value={companyId}
            onChange={handleFilter}
          />
        )}
      </div>
      <DataTable
        columns={columns}
        tableData={users}
        search={search}
        order={order}
        sortBy={sortBy}
        pagination={pagination}
        onChangePage={setPage}
        onChangeLimit={setLimit}
        onChangeSearch={setSearch}
        onChangeSortBy={handleChangeSort}
      />
      {!!deletingUser && (
        <Modal open title="User Deletion" handleCloseModal={deleteUser}>
          <DeleteMsg className={classes.deleteMsg}>Are you sure to delete this user?</DeleteMsg>
        </Modal>
      )}
    </Root>
  );
};

export default Users;
