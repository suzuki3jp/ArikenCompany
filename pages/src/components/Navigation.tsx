'use client';
import { ReactNode, useState, FC } from 'react';

import { styled } from '@mui/material/styles';
import {
    Drawer as MuiDrawer,
    AppBar as MuiAppBar,
    AppBarProps as MuiAppBarProps,
    IconButton,
    Toolbar,
    Typography,
    Box,
    CssBaseline,
    Divider,
    List,
} from '@mui/material';
import { Menu as MenuIcon, ChevronLeft as ChevronLeftIcon } from '@mui/icons-material';

import { mainListItems, secondaryListItems } from './listItems';

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const DRAWER_WIDTH: number = 240;

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: DRAWER_WIDTH,
        width: `calc(100% - ${DRAWER_WIDTH}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
    '& .MuiDrawer-paper': {
        position: 'relative',
        whiteSpace: 'nowrap',
        width: DRAWER_WIDTH,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
        boxSizing: 'border-box',
        ...(!open && {
            overflowX: 'hidden',
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            width: theme.spacing(7),
            [theme.breakpoints.up('sm')]: {
                width: theme.spacing(9),
            },
        }),
    },
}));

const TopNavigation = (props: { open: boolean; toggleDrawer: () => void }) => {
    const { open, toggleDrawer } = props;

    return (
        <AppBar position='absolute' open={open}>
            <Toolbar
                sx={{
                    pr: '24px', // keep right padding when drawer closed
                }}
            >
                <IconButton
                    edge='start'
                    color='inherit'
                    aria-label='open drawer'
                    onClick={toggleDrawer}
                    sx={{
                        marginRight: '36px',
                        ...(open && { display: 'none' }),
                    }}
                >
                    <MenuIcon />
                </IconButton>
                <Typography component='h1' variant='h6' color='inherit' noWrap sx={{ flexGrow: 1 }}>
                    Dashboard
                </Typography>
            </Toolbar>
        </AppBar>
    );
};

const SideNavigation = (props: { open: boolean; toggleDrawer: () => void }) => {
    const { open, toggleDrawer } = props;

    return (
        <Drawer variant='permanent' open={open}>
            <Toolbar
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    px: [1],
                }}
            >
                <IconButton onClick={toggleDrawer}>
                    <ChevronLeftIcon />
                </IconButton>
            </Toolbar>
            <Divider />
            <List component='nav'>
                {mainListItems}
                <Divider sx={{ my: 1 }} />
                {secondaryListItems}
            </List>
        </Drawer>
    );
};

export const Navigation = (props: NavigationProps) => {
    const [open, setOpen] = useState(true);

    const toggleDrawer = () => {
        setOpen(!open);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <TopNavigation open={open} toggleDrawer={toggleDrawer} />
            <SideNavigation open={open} toggleDrawer={toggleDrawer}></SideNavigation>

            <Box
                component='main'
                sx={{
                    backgroundColor: (theme) =>
                        theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
                    flexGrow: 1,
                    height: '100vh',
                    overflow: 'auto',
                }}
            >
                <Toolbar />
                {props.children}
            </Box>
        </Box>
    );
};

export interface NavigationProps {
    children?: ReactNode;
}
