import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useHistory } from 'react-router';

import { useAuth } from '../../context/auth.context';
import { useFleet } from '../../context/fleet.context';
import { useVessel } from '../../context/vessel.context';
import { useSnackbar } from '../../context/snack.context';
import { getVesselSample } from '../../services/vessel.service';
import CommonButton from '../../components/Buttons/CommonButton';
import Dropzone from '../../components/Forms/Dropzone';
import DataTable from '../../components/Table/DataTable';
import FilterModal from '../../components/Modals/FleetModal';
import { COMPANY_EDITOR, SUPER_ADMIN } from '../../constants/UserRoles';
import CommonMenu from '../../components/Forms/CommonMenu';
import { YEARS_OPTION } from '../../constants/Global';
import {download} from "../../utils/download";
import { useCompany } from '../../context/company.context';

const PREFIX = 'Vessels';
const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  card: `${PREFIX}-card`,
  fileAction: `${PREFIX}-file-action`,
  menu: `${PREFIX}-year-menu`,
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
  [`& .${classes.fileAction}`]: {
    marginTop: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
  },
  [`& .${classes.menu}`]: {
    marginRight: '1rem',
  }
}));

const Vessel = () => {
  const { me } = useAuth();
  const isSuperAdmin = me?.userRole?.role === SUPER_ADMIN;
  const { pagination, vesselLists, getVesselsList, createVessels, fuels, getFuels } = useVessel();
  const { fleets, getFleets } = useFleet();
  const { notify } = useSnackbar();
  const {
    companies,
    getCompanies,
    filterCompany,
    setFilterCompany,
  } = useCompany();

  const history = useHistory();

  const [files, setFiles] = useState([]);
  const [parsedData, setParsedData] = useState({});
  const [canUpload, setCanUpload] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState();
  const [order, setOrder] = useState('ASC');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [company, setCompany] = useState();

  useEffect(() => {
    if (getVesselsList && getFleets && getFuels) {
      if (me?.userRole?.role === SUPER_ADMIN) {
        getFleets();
      }

      getVesselsList({ year: selectedYear, page, limit, companyId: filterCompany });
      getFuels();
    }
  }, []);

  useEffect(() => {
    setFilterCompany(company);
  }, [company]);

  useEffect(() => {
    if (companies && isSuperAdmin) {
      setCompany(filterCompany || companies[0]?.id);
    } else if (me?.company?.id) {
      setCompany(me?.company?.id);
    }
  }, [isSuperAdmin, me?.company?.id, companies]);

  useEffect(() => {
    if (isSuperAdmin) {
      getCompanies();
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    if (parsedData && Array.isArray(parsedData)) {
      if (isSuperAdmin || parsedData.every((datum) => datum.company === me?.company?.name)) {
        setCanUpload(true);
      } else {
        if (!isSuperAdmin) {
          notify('You can\'t create vessels for other companies. Please check the company field.', 'error');
        } else {
          notify('Somethings went wrong with uploaded data.', 'error');
        }
        setCanUpload(false);
      }
    } else {
      setCanUpload(false);
    }
  }, [isSuperAdmin, parsedData, me?.company?.name]);

  useEffect(() => {
    if (getVesselsList) {
      getVesselsList({ year: selectedYear, page, limit, sortBy, order, search, companyId: filterCompany });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, sortBy, order, search, selectedYear, filterCompany]);

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
      render: (data) => <>{data.fleet ? data.fleet : 'N/A'}</>,
    },
    {
      title: `CO2 Emissions (${selectedYear})`,
      key: 'emissions',
      sortable: true,
      fixed: true,
      render: (data) => <>{data.emissions !== null ? parseFloat(data.emissions).toFixed(3) : 'N/A'}</>,
    },
    {
      title: `CII Attained (${selectedYear})`,
      key: 'cii',
      sortable: true,
      fixed: true,
      render: (data) => <>{data.cii !== null ? parseFloat(data.cii).toFixed(3) : 'N/A'}</>,
    },
    {
      title: `CII Required (${selectedYear})`,
      key: 'requiredCII',
      sortable: true,
      fixed: true,
      render: (data) => <>{data.requiredCII !== null ? parseFloat(data.requiredCII).toFixed(3) : 'N/A'}</>,
    },
    {
      title: 'Bunker cost',
      key: 'bunkerCost',
      render: (data) => <>{data.bunkerCost !== null ? parseFloat(data.bunkerCost)?.toFixed(3) : 'N/A'}</>,
    },
    {
      title: 'Category',
      key: 'category',
    },
    {
      title: 'Company',
      key: 'company',
      sortable: true,
    },
  ];

  const handleChangeFiles = (files, parsedResult) => {
    setFiles(files);
    setParsedData(parsedResult);
  };

  const handleSaveUpload = () => {
    createVessels(parsedData)
      .then(() => {
        getVesselsList({ year: selectedYear, page, limit, sortBy, order, search, companyId: filterCompany });
        notify('Created successfully!');
      })
      .catch((err) => {
        if (err?.response?.data) {
          notify(err.response.data.message, 'error');
        }
      });
  };

  const handleFilter = (params) => {
    getVesselsList({ year: selectedYear, page, limit, sortBy, order, search, ...params, companyId: filterCompany });
  };

  const handleChangeSort = (value) => {
    if (value === sortBy) {
      setOrder(order === 'DESC' ? 'ASC' : 'DESC');
    } else {
      setSortBy(value);
      setOrder('ASC');
    }
  };

  const handleDownloadSample = () => {
    getVesselSample().then((res) => {
      download(res, 'sample_vessel.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });
  };

  const handleSelectCompany = (value) => {
    setCompany(value);
  };

  return (
    <Root className={classes.root}>
      <Box className={classes.title}>
        <Typography variant="title">Vessels</Typography>
        <Box>
          {isSuperAdmin && (
            <CommonMenu
              className={classes.menu}
              items={companies}
              optionLabel="name"
              onChange={handleSelectCompany}
              label={companies?.find((item) => item.id === company)?.name}
            />
          )}
          <CommonMenu
            className={classes.menu}
            label={`Year - ${selectedYear}`}
            items={YEARS_OPTION}
            onChange={(value) => setSelectedYear(value)}
          />
          {[SUPER_ADMIN, COMPANY_EDITOR].includes(me?.userRole?.role) && (
            <CommonButton onClick={() => history.push('/vessels/create')}>Create vessel</CommonButton>
          )}
        </Box>
      </Box>
      {[SUPER_ADMIN, COMPANY_EDITOR].includes(me?.userRole?.role) && (
        <Card className={classes.card}>
          <Dropzone files={files} onChangeFiles={handleChangeFiles} />
          <Box className={classes.fileAction}>
            <CommonButton color="secondary" onClick={handleDownloadSample}>Download template</CommonButton>
            <CommonButton disabled={!canUpload} onClick={handleSaveUpload}>Save upload</CommonButton>
          </Box>
        </Card>
      )}
      <DataTable
        columns={columns}
        tableData={vesselLists}
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
    </Root>
  );
};

export default Vessel;
