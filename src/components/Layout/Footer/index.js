import React from 'react';
import { styled } from '@mui/material/styles';

const PREFIX = 'Footer';
const classes = {
  root: `${PREFIX}-root`,
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.root}`]: {
    paddingTop: '2rem',
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#6c757d !important',
    fontSize: '0.875rem',
    '& a': {
      color: '#247AFF',
      textDecoration: 'none',
      '&:hover': {
        color: '#1d62cc',
      },
    },
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
}));

const Footer = () => {
  return (
    <Root className={classes.root}>
      <div>Copyright &copy; EMT 2021</div>
      <div>
        <a href="/">Privacy Policy</a>
        &middot;
        <a href="/">Terms &amp; Conditions</a>
      </div>
    </Root>
  );
};

export default Footer;
