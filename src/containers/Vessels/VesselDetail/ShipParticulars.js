import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useHistory } from 'react-router';
import { useFormik } from 'formik';
import moment from 'moment';

import { useCompany } from '../../../context/company.context';
import { useFleet } from '../../../context/fleet.context';
import { useSnackbar } from '../../../context/snack.context';
import { useVessel } from '../../../context/vessel.context';
import CommonTextField from '../../../components/Forms/CommonTextField';
import CommonSelect from '../../../components/Forms/CommonSelect';
import CommonButton from '../../../components/Buttons/CommonButton';
import CommonDatePicker from '../../../components/Forms/DatePicker';
import CommonDateRangePicker from '../../../components/Forms/DateRangePicker';
import Dropzone from '../../../components/Forms/Dropzone';
import { vesselSchema } from '../../../validations/vessel.schema';
import { getVesselSample } from '../../../services/vessel.service';
import DataTable from '../../../components/Table/DataTable';
import { useDebounce } from '../../../hooks/use-debounce';
import { useAuth } from '../../../context/auth.context';
import { SUPER_ADMIN } from '../../../constants/UserRoles';
import Modal from '../../../components/Modals/Modal';

const PREFIX = 'Ship';
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
  filterWrapper: `${PREFIX}-filterWrapper`,
};

const Root = styled('div')(() => ({
  [`&.${classes.root}`]: {},
  [`& .${classes.card}`]: {
    boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
  },
  [`& .${classes.cardHeader}`]: {
    padding: '0.75rem 1.5rem',
    margin: 0,
  },
  [`& .${classes.cardBody}`]: {
    padding: 0,
    fontSize: '0.9rem',
    flexGrow: 1,
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
  },
  [`& .${classes.dropZone}`]: {
    padding: '1.5rem',
    marginBottom: '1rem',
    boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important',
  },
  [`& .${classes.filter}`]: {
    marginRight: '1rem',
    marginBottom: '1rem',
  },
  [`& .${classes.filterWrapper}`]: {
    display: 'flex',
    flexWrap: 'wrap',
  },
}));

const DeleteMsg = styled('p')(() => ({
  [`&.${classes.deleteMsg}`]: {
    margin: 0,
    fontSize: '1rem',
  },
}));

