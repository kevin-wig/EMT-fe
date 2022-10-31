import React from 'react';
import { useHistory } from 'react-router';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { styled } from '@mui/material/styles';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import { sidebarWidth } from '../Sidebar';
import { useAuth } from '../../../context/auth.context';

const PREFIX = 'Header';
const classes = {
  root: `${PREFIX}-root`,
  logo: `${PREFIX}-logo`,
  toggle: `${PREFIX}-toggle`,
  mobileToggle: `${PREFIX}-mobile-toggle`,
  menu: `${PREFIX}-menu`,
  mainHeader: `${PREFIX}-main-header`,
};

const Root = styled(MuiAppBar)(({ theme }) => ({
  [`&.${classes.root}`]: {
    height: '56px !important',
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(36, 122, 255, 0.2) !important',
    boxShadow: 'none',
    '& .MuiToolbar-root': {
      minHeight: '56px !important',
      padding: 0,
    },
  },

  [`& .${classes.logo}`]: {
    width: sidebarWidth,
    height: '56px',
    paddingLeft: '1rem',
    background: 'transparent',
    '& img': {
      height: '100%',
    },
  },

  [`& .${classes.toggle}`]: {
    background: '#fff !important',
    minWidth: '26px',
    marginLeft: '1.5rem !important',
    padding: '0.25rem',
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },

  [`& .${classes.mobileToggle}`]: {
    background: '#fff !important',
    height: '14px',
    minWidth: '26px',
    marginLeft: '0 !important',
    marginRight: '1.5rem !important',
    padding: '1rem 0.5rem',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },

  [`& .${classes.menu}`]: {
    background: '#fff !important',
    color: theme.palette.text.primary,
    textTransform: 'capitalize',
    height: '100%',
    minWidth: '40px',
    marginLeft: 'auto',
    marginRight: '1.5rem',
  },

  [`& .${classes.mainHeader}`]: {
    height: '100%',
    padding: '0.5rem 0',
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    color: theme.palette.text.primary,
  },
}));

const Item = styled(MenuItem)(() => ({
  '&:hover': {
    backgroundColor: '#e0e0e0 !important',
  },
}));

const Header = ({ handleDrawerToggle, handleMobileDrawerToggle }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { me, logout } = useAuth();
  const openMenu = Boolean(anchorEl);
  const history = useHistory();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    history.push('/auth/login');
  };

  const handleProfileClick = () => {
    setAnchorEl(null);
    history.push(`/profile`);
  };

  return (
    <Root className={classes.root} position="fixed">
      <Toolbar>
        <a className={classes.logo} href="/">
          <img src="/logo-white.png" alt="logo" />
        </a>
        <Box className={classes.mainHeader}>
          <Button
            className={classes.toggle}
            onClick={handleDrawerToggle}
          >
            <FormatAlignLeftIcon />
          </Button>
          <Button
            id="basic-button"
            className={classes.menu}
            aria-controls="basic-menu"
            aria-haspopup="true"
            aria-expanded={openMenu ? 'true' : undefined}
            onClick={handleClick}
            endIcon={<KeyboardArrowDownIcon />}
          >
            {`${me?.firstname || ''} ${me?.lastname || ''}`}
          </Button>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={openMenu}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            <Item onClick={handleProfileClick}>Profile</Item>
            <Item onClick={handleClose}>My account</Item>
            <Item onClick={handleLogout}>Logout</Item>
          </Menu>
          <Button
            className={classes.mobileToggle}
            onClick={handleMobileDrawerToggle}
          >
            <i className="las la-align-left" />
          </Button>
        </Box>
      </Toolbar>
    </Root>
  );
};

export default Header;
