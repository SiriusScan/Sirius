import React, { Component, useCallback } from 'react';
import {useHistory} from 'react-router-dom';
import {useNavigate} from 'react-router-dom';
import { Link } from 'react-router-dom';

import { Container } from "@mui/material";
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
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

class VulnDetails extends React.Component {
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
      <div>
        {this.props.vulnList.map((row) => (
          <Card sx={{marginTop: -2, paddingLeft: 3}} key={row.CVEDataMeta.ID}>

            <Table sx={{maxWidth: '80%'}} aria-label="collapsible table">
              <TableRow>
                <TableCell>
                  Summary
                </TableCell>
                <TableCell align="left">
                  {row.Description.description_data[0].value}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  CVE ID
                </TableCell>
                <TableCell align="left">
                  <a href={"https://nvd.nist.gov/vuln/detail/" + row.CVEDataMeta.ID}>{row.CVEDataMeta.ID}</a>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  CVSSv3
                </TableCell>
                <TableCell align="left">
                  {row.CVSSV3.baseScore} 
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  Severity
                </TableCell>
                <TableCell align="left">
                {row.CVSSV3.baseSeverity}
                </TableCell>
              </TableRow>
            </Table>

          <br />
            <h6>References</h6>
            {row.References.map((ref, i) => (
              <div key={i}>
                <li>
                  {ref}
                </li>
              </div>
            ))}
            <Divider sx={{marginTop: 2, marginBottom: 2}} />

          </Card>
        ))}
      </div>
    );
  }
}
export default VulnDetails;