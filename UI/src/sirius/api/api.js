// Description: This file contains all the API calls for the UI
// Each call returns a promise that can be used to handle the response
// Example usage: hostReport("192.168.1.1").then((data: any) => console.log(data));


import config from '../../../config.json';

export function getHost(host) {
    return new Promise((resolve) => {
        console.log('Sirius API Call => getHost: ' + host)
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ip: host })
        };
        fetch('http://' + config.server.host + ':' + config.server.port + '/api/get/host', requestOptions)
            .then((response) => response.json())
            .then((data) => {
                resolve(data)
            });
    })
}

export function hostReport(host) {
    return new Promise((resolve) => {
        console.log('Sirius API Call => hostReport: ' + host)
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ip: host })
        };
        fetch('http://' + config.server.host + ':' + config.server.port + '/api/svdb/report/host', requestOptions)
            .then((response) => response.json())
            .then((data) => {
                 resolve(data)
            });
    })
}