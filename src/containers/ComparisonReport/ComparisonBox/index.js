import React, { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import { useFormik } from 'formik';

import CommonSelect from '../../../components/Forms/CommonSelect';
import CommonButton from '../../../components/Buttons/CommonButton';
import CommonMenu from '../../../components/Forms/CommonMenu';
import {
  CII_IMO_VALUES,
  REPORT_TYPE_ENUM,
  REPORT_TYPE_OPTIONS,
  VESSEL_AGE_OPTIONS,
  VESSEL_DWT,
} from '../constants';
import { YEARS_OPTION } from '../../../constants/Global';
import { useVessel } from '../../../context/vessel.context';
import { FUEL_TYPES_OPTIONS } from '../../../constants/FuelTypes';
import { newColor } from '../../../constants/ChartColors';
import { reportSchema } from '../../../validations/report.schema';
import { genYearArray } from '../../../utils/yearArray';
import { useAuth } from '../../../context/auth.context';
import moment from 'moment';
import { SUPER_ADMIN } from '../../../constants/UserRoles';
import Chart from '../../../components/Charts/Chart';
import LineChart from '../../../components/Charts/LineChart';

const _ = require('lodash');

const PREFIX = 'report-box';
const classes = {
  root: `${PREFIX}-root`,
  titleWrapper: `${PREFIX}-title-wrapper`,
  title: `${PREFIX}-title`,
  card: `${PREFIX}-card`,
  cardBody: `${PREFIX}-card-body`,
  fileAction: `${PREFIX}-file-action`,
  input: `${PREFIX}-card-input`,
  wrapper: `${PREFIX}-wrapper`,
  infoWrapper: `${PREFIX}-info-wrapper`,
  action: `${PREFIX}-action`,
  getVesselsButton: `${PREFIX}-get-vessels-button`,
  kpiTitle: `${PREFIX}-kpi-title`,
  reportCardsWrapper: `${PREFIX}-report-cards-wrapper`,
  rangeWrapper: `${PREFIX}-range-wrapper`,
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.root}`]: {
    maxWidth: '600px',
    minWidth: '600px',
    [`& > .${classes.card}`]: {
      '&:first-of-type': {
        marginBottom: '1rem',
      },
    },
  },
  [`& .${classes.titleWrapper}`]: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '1.5rem',
    '& .MuiTypography-title': {
      marginRight: '1rem',
    },
  },
  [`& .${classes.title}`]: {
    display: 'flex',
    alignItems: 'center',
  },
  [`& .${classes.kpiTitle}`]: {
    maxWidth: '100%',
    whiteSpace: 'pre-wrap',
    lineHeight: '1.5rem',
    marginBottom: '1rem',
  },
  [`& .${classes.reportCardsWrapper}`]: {
    [`& .${classes.card}`]: {
      minHeight: '8.5rem',
    },
  },
  [`& .${classes.card}`]: {
    width: '100%',
    boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    '&.cost': {
      background: theme.palette.info.main,
      color: '#fff',
    },
  },
  [`& .${classes.input}`]: {
    width: '100%',
    margin: 0,
  },
  [`& .${classes.rangeWrapper}`]: {
    margin: `0 -${theme.spacing(1)}`,
    display: 'flex',
    alignItems: 'center',
    '& > div': {
      margin: `0 ${theme.spacing(1)}`,
    },
  },
  [`& .${classes.infoWrapper}`]: {},
  [`& .${classes.cardBody}`]: {
    padding: 0,
    fontSize: '0.9rem',
    flexGrow: 1,
    '& p': {
      marginBottom: '0.5rem',
    },
  },
  [`& .${classes.action}`]: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '1.5rem',

    '& .MuiButton-root': {
      marginBottom: '1rem',
      '&:nth-of-type(2)': {
        marginLeft: 'auto',
        marginRight: '0.5rem',
      },
    },
  },
  [`& .${classes.getVesselsButton}`]: {
    marginTop: 'auto',
    marginRight: '10px',
  },
}));

const ComparisonBox = ({
  admin = false,
  id,
  companies = [],
  fleets = [],
  vessels = [],
  vesselTypes = [],
  vesselWeights = ['All'],
  dwts = ['All'],
  reportOption,
  onDelete = () => null,
  onUpdateOption,
}) => {
  const { me } = useAuth();
  const {
    getReport,
    addReportedOptions,
    removeReportedOptions,
  } = useVessel();

  const [charTitle, setChartTitle] = useState('');
  const [comparisonData, setComparisonData] = useState();
  const [comparisonVoyageData, setComparisonVoyageData] = useState();
  const [vesselList, setVesselList] = useState();
  const [filter, setFilter] = useState(true);
  const [changedPayload, setChangedPayload] = useState(true);
  const [chartData, setChartData] = useState();
  const [chartYear, setChartYear] = useState();
  const [selectedVessel, setSelectedVessel] = useState();
  const [fleetList, setFleetList] = useState(fleets);
  const [year, setYear] = useState(new Date().getFullYear());
  const [imoAverageMode, setIMOAverageMode] = useState(false);
  const [selectedDWTList, setSelectedDWTList] = useState([]);
  const [multiaxisData, setMultiaxisData] = useState();
  const companyOptions = useMemo(() => {
    const allCompanies = [
      {
        id: 'imo_average',
        name: 'IMO average',
      },
      ...(companies || []),
      ...(me?.userRole?.role !== SUPER_ADMIN ? [{ id: me.company.id, name: me.company.name }, { id: 'other_companies', name: 'Other companies' }] : [])
    ];
    const ids = Array.from(new Set(allCompanies.map((company) => company.id)));
    return ids.map((id) => allCompanies.find((company) => company.id === id));
  }, [companies, me]);

  const fleetOptions = useMemo(() => [
    ...fleetList,
  ], [fleetList]);

  const formik = useFormik({
    initialValues: {
      reportType: '',
      companyIds: admin ? [] : me?.company?.id || '',
      fuelType: [],
      vesselIds: [],
      fleets: [''],
      vesselAge: '',
      vesselWeight: [0, 0],
      dwt: ['', ''],
      vesselType: '',
    },
    validationSchema: reportSchema,
    onSubmit: async (values) => {

      const payload = {
        ...values,
        companyIds: admin ? values?.companyIds.filter((companyId) => companyId) : companyIds,
        fleets: values?.fleets.filter((fleet) => fleet),
        fuelType: values?.fuelType.filter((fuelType) => fuelType),
        vesselIds: values?.vesselIds.filter((vesselId) => vesselId),
        dwt: values?.vesselType && values?.dwt && VESSEL_DWT.find(dwt => dwt.id === values?.vesselType)?.values[values?.dwt]?.split(/[-|+]/g).map(v => Number(v)),
      };
      const options = getParameters(payload);
      onUpdateOption(options);

      getReport({
        ...options,
        ...(options.vesselIds.length ? {} : { vesselIds: undefined }),
        year
      }).then((res) => {
        const data = res.data;

        let found;
        if (options.vesselType) {
          found = CII_IMO_VALUES.filter((el) => +el.id === +options.vesselType);
          const dwtRanges = found[0].values.map((el) => {
            return ({ range: el.dwt.split(/[+|-]/g).map(value => value ? +value : undefined), imoValue: el.imoValue })
          });
          data.chartData?.forEach((item) => {
            item.data.forEach((dt) => {
              const foundImo = dwtRanges.find(({ range }) => _.inRange(+dt.dwt, range[0], range[1] ?? Number.MAX_SAFE_INTEGER));
              dt.imoValue = foundImo ? +foundImo?.imoValue : 0;
            });
          });
          let dwtSelected = VESSEL_DWT.find(el => el.id === options.vesselType)?.values[formik.values.dwt];

          if (dwtSelected) {
            let filteredDwt = found[0].values.filter(el => {
              let dwtRange = el.dwt.split(/[+|-]/g).map(value => +value);
              let dwtSelectedRange = dwtSelected.split(/[+|-]/g).map(value => +value);

              return dwtRange[1] > 0 ? _.inRange(dwtSelectedRange[0], dwtRange[0], dwtRange[1]) || _.inRange(dwtSelectedRange[1], dwtRange[0], dwtRange[1]) : (dwtSelectedRange[0] >= dwtRange[0] && dwtSelectedRange[1] <= dwtRange[0]);
            });
            found = [{ ...found[0], values: filteredDwt }];
          }
        } else {
          found = CII_IMO_VALUES;
        }

        setMultiaxisData({
          labels: found.reduce((total, curr) => {
            return [...total, ...curr.values.map(c => `${curr.type};${c.dwt}`)];
          }, []),
          datasets: [{
            label: 'CII Attained',
            backgroundColor: newColor(2),
            data: found.reduce((total, curr) => {
              return [...total, ...curr.values.map(v => Number(v.imoValue))];
            }, []),
          }],
        });

        setComparisonData(data);
        addReportedOptions(id, options);
      });
      getReport({
          ...options,
          ...(options.vesselIds.length ? {} : { vesselIds: undefined }),
          year
        },
        year,
        true
      ).then((res) => {
        const data = res.data;
        setComparisonVoyageData(data);
      });
    },
  });

  const companyIds = formik.getFieldProps('companyIds').value;

  useEffect(() => {
    // formik.setFieldValue(
    //   "companyIds",
    //   admin && companies
    //     ? companies.map((company) => company?.id)
    //     : me?.company?.id || ""
    // );
    // formik.setFieldValue(
    //   "vesselIds",
    //   vessels?.map((vessel) => vessel?.id) || []
    // );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companies, me, admin, vessels]);

  const valuableYears = useMemo(
    () =>
      genYearArray(
        (comparisonData?.chartData || []).reduce(
          (acc, dt) => [
            ...acc,
            ...(dt?.data?.map((chartDatum) => +chartDatum.key || +year) || []),
            // eslint-disable-next-line react-hooks/exhaustive-deps
          ],
          [year],
        ),
      ),
    [comparisonData, year],
  );

  useEffect(() => {
    const selectedCompanies = formik.getFieldProps('companyIds').value;
    setVesselList(vessels.filter((vessel) => Array.isArray(selectedCompanies) ? selectedCompanies?.includes(vessel.companyId) : selectedCompanies === vessel.companyId));
  }, [vessels, formik.getFieldProps('companyIds').value]);

  useEffect(() => {
    setFleetList(fleets);
  }, [fleets]);

  useEffect(() => {
    if (comparisonData) {
      formik.submitForm();
    }
  }, [changedPayload]);

  useEffect(() => {
    if (comparisonData) {
      generateChartData(comparisonData.chartData, reportOption.reportType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valuableYears, selectedVessel]);

  useEffect(() => {
    const reportType = reportOption?.reportType;
    if (reportType === REPORT_TYPE_ENUM.CII) {
      setChartTitle(companyIds === 'other_companies' ? 'Average CII Attained/Required' : 'CII Over time');
    } else if (reportType === REPORT_TYPE_ENUM.ETS) {
      setChartTitle('ETS per vessel');
    } else if (reportType === REPORT_TYPE_ENUM.GHG) {
      setChartTitle('GHGs per vessel');
    }
  }, [reportOption?.reportType, companyIds]);

  useEffect(() => {
    const state = formik.values;
    const fleets = state.fleets?.filter((fleet) => !!fleet);
    const selectedVesselsList = vessels
      .filter((vessel) => !state.companyIds || (Array.isArray(state.companyIds) ? (!state.companyIds.length || state.companyIds.includes(vessel.companyId)) : state.companyIds === vessel.companyId))
      .filter((vessel) => fleets || fleets.length || fleets.includes(vessel?.fleet?.id))
      .filter((vessel) => !state.vesselType || vessel.vesselTypeId === +state.vesselType)
      .filter((vessel, index) => {
        if (state.vesselAge) {
          let [minYear, maxYear] = formik.values.vesselAge.split(',');
          const dateDiff = new Date() - new Date(vessel.dateOfBuilt);
          const oneYearMilli = 365 * 24 * 3600000;

          if (state.vesselAge === '25+') {
            minYear = 0;
            maxYear = 10000;
          }

          return dateDiff > minYear * oneYearMilli && dateDiff > maxYear * oneYearMilli;
        }

        return true;
      });

    // formik.setFieldValue(
    //   "vesselIds",
    //   selectedVesselsList.map((vessel) => vessel?.id)
    // );

    formik.setFieldValue('vesselIds', state.vesselIds.filter((vesselId) => selectedVesselsList.find(({ id }) => id === vesselId)));
    setVesselList(selectedVesselsList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, vessels]);

  const generateChartData = (chartData, reportType) => {
    if (reportType === REPORT_TYPE_ENUM.CII) {
      if (companyIds !== 'other_companies') {
        const ciiLabels = selectedVessel ? selectedVessel.data.map((dt) => dt.name || dt.key) : chartData.map((data) => data.name);
        const datasets = selectedVessel
          ?
          [
            {
              backgroundColor: selectedVessel.data.map((_, index) => newColor(index)),
              data: selectedVessel.data.map((dt) => parseFloat(dt.cii)?.toFixed(3) || 0),
              barPercentage: 0.7,
              categoryPercentage: 1,
              fill: true,
            }
          ]
          :
          [
            {
              type: 'line',
              label: 'IMO Average',
              borderColor: 'rgb(255, 255, 255)',
              borderWidth: 3,
              pointRadius: 10,
              pointHoverRadius: 11,
              showLine: false,
              fill: false,
              backgroundColor: chartData.map((_, index) => newColor(index)),
              data: chartData.map((dt) => parseFloat(dt.data[0].imoValue)?.toFixed(3) || 0),
              categoryPercentage: 1,
            },
            {
              type: 'bar',
              label: 'CII',
              backgroundColor: chartData.map((_, index) => newColor(index)),
              data: chartData.map((dt) => parseFloat(dt.data[0].cii)?.toFixed(3) || 0),
              barPercentage: 0.7,
              fill: true,
            },
          ];

        setChartData({
          labels: ciiLabels,
          datasets,
        });
      } else {
        setChartData({
          labels: [year],
          datasets: [
            {
              type: 'line',
              label: 'IMO Average',
              borderColor: 'rgb(255, 255, 255)',
              borderWidth: 3,
              pointRadius: 10,
              pointHoverRadius: 11,
              showLine: false,
              fill: false,
              backgroundColor: newColor(0),
              data: [chartData.reduce((acc, dt) => acc + (parseFloat(dt.data[0].imoValue) || 0), 0) / chartData.length],
              categoryPercentage: 1,
            },
            {
              type: 'bar',
              label: 'CII',
              backgroundColor: newColor(0),
              data: [chartData.reduce((acc, dt) => acc + (parseFloat(dt.data[0].cii) || 0), 0) / chartData.length],
              barPercentage: 0.7,
              fill: true,
            },
          ],
        });
      }
    } else if (reportType === REPORT_TYPE_ENUM.ETS) {
      const vessels = Array.from(new Set(chartData.map((dt) => dt.name)));

      setChartData({
        labels: vessels,
        datasets: [
          {
            label: 'EU CO2 emissions',
            backgroundColor: 'transparent',
            borderColor: newColor(0),
            data: vessels.map(
              (vessel) =>
                chartData.find((dt) => dt.name === vessel)?.emissions || 0,
            ),
            barPercentage: 0.7,
            categoryPercentage: 1,
            fill: true,
          },
          {
            label: 'EU ETS',
            backgroundColor: 'transparent',
            borderColor: newColor(1),
            data: vessels.map(
              (vessel) => chartData.find((dt) => dt.name === vessel)?.ets || 0,
            ),
            barPercentage: 0.7,
            categoryPercentage: 1,
            fill: true,
          },
        ],
      });
    } else if (reportType === REPORT_TYPE_ENUM.GHG) {
      const vessels = Array.from(new Set(chartData.map((dt) => dt.name)));

      setChartData({
        labels: vessels,
        datasets: [
          {
            label: 'GHGs Target',
            backgroundColor: 'transparent',
            borderColor: newColor(0),
            data: vessels.map(
              (vessel) =>
                chartData.find((dt) => dt.name === vessel)?.required || 0,
            ),
            barPercentage: 0.7,
            categoryPercentage: 1,
            fill: true,
          },
          {
            label: 'GHGs Actual',
            backgroundColor: 'transparent',
            borderColor: newColor(1),
            data: vessels.map(
              (vessel) =>
                chartData.find((dt) => dt.name === vessel)?.attained || 0,
            ),
            barPercentage: 0.7,
            categoryPercentage: 1,
            fill: true,
          },
        ],
      });
    }
  };

  const handleDblClickChart = (event) => {
    event.preventDefault();
    if (chartYear || selectedVessel) {
      setSelectedVessel(undefined);
      setChartYear(undefined);
    } else {
    }
  };

  const handleClickChart = (instance, elements) => {
    if (elements.length > 0 && companyIds !== 'other_companies') {
      if (!selectedVessel) {
        setSelectedVessel(comparisonVoyageData?.chartData?.[elements[0].index]);
      }
    }
  };

  const getParameters = ({ fuelType, ...values }) => {
    const reportOpt = Object.entries(values).reduce((obj, value) => {
      if (value[1]) {
        if (Array.isArray(value[1]) && value[1].length === 2) {
          if (!value[1][0] && !value[1][1]) {
            return obj;
          } else {
            obj = { ...obj, [value[0]]: value[1] };
          }
        } else {
          obj = { ...obj, [value[0]]: value[1] };
        }
        return obj;
      }
      return obj;
    }, {});

    if (reportOpt.vesselAge) {
      if (reportOpt.vesselAge === 'ALL') {
        reportOpt.vesselAge = undefined;
      } else if (reportOpt.vesselAge === '50+') {
        reportOpt.vesselAge = [50];
      } else {
        reportOpt.vesselAge = reportOpt.vesselAge.split(',').map((age) => +age);
      }
    }

    if (admin && reportOpt.companyIds.length === 0) {
      reportOpt.companyIds = companies.map(company => company?.id);
    }

    reportOpt.fuels = fuelType ? Array.isArray(fuelType) ? [...fuelType] : [fuelType] : [];
    reportOpt.year = year;

    return reportOpt;
  };

  const handleDelete = () => {
    removeReportedOptions(id);
    onDelete();
  };

  const modifyParamtersTiedToVesselType = (vesselTypeId, type = null, callback = null) => {
    formik.setFieldValue('vesselType', vesselTypeId);

    type !== 'vessel' && setFilter(!filter);
    let vesselType = vesselTypes.find(_vesselType => _vesselType.id === vesselTypeId)?.name;
    let dwtList = VESSEL_DWT.find(dwt => dwt.type === vesselType)?.values;
    let dwtUIList = dwtList?.map((dwt, i) => ({ key: i, label: dwt }));
    setSelectedDWTList(dwtUIList);

    if (callback) {
      callback(dwtUIList);
    }
  };

  const handleVesselTypeChange = (e) => {
    const vesselType = e.target.value;

    modifyParamtersTiedToVesselType(vesselType);
  };

  const handleVesselAgeChange = (e) => {
    const vesselAge = e.target.value;
    formik.setFieldValue('vesselAge', vesselAge);
    setFilter(!filter);
  };

  const handleOnFuelTypesChange = (e) => {
    setChangedPayload(!changedPayload);
    const fuelTypes = e.target.value.includes('') ? FUEL_TYPES_OPTIONS.map((fuelType) => fuelType.key) : e.target.value;
    formik.setFieldValue('fuelType', fuelTypes);
  }

  const handleOnVesselChange = (e) => {
    setChangedPayload(!changedPayload);
    const vesselIds = e.target.value.includes('') ? (vesselList || []).map((vessel) => vessel.id) : e.target.value;
    formik.setFieldValue('vesselIds', vesselIds);

    if (vesselIds.length < 2) {
      vesselIds.forEach((vesselId) => {
        const fieldVessel = vessels.find((vessel) => vessel.id === vesselId);
        const age = moment().diff(fieldVessel.dateOfBuilt, 'years');

        const selectedAgeRange = VESSEL_AGE_OPTIONS.find((option) => {
          const splittedOption = option.key.split(',');

          return _.inRange(age, Number(splittedOption[0]), Number(splittedOption[1]));
        });

        formik.setFieldValue('vesselAge', selectedAgeRange?.key);

        modifyParamtersTiedToVesselType(fieldVessel.vesselTypeId, 'vessel', (dwtList) => {
          const selectedRange = dwtList?.find((option) => {
            const splittedOption = option.label.split(/[-|+]/g);

            return splittedOption[1] === '' ? fieldVessel.dwt >= splittedOption[0] : _.inRange(fieldVessel.dwt, Number(splittedOption[0]), Number(splittedOption[1]));
          });

          formik.setFieldValue('dwt', selectedRange?.key);
        });
      });
    } else {
      formik.setFieldValue('vesselAge', '');
      formik.setFieldValue('dwt', []);
      formik.setFieldValue('vesselType', '');
    }
  };

  const handleVesselDWTChange = (e) => {
    const vesselDWT = e.target.value;

    formik.setFieldValue('dwt', vesselDWT);
  };

  const handleChangeCompanyIds = (value) => {
    const selectedCompanies = companies.filter((company) => !value || !value.length || value.includes(company.id));
    const fleets = selectedCompanies.map(company => company.fleets).flat();

    setFleetList(fleets);
    setFilter(!filter);
  };

  const handleChangeFleets = (e) => {
    const value = e.target.value;
    const prevValue = formik.values.fleets;
    if (!value.length || (value.includes(undefined) && !prevValue.includes(undefined) && prevValue.length)) {
      e.target.value = [''];
    } else {
      e.target.value = value.filter((val) => val);
    }
    setFilter(!filter);
    const filteredVessels = vessels.filter(vessel => e.target.value.includes(vessel?.fleet?.id));
    setVesselList(filteredVessels);
    formik.setFieldValue('vesselIds', filteredVessels.map((vessel) => vessel.id));
    formik.getFieldProps('fleets').onChange(e);
  };

  const handleChangeYear = (value) => {
    setYear(value);
  };

  const handleCompanyChange = (e) => {
    let selectedValues = e.target.value;

    if (admin && selectedValues.includes('')) {
      selectedValues = companies.map((company) => company.id);
    }

    if (admin && selectedValues.indexOf('imo_average') > -1) {
      selectedValues = ['imo_average'];
    }
    e.target.value = selectedValues;

    if ((admin && selectedValues.indexOf('imo_average') > -1) || selectedValues === 'imo_average') {
      setIMOAverageMode(true);
      formik.setFieldValue('reportType', 'cii');
      modifyParamtersTiedToVesselType(0);
    } else {
      setIMOAverageMode(false);
    }
    setFilter(!filter);

    handleChangeCompanyIds(selectedValues);
    formik.setFieldValue(
      'vesselIds',
      vessels?.map((vessel) => vessel?.id) || [],
    );
    formik.getFieldProps('companyIds').onChange(e);
  };

  return (
    <Root className={classes.root}>
      <Card className={classes.card}>
        <CardContent className={classes.cardBody}>
          <Box marginBottom={1} display="flex" justifyContent="end">
            <CommonMenu
              label={`Year - ${year}`}
              items={YEARS_OPTION}
              onChange={handleChangeYear}
            />
          </Box>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={6} md={6}>
                <Box className={classes.wrapper}>
                  <Typography component="p">Report Type</Typography>
                  <CommonSelect
                    className={classes.input}
                    options={REPORT_TYPE_OPTIONS}
                    optionLabel="label"
                    optionValue="key"
                    {...formik.getFieldProps('reportType')}
                    error={
                      formik.touched.reportType && formik.errors.reportType
                    }
                    clearable
                  />
                </Box>
              </Grid>
              <Grid item xs={6} md={6}>
                <Box className={classes.wrapper}>
                  <Typography component="p">Company</Typography>
                  <CommonSelect
                    className={classes.input}
                    options={companyOptions}
                    placeholder={admin ? 'All companies' : ''}
                    multiple={admin}
                    optionLabel="name"
                    optionValue="id"
                    {...formik.getFieldProps('companyIds')}
                    clearable
                    onChange={(e) => handleCompanyChange(e)}
                  />
                </Box>
              </Grid>
              <Grid item xs={6} md={6}>
                <Box className={classes.wrapper}>
                  <Typography component="p">Fleet</Typography>
                  <CommonSelect
                    className={classes.input}
                    options={fleetOptions}
                    placeholder="No fleet"
                    multiple
                    optionLabel="name"
                    optionValue="id"
                    {...formik.getFieldProps('fleets')}
                    disabled={imoAverageMode || companyIds === 'other_companies'}
                    onChange={handleChangeFleets}
                    clearable
                  />
                </Box>
              </Grid>
              <Grid item xs={6} md={6}>
                <Box className={classes.wrapper}>
                  <Typography component="p">Fuel Type</Typography>
                  <CommonSelect
                    multiple
                    className={classes.input}
                    options={FUEL_TYPES_OPTIONS}
                    placeholder="All fuel type"
                    optionLabel="label"
                    optionValue="key"
                    disabled={imoAverageMode}
                    {...formik.getFieldProps('fuelType')}
                    clearable
                    onChange={handleOnFuelTypesChange}
                  />
                </Box>
              </Grid>
              <Grid item xs={6} md={6}>
                <Box className={classes.wrapper}>
                  <Typography component="p">Vessel Age</Typography>
                  <CommonSelect
                    className={classes.input}
                    options={VESSEL_AGE_OPTIONS}
                    onChange={handleVesselAgeChange}
                    value={formik.values.vesselAge} $
                    optionLabel="label"
                    optionValue="key"
                    disabled={imoAverageMode}
                    clearable
                  />
                </Box>
              </Grid>
              <Grid item xs={6} md={6}>
                <Box className={classes.wrapper}>
                  <Typography>Vessel Type</Typography>
                  <CommonSelect
                    id="vesselType_input"
                    className={classes.input}
                    options={vesselTypes}
                    value={formik.values.vesselType}
                    onChange={handleVesselTypeChange}
                    optionLabel="name"
                    optionValue="id"
                    clearable
                  />
                </Box>
              </Grid>
              <Grid item xs={6} md={6}>
                <Box className={classes.wrapper}>
                  <Typography>Vessel DWT</Typography>
                  <Box className={classes.rangeWrapper}>
                    <CommonSelect
                      className={classes.input}
                      options={selectedDWTList}
                      onChange={handleVesselDWTChange}
                      value={formik.values.dwt}
                      optionLabel="label"
                      optionValue="key"
                      clearable
                      // disabled={imoAverageMode}
                    />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6} md={6}>
                <Box className={classes.wrapper}>
                  <Typography component="p">Vessel</Typography>
                  <CommonSelect
                    multiple
                    className={classes.input}
                    placeholder="All vessels"
                    options={vesselList}
                    optionLabel="name"
                    optionValue="id"
                    {...formik.getFieldProps('vesselIds')}
                    disabled={imoAverageMode || companyIds === 'other_companies'}
                    clearable
                    onChange={handleOnVesselChange}
                  />
                </Box>
              </Grid>
            </Grid>
            <div className={classes.action}>
              <CommonButton variant="normal" onClick={handleDelete}>
                Close
              </CommonButton>
              <Box>
                {/* <CommonButton
                  variant="outlined"
                  className={classes.getVesselsButton}
                  onClick={() => getVesselsForReport()}
                >
                  Get Vessels
                </CommonButton> */}
                <CommonButton type="submit">Show Report</CommonButton>
              </Box>
            </div>
          </form>
        </CardContent>
      </Card>
      {comparisonData && (
        <Grid
          id={`report-export-${id}`}
          container
          spacing={2}
          className={classes.reportCardsWrapper}
        >
          {reportOption?.reportType === REPORT_TYPE_ENUM.CII && !imoAverageMode && (
            <Grid item xs={12}>
              <Card className={classes.card}>
                <Typography variant="subtitle1" className={classes.kpiTitle}>
                  {companyIds === 'other_companies' ? `Average emissions per vessel (${comparisonData.year})` : `Total Emission (${comparisonData.year})`}
                </Typography>
                <Typography variant="subtitle2">
                  {parseFloat(comparisonData.totalEmissions / (companyIds === 'other_companies' ? comparisonData.chartData.length : 1))?.toFixed(3) || 0}
                </Typography>
              </Card>
            </Grid>
          )}
          {reportOption?.reportType === REPORT_TYPE_ENUM.ETS && (
            <>
              <Grid item xs={12} md={6}>
                <Card className={classes.card}>
                  <Typography variant="subtitle1" className={classes.kpiTitle}>
                    Total Emission ({comparisonData.year})
                  </Typography>
                  <Typography variant="subtitle2">
                    {parseFloat(comparisonData.totalEmissions)?.toFixed(3) || 0}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card className={classes.card}>
                  <Typography variant="subtitle1" className={classes.kpiTitle}>
                    Total EU emissions ({comparisonData.year})
                  </Typography>
                  <Typography variant="subtitle2">
                    {parseFloat(comparisonData.totalEUEmissions)?.toFixed(3) ||
                    0}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card className={classes.card}>
                  <Typography variant="subtitle1" className={classes.kpiTitle}>
                    Total EU ETS ({comparisonData.year})
                  </Typography>
                  <Typography variant="subtitle2">
                    {parseFloat(comparisonData.totalEts)?.toFixed(3) || 0}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card className={classes.card}>
                  <Typography variant="subtitle1" className={classes.kpiTitle}>
                    EUA Cost ({comparisonData.year})
                  </Typography>
                  <Typography variant="subtitle2">
                    {parseFloat(comparisonData.totalEuaCost)?.toFixed(3) || 0}
                  </Typography>
                </Card>
              </Grid>
            </>
          )}
          {reportOption?.reportType === REPORT_TYPE_ENUM.GHG && (
            <>
              <Grid item xs={12} md={6}>
                <Card className={classes.card}>
                  <Typography variant="subtitle1" className={classes.kpiTitle}>
                    Net compliance units ({comparisonData.year})
                  </Typography>
                  <Typography variant="subtitle2">
                    {parseFloat(comparisonData.totalNetComplianceUnits)?.toFixed(3) || 0}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card className={classes.card}>
                  <Typography variant="subtitle1" className={classes.kpiTitle}>
                    Vessels with excess compliance units ({comparisonData.year})
                  </Typography>
                  <Typography variant="subtitle2">
                    {parseFloat(comparisonData.excessComplianceUnits)?.toFixed(
                      2,
                    ) || 0}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card className={classes.card}>
                  <Typography variant="subtitle1" className={classes.kpiTitle}>
                    Vessels with penalties ({comparisonData.year})
                  </Typography>
                  <Typography variant="subtitle2">
                    {parseInt(comparisonData.penaltyVesselCount || 0)}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card className={classes.card}>
                  <Typography variant="subtitle1" className={classes.kpiTitle}>
                    Total Penalties ({comparisonData.year})
                  </Typography>
                  <Typography variant="subtitle2">
                    {parseInt(comparisonData.totalPenalties || 0)}
                  </Typography>
                </Card>
              </Grid>
            </>
          )}
          {chartData && !imoAverageMode ? (
            <Grid item xs={12} md={12}>
              <Chart
                xStack
                title={charTitle}
                data={chartData}
                height={400}
                stepSize={1}
                onDblClick={handleDblClickChart}
                onClick={handleClickChart}
                xLabel={companyIds === 'other_companies' ? 'Year' : (selectedVessel ? 'Voyages' : 'Vessels')}
                yLabel={companyIds === 'other_companies' ? 'Average CII Attained/Required' : 'CII Attained'}
              />
            </Grid>
          ) : (
            <Grid item xs={12}>
              <Card className={classes.card}>
                <Typography variant="subtitle1" className={classes.kpiTitle}>
                  IMO average values
                </Typography>
                <Grid item xs={12} md={12}>
                  <LineChart
                    title={'IMO Average CII Attained'}
                    data={multiaxisData}
                    height={400}
                    stepSize={1}
                    onDblClick={handleDblClickChart}
                    onClick={handleClickChart}
                    xLabel="DWT and Vessel Type"
                    yLabel="CII Attained"
                  />
                </Grid>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
    </Root>
  );
};

export default ComparisonBox;
