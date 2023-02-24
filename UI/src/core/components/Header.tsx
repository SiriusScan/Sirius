import React from 'react';
import { Tabs, Tab, Toolbar, AppBar, Box, Typography } from '@mui/material';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Link, matchPath, useLocation } from 'react-router-dom';
import { UserMenu, Logout, LoadingIndicator } from 'react-admin';

const Header = () => {
    
    const location = useLocation();

    let currentPath = '/';
    if (!!matchPath('/contacts/*', location.pathname)) {
        currentPath = '/contacts';
    } else if (!!matchPath('/companies/*', location.pathname)) {
        currentPath = '/companies';
    } else if (!!matchPath('/deals/*', location.pathname)) {
        currentPath = '/deals';
    }

    interface AppBarProps extends MuiAppBarProps {
        open?: boolean;
    }

    const AppBar = styled(MuiAppBar, {
        shouldForwardProp: (prop) => prop !== 'open',
      })<AppBarProps>(({ theme, open }) => ({
        zIndex: theme.zIndex.drawer + 1000,
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

    return (
        <Box component="nav" sx={{ flexGrow: 1 }}>
            <AppBar position="static" color="primary" sx={{ zIndex: 1000000 }}>
                <Toolbar variant="dense">
                    <Box flex={1} display="flex" justifyContent="space-between">
                        <Box display="flex" alignItems="center">
                            <Box
                                component="img"
                                sx={{ marginRight: '1em', height: 30 }}
                                src={
                                    'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg'
                                }
                                alt="Bosch Logo"
                            />
                            <Typography component="span" variant="h5">
                                Sirius Scan
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
                            <LoadingIndicator
                                sx={{
                                    '& .RaLoadingIndicator-loader': {
                                        marginTop: 2,
                                    },
                                }}
                            />
                            <UserMenu>
                                <Logout />
                            </UserMenu>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>
    );
};

export default Header;