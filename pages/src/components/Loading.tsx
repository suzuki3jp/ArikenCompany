import { Container, CircularProgress } from '@mui/material';

export function Loading() {
    return (
        <Container
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
            }}
        >
            <CircularProgress></CircularProgress>
        </Container>
    );
}
