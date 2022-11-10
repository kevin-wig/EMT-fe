import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useAuth } from '../../context/auth.context';
import CommonMenu from '../../components/Forms/CommonMenu';
import { useCompany } from '../../context/company.context';
import { useFleet } from '../../context/fleet.context';
import { SUPER_ADMIN } from '../../constants/UserRoles';
import { useVessel } from '../../context/vessel.context';
import ComparisonBox from './ComparisonBox';
import { EXPORT_OPTION, EXPORT_OPTIONS } from '../../constants/Global';
import { download } from '../../utils/download';
import {getScreenShot} from "../../utils/exportAsPdf";

const PREFIX = 'report';
const classes = {
  root: `${PREFIX}-root`,
  titleWrapper: `${PREFIX}-title-wrapper`,
  title: `${PREFIX}-title`,
  card: `${PREFIX}-card`,
  cardBody: `${PREFIX}-card-body`,
  fileAction: `${PREFIX}-file-action`,
  addWidget: `${PREFIX}-add-widget`,
  menuWrapper: `${PREFIX}-menu-wrapper`,
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
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
  [`& .${classes.card}`]: {
    width: '100%',
    boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important',
    padding: '1.5rem',
    marginBottom: '1rem',
  },
  [`& .${classes.cardBody}`]: {
    padding: '1.5rem 0',
    display: 'flex',
    flexGrow: '1',
    fontSize: '0.9rem',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    '& p': {
      marginBottom: '0.5rem',
    },
    '& > div:not(:first-of-type)': {
      marginLeft: '1rem',
    },
  },
  [`& .${classes.menuWrapper}`]: {
    display: 'flex',
    '& > button:not(:first-of-type)': {
      marginLeft: '0.5rem',
    },
  },
  [`& .${classes.addWidget}`]: {
    position: 'fixed',
    bottom: '4rem',
    right: '4rem',
    height: '3rem',
    minWidth: '3rem',
    padding: '0',
    background: theme.palette.primary.main,
    borderRadius: '50%',
    color: theme.palette.surface[0],
  },
}));

const ComparisonReport = () => {
  const { me } = useAuth();
  const { companies, getCompanies } = useCompany();
  const { fleets, getFleets } = useFleet();
  const { fuels, vessels, vesselTypes, getFuels, getVessels, getVesselTypes, exportReportsAsExcel, exportReportsAsPdf } = useVessel();

  const [boxes, setBoxes] = useState([
    { id: 0, options: {} },
    { id: 1, options: {} },
  ]);

  // const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // TODO: need to confirm for right user logic
    getCompanies();
    if (me?.userRole?.role === SUPER_ADMIN) {
      // getCompanies();
    }
    getFleets();
    getVessels();
    getVesselTypes();
    getFuels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.userRole?.role]);

  const handleAddWidget = () => {
    setBoxes([...boxes, { id: `${Date.now()}-${boxes.length}` }]);
  };

  const handleRemoveWidget = (id) => {
    setBoxes(boxes.filter((box) => box.id !== id));
  };

  const handleExport = async (value) => {
    if (value === EXPORT_OPTION.XLS) {
      exportReportsAsExcel().then((res) => {
        download(res, `Vessel_report_${Date.now()}.xlsx`,'application/octet-stream');
      });
    } else if (value === EXPORT_OPTION.PDF) {
      let screenshots = [];
      for (let i = 0; i < boxes.length; i ++) {
        const component = await getScreenShot(`report-export-${boxes[i].id}`);
        screenshots.push(component);
      }
      exportReportsAsPdf(screenshots).then((res) => {
        download(res, `Vessel_report_${Date.now()}.pdf`,'application/pdf');
      });
    }
  };

  const handleChangeOptions = (id, options) => {
    setBoxes(boxes.map((box) => {
      if (box.id === id) {
        return {
          id: box.id,
          options,
        }
      } else {
        return box;
      }
    }));
  };

  return (
    <Root className={classes.root}>
      <Box className={classes.titleWrapper}>
        <Box className={classes.title}>
          <Typography variant="title">Comparison Report</Typography>
        </Box>
        <Box className={classes.menuWrapper}>
          {/* <CommonMenu
            label={`Year - ${selectedYear}`}
            items={YEARS_OPTION}
            onChange={handleYear}
          /> */}
          <CommonMenu
            label="Export as"
            items={EXPORT_OPTIONS}
            onChange={handleExport}
          />
        </Box>
      </Box>
      <CardContent className={classes.cardBody}>
        {boxes.map((box) => (
          <ComparisonBox
            admin={me?.userRole?.role === SUPER_ADMIN}
            key={box.id}
            id={box.id}
            user={me}
            companies={companies ? companies : [me.company]}
            fleets={fleets}
            vessels={vessels}
            vesselTypes={vesselTypes}
            fuelTypes={fuels}
            onDelete={() => handleRemoveWidget(box.id)}
            reportOption={box.options}
            onUpdateOption={(options) => handleChangeOptions(box.id, options)}
          />
        ))}
      </CardContent>
      <Button className={classes.addWidget} onClick={handleAddWidget}>
        <AddIcon />
      </Button>
    </Root>
  );
};

export default ComparisonReport;
