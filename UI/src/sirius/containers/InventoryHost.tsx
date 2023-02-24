import React, { Component, useCallback } from 'react';
import {useHistory} from 'react-router-dom';
import {useNavigate} from 'react-router-dom';
import { Link } from 'react-router-dom';

import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import Badge from '@mui/material/Badge';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AddBox from '@mui/icons-material/AddBox';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';

import { createMuiTheme } from 'material-ui/styles';

class InventoryHost extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      open: false,
      setOpen: false,
    };
    this.props.hostList.map((row) => console.log(row.os));
  }

  render() {
    return (
      <div className="rightcard">
        <TableContainer component={Paper}>
          <Table aria-label="collapsible table">
            <TableHead>
              <TableRow>
                <TableCell>Host</TableCell>
                <TableCell align="right">Name</TableCell>
                <TableCell align="right">Operating System</TableCell>
                <TableCell align="right">Version</TableCell>
                <TableCell align="right">Issues</TableCell>
                <TableCell align="right">Risk</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.props.hostList.map((row) => (
                <Row key={row.ip} row={row} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    );
  }
}
export default InventoryHost;

function hostClick(row) {  
  console.log(row.ip);
}

{/* HostTable */}
function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const handleOnClick = useCallback((row) => navigate('/report/host?ip=' + row.ip, {replace: true}), [navigate]);


  return (
    <>
      {/* <HostTable /> */}
      
        <TableRow onClick={() => handleOnClick(row)} sx={{ '& > *': { borderBottom: 'unset' } }}>
          <TableCell component="th" scope="row">
            {row.ip}
          </TableCell>
          <TableCell align="right">{row.hostname}</TableCell>
          <TableCell align="right">{row.os}</TableCell>
          <TableCell align="right">{row.osversion}</TableCell>
          <TableCell align="right">10</TableCell>
          <TableCell align="right">3</TableCell>
        </TableRow>
      
    </>
  );
}


