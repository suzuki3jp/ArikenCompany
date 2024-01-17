import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline, createTheme, ThemeProvider } from '@mui/material';

import { Navigation } from './components/Navigation';

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
                    <Route path='/' element={<Navigate replace to='/dashboard'></Navigate>}></Route>
                    <Route path='/dashboard' element={<Navigation></Navigation>}></Route>
                </Routes>
            </Box>
        </ThemeProvider>
    );
}

export default App;
