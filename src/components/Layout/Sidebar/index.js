import React, { useMemo, useState } from 'react';
import { useHistory } from 'react-router';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

import { useAuth } from '../../../context/auth.context';
import { COMPANY_EDITOR, SUPER_ADMIN, UserRoles } from '../../../constants/UserRoles';

export const sidebarWidth = 225;

const commonPages = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    children: [
      {
        label: 'CII',
        path: 'cii',
      },
      {
        label: 'EU ETS',
        path: 'eu-ets',
      },
      {
        label: 'EU GHGs',
        path: 'eu-ghgs',
      },
    ],
    roles: Object.keys(UserRoles),
  },
  {
    label: 'Comparison report',
    path: '/comparison-report',
    roles: Object.keys(UserRoles),
  },
  {
    label: 'Vessels',
    path: '/vessels',
    roles: Object.keys(UserRoles),
  },
  {
    label: 'Fleet',
    path: '/fleets',
    roles: Object.keys(UserRoles),
  },
  {
    label: 'Users',
    path: '/users',
    roles: [SUPER_ADMIN, COMPANY_EDITOR],
  },
  {
    label: 'Companies',
    path: '/companies',
    roles: [SUPER_ADMIN, COMPANY_EDITOR],
  },
  {
    label: 'Voyage',
    path: '/voyage',
    roles: Object.keys(UserRoles),
  },
];

const PREFIX = 'Sidebar';
const classes = {
  root: `${PREFIX}-root`,
  large: `${PREFIX}-large`,
  mobile: `${PREFIX}-mobile`,
  logo: `${PREFIX}-logo`,
  listItem: `${PREFIX}-list-item`,
  listItemChild: `${PREFIX}-list-item-child`,
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.root}`]: {},
  [`& .${classes.large}`]: {
    width: sidebarWidth,
    flexShrink: 0,
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
    '& .MuiDrawer-paper': {
      width: sidebarWidth,
      boxSizing: 'border-box',
      background: theme.palette.background.main,
      border: 'none',
      zIndex: '1009',
      paddingTop: '56px',
    },
  },
}));

const DrawerListItem = styled(ListItem)(() => ({
  [`&.${classes.listItem}`]: {
    margin: '0.5rem !important',
    padding: '0.5rem 1rem !important',
    borderRadius: '0.5rem',
    width: 'auto',
    color: 'rgba(255, 255, 255, 0.5)',
    '&.active': {
      background: 'rgba(255, 255, 255, 0.2)',
      '& .MuiTypography-root': {
        color: '#fff',
      },
    },
    '& .MuiTypography-root': {
      fontSize: '0.9rem',
    },
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.2)',
    },
    '&.child': {
      marginLeft: '2rem !important',
    },
  },
}));

const MobileDrawer = styled(Drawer)(({ theme }) => ({
  [`&.${classes.mobile}`]: {
    width: sidebarWidth,
    flexShrink: 0,
    zIndex: '1009',

    [theme.breakpoints.up('md')]: {
      display: 'none',
    },

    '& .MuiDrawer-paper': {
      width: sidebarWidth,
      boxSizing: 'border-box',
      background: 'linear-gradient(#247AFF, #9B46FF, #C300CA)',
      border: 'none',
      paddingTop: '56px',
    },

    '& .MuiBackdrop-root': {
      marginTop: '56px',
    },
  },
}));

const DrawerContent = () => {
  const [open, setOpen] = useState(false);

  const history = useHistory();
  const currentPath = useMemo(() => {
    return history?.location?.pathname || '';
  }, [history?.location]);

  const { me } = useAuth();

  const pages = useMemo(() => commonPages.filter((page) => page.roles.includes(me?.userRole?.role)), [me]);

  return (
    <List>
      {pages?.map((page, key) => (
        page.children ? (
          <Box key={`${key} * ${key}`}>
            <DrawerListItem
              className={`${classes.listItem} ${currentPath.includes(page.path) && 'active'}`}
              button
              onClick={() => setOpen(!open)}
            >
              <ListItemText primary={page.label} />
              {open ? <ExpandLess color="inherit" /> : <ExpandMore color="inherit" />}
            </DrawerListItem>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {page.children.map((child, childKey) => (
                  <DrawerListItem
                    key={`${childKey} * ${childKey}`}
                    button
                    className={`${classes.listItem} ${currentPath === `${page.path}/${child.path}` && 'active'} child`}
                    onClick={() => history.push(`${page.path}/${child.path}`)}
                  >
                    <ListItemText primary={child.label} />
                  </DrawerListItem>
                ))}
              </List>
            </Collapse>
          </Box>
        ) : (
          <DrawerListItem
            key={key}
            className={`${classes.listItem} ${currentPath.indexOf(page.path) === 0 && 'active'}`}
            button
            onClick={() => history.push(page.path)}
          >
            <ListItemText primary={page.label} />
          </DrawerListItem>
        )
      ))}
    </List>
  );
};

const Sidebar = ({
  open,
  mobileOpen,
  setMobileOpen,
}) => {
  return (
    <Root className={classes.root}>
      <Drawer
        className={classes.large}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerContent />
      </Drawer>
      <MobileDrawer
        className={classes.mobile}
        variant="temporary"
        anchor="left"
        ModalProps={{ keepMounted: true }}
        open={mobileOpen}
        onClose={() => setMobileOpen(!mobileOpen)}
      >
        <DrawerContent />
      </MobileDrawer>
    </Root>
  );
};

export default Sidebar;
