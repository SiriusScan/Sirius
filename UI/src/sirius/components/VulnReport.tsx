import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, Paper } from "@mui/material";
import { Container } from "@mui/material";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LanIcon from '@mui/icons-material/Lan';
import HealingIcon from '@mui/icons-material/Healing';
import AnalyticsIcon from '@mui/icons-material/Analytics';

import VulnDetails from "./VulnDetails";

import config from '../../../config.json';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }

export default function VulnReportTabs() {
  const [value, setValue] = React.useState(0);
  const [vulnList, setVulnList] = React.useState([]);
  const [queryParameters] = useSearchParams()

  React.useEffect(() => {
    //Get the list of vulnerabilities
    //Make API post request to get the list of vulnerabilities for the ip parameter
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ CVE: [queryParameters.get("id")] })
    };
    fetch('http://' + config.server.host + ':' + config.server.port + '/api/svdb/get/finding', requestOptions)
      .then((response) => response.json())
      .then((data) => {
          setVulnList(data);
        });
    }, [])


  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div sx={{ marginTop: 0, width: '100%' }}>
      <Card>
        {/* Navigator Tab Headers */}

        <CardContent>
          <HostTabs value={value} handleChange={handleChange} />
        </CardContent>

        {/* Navigator Tab Contents */}
        <VulnDetails vulnList={vulnList} hidden={value !== 0} />
        {/* Add other components for other tabs here with similar hidden attribute logic */}
      </Card>
    </div>
  );
}


function HostTabs({value, handleChange}) {
    return (
      <Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="">
            <Tab label="Vulnerability Details" {...a11yProps(0)} />
            <Tab label="Affected Systems" {...a11yProps(1)} />
            <Tab label="Statistics" {...a11yProps(2)} />
          </Tabs>
        </Box>
      </Box>
    );
  }
    
  function TabPanel(props: TabPanelProps) {
      const { children, value, index, ...other } = props;
  
      return (
        <div>
          {value === index && (
            <Box>
              {children}
            </Box>
          )}
        </div>
      );
  }
    
  function a11yProps(index: number) {
      return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
      };
  }