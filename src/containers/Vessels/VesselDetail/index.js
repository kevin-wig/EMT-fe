import React, { useEffect, useRef, useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useHistory } from 'react-router';

import { useAuth } from '../../../context/auth.context';
import { useVessel } from '../../../context/vessel.context';
import { COMPANY_EDITOR, SUPER_ADMIN } from '../../../constants/UserRoles';
import { YEARS_OPTION } from '../../../constants/Global';
import CommonButton from '../../../components/Buttons/CommonButton';
import VesselCII from './VesselCII';
import VesselEts from './VesselEts';
import VesselEuGhg from './VesselEuGhg';
import ShipParticulars from './ShipParticulars';
import CommonMenu from '../../../components/Forms/CommonMenu';
import VesselVoyages from './VesselVoyages';

const PREFIX = 'VesselDetail';
const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  toggle: `${PREFIX}-toggle`,
  menu: `${PREFIX}-year-menu`,
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.root}`]: {
    '& .MuiDivider-root': {
      flexGrow: '1',
      borderColor: theme.palette.border.secondary,
    },
  },
  [`& .${classes.title}`]: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '1.5rem',
    marginBottom: '1.5rem',
  },
  [`& .${classes.toggle}`]: {
    marginRight: '0.5rem',
  },
  [`& .${classes.menu}`]: {
    marginLeft: 'auto',
  }
}));

const VesselDetail = ({ match }) => {
  const { me } = useAuth();
  const { getVessel } = useVessel();

  const history = useHistory();

  const containerRef = useRef();

  const [tabIndex, setTabIndex] = useState(0);
  const [vessel, setVessel] = useState({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (match.params.id && match.params.id !== 'create') {
      getVessel(match.params.id).then((res) => {
        setVessel(res.data);
      });
    }
  }, [match.params.id, getVessel]);

  return (
    <Root className={classes.root} ref={containerRef}>
      <Box className={classes.title}>
        <Typography variant="title">{vessel.name}</Typography>
      </Box>
      <Box sx={{ display: 'flex', marginBottom: '1rem' }}>
        <Box>
          <CommonButton
            variant={tabIndex === 0 ? 'contained' : 'text'}
            className={classes.toggle}
            onClick={() => setTabIndex(0)}
          >
            CII
          </CommonButton>
          <CommonButton
            variant={tabIndex === 1 ? 'contained' : 'text'}
            className={classes.toggle}
            onClick={() => setTabIndex(1)}
          >
            ETS
          </CommonButton>
          <CommonButton
            variant={tabIndex === 2 ? 'contained' : 'text'}
            className={classes.toggle}
            onClick={() => setTabIndex(2)}
          >
            EU GHG
          </CommonButton>
          <CommonButton
            variant={tabIndex === 3 ? 'contained' : 'text'}
            className={classes.toggle}
            onClick={() => setTabIndex(3)}
          >
            Voyages
          </CommonButton>
          <CommonButton
            variant={tabIndex === 4 ? 'contained' : 'text'}
            className={classes.toggle}
            onClick={() => setTabIndex(4)}
          >
            Ship Particulars
          </CommonButton>
        </Box>
        {
          tabIndex !== 3 && (
            <CommonMenu
              className={classes.menu}
              label={`Year - ${selectedYear}`}
              items={YEARS_OPTION}
              onChange={(value) => setSelectedYear(value)}
            />
          )
        }
      </Box>
      {tabIndex === 0 && <VesselCII id={match.params.id} selectedYear={selectedYear} />}
      {tabIndex === 1 && <VesselEts id={match.params.id} selectedYear={selectedYear} />}
      {tabIndex === 2 && <VesselEuGhg id={match.params.id} selectedYear={selectedYear} />}
      {tabIndex === 3 && <VesselVoyages id={match.params.id} />}
      {tabIndex === 4 && <ShipParticulars id={match.params.id} selectedYear={selectedYear} />}
    </Root>
  );
};

export default VesselDetail;
