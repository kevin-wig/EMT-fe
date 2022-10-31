import React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';

const PREFIX = 'Table';
const classes = {
  root: `${PREFIX}-root`,
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.root}`]: {
    width: '100%',
    border: '1px solid #dee2e6',
    borderRadius: '0.5rem',
    '& div': {
      padding: '0.5rem 1rem',
    },
    '& hr': {
      borderColor: theme.palette.border.secondary,
    },
    '& h2': {
      fontWeight: '800',
    },
  },
}));

const ListGroup = ({
  className,
  topLabel,
  topValue,
  bottomLabel,
  bottomValue,
  loading,
}) => {
  return (
    <Root className={`${classes.root} ${className}`}>
      <Box>
        <Typography varaiant="body1" component="h6">{topLabel}</Typography>
        {loading ? (
          <Skeleton variant="text" />
        ) : (
          <Typography varaiant="body" component="h2">{topValue}</Typography>
        )}
      </Box>
      <Divider />
      <Box>
        <Typography varaiant="body1" component="h6">{bottomLabel}</Typography>
        {loading ? (
          <Skeleton variant="text" />
        ) : (
          <Typography varaiant="body" component="h2">{bottomValue}</Typography>
        )}
      </Box>
    </Root>
  );
};

export default ListGroup;
