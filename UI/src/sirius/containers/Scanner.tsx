import React, { Component, useCallback } from 'react';
import {useHistory} from 'react-router-dom';
import {useNavigate} from 'react-router-dom';
import { Link } from 'react-router-dom';

import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

import { createMuiTheme } from 'material-ui/styles';

export default function Scanner() {
  const [scanResults, setScanResults] = React.useState({Targets: []});
  const [target, setTarget] = React.useState("");

  function executeScan() {
    StartScan(target, setScanResults);
  }

  return (
    <>
      <Card sx={{paddingLeft: 3, paddingBottom: 5}}>
        <TextField 
          id="outlined-basic" 
          label="Target IP Address" 
          variant="outlined" 
          sx={{marginTop: 2, marginLeft: 2, width: 300}}
          onChange={(e) => setTarget(e.target.value)}
        />
        <Button onClick={() => executeScan()} variant="contained" sx={{marginTop: 2, marginLeft: 2}}>Start Scan</Button>

        {scanResults.Targets.length ? <ScanResults scanResults={scanResults} /> : null}
      </Card>
    </>
  );
}

function StartScan(target: string, setScanResults: any) {
  console.log("Starting Scan: " + target)

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
  fetch('http://localhost:8080/api/scan/new', requestOptions)
    .then((response) => response.json())
    .then((data) => {
        setScanResults(data);
      });
}

export const ScanResults = (scanResults: {}) => {
  return (
      <Box>
        <h1>Scan Results</h1>
        {scanResults.scanResults.Targets.map((target: any) => (
          <Box key={target}>
            <h5>Target IP Address: {target}</h5>
          </Box>
        ))}
      </Box>
  );
};