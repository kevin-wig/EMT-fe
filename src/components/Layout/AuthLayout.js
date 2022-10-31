import React from 'react';
import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import { styled } from '@mui/material/styles';
import SnackbarContent from './SnackbarContent';

const PREFIX = 'AuthLayout';
const classes = {
  root: `${PREFIX}-root`,
  container: `${PREFIX}-container`,
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.root}`]: {
    minHeight: '100vh',
    background: theme.palette.background.main,
    display: 'flex',
    flexDirection: 'column',
  },
  [`& .${classes.container}`]: {
    flex: 1,
  },
}));

const AuthLayout = ({ children }) => {
  return (
    <Root className={classes.root}>
      <SnackbarContent>
        <Container className={classes.container} maxWidth="xl">
          {children}
        </Container>
      </SnackbarContent>
    </Root>
  );
};

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthLayout;
