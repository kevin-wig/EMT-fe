import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useFormik } from 'formik';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';

import { useCompany } from '../../context/company.context';
import { useFleet } from '../../context/fleet.context';
import { useSnackbar } from '../../context/snack.context';
import { useVessel } from '../../context/vessel.context';
import { fleetSchema } from '../../validations/fleet.schema';
import CommonTextField from '../../components/Forms/CommonTextField';
import CommonSelect from '../../components/Forms/CommonSelect';
import CommonButton from '../../components/Buttons/CommonButton';
// import Dropzone from '../../components/Forms/Dropzone';
import MultiSelect from '../../components/Forms/MultiSelect';
import { useDebounce } from '../../hooks/use-debounce';
import DataTable from '../../components/Table/DataTable';
// import { getVesselSample } from '../../services/vessel.service';
import { useAuth } from '../../context/auth.context';
import { SUPER_ADMIN } from '../../constants/UserRoles';

const PREFIX = 'FleetDetail';
const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  card: `${PREFIX}-card`,
  cardHeader: `${PREFIX}-card-header`,
  cardBody: `${PREFIX}-card-body`,
  input: `${PREFIX}-card-input`,
  wrapper: `${PREFIX}-wrapper`,
  action: `${PREFIX}-action`,
  fileAction: `${PREFIX}-file-action`,
  dropZone: `${PREFIX}-drop-zone`,
  filter: `${PREFIX}-filter`,
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.root}`]: {},
  [`& .${classes.title}`]: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '1.5rem',
    marginBottom: '1.5rem',
  },
  [`& .${classes.card}`]: {
    padding: '1.5rem',
    boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important',
  },
  [`& .${classes.cardHeader}`]: {
    padding: '0.75rem 1.5rem',
    margin: '0',
  },
  [`& .${classes.cardBody}`]: {
    padding: 0,
    fontSize: '0.9rem',
    '& p': {
      marginBottom: '0.5rem',
    },
  },
  [`& .${classes.input}`]: {
    width: '100%',
    margin: '0',
  },
  [`& .${classes.wrapper}`]: {
    marginBottom: '1rem',
  },
  [`& .${classes.action}`]: {
    display: 'flex',
    marginTop: '1.5rem',

    '& .MuiButton-root': {
      marginBottom: '1rem',
      '&:nth-of-type(2)': {
        marginLeft: 'auto',
        marginRight: '0.5rem',
      },
    },
  },
  [`& .${classes.fileAction}`]: {
    marginTop: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      '& button': {
        width: '100%',
        marginBottom: '0.5rem',
      },
    },
  },
  [`& .${classes.dropZone}`]: {
    boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important',
    padding: '1.5rem',
    marginBottom: '1rem',
  },
  [`& .${classes.filter}`]: {
    marginRight: '1rem',
    marginBottom: '1rem',
  },
}));

const FleetDetail = ({ match = { params: {} } }) => {
  const { me } = useAuth();
  const { companies, getCompanies } = useCompany();
  const { getFleet, updateFleet, createFleet, removeFleet, createFleetVessel, loading } = useFleet();
  const { getVessels, getVesselsList } = useVessel();
  const { notify } = useSnackbar();
  const isSuperAdmin = me?.userRole?.role === SUPER_ADMIN;

  const history = useHistory();

  // const [files, setFiles] = useState([]);
  const [vesselList, setVesselList] = useState([]);
  const [company, setCompany] = useState(-1);
  const [vessels, setVessels] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(-1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [sortBy, setSortBy] = useState();
  const [order, setOrder] = useState('ASC');
  const [currentFleet, setCurrentFleet] = useState();
  // const [uploadVessel, setUploadVessel] = useState();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalCount: 0,
    totalPages: 0,
  });

  const debouncedSearchWord = useDebounce(search, 300);

  const companyFilters = useMemo(() => {
    const all = { name: 'All companies', id: -1 };
    if (companies?.length > 0) {
      return [all, ...companies];
    } else {
      return [all];
    }
  }, [companies]);

  const categoryFilters = useMemo(() => [
    { value: -1, label: 'All categories' },
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
  ], []);

  const formik = useFormik({
    initialValues: {
      name: '',
      company: '',
      vessels: [],
    },
    validationSchema: fleetSchema,
    onSubmit: async (values) => {
      if (match.params.id && match.params.id !== 'create') {
        updateFleet(match.params.id, values)
          .then(() => {
            notify('Updated successfully!');
            history.push('/fleets');
          })
          .catch((err) => {
            if (err?.response?.data) {
              notify(err.response.data.message, 'error');
            }
          });
      } else {
        createFleet(values)
          .then(() => {
            notify('Created successfully!');
            history.push('/fleets');
          })
          .catch((err) => {
            if (err?.response?.data) {
              notify(err.response.data.message, 'error');
            }
          });
      }
    },
  });

  const companyId = formik.values.company;
  const vesselOptionList = useMemo(() => vessels.filter((vessel) => vessel.companyId === companyId), [companyId, vessels]);

  useEffect(() => {
    if (me?.userRole?.role === SUPER_ADMIN) {
      getCompanies().then((res) => {
        if (res?.data?.length > 0) {
          formik.setFieldValue('company', currentFleet?.company?.id ? currentFleet.company.id : res.data[0].id);
        }
      });
    }

    getVessels().then((res) => {
      setVessels(res.data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isNaN(match?.params?.id)) {
      getFleet(match.params.id).then((res) => {
        const data = res.data;
        setCurrentFleet(data);
        formik.setValues({
          name: data.name,
          company: data.company?.id,
          vessels: data.vessels.map((item) => item.id),
        });
      });

      getVesselsList({ fleet: match.params.id, page, limit })
        .then((res) => {
          const data = res.data;
          setVesselList(data.listData);
          setPagination(data.pagination);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match?.params?.id]);

  const getVesselTableData = useCallback(() => {
    let params = { fleet: match?.params?.id, page, limit, sortBy, order };
    if (company && company !== -1) {
      params = { ...params, company };
    }

    if (debouncedSearchWord) {
      params = { ...params, search: debouncedSearchWord };
    }

    if (category && category !== -1) {
      params = { ...params, category };
    }

    getVesselsList(params)
      .then((res) => {
        const data = res.data;
        setVesselList(data.listData);
        setPagination(data.pagination);
      })
      .catch(() => {
        setVesselList([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchWord, page, company, match?.params?.id, sortBy, order, category]);

  useEffect(() => {
    getVesselTableData();
  }, [getVesselTableData]);

  const columns = [
    {
      title: 'Name',
      key: 'name',
      sortable: true,
      render: ((data) => (
        <Link to={`/vessels/${data?.id}`}>{data?.name}</Link>
      )),
    },
    {
      title: 'IMO',
      key: 'imo',
      sortable: true,
    },
    {
      title: 'CO2 Emissions',
      key: 'emissions',
      sortable: true,
      render: (data) => (
        <>{data.emissions ? parseFloat(data.emissions).toFixed(3) : 0}</>
      ),
    },
    {
      title: 'CII',
      key: 'cii',
      sortable: true,
      render: (data) => (
        <>{data.cii ? parseFloat(data.cii).toFixed(3) : 0}</>
      ),
    },
    {
      title: 'Category',
      key: 'category',
      sortable: true,
    },
    {
      title: 'Fuel type',
      key: 'fuel',
      render: (() => (
        <div>LNG</div>
      )),
    },
  ];

  const handleDelete = () => {
    removeFleet(match.params.id);
    notify('Removed successfully.', 'success');
    history.push('/fleets');
  };

  // const handleChangeFiles = (files, res) => {
  //   setFiles(files);
  //   setUploadVessel(res);
  // };

  const handleFilterCompany = (e) => {
    setCompany(e.target.value);
  };

  // const handleUploadVessels = () => {
  //   createFleetVessel(match.params.id, uploadVessel).then(() => {
  //     getVesselTableData();
  //     setFiles([]);
  //   });
  // };

  const handleChangeSort = (value) => {
    if (value === sortBy) {
      setOrder(order === 'DESC' ? 'ASC' : 'DESC');
    } else {
      setSortBy(value);
      setOrder('ASC');
    }
  };

  useEffect(() => {
    if (!isSuperAdmin) {
      formik.setFieldValue('company', me.companyId);
    }
  }, [isSuperAdmin, me]);

  // const handleDownloadSample = () => {
  //   getVesselSample().then((res) => {
  //     const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //     const url = window.URL.createObjectURL(blob);

  //     const anchor = document.createElement('a');
  //     anchor.href = url;
  //     anchor.target = '_blank';
  //     anchor.download = 'sample.xlsx';
  //     anchor.click();
  //   });
  // };

  return (
    <Root className={classes.root}>
      <Box className={classes.title}>
        <Typography variant="title">Fleet details</Typography>
        <CommonButton onClick={() => history.push('/fleets/create')}>Create fleet</CommonButton>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} lg={4} xl={3}>
          <Card className={classes.card}>
            <CardContent className={classes.cardBody}>
              <form onSubmit={formik.handleSubmit}>
                <Box className={classes.wrapper}>
                  <Typography component="p">Name</Typography>
                  <CommonTextField
                    className={classes.input}
                    placeholder="Enter name"
                    {...formik.getFieldProps('name')}
                    error={formik.touched.name && formik.errors.name}
                    loading={loading}
                  />
                </Box>
                {isSuperAdmin && (
                  <Box className={classes.wrapper}>
                    <Typography component="p">Company</Typography>
                    <CommonSelect
                      className={classes.input}
                      options={companies?.length ? companies : me?.company ? [me?.company] : []}
                      optionLabel="name"
                      optionValue="id"
                      {...formik.getFieldProps('company')}
                    />
                  </Box>
                )}
                <Box className={classes.wrapper}>
                  <Typography component="p">Vessel</Typography>
                  <MultiSelect
                    className={classes.input}
                    options={vesselOptionList}
                    optionLabel="name"
                    optionValue="id"
                    {...formik.getFieldProps('vessels')}
                    onChange={(value) => formik.setFieldValue('vessels', value)}
                  />
                </Box>
                <Box className={classes.action}>
                  <CommonButton
                    variant="normal"
                    onClick={() => history.push('/fleets')}
                  >
                    Back
                  </CommonButton>
                  <CommonButton color="secondary" onClick={handleDelete}>Delete</CommonButton>
                  <CommonButton type="submit">Save</CommonButton>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={8} xl={9}>
          {/* <Card className={classes.dropZone}>
            <Dropzone files={files} onChangeFiles={handleChangeFiles} />
            <Box className={classes.fileAction}>
              <CommonButton color="secondary" onClick={handleDownloadSample}>Download template</CommonButton>
              <CommonButton onClick={handleUploadVessels}>Save upload</CommonButton>
            </Box>
          </Card> */}
          <Box>
            <CommonSelect
              className={classes.filter}
              options={companyFilters}
              optionLabel="name"
              optionValue="id"
              value={company}
              onChange={handleFilterCompany}
            />
            <CommonSelect
              className={classes.filter}
              options={categoryFilters}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <CommonSelect
              id="name-input"
              className={classes.filter}
              options={[{ label: 'Filter by Fuel Type', value: 0 }]}
              value={0}
            />
          </Box>
          <DataTable
            columns={columns}
            tableData={vesselList}
            search={search}
            order={order}
            sortBy={sortBy}
            pagination={pagination}
            onChangePage={setPage}
            onChangeLimit={setLimit}
            onChangeSearch={setSearch}
            onChangeSortBy={handleChangeSort}
          />
        </Grid>
      </Grid>
    </Root>
  );
};

export default FleetDetail;
