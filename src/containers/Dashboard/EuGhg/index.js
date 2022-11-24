import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Grid';

import { useCompany } from '../../../context/company.context';
import { useFleet } from '../../../context/fleet.context';
import InfoCard from '../../../components/Cards/InfoCard';
import HorizontalBarChart from '../../../components/Charts/HorizontalBarChart';
import DataTable from '../../../components/Table/DataTable';
import FilterModal from '../../../components/Modals/FleetModal';
import { useAuth } from '../../../context/auth.context';
import { SUPER_ADMIN } from '../../../constants/UserRoles';
// import { newColor } from '../../../constants/ChartColors';

const DashboardEuGhg = ({ company, thisYear }) => {
  const { me } = useAuth();
  const { getVesselsGhg, getVesselsGhgChart, getVesselsGhgKPIs } = useCompany();
  const { fleets, getFleets } = useFleet();

  const [ghgData, setGhgData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalCount: 0,
    totalPages: 0,
  });
  const [kpi, setKpi] = useState();
  const [ghgChartData, setGhgChartData] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState();
  const [order, setOrder] = useState('ASC');
  const [openFilter, setOpenFilter] = useState(false);

  useEffect(() => {
    if (me?.userRole?.role === SUPER_ADMIN) {
      getFleets();
    }
    if (company) {
      getVesselsGhg(company, { year: thisYear, page, limit })
        .then((res) => {
          const data = res.data;
          setGhgData(data.listData);
          setPagination(data.pagination);
        });
      getVesselsGhgChart(company, thisYear)
        .then((res) => {
          setGhgChartData(res.data);
        });
      getVesselsGhgKPIs(company, thisYear)
        .then((res) => {
          setKpi(res.data);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company, thisYear]);

  useEffect(() => {
    if (company) {
      getVesselsGhg(company, { year: thisYear, page, limit, sortBy, order, search })
        .then((res) => {
          const data = res.data;
          setGhgData(data.listData);
          setPagination(data.pagination);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company, page, limit, sortBy, order, search, thisYear]);

  const complianceUnits = useMemo(() => ({
    labels: [
      'Missing Compliance units',
      'Excess Compliance units',
      `GHGs target (CO2 eq) ${thisYear}`,
      `GHGs actual (CO2 eq) ${thisYear}`,
    ],
    // datasets: ghgChartData && ghgChartData.map((vessel, key) => ({
    //   label: vessel.name,
    //   backgroundColor: newColor(key),
    //   data: [vessel.missing, vessel.excess, vessel.required, vessel.attained],
    //   barPercentage: 0.9,
    //   categoryPercentage: 0.6,
    // })),
    datasets: [
      {
        label: "Vessel 1",
        backgroundColor: "#247AFF",
        borderColor: "#247AFF",
        data: [-1342,0, 24685, 23465],
      } ,
      {
        label: "Vessel 2",
        backgroundColor: "#C300CA ",
        borderColor: "#C300CA",
        data: [0, 1220, 33245, 34587],
      }
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [ghgChartData, thisYear]);

  const certificate = useMemo(() => ({
    labels: [
      'Penalty (€)',
      'Missing Compliance units',
      'Excess compliance units',
    ],
    // datasets: ghgChartData && ghgChartData.map((vessel, key) => ({
    //   label: vessel.name,
    //   backgroundColor: newColor(key),
    //   data: [500, vessel.missing, vessel.excess],
    //   barPercentage: 0.9,
    //   categoryPercentage: 0.6,
    // })),
    datasets: [
      {
        label: "Vessel 1",
        backgroundColor: "#247AFF",
        borderColor: "#247AFF",
        data: [500,-1342, 0],
      } ,
      {
        label: "Vessel 2",
        backgroundColor: "#C300CA ",
        borderColor: "#C300CA",
        data: [0, 0, 1220],
      }
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [ghgChartData, thisYear]);

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
      render: (data) => (
        <>{data.fleet ? data.fleet : 'N/A'}</>
      ),
    },
    {
      title: `GHGs Attained (${thisYear})`,
      key: 'attained',
      render: (data) => (
        <>{data.attained ? data.attained : 'N/A'}</>
      ),
    },
    {
      title: `GHGs Required (${thisYear})`,
      key: 'required',
      render: (data) => (
        <>{data.required ? data.required : 'N/A'}</>
      ),
    },
    {
      title: `Excess GHG credits (${thisYear})`,
      key: 'excess',
    },
    {
      title: 'Penalties (0, 50)',
      key: 'excess',
      render: () => (
        <>0</>
      ),
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
    getVesselsGhg(company, { year: thisYear, page, limit, sortBy, order, search, ...params })
      .then((res) => {
        if (res.data) {
          setGhgData(res.data.listData);
          setPagination(res.data.pagination);
        }
      });
  };

  return (
    <>
      <Grid container spacing={3} sx={{ marginBottom: '1.5rem' }} id="converting-pdf">
        <Grid item xs={12} md={6} lg={3} xl={3}>
          <InfoCard title="Net Compliance units" subTitle={thisYear} value={kpi?.netComplianceUnits || '0'} />
        </Grid>
        <Grid item xs={12} md={6} lg={3} xl={3}>
          <InfoCard
            title="Vessels with excess comp. units"
            subTitle={thisYear}
            value={kpi?.excessVesselCount || '0'}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3} xl={3}>
          <InfoCard title="Vessels with penalties" subTitle={thisYear} value={kpi?.penaltyVesselCount || '0'} />
        </Grid>
        <Grid item xs={12} md={6} lg={3} xl={3}>
          <InfoCard title="Total Penalties" subTitle={thisYear} value="€500" color="secondary" />
        </Grid>
        <Grid item xs={12} md={6}>
          <HorizontalBarChart
            title="GHG actual values vs target values and compliance units"
            data={complianceUnits}
            yMaxTicksLimit={4}
            height={250}
            xLabel="Compliance Units"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <HorizontalBarChart
            title="Compliance units and penalty per vessel"
            data={certificate}
            yMaxTicksLimit={4}
            height={250}
            xLabel="Compliance Units"
          />
        </Grid>
      </Grid>
      <DataTable
        columns={columns}
        tableData={ghgData}
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
        onFilter={handleFilter}
      />
    </>
  );
};

export default DashboardEuGhg;
