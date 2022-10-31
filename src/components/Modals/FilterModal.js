import React, { useMemo, useState } from 'react';
import { styled } from '@mui/material/styles';
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

const PREFIX = 'Filter';
const classes = {
  root: `${PREFIX}-root`,
  content: `${PREFIX}-content`,
  filter: `${PREFIX}-filter`,
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
  const [fuel, setFuel] = useState(-1);
  const [vesselAge, setVesselAge] = useState('');
  const [eexi, setEexi] = useState('');
  const [eedi, setEedi] = useState('');
  const [dwt, setDwt] = useState('');
  const [grossTonnage, setGrossTonnage] = useState('');
  const [netTonnage, setNetTonnage] = useState('');
  const [iceClass, setIceClass] = useState('');
  const [propulsionPower, setPropulsionPower] = useState('');

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
        obj = { ...obj, [value[0]]: value[1] };
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
          value={fleet}
          onChange={(e) => setFleet(e.target.value)}
        />

        <Typography>Category</Typography>
        <CommonSelect
          className={classes.filter}
          options={categoryFilters}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <Typography>Fuel</Typography>
        <CommonSelect
          className={classes.filter}
          options={fuelFilters}
          optionLabel="name"
          optionValue="id"
          value={fuel}
          onChange={(e) => setFuel(e.target.value)}
        />

        <Typography>Vessel Age</Typography>
        <CommonTextField
          className={classes.filter}
          value={vesselAge}
          onChange={(e) => setVesselAge(e.target.value)}
        />

        <Typography>EEXI</Typography>
        <CommonTextField
          className={classes.filter}
          value={eexi}
          onChange={(e) => setEexi(e.target.value)}
        />

        <Typography>EEDI</Typography>
        <CommonTextField
          className={classes.filter}
          value={eedi}
          onChange={(e) => setEedi(e.target.value)}
        />

        <Typography>DWT</Typography>
        <CommonTextField
          className={classes.filter}
          value={dwt}
          onChange={(e) => setDwt(e.target.value)}
        />

        <Typography>Gross Tonnage</Typography>
        <CommonTextField
          className={classes.filter}
          value={grossTonnage}
          onChange={(e) => setGrossTonnage(e.target.value)}
        />

        <Typography>Net Tonnage</Typography>
        <CommonTextField
          className={classes.filter}
          value={netTonnage}
          onChange={(e) => setNetTonnage(e.target.value)}
        />

        <Typography>ICE Class</Typography>
        <CommonTextField
          className={classes.filter}
          value={iceClass}
          onChange={(e) => setIceClass(e.target.value)}
        />

        <Typography>Propulsion Power</Typography>
        <CommonTextField
          className={classes.filter}
          value={propulsionPower}
          onChange={(e) => setPropulsionPower(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={handleClose}>Close</Button>
        <Button variant="contained" onClick={handleFilter}>Filter</Button>
      </DialogActions>
    </Root>
  );
};

export default FilterModal;
