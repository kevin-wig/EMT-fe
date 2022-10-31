import React, { useState } from 'react';
import MuiAppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { styled } from '@mui/material/styles';

import Header from './Header';
import Sidebar, { sidebarWidth } from './Sidebar';
import Footer from './Footer';
import SnackbarContent from './SnackbarContent';

const Root = styled(Box)(() => ({
  background: 'linear-gradient(#e9ecef, #dee2e6)',
  minHeight: '100vh',
}));

const BackAppBar = styled(MuiAppBar)(() => ({
  '&': {
    height: '56px !important',
    minHeight: '56px !important',
    background: '#c1d5f2 !important',
    boxShadow: 'none',
    zIndex: 1,
  },
}));

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    padding: theme.spacing(3),
    minHeight: '100vh',
    width: '100%',
    paddingTop: '72px',
    background: 'linear-gradient(#e9ecef, #dee2e6)',
    [theme.breakpoints.up('md')]: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginLeft: `-${sidebarWidth}px`,
      ...(open && {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
        width: `calc(100% - ${sidebarWidth}px)`,
      }),
    },
  }),
);

const Layout = ({ children }) => {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleMobileDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Root sx={{ display: 'flex' }}>
      <SnackbarContent>
        <CssBaseline />
        <Header handleDrawerToggle={handleDrawerToggle} handleMobileDrawerToggle={handleMobileDrawerToggle} />
        <BackAppBar />
        <Sidebar open={open} setOpen={setOpen} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <Main open={open} id="main-component">
          {children}
          <Footer />
        </Main>
      </SnackbarContent>
    </Root>
  );
};

export default Layout;
