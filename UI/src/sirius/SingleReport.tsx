import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Paper, Container, Box, Grid } from '@mui/material';

import {
  VulnReportOverview,
  ReportTitle,
  ReturnButton,
} from './components/Reporting';

import { HostReportOverview } from './components/Reporting/HostReportOverview';
import HostReportTabs from './components/HostReport';
import VulnReportTabs from './components/VulnReport';

import { getHost, hostReport } from './api/api';
import { Vulnerability } from './api/types';

import config from '../../config.json';

export default function SingleReport() {
  const [value, setValue] = useState(0);
  const [vuln, setVuln] = useState<Vulnerability>();
  const [vulnList, setVulnList] = useState([]);
  const [hostData, setHostData] = useState<any>();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const [queryParameters] = useSearchParams();
  const r = window.location.href.split('?')[0].split('/').pop();
  const reportType = r.charAt(0).toUpperCase() + r.slice(1);

  const reportTitle = `${reportType} Report`;

  useEffect(() => {
    if (reportType === 'Host') {
      hostReport(queryParameters.get('ip')).then((data: any) => setVulnList(data));
      getHost(queryParameters.get('ip')).then((data: any) => setHostData(data));
    } else if (reportType === 'Vulnerability') {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ CVE: [queryParameters.get('id')] }),
      };
      fetch(`http://${config.server.host}:${config.server.port}/api/svdb/get/finding`, requestOptions)
        .then((response) => response.json())
        .then((data) => {
          setVuln(data[0]);
        });
    }
  }, [reportType, queryParameters]);

  const renderContent = () => {
    if (reportType === 'Host') {
      return (
        <>
          <HostReportOverview hostData={hostData} vulnList={vulnList} />
          <HostReportTabs value={value} handleChange={handleChange} />
        </>
      );
    } else if (reportType === 'Vulnerability') {
      return (
        <>
          <VulnReportOverview vuln={vuln} />
          <VulnReportTabs value={value} handleChange={handleChange} />
        </>
      );
    }
    return null;
  };

  return (
    <Container>
      <Paper>
        <Box sx={{ backgroundColor: 'primary.main' }}>
          <Grid container>
            <Grid item xs={1.3}>
              <ReturnButton />
            </Grid>
            <Grid item xs={4}>
              <ReportTitle title={reportTitle} />
            </Grid>
          </Grid>
        </Box>
        <Box>{renderContent()}</Box>
      </Paper>
    </Container>
  );
}