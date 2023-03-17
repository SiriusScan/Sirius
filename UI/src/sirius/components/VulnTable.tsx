import React, { Component, useCallback, useMemo } from 'react';
import {useHistory} from 'react-router-dom';
import {useNavigate} from 'react-router-dom';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';

import MaterialReactTable, {
  MRT_ShowHideColumnsButton,
  MRT_FullScreenToggleButton,
  MRT_ToggleDensePaddingButton,

} from 'material-react-table';

import { SeverityBadge } from './VulnerabililtyTable/SeverityBadge';
import { VulnerabilityTableSearch } from './VulnerabililtyTable/VulnerabilityTableSearch';

import WifiTetheringErrorRoundedSharpIcon from '@mui/icons-material/WifiTetheringErrorRoundedSharp';
import NumbersIcon from '@mui/icons-material/Numbers';

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
  //Re-order the vulnList by severity
  const vulnList = (props.vulnList || []).sort((a, b) => {
    if (a.CVSSV3.baseSeverity < b.CVSSV3.baseSeverity) {
      return 1;
    }
    if (a.CVSSV3.baseSeverity > b.CVSSV3.baseSeverity) {
      return -1;
    }
    return 0;
  });
  

  return (
    <div className="rightcard">
      <VulnerabilityTable data={vulnList} />
    </div>
  );
}

const VulnerabilityTable = (props: any) => {
  const [filter, setFilter] = React.useState('');
  const navigate = useNavigate();
  const handleOnClick = useCallback((id: string) => navigate('/report/vulnerability?id=' + id, {replace: false}), [navigate]);

  //should be memoized or stable
  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => `${row.CVSSV3.baseSeverity}`, 
        accessorKey: 'CVSSV3.baseSeverity',
        header: <WifiTetheringErrorRoundedSharpIcon />,
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
            onClick={() => handleOnClick(row.original.CVEDataMeta.ID)}
          >
            <SeverityBadge severity={row.original.CVSSV3.baseSeverity} />
          </Box>
        ),
      },
      {
        accessorKey: 'CVEDataMeta.ID', //access nested data with dot notation
        header: 'Vulnerability',
        size: 50,
        Cell: ({renderedCellValue, row}) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              cursor: 'pointer',
            }}
            onClick={() => handleOnClick(row.original.CVEDataMeta.ID)}
          >
            {renderedCellValue}
          </Box>
        ),
      },
      {
        accessorFn: (row) => `${row.Description.description_data[0].value.slice(0,75)}...`, 
        header: 'Description',
        size: 500,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              cursor: 'pointer',
            }}
            onClick={() => handleOnClick(row.original.CVEDataMeta.ID)}
          >
            <span>{renderedCellValue}</span>
          </Box>
        ),
      },
      {
        accessorKey: 'AffectedHosts.length',
        header: <NumbersIcon />,
        size: 10,
      },
      {
        accessorKey: 'CVSSV3.baseScore',
        header: 'CVSS',
        size: 10,
      },
    ],
    [],
  );

  return <MaterialReactTable 
    columns={columns} 
    data={props.data} 
    enableColumnActions={false}
    enableSelectAll={true}
    enableRowSelection
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
        <VulnerabilityTableSearch setFilter={setFilter} />

      </Box>
    )}
  />;
};