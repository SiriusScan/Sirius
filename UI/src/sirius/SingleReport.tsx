import * as React from 'react';
import { useSearchParams } from 'react-router-dom';

import { Card, CardContent, CardHeader, Paper } from "@mui/material";
import { Container } from "@mui/material";
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

import { HostReportOverview, VulnReportOverview, ReportTitle, ReturnButton } from "./components/Reporting";
import HostReportTabs from "./components/HostReport";
import VulnReportTabs from "./components/VulnReport";


export default function SingleReport() {
    const [value, setValue] = React.useState(0);
  
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
      setValue(newValue);
    };

    //Get the report type from the URL
    const [queryParameters] = useSearchParams()
    const r = window.location.href.split("?")[0].split("/").pop()
    const reportType = r.charAt(0).toUpperCase() + r.slice(1)

    const reportTitle = reportType + " Report";

    return (
        <Container sx={{marginTop: 8, marginLeft: 3}}>
            <Paper>
                <Box sx={{
                    backgroundColor: "primary.main",
                }}>
                    <Grid container>
                        <Grid xs={1.3}>
                            <ReturnButton />
                        </Grid>
                        <Grid xs={4}>
                            <ReportTitle title={reportTitle} />
                        </Grid>
                    </Grid>
                </Box>
                <Box sx={{
                }}>
                    {reportType == "Host"
                        ? 
                        <div>
                            <HostReportOverview title={reportTitle} />
                            <HostReportTabs value={value} handleChange={handleChange} /> 
                        </div>
                        : null
                    }
                    {reportType == "Vulnerability"
                        ? 
                        <div>
                            <VulnReportOverview title={reportTitle} />
                            <VulnReportTabs value={value} handleChange={handleChange} /> 
                        </div>
                        : null
                    }

                </Box>
            </Paper>
        </Container>
    );
}