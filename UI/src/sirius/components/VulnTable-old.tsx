import React, { Component, useCallback, useMemo } from 'react';
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
import Checkbox from '@mui/material/Checkbox';
import TablePagination from '@mui/material/TablePagination';
import TableSortLabel from '@mui/material/TableSortLabel';

import MaterialReactTable from 'material-react-table';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AddBox from '@mui/icons-material/AddBox';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';

import { createMuiTheme } from 'material-ui/styles';

type VulnerabilityList = [{
  CVEDataMeta: {
    ID: string,
    ASSIGNER: string,
  },
  Description: {
    description_data: [{
      lang: string,
      value: string,
    }],
  },
  Impact: {
    baseMetricV3: {
      cvssV3: {
        baseScore: number,
        baseSeverity: string,
      },
    },
  },
}];

export default function VulnTable(props: any) {
  const [pg, setpg] = React.useState(0);
  const [rpg, setrpg] = React.useState(5);

  function handleChangePage(event, newpage) {
      setpg(newpage);
  }

  function handleChangeRowsPerPage(event) {
      setrpg(parseInt(event.target.value, 10));
      setpg(0);
  }


  //nested data is ok, see accessorKeys in ColumnDef below
const data = [
  {
    name: {
      firstName: 'John',
      lastName: 'Doe',
    },
    address: '261 Erdman Ford',
    city: 'East Daphne',
    state: 'Kentucky',
  },
  {
    name: {
      firstName: 'Jane',
      lastName: 'Doe',
    },
    address: '769 Dominic Grove',
    city: 'Columbus',
    state: 'Ohio',
  },
  {
    name: {
      firstName: 'Joe',
      lastName: 'Doe',
    },
    address: '566 Brakus Inlet',
    city: 'South Linda',
    state: 'West Virginia',
  },
  {
    name: {
      firstName: 'Kevin',
      lastName: 'Vandy',
    },
    address: '722 Emie Stream',
    city: 'Lincoln',
    state: 'Nebraska',
  },
  {
    name: {
      firstName: 'Joshua',
      lastName: 'Rolluffs',
    },
    address: '32188 Larkin Turnpike',
    city: 'Charleston',
    state: 'South Carolina',
  },
];


  return (
    <div className="rightcard">


      <Example data={props.vulnList} />


      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell>
                <Checkbox
                  color="primary"
                  inputProps={{
                    'aria-label': 'select all desserts',
                  }}
                />
              </TableCell>
              <TableCell>Vulnerability</TableCell>
              <TableCell align="left">Description</TableCell>
              {props.allHosts ? <TableCell align="left">Affected Systems</TableCell> : null }
              <TableCell align="center">Severity</TableCell>
              <TableCell align="center">CVSSv3</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(props.vulnList) && props.vulnList.map((row: VulnerabilityList) => (
              <Row key={row.CVEDataMeta.ID} row={row} />
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={props.vulnList.length}
          rowsPerPage={rpg}
          page={pg}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

    </div>
  );
}


{/* HostTable */}
function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);


  const navigate = useNavigate();
  const handleOnClick = useCallback((row) => navigate('/report/vulnerability?id=' + row.CVEDataMeta.ID, {replace: false}), [navigate]);


  return (
    <>  
      <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} sx={{ '& > *': { borderBottom: 'unset', cursor: 'pointer' } }}>
        <TableCell width="5%" component="th" scope="row">
          <Checkbox />
        </TableCell> 
        <TableCell width="20%" component="th" scope="row" onClick={() => handleOnClick(row)}>
          {row.CVEDataMeta.ID} 
        </TableCell>
        <TableCell width="65%" align="left" onClick={() => handleOnClick(row)}>
          <Box sx={{ textOverflow: 'ellipsis' }}>
            {row.Description.description_data[0].value.slice(0,75)}...
          </Box>
        </TableCell>
        {row.AffectedHosts ? <TableCell width="5%" align="left">{row.AffectedHosts.length}</TableCell> : null}
        
        <TableCell width="5%" align="center" onClick={() => handleOnClick(row)}>{row.CVSSV3.baseSeverity}</TableCell>
        <TableCell width="5%" align="center" onClick={() => handleOnClick(row)}>{row.CVSSV3.baseScore}</TableCell>
      </TableRow>
    </>
  );
}


const Example = (props) => {
  //should be memoized or stable
  const columns = useMemo(
    () => [
      {
        accessorKey: 'CVEDataMeta.ID', //access nested data with dot notation
        header: 'Vulnerability',
      },
      {
        accessorFn: (row) => `${row.Description.description_data[0].value}`, 
        header: 'Description',
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
            <span>{renderedCellValue}</span>
          </Box>
        ),
      },
      {
        accessorKey: 'AffectedHosts.length',
        header: 'Affected Systems',
      },
      {
        accessorKey: 'CVSSV3.baseSeverity',
        header: 'Severity',
      },
      {
        accessorKey: 'CVSSV3.baseScore',
        header: 'CVSSv3',
      },
    ],
    [],
  );

  return <MaterialReactTable columns={columns} data={props.data} />;
};