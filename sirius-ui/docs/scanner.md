# Scanner Component

The Scanner Component is a modular, real-time scanning interface designed to manage and display scan statuses, host and vulnerability data, and allow the user to initiate new scans. This codebase leverages React, TypeScript, and Tailwind CSS for styling, and it interacts with backend APIs via custom hooks and a service layer.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Components](#components)
  - [Scanner](#scanner)
  - [ScanStatus](#scanstatus)
  - [ScanForm](#scanform)
  - [ScanNavigator](#scannavigator)
  - [Data Tables](#data-tables)
- [Hooks](#hooks)
  - [useScanResults](#usescanresults)
  - [useStartScan](#usestartscan)
- [Services](#services)
- [Contributing](#contributing)
- [License](#license)

## Overview

The Scanner Component provides a dynamic UI that polls a backend for scan results, decodes a Base64 encoded scan status, and updates the UI in real time. It displays a scan monitor interface with:

- **Scan Status:** Live display of scan status and details.
- **Host and Vulnerability Tables:** Two different views for scanned hosts and vulnerabilities.
- **Target Management:** A form to add new scan targets and start scans.

## Features

- **Real-time Data:** Polls the backend every 3 seconds for updated scan information.
- **Modular Design:** Separated into components, hooks, and service layers for maintainability.
- **Optimized Performance:** Utilizes `React.memo`, `useCallback`, and `useMemo` for performance optimizations.
- **Type Safety:** Written in TypeScript with clearly defined interfaces.
- **Accessible UI:** Interactive elements include appropriate ARIA roles and labels.

## Project Structure

```
src/
├── components/
│   ├── scanner/
│   │   ├── Scanner.tsx         // Main scanner component
│   │   ├── ScanForm.tsx        // Form to add targets and start scan
│   │   └── ScanNavigator.tsx   // Navigation for switching views (scan, config, advanced)
│   ├── ScanStatus.tsx          // Displays scan status information
│   ├── VulnerabilityDataTable.tsx  // Displays vulnerability table
│   └── EnvironmentDataTable.tsx      // Displays host table
├── hooks/
│   ├── useScanResults.ts       // Polls backend and decodes scan results
│   └── useStartScan.ts         // Initiates a scan via API mutations
├── services/
│   └── scanService.ts          // Contains functions for starting scans
├── types/
│   └── scanTypes.ts            // Shared TypeScript interfaces and types
└── utils/
└── api.ts                 // API configuration and client (e.g., TRPC/React Query setup)
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or above)
- [Yarn](https://yarnpkg.com/) or npm

### Running the Application

Docker is used to run the application. Ensure Docker is installed and running on your machine.

Dev mode can be achieved by running:

```
bun run dev
```
Navigate to http://localhost:3000 in your browser.

## Components

### Scanner

The main component that brings together the scan status display, target management, and table views. It leverages custom hooks for fetching and decoding scan data and uses services for starting scans.

ScanStatus

Displays the current scan information (status, targets, hosts, vulnerabilities). It expects a decoded scan result object.

ScanForm

A form that lets users:
	•	Add a new scan target.
	•	Start a scan for the current list of targets.

Optimizations:
	•	Wrapped with React.memo to prevent unnecessary re-renders.
	•	Uses useCallback for event handlers.

ScanNavigator

Provides navigation buttons to switch between different views such as “Scan Monitor”, “Configuration”, and “Advanced”. Also wrapped in React.memo.

Data Tables
	•	EnvironmentDataTable: Displays a list of scanned hosts.
	•	VulnerabilityDataTable: Displays vulnerability details.

These tables are updated dynamically based on the scan results.

Hooks

useScanResults
	•	Purpose: Polls the backend for scan data every 3 seconds.
	•	Features:
	•	Decodes Base64 encoded JSON into a ScanResult object.
	•	Provides live updates for hosts and vulnerabilities.
	•	Usage:
	
useStartScan
	•	Purpose: Encapsulates logic for starting a scan.
	•	Features:
	•	Uses API mutations to send scan start messages.
	•	Resets the scan state in the backend.
	•	Usage:
	
	
## Services

scanService.ts

Contains functions for interacting with the scan API. For example, startScanForTarget sends a message to the scanning queue and resets the current scan state.

Contributing

Contributions are welcome! Please open an issue or submit a pull request if you have improvements or bug fixes.
	1.	Fork the repository.
	2.	Create a new branch: git checkout -b feature/your-feature-name
	3.	Commit your changes: git commit -m 'Add some feature'
	4.	Push to the branch: git push origin feature/your-feature-name
	5.	Open a pull request.
	
---

### Explanation

- **Overview and Features:** Provide a high-level understanding of what the component does.
- **Project Structure:** Outlines where key parts of the scanner module reside.
- **Getting Started:** Instructions for cloning, installing, and running the project.
- **Components, Hooks, and Services:** Detailed explanations of the main building blocks.
- **Contributing and License:** Guidelines for contributing and licensing details.

This README should serve as a clear guide for both new developers and collaborators on how the scanner component is organized and how it works. Let me know if you need further adjustments or additional sections!