import React, { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';

import DataList from '../../../components/Table/DataList';
import CommonMenu from '../../../components/Forms/CommonMenu';
import CommonDatePicker from '../../../components/Forms/DatePicker';
import CommonButton from '../../../components/Buttons/CommonButton';
import CommonSelect from '../../../components/Forms/CommonSelect';
import { useVessel } from '../../../context/vessel.context';
import {
  ADDITIONAL_VOYAGE_OPTIONS,
  EXPORT_OPTION,
  EXPORT_OPTIONS,
  JOURNEY_OPTION,
} from '../../../constants/Global';
import { getScreenShot } from '../../../utils/exportAsPdf';
import { download } from '../../../utils/download';
import { exportVoyagePerVesselAsExcel } from '../../../services/vessel.service';

const PREFIX = 'vessel-voyages';
const classes = {
  root: `${PREFIX}-root`,
  filterWrapper: `${PREFIX}-filter-wrapper`,
};

const Root = styled('div')(() => ({
  [`&.${classes.root}`]: {
    [`& .${classes.filterWrapper}`]: {
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      '& > *:last-child': {
        marginLeft: 'auto',
      },
      '& > *': {
        '& > *': {
          marginRight: '1rem',
        },
        '& > *:last-child': {
          marginRight: '0',
          marginLeft: 'auto',
        }
      },
    },
  },
}));

const VesselVoyages = ({ id }) => {
  const {
    loading,
    getVoyagesByVesselId,
    exportCiiAsPdf
  } = useVessel();

  const history = useHistory();

  const [option, setOption] = useState(JOURNEY_OPTION.CII);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    getVoyagesByVesselId(id, option, fromDate, toDate).then((res) => {
      setTableData(res.data);
    });
  }, [id, option, fromDate, toDate, getVoyagesByVesselId]);

  const columns = useMemo(() => [
    {
      title: 'Voyage ID',
      key: 'voyageId',
    },
    ...(option === JOURNEY_OPTION.CII ? [
      {
        title: 'Emissions',
        key: 'emissions',
        fixed: true,
      },
      {
        title: 'CII',
        key: 'cii',
        fixed: true,
      },
      {
        title: 'Required',
        key: 'requiredCII',
        fixed: true,
      },
      {
        title: 'CII/Required',
        key: 'ciiRate',
        fixed: true,
      },
      {
        title: 'Category',
        key: 'category',
      }] : []
    ),
    ...(option === JOURNEY_OPTION.ETS ? [
      {
        title: 'CO2 Emission',
        key: 'totalCo2Emission',
      },
      {
        title: 'CO2 ETS',
        key: 'totalCo2Ets',
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
      }] : []
    )
  ], [option]);

  const handleExport = async (value) => {
    if (value === EXPORT_OPTION.XLS) {
      exportVoyagePerVesselAsExcel(id, { journeyType: option, fromDate: fromDate, toDate: toDate }).then((res) => {
        download(res, `Voyage_${option}_${Date.now()}.xlsx`,'application/octet-stream');
      });
    } else if (value === EXPORT_OPTION.PDF) {
      const screenshot = await getScreenShot('voyage-screenshot');
      exportCiiAsPdf(id, screenshot, '').then((res) => {
        download(res, `Voyage_${option}_${Date.now()}.pdf`,'application/pdf');
      });
    }
  };

  return (
    <Root className={classes.root}>
      <Box className={classes.filterWrapper}>
        <Box>
          <CommonSelect
            options={ADDITIONAL_VOYAGE_OPTIONS}
            value={option}
            onChange={(e) => setOption(e.target.value)}
          />
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
        </Box>
        <Box>
          <CommonButton
            onClick={() => history.push('/voyage/create')}
          >
            Create voyage
          </CommonButton>
          <CommonMenu
            label="Export as"
            items={EXPORT_OPTIONS}
            onChange={handleExport}
          />
        </Box>
      </Box>
      <Box id="voyage-screenshot">
        <DataList title="Costs breakdown" columns={columns} tableData={tableData} loading={loading} />
      </Box>
    </Root>
  );
};

export default VesselVoyages;
