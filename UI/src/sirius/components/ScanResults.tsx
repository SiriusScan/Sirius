import React, { Component, useCallback, useMemo } from 'react';
import {useHistory} from 'react-router-dom';
import {useNavigate} from 'react-router-dom';
import { Link } from 'react-router-dom';


import Box from '@mui/material/Box';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindows, faLinux } from '@fortawesome/free-brands-svg-icons';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import LinearProgress, { linearProgressClasses, LinearProgressProps } from '@mui/material/LinearProgress';

import MaterialReactTable, {
  MRT_ShowHideColumnsButton,
  MRT_FullScreenToggleButton,
  MRT_ToggleDensePaddingButton,

} from 'material-react-table';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AddBox from '@mui/icons-material/AddBox';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';

import { styled } from '@mui/material/styles';
import { createMuiTheme } from 'material-ui/styles';
import { VulnerabilityCount } from './VulnerabililtyTable/VulnerabilityCount';
import { VulnerabilityTableSearch } from './VulnerabililtyTable/VulnerabilityTableSearch';

import WifiTetheringErrorRoundedSharpIcon from '@mui/icons-material/WifiTetheringErrorRoundedSharp';
import NumbersIcon from '@mui/icons-material/Numbers';

import { ScanRequest } from '../api/types';

export default function ScanResults(props: { scanRequest: ScanRequest }) {
  //Get the scan results from the props
  const { scanRequest } = props;
  console.log(scanRequest?.ScanReport);

  let scanResults = scanRequest?.ScanReport?.ScanResults || [];

  // For each host in scanResults, check to see if it is completed in the CompletedHosts array
  // If it is completed, add the status to the host object
  scanResults = scanResults.map((host) => {
      const isCompleted = scanRequest?.ScanReport?.CompletedHosts?.includes(host.ip);
      return {
          ...host,
          status: isCompleted ? 'Complete' : 'Scanning',
      };
  });

  return (
    <div className="rightcard">
      <ScanTable data={scanResults} />
    </div>
  );
}

const ScanTable = (props: any) => {
  const [filter, setFilter] = React.useState('');
  const navigate = useNavigate();
  const handleOnClick = useCallback((id: string) => navigate('/report/host?ip=' + id, {replace: false}), [navigate]);

  console.log(props.data)

  //should be memoized or stable
  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => `${row.ip}`, 
        accessorKey: 'vulnerabilities',
        header: <NumbersIcon />,
        size: 5,
        Cell: ({renderedCellValue, row}) => (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                cursor: 'pointer',
              }}
              onClick={() => handleOnClick(row.ip)}
            >
              <VulnerabilityCount severity={row.ip} count={row.cve?.length} />
            </Box>
          ),
      },
      {
        accessorKey: 'os', //access nested data with dot notation
        header: 'OS',
        size: 5,
        Cell: ({renderedCellValue, row}) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              cursor: 'pointer',
            }}
            onClick={() => handleOnClick(row.ip)}
          >
            {/* If os == windows give windows fa icon else linux */}
            {row.os == "windows" ? 
                <FontAwesomeIcon size="2x" icon={faWindows} /> 
                : row.os == "linux" ?
                <FontAwesomeIcon size="2x" icon={faLinux} />
                :
                <HelpCenterIcon />
            }
          </Box>
        ),
      },
      {
        accessorFn: (row) => `${row.ip}`, 
        accessorKey: 'ip',
        header: 'IP Address',
        size: 10,
        enableSorting: true,
        sortAscFirst: true,
        enableGlobalFilter: false,
        Cell: ({renderedCellValue, row}) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              cursor: 'pointer',
            }}
            onClick={() => handleOnClick(row.ip)}
          >
            <span>{renderedCellValue}</span>
          </Box>
        ),
      },
      {
        accessorFn: (row) => `${row.hostname}`, 
        accessorKey: 'hostname', //access nested data with dot notation
        header: 'Hostname',
        size: 10,
        Cell: ({renderedCellValue, row}) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              cursor: 'pointer',
            }}
            onClick={() => handleOnClick(row.ip)}
          >
            {renderedCellValue}
          </Box>
        ),
      },
      {
        accessorFn: (row) => `${row.status}`, 
        header: 'Status',
        size: 10,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              cursor: 'pointer',
            }}
            onClick={() => handleOnClick(row.ip)}
          >
            <span>{renderedCellValue}</span>
          </Box>
        ),
      },
      {
        accessorFn: (row) => `${row.status}`, 
        header: 'Progress',
        size: 200,
        Cell: ({ renderedCellValue, row }) => (
            <span>
                <LoadingBar loading={renderedCellValue !== "Complete"} />
            </span>
          ),
      },
    ],
    [],
  );

  return <MaterialReactTable 
    columns={columns} 
    data={props.data} 
    enableColumnActions={false}
    state={{
      globalFilter: filter,
    }}
    muiTableHeadCellProps={{
      //simple styling with the `sx` prop, works just like a style prop in this example
      sx: {
        fontWeight: 'bold',
        fontSize: '14px',
      },
    }}
    renderToolbarInternalActions={({ table }) => (
      <>
        {/* add your own custom print button or something */}

        {/* built-in buttons (must pass in table prop for them to work!) */}
        <MRT_ShowHideColumnsButton table={table} />
        <MRT_FullScreenToggleButton table={table} />
        <MRT_ToggleDensePaddingButton table={table} />
      </>
    )}
    //add custom action buttons to top-left of top toolbar
    renderTopToolbarCustomActions={({ table }) => (
      <Box sx={{ display: 'flex', gap: '1rem', p: '4px' }}>
        
      </Box>
    )}
  />;
};

// Centered Loading Bar Component
const LoadingBar = ({loading}: {loading: bool}) => {
    return (
        <Box sx={{ width: '50%', display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '300px', mr: -10 }}>
            {loading ? 
            <LoadingLinearProgress variant="indeterminate" /> 
            : 
            <LoadingLinearProgress variant="determinate" value={100} />
            }
        </Box>
        </Box>
    )
}

const LoadingLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 20,
    borderRadius: 4,
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor: '#eaeaea',
    },
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 4,
      backgroundColor: theme.palette.mode === 'light' ? '#428dd1' : '#428dd1',
      animationDuration: '2.5s',
    },
  }));