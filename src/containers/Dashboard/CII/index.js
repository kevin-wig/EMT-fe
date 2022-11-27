import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Grid';

import { useAuth } from '../../../context/auth.context';
import { useCompany } from '../../../context/company.context';
import { useFleet } from '../../../context/fleet.context';
import { useSnackbar } from '../../../context/snack.context';
import { useVessel } from '../../../context/vessel.context';
import LineChart from '../../../components/Charts/LineChart';
import InfoCard from '../../../components/Cards/InfoCard';
import BarChart from '../../../components/Charts/BarChart';
import DataTable from '../../../components/Table/DataTable';
import FilterModal from '../../../components/Modals/FleetModal';
import { SUPER_ADMIN } from '../../../constants/UserRoles';
import { newColor } from '../../../constants/ChartColors';
import { MONTHS, VESSEL_CATEGORIES, VESSEL_CATEGORIES_ENUM } from '../../../constants/Global';
import { genYearArray } from '../../../utils/yearArray';

const DashboardCII = ({ company, thisYear, type }) => {
  const { me } = useAuth();
  const isSuperAdmin = me?.userRole?.role === SUPER_ADMIN;

  const {
    getVesselsCIIByCompany,
    getVesselsCIIChart,
    getVesselsCIIKpi,
    getVesselsEmissionChart,
    loading,
  } = useCompany();

  const { fuels, getFuels } = useVessel();
  const { fleets, getFleets } = useFleet();
  const { notify } = useSnackbar();

  const [vessels, setVessels] = useState([]);
  const [vesselsChart, setVesselsChart] = useState({ chart: [] });
  const [vesselsEmissionChart, setVesselsEmissionChart] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState();
  const [kpi, setKpi] = useState({});
  const [order, setOrder] = useState('ASC');
  const [openFilter, setOpenFilter] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalCount: 0,
    totalPages: 0,
  });
  const [ciiChartYear, setCiiChartYear] = useState();
  const [categoryChartYear, setCategoryChartYear] = useState();
  const [totalDistanceTraveled, setTotalDistanceTraveled] = useState(0);

  useEffect(() => {
    if (getFleets && isSuperAdmin) {
      getFleets();
    }

    if (getFuels) {
      getFuels();
    }
  }, [isSuperAdmin, getFleets, getFuels, type]);

  useEffect(() => {
    if (company) {
      getVesselsCIIChart(company, undefined, type)
        .then((res) => {
          setVesselsChart(res.data);
        });

      getVesselsEmissionChart(company, undefined, type)
        .then((res) => {
          setVesselsEmissionChart(res.data);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company, type]);

  useEffect(() => {
    if (company) {
      getVesselsCIIKpi(company, thisYear, type)
        .then((res) => {
          setKpi(res.data);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company, thisYear, type]);

  useEffect(() => {
    if (company) {
      getVesselsCIIChart(company, ciiChartYear, type)
        .then((res) => {
          setVesselsChart(res.data);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company, ciiChartYear, type]);

  useEffect(() => {
    if (company) {
      getVesselsEmissionChart(company, categoryChartYear, type)
        .then((res) => {
          setVesselsEmissionChart(res.data);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company, categoryChartYear, type]);

  useEffect(() => {
    if (company) {
      getVesselsCIIByCompany(company, { year: thisYear, page, limit, sortBy, order, search, type /*voyageType: type*/ })
        .then((res) => {
          const data = res.data;
          setVessels(data.listData);
          setPagination(data.pagination);
          setTotalDistanceTraveled(data.totalDistance)
        })
        .catch((err) => {
          if (err?.response?.data) {
            notify(err.response.data.message, 'error');
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company, page, limit, type, sortBy, order, search, thisYear]);

  const ciiOverTimeLabels = useMemo(() => {
    const years = genYearArray(vesselsChart?.chart.reduce((acc, dt) => [
      ...acc,
      ...(dt?.data?.map((datum) => datum.key) || []),
    ], [2026]));

    return {
      labels: ciiChartYear ? MONTHS : years,
      keys: ciiChartYear ? Object.keys(MONTHS).map((index) => +index + 1) : years,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vesselsChart]);

  const ciiOverTime = useMemo(() => {
    return {
      labels: ciiOverTimeLabels.labels,
      datasets: vesselsChart?.chart.map((vessel, index) => (
        {
          label: vessel.name,
          fill: true,
          backgroundColor: 'transparent',
          borderColor: newColor(index),
          pointRadius: 5,
          pointBackgroundColor: newColor(index),
          data: ciiOverTimeLabels.keys.map((key) =>
            parseFloat(vessel.data.find((item) => +item.key === +key)?.cii)?.toFixed(3) || null),
        }
      )),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ciiOverTimeLabels, type]);

  const categoryLabels = useMemo(() => {
    const years = genYearArray(vesselsEmissionChart?.reduce((acc, dt) => [
      ...acc,
      ...(dt?.data?.map((datum) => datum.key) || []),
    ], [2026]));

    return {
      labels: categoryChartYear ? MONTHS : years,
      keys: categoryChartYear ? Object.keys(MONTHS).map((index) => +index + 1) : years,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vesselsEmissionChart, type]);

  const certificate = useMemo(() => {
    const categories = Array.from(new Set(vesselsEmissionChart.reduce((acc, dt) => [
      ...acc,
      ...(dt?.data?.map((datum) => datum.category) || []),
    ], []))).sort();

    return {
      labels: categoryLabels.labels,
      datasets: VESSEL_CATEGORIES.map((category) => ({
        label: category,
        backgroundColor: newColor(VESSEL_CATEGORIES_ENUM[category]),
        data: categoryLabels.keys.map((key) => vesselsEmissionChart
          .filter((dt) => dt?.data?.find((datum) => +datum.key === +key && datum.category === category)).length),
        barPercentage: 0.7,
        categoryPercentage: 1,
      })),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryLabels]);

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (data) => (
        <Link to={`/vessels/${data.id}`}>{data.name}</Link>
      ),
    },
    {
      title: 'IMO',
      key: 'imo',
    },
    {
      title: 'Fleet',
      key: 'fleet',
    },
    {
      title: `CO2 Emissions (${thisYear})`,
      key: 'emissions',
      fixed: true,
    },
    {
      title: `CII Attained (${thisYear})`,
      key: 'cii',
      fixed: true,
    },
    {
      title: `CII Required (${thisYear})`,
      key: 'requiredCII',
      fixed: true,
    },
    {
      title: 'Category',
      key: 'category',
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
    getVesselsCIIByCompany(company, {
      year: thisYear, page, limit, sortBy, order, search, ...params, type
    })
      .then((res) => {
        const data = res.data;
        setVessels(data.listData);
      })
      .catch((err) => {
        if (err?.response?.data) {
          notify(err.response.data.message, 'error');
        }
      });
  };

  const handleDblClickCiiChart = (event) => {
    event.preventDefault();
    if (ciiChartYear) {
      setCiiChartYear(undefined);
    } else {
    }
  };

  const handleClickCiiChart = (instance, elements) => {
    if (Array.isArray(elements) && elements.length > 0) {
      if (!ciiChartYear) {
        setCiiChartYear(ciiOverTimeLabels.keys[elements[0].index]);
      }
    }
  };

  const handleDblClickCategoryChart = (event) => {
    event.preventDefault();
    if (categoryChartYear) {
      setCategoryChartYear(undefined);
    } else {
    }
  };

  const handleClickCategoryChart = (instance, elements) => {
    if (Array.isArray(elements) && elements.length > 0) {
      if (!categoryChartYear) {
        setCategoryChartYear(categoryLabels.keys[elements[0].index]);
      }
    }
  };

  console.log(certificate);
  return (
    <>
      <Grid container spacing={3} sx={{ marginBottom: '1.5rem' }} id="converting-pdf">
        <Grid item xs={12} md={6}>
          <InfoCard
            title="Total emissions"
            subTitle={`${thisYear} (Mts)`}
            value={(!kpi.totalEmissions || isNaN(kpi.totalEmissions)) ? '0' : parseFloat(kpi.totalEmissions).toFixed(3)}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <InfoCard title="Total Distance" subTitle={thisYear} value={totalDistanceTraveled} />
        </Grid>
        <Grid item xs={12} md={6}>
          <LineChart
            title="CII over time"
            data={ciiOverTime}
            yMaxTicksLimit={5}
            height={200}
            onClick={handleClickCiiChart}
            onDblClick={handleDblClickCiiChart}
            xLabel="Year"
            yLabel="CII Attained / CII Required"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <BarChart
            title="CII Categories Per Year"
            data={certificate}
            yMax={3}
            yMaxTicksLimit={4}
            height={200}
            onClick={handleClickCategoryChart}
            onDblClick={handleDblClickCategoryChart}
            xLabel="Year"
            yLabel="Number of Vessels"
          />
        </Grid>
      </Grid>
      <DataTable
        columns={columns}
        tableData={vessels}
        search={search}
        order={order}
        sortBy={sortBy}
        pagination={pagination}
        onChangePage={setPage}
        onChangeLimit={setLimit}
        onChangeSearch={setSearch}
        onChangeSortBy={handleChangeSort}
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

export default DashboardCII;
