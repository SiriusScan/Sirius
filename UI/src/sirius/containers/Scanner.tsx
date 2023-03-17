import React, { Component, useCallback } from 'react';
import {useHistory} from 'react-router-dom';
import {useNavigate} from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

import { alpha, styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import LinearProgress, { linearProgressClasses, LinearProgressProps } from '@mui/material/LinearProgress';

import { createMuiTheme } from 'material-ui/styles';

import { ScanRequest } from '../api/types';
import ScanResults from '../components/ScanResults';

import config from '../../../config.json';

export default function Scanner() {
  const [scanStatus, setScanStatus] = React.useState(0);
  const [scanResults, setScanResults] = React.useState({Targets: []} as ScanRequest);
  const [scanRequest, setScanRequest] = React.useState({targets: []} as ScanRequest);
  const [target, setTarget] = React.useState("");
  const [scanID, setScanID] = React.useState("");
  const [showScanResults, setShowScanResults] = React.useState(true);

  function executeScan() {
    StartScan(target, scanID, setScanResults, setScanStatus, setScanID);
  }

  return (
    <>
      <Card>
        {scanStatus == 0 ? 
          <Box>
            <TextField 
              id="outlined-basic" 
              label="Target IP Address" 
              variant="outlined" 
              sx={{marginTop: 2, marginLeft: 2, width: 300}}
              onChange={(e) => setTarget(e.target.value)}
            />
            <Button onClick={() => executeScan()} variant="contained" sx={{marginTop: 2, marginLeft: 2}}>Start Scan</Button>
          </Box>
        : 
          <Box>
            <ScanProgress target={target} />
          </Box>
        }
          <Box>
            <ScanResults scanRequest={scanResults} />
          </Box>
      </Card>
    </>
  );
}

function StartScan(target: string, scanID: string, setScanResults: any, setScanStatus: any, setScanID: any) {
  console.log("Starting Scan: " + target)
  setScanStatus(1);

  //Create list of targets based on input
  if (target.split(",").length > 1) {
    var targets = target.split(",");
  } else {
    var targets = [target];
  }

  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targets: targets })
  };
  fetch('http://' + config.server.host + ':' + config.server.port + '/api/scan/new', requestOptions)
    .then((response) => response.json())
    .then((data) => {
        setScanID(data);

        //Monitor the scan status until it is complete
        setInterval(() => { 
          var status = MonitorScanStatus(data, setScanStatus, setScanResults);
          if (status == true) {
            clearInterval();
          }
        }, 5000);
      })
}

function MonitorScanStatus(scanID: string, setScanStatus: any, setScanResults: any) {
  console.log("Monitoring Scan Status: " + scanID)

  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ScanID: scanID })
  };

  //Check the scan status
  fetch('http://' + config.server.host + ':' + config.server.port + '/api/scan/report', requestOptions)
    .then((response) => response.json())
    .then((data) => {
      //Update the scan request object with the latest results
      setScanResults(data);


      //If scan command is complete exit scan monitor loop
      if (data.Command == "complete") {
        console.log("Scan Complete")
        setScanStatus(0);
        return true;
      }
    }
  )
}

export const ScanProgress = (target: any) => {
  return (
      <Box sx={{ml:3, mb:5}}>
        <Typography variant="h4">Scanning Job Started</Typography>
        <Typography variant="h6">Target: {target.target}</Typography>
         <hr />
        <LoadingBar />
      </Box>
  );
};

// Centered Loading Bar Component
const LoadingBar = () => {
  return (
    <Box sx={{ width: '50%', display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LoadingLinearProgress variant="indeterminate" />
      </Box>
    </Box>
  )
}

const LoadingLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 25,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: '#eaeaea',
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === 'light' ? '#428dd1' : '#428dd1',
    animationDuration: '2s',
  },
}));