import React from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { Tooltip } from '@mui/material';

const PREFIX = 'InfoCard';
const classes = {
  root: `${PREFIX}-root`,
  infoCard: `${PREFIX}-info-card`,
};

const Root = styled(Card)(({ theme }) => ({
  [`&.${classes.root}`]: {
    boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important',
    height: '100%',
    padding: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',

    '&.primary': {
      background: theme.palette.primary.main,
      color: '#fff',
    },

    '&.secondary': {
      background: theme.palette.info.main,
      color: '#fff',
    },
  },
  [`& .${classes.infoCard}`]: {
    padding: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    '& h4': {
      fontWeight: '700',
    },
    '& h2': {
      fontWeight: 700,
    },
  },
}));

const InfoCard = ({
  title,
  subTitle,
  value,
  color,
  loading,
}) => {
  return (
    <Root className={`${classes.root} ${color || ''}`}>
      <Box className={classes.infoCard}>
        <Box>
          <Typography component="h4">{title}</Typography>
          <Typography>{subTitle}</Typography>
        </Box>
        {loading ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          <Typography variant="subtitle1">
            {!isNaN(parseFloat(value)) && !isNaN(value - 0) ? parseFloat(Number(value).toFixed(2)) : <Tooltip title="No data available" placement="top"><span>N/A</span></Tooltip>}
          </Typography>
        )}
      </Box>
    </Root>
  );
};

export default InfoCard;
