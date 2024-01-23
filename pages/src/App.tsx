import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline, createTheme, ThemeProvider } from '@mui/material';

import { Navigation } from './components';

import { PublicCommands } from './routes/PublicCommands';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

function App() {
    return (
        <ThemeProvider theme={darkTheme}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CssBaseline></CssBaseline>
                <Routes>
                    <Route path='/' element={<Navigate replace to='/commands'></Navigate>}></Route>
                    <Route
                        path='/commands'
                        element={<Navigation element={<PublicCommands></PublicCommands>} />}
                    ></Route>
                </Routes>
            </Box>
        </ThemeProvider>
    );
}

export default App;
