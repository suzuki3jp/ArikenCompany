'use client';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';

import type { ReactNode } from 'react';

const defaultTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

export const ThemeProvider = (props: ThemeProviderProps) => {
    return <MuiThemeProvider theme={defaultTheme}>{props.children}</MuiThemeProvider>;
};

export interface ThemeProviderProps {
    children?: ReactNode;
}
