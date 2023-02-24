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

class VulnTable extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      open: false,
      setOpen: false,
    };
    this.props.vulnList.map((row) => console.log(row));
  }

  render() {
    return (
      <div className="rightcard">
        <TableContainer component={Paper}>
          <Table aria-label="collapsible table">
            <TableHead>
              <TableRow>
                <TableCell>Vulnerability</TableCell>
                <TableCell align="left">Description</TableCell>
                {this.props.allHosts ? <TableCell align="left">Affected Systems</TableCell> : null }
                <TableCell align="center">Severity</TableCell>
                <TableCell align="center">CVSSv3</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.props.vulnList.map((row) => (
                <Row key={row.CVEDataMeta.ID} row={row} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    );
  }
}
export default VulnTable;

function hostClick(row) {  
  console.log(row.ip);
}

{/* HostTable */}
function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const handleOnClick = useCallback((row) => navigate('/report/vulnerability?id=' + row.CVEDataMeta.ID, {replace: true}), [navigate]);


  return (
    <>  
        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} onClick={() => handleOnClick(row)} sx={{ '& > *': { borderBottom: 'unset' } }}>
          <TableCell width="20%" component="th" scope="row">
            {row.CVEDataMeta.ID} 
          </TableCell>
          <TableCell width="65%" align="left">
            <Box sx={{ textOverflow: 'ellipsis' }}>
              {row.Description.description_data[0].value.slice(0,75)}...
            </Box>
          </TableCell>
          {row.AffectedHosts ? <TableCell width="5%" align="left">{row.AffectedHosts.length}</TableCell> : null}
          
          <TableCell width="5%" align="center">{row.CVSSV3.baseSeverity}</TableCell>
          <TableCell width="5%" align="center">{row.CVSSV3.baseScore}</TableCell>
        </TableRow>
    </>
  );
}