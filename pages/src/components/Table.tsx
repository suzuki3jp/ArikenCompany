import { Table as MuiTable, TableHead, TableBody, TableRow, TableCell } from '@mui/material';

export function Table(headItems: (string | number)[], bodyItems: (string | number)[][]) {
    return (
        <MuiTable>
            <TableHead>
                <TableRow>
                    {headItems.map((v) => (
                        <TableCell>{v}</TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {bodyItems.map((v) => (
                    <TableRow>
                        {v.map((v) => (
                            <TableCell>{v}</TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </MuiTable>
    );
}
