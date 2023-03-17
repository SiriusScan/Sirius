import React from 'react';

export const SeverityBadge = (severity: any) => {
    // Set the color of the badge based on the severity
    let badgeColor = '';
    switch (severity.severity) {
        case 'CRITICAL':
            badgeColor = 'black';
            break;
        case 'HIGH':
            badgeColor = 'red';
            break;
        case 'MEDIUM':
            badgeColor = 'orange';
            break;
        case 'LOW':
            badgeColor = 'yellow';
            break;
        default:
            badgeColor = 'grey';
            break;
    }

    return (
        <div>
            <div
                style={{
                    backgroundColor: badgeColor,
                    width: '30px',
                    height: '20px',
                    borderRadius: '3px',
                    color: 'white',
                    textAlign: 'center',
                }}
            >
                {severity.severity ? severity.severity.slice(0, 1) : 'I'}
            </div>
        </div>
    );
};