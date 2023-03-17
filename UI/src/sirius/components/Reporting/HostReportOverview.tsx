import { FunctionComponent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Grid, Box, Divider } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindows } from '@fortawesome/free-brands-svg-icons';

import { HostFindingsDashboard } from '../Reporting';
import OperatingSystemIcon from './OperatingSystemIcon';

type HostReportOverviewProps = {
  vulnList: any[],
  hostData: {
    hostname?: string,
    os?: string
  } | undefined
};

export const HostReportOverview: FunctionComponent<HostReportOverviewProps> = ({ vulnList, hostData }) => {
    const [queryParameters] = useSearchParams()
    return (
        <div>
            <Grid>
                <Box sx={{
                    fontSize: 30,
                    color: "white",
                    paddingTop: 1,
                    display: 'flex',
                }}>
                    <HostFindingsDashboard vulnList={vulnList} /> 
                </Box>
            </Grid>
            <Grid>
                <Box sx={{
                    minWidth: 40,
                    height: 0,
                    fontSize: 30,
                    paddingTop: 2,
                    paddingLeft: 3,
                    paddingRight: 3,
                    display: 'flex',
                }}>
                    <OperatingSystemIcon size={"3x"} osName={hostData?.os} />
                    <Box sx={{ paddingLeft: 30 }} />
                </Box>
                <Box sx={{
                    minWidth: 150,
                    minHeight: 40,
                    fontSize: 30,
                    paddingTop: 2,
                    paddingLeft: 17,
                    paddingRight: 1,
                    display: 'flex',
                }}>
                    {hostData?.hostname}
                </Box>
                <Box sx={{
                    height: 50,
                    minWidth: 40,
                    minHeight: 40,
                    paddingLeft: 17
                }}>
                    {hostData?.os}
                </Box>
            </Grid>
            <Divider />
        </div>
    );
};