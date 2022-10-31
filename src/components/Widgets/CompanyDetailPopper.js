import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const PREFIX = 'Company-popper';
const classes = {
  root: `${PREFIX}-root`,
  button: `${PREFIX}-button`,
  info: `${PREFIX}-info`,
  content: `${PREFIX}-content`,
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.root}`]: {},
  [`& .${classes.button}`]: {
    background: '#fff',
    color: theme.palette.text.primary,
    '&:hover': {
      background: '#fff',
    },
  },
}));

const DetailContent = styled('div')(({ theme }) => ({
  [`&.${classes.content}`]: {
    padding: '0.5rem 1rem',
  },
  [`& .${classes.info}`]: {
    border: '1px solid',
    borderColor: theme.palette.border.secondary,
    borderRadius: '0.5rem',
    margin: '1rem 0',
    '& div': {
      padding: '0.5rem 1rem',
    },
    '& h2': {
      fontWeight: '700',
    },
  },
}));

const CompanyDetailPopper = ({ company }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'company-popover' : undefined;

  return (
    <Root className={classes.root}>
      <Button
        aria-describedby={id}
        variant="contained"
        onClick={handleClick}
        className={classes.button}
        endIcon={<ArrowDropDownIcon />}
      >
        View Details
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <DetailContent className={classes.content}>
          <Box className={classes.info}>
            <Box>
              <Typography>Name</Typography>
              <Typography component="h2">{company?.name}</Typography>
            </Box>
            <Divider />
            <Box>
              <Typography>Type</Typography>
              <Typography component="h2">{company?.packageType}</Typography>
            </Box>
          </Box>
          <Box className={classes.info}>
            <Box>
              <Typography>Number of Vessels</Typography>
              <Typography component="h2">{company?.vessels?.length || 0}</Typography>
            </Box>
            <Divider />
            <Box>
              <Typography>Number of Fleets</Typography>
              <Typography component="h2">{company?.fleets?.length || 0}</Typography>
            </Box>
          </Box>
          <Box className={classes.info}>
            <Box>
              <Typography>Contact Person</Typography>
              <Typography component="h2">{company?.primaryContactName}</Typography>
            </Box>
            <Divider />
            <Box>
              <Typography>Contact Email</Typography>
              <Link href="info@company.com" underline="none">
                <Typography component="h2" color="primary">{company?.primaryContactEmailAddress}</Typography>
              </Link>
            </Box>
          </Box>
        </DetailContent>
      </Popover>
    </Root>
  );
};

export default CompanyDetailPopper;
