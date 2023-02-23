import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import MultiaxisChart from '../../../components/Charts/MultiaxisChart';
import CommonButton from '../../../components/Buttons/CommonButton';
import { useHistory } from 'react-router';

import { useVessel } from '../../../context/vessel.context';
import DataList from '../../../components/Table/DataList';
import LineChart from '../../../components/Charts/LineChart';
import CommonMenu from '../../../components/Forms/CommonMenu';
import CommonDatePicker from '../../../components/Forms/DatePicker';
import StackBarChart from '../../../components/Charts/StackBarChart';
import { pick } from '../../../utils/pick';
import { newColor } from '../../../constants/ChartColors';
import {
  CII_VIEW_MODES,
  EXPORT_OPTION,
  EXPORT_OPTIONS,
  FUEL_GRADES,
  MONTHS,
  VIEW_MODE,
  YEARS
} from '../../../constants/Global';
import { getScreenShot } from '../../../utils/exportAsPdf';
import { download } from '../../../utils/download';
import { Tooltip } from '@mui/material';
import { CII_IMO_VALUES } from '../../ComparisonReport/constants';

const _ = require("lodash");

const PREFIX = 'VesselCII';
const classes = {
  root: `${PREFIX}-root`,
  card: `${PREFIX}-card`,
  cardBody: `${PREFIX}-card-body`,
  input: `${PREFIX}-card-input`,
  wrapper: `${PREFIX}-wrapper`,
  action: `${PREFIX}-action`,
  city: `${PREFIX}-city`,
  infoCell: `${PREFIX}-info-cell`,
  infoCard: `${PREFIX}-info-card`,
  filterWrapper: `${PREFIX}-filter-wrapper`,
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.root}`]: {
    '& .MuiDivider-root': {
      flexGrow: '1',
      borderColor: theme.palette.border.secondary,
    },
  },
  [`& .${classes.card}`]: {
    boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important',
    height: '100%',
    padding: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',

    '&.primary': {
      background: theme.palette.primary.main,
      color: '#fff',
    },

    '&.info': {
      background: theme.palette.info.main,
      color: '#fff',
    },

    '&.speed': {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '2rem',

      '& h4': {
        fontSize: '1.2rem',
        fontWeight: '700',
      },
    },
  },
  [`& .${classes.cardBody}`]: {
    padding: '1.5rem',
    fontSize: '0.9rem',
    flexGrow: '1',
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
  [`& .${classes.city}`]: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1.5rem',
    color: theme.palette.primary.main,
    '& .MuiDivider-root': {
      margin: '0 1rem',
    },
  },
  [`& .${classes.infoCell}`]: {
    border: '1px solid #dee2e6',
    borderRadius: '0.5rem',
    height: '100%',
    '& div': {
      padding: '0.5rem 1rem',
      height: '50%',
    },
    '& h2': {
      fontWeight: '800',
      fontSize: '0.8rem',
    },
    '& h6': {
      fontSize: '0.8rem',
    },
  },
  [`& .${classes.infoCard}`]: {
    padding: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    '& h4': {
      fontWeight: '700',
    },
    '& h2': {
      fontWeight: 700,
    },
  },
  [`& .${classes.filterWrapper}`]: {
    display: 'flex',
    alignItems: 'center',
    '& > *': {
      marginRight: '1rem',
    },
    '& > *:last-child': {
      marginRight: '0',
      marginLeft: 'auto',
    }
  },
}));

const VesselCII = ({ id, selectedYear }) => {
  const {
    loading,
    getVesselCII,
    getVesselCIIChart,
    getVesselStackChartPerVoyage,
    getVesselFuelChartPerVoyage,
    getVesselCIIChartPerTrip,
    getVesselCIIKpiData,
    exportCiiAsPdf,
    exportCiiAsExcel,
  } = useVessel();

  const history = useHistory();

  const [mode, setMode] = useState(VIEW_MODE.OVERTIME);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [kpiData, setKpiData] = useState({});
  const [cii, setCII] = useState([]);
  const [boundCII, setBoundCii] = useState([]);
  const [stackChartData, setStackChartData] = useState([]);
  const [fuelChartData, setFuelChartData] = useState([]);
  /* eslint-disable no-unused-vars */
  const [ciiPerVoyage, setCiiPerVoyage] = useState([]);
  /* eslint-disable no-unused-vars */
  const [boundCiiPerVoyage, setBoundCiiPerVoyage] = useState([]);
  const [ciiPerTrip, setCiiPerTrip] = useState([]);
  const [boundCiiPerTrip, setBoundCiiPerTrip] = useState([]);
  const [chartYear, setChartYear] = useState();

  const getVesselData = useCallback((year, month) => {
    getVesselCII(id, year, month, mode, fromDate?.toISOString(), toDate?.toISOString()).then((res) => {
      setTableData(res.data);
    });
    getVesselCIIChart(id, year, month, mode, fromDate?.toISOString(), toDate?.toISOString()).then((res) => {
      const data = res.data;
      if (mode === VIEW_MODE.OVERTIME) {
        setCII(data.ciis);
        setBoundCii(data.boundCiis);
      } else if (mode === VIEW_MODE.PER_VOYAGE) {
        setCiiPerVoyage(data.ciis);
        setBoundCiiPerVoyage(data.boundCiis);
      }
    });

    if (mode === VIEW_MODE.PER_VOYAGE) {
      getVesselStackChartPerVoyage(id, fromDate?.toISOString(), toDate?.toISOString()).then((res) => {
        setStackChartData(res.data);
      });

      getVesselFuelChartPerVoyage(id, { fromDate: fromDate?.toISOString(), toDate: toDate?.toISOString()
    }).then((res) => {
        setFuelChartData(res.data);
      });

      getVesselCIIChartPerTrip(id, fromDate?.toISOString(), toDate?.toISOString()).then((res) => {
        setCiiPerTrip(res.data?.ciis);
        setBoundCiiPerTrip(res.data?.boundCiis);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, getVesselCII, mode, getVesselCIIChart, fromDate, toDate]);

  useEffect(() => {
    if (id && selectedYear) {
      getVesselCIIKpiData(id, selectedYear).then((res) => {
        setKpiData(res);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, selectedYear]);

  useEffect(() => {
    if (getVesselData) {
      getVesselData(chartYear);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getVesselData, chartYear]);

  const getLine = useCallback((label, bgColor, colorIndex, data, borderDash, color = null) => ({
    label: label,
    fill: true,
    backgroundColor: bgColor,
    borderColor: color === null ? newColor(colorIndex) : color,
    pointRadius: 5,
    pointBackgroundColor: color === null ? newColor(colorIndex) : color,
    ...(borderDash && { borderDash: [4, 4] }),
    data,
  }), []);

  const data = useMemo(() => {
    const defaultBoundCII = { requiredCII: 0, aBound: 0, bBound: 0, cBound: 0, dBound: 0 };
    const ciiLabels = chartYear ? MONTHS : YEARS;
    const ciiKeys = chartYear ? Object.keys(MONTHS).map((index) => +index + 1) : YEARS;
    const boundCIIs = [
      boundCII.find((cii) => +cii.year === chartYear) || { year: chartYear, ...defaultBoundCII },
      boundCII.find((cii) => +cii.year === chartYear + 1) || { year: chartYear + 1, ...defaultBoundCII },
    ];

    return {
      labels: ciiLabels,
      categories: ciiKeys.map((key) => boundCII.find((cii) => +cii.year === key)?.category),
      datasets: [
        getLine('CII attained / CII required', 'transparent', 0, ciiKeys.map((key) => parseFloat((cii.find((cii) => +cii.key === key)?.cii) / (boundCII.find((cii) => +cii.year === key)?.requiredCII))?.toFixed(3) || null)),
        // getLine(
        //   'CII required',
        //   'transparent',
        //   1,
        //   ciiKeys.map((key, index) => chartYear
        //     ? parseFloat(boundCIIs[0].requiredCII + (boundCIIs[1].requiredCII - boundCIIs[0].requiredCII) / 12 * index)?.toFixed(3)
        //     : parseFloat(boundCII.find((cii) => +cii.year === key)?.requiredCII)?.toFixed(3) || null),
        //   true
        // ),
        getLine(
          'A-bound',
          'rgba(240,240,240,0.3)',
          2,
          ciiKeys.map((key, index) => chartYear
            ? parseFloat((boundCIIs[0].aBound + (boundCIIs[1].aBound - boundCIIs[0].aBound) / 12 * index) /  (boundCIIs[0].requiredCII + (boundCIIs[1].requiredCII - boundCIIs[0].requiredCII) / 12 * index))?.toFixed(3)
            : parseFloat((boundCII.find((cii) => +cii.year === key)?.aBound) / (boundCII.find((cii) => +cii.year === key)?.requiredCII))?.toFixed(3) || null),
          true
        ),
        getLine(
          'B-bound',
          'rgba(240,240,240,0.3)',
          3,
          ciiKeys.map((key, index) => chartYear
            ? parseFloat((boundCIIs[0].bBound + (boundCIIs[1].bBound - boundCIIs[0].bBound) / 12 * index) / (boundCIIs[0].requiredCII + (boundCIIs[1].requiredCII - boundCIIs[0].requiredCII) / 12 * index))?.toFixed(3)
            : parseFloat((boundCII.find((cii) => +cii.year === key)?.bBound) / (boundCII.find((cii) => +cii.year === key)?.requiredCII))?.toFixed(3) || null),
          true
        ),
        getLine(
          'C-bound',
          'rgba(240,240,240,0.3)',
          4,
          ciiKeys.map((key, index) => chartYear
            ? parseFloat((boundCIIs[0].cBound + (boundCIIs[1].cBound - boundCIIs[0].cBound) / 12 * index) / (boundCIIs[0].requiredCII + (boundCIIs[1].requiredCII - boundCIIs[0].requiredCII) / 12 * index))?.toFixed(3)
            : parseFloat((boundCII.find((cii) => +cii.year === key)?.cBound) / (boundCII.find((cii) => +cii.year === key)?.requiredCII))?.toFixed(3) || null),
          true,
          "#1145A5"
        ),
        getLine(
          'D-bound',
          'rgba(240,240,240,0.3)',
          5,
          ciiKeys.map((key, index) => chartYear
            ? parseFloat((boundCIIs[0].dBound + (boundCIIs[1].dBound - boundCIIs[0].dBound) / 12 * index) / (boundCIIs[0].requiredCII + (boundCIIs[1].requiredCII - boundCIIs[0].requiredCII) / 12 * index))?.toFixed(3)
            : parseFloat((boundCII.find((cii) => +cii.year === key)?.dBound) / (boundCII.find((cii) => +cii.year === key)?.requiredCII))?.toFixed(3) || null),
          true
        ),
      ],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cii, boundCII]);

  const ciiChartPerTrip = useMemo(() => {
    const ciiLabels = ciiPerTrip.map(voyage => `${voyage.voyageId}`);

    return {
      labels: ciiLabels,
      datasets: [
        getLine('CII attained', 'transparent', 0, ciiPerTrip.map(voyage => parseFloat(voyage.cii)?.toFixed(3))),
        getLine('CII required', 'transparent', 1, ciiLabels.map(() => parseFloat(boundCiiPerTrip.requiredCII)?.toFixed(3) || 0), true),
        getLine('A-bound', 'rgba(240,240,240,0.3)', 2, ciiLabels.map(() => parseFloat(boundCiiPerTrip.aBound)?.toFixed(3) || 0), true),
        getLine('B-bound', 'rgba(240,240,240,0.3)', 3, ciiLabels.map(() => parseFloat(boundCiiPerTrip.bBound)?.toFixed(3) || 0), true),
        getLine('C-bound', 'rgba(240,240,240,0.3)', 4, ciiLabels.map(() => parseFloat(boundCiiPerTrip.cBound)?.toFixed(3) || 0), true, "#1145A5"),
        getLine('D-bound', 'rgba(240,240,240,0.3)', 5, ciiLabels.map(() => parseFloat(boundCiiPerTrip.dBound)?.toFixed(3) || 0), true),
      ],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ciiPerTrip, boundCiiPerTrip]);

  const ciiChartPerVoyage = useMemo(() => {
    // const ciiLabels = ciiPerVoyage.map(voyage => voyage.voyageId);

    // return {
    //   labels: ciiLabels,
    //   datasets: [
    //     getLine('CII attained', 'transparent', 0, ciiPerVoyage.map(voyage => voyage.cii)),
    //     getLine('CII required', 'transparent', 1, ciiLabels.map(() => boundCiiPerVoyage.requiredCII || 0), true),
    //     getLine('A-bound', 'rgba(240,240,240,0.3)', 2, ciiLabels.map(() => boundCiiPerVoyage.aBound || 0), true),
    //     getLine('B-bound', 'rgba(240,240,240,0.3)', 3, ciiLabels.map(() => boundCiiPerVoyage.bBound || 0), true),
    //     getLine('C-bound', 'rgba(240,240,240,0.3)', 4, ciiLabels.map(() => boundCiiPerVoyage.cBound || 0), true),
    //     getLine('D-bound', 'rgba(240,240,240,0.3)', 5, ciiLabels.map(() => boundCiiPerVoyage.dBound || 0), true),
    //   ],
    // };

    const ciiLabels = ciiPerTrip.map(voyage => `${voyage.voyageId}`);
    const ciiLabelsAndIds = ciiPerTrip.map(voyage => ({ voyageId: voyage.voyageId, id: voyage.id }))

    let emissionSum = 0;
    let distanceSum = 0;

    const calculatedCiiPerTrip = [...ciiPerTrip]
    
    calculatedCiiPerTrip.map((voyage, index) => {
      if (voyage.vesselId !== ciiPerTrip[index - 1]?.vesselId) {
        emissionSum = 0;
        distanceSum = 0;
      }

      emissionSum += parseFloat(voyage.emissions) || 0;
      distanceSum += parseFloat(voyage.distance) || 0;

      return voyage.calculatedCii = (1000000 * emissionSum) / distanceSum / voyage.dwt;
    })

    const actualPoints = calculatedCiiPerTrip.filter(q => q.voyageType === "ACTUAL").map(item => ({id: item.id, calculatedCii: item.calculatedCii || null}))
    const actualPointIds = actualPoints.map(item => item.id)
    const predictedPoints =  calculatedCiiPerTrip.filter(q => q.voyageType === "PREDICTED" && !actualPointIds.includes(q.id)).map(item => ({id: item.id, calculatedCii: item.calculatedCii || null}))

    const actualPointsToUse = [...actualPoints];

    if (predictedPoints.length !== 0) {
      actualPointsToUse.push(predictedPoints[0]);
    }

    return {
      labels: ciiLabels,
      datasets: [
        {
          label: "CII attained ACTUAL",
          fill: true,
          backgroundColor: "transparent",
          borderColor: newColor(0),
          pointRadius: 5,
          pointBackgroundColor: newColor(0),
          data:  ciiLabelsAndIds.map(
            ({id}) =>
              parseFloat(actualPointsToUse.find((voyage) => voyage.id === id)?.calculatedCii)?.toFixed(3)
          ),
        },
        {
          label: "CII attained PREDICTED",
          fill: true,
          backgroundColor: "transparent",
          borderColor: "#C300CA",
          pointRadius: 5,
          pointBackgroundColor: "#C300CA",
          data:  ciiLabelsAndIds.map(
            ({id}) =>
              parseFloat(predictedPoints.find((voyage) => voyage.id === id)?.calculatedCii)?.toFixed(3) || null
          ),
        },
        getLine('CII required', 'transparent', 1, ciiLabels.map(() => parseFloat(boundCiiPerTrip.requiredCII)?.toFixed(3) || 0), true),
        getLine('A-bound', 'rgba(240,240,240,0.3)', 2, ciiLabels.map(() => parseFloat(boundCiiPerTrip.aBound)?.toFixed(3) || 0), true),
        getLine('B-bound', 'rgba(240,240,240,0.3)', 3, ciiLabels.map(() => parseFloat(boundCiiPerTrip.bBound)?.toFixed(3) || 0), true),
        getLine('C-bound', 'rgba(240,240,240,0.3)', 4, ciiLabels.map(() => parseFloat(boundCiiPerTrip.cBound)?.toFixed(3) || 0), true, "#1145A5"),
        getLine('D-bound', 'rgba(240,240,240,0.3)', 5, ciiLabels.map(() => parseFloat(boundCiiPerTrip.dBound)?.toFixed(3) || 0), true),
      ],
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ciiPerTrip, boundCiiPerTrip]);

  const stackChartPerVoyage = useMemo(() => {
    const fuels = stackChartData.reduce((allFuels, voyage) => {
      const { voyageId, distanceTraveled, ...fuelEmissions } = voyage;
      Object.entries(fuelEmissions).filter((fe) => fe[1] > 0).forEach((fuel) => {
        if (allFuels.indexOf(fuel[0]) === -1) allFuels.push(fuel[0]);
      });
      return allFuels;
    }, []);

    return {
      labels: stackChartData.map((voyage) => voyage.voyageId),
      datasets: [
        ...fuels.map((fuel, index) => ({
          label: FUEL_GRADES.find((f) => f.value.toLowerCase() === fuel)?.label,
          backgroundColor: newColor(index),
          borderColor: newColor(index),
          data: stackChartData.map((voyage) => parseFloat(voyage[fuel.toLowerCase()])?.toFixed(3)),
        })),
        {
          type: 'line',
          label: 'Distance travelled in NM',
          data: stackChartData.map((voyage) => parseFloat(voyage.distanceTraveled)?.toFixed(3)),
          fill: true,
          backgroundColor: 'transparent',
          borderColor: '#777',
          borderDash: [4, 4],
          pointRadius: 5,
          pointBackgroundColor: '#777',
          pointBorderColor: '#777',
          pointHoverBackgroundColor: '#777'
        }
      ],
    };
  }, [stackChartData]);

  const fuelChartPerVoyage = useMemo(() => {
    const fuels = fuelChartData.reduce((allFuels, voyage) => {
      const { voyageId, cost, ...fuelEmissions } = voyage;
      Object.entries(fuelEmissions).filter((fe) => fe[1] > 0).forEach((fuel) => {
        if (allFuels.indexOf(fuel[0]) === -1) allFuels.push(fuel[0]);
      });
      return allFuels;
    }, []);

    return {
      labels: fuelChartData.map((voyage) => voyage.voyageId),
      datasets: [
        {
          type: 'line',
          label: 'Cost',
          data: fuelChartData.map((voyage) => parseFloat(voyage.cost)?.toFixed(3)),
          fill: true,
          backgroundColor: 'transparent',
          borderColor: 'red',
          pointRadius: 5,
          pointBackgroundColor: 'red',
          pointBorderColor: 'red',
          pointHoverBackgroundColor: 'red',
          yAxisID: 'y-axis-2',
        },
        ...fuels.map((fuel, index) => ({
          label: FUEL_GRADES.find((f) => f.value.toLowerCase() === fuel)?.label,
          backgroundColor: newColor(index),
          borderColor: newColor(index),
          data: fuelChartData.map((voyage) => parseFloat(voyage[fuel.toLowerCase()])?.toFixed(3)),
          yAxisID: 'y-axis-1',
        }))
      ],
    };
  }, [fuelChartData]);


  const FormatNumber = (value, decimals) => {
    if (!isNaN(parseFloat(value)) && !isNaN(value - 0)) {
      return parseFloat(Number(value).toFixed(decimals))
    } else {
      return <Tooltip title="No data available" placement="top"><span>N/A</span></Tooltip>
    }
  };

  const CardData = useMemo(() => [
    {
      topLabel: `CO2 Emissions (${selectedYear})`,
      topValue: FormatNumber(kpiData?.emissions, 2),
      bottomLabel: `Distance Travelled (${selectedYear})`,
      bottomValue: FormatNumber(kpiData?.distanceTraveled, 2),
    },
    {
      topLabel: 'Vessel Category',
      topValue: kpiData?.vesselType ? kpiData?.vesselType : <Tooltip title="No data available" placement="top"><span>N/A</span></Tooltip>,
      bottomLabel: 'DWT',
      bottomValue: FormatNumber(kpiData?.dwt, 2),
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [kpiData, selectedYear]);

  const ImoValue = useMemo(() => {
    if (kpiData?.vesselType) {
      const ciiValues = CII_IMO_VALUES.find((ranges) => ranges.type == kpiData?.vesselType);

      const imo = ciiValues?.values.find((value) => {
        let splittedDwt = value.dwt.split(/[+|-]/g);

        return splittedDwt[1].length === 0 ? kpiData?.dwt >= splittedDwt[0] : _.inRange(kpiData?.dwt, Number(splittedDwt[0]), Number(splittedDwt[1]));
      });

      return imo?.imoValue;
    }

    return 0;

  }, [kpiData, selectedYear])

  const columns = [
    {
      title: mode === VIEW_MODE.OVERTIME ? 'Year' : 'Voyage ID',
      key: mode === VIEW_MODE.OVERTIME ? 'year' : 'voyageId',
    },
    {
      title: 'Emissions',
      key: 'emissions',
      fixed: true,
    },
    {
      title: 'Fuel Types',
      render: (data) => (
        <>
          {getPrimaryFuel(data)}
        </>
      ),
    },
    {
      title: 'CII Attained',
      key: 'cii',
      fixed: true,
    },
    {
      title: 'CII Required',
      key: 'requiredCII',
      fixed: true,
    },
    {
      title: 'CII A/R',
      key: 'ciiRate',
      fixed: true,
    },
    {
      title: 'Category',
      key: 'category',
    },
  ];

  const getPrimaryFuel = (data) => {
    var fuelTypes = "";
    Object.entries(pick(data, ['mgo', 'lfo', 'hfo', 'lng', 'vlsfo','vlsfo_xb','vlsfo_ad','vlsfo_ek','lpg_bt','lpg_pp','bio_fuel'])).forEach(f => {
      if (f[1] > 0) { fuelTypes += FUEL_GRADES.find((g) => g.value.toLowerCase() === f[0])?.label + ',' }
    });
    return fuelTypes.substring(0, fuelTypes.length - 1);
  };

  const handleDblClickChart = (event) => {
    event.preventDefault();
    if (chartYear) {
      setChartYear(undefined);
    } else {
    }
  };

  const handleClickChart = (elements) => {
    if (Array.isArray(elements) && elements.length > 0) {
      if (!chartYear) {
        setChartYear(YEARS[elements[0]._index]);
      }
    }
  };

  const handleExport = async (value) => {
    if (value === EXPORT_OPTION.XLS) {
      exportCiiAsExcel(id, mode, fromDate?.toISOString(), toDate?.toISOString()).then((res) => {
        download(res, `CII_${mode}_${Date.now()}.xlsx`, 'application/octet-stream');
      });
    } else if (value === EXPORT_OPTION.PDF) {
      const screenshot = await getScreenShot('cii-screenshot');
      exportCiiAsPdf(id, screenshot, mode).then((res) => {
        download(res, `CII_${mode}_${Date.now()}.pdf`, 'application/pdf');
      });
    }
  };

  const navigateToVoyage = (ciiModeId) => {
    if (ciiModeId === VIEW_MODE.PER_VOYAGE){
      history.push(`/voyage`, id)
    }
    setMode(ciiModeId);
  };

  return (
    <Root className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Card className={`${classes.card} speed info`}>
            <Box sx={{ marginBottom: '0.5rem' }}>
              <Typography align="center">
                {`CII Attained (${selectedYear})`}
              </Typography>
              <Typography component="h4" align="center">
                {FormatNumber(kpiData?.cii, 3)}
              </Typography>
            </Box>
            <Box>
              <Typography align="center">
                IMO Average
              </Typography>
              <Typography component="h4" align="center">
                {ImoValue}
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card className={`${classes.card} speed`}>
            <Box>
              <Typography align="center">
                Emissions Category
              </Typography>
              <Typography component="h4" align="center">
                {kpiData?.category || 'A'}
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card className={classes.card}>
            <Box className={classes.cardBody}>
              <Grid container item spacing={4} sx={{ height: 'calc(100% + 32px)' }}>
                {CardData.map((item) => (
                  <Grid key={item.topLabel} item xs={12} md={6}>
                    <Box className={classes.infoCell}>
                      <Box>
                        <Typography varaiant="body1" component="h6">{item.topLabel}</Typography>
                        <Typography varaiant="body" component="h2">{item.topValue}</Typography>
                      </Box>
                      <Divider />
                      <Box>
                        <Typography varaiant="body1" component="h6">{item.bottomLabel}</Typography>
                        <Typography varaiant="body" component="h2">{item.bottomValue}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={12}>
          <Box className={classes.filterWrapper}>
             {CII_VIEW_MODES?.length > 0 && CII_VIEW_MODES.map((item, key) => (
              <CommonButton color={item.id === VIEW_MODE.OVERTIME ? 'success' : ''} key={key} onClick={() => navigateToVoyage(item.id)}>
                {item.label}
              </CommonButton>
             ))}
            {
              mode === VIEW_MODE.PER_VOYAGE && (
                <>
                  <CommonDatePicker
                    name="fromDate"
                    placeholder="Select Date from"
                    value={fromDate}
                    onChange={setFromDate}
                  />
                  <CommonDatePicker
                    name="toDate"
                    placeholder="Select Date to"
                    value={toDate}
                    onChange={setToDate}
                  />
                </>
              )
            }
            <CommonMenu
              label="Export as"
              items={EXPORT_OPTIONS}
              onChange={handleExport}
            />
          </Box>
        </Grid>
        <Grid container item xs={12} md={12} spacing={3} id="cii-screenshot">
          {
            mode === VIEW_MODE.OVERTIME && (
              <Grid item xs={12} md={12}>
                <LineChart
                  title="CII over time"
                  data={data}
                  onClick={handleClickChart}
                  onDblClick={handleDblClickChart}
                  useCategory={true}
                  xLabel="Year"
                  yLabel="CII Attained / CII Required"
                />
              </Grid>
            )
          }
          {
            mode === VIEW_MODE.PER_VOYAGE && (
              <>
                <Grid item xs={12} md={6}>
                  <LineChart
                    title="CII per voyage"
                    data={ciiChartPerTrip}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <LineChart
                    title="Cumulative CII per voyage"
                    data={ciiChartPerVoyage}
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <StackBarChart
                    title="Emissions and distance per voyage"
                    data={stackChartPerVoyage}
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <MultiaxisChart
                    title="Comparison of fuel types and cost"
                    data={fuelChartPerVoyage}
                  />
                </Grid>
              </>
            )
          }
          <Grid item xs={12}>
            <DataList title="Emissions breakdown" columns={columns} tableData={tableData} loading={loading} />
          </Grid>
        </Grid>
      </Grid>
    </Root>
  );
};

export default VesselCII;
