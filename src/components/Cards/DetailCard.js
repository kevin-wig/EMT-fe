import React from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CommonButton from '../Buttons/CommonButton';

const PREFIX = 'DetailCard';
const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  card: `${PREFIX}-card`,
  cardHeader: `${PREFIX}-card-header`,
  cardBody: `${PREFIX}-card-body`,
  input: `${PREFIX}-card-input`,
  wrapper: `${PREFIX}-wrapper`,
  action: `${PREFIX}-action`,
  gridContainer: `${PREFIX}-grid-container`,
  detailCard: `${PREFIX}-detail-card`,
  detailCardWrapper: `${PREFIX}-detail-card-wrapper`,
};

const Root = styled(Card)(() => ({
  [`&.${classes.root}`]: {
    padding: '1.5rem',
  },
  [`& .${classes.cardBody}`]: {
    marginTop: '1.5rem',
  },
  [`& .${classes.action}`]: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '1.5rem',
    '& .MuiButton-containedPrimary': {
      marginLeft: '0.5rem',
    },
  },
}));

const DetailCard = ({
  title,
  children,
  onBack,
  onDelete,
  onSubmit,
  disableAction = false
}) => {
  return (
    <Root className={classes.root}>
      <Typography variant="caption">{title}</Typography>
      <form onSubmit={onSubmit}>
        <Box className={classes.cardBody}>
          {children}
        </Box>
        <Box className={classes.action}>
          <CommonButton variant="normal" onClick={onBack}>Back</CommonButton>
          {
            !disableAction &&
            <Box>
              {onDelete && <CommonButton color="secondary" onClick={onDelete}>Delete</CommonButton>}
              <CommonButton type="submit">Save</CommonButton>
            </Box>
          }
        </Box>
      </form>
    </Root>
  );
};

export default DetailCard;
