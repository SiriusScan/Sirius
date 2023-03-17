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

export type ScanRequest = {
    scanID: string;
    command: string;
    targets: string[];
    ScanReport: ScanReport;
};
export type ScanReport = {
    scanID: string;
    scanType: string;
    scanStatus: string;
    scanProgress: number;
    CompletedHosts: string[];
    ScanResults: SVDBHost[];
};
export type SVDBHost = {
    hostname: string;
    status: string;
    ip: string;
    os: string;
    osVersion: string;
};
