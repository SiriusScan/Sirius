import { useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Item from '@mui/material/Grid';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindows } from '@fortawesome/free-brands-svg-icons';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { solid, regular, brands, icon } from '@fortawesome/fontawesome-svg-core/import.macro'

import { Progress } from "rsuite";
import "rsuite/dist/rsuite.min.css";

export const ReturnButton = () => {

    return (
        <Box sx={{
            width: 90,
            height: 90,
            minWidth: 40,
            minHeight: 40,
            display: 'flex',
            backgroundColor: 'black',
            '&:hover': {
                backgroundColor: 'black',
                opacity: [0.9, 0.8, 0.7],
            },
            cursor: 'pointer'
        }}>
            <ArrowBackIcon sx={{
                color: 'white',
                margin: 'auto',
                fontSize: 60,
            }} />
        </Box>
    );
};

export const HostFindingsDashboard = () => {

    return (
        <Grid sx={{marginLeft: 5}} spacing={1} container item xs={12}>
            <Grid item xs={3}>
                <Box sx={{
                    width: 150,
                    borderBottom: '.2rem solid #bcd5ff',  
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: "center",
                    color: '#fff',                  
                    height: 90,
                    minWidth: 40,
                    minHeight: 40,
                    display: 'flex',
                    backgroundColor: 'black',
                    '&:hover': {
                        backgroundColor: 'black',
                        opacity: [0.9, 0.8, 0.7],
                    },
                    cursor: 'pointer'
                }}>
                    <Typography sx={{fontSize: 10, paddingTop: '15px'}} variant="button" display="block">
                        Critical
                    </Typography>
                    <Typography sx={{fontSize: 42, marginTop: '-15px'}} variant="button" display="block" gutterBottom>
                        5
                    </Typography>
                </Box>
            </Grid>
            <Grid item xs={3}>
                <Box sx={{
                    width: 150,
                    borderBottom: '.2rem solid #bcd5ff',  
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: "center",
                    color: '#fff',                  
                    height: 90,
                    minWidth: 40,
                    minHeight: 40,
                    display: 'flex',
                    backgroundColor: '#e91010',
                    '&:hover': {
                        backgroundColor: '#e91010',
                        opacity: [0.9, 0.8, 0.7],
                    },
                    cursor: 'pointer'
                }}>
                    <Typography sx={{fontSize: 10, paddingTop: '15px'}} variant="button" display="block">
                        High
                    </Typography>
                    <Typography sx={{fontSize: 42, marginTop: '-15px'}} variant="button" display="block" gutterBottom>
                        13
                    </Typography>
                </Box>
            </Grid>
            <Grid item xs={3}>
                <Box sx={{
                    width: 150,
                    borderBottom: '.2rem solid #bcd5ff',  
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: "center",
                    color: '#fff',                  
                    height: 90,
                    minWidth: 40,
                    minHeight: 40,
                    display: 'flex',
                    backgroundColor: '#4aae19',
                    '&:hover': {
                        backgroundColor: '#4aae19',
                        opacity: [0.9, 0.8, 0.7],
                    },
                    cursor: 'pointer'
                }}>
                    <Typography sx={{fontSize: 10, paddingTop: '15px'}} variant="button" display="block">
                        Medium
                    </Typography>
                    <Typography sx={{fontSize: 42, marginTop: '-15px'}} variant="button" display="block" gutterBottom>
                        86
                    </Typography>
                </Box>
            </Grid>
            <Grid item xs={3}>
            <Box sx={{
                    width: 150,
                    borderBottom: '.2rem solid #bcd5ff',  
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: "center",
                    color: '#fff',                  
                    height: 90,
                    minWidth: 40,
                    minHeight: 40,
                    display: 'flex',
                    backgroundColor: '#ff8000',
                    '&:hover': {
                        backgroundColor: '#ff8000',
                        opacity: [0.9, 0.8, 0.7],
                    },
                    cursor: 'pointer'
                }}>
                    <Typography sx={{fontSize: 10, paddingTop: '15px'}} variant="button" display="block">
                        Low
                    </Typography>
                    <Typography sx={{fontSize: 42, marginTop: '-15px'}} variant="button" display="block" gutterBottom>
                        129
                    </Typography>
                </Box>
            </Grid>
        </Grid>
    );
};

export function ReportTitle({title}) {
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
                    {queryParameters.get("ip")}
                    {queryParameters.get("id")}
                </Box>
            </Grid>
            <Grid>
                <Typography sx={{ fontSize: 14, color: 'white' }} component="div">
                    {title}
                </Typography>
                <Divider />
            </Grid>
        </div>
    );
};

export function HostReportOverview({title}) {
    const [queryParameters] = useSearchParams()

    return (
        <div>
            <Grid>
                <Box sx={{
                    minWidth: 40,
                    height: 0,
                    fontSize: 30,
                    paddingTop: 2,
                    paddingLeft: 3,
                    paddingRight: 1,
                    display: 'flex',
                }}>
                    <FontAwesomeIcon size="3x" icon={faWindows} />
                    <Box sx={{
                        paddingLeft: 30,
                    }} />
                        <HostFindingsDashboard />
                </Box>
                <Box sx={{
                    minWidth: 500,
                    minHeight: 40,
                    fontSize: 30,
                    paddingTop: 2,
                    paddingLeft: 15,
                    paddingRight: 1,
                    display: 'flex',
                }}>
                    WIN2k8svrDC1
                </Box>
                <Box sx={{
                    height: 50,
                    minWidth: 40,
                    minHeight: 40,
                    paddingLeft: 15
                }}>
                    Windows Server 2008 R2 Standard 
                </Box>
            </Grid>
            <Divider />
        </div>
    );
};

export function VulnReportOverview({title}) {
    const [queryParameters] = useSearchParams()

    const style = {
        width: 150,
        display: "inline-block",
        marginRight: 20,
        marginLeft: 20,
      };


    return (
        <div>
            <Grid>
                <Box sx={{
                    minWidth: 40,
                    height: 0,
                    fontSize: 30,
                    paddingTop: 2,
                    paddingLeft: 3,
                    paddingRight: 1,
                    display: 'flex',
                }}>
                    <Box style={style}>
                        <Progress.Circle
                        gapDegree={60}
                        strokeLinecap="square"
                        percent={80}
                        status="active"
                        strokeColor="red"
                        trailColor="green"
                        gapPosition="bottom"
                        strokeLinecap="butt"
                        strokeWidth={8}
                        showInfo={false}
                        />
                    </Box>
                    <Box sx={{
                        position: 'absolute',
                        minWidth: 0,
                        fontSize: 30,
                        paddingTop: 6,
                        paddingLeft: 8,
                        paddingRight: 1,
                    }}>
                        HIGH
                    </Box>
                </Box>
 
                <Box sx={{
                    height: 50,
                    minWidth: 40,
                    minHeight: 150,
                    paddingLeft: 30
                }}>
                    <h4>Sirius Threat Level 3</h4>
                    This vulnerability is rated as high severity. It is recommended that you take immediate action to remediate this vulnerability. An attacker with access to this vulnerability could exploit it to gain access to the system or network.
                </Box>
            </Grid>
            <Divider />
        </div>
    );
};