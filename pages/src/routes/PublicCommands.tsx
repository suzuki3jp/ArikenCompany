import { Component, ReactNode } from 'react';
import { Grid, Card } from '@mui/material';

import { ApiClient, PublicCommandData } from '../api-wrapper';
import { Loading, PublicCommandsTable, Title } from '../components';

export class PublicCommands extends Component<PublicCommandsProps, PublicCommandsState> {
    constructor(props: PublicCommandsProps) {
        super(props);
        this.state = {
            uptime: null,
            publicCommands: null,
        };
    }

    async fetchStatus() {
        const status = await new ApiClient().getStatus();
        this.setState(status);
    }

    async fetchPublicCommands() {
        const c = await new ApiClient().getPublicCommands();
        console.log(c);
        this.setState({ publicCommands: c });
    }

    componentDidMount(): void {
        this.fetchStatus();
        this.fetchPublicCommands();
    }

    render(): ReactNode {
        return (
            <>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Card
                            sx={{
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                height: 'auto',
                            }}
                        >
                            <Title>ArikenCompany Commands</Title>
                            {this.state.publicCommands ? (
                                <PublicCommandsTable cmds={this.state.publicCommands}></PublicCommandsTable>
                            ) : (
                                <Loading></Loading>
                            )}
                        </Card>
                    </Grid>
                </Grid>
            </>
        );
    }
}

export interface PublicCommandsProps {}

export interface PublicCommandsState {
    uptime: {
        hours: number;
        minutes: number;
        seconds: number;
    } | null;
    publicCommands: PublicCommandData[] | null;
}
