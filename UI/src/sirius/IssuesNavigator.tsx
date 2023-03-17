import * as React from 'react';
import { Card, CardContent, CardHeader, Paper } from "@mui/material";
import { Container } from "@mui/material";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import BugReportIcon from '@mui/icons-material/BugReport';
import HealingIcon from '@mui/icons-material/Healing';
import AnalyticsIcon from '@mui/icons-material/Analytics';

import SiriusIssues from "./containers/SiriusIssues";
import { HostFindingsDashboard } from "./components/Reporting";

import config from '../../config.json';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }
  
export default function IssuesNavigator() {
    const [value, setValue] = React.useState(0);
    const [vulnList, setVulnList] = React.useState([]);

    React.useEffect(() => {
      //Get the list of vulnerabilities
      //Make API post request to get the list of vulnerabilities for the ip parameter
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: '' })
      };
      fetch('http://' + config.server.host + ':' + config.server.port + '/api/svdb/report/vulnerability', requestOptions)
        .then((response) => response.json())
        .then((data) => {
            setVulnList(data);
            console.log("=======");
            console.log(data);
          });
      }, [])
  
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
      setValue(newValue);
      console.log("New value: " + newValue)
    };

    return (
      <Container sx={{
        justifyContent: 'left',
        alignItems: 'left',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Card sx={{
          borderRadius: 3,
          boxShadow: 3,
          minWidth: '1280px',
          width: '100%',
        }}>
            {value == 0 ?
                <CardHeader sx={{ fontSize: 54 }} title="Security Issues Navigator" subheader="Vulnerabilities" avatar={<BugReportIcon />} />
            : null}
            {value == 1 ?
                <CardHeader title="Security Issues Navigator" subheader="Missing Patches" avatar={<HealingIcon />} />
            : null}
            {value == 2 ?
                <CardHeader title="Security Issues Navigator" subheader="Statistics" avatar={<AnalyticsIcon />} />
            : null}
            <CardContent>
                <IssueTabs  value={value} vulnList={vulnList} handleChange={handleChange} />
            </CardContent>
            {value == 0 ? 
                <SiriusIssues vulnList={vulnList} />
            : null}
        </Card>
      </Container>
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

function updateTab(value) {
  const [newValue, setValue] = React.useState(0);
  console.log("Updating tab");
  setValue(value);
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function IssueTabs({value, vulnList, handleChange}) {
  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="">
          <Tab label="Vulnerabilities" {...a11yProps(0)} />
          <Tab label="Missing Patches" {...a11yProps(1)} />
          <Tab label="Dashboard" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>

        <Box sx={{marginLeft: -5, marginTop: 2}}>
          <HostFindingsDashboard vulnList={vulnList} />
        </Box>

      </TabPanel>
      <TabPanel value={value} index={1}>
        Patch tracking is not yet implemented but will launch with the Sirius agent!
      </TabPanel>
      <TabPanel value={value} index={2}>
        Dashboard is not yet implemented. But it is coming soon!
      </TabPanel>
    </Box>
  );
}