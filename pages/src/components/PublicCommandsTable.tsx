import { DataGrid, GridColDef } from '@mui/x-data-grid';

import { PublicCommandData } from '../api-wrapper';

export function PublicCommandsTable(props: PublicCommandsTableProps) {
    const colums: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 30 },
        { field: 'name', headerName: 'コマンド名', width: 100 },
        { field: 'content', headerName: '内容', width: 870 },
        {
            field: 'userlevel',
            headerName: 'Userlevel',
            description: 'コマンドの使用できる人を表します。',
            headerAlign: 'right',
            align: 'right',
            width: 90,
        },
    ];

    const rows = props.cmds.map((c, i) => ({
        id: i,
        name: c.name,
        content: c.content,
        userlevel: c.isModOnly ? 'moderator' : 'everyone',
    }));

    return (
        <>
            <DataGrid
                className='word-wrap'
                rows={rows}
                columns={colums}
                disableColumnSelector
                disableRowSelectionOnClick
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            ></DataGrid>
        </>
    );
}

interface PublicCommandsTableProps {
    cmds: PublicCommandData[];
}
