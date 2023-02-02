import { Tooltip } from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useFormik } from 'formik';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router';
import CommonButton from '../../components/Buttons/CommonButton';
import DetailCard from '../../components/Cards/DetailCard';
import CommonSelect from '../../components/Forms/CommonSelect';
import CommonTextField from '../../components/Forms/CommonTextField';
import CommonDatePicker from '../../components/Forms/DatePicker';
import PortSelect from '../../components/Forms/PortSelect';
import Modal from '../../components/Modals/Modal';
import {
  ADDITIONAL_VOYAGE_OPTIONS,
  FUEL_GRADES,
  JOURNEY_OPTION,
} from '../../constants/Global';
import { SUPER_ADMIN } from '../../constants/UserRoles';
import { useAuth } from '../../context/auth.context';
import { useCompany } from '../../context/company.context';
import { useSnackbar } from '../../context/snack.context';
import { useVessel } from '../../context/vessel.context';
import { aggregateSchema, voyageSchema } from '../../validations/voyage.schema';

const PREFIX = 'voyage-detail';
const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  input: `${PREFIX}-card-input`,
  wrapper: `${PREFIX}-wrapper`,
  gridContainer: `${PREFIX}-grid-container`,
  detailCard: `${PREFIX}-detail-card`,
  detailCardWrapper: `${PREFIX}-detail-card-wrapper`,
  gradeSectionHeader: `${PREFIX}-grade-section-header`,
  gradeSectionTitle: `${PREFIX}-grade-section-title`,
  etsKpi: `${PREFIX}-ets-kpi`,
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.root}`]: {},
  [`& .${classes.title}`]: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '1.5rem',
    marginBottom: '1.5rem',
  },
  [`& .${classes.gridContainer}`]: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1rem',
  },
  [`& .${classes.input}`]: {
    width: '100%',
    margin: 0,
  },
  [`& .${classes.wrapper}`]: {
    marginBottom: '1rem',
  },
  [`& .${classes.detailCardWrapper}`]: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '2rem',
  },
  [`& .${classes.detailCard}`]: {
    marginBottom: '2rem',
  },
  [`& .${classes.gradeSectionHeader}`]: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    [`& .${classes.gradeSectionTitle}`]: {
      flex: 1,
      marginRight: theme.spacing(1),
      borderBottom: `1px solid ${theme.palette.border.main}`,
      padding: `${theme.spacing(1)} 0`,
    },
  },
  [`& .${classes.etsKpi}`]: {
    boxShadow: 'none',
    border: '1px solid',
    borderColor: theme.palette.border.main,
    padding: `${theme.spacing(2.5)} ${theme.spacing(1.5)}`,
    display: 'flex',
    justifyContent: 'space-between',
  },
}));

const DeleteMsg = styled('p')(() => ({
  [`&.${classes.deleteMsg}`]: {
    margin: 0,
    fontSize: '1rem',
  },
}));

const VoyageDetail = ({ match }) => {
  const { notify } = useSnackbar();
  const { me } = useAuth();
  const {
    vessels,
    ports,
    getVessels,
    getPorts,
    createVesselTrip,
    loading,
    getTripById,
    updateVesselTrip,
    removeVesselTrip,
    getEtsPerVoyage,
  } = useVessel();
  const { companies, getCompanies, filterCompany } = useCompany();
  const isSuperAdmin = me?.userRole?.role === SUPER_ADMIN;

  const companyFilters = useMemo(() => {
    if (companies?.length > 0) {
      companies.sort((a, b) => a.name.localeCompare(b.name));
      return companies;
    }
    return [];
  }, [companies]);

  const history = useHistory();

  const [companyId, setCompanyId] = useState(filterCompany);
  const [vesselsList, setVesselsList] = useState();
  const [deletingVoyage, setDeletingVoyage] = useState();
  const [importVoyageOption, setImportVoyageOption] = useState(
    JOURNEY_OPTION.CII
  );
  const [etsKpi, setEtsKpi] = useState(null);
  const [timeControl, setTimeControl] = useState({
    departure: { min: null, max: null },
    arrival: { min: null, max: null },
  });
  const [aggregate, setAggregate] = useState(false);
  const [disable, setDisable] = useState(false);
  const [splittedData, setSplittedData] = useState([]);

  useEffect(() => {
    getVessels();
    getPorts();
    if (isSuperAdmin) {
      getCompanies();
    }
  }, [getVessels, getPorts, isSuperAdmin]);

  useEffect(() => {
    setVesselsList(
      isSuperAdmin
        ? vessels.filter((vessel) => vessel.companyId === companyId)
        : vessels.filter((vessel) => vessel.companyId === me?.companyId)
    );
  }, [vessels, companyId, isSuperAdmin]);

  const formik = useFormik({
    initialValues: {
      voyageId: '',
      vessel: '',
      voyageType: '',
      originPort: '',
      destinationPort: '',
      fromDate: '',
      toDate: '',
      mgo: 0,
      lfo: 0,
      hfo: 0,
      vlsfoAD: 0,
      vlsfoEK: 0,
      vlsfoXB: 0,
      lng: 0,
      lpgPp: 0,
      lpgBt: 0,
      // fuelCost: '',
      bioFuel: 0,
      bunkerCost: 1,
      // freightCharges: '',
      distanceTraveled: 1,
      freightProfit: 1,
      grades: [
        {
          grade: '',
          inboundEu: '',
          outboundEu: '',
          withinEu: '',
          euPort: '',
        },
      ],
    },
    validationSchema: aggregate ? aggregateSchema : voyageSchema,
    onSubmit: async (values) => {
      setDisable(true);
      let data = {
        ...values,
        voyageId: values.voyageId || '',
        mgo: values.mgo || 0,
        lfo: values.lfo || 0,
        hfo: values.hfo || 0,
        vlsfo: values.vlsfo || 0,
        lng: values.lng || 0,
        bunkerCost: values.bunkerCost || 0,
        // fuelCost: values.fuelCost || 0,
        // freightCharges: values.freightCharges || 0,
        distanceTraveled: values.distanceTraveled || 0,
        journeyType: importVoyageOption,
        vlsfoAD: values.vlsfoAD || 0,
        vlsfoEK: values.vlsfoEK || 0,
        vlsfoXB: values.vlsfoXB || 0,
        lpgPp: values.lpgPp || 0,
        lpgBt: values.lpgBt || 0,
        isAggregate: aggregate,
        fromDate: aggregate
          ? new Date(`${values.year}/01/01 00:00:00`).toISOString()
          : values.fromDate,
        toDate: aggregate
          ? new Date(`${values.year}/12/31 23:59:59`).toISOString()
          : values.toDate,
      };

      if (importVoyageOption !== JOURNEY_OPTION.ETS) {
        delete data.grades;
      }

      if (splittedData.length > 1) {
        splittedData.forEach((year, i) => {
          let toDate =
            i === 0
              ? new Date(
                  moment(data.fromDate).endOf('year').subtract(12, 'hours')
                ).toISOString()
              : data.toDate;
          let fromDate =
            i === 1
              ? new Date(moment(data.toDate).startOf('year')).toISOString()
              : data.fromDate;
          let distanceTraveled = data[`distanceTraveled${i}`];

          delete data[`distanceTraveled${i}`];

          let _data = { ...data, toDate, fromDate, distanceTraveled };

          if (data[`distanceTraveled${i + 1}`])
            delete _data[`distanceTraveled${i + 1}`];

          if (match.params.id && match.params.id !== 'create') {
            updateVesselTrip(match.params.id, _data)
              .then(() => {
                notify('Updated successfully!');
                history.push('/voyage');
              })
              .catch((err) => {
                if (err?.response?.data) {
                  if (
                    err.response.data.errors &&
                    Object.keys(err.response.data.errors).length
                  ) {
                    notify(
                      Object.values(err.response.data.errors)[0][0],
                      'error'
                    );
                  } else {
                    notify(err.response.data.message, 'error');
                  }
                  setDisable(false);
                }
              });
          } else {
            createVesselTrip(_data, aggregate)
              .then(() => {
                notify('Created successfully!');
                history.push('/voyage');
              })
              .catch((err) => {
                if (err?.response?.data) {
                  if (
                    err.response.data.errors &&
                    Object.keys(err.response.data.errors).length
                  ) {
                    notify(
                      Object.values(err.response.data.errors)[0][0],
                      'error'
                    );
                  } else {
                    notify(err.response.data.message, 'error');
                  }
                  setDisable(false);
                }
              });
          }
        });
      } else {
        if (match.params.id && match.params.id !== 'create') {
          updateVesselTrip(match.params.id, data)
            .then(() => {
              notify('Updated successfully!');
              history.push('/voyage');
            })
            .catch((err) => {
              if (err?.response?.data) {
                if (
                  err.response.data.errors &&
                  Object.keys(err.response.data.errors).length
                ) {
                  notify(
                    Object.values(err.response.data.errors)[0][0],
                    'error'
                  );
                } else {
                  notify(err.response.data.message, 'error');
                }
                setDisable(false);
              }
            });
        } else {
          createVesselTrip(data, aggregate)
            .then(() => {
              notify('Created successfully!');
              history.push('/voyage');
            })
            .catch((err) => {
              if (err?.response?.data) {
                if (
                  err.response.data.errors &&
                  Object.keys(err.response.data.errors).length
                ) {
                  notify(
                    Object.values(err.response.data.errors)[0][0],
                    'error'
                  );
                } else {
                  notify(err.response.data.message, 'error');
                }
                setDisable(false);
              }
            });
        }
      }
    },
  });

  useEffect(() => {
    const vesselId = formik.getFieldProps('vessel').value;
    if (
      vesselsList &&
      vesselsList.length &&
      !vesselsList.find((vessel) => +vessel.id === +vesselId)
    ) {
      formik.setFieldValue('vessel', vesselsList[0].id);
    }
  }, [vesselsList]);

  const FormatNumber = (value) => {
    if (!isNaN(parseFloat(value)) && !isNaN(value - 0)) {
      return parseFloat(value)?.toFixed(3);
    } else {
      return (
        <Tooltip title="No data available" placement="top">
          <span>N/A</span>
        </Tooltip>
      );
    }
  };

  useEffect(() => {
    if (match.params.id && match.params.id !== 'create') {
      getTripById(match.params.id).then((res) => {
        formik.setValues({
          ...res.data,
          vessel: res.data?.vessel?.id,
          originPort: res.data?.originPort?.name,
          destinationPort: res.data?.destinationPort?.name,
          toDate: new Date(res.data?.toDate),
          fromDate: new Date(res.data?.fromDate),
          freightProfit:
            !isNaN(parseFloat(res.data?.freightProfit)) &&
            !isNaN(res.data?.freightProfit - 0)
              ? parseFloat(Number(res.data?.freightProfit)?.toFixed(2))
              : res.data?.freightProfit || 0,
          // fuelCost: !isNaN(parseFloat(res.data?.fuelCost)) && !isNaN(res.data?.fuelCost - 0) ? parseFloat(Number(res.data?.fuelCost)?.toFixed(2)) : res.data?.fuelCost,
          // freightCharges: !isNaN(parseFloat(res.data?.freightCharges)) && !isNaN(res.data?.freightCharges - 0) ? parseFloat(Number(res.data?.freightCharges)?.toFixed(2)) : res.data?.freightCharges,
          bunkerCost:
            !isNaN(parseFloat(res.data?.bunkerCost)) &&
            !isNaN(res.data?.bunkerCost - 0)
              ? parseFloat(Number(res.data?.bunkerCost)?.toFixed(2))
              : res.data?.bunkerCost || 0,
          mgo:
            !isNaN(parseFloat(res.data?.mgo)) && !isNaN(res.data?.mgo - 0)
              ? parseFloat(Number(res.data?.mgo)?.toFixed(2))
              : res.data?.mgo || 0,
          lfo:
            !isNaN(parseFloat(res.data?.lfo)) && !isNaN(res.data?.lfo - 0)
              ? parseFloat(Number(res.data?.lfo)?.toFixed(2))
              : res.data?.lfo || 0,
          hfo:
            !isNaN(parseFloat(res.data?.hfo)) && !isNaN(res.data?.hfo - 0)
              ? parseFloat(Number(res.data?.hfo)?.toFixed(2))
              : res.data?.hfo || 0,
          vlsfoXB:
            !isNaN(parseFloat(res.data?.vlsfoXB)) &&
            !isNaN(res.data?.vlsfoXB - 0)
              ? parseFloat(Number(res.data?.vlsfoXB)?.toFixed(2))
              : res.data?.vlsfoXB || 0,
          vlsfoAD:
            !isNaN(parseFloat(res.data?.vlsfoAD)) &&
            !isNaN(res.data?.vlsfoAD - 0)
              ? parseFloat(Number(res.data?.vlsfoAD)?.toFixed(2))
              : res.data?.vlsfoAD || 0,
          vlsfoEK:
            !isNaN(parseFloat(res.data?.vlsfoEK)) &&
            !isNaN(res.data?.vlsfoEK - 0)
              ? parseFloat(Number(res.data?.vlsfoEK)?.toFixed(2))
              : res.data?.vlsfoEK || 0,
          lpgPp:
            !isNaN(parseFloat(res.data?.lpgPp)) && !isNaN(res.data?.lpgPp - 0)
              ? parseFloat(Number(res.data?.lpgPp)?.toFixed(2))
              : res.data?.lpgPp || 0,
          lpgBt:
            !isNaN(parseFloat(res.data?.lpgBt)) && !isNaN(res.data?.lpgBt - 0)
              ? parseFloat(Number(res.data?.lpgBt)?.toFixed(2))
              : res.data?.lpgBt || 0,
          lng:
            !isNaN(parseFloat(res.data?.lng)) && !isNaN(res.data?.lng - 0)
              ? parseFloat(Number(res.data?.lng)?.toFixed(2))
              : res.data?.lng || 0,
          bioFuel:
            !isNaN(parseFloat(res.data?.bioFuel)) &&
            !isNaN(res.data?.bioFuel - 0)
              ? parseFloat(Number(res.data?.bioFuel)?.toFixed(2))
              : res.data?.bioFuel || 0,
        });
        setImportVoyageOption(res.data?.journeyType);

        if (res.data?.journeyType === JOURNEY_OPTION.ETS) {
          getEtsPerVoyage(match.params.id).then((res) => {
            setEtsKpi(res.data);
          });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = () => {
    setDeletingVoyage(match.params.id);
  };

  const deleteVoyage = useCallback(
    (isDelete) => {
      if (isDelete) {
        removeVesselTrip(deletingVoyage).then(() => {
          history.push('/voyage');
        });
      }
      setDeletingVoyage(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deletingVoyage]
  );

  const handleAddGrade = () => {
    const grades = formik.values.grades;
    formik.setFieldValue('grades', [
      ...grades,
      {
        grade: '',
        inboundEu: '',
        outboundEu: '',
        withinEu: '',
        euPort: '',
      },
    ]);
  };

  const handleRemoveGrade = (index) => {
    const grades = formik.values.grades;
    formik.setFieldValue(
      'grades',
      grades.filter((section, sectionIndex) => sectionIndex !== index)
    );
  };

  const handleChangeGrade = (index, value, field) => {
    const grades = formik.values.grades;
    formik.setFieldValue(
      'grades',
      grades.map((section, sectionIndex) =>
        sectionIndex === index
          ? {
              ...section,
              [field]: value,
            }
          : section
      )
    );
  };

  const handleTypeChange = (value) => {
    const current = new Date();
    let time = {
      arrival: {},
      departure: {},
    };

    if (value === 'ACTUAL') {
      time.arrival.min = current;
      time.departure.max = current;
      time.arrival.max = null;
      time.departure.min = null;
    } else if (value === 'PREDICTED') {
      time.arrival.min = current;
      time.departure.min = current;
      time.arrival.max = null;
      time.departure.max = null;
    }

    setTimeControl(time);

    formik.setFieldValue('voyageType', value);
  };

  const handleEntityTypeChange = (value) => {
    setAggregate(value !== 'false');
  };

  const handleTabChange = (e) => {
    setImportVoyageOption(e.target.value);
  };

  const handleYearsDiffValidation = (years) => {
    if (years.length > 1) {
      if (years[1] - years[0] > 1) {
        notify(
          'Departure date and arrival date cannot have more than 1 year in difference',
          'error'
        );
        return false;
      } else {
        setSplittedData(years);
      }
    } else if (years.length <= 1) {
      setSplittedData([]);
    }
    return true;
  };

  const handleChangeDepartureDate = (value) => {
    const time = { ...timeControl };

    const getFromDateValue = formik.getFieldProps('toDate').value;

    if (getFromDateValue) {
      let fromYear = moment(getFromDateValue).year();
      let toYear = moment(value).year();
      if (String(toYear).length >= 4) {
        let years = [...new Set([fromYear, toYear])].sort((a, b) => a - b);
        if (!handleYearsDiffValidation(years)) {
          formik.setFieldValue('fromDate', '');
          return;
        }
      }
    }

    time.arrival.min = value;
    setTimeControl(time);
    formik.setFieldValue('fromDate', value);
  };

  const handleChangeArrivalDate = (value) => {
    const time = { ...timeControl };

    const getToDateValue = formik.getFieldProps('fromDate').value;

    if (getToDateValue) {
      let fromYear = moment(value).year();
      let toYear = moment(getToDateValue).year();
      if (String(fromYear).length >= 4) {
        let years = [...new Set([toYear, fromYear])].sort((a, b) => a - b);
        if (!handleYearsDiffValidation(years)) {
          formik.setFieldValue('toDate', '');
          return;
        }
      }
    }

    time.departure.max = value;
    setTimeControl(time);
    formik.setFieldValue('toDate', value);
  };

  const handleFilterByCompany = (e) => {
    setCompanyId(e.target.value);
  };

  return (
    <Root className={classes.root}>
      <Box className={classes.title}>
        <Typography variant="title">
          {`${
            match.params.id && match.params.id !== 'create'
              ? 'Update'
              : 'Create'
          } Voyage`}
        </Typography>
      </Box>
      <Grid container spacing={2} className={classes.gridContainer}>
        <Grid item xs={12} md={10} lg={8}>
          <DetailCard
            onBack={() => history.push('/voyage')}
            onDelete={
              match.params.id && match.params.id !== 'create' && handleDelete
            }
            onSubmit={formik.handleSubmit}
            disableAction={disable}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={12}>
                <Box className={classes.wrapper}>
                  <Typography component="p">Type</Typography>
                  <CommonSelect
                    className={classes.input}
                    options={[
                      { name: 'Voyage', value: 'false' },
                      { name: 'Aggregate', value: 'true' },
                    ]}
                    name={aggregate ? 'Aggregate' : 'Voyage'}
                    value={aggregate}
                    optionLabel="name"
                    optionValue="value"
                    onChange={(e) => handleEntityTypeChange(e.target.value)}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={12}>
                <Box className={classes.wrapper}>
                  <Typography>Voyage ID</Typography>
                  <CommonTextField
                    className={classes.input}
                    placeholder="Voyage ID"
                    {...formik.getFieldProps('voyageId')}
                    error={formik.touched.voyageId && formik.errors.voyageId}
                    loading={loading}
                  />
                </Box>
              </Grid>
              {isSuperAdmin && (
                <Grid item xs={12} md={12}>
                  <Box className={classes.wrapper}>
                    <Typography component="p">Company</Typography>
                    <CommonSelect
                      className={classes.input}
                      options={companyFilters}
                      optionLabel="name"
                      optionValue="id"
                      value={companyId}
                      onChange={handleFilterByCompany}
                    />
                  </Box>
                </Grid>
              )}
              <Grid item xs={12} md={12}>
                <Box className={classes.wrapper}>
                  <Typography component="p">Vessel</Typography>
                  <CommonSelect
                    className={classes.input}
                    options={vesselsList}
                    optionLabel="name"
                    optionValue="id"
                    {...formik.getFieldProps('vessel')}
                    error={formik.touched.vessel && formik.errors.vessel}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={12}>
                <Box className={classes.wrapper}>
                  <Typography component="p">Voyage Type</Typography>
                  <CommonSelect
                    className={classes.input}
                    options={[
                      { name: 'Actual', value: 'ACTUAL' },
                      { name: 'Predicted', value: 'PREDICTED' },
                      { name: 'Archived', value: 'ARCHIVED' },
                    ]}
                    optionLabel="name"
                    optionValue="value"
                    {...formik.getFieldProps('voyageType')}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    error={
                      formik.touched.voyageType && formik.errors.voyageType
                    }
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={12}>
                <Box className={classes.wrapper}>
                  <Typography component="p">Voyage Option</Typography>
                  <CommonSelect
                    className={classes.input}
                    options={ADDITIONAL_VOYAGE_OPTIONS}
                    value={importVoyageOption}
                    onChange={handleTabChange}
                  />
                </Box>
              </Grid>
              {match.params.id &&
                match.params.id !== 'create' &&
                importVoyageOption === JOURNEY_OPTION.ETS && (
                  <>
                    <Grid item xs={12} md={4} marginBottom={2}>
                      <Paper className={classes.etsKpi}>
                        <Typography>CO2 ETS</Typography>
                        <Typography>
                          {FormatNumber(etsKpi?.totalCo2Ets)}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4} marginBottom={2}>
                      <Paper className={classes.etsKpi}>
                        <Typography>EUA Cost</Typography>
                        <Typography>
                          €{FormatNumber(etsKpi?.euaCost)}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4} marginBottom={2}>
                      <Paper className={classes.etsKpi}>
                        <Typography>CO2 emissions</Typography>
                        <Typography>
                          {FormatNumber(etsKpi?.totalCo2Emission)}
                        </Typography>
                      </Paper>
                    </Grid>
                  </>
                )}
              {!aggregate && (
                <Grid item xs={12} md={6}>
                  <Box className={classes.wrapper}>
                    <Typography component="p">Origin Port</Typography>
                    <PortSelect
                      className={classes.input}
                      options={ports.map(function (item, index) {
                        return item['name'];
                      })}
                      {...formik.getFieldProps('originPort')}
                      onChange={(value) => {
                        formik.setFieldValue('originPort', value);
                      }}
                      error={
                        formik.touched.originPort && formik.errors.originPort
                      }
                    />
                  </Box>
                </Grid>
              )}
              {!aggregate && (
                <Grid item xs={12} md={6}>
                  <Box className={classes.wrapper}>
                    <Typography>Destination Port</Typography>
                    <PortSelect
                      className={classes.input}
                      options={ports.map(function (item, index) {
                        return item['name'];
                      })}
                      {...formik.getFieldProps('destinationPort')}
                      onChange={(value) =>
                        formik.setFieldValue('destinationPort', value)
                      }
                      error={
                        formik.touched.destinationPort &&
                        formik.errors.destinationPort
                      }
                    />
                  </Box>
                </Grid>
              )}
              {!aggregate && (
                <Grid item xs={12} md={6}>
                  <Box className={classes.wrapper}>
                    <Typography>Departure Date</Typography>
                    <CommonDatePicker
                      disabled={!formik.values.voyageType}
                      minDate={timeControl.departure.min}
                      maxDate={timeControl.departure.max}
                      className={classes.input}
                      placeholder="Enter Departure Date"
                      {...formik.getFieldProps('fromDate')}
                      onChange={handleChangeDepartureDate}
                      error={formik.touched.fromDate && formik.errors.fromDate}
                      loading={loading}
                    />
                  </Box>
                </Grid>
              )}
              {!aggregate && (
                <Grid item xs={12} md={6}>
                  <Box className={classes.wrapper}>
                    <Typography>Arrival Date</Typography>
                    <CommonDatePicker
                      disabled={!formik.values.voyageType}
                      minDate={timeControl.arrival.min}
                      maxDate={timeControl.arrival.max}
                      className={classes.input}
                      placeholder="Enter Arrival Date"
                      {...formik.getFieldProps('toDate')}
                      onChange={handleChangeArrivalDate}
                      error={formik.touched.toDate && formik.errors.toDate}
                      loading={loading}
                    />
                  </Box>
                </Grid>
              )}
              {aggregate && (
                <Grid item xs={6} md={6}>
                  <Box className={classes.wrapper}>
                    <Typography>Year</Typography>
                    <CommonTextField
                      className={classes.input}
                      placeholder="Enter Year"
                      {...formik.getFieldProps('year')}
                      error={formik.touched.year && formik.errors.year}
                      loading={loading}
                    />
                  </Box>
                </Grid>
              )}
              {splittedData.length > 1 ? (
                splittedData.map((_date, i) => (
                  <Grid
                    item
                    xs={aggregate ? 6 : 12}
                    md={aggregate ? 6 : 12}
                    key={i}
                  >
                    <Box className={classes.wrapper}>
                      <Typography>Nautical Miles in Year {_date} </Typography>
                      <CommonTextField
                        className={classes.input}
                        placeholder={`Enter Nautical Miles in Year ${_date}`}
                        {...formik.getFieldProps(`distanceTraveled${i}`)}
                        error={
                          formik.touched.distanceTraveled &&
                          formik.errors.distanceTraveled
                        }
                        loading={loading}
                      />
                    </Box>
                  </Grid>
                ))
              ) : (
                <Grid item xs={aggregate ? 6 : 12} md={aggregate ? 6 : 12}>
                  <Box className={classes.wrapper}>
                    <Typography>Nautical Miles</Typography>
                    <CommonTextField
                      className={classes.input}
                      placeholder="Enter Nautical Miles"
                      {...formik.getFieldProps('distanceTraveled')}
                      error={
                        formik.touched.distanceTraveled &&
                        formik.errors.distanceTraveled
                      }
                      loading={loading}
                    />
                  </Box>
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <Box className={classes.wrapper}>
                  <Typography>Freight Profit</Typography>
                  <CommonTextField
                    className={classes.input}
                    placeholder="Freight Profit"
                    {...formik.getFieldProps('freightProfit')}
                    error={
                      formik.touched.freightProfit &&
                      formik.errors.freightProfit
                    }
                    loading={loading}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box className={classes.wrapper}>
                  <Typography>Bunker Cost</Typography>
                  <CommonTextField
                    className={classes.input}
                    placeholder="Bunker cost"
                    {...formik.getFieldProps('bunkerCost')}
                    error={
                      formik.touched.bunkerCost && formik.errors.bunkerCost
                    }
                    loading={loading}
                  />
                </Box>
              </Grid>
              {importVoyageOption === JOURNEY_OPTION.CII && (
                <>
                  <Grid item xs={12} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography>MGO</Typography>
                      <CommonTextField
                        className={classes.input}
                        placeholder="MGO"
                        {...formik.getFieldProps('mgo')}
                        error={formik.touched.mgo && formik.errors.mgo}
                        loading={loading}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography>LFO</Typography>
                      <CommonTextField
                        className={classes.input}
                        placeholder="LFO"
                        {...formik.getFieldProps('lfo')}
                        error={formik.touched.lfo && formik.errors.lfo}
                        loading={loading}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography>HFO</Typography>
                      <CommonTextField
                        className={classes.input}
                        placeholder="HFO"
                        {...formik.getFieldProps('hfo')}
                        error={formik.touched.hfo && formik.errors.hfo}
                        loading={loading}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography>VLSFO (DMX to DMB)</Typography>
                      <CommonTextField
                        className={classes.input}
                        placeholder="VLSFO (DMX to DMB)"
                        {...formik.getFieldProps('vlsfoXB')}
                        error={formik.touched.vlsfoXB && formik.errors.vlsfoXB}
                        loading={loading}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography>VLSFO (RMA to RMD)</Typography>
                      <CommonTextField
                        className={classes.input}
                        placeholder="VLSFO (RMA to RMD)"
                        {...formik.getFieldProps('vlsfoAD')}
                        error={formik.touched.vlsfoAD && formik.errors.vlsfoAD}
                        loading={loading}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography>VLSFO (RME to RMK)</Typography>
                      <CommonTextField
                        className={classes.input}
                        placeholder="VLSFO (RME to RMK)"
                        {...formik.getFieldProps('vlsfoEK')}
                        error={formik.touched.vlsfoEK && formik.errors.vlsfoEK}
                        loading={loading}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography>LPG (Propane)</Typography>
                      <CommonTextField
                        className={classes.input}
                        placeholder="LPG (Propane)"
                        {...formik.getFieldProps('lpgPp')}
                        error={formik.touched.lpgPp && formik.errors.lpgPp}
                        loading={loading}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography>LPG (Butane)</Typography>
                      <CommonTextField
                        className={classes.input}
                        placeholder="LPG (Butane)"
                        {...formik.getFieldProps('lpgBt')}
                        error={formik.touched.lpgBt && formik.errors.lpgBt}
                        loading={loading}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography>LNG</Typography>
                      <CommonTextField
                        className={classes.input}
                        placeholder="LNG"
                        {...formik.getFieldProps('lng')}
                        error={formik.touched.lng && formik.errors.lng}
                        loading={loading}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography>BioFuels</Typography>
                      <CommonTextField
                        className={classes.input}
                        placeholder="BioFuels (tn)"
                        {...formik.getFieldProps('bioFuel')}
                        error={formik.touched.bioFuel && formik.errors.bioFuel}
                        loading={loading}
                      />
                    </Box>
                  </Grid>
                  {/*<Grid item xs={12} md={6}>*/}
                  {/*  <Box className={classes.wrapper}>*/}
                  {/*    <Typography>DWT</Typography>*/}
                  {/*    <CommonTextField*/}
                  {/*      className={classes.input}*/}
                  {/*      placeholder="DWT (tn)"*/}
                  {/*      {...formik.getFieldProps('dwt')}*/}
                  {/*      error={formik.touched.lng && formik.errors.lng}*/}
                  {/*      loading={loading}*/}
                  {/*    />*/}
                  {/*  </Box>*/}
                  {/*</Grid>*/}
                  {/*<Grid item xs={12} md={6}>*/}
                  {/*  <Box className={classes.wrapper}>*/}
                  {/*    <Typography>Fuel Cost</Typography>*/}
                  {/*    <CommonTextField*/}
                  {/*      className={classes.input}*/}
                  {/*      placeholder="Enter Fuel Cost"*/}
                  {/*      {...formik.getFieldProps('fuelCost')}*/}
                  {/*      error={formik.touched.fuelCost && formik.errors.fuelCost}*/}
                  {/*      loading={loading}*/}
                  {/*    />*/}
                  {/*  </Box>*/}
                  {/*</Grid>*/}
                  {/*<Grid item xs={12} md={6}>*/}
                  {/*  <Box className={classes.wrapper}>*/}
                  {/*    <Typography>Freight Charges</Typography>*/}
                  {/*    <CommonTextField*/}
                  {/*      className={classes.input}*/}
                  {/*      placeholder="Enter Freight Charges"*/}
                  {/*      {...formik.getFieldProps('freightCharges')}*/}
                  {/*      error={formik.touched.freightCharges && formik.errors.freightCharges}*/}
                  {/*      loading={loading}*/}
                  {/*    />*/}
                  {/*  </Box>*/}
                  {/*</Grid>*/}
                </>
              )}
              {importVoyageOption === JOURNEY_OPTION.ETS && (
                <>
                  {formik.values.grades.map((section, index) => (
                    <>
                      <Grid item xs={12}>
                        <Box className={classes.gradeSectionHeader}>
                          <Box className={classes.gradeSectionTitle}>
                            <Typography variant="bodyBold">
                              Grade {index + 1}
                            </Typography>
                          </Box>
                          <CommonButton
                            color="secondary"
                            onClick={() => handleRemoveGrade(index)}
                          >
                            Remove grade
                          </CommonButton>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box className={classes.wrapper}>
                          <Typography>Select Grade</Typography>
                          <CommonSelect
                            className={classes.input}
                            options={FUEL_GRADES}
                            value={section.grade}
                            onChange={(e) =>
                              handleChangeGrade(index, e.target.value, 'grade')
                            }
                            error={
                              formik.errors?.grades &&
                              formik.errors?.grades[index]?.grade
                            }
                          />
                        </Box>
                      </Grid>
                      {section.grade && (
                        <>
                          <Grid item xs={12} md={6}>
                            <Box className={classes.wrapper}>
                              <Typography>Inbound EU Consumption</Typography>
                              <CommonTextField
                                className={classes.input}
                                placeholder="Inbound EU Consumption"
                                loading={loading}
                                value={section.inboundEu}
                                onChange={(e) =>
                                  handleChangeGrade(
                                    index,
                                    e.target.value,
                                    'inboundEu'
                                  )
                                }
                                error={
                                  formik.errors?.grades &&
                                  formik.errors?.grades[index]?.inboundEu
                                }
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Box className={classes.wrapper}>
                              <Typography>Outbound EU Consumption</Typography>
                              <CommonTextField
                                className={classes.input}
                                placeholder="Outbound EU Consumption"
                                value={section.outboundEu}
                                onChange={(e) =>
                                  handleChangeGrade(
                                    index,
                                    e.target.value,
                                    'outboundEu'
                                  )
                                }
                                error={
                                  formik.errors?.grades &&
                                  formik.errors?.grades[index]?.outboundEu
                                }
                                loading={loading}
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Box className={classes.wrapper}>
                              <Typography>Within EU Consumption</Typography>
                              <CommonTextField
                                className={classes.input}
                                placeholder="Within EU Consumption"
                                value={section.withinEu}
                                onChange={(e) =>
                                  handleChangeGrade(
                                    index,
                                    e.target.value,
                                    'withinEu'
                                  )
                                }
                                error={
                                  formik.errors?.grades &&
                                  formik.errors?.grades[index]?.withinEu
                                }
                                loading={loading}
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Box className={classes.wrapper}>
                              <Typography>EU Port Consumption</Typography>
                              <CommonTextField
                                className={classes.input}
                                placeholder="EU Port Consumption"
                                value={section.euPort}
                                onChange={(e) =>
                                  handleChangeGrade(
                                    index,
                                    e.target.value,
                                    'euPort'
                                  )
                                }
                                error={
                                  formik.errors?.grades &&
                                  formik.errors?.grades[index]?.euPort
                                }
                                loading={loading}
                              />
                            </Box>
                          </Grid>
                        </>
                      )}
                    </>
                  ))}
                </>
              )}
            </Grid>
            {importVoyageOption === JOURNEY_OPTION.ETS && (
              <CommonButton onClick={handleAddGrade}>Add grade</CommonButton>
            )}
          </DetailCard>
        </Grid>
      </Grid>
      {!!deletingVoyage && (
        <Modal open title="Voyage Deletion" handleCloseModal={deleteVoyage}>
          <DeleteMsg className={classes.deleteMsg}>
            Are you sure to delete this voyage?
          </DeleteMsg>
        </Modal>
      )}
    </Root>
  );
};

export default VoyageDetail;