const ShipParticulars = ({ id }) => {
  const { me } = useAuth();
  const { createVesselTrips, getVessel, getVesselTypes, updateVessel, getPorts, getTripsByVesselId, removeVessel, vesselTypes, loading } = useVessel();
  const { companies, getCompanies } = useCompany();
  const { fleets, getFleets } = useFleet();
  const { notify } = useSnackbar();

  const history = useHistory();

  const [files, setFiles] = useState([]);
  const [parsedData, setParsedData] = useState({});
  const [vessel, setVessel] = useState();
  const [ports, setPorts] = useState([]);
  const [trips, setTrips] = useState([]);
  const [originPort, setOriginPort] = useState(-1);
  const [destinationPort, setDestinationPort] = useState(-1);
  const [tripRange, setTripRange] = useState([null, null]);
  const [deletingVessel, setDeletingVessel] = useState(false);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [sortBy, setSortBy] = useState();
  const [order, setOrder] = useState('ASC');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalCount: 0,
    totalPages: 0,
  });
  const numericalKeys = [ "companyId", "fleet", "dwt", "netTonnage", "grossTonnage", "vesselTypeId", "propulsionPower", "eedi", "eexi"];

  const debouncedSearchWord = useDebounce(search, 300);

  const fetchVesselTripsList = useCallback(() => {
    let params = {
      order,
      sortBy,
      page,
      limit,
      ...(originPort !== -1 && { originPort }),
      ...(destinationPort !== -1 && { destinationPort }),
      fromDate: tripRange[0]?.toISOString(),
      toDate: tripRange[1]?.toISOString(),
    };

    if (search) {
      params = { ...params, search: debouncedSearchWord };
    }

    getTripsByVesselId(id, params)
      .then((res) => {
        const data = res.data;
        setTrips(data.listData);
        setPagination(data.pagination);
      })
      .catch((err) => {
        if (err?.response?.data) {
          notify(err.response.data.message, 'error');
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchWord, page, order, sortBy, limit, search, id, originPort, destinationPort, tripRange]);

  useEffect(() => {
    fetchVesselTripsList();
  }, [fetchVesselTripsList]);

  const portFilters = useMemo(() => {
    const all = { name: 'All ports', id: -1 };
    if (ports?.length > 0) {
      return [all, ...ports];
    } else {
      return [all];
    }
  }, [ports]);

  const columns = [
    {
      title: 'Date',
      render: (data) => `${moment(data?.fromDate).format('DD.MM.YYYY')} - ${moment(data?.toDate).format('DD.MM.YYYY')}`,
    },
    {
      title: 'Origin Port',
      key: 'originPort',
    },
    {
      title: 'Destination Port',
      key: 'destinationPort',
    },
    {
      title: 'Fuel consumption',
      key: 'fuelConsumption',
      render: (data) => <>{`${data?.fuelConsumption} kg`}</>
    },
  ];

  const formData = {
    name: '',
    email: '',
    companyId: 0,
    fleet: 0,
    imo: 0,
    dwt: 0,
    netTonnage: 0,
    grossTonnage: 0,
    propulsionPower: 0,
    dateOfBuilt: '',
    iceClass: '',
    eedi: 0,
    eexi: 0,
    powerOutput: 0,
    shipType: '',
  };

  const formik = useFormik({
    initialValues: formData,
    validationSchema: vesselSchema,
    onSubmit: async (values) => {
      const updateVesselData = Object.entries(values).reduce((obj, value) => {
        if (numericalKeys.includes(value[0])) value[1] = Number(value[1]);
        if (value[1]) {
          obj = { ...obj, [value[0]]: value[1] };
          return obj;
        }
        return obj;
      }, {});

      updateVessel(id, updateVesselData)
        .then(() => {
          notify('Updated successfully!');
        })
        .catch((err) => {
          if (err?.response?.data) {
            notify(err.response.data.message, 'error');
          }
        });
    },
  });

  useEffect(() => {
    if (me?.userRole?.role === SUPER_ADMIN) {
      getCompanies();
    }
    getFleets();
    getVessel(id).then(({ data: { id, createdAt, updatedAt, ...res } }) => {
      const availableData = Object.entries(res)
        .reduce((acc, [key, value]) => (value === null || value === undefined) ? acc : { ...acc, [key]: value }, {});
      availableData.dwt = parseFloat(Number(availableData.dwt).toFixed(2));
      setVessel(availableData);
      formik.setValues({
        ...formData,
        ...availableData,
        company: undefined,
        companyId: res.companyId || '',
        fleet: res.fleet?.id || '',
      });
    });
    getVesselTypes();

    getPorts().then((res) => setPorts(res.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, getCompanies, getFleets, getVessel, getPorts, getTripsByVesselId]);

  const handleChangeFiles = (files, parsedResult) => {
    setFiles(files);
    setParsedData(parsedResult);
  };

  const handleSaveUpload = () => {
    const trips = parsedData.map((trip) => ({
      ...trip,
      vessel: id,
    }));
    createVesselTrips(trips).then(() => {
      getPorts();
      getTripsByVesselId(id);
    });
  };

  const handleDownloadSample = () => {
    getVesselSample().then((res) => {
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);

      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.target = '_blank';
      anchor.download = 'sample.xlsx';
      anchor.click();
    });
  };

  const handelFilterOriginPort = (e) => {
    setOriginPort(e.target.value);
  };

  const handelFilterDestinationPort = (e) => {
    setDestinationPort(e.target.value);
  };

  const handleChangeTripRange = (range) => {
    setTripRange(range);
  };

  const handleDelete = (isOk) => {
    if (isOk) {
      removeVessel(id)
        .then(() => {
          notify('Removed successfully.', 'success');
          history.push('/vessels');
          setDeletingVessel(false);
        })
        .catch((err) => {
          if (err?.response?.data) {
            notify(err.response.data.message, 'error');
          }
        });
    } else {
      setDeletingVessel(false);
    }
  };

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
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card className={classes.card}>
            <CardContent className={classes.cardBody}>
              <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography component="p">Name</Typography>
                      <CommonTextField
                        id="name_input"
                        className={classes.input}
                        placeholder="Enter name"
                        {...formik.getFieldProps('name')}
                        error={formik.touched.name && formik.errors.name}
                        loading={loading}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography>Net tonnage</Typography>
                      <CommonTextField
                        id="netTonnage_input"
                        className={classes.input}
                        placeholder="Enter Net tonnage"
                        {...formik.getFieldProps('netTonnage')}
                        error={formik.touched.netTonnage && formik.errors.netTonnage}
                        loading={loading}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography component="p">Contact Email address</Typography>
                      <CommonTextField
                        id="email_input"
                        className={classes.input}
                        placeholder="Enter email address"
                        {...formik.getFieldProps('email')}
                        error={formik.touched.email && formik.errors.email}
                        loading={loading}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography>Gross tonnage</Typography>
                      <CommonTextField
                        id="grossTonnage_input"
                        className={classes.input}
                        placeholder="Enter Gross tonnage"
                        {...formik.getFieldProps('grossTonnage')}
                        error={formik.touched.grossTonnage && formik.errors.grossTonnage}
                        loading={loading}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography component="p">Company</Typography>
                      <CommonSelect
                        id="company_input"
                        className={classes.input}
                        options={companies ? companies : [me.company]}
                        optionLabel="name"
                        optionValue="id"
                        {...formik.getFieldProps('companyId')}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography>Power Output</Typography>
                      <CommonTextField
                        id="powerOutput_input"
                        className={classes.input}
                        placeholder="Enter Power Output"
                        {...formik.getFieldProps('powerOutput')}
                        loading={loading}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography>Fleet</Typography>
                      <CommonSelect
                        id="fleet_input"
                        className={classes.input}
                        options={fleets}
                        optionLabel="name"
                        optionValue="id"
                        {...formik.getFieldProps('fleet')}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography>Main Propulsion Power</Typography>
                      <CommonTextField
                        id="propulsionPower_input"
                        className={classes.input}
                        placeholder="Enter Propulsion Power"
                        {...formik.getFieldProps('propulsionPower')}
                        error={formik.touched.propulsionPower && formik.errors.propulsionPower}
                        loading={loading}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography>Vessel Type</Typography>
                      <CommonSelect
                        id="vesselType_input"
                        className={classes.input}
                        options={(!vesselTypes || vesselTypes.length === 0) ? [{ id: vessel?.shipType || '', name: vessel?.shipType || '' }] : vesselTypes}
                        optionLabel="name"
                        optionValue="id"
                        {...formik.getFieldProps('vesselTypeId')}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography>Date built</Typography>
                      <CommonDatePicker
                        className={classes.input}
                        placeholder="Enter Date built"
                        {...formik.getFieldProps('dateOfBuilt')}
                        onChange={(value) => formik.setFieldValue('dateOfBuilt', value)}
                        error={formik.touched.dateOfBuilt && formik.errors.dateOfBuilt}
                        loading={loading}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography>IMO</Typography>
                      <CommonTextField
                        id="imo_input"
                        className={classes.input}
                        placeholder="Enter IMO"
                        {...formik.getFieldProps('imo')}
                        error={formik.touched.imo && formik.errors.imo}
                        loading={loading}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography>ICE Class</Typography>
                      <CommonTextField
                        id="iceClass_input"
                        className={classes.input}
                        placeholder="Enter ICE Class"
                        {...formik.getFieldProps('iceClass')}
                        error={formik.touched.iceClass && formik.errors.iceClass}
                        loading={loading}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography>DWT</Typography>
                      <CommonTextField
                        id="dwt_input"
                        className={classes.input}
                        placeholder="Enter DWT"
                        {...formik.getFieldProps('dwt')}
                        error={formik.touched.dwt && formik.errors.dwt}
                        loading={loading}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={6}>
                    <Box className={classes.wrapper}>
                      <Grid container spacing={2}>
                        <Grid item xs={6} md={6}>
                          <Typography>EEDI</Typography>
                          <CommonTextField
                            id="eedi_input"
                            className={classes.input}
                            placeholder="Enter EEDI"
                            {...formik.getFieldProps('eedi')}
                            error={formik.touched.eedi && formik.errors.eedi}
                            loading={loading}
                          />
                        </Grid>
                        <Grid item xs={6} md={6}>
                          <Typography>EEXI</Typography>
                          <CommonTextField
                            id="eexi_input"
                            className={classes.input}
                            placeholder="Enter EEXI"
                            {...formik.getFieldProps('eexi')}
                            error={formik.touched.eexi && formik.errors.eexi}
                            loading={loading}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                </Grid>
                <div className={classes.action}>
                  <CommonButton
                    variant="normal"
                    onClick={() => history.push('/vessels')}
                  >
                    Back
                  </CommonButton>
                  <CommonButton color="secondary" onClick={() => setDeletingVessel(true)}>Delete</CommonButton>
                  <CommonButton type="submit">Save</CommonButton>
                </div>
              </form>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card className={classes.dropZone}>
            <Dropzone files={files} onChangeFiles={handleChangeFiles} parseType="trip" />
            <Box className={classes.fileAction}>
              <CommonButton color="secondary" onClick={handleDownloadSample}>Download template</CommonButton>
              <CommonButton onClick={handleSaveUpload}>Save upload</CommonButton>
            </Box>
          </Card>
          <Box className={classes.filterWrapper}>
            <CommonSelect
              className={classes.filter}
              options={portFilters}
              value={originPort}
              optionLabel="name"
              optionValue="id"
              onChange={handelFilterOriginPort}
            />
            <CommonSelect
              className={classes.filter}
              options={portFilters}
              value={destinationPort}
              optionLabel="name"
              optionValue="id"
              onChange={handelFilterDestinationPort}
            />
            <CommonDateRangePicker
              value={tripRange}
              onChange={handleChangeTripRange}
              className={classes.filter}
              placeholder="Date From - Date To"
            />
          </Box>
          <DataTable
            columns={columns}
            isSearchable={false}
            tableData={trips}
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
      {!!deletingVessel && (
        <Modal open title="Vessel Deletion" handleCloseModal={handleDelete}>
          <DeleteMsg className={classes.deleteMsg}>Are you sure to delete this vessel?</DeleteMsg>
        </Modal>
      )}
    </Root>
  );
};

export default ShipParticulars;
