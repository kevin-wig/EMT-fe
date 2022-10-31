import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';

import Layout from '../index';
import AuthLayout from '../AuthLayout';

const Loading = ({ isAuthorized }) => {
  const Wrapper = isAuthorized ? Layout : AuthLayout;

  return (
    <Wrapper>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open
      >
        <CircularProgress color="info" size={80} />
      </Backdrop>
    </Wrapper>
  );
};

export default Loading;
