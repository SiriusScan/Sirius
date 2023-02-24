import * as React from 'react';
import { Card, CardContent, CardHeader, Paper } from "@mui/material";
import { Container } from "@mui/material";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import RadarIcon from '@mui/icons-material/Radar';
import HealingIcon from '@mui/icons-material/Healing';
import AnalyticsIcon from '@mui/icons-material/Analytics';

import Scanner from "./containers/Scanner";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }

export default function ScanControl() {
  const [value, setValue] = React.useState(0);
  const [hostList, setHostList] = React.useState([]);

  React.useEffect(() => {
  //Get the list of hosts
  fetch('http://localhost:8080/api/get/hosts')
    .then((response) => response.json())
    .then((data) => {
      setHostList(data);
    });
  }, [])

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
      <Container sx={{marginTop: 8, marginLeft: 3}}>
        <Card>
          {/* Navigator Tab Headers */}
          {value == 0 ?
              <CardHeader sx={{ fontSize: 54 }} title="Scanner" subheader="Create a New Scan" avatar={<RadarIcon />} />
          : null}
          {value == 1 ?
              <CardHeader sx={{ fontSize: 54 }} title="Modules" subheader="Sirius Scanning Module Library" avatar={<RadarIcon />} />
          : null}
          {value == 2 ?
              <CardHeader sx={{ fontSize: 54 }} title="Repositories" subheader="Module Repositories" avatar={<RadarIcon />} />
          : null}
          <CardContent>
              <ScanControlTabs value={value} handleChange={handleChange} />
          </CardContent>

          {/* Navigator Tab Contents */}
          {value == 0 ? 
              <Scanner hostList={hostList} />
          : null}
      </Card>
    </Container>
  );
}

function ScanControlTabs({value, handleChange}) {
  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Scanner" {...a11yProps(0)} />
          <Tab label="Modules" {...a11yProps(1)} />
          <Tab label="Repositories" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
      </TabPanel>
      <TabPanel value={value} index={1}>
        Not yet implemented
      </TabPanel>
      <TabPanel value={value} index={2}>
        Not yet implemented
      </TabPanel>
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
  


