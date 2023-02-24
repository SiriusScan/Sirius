// @flow
import React, { Component } from 'react';
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

import VulnTable from "../components/VulnTable";

export default function HostReportTabs() {
  const [value, setValue] = React.useState(0);
  const [vulnList, setVulnList] = React.useState([]);

  React.useEffect(() => {
    //Get the list of vulnerabilities
    //Make API post request to get the list of vulnerabilities for the ip parameter
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip: '192.168.1.69' })
    };
    fetch('http://localhost:8080/api/svdb/report/vulnerability', requestOptions)
      .then((response) => response.json())
      .then((data) => {
          setVulnList(data);
        });
    }, [])


  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
      <div sx={{marginTop: 0, width: '100%'}}>
        <Card>
          <VulnTable allHosts="true" vulnList={vulnList}/>
        </Card>
    </div>
  );
}

function createData(
  cve: string,
  catagory: string,
  tags: string,
  cvss: int,
  srs: int,
  description: string
) {
  return {
    cve,
    catagory,
    tags,
    cvss,
    srs,
    description,
  };
}

function Row(props: { row: ReturnType<typeof createData> }) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.CVEDataMeta.ID}
        </TableCell>
        <TableCell align="right">{row.CVSSV3.baseSeverity}</TableCell>
        <TableCell align="right">{row.Tags}</TableCell>
        <TableCell align="right">{row.CVSSV3.baseScore}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Vulnerability Summary
              </Typography>
              <Typography variant="subtitle1" gutterBottom component="div">
                {row.Description.description_data[0].value}
              </Typography>
              <Typography variant="h6" gutterBottom component="div">
                Impact
              </Typography>
              <Typography variant="subtitle1" gutterBottom component="div">
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow>
                      <TableCell>Confidentiality Impact</TableCell>
                      <TableCell>Integrity Impact</TableCell>
                      <TableCell>Availability Impact</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>High</TableCell>
                      <TableCell>High</TableCell>
                      <TableCell>High</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Typography>
              <Typography variant="h6" gutterBottom component="div">
                References
              </Typography>
              <Typography variant="subtitle1" gutterBottom component="div">
                {row.References[0]}
              </Typography>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}