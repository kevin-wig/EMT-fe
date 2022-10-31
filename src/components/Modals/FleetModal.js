import React, { useMemo, useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';

import CommonTextField from '../Forms/CommonTextField';
import CommonSelect from '../Forms/CommonSelect';
import { VESSEL_AGE_OPTIONS } from '../../containers/ComparisonReport/constants';

const PREFIX = 'Filter';
const classes = {
  root: `${PREFIX}-root`,
  content: `${PREFIX}-content`,
  filter: `${PREFIX}-filter`,
  filterWrapper: `${PREFIX}-filter-wrapper`,
};

const Root = styled(Dialog)(({ theme }) => ({
  [`&.${classes.root}`]: {
    '& .MuiDialogContent-root': {
      padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
      padding: theme.spacing(2),
      justifyContent: 'space-between',
    },
    '& .MuiDialogTitle-root': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '1rem',
      fontWeight: 'bold',
      padding: theme.spacing(2),
    },
  },
  [`& .${classes.content}`]: {
    display: 'flex',
    flexDirection: 'column',
  },
  [`& .${classes.filterWrapper}`]: {
    margin: `0 -${theme.spacing(1)} 1rem -${theme.spacing(1)}`,
    display: 'flex',
    alignItems: 'center',
    '& > div': {
      margin: `0 ${theme.spacing(1)}`,
    }
  },
  [`& .${classes.filter}`]: {
    marginBottom: '1rem',
  },
}));

