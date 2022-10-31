import React, { useEffect, useMemo, useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
// import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { useHistory } from 'react-router';

import { useFleet } from '../../context/fleet.context';
import { useCompany } from '../../context/company.context';
import { useDebounce } from '../../hooks/use-debounce';
import CommonButton from '../../components/Buttons/CommonButton';
import CommonSelect from '../../components/Forms/CommonSelect';
// import Dropzone from '../../components/Forms/Dropzone';
import DataTable from '../../components/Table/DataTable';
import { useAuth } from '../../context/auth.context';
import { COMPANY_EDITOR, SUPER_ADMIN } from '../../constants/UserRoles';

const PREFIX = 'Fleets';
const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  filter: `${PREFIX}-filter`,
  card: `${PREFIX}-card`,
  fileAction: `${PREFIX}-file-action`,
};

const Root = styled('div')(() => ({
  [`&.${classes.root}`]: {},
  [`& .${classes.title}`]: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '1.5rem',
    marginBottom: '1.5rem',
  },
  [`& .${classes.card}`]: {
    width: '100%',
    boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important',
    padding: '1.5rem',
    marginBottom: '1rem',
  },
  [`& .${classes.filter}`]: {
    marginRight: '1rem',
    marginBottom: '1rem',
  },
  [`& .${classes.fileAction}`]: {
    marginTop: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
  },
}));

const Fleet = () => {
  const { me } = useAuth();
  const isSuperAdmin = me?.userRole?.role === SUPER_ADMIN;
  const { fleets, getFleetsList, pagination } = useFleet();
  const { companies, getCompanies } = useCompany();
  const history = useHistory();

  const [companyId, setCompanyId] = useState(-1);
  const [search, setSearch] = useState('');
  // const [files, setFiles] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [sortBy, setSortBy] = useState();
  const [order, setOrder] = useState('ASC');

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
    getFleetsList({ page, limit });
    if (isSuperAdmin) {
      getCompanies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin]);

  useEffect(() => {
    let params = { order, sortBy, page, limit };

    if (companyId !== -1) {
      params = { ...params, companyId };
    }

    if (search) {
      params = { ...params, search: debouncedSearchWord };
    }

    getFleetsList(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchWord, companyId, page, order, sortBy, limit]);

  const columns = [
    {
      title: 'Name',
      key: 'name',
      link: true,
      sortable: true,
    },
    {
      title: 'Company',
      key: 'company',
      sortable: true,
    },
    {
      title: 'No. of Vessels',
      key: 'vesselCount',
      sortable: true,
    },
  ];

  const handleFilter = (e) => {
    setCompanyId(e.target.value);
  };

  // const handleChangeFiles = (files) => {
  //   setFiles(files);
  // };

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
        <Typography variant="title">Fleets</Typography>
        {[SUPER_ADMIN, COMPANY_EDITOR].includes(me?.userRole?.role) && (
          <CommonButton onClick={() => history.push('/fleets/create')}>Create fleet</CommonButton>
        )}
      </Box>
      {/* {[SUPER_ADMIN, COMPANY_EDITOR].includes(me?.userRole?.role) && (
        <Card className={classes.card}>
          <Dropzone files={files} onChangeFiles={handleChangeFiles} />
          <Box className={classes.fileAction}>
            <CommonButton color="secondary">Download template</CommonButton>
            <CommonButton>Save upload</CommonButton>
          </Box>
        </Card>
      )} */}
      <Box>
        {isSuperAdmin && (
          <CommonSelect
            className={classes.filter}
            options={companyFilters}
            optionLabel="name"
            optionValue="id"
            value={companyId}
            onChange={handleFilter}
          />
        )}
      </Box>
      <DataTable
        columns={columns}
        tableData={fleets}
        search={search}
        order={order}
        sortBy={sortBy}
        pagination={pagination}
        onChangePage={setPage}
        onChangeLimit={setLimit}
        onChangeSearch={setSearch}
        onChangeSortBy={handleChangeSort}
      />
    </Root>
  );
};

export default Fleet;
