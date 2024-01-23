import { Typography } from '@mui/material';

interface TitleProps {
    children?: React.ReactNode;
}

export function Title(props: TitleProps) {
    return (
        <Typography component='h2' variant='h6' color='primary' gutterBottom sx={{ alignContent: 'center' }}>
            {props.children}
        </Typography>
    );
}
