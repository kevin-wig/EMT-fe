import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import useTheme from '@mui/material/styles/useTheme';

import BarChart from '../../../components/Charts/BarChart';
import DataTable from '../../../components/Table/DataTable';
import FilterModal from '../../../components/Modals/FleetModal';
import InfoCard from '../../../components/Cards/InfoCard';
import LineChart from '../../../components/Charts/LineChart';
import { useCompany } from '../../../context/company.context';
import { useSnackbar } from '../../../context/snack.context';
import { useDebounce } from '../../../hooks/use-debounce';
import { useVessel } from '../../../context/vessel.context';
import { useFleet } from '../../../context/fleet.context';
import moment from 'moment';

const DashboardEuEts = ({ company, thisYear, /*type*/ }) => {
  const theme = useTheme();

  const { notify } = useSnackbar();

  const {
    getVesselsEts,
    getVesselsEtsKPI,
    getVesselsEtsChart,
    getVesselsCostChart,
    loading,
  } = useCompany();
  const { fuels, getFuels } = useVessel();
  const { fleets, getFleets } = useFleet();

  const [etsChart, setEtsChart] = useState([]);
  const [costChart, setCostChart] = useState([]);
  const [etsData, setEtsData] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState();
  const [kpi, setKpi] = useState({});
  const [order, setOrder] = useState('ASC');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalCount: 0,
    totalPages: 0,
  });
  const [openFilter, setOpenFilter] = useState(false);

  const debouncedSearchWord = useDebounce(search, 300);

  const fetchEtsList = useCallback(() => {
    let params = { order, sortBy, page, limit, year: thisYear };

    if (search) {
      params = { ...params, year: thisYear, search: debouncedSearchWord,/* voyageType: type*/ };
    }

    if (company) {
      getVesselsEts(company, params)
        .then((res) => {
          const data = res.data;
          setEtsData(data.listData);
          setPagination(data.pagination);
        })
        .catch((err) => {
          if (err?.response?.data) {
            notify(err.response.data.message, 'error');
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchWord, /*type,*/ page, order, sortBy, limit, thisYear, company]);

  useEffect(() => {
    if (getFleets) {
      getFleets();
    }

    if (getFuels) {
      getFuels();
    }
  }, [getFleets, getFuels]);

  useEffect(() => {
    fetchEtsList();
  }, [fetchEtsList]);

  useEffect(() => {
    if (company) {
      getVesselsEtsKPI(company, thisYear)
        .then((res) => {
          setKpi(res.data);
        });
      getVesselsEtsChart(company, thisYear)
        .then((res) => {
          setEtsChart(res.data);
        });
      getVesselsCostChart(company, thisYear)
        .then((res) => {
          setCostChart(res.data);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company, thisYear]);

  const euPerVessel = {
    labels: etsChart.map((vessel) => vessel.name),
    datasets: [
      {
        label: 'CO2',
        fill: true,
        backgroundColor: 'rgba(195,0,202,0.2)',
        borderColor: theme.palette.info.main,
        pointRadius: 5,
        pointBackgroundColor: theme.palette.info.main,
        data: etsChart.map((vessel) => parseFloat(vessel.emission)?.toFixed(3) || null),
      },
      {
        label: 'ETS',
        fill: true,
        backgroundColor: 'rgba(36,122,255,0.2)',
        borderColor: theme.palette.primary.main,
        pointRadius: 5,
        pointBackgroundColor: theme.palette.primary.main,
        data: etsChart.map((vessel) => parseFloat(vessel.ets)?.toFixed(3) || null),
      },
    ],
  };

  const certificate = {
    labels: costChart.map((vessel) => vessel.name),
    datasets: [
      {
        label: 'EUA cost',
        backgroundColor: theme.palette.info.main,
        data: costChart.map((vessel) => vessel.euaCost || 0),
        barPercentage: 0.8,
        categoryPercentage: 0.8,
      },
      {
        label: 'EU Fares',
        backgroundColor: theme.palette.primary.main,
        data: costChart.map((vessel) => vessel.freightProfit || 0),
        barPercentage: 0.8,
        categoryPercentage: 0.8,
      },
      {
        label: 'Bunker cost',
        backgroundColor: '#E8EBED',
        data: costChart.map((vessel) => vessel.bunkerCost || 0),
        barPercentage: 0.8,
        categoryPercentage: 0.8,
      },
    ],
  };

  const columns = [
    {
      title: 'Name',
      key: 'name',
      sortable: true,
      render: (data) => (
        <Link to={`/vessels/${data.id}`}>{data.name}</Link>
      ),
    },
    {
      title: 'IMO',
      key: 'imo',
      sortable: true,
    },
    {
      title: 'Fleet',
      key: 'fleet',
      sortable: true,
    },
    {
      title: 'Year',
      key: 'year',
      render: (data) => (
        <>{data.year ? data.year : thisYear}</>
      ),
    },
    {
      title: 'Consumption Metrics',
      key: 'fuelConsumption',
      fixed: true
    },
    {
      title: `CO2 Emissions (${thisYear})`,
      key: 'totalCo2Emission',
      fixed: true
    },
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
      fixed: true,
    },
    {
      title: 'Date',
      render: (data) => `${moment(data?.minFromDate).format('DD.MM.YYYY')} - ${moment(data?.maxToDate).format('DD.MM.YYYY')}`,
    },
  ];

  const handleChangeSort = (value) => {
    if (value === sortBy) {
      setOrder(order === 'DESC' ? 'ASC' : 'DESC');
    } else {
      setSortBy(value);
      setOrder('ASC');
    }
  };

  const handleFilter = (params) => {
    getVesselsEts(company, { order, sortBy, page, limit, year: thisYear, ...params })
      .then((res) => {
        const data = res.data;
        setEtsData(data.listData);
        setPagination(data.pagination);
      })
      .catch((err) => {
        if (err?.response?.data) {
          notify(err.response.data.message, 'error');
        }
      });
  };

  return (
    <>
      <Grid container spacing={3} sx={{ marginBottom: '1.5rem' }} id="converting-pdf">
        <Grid item xs={12} md={6} lg={3}>
          <InfoCard title="Total CO2 ETS" subTitle={thisYear} value={kpi?.totalEts || '0'} />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <InfoCard title="EUA cost" subTitle={thisYear} value={`€${kpi?.totalEuaCost || '0'}`} />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <InfoCard
            title="Freight profit for EU voyages"
            subTitle={thisYear}
            value= {kpi?.freightProfit ? `€${parseFloat(kpi?.freightProfit).toFixed(3)}` : '€0'}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <InfoCard
            title="Total Bunker Costs"
            subTitle={thisYear}
            value= {kpi?.totalBunkerCost ? `€${parseFloat(kpi?.totalBunkerCost).toFixed(3)}` : '€0' } 
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <LineChart
            title="CO2 and ETS CO2 emissions(2023)"
            updatedDate="Update yesterday at 11:59 PM"
            data={euPerVessel}
            height={200}
            xLabel="Vessel"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <BarChart
            title="Comparison of vessels allowance cost with the fares and bunkers cost for 2023"
            updatedDate="Update yesterday at 11:59 PM"
            data={certificate}
            yMaxTicksLimit={4}
            height={200}
            xLabel="Vessel"
            yLabel="Cost (€)"
          />
        </Grid>
      </Grid>
      <DataTable
        columns={columns}
        tableData={etsData}
        search={search}
        order={order}
        sortBy={sortBy}
        pagination={pagination}
        onChangePage={setPage}
        onChangeLimit={setLimit}
        onChangeSearch={setSearch}
        onChangeSortBy={handleChangeSort}
        loading={loading}
        openFilterModal={() => setOpenFilter(true)}
      />
      <FilterModal
        open={openFilter}
        setOpen={setOpenFilter}
        fleets={fleets}
        fuels={fuels}
        onFilter={handleFilter}
      />
    </>
  );
};

export default DashboardEuEts;
