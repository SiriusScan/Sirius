import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {useNavigate} from 'react-router-dom';

import Box from '@mui/material/Box';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Item from '@mui/material/Grid';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindows, faLinux } from '@fortawesome/free-brands-svg-icons';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { solid, regular, brands, icon } from '@fortawesome/fontawesome-svg-core/import.macro'

import { Progress } from "rsuite";
import "rsuite/dist/rsuite.min.css";

export const ReturnButton = () => {
    const navigate = useNavigate();
	const prevPage = () => {
		navigate(-1);
	}
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
        }}
        onClick={prevPage}
        >
            <ArrowBackIcon sx={{
                color: 'white',
                margin: 'auto',
                fontSize: 60,
            }} />
        </Box>
    );
};

export const HostFindingsDashboard = (vulnList) => {
    //From vulnList, count the number of each severity
    var critical = 0;
    var high = 0;
    var medium = 0;
    var low = 0;
    var informational = 0;
    var unknown = 0;
    var total = 0;

    if (vulnList.vulnList) {
        vulnList.vulnList.map((vuln) => {
            let severity = vuln.CVSSV3.baseSeverity.toLowerCase();
            switch (severity) {
                case "critical":
                    critical++;
                    break;
                case "high":
                    high++;
                    break;
                case "medium":
                    medium++;
                    break;
                case "low":
                    low++;
                    break;
                case "informational":
                    informational++;
                    break;
                default:
                    unknown++;
                    break;
            }
            total++;
        });
    }


    return (
        <Grid sx={{marginLeft: 5}} spacing={1} container item xs={12}>
            <Grid item xs={2}>
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
                        {critical}
                    </Typography>
                </Box>
            </Grid>
            <Grid item xs={2}>
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
                        {high}
                    </Typography>
                </Box>
            </Grid>
            <Grid item xs={2}>
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
                        {medium}
                    </Typography>
                </Box>
            </Grid>
            <Grid item xs={2}>
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
                        {low}
                    </Typography>
                </Box>
            </Grid>
            { unknown > 0 ?
            <Grid item xs={2}>
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
                    backgroundColor: 'gray',
                    '&:hover': {
                        backgroundColor: '#ff8000',
                        opacity: [0.9, 0.8, 0.7],
                    },
                    cursor: 'pointer'
                }}>
                    <Typography sx={{fontSize: 10, paddingTop: '15px'}} variant="button" display="block">
                        INFORMATIONAL
                    </Typography>
                    <Typography sx={{fontSize: 42, marginTop: '-15px'}} variant="button" display="block" gutterBottom>
                        {unknown}
                    </Typography>
                </Box>
            </Grid>
            : null }
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

export type Vulnerability = {
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
  };


export function VulnReportOverview(props: Vulnerability) {
    const [queryParameters] = useSearchParams()

    if (props.vuln === undefined) {
        return <div>Loading...</div>;
    }

    // switch case on severity
    // if severity is high, then set color to red
    switch (props.vuln.CVSSV3.baseSeverity) {
        case "CRITICAL":
            var color = {
                primary: "black",
                secondary: "#f7c1ac",
            };
        case "HIGH":
            var color = {
                primary: "red",
                secondary: "#f7c1ac",
            };
            break;
        case "MEDIUM":
            var color = {
                primary: "yellow",
                secondary: "#f7c1ac",
            };
            break;
        case "LOW":
            var color = {
                primary: "green",
                secondary: "#f7c1ac",
            };
            break;
        default:
            var color = {
                primary: "gray",
                secondary: "#f7c1ac",
            };
    }

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
                        strokeColor={color.primary}
                        trailColor={color.secondary}
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
                        {props.vuln.CVSSV3.baseSeverity ? props.vuln.CVSSV3.baseSeverity : "INFO"}
                        
                    </Box>
                </Box>
 
                <Box sx={{
                    height: 50,
                    minWidth: 40,
                    minHeight: 150,
                    paddingLeft: 30
                }}>
                    {props.vuln.CVSSV3.baseSeverity == "CRITICAL" ?
                        <div>
                            <h4>Sirius Threat Level 5</h4>
                            This vulnerability is rated as critical in severity. Immediate action is required to remediate this vulnerability. An attacker with access to this vulnerability could exploit it to actualize critical business risk!
                        </div>
                        : null}
                    {props.vuln.CVSSV3.baseSeverity == "HIGH" ?
                        <div>
                            <h4>Sirius Threat Level 4</h4>
                            This vulnerability is rated as high severity. It is recommended that you take immediate action to remediate this vulnerability. An attacker with access to this vulnerability could exploit it to gain access to the system or network.
                        </div>
                        : null}
                    {props.vuln.CVSSV3.baseSeverity == "MEDIUM" ?
                        <div>
                            <h4>Sirius Threat Level 3</h4>
                            This vulnerability is rated considered medium severity. It is recommended that you take action to remediate this vulnerability as soon as possible. Numerous medium vulnerabilities are often exploited together to gain access to the system or network.
                        </div>                        
                        : null}
                    {props.vuln.CVSSV3.baseSeverity == "LOW" ?
                        <div>
                            <h4>Sirius Threat Level 2</h4>
                            This vulnerability is rated as high severity. It is recommended that you take immediate action to remediate this vulnerability when time permits. Low rated vulnerabilities often indicate that the system or network is not properly configured or maintained and further vulnerabilities may exist.
                        </div>                        
                        : null}
                    {props.vuln.CVSSV3.baseSeverity ?
                        <></>
                        :                         
                        <div>
                            <h4>Sirius Threat Level 1</h4>
                            This vulnerability is listed for informational purposes only. No risk was directly identified by this condition. However, it is recommended that you take action to remediate this vulnerability as unforeseen circumstances could result in a higher risk.
                        </div>   
                    }

                </Box>
            </Grid>
            <Divider />
        </div>
    );
};