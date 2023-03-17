import React from 'react';
import { Link, matchPath, useLocation } from 'react-router-dom';
import { UserMenu, Logout, LoadingIndicator } from 'react-admin';

import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import { Tabs, Tab, Toolbar, Box, Typography, MenuItem } from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import RadarIcon from '@mui/icons-material/Radar';
import BugReportIcon from '@mui/icons-material/BugReport';
import TerminalIcon from '@mui/icons-material/Terminal';
import LanIcon from '@mui/icons-material/Lan';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationIcon from '@mui/icons-material/Notifications';

import Header from './Header';

import logo from '../../assets/sirius-logo.png';

const drawerWidth = 280;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

export default function MiniDrawer() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawer = () => {
    if (open === true) {
        setOpen(false);
    } else {
        setOpen(true);
    }
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };
  const location = useLocation();

  let currentPath = '/';
  if (!!matchPath('/contacts/*', location.pathname)) {
      currentPath = '/contacts';
  } else if (!!matchPath('/companies/*', location.pathname)) {
      currentPath = '/companies';
  } else if (!!matchPath('/deals/*', location.pathname)) {
      currentPath = '/deals';
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" color="primary" >
              <Toolbar variant="dense">
                <Box flex={1} display="flex" justifyContent="space-between">
                        <Box display="flex" alignItems="center">
                            <Box
                                component="img"
                                sx={{ marginRight: '1em', height: 35 }}
                                src={logo}
                            />
                            <Typography component="span" variant="h5">
                                
                            </Typography>
                        </Box>
                        {/*
                        <Box>
                            <Tabs
                                value={currentPath}
                                aria-label="Navigation Tabs"
                                indicatorColor="secondary"
                                textColor="inherit"
                            >
                                <Tab
                                    label={'Dashboard'}
                                    component={Link}
                                    to="/"
                                    value="/"
                                />
                            </Tabs>
                        </Box>
                        */}
                        <Box display="flex">
                          <NotificationIcon sx={{
                                marginTop: 1.2,
                                cursor: 'pointer',
                            }} />
                            <LoadingIndicator
                                sx={{
                                    '& .RaLoadingIndicator-loader': {
                                        marginTop: 2,
                                    },
                                }}
                            />

                            <UserMenu>
                                <Logout />
                                <MenuItem
                                    label={'Users'}
                                    component={Link}
                                    to="/users"
                                    value="/users"
                                >
                                    Administration
                                </MenuItem>
                            </UserMenu>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>
      <Drawer variant="permanent" open={open}> 
        <Divider />
        <List>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              sx={{
                minHeight: 45,
              }}
            >
            </ListItemButton>
          </ListItem>
          {/* Drawer Icon Buttons */}
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={Link}
              to="/"
              value="/"
              sx={{
                minHeight: 48,
                px: 2.5,
              }}
            >
              <BugReportIcon 
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              />
              <ListItemText sx={{ opacity: open ? 1 : 0 }}>Issues</ListItemText>
            </ListItemButton>
            <ListItemButton
              component={Link}
              to="/inventory"
              value="/"
              sx={{
                minHeight: 48,
                px: 2.5,
              }}
            >
              <LanIcon 
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              />
              <ListItemText sx={{ opacity: open ? 1 : 0 }}>Inventory</ListItemText>
            </ListItemButton>
            <ListItemButton
              component={Link}
              to="/scan"
              sx={{
                minHeight: 48,
                px: 2.5,
              }}
            >
              <RadarIcon 
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              />
              <ListItemText sx={{ opacity: open ? 1 : 0 }}>Scanner</ListItemText>
            </ListItemButton>
            <ListItemButton
              sx={{
                minHeight: 48,
                px: 2.5,
              }}
            >
              <TerminalIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              />
              <ListItemText sx={{ opacity: open ? 1 : 0 }}>Agents</ListItemText>
            </ListItemButton>
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              onClick={handleDrawer}
              sx={{
                minHeight: 48,
                px: 2.5,
              }}
            >
              <MenuIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              label={'Users'}
              component={Link}
              to="/users"
              value="/users"
              sx={{
                minHeight: 48,
                px: 2.5,
              }}
            >
              <SettingsIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              />
              <ListItemText sx={{ opacity: open ? 1 : 0 }}>Administration</ListItemText>
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </Box>
  );
}