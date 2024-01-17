import { Box, CssBaseline, createTheme, ThemeProvider, Typography } from '@mui/material';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

function App() {
    return (
        <ThemeProvider theme={darkTheme}>
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '10%' }}>
                <CssBaseline></CssBaseline>
                <Typography variant='h2'>準備中</Typography>
            </Box>
        </ThemeProvider>
    );
}

export default App;
