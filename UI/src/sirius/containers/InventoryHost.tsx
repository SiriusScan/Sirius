import React, { useCallback } from 'react';
import { useHistory, useNavigate } from 'react-router-dom';

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { createMuiTheme } from 'material-ui/styles';

function InventoryHost(props) {
  return (
    <div className="rightcard">
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell>IP Address</TableCell>
              <TableCell>Hostname</TableCell>
              <TableCell>Operating System</TableCell>
              <TableCell>Version</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.hostList && props.hostList.map((row) => (
              <Row key={row.ip} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default InventoryHost;

function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const handleOnClick = useCallback(() => navigate(`/report/host?ip=${row.ip}`, { replace: false }), [navigate, row.ip]);

  return (
    <TableRow onClick={handleOnClick} sx={{ '& > *': { borderBottom: 'unset' } }}>
      <TableCell component="th" scope="row">
        {row.ip}
      </TableCell>
      <TableCell>{row.hostname}</TableCell>
      <TableCell>{row.os}</TableCell>
      <TableCell>{row.osversion}</TableCell>
    </TableRow>
  );
}