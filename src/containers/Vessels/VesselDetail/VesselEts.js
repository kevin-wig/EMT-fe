import React, { useEffect, useMemo, useState } from 'react';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

import DataList from '../../../components/Table/DataList';
import LineChart from '../../../components/Charts/LineChart';
import InfoCard from '../../../components/Cards/InfoCard';
import CommonMenu from '../../../components/Forms/CommonMenu';
import CommonDatePicker from '../../../components/Forms/DatePicker';
import BarChart from '../../../components/Charts/BarChart';
import { useVessel } from '../../../context/vessel.context';
import { newColor } from '../../../constants/ChartColors';
import { ETS_VIEW_MODES, EXPORT_OPTION, EXPORT_OPTIONS, MONTHS, VIEW_MODE, YEARS } from '../../../constants/Global';
import { getScreenShot } from '../../../utils/exportAsPdf';
import { download } from '../../../utils/download';
import moment from 'moment';

const PREFIX = 'VesselEts';
const classes = {
  root: `${PREFIX}-root`,
  filterWrapper: `${PREFIX}-filter-wrapper`,
};

const Root = styled('div')(() => ({
  [`&.${classes.root}`]: {},
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

const VesselEts = ({ id, selectedYear }) => {
  const {
    getVesselEts,
    getVesselEtsKpi,
    getVesselEtsCostChart,
    getVesselEtsEuaPercentChart,
    getVesselEtsPerVoyageChart,
    exportEtsAsPdf,
    exportEtsAsExcel,
    loading
  } = useVessel();

  const [mode, setMode] = useState(VIEW_MODE.OVERTIME);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [etsData, setEtsData] = useState([]);
  const [kpi, setKpi] = useState();
  const [costChart, setCostChart] = useState();
  const [costChartPerVoyage, setCostChartPerVoyage] = useState();
  // eslint-disable-next-line no-unused-vars
  const [etsChartPerVoyage, setEtsChartPerVoyage] = useState();
  const [euaPercentChart, setEuaPercentChart] = useState();
  const [costChartYear, setCostChartYear] = useState();
  const [euaPercentChartYear, setEuaPercentChartYear] = useState();

  useEffect(() => {
    getVesselEts(id, mode, fromDate?.toISOString(), toDate?.toISOString()).then((res) => {
      const data = res.data;
      setEtsData(data);
    });
  }, [id, getVesselEts, getVesselEtsKpi, mode, fromDate, toDate]);

  useEffect(() => {
    getVesselEtsKpi(id, selectedYear).then((res) => {
      setKpi(res.data);
    });
  }, [id, selectedYear, getVesselEtsKpi]);

  useEffect(() => {
    getVesselEtsCostChart(id, costChartYear, mode, fromDate?.toISOString(), toDate?.toISOString()).then((res) => {
      if (mode === VIEW_MODE.OVERTIME) {
        setCostChart(res.data);
      } else {
        setCostChartPerVoyage(res.data);
      }
    });
  }, [id, costChartYear, mode, getVesselEtsCostChart, fromDate, toDate]);

  useEffect(() => {
    if (mode === VIEW_MODE.PER_VOYAGE) {
      getVesselEtsPerVoyageChart(id, fromDate?.toISOString(), toDate?.toISOString()).then((res) => {
        setEtsChartPerVoyage(res.data);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, fromDate, toDate]);

  useEffect(() => {
    getVesselEtsEuaPercentChart(id, euaPercentChartYear, mode, fromDate?.toISOString(), toDate?.toISOString()).then((res) => {
      setEuaPercentChart(res.data);
    });
  }, [id, euaPercentChartYear, getVesselEtsEuaPercentChart, mode, fromDate, toDate,]);

  const costOverTimeLabels = useMemo(() => {
    return {
      labels: costChartYear ? MONTHS : YEARS,
      keys: costChartYear ? Object.keys(MONTHS).map((index) => +index + 1) : YEARS,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [costChart]);

  const etsPerVessel = {
    labels: costOverTimeLabels.labels,
    datasets: [
      {
        label: '€',
        fill: true,
        backgroundColor: 'rgba(195,0,202,0.2)',
        borderColor: '#C300CA',
        pointRadius: 5,
        pointBackgroundColor: '#C300CA',
        data: costOverTimeLabels.keys.map((year) => {
          const ets = costChart?.find((ets) => +ets.key === year);
          if (ets) {
            return parseFloat(ets.euaCost)?.toFixed(3) || null;
          } else {
            return null;
          }
        }),
      },
    ],
  };

  const costPerVoyage = useMemo(() => {
    if (costChartPerVoyage) {
      const labels = [...costChartPerVoyage.actual.map(voyage => voyage.key), ...costChartPerVoyage.predicted.map(voyage => voyage.key)];
      return {
        labels: labels.map(label => label),
        datasets: [
          {
            label: 'Actual',
            backgroundColor: newColor(0),
            data: labels.map((key) => parseFloat(costChartPerVoyage.actual.find(voyage => voyage.key === key)?.euaCost)?.toFixed(3)),
            barPercentage: 1,
            categoryPercentage: 1,
          },
          {
            label: 'Predicted',
            backgroundColor: '#C300CA',
            data: labels.map((key) => parseFloat(costChartPerVoyage.predicted.find(voyage => voyage.key === key)?.euaCost)?.toFixed(3)),
            barPercentage: 1,
            categoryPercentage: 0.5,
          },
        ]
      }
    }
    return {};
  }, [costChartPerVoyage]);

  const cumulativeEuaPerVoyage = useMemo(() => {
    if (costChartPerVoyage) {
      const labels = [...costChartPerVoyage.actual.map(voyage => voyage.key), ...costChartPerVoyage.predicted.map(voyage => voyage.key)];
      return {
        labels: labels.map(label => label),
        datasets: [
          {
            label: 'Actual',
            fill: true,
            backgroundColor: 'transparent',
            borderColor: newColor(0),
            pointRadius: 5,
            pointBackgroundColor: newColor(0),
            data: labels.map((sum => (key) => parseFloat(sum += costChartPerVoyage.actual.find(voyage => voyage.key === key)?.euaCost)?.toFixed(3))(0)),
          },
          {
            label: 'Predicted',
            fill: true,
            backgroundColor: 'transparent',
            borderColor: '#C300CA',
            pointRadius: 5,
            pointBackgroundColor: '#C300CA',
            data: labels.map((sum => (key) => parseFloat(sum += costChartPerVoyage.predicted.find(voyage => voyage.key === key)?.euaCost)?.toFixed(3))(0)),
          },
        ]
      }
    }
    return { labels: [], datasets: [] };
  }, [costChartPerVoyage]);

  const euaPercentLabels = useMemo(() => {
    return {
      labels: euaPercentChartYear ? MONTHS : YEARS,
      keys: euaPercentChartYear ? Object.keys(MONTHS).map((index) => +index + 1) : YEARS,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [euaPercentChart]);

  const costsPerVessel = {
    labels: euaPercentLabels.labels,
    datasets: [
      {
        label: 'EUA Cost as % of Bunker Cost',
        fill: true,
        backgroundColor: 'rgba(195,0,202,0.2)',
        borderColor: '#C300CA',
        pointRadius: 5,
        pointBackgroundColor: '#C300CA',
        data: euaPercentLabels.keys.map((year) => {
          const ets = euaPercentChart?.find((ets) => +ets.key === year);
          if (ets) {
            return parseFloat(ets.fpPercent)?.toFixed(3) || null;
          } else {
            return null;
          }
        }),
      },
      {
        label: 'EUA Cost as % of Company\'s Fares',
        fill: true,
        backgroundColor: 'rgba(36,122,255,0.2)',
        borderColor: '#247aff',
        pointRadius: 5,
        pointBackgroundColor: '#247aff',
        data: euaPercentLabels.keys.map((year) => {
          const ets = euaPercentChart?.find((ets) => +ets.key === year);
          if (ets) {
            return parseFloat(ets.bcPercent)?.toFixed(3) || null;
          } else {
            return null;
          }
        }),
      },
    ],
  };

  const percentPerVoyage = useMemo(() => {
    if (mode === VIEW_MODE.PER_VOYAGE && euaPercentChart) {
      return {
        labels: euaPercentChart.map(voyage => voyage.key),
        datasets: [
        {
          label: 'EUA Cost as % of Bunker Cost',
          fill: true,
          backgroundColor: 'transparent',
          borderColor: '#247aff',
          pointBackgroundColor: '#247aff',
          pointRadius: 5,
          data: euaPercentChart.map(voyage => parseFloat(voyage.bcPercent)?.toFixed(3))
        },
        {
          label: 'EUA Cost as % of Company\'s Fares',
          fill: true,
          backgroundColor: 'transparent',
          borderColor: '#C300CA',
          pointBackgroundColor: '#C300CA',
          pointRadius: 5,
          data: euaPercentChart.map(voyage => parseFloat(voyage.fpPercent)?.toFixed(3))
        },
      ],
      }
    }
    return [];
  }, [mode, euaPercentChart]);

  const columns = useMemo(() => [
    {
      title: mode === VIEW_MODE.PER_VOYAGE ? 'Voyage ID' : 'Year',
      key: mode === VIEW_MODE.PER_VOYAGE ? 'voyageId' : 'year'
    },
    {
      title: 'Consumption Metrics',
      key: 'fuelConsumption',
      fixed: true
    },
    ...(mode === VIEW_MODE.PER_VOYAGE ? [
      {
        title: 'Entry type',
        key: 'totalCo2Emission',
      },
      {
        title: 'CO2 per entry / leg',
        key: 'totalCo2Emission',
      },
      {
        title: 'CO2 voyage total',
        key: 'totalCo2Emission',
      },
      {
        title: 'CO2 ETS',
        key: 'totalCo2Ets',
      }] : []
    ),
    {
      title: 'EUA Cost',
      key: 'euaCost',
      fixed: true
    },
    {
      title: 'EUA Cost as % of Bunker Cost',
      key: 'bcPercent',
      fixed: true
    },
    {
      title: 'EUA Cost as % of Company\'s Fares',
      key: 'fpPercent',
      fixed: true
    },
    {
      title: 'ETS',
      key: 'totalCo2Ets',
      fixed: true
    },
    {
      title: 'Date',
      render: (data) => `${moment(data?.minFromDate).format('DD.MM.YYYY')} - ${moment(data?.minToDate).format('DD.MM.YYYY')}`,
    },
  ], [mode]);

  const handleClickCostChart = (elements) => {
    if (Array.isArray(elements) && elements.length > 0) {
      if (!costChartYear) {
        setCostChartYear(costOverTimeLabels.keys[elements[0]._index]);
      }
    }
  };

  const handleDblClickCostChart = (event) => {
    event.preventDefault();
    if (costChartYear) {
      setCostChartYear(undefined);
    }
  };

  const handleClickEuaPercentChart = (elements) => {
    if (Array.isArray(elements) && elements.length > 0) {
      if (!euaPercentChartYear) {
        setEuaPercentChartYear(euaPercentLabels.keys[elements[0]._index]);
      }
    }
  };

  const handleDblClickEuaPercentChart = (event) => {
    event.preventDefault();
    if (euaPercentChartYear) {
      setEuaPercentChartYear(undefined);
    }
  };

  const handleExport = async (value) => {
    if (value === EXPORT_OPTION.XLS) {
      exportEtsAsExcel(id, mode, fromDate?.toISOString(), toDate?.toISOString()).then((res) => {
        download(res, `ETS_${mode}_${Date.now()}.xlsx`,'application/octet-stream');
      });
    } else if (value === EXPORT_OPTION.PDF) {
      const screenshot = await getScreenShot('ets-screenshot');
      exportEtsAsPdf(id, screenshot, mode).then((res) => {
        download(res, `ETS_${mode}_${Date.now()}.pdf`,'application/pdf');
      });
    }
  };

  return (
    <Root className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3} xl={3}>
          <InfoCard title="CO2 ETS" subTitle={selectedYear} value={kpi?.ets} />
        </Grid>
        <Grid item xs={12} md={6} lg={3} xl={3}>
          <InfoCard title="EUA cost" subTitle={selectedYear} value={kpi?.euaCost} />
        </Grid>
        <Grid item xs={12} md={6} lg={3} xl={3}>
          <InfoCard title="Total Bunker Costs" subTitle={selectedYear} value={kpi?.bunkerCost} />
        </Grid>
        <Grid item xs={12} md={6} lg={3} xl={3}>
          <InfoCard
            title="Fares for voyages in EU"
            subTitle={selectedYear}
            value={kpi?.freightProfit}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={12}>
          <Box className={classes.filterWrapper}>
            <CommonMenu
              items={ETS_VIEW_MODES}
              optionLabel="label"
              onChange={setMode}
              label={ETS_VIEW_MODES.find(ciiMode => ciiMode.id === mode)?.label}
            />
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
        <Grid container item xs={12} md={12} spacing={3} id="ets-screenshot">
          {
            mode === VIEW_MODE.OVERTIME && (
              <>
                <Grid item xs={12} md={6}>
                  <LineChart
                    title="EUA per vessel"
                    updatedDate="Update yesterday at 11:59 PM"
                    data={etsPerVessel}
                    onClick={handleClickCostChart}
                    onDblClick={handleDblClickCostChart}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <LineChart
                    title="EUA Cost/Bunker cost and Freight prices"
                    updatedDate="Update yesterday at 11:59 PM"
                    data={costsPerVessel}
                    onClick={handleClickEuaPercentChart}
                    onDblClick={handleDblClickEuaPercentChart}
                  />
                </Grid>
              </>
            )
          }
          {
            mode === VIEW_MODE.PER_VOYAGE && (
              <>
                <Grid item xs={12} md={6}>
                  <BarChart
                    title="EUA Cost"
                    updatedDate="Updated yesterday at 11:59 PM"
                    data={costPerVoyage}
                    scales={{
                      xAxes: [{
                        time: {
                          unit: 'month'
                        },
                        gridLines: {
                          display: false
                        },
                        ticks: {
                          maxTicksLimit: 5
                        },
                        maxBarThickness: 30,
                        stacked: true,
                      }],
                      yAxes: [{
                        ticks: {
                          min: 0,
                        },
                        gridLines: {
                          display: true
                        }
                      }],
                    }}/>
                </Grid>
                <Grid item xs={12} md={6}>
                  <LineChart
                    title="Cumulative EUA"
                    updatedDate="Update yesterday at 11:59 PM"
                    data={cumulativeEuaPerVoyage}
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <LineChart
                    title="Relative EUA Cost"
                    updatedDate="Update yesterday at 11:59 PM"
                    data={percentPerVoyage}
                  />
                </Grid>
              </>
            )
          }
          <Grid item xs={12}>
            <DataList title="Costs breakdown" columns={columns} tableData={etsData} loading={loading} />
          </Grid>
        </Grid>
      </Grid>
    </Root>
  );
};

export default VesselEts;
