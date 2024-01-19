import { Component, FC, ReactNode } from 'react';
import { useLocation, Location } from 'react-router-dom';
import {
    AppBar as MuiAppBar,
    AppBarProps as MuiAppBarProps,
    Box,
    Container,
    Divider,
    Drawer as MuiDrawer,
    List,
    Toolbar,
    IconButton,
    styled,
    Typography,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Grid,
} from '@mui/material';
import {
    Menu as MenuIcon,
    ChevronLeft as ChevronLeftIcon,
    Dashboard as DashboardIcon,
    BorderColor as CommandsIcon,
} from '@mui/icons-material';

import { getPageNameFromPath } from '../utils';

/**
 * ==============================
 * Navigation Componentの定義
 * ==============================
 */
class NavigationUnWrapped extends Component<NavigationProps, NavigationState> {
    constructor(props: NavigationProps) {
        super(props);
        this.state = {
            open: false,
        };
    }

    toggleDrawer = () => {
        this.setState({
            open: !this.state.open,
        });
    };

    render(): ReactNode {
        return (
            <>
                <AppBar position='absolute' open={this.state.open}>
                    <Toolbar sx={{ pr: '24px' }}>
                        <IconButton
                            edge='start'
                            color='inherit'
                            aria-label='open drawer'
                            onClick={this.toggleDrawer}
                            sx={{ marginRight: '36px', ...(this.state.open && { display: 'none' }) }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography component='h1' variant='h6' color='inherit' noWrap sx={{ flexGrow: 1 }}>
                            {getPageNameFromPath(this.props.location.pathname)}
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Drawer variant='permanent' open={this.state.open}>
                    <Toolbar
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            px: [1],
                        }}
                    >
                        <IconButton onClick={this.toggleDrawer}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </Toolbar>
                    <Divider />
                    <List>
                        <ListItemButton>
                            <ListItemIcon>
                                <DashboardIcon />
                            </ListItemIcon>
                            <ListItemText primary='Dashboard' />
                        </ListItemButton>
                    </List>
                </Drawer>
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
                    <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
                        {this.props.element}
                    </Container>
                </Box>
            </>
        );
    }
}

export interface NavigationProps {
    element?: ReactNode;
    location: Location;
}

export interface NavigationState {
    open: boolean;
}

export const Navigation: FC<Omit<NavigationProps, 'location'>> = (props: Omit<NavigationProps, 'location'>) => {
    const location = useLocation();
    return <NavigationUnWrapped location={location} {...props}></NavigationUnWrapped>;
};

/**
 * ==============================
 * drawer、AppBarの定義
 * ==============================
 */

const drawerWidth: number = 240;

interface AppBarProps extends MuiAppBarProps {
    open: boolean;
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

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
    '& .MuiDrawer-paper': {
        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
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