const FilterModal = ({
  open,
  setOpen,
  fleets,
  fuels,
  onFilter,
}) => {
  const [fleet, setFleet] = useState(-1);
  const [category, setCategory] = useState(-1);
  const [type, setType] = useState("");
  const [fuel, setFuel] = useState(-1);
  const [vesselAge, setVesselAge] = useState('');
  const [eexi, setEexi] = useState([]);
  const [eedi, setEedi] = useState([]);
  const [dwt, setDwt] = useState([]);
  const [grossTonnage, setGrossTonnage] = useState([]);
  const [netTonnage, setNetTonnage] = useState([]);
  const [iceClass, setIceClass] = useState('');
  const [propulsionPower, setPropulsionPower] = useState([]);

  const fleetFilters = useMemo(() => {
    const all = { name: 'All fleets', id: -1 };
    if (fleets?.length > 0) {
      return [all, ...fleets];
    } else {
      return [all];
    }
  }, [fleets]);

  const categoryFilters = useMemo(() => [
    { value: -1, label: 'All categories' },
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
  ], []);

  const typeFilters = useMemo(() => [
    { value: "", label: 'All' },
    { value: 'Chemical Tanker', label: 'Chemical Tanker' },
    { value: 'Oil Tanker', label: 'Oil Tanker' },
    { value: 'Bulk Carrier', label: 'Bulk Carrier' },
  ], []);

  const fuelFilters = useMemo(() => {
    const all = { name: 'All fuels', id: -1 };
    if (fuels?.length > 0) {
      return [all, ...fuels];
    } else {
      return [all];
    }
  }, [fuels]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleFilter = () => {
    const params = Object.entries({
      fleet,
      category,
      type,
      fuel,
      vesselAge,
      eexi,
      eedi,
      dwt,
      grossTonnage,
      netTonnage,
      iceClass,
      propulsionPower,
    }).reduce((obj, value) => {
      if (value[1] && value[1] !== -1) {
        if ( value[0] === 'vesselAge') {
          let val;
          if (value[1]) {
            if (value[1] === 'ALL') {
              val = undefined;
            } else if (value[1] === '50+') {
              val = [50];
            } else {
              val = value[1].split(',').map((age) => +age);
            }
          }
          obj = { ...obj, [value[0]]: val };
        } else {
          obj = { ...obj, [value[0]]: value[1] };
        }
        return obj;
      }
      return obj;
    }, {});

    onFilter(params);
    setOpen(false);
  };

  return (
    <Root
      className={classes.root}
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        Filter vessels
        <IconButton
          aria-label="close"
          onClick={handleClose}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers className={classes.content}>
        <Typography>Fleet</Typography>
        <CommonSelect
          className={classes.filter}
          options={fleetFilters}
          optionLabel="name"
          optionValue="id"
          name="feet"
          value={fleet}
          onChange={(e) => setFleet(e.target.value)}
        />

        <Typography>Category</Typography>
        <CommonSelect
          className={classes.filter}
          options={categoryFilters}
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <Typography>Vessel Type</Typography>
        <CommonSelect
          className={classes.filter}
          options={typeFilters}
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />

        <Typography>Fuel</Typography>
        <CommonSelect
          className={classes.filter}
          options={fuelFilters}
          optionLabel="name"
          optionValue="id"
          name="fuel"
          value={fuel}
          onChange={(e) => setFuel(e.target.value)}
        />

        <Typography>Vessel Age</Typography>
        <CommonSelect
          className={classes.filter}
          options={VESSEL_AGE_OPTIONS}
          optionLabel="label"
          optionValue="key"
          value={vesselAge}
          onChange={(e) => setVesselAge(e.target.value)}
        />

        <Typography>EEXI</Typography>
        <Box className={classes.filterWrapper}>
          <CommonTextField
            name="minEexi"
            value={eexi[0]}
            onChange={(e) => setEexi([e.target.value, eexi[1] || ''])}
          />
          to
          <CommonTextField
            name="maxEexi"
            value={eexi[1]}
            onChange={(e) => setEexi([eexi[0] || '', e.target.value])}
          />
        </Box>

        <Typography>EEDI</Typography>
        <Box className={classes.filterWrapper}>
          <CommonTextField
            name="minEedi"
            value={eedi[0]}
            onChange={(e) => setEedi([e.target.value, eedi[1] || ''])}
          />
          to
          <CommonTextField
            name="maxEedi"
            value={eedi[1]}
            onChange={(e) => setEedi([eedi[0] || '', e.target.value])}
          />
        </Box>

        <Typography>DWT</Typography>
        <Box className={classes.filterWrapper}>
          <CommonTextField
            name="minDwt"
            value={dwt[0]}
            onChange={(e) => setDwt([e.target.value, dwt[1] || ''])}
          />
          to
          <CommonTextField
            name="maxDwt"
            value={dwt[1]}
            onChange={(e) => setDwt([dwt[0] || '', e.target.value])}
          />
        </Box>

        <Typography>Gross Tonnage</Typography>
        <Box className={classes.filterWrapper}>
          <CommonTextField
            name="minGrossTonnage"
            value={grossTonnage[0]}
            onChange={(e) => setGrossTonnage([e.target.value, grossTonnage[1] || ''])}
          />
          to
          <CommonTextField
            name="maxGrossTonnage"
            value={grossTonnage[1]}
            onChange={(e) => setGrossTonnage([grossTonnage[0] || '', e.target.value])}
          />
        </Box>

        <Typography>Net Tonnage</Typography>
        <Box className={classes.filterWrapper}>
          <CommonTextField
            name="minNetTonnage"
            value={netTonnage[0]}
            onChange={(e) => setNetTonnage([e.target.value, netTonnage[1] || ''])}
          />
          to
          <CommonTextField
            name="maxNetTonnage"
            value={netTonnage[1]}
            onChange={(e) => setNetTonnage([netTonnage[0] || '', e.target.value])}
          />
        </Box>

        <Typography>ICE Class</Typography>
        <CommonTextField
          className={classes.filter}
          name="iceClass"
          value={iceClass}
          onChange={(e) => setIceClass(e.target.value)}
        />

        <Typography>Propulsion Power</Typography>
        <Box className={classes.filterWrapper}>
          <CommonTextField
            name="minPropulsionPower"
            value={propulsionPower[0]}
            onChange={(e) => setPropulsionPower([e.target.value, propulsionPower[1] || ''])}
          />
          to
          <CommonTextField
            name="maxPropulsionPower"
            value={propulsionPower[1]}
            onChange={(e) => setPropulsionPower([propulsionPower[0] || '', e.target.value])}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={handleClose}>Close</Button>
        <Button variant="contained" onClick={handleFilter}>Filter</Button>
      </DialogActions>
    </Root>
  );
};

export default FilterModal;
