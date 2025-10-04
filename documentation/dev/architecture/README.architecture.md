---
title: "SiriusScan Architecture"
description: "Comprehensive architectural documentation for SiriusScan, covering system design, component relationships, data flow, and technical implementation details."
template: "TEMPLATE.architecture"
version: "1.0.0"
last_updated: "2025-01-03"
author: "Development Team"
tags: ["architecture", "system-design", "overview", "technical"]
categories: ["architecture"]
difficulty: "advanced"
prerequisites: ["docker", "microservices", "vulnerability-scanning"]
related_docs:
  - "README.container-testing.md"
  - "README.development.md"
dependencies: []
llm_context: "high"
search_keywords:
  [
    "architecture",
    "system design",
    "microservices",
    "vulnerability scanner",
    "sirius",
  ]
---

# Sirius Scan Architecture Document

## Table of Contents

A. **[Getting Started & Development Workflow](#getting-started--development-workflow)** - A.1. [System Prerequisites](#a1-system-prerequisites) - A.2. [Repository Setup](#a2-repository-setup) - A.3. [Running the Full Stack](#a3-running-the-full-stack) - A.4. [Common Development Tasks](#a4-common-development-tasks) - A.5. [Testing Strategy](#a5-testing-strategy)
B. **[Key Architectural Workflows (End-to-End Examples)](#key-architectural-workflows-end-to-end-examples)** - B.1. [User Initiates a Vulnerability Scan](#b1-user-initiates-a-vulnerability-scan) - B.2. [Agent Interaction & Management](#b2-agent-interaction--management) - B.3. [Terminal Command Execution](#b3-terminal-command-execution)

1.  **[Introduction](#introduction)**
    - 1.1. [Purpose of Sirius Scan](#purpose-of-sirius-scan)
    - 1.2. [High-Level Architecture Overview](#high-level-architecture-overview)
2.  **[Core Infrastructure (Docker Compose)](#core-infrastructure-docker-compose)**
    - 2.1. [`docker-compose.yaml` Overview](#docker-composeyaml-overview)
    - 2.2. [Service Orchestration](#service-orchestration)
      - 2.2.1. [`sirius-rabbitmq` (Message Broker)](#sirius-rabbitmq-message-broker)
      - 2.2.2. [`sirius-postgres` (Relational Database)](#sirius-postgres-relational-database)
      - 2.2.3. [`sirius-valkey` (Key-Value Store)](#sirius-valkey-key-value-store)
      - 2.2.4. [Networking](#networking)
3.  **[Application Services](#application-services)**

    - 3.1. [`sirius-ui` (User Interface & BFF)](#sirius-ui-user-interface--bff)
      - 3.1.1. [Overview & Purpose](#ui-overview--purpose)
      - 3.1.2. [Technology Stack](#ui-technology-stack)
      - 3.1.3. [Docker Configuration (`sirius-ui/Dockerfile`)](#ui-docker-configuration)
      - 3.1.4. [UI Theming (`globals.css`)](#ui-theming)
      - 3.1.5. [Extensibility (Marketplace Concept)](#ui-extensibility)
      - 3.1.6. [Communication](#ui-communication)
      - 3.1.7. [Key Directory Structure](#key-directory-structure)
      - 3.1.8. [Local Development & Debugging](#local-development--debugging)
      - 3.1.9. [Environment Variables](#environment-variables)
    - 3.2. [`sirius-api` (Backend API)](#sirius-api-backend-api)
      - 3.2.1. [Overview & Purpose](#api-overview--purpose)
      - 3.2.2. [Technology Stack](#api-technology-stack)
      - 3.2.3. [Docker Configuration (`sirius-api/Dockerfile`)](#api-docker-configuration)
      - 3.2.4. [Key Functionalities (High-Level)](#api-key-functionalities)
      - 3.2.5. [Communication](#api-communication)
      - 3.2.6. [Key Directory Structure](#key-directory-structure)
      - 3.2.7. [Local Development & Debugging](#local-development--debugging)
      - 3.2.8. [Environment Variables](#environment-variables)
    - 3.3. [`sirius-engine` (Core Processing Engine)](#sirius-engine-core-processing-engine)
      - 3.3.1. [Overview & Purpose](#engine-overview--purpose)
      - 3.3.2. [Technology Stack](#engine-technology-stack)
      - 3.3.3. [Docker Configuration (`sirius-engine/Dockerfile`)](#engine-docker-configuration)
      - 3.3.4. [Modular Design (Loading Sub-Applications)](#engine-modular-design)
      - 3.3.5. [Communication](#engine-communication)
      - 3.3.6. [Key Directory Structure](#key-directory-structure)
      - 3.3.7. [Local Development & Debugging](#local-development--debugging)
      - 3.3.8. [Environment Variables](#environment-variables)
    - 3.4. [`go-api` (Shared Backend SDK)](#go-api-shared-backend-sdk)
      - 3.4.1. [Overview & Purpose](#go-api-overview--purpose)
      - 3.4.2. [Technology Stack](#go-api-technology-stack)
      - 3.4.3. [Key Functionalities](#go-api-key-functionalities)
      - 3.4.4. [Usage & Integration](#go-api-usage--integration)
      - 3.4.5. [Development & Testing of `go-api`](#go-api-development--testing)

4.  **[Sub-Modules & Agents](#sub-modules--agents)**
    - 4.1. [`app-scanner`](#app-scanner)
      - 4.1.1. [Purpose and Functionality](#app-scanner-purpose)
      - 4.1.2. [NSE (Nmap Script Engine) Management](#app-scanner-nse-management)
    - 4.2. [`app-terminal`](#app-terminal)
      - 4.2.1. [Purpose and Functionality](#app-terminal-purpose)
    - 4.3. [`app-agent`](#app-agent)
      - 4.3.1. [Purpose and Functionality](#app-agent-purpose)
      - 4.3.2. [gRPC Communication with `sirius-engine`](#app-agent-grpc)
5.  **[Data Persistence & Storage](#data-persistence--storage)**
    - 5.1. [PostgreSQL (`sirius-postgres`)](#postgresql-sirius-postgres)
      - 5.1.1. [Role and Data Stored](#postgres-role)
      - 5.1.2. [Schema Overview (Conceptual)](#postgres-schema)
    - 5.2. [Valkey (`sirius-valkey`)](#valkey-sirius-valkey)
      - 5.2.1. [Role and Data Stored](#valkey-role)
6.  **[Inter-Service Communication](#inter-service-communication)**
    - 6.1. [RabbitMQ (Asynchronous Messaging)](#rabbitmq-communication)
    - 6.2. [tRPC (UI Frontend to Next.js Backend)](#trpc-communication)
    - 6.3. [RESTful APIs (`sirius-api`)](#rest-communication)
    - 6.4. [gRPC (Engine to Agents)](#grpc-communication)
7.  **[Development & Deployment](#development--deployment)**
    - 7.1. [Dockerized Environment](#dockerized-environment)
    - 7.2. [Hot Reloading (`air`)](#hot-reloading)
    - 7.3. [Build Processes (Dockerfiles)](#build-processes)
8.  **[Conclusion](#conclusion)**
    - 8.1. [Summary of Architecture](#summary-of-architecture)
    - 8.2. [Future Directions](#future-directions)

## A. Getting Started & Development Workflow

### A.1. System Prerequisites

To contribute to and run Sirius Scan, you will need the following software installed on your system:

- **Docker and Docker Compose**: Essential for running the containerized services. Ensure Docker Desktop (or equivalent for your OS) is installed and running.
- **Git**: For cloning the repository and managing versions.
- **Node.js and npm/yarn/bun**: Required for `sirius-ui` development (Next.js, TypeScript). Bun is used in the Dockerfile, so having it locally can be beneficial for consistency.
- **Go (Golang)**: Required for `sirius-api` and `sirius-engine` development.
- **A code editor**: Such as VS Code, GoLand, WebStorm, etc.
- **Basic command-line tools**: `curl`, `wget`, etc., for various scripts and setups.

It's recommended to have reasonably up-to-date versions of these tools.

### A.2. Repository Setup

1.  **Clone the Main Repository**: Start by cloning the main `Sirius` repository:

    ```bash
    git clone https://github.com/SiriusScan/Sirius.git
    cd Sirius
    ```

2.  **Sub-Module Management**:
    Sirius Scan utilizes several sub-modules (e.g., `app-scanner`, `app-terminal`, `go-api`, `app-agent`) that are developed in separate repositories. The `sirius-engine` Dockerfile clones some of these repositories (`app-scanner`, `app-terminal`, `go-api`) directly during its build process. This ensures that the engine has the necessary code for these integrated applications.

    For **local development** of these sub-modules, the `docker-compose.yaml` file includes commented-out volume mounts. For example:

    ```yaml
    # In docker-compose.yaml, under sirius-engine service:
    volumes:
      - ./sirius-engine:/engine
      - ../minor-projects/app-agent:/app-agent
      # - ../minor-projects/go-api:/go-api # Local Development
      # - ../minor-projects/app-scanner:/app-scanner # Local Development
      # - ../minor-projects/app-terminal:/app-terminal # Local Development
    ```

    To develop a sub-module locally (e.g., `app-scanner`):

    - Clone the `app-scanner` repository into a directory relative to the main `Sirius` project, for instance, at the same level as `Sirius` in a `minor-projects` directory: `../minor-projects/app-scanner`.
    - Uncomment the corresponding volume mount in `docker-compose.yaml`.
    - This will mount your local `app-scanner` code into the `sirius-engine` container, overriding the version cloned by the Dockerfile. Changes you make locally will be reflected due to tools like `air` (for Go applications) configured for hot reloading.

3.  **Environment Variables**: Some services might require `.env` files. For example, `sirius-ui` copies a `.env` file in its Dockerfile. Check individual service directories or their respective Dockerfiles for any specific `.env` setup instructions. Often, default or example environment files are provided (e.g., `.env.example`) which can be copied and customized.

### A.3. Running the Full Stack

Once you have the prerequisites installed and the repository set up (including any sub-modules you intend to develop locally):

1.  **Navigate to the Root Directory**: Ensure your terminal is in the root of the `Sirius` project directory (where `docker-compose.yaml` is located).

2.  **Start All Services**: Run the following command to build (if not already built) and start all services defined in `docker-compose.yaml`:

    ```bash
    docker compose up
    ```

    - Add the `-d` flag (`docker compose up -d`) to run containers in detached mode (in the background).
    - If you want to force a rebuild of the images (e.g., after changing a `Dockerfile`), use the `--build` flag: `docker compose up --build`.

3.  **Verify Services**: After the command completes and services are starting up, you can check their status:

    ```bash
    docker compose ps
    ```

    You should see all services (e.g., `sirius-ui`, `sirius-api`, `sirius-engine`, `sirius-postgres`, `sirius-rabbitmq`, `sirius-valkey`) running.

4.  **Accessing Services**:

    - **`sirius-ui`**: Open your web browser and navigate to `http://localhost:3000` (or `http://localhost:3001` for the development port, check `docker-compose.yaml`).
    - **`sirius-rabbitmq` Management**: Accessible at `http://localhost:15672` (default credentials are often guest/guest).
    - Other services like `sirius-api` (port 9001), `sirius-postgres` (port 5432), etc., expose ports as defined in `docker-compose.yaml` for direct interaction if needed (e.g., with a database client or API tool).

5.  **Viewing Logs**:

    - To view logs for all services in real-time (if not detached): `docker compose logs -f`
    - To view logs for a specific service (e.g., `sirius-engine`): `docker compose logs -f sirius-engine`

6.  **Stopping Services**:
    - If running in the foreground, press `Ctrl+C` in the terminal where `docker compose up` is running.
    - If running in detached mode, or from another terminal:
      ```bash
      docker compose down
      ```
    - To stop and remove volumes (useful for a clean restart, **be cautious as this deletes data** in Docker volumes like your database): `docker compose down -v`.

### A.4. Common Development Tasks

This section outlines general workflows for common development tasks. Detailed steps can vary and might require deeper understanding of the specific service's codebase and frameworks (Next.js/React for UI, Go/Fiber for API, Go for Engine).

#### A.4.1. Contributing a new UI Page/Component to `sirius-ui`

1.  **Locate Relevant Directories**:
    - Pages are typically in `sirius-ui/src/pages/`.
    - Reusable components are in `sirius-ui/src/components/`.
    - tRPC procedures (API endpoints for the UI) are in `sirius-ui/src/server/api/routers/`.
2.  **Create New Files**: For a new page, create a new `.tsx` file in the `pages` directory (e.g., `sirius-ui/src/pages/new-feature.tsx`). For a component, create it in an appropriate subdirectory under `components`.
3.  **Develop the Component/Page**: Use React, TypeScript, and Tailwind CSS. Leverage existing components from Shadcn/ui (`sirius-ui/src/components/lib/ui/`) where possible.
4.  **Data Fetching (if needed)**:
    - If data is needed from the backend, define a new tRPC procedure in a relevant router file (e.g., `sirius-ui/src/server/api/routers/yourRouter.ts`).
    - Use `api.yourRouter.yourProcedure.useQuery()` or `.useMutation()` hooks in your frontend component to interact with the tRPC endpoint.
5.  **Styling**: Use Tailwind CSS utility classes directly in your JSX. For global styles or complex base styles, consider `sirius-ui/src/styles/globals.css`.
6.  **Routing**: Next.js uses a file-system based router. A file like `pages/new-feature.tsx` will be accessible at `/new-feature`.
7.  **Testing**: Add relevant unit or integration tests.
8.  **Local Development**: With `docker compose up` running, changes to files in `sirius-ui/` (mounted into the container) should trigger hot reloading, and you can see your changes in the browser at `http://localhost:3000`.

#### A.4.2. Adding a new API endpoint to `sirius-api`

1.  **Understand Fiber Framework**: `sirius-api` uses Fiber. Familiarize yourself with its routing and handler concepts.
2.  **Define Route**: In `sirius-api/main.go` or a dedicated routes file (e.g., inside a `handlers` or `routes` directory if structured that way), add a new route using `app.Get()`, `app.Post()`, etc.

    ```go
    // Example in sirius-api/main.go or a routes setup function
    // import "github.com/gofiber/fiber/v2"
    // import "your-project/sirius-api/handlers"

    // app is a *fiber.App instance
    // app.Get("/api/v1/new-endpoint", handlers.HandleNewEndpoint)
    ```

3.  **Implement Handler Function**: Create the Go function that will handle requests to this endpoint (e.g., `HandleNewEndpoint` in a `handlers` package).

    ```go
    // Example in sirius-api/handlers/new_handler.go
    package handlers

    import "github.com/gofiber/fiber/v2"

    func HandleNewEndpoint(c *fiber.Ctx) error {
        // Your logic here: parse request, interact with database (via go-api package),
        // communicate with sirius-engine via RabbitMQ, etc.
        return c.JSON(fiber.Map{"status": "success", "message": "New endpoint reached"})
    }
    ```

4.  **Database/Service Interaction**: If your endpoint needs to interact with PostgreSQL or Valkey, use the functions and types provided by the shared `go-api` library (cloned into the `sirius-engine` container, but its source code should be available in your `../minor-projects/go-api` if you set up local dev for it, or you might need to ensure `sirius-api` has access to it via Go modules).
5.  **Testing**: Write unit or integration tests for your new endpoint and handler logic.
6.  **Local Development**: The `sirius-api` service uses `air` for hot reloading. With `docker compose up` running and if `sirius-api/` is volume-mounted (as it is by default in `docker-compose.yaml`), changes to Go files should trigger a restart of the API service. You can test your endpoint using tools like `curl` or Postman against `http://localhost:9001/api/v1/new-endpoint`.

#### A.4.3. Modifying or adding a module within `sirius-engine`

Development within `sirius-engine` is more complex due to its role as an orchestrator and its integration of sub-applications like `app-scanner` and `app-terminal`.

1.  **Understand Engine Structure**: The main engine logic is in Go. Sub-applications (`app-scanner`, `app-terminal`) are also typically Go projects cloned into the engine's container during build (or volume-mounted for local dev).
2.  **Local Development Setup**:
    - To modify a sub-application like `app-scanner`, clone its repository locally (e.g., `../minor-projects/app-scanner`).
    - Uncomment the relevant volume mount in `docker-compose.yaml` for `sirius-engine` (e.g., `- ../minor-projects/app-scanner:/app-scanner`).
    - This mounts your local code into the `/app-scanner` directory inside the `sirius-engine` container.
3.  **Making Changes**:
    - **Engine Core Logic**: Modify Go files directly within the `sirius-engine/` directory.
    - **Sub-Application Logic (e.g., `app-scanner`)**: Modify Go files in your local clone (e.g., `../minor-projects/app-scanner/`).
4.  **`start.sh` Script**: The `sirius-engine/Dockerfile` uses `start.sh` as its `ENTRYPOINT`. This script is responsible for starting the main engine and potentially building/running the sub-applications. It might use `air` for hot reloading these sub-apps if they have `.air.toml` configurations.
5.  **Communication**:
    - Modules within the engine might communicate via Go channels, direct function calls, or local IPC if `start.sh` runs them as separate processes.
    - The engine communicates with `sirius-ui`/`sirius-api` via RabbitMQ and with `app-agent` instances via gRPC.
6.  **Testing**: This can be complex. Unit tests for individual Go packages are standard. Integration testing might involve sending messages via RabbitMQ or making gRPC calls to test specific flows.
7.  **Local Development & Hot Reloading**:
    - If `air` is configured for the Go components you are working on (either the main engine or a sub-application like `app-scanner` via its own `air` setup invoked by `start.sh`), changes to mounted Go files should trigger a rebuild/restart of that component within the `sirius-engine` container.
    - Observe logs using `docker compose logs -f sirius-engine` to see restarts and any errors.

### A.5. Testing Strategy

Sirius Scan aims for comprehensive testing, though the specific strategies and depth can vary per module.

- **General Approach**:

  - **Unit Tests**: Each module/service should have unit tests for its core logic, especially for Go and TypeScript code. Standard testing libraries for each language/framework are used (e.g., Go's `testing` package, Jest/Vitest for TypeScript/React).
  - **Integration Tests**: Testing interactions between components within a service (e.g., API endpoint to database logic in `sirius-api`) or between services where feasible (e.g., UI making a call that results in a RabbitMQ message).
  - **End-to-End (E2E) Tests**: For critical user flows, E2E tests can simulate user interactions from the UI through the backend services. (Frameworks like Cypress or Playwright might be considered for UI E2E testing).

- **`sirius-ui`**:

  - Component testing using React Testing Library or similar.
  - tRPC procedure testing.

- **`sirius-api`**:

  - Handler function unit tests.
  - Endpoint integration tests (e.g., using Go's `httptest` package).

- **`sirius-engine`**:

  - Unit tests for Go packages.
  - Testing RabbitMQ message handling and gRPC service interactions can be complex and might involve mock servers or specific test environments.
  - Sub-applications like `app-scanner` and `app-terminal` should have their own testing strategies within their repositories.

- **`app-agent`**:

  - Unit tests for agent logic.
  - Testing gRPC communication with a mock `sirius-engine` server.

- **Existing Documentation**:
  - The document `Sirius/documentation/README.testing.md` provides specific test cases and scenarios, particularly focused on data relationships and expected outcomes for vulnerability scanning. This document should be consulted for understanding expected system behavior and for designing new tests related to core scanning functionalities.

Developers are encouraged to write tests for new features and bug fixes. CI/CD pipelines (if set up) would ideally run these tests automatically.

## B. Key Architectural Workflows (End-to-End Examples)

### B.1. User Initiates a Vulnerability Scan

This workflow describes the sequence of events when a user initiates a vulnerability scan from the `sirius-ui`.

1.  **User Interaction (`sirius-ui`)**:

    - The user navigates to the scan configuration page in the `sirius-ui`.
    - They input scan parameters such as target IP addresses/ranges, scan type (e.g., full scan, specific port scan), Nmap script selection (if applicable), and other options.
    - The user clicks a "Start Scan" button.

2.  **UI Frontend to BFF (`sirius-ui` - tRPC)**:

    - The frontend component makes a tRPC mutation call to its Next.js backend (BFF).
    - The payload includes the scan configuration details.

3.  **BFF Processing (`sirius-ui` - Next.js Backend)**:

    - The tRPC procedure in the Next.js backend receives the scan request.
    - It may perform initial validation or enrichment of the scan parameters.
    - It then constructs a message (e.g., a JSON payload) representing the scan job.

4.  **Task Queuing (`sirius-ui` to `sirius-rabbitmq`)**:

    - The Next.js backend (BFF) publishes this scan job message to a specific queue in `sirius-rabbitmq` (e.g., `scan_jobs_queue`).
    - This decouples the UI/BFF from the `sirius-engine`, allowing the UI to remain responsive even if the engine is busy.

5.  **Scan Processing (`sirius-engine`)**:

    - `sirius-engine` (Go application) is subscribed to the `scan_jobs_queue` in RabbitMQ.
    - It consumes the scan job message.
    - The engine parses the job details and determines the appropriate action.
    - This might involve:
      - Interacting with `sirius-postgres` (via `go-api` library) to retrieve host information or store scan metadata.
      - Orchestrating `app-scanner` (which is part of its container) to perform the actual network scanning using tools like Nmap and RustScan, leveraging the managed NSE scripts.
      - If the scan involves remote agents, it might delegate parts of the scan to specific `app-agent` instances via gRPC (see Workflow B.2).

6.  **Execution (`app-scanner` within `sirius-engine`)**:

    - `app-scanner` executes the scan commands (e.g., Nmap with specified options and scripts).
    - It collects the raw scan output (e.g., Nmap XML output).

7.  **Result Handling & Persistence (`sirius-engine`, `go-api`, `sirius-postgres`, `sirius-valkey`)**:

    - `sirius-engine` (or `app-scanner` itself) parses the raw scan results.
    - It extracts meaningful information: open ports, services, identified vulnerabilities (e.g., by matching script output to CVEs or known issues).
    - This processed data is then persisted into `sirius-postgres` (e.g., updating `hosts`, `ports`, `vulnerabilities`, and their join tables) likely using the `go-api` library functions.
    - Intermediate status or partial results might be cached in `sirius-valkey`.

8.  **Status Updates & Notifications (RabbitMQ)**:

    - During the scan, `sirius-engine` may publish progress updates or status messages to other RabbitMQ queues (e.g., `scan_status_updates_queue`).
    - `sirius-ui` (via its BFF and potentially WebSockets or polling tRPC queries) can subscribe to these updates to display real-time scan progress to the user.

9.  **Scan Completion & Final Results (`sirius-ui`)**:
    - Once the scan is complete and results are persisted, `sirius-engine` might publish a final completion message.
    - The user can then view the detailed scan results and vulnerabilities in the `sirius-ui`, which fetches this data from `sirius-api` (which in turn queries `sirius-postgres`) or directly via tRPC calls that access the database.

### B.2. Agent Interaction & Management

This workflow covers how `app-agent` instances might register (conceptually, as the current `app-agent` is basic) and how the `sirius-engine` executes commands on them.

**Conceptual Agent Registration/Discovery (Future Enhancement)**:
_While the current `app-agent` (from `app-agent/cmd/agent/README.md`) doesn't detail a formal registration process, a production system would typically involve agents announcing their presence or the engine discovering them._

1.  **Agent Startup (`app-agent`)**: An `app-agent` instance starts on a target host. It knows the `sirius-engine`'s gRPC address (`SERVER_ADDRESS`).
2.  **Initial Contact/Heartbeat (`app-agent` to `sirius-engine` - gRPC)**:
    - The agent could make an initial `Register` or `Heartbeat` gRPC call to `sirius-engine`, providing its `AGENT_ID` (e.g., hostname), capabilities (OS, available tools), and IP address.
    - `sirius-engine` records or updates the agent's status and availability, perhaps in `sirius-valkey` or `sirius-postgres`.
3.  **Periodic Pings**: Agents would periodically send `Ping` requests to the engine to maintain active status. The engine would mark agents as offline if pings cease.

**Command Execution via Agent**:

1.  **Trigger for Command**:

    - A user might initiate a command for a specific agent via `sirius-ui` (e.g., through an agent management panel or the terminal, see Workflow B.3).
    - A scan job in `sirius-engine` might require executing a command on a specific agent (e.g., running a local enumeration script).

2.  **Request to Engine**:

    - If from UI, the request flows: `sirius-ui` (frontend) -> tRPC -> `sirius-ui` (BFF) -> RabbitMQ -> `sirius-engine`.
    - The message to `sirius-engine` would specify the target `AGENT_ID` and the command to execute.

3.  **Engine Locates Agent (`sirius-engine`)**:

    - `sirius-engine` looks up the target agent's details (e.g., its gRPC connection status/details, if connections are persistent, or just its known address).

4.  **Command Delegation (`sirius-engine` to `app-agent` - gRPC)**:

    - `sirius-engine` makes an `ExecuteCommand` gRPC call to the specified `app-agent` instance.
    - The gRPC request payload contains the command string (e.g., `"ls -la /tmp"` or `"nmap -sV target.com"`).

5.  **Command Execution on Agent (`app-agent`)**:

    - The `app-agent` receives the `ExecuteCommand` request.
    - It executes the command on the underlying operating system using its shell execution capabilities.
    - **Security Note**: As per `app-agent/cmd/agent/README.md`, the current example agent lacks command validation and sanitization, which is a critical security concern in a production system.

6.  **Result Streaming/Return (`app-agent` to `sirius-engine` - gRPC)**:

    - The `app-agent` captures the standard output (stdout) and standard error (stderr) of the executed command.
    - It sends these results back to `sirius-engine` via the gRPC response. This could be a single response upon command completion or a stream of data if the command produces continuous output.
    - The agent README mentions it "periodically executes 'ls -la' and sends results to the server," implying it can handle periodic/streaming results.

7.  **Engine Processes Results (`sirius-engine`)**:

    - `sirius-engine` receives the command output from the agent.
    - It processes the results as needed:
      - If part of a larger scan, the results are incorporated into the scan findings.
      - If a direct command from UI, the results are formatted.
    - Results might be stored in `sirius-postgres` or cached in `sirius-valkey`.

8.  **Forwarding to User/UI (`sirius-engine` to RabbitMQ to `sirius-ui`)**:
    - `sirius-engine` publishes the command results (or a notification of completion) to a RabbitMQ queue.
    - `sirius-ui` (BFF) consumes this message and relays the information to the user's interface (e.g., displayed in a terminal window or results panel).

### B.3. Terminal Command Execution

This workflow outlines how a command typed into the terminal in `sirius-ui` reaches and is executed by `app-terminal` within the `sirius-engine`.

1.  **User Input (`sirius-ui` - Terminal Component)**:

    - The user types a command into the terminal interface provided by `sirius-ui` (e.g., `XTerm.js` integrated component).
    - The command might be a system-level command or a special internal command (e.g., `use agent <id>`).

2.  **UI Frontend to BFF (`sirius-ui` - tRPC)**:

    - The terminal component captures the command string.
    - It makes a tRPC mutation call (e.g., `executeTerminalCommand`) to its Next.js backend (BFF).
    - The payload includes the command string and potentially the current context (e.g., if a specific agent is targeted via a previous `use agent` command).

3.  **BFF Processing (`sirius-ui` - Next.js Backend)**:

    - The tRPC procedure in the Next.js backend receives the command request.
    - It may perform initial parsing or validation. For example, it might differentiate between internal UI commands (like switching agent context locally in the UI state) and commands to be sent to the backend engine.
    - For commands destined for `app-terminal`, it constructs a message (e.g., a JSON payload) including the command and any relevant context (like target agent ID if the terminal is proxying to an agent, or if it's a command for the engine itself).

4.  **Task Queuing (`sirius-ui` to `sirius-rabbitmq`)**:

    - The Next.js backend (BFF) publishes this terminal command message to a specific queue in `sirius-rabbitmq` (e.g., `terminal_commands_queue`).

5.  **Command Routing & Processing (`sirius-engine`)**:

    - `sirius-engine` (Go application) subscribes to the `terminal_commands_queue`.
    - It consumes the command message.
    - The engine parses the command and context. It determines if the command is for:
      - **`app-terminal` directly**: For general commands to be executed in the engine's environment (potentially within a PowerShell session managed by `app-terminal`).
      - **An `app-agent` via `app-terminal` as a proxy**: If the terminal context is set to an agent, the engine might instruct `app-terminal` to relay this command, or the engine itself might make a gRPC call to the target `app-agent` (similar to Workflow B.2, step 4).
      - **Internal engine commands**: For special commands handled by the engine itself.

6.  **Execution via `app-terminal` (`sirius-engine` -> `app-terminal`)**:

    - If the command is for `app-terminal`, `sirius-engine` passes the command to its integrated `app-terminal` module.
    - `app-terminal` manages command execution environments (e.g., it could maintain PowerShell sessions).
    - It executes the command within the appropriate session/environment.
    - `app-terminal` captures the stdout and stderr of the command.
    - **Note**: The `sirius-engine/Dockerfile` installs PowerShell, and `app-terminal` is the likely consumer of this, providing a PowerShell backend for the terminal feature.

7.  **Result Return (`app-terminal` to `sirius-engine`)**:

    - `app-terminal` returns the command output (stdout, stderr) back to the main `sirius-engine` logic that invoked it.

8.  **Forwarding to User/UI (`sirius-engine` to RabbitMQ to `sirius-ui`)**:

    - `sirius-engine` takes the output received from `app-terminal` (or directly from an `app-agent` if it was a proxied command).
    - It publishes this output to a specific RabbitMQ queue intended for terminal output (e.g., `terminal_output_queue`). The message should correlate with the original command or session.
    - `sirius-ui` (BFF) subscribes to this queue.
    - The BFF receives the output and uses a mechanism (like WebSockets or Server-Sent Events connected to the tRPC subscription) to stream the output back to the specific user's terminal component in the UI.

9.  **Display Output (`sirius-ui` - Terminal Component)**:
    - The terminal component in the UI receives the streamed output and displays it to the user.

## 1. Introduction

### 1.1. Purpose of Sirius Scan

Sirius Scan is an open-source, general-purpose vulnerability scanner designed to leverage community-driven security intelligence. It aims to provide a comprehensive platform for identifying, managing, and remediating security vulnerabilities across an organization's digital assets. The system is built with modularity and extensibility in mind, allowing for continuous enhancement and adaptation to the evolving cybersecurity landscape.

_(Reference: [Sirius Scan GitHub README](https://github.com/SiriusScan/Sirius/blob/main/README.md))_

### 1.2. High-Level Architecture Overview

Sirius Scan employs a microservices architecture, with its various components containerized and orchestrated using Docker Compose. This approach promotes scalability, resilience, and maintainability. The system comprises several key services that work in concert:

- **`sirius-ui`**: A Next.js-based web interface providing the primary user interaction point.
- **`sirius-api`**: A Go-based RESTful API service that handles backend logic and data operations.
- **`sirius-engine`**: A Go-based core processing engine responsible for orchestrating scans, managing agents, and running various specialized sub-applications that provide core functionalities like scanning (`app-scanner`) and terminal access (`app-terminal`). It receives tasks primarily via RabbitMQ from `sirius-ui` or `sirius-api` and coordinates the execution of these tasks using its sub-modules and agents.
- **Data Stores**:
  - `sirius-postgres`: A PostgreSQL database for persistent storage of relational data (e.g., host information, vulnerabilities).
  - `sirius-valkey`: A Valkey (Redis-like) key-value store for caching, session management, and other non-relational data.
- **Messaging**:
  - `sirius-rabbitmq`: A RabbitMQ message broker facilitating asynchronous communication between services, particularly between the UI/API and the Engine.

The following diagram from the main project README illustrates the interconnected services:

| Service         | Description             | Port(s)                         |
| --------------- | ----------------------- | ------------------------------- |
| sirius-ui       | Web interface (Next.js) | 3000 (HTTP), 3001 (Dev)         |
| sirius-api      | Backend API service     | 9001                            |
| sirius-engine   | Scanning engine         | 5174                            |
| sirius-rabbitmq | Message broker          | 5672 (AMQP), 15672 (Management) |
| sirius-postgres | Database                | 5432                            |
| sirius-valkey   | Key-value store         | 6379                            |

_(Source: Adapted from [Sirius/README.md](mdc:Sirius/README.md))_

Communication between the frontend, API, and engine is carefully managed, with tRPC used for efficient data transfer between the UI's frontend and its Next.js backend, REST for the `sirius-api`, and RabbitMQ for asynchronous tasks delegated to the `sirius-engine`. The `sirius-engine` also communicates with deployed agents via gRPC.

## 2. Core Infrastructure (Docker Compose)

Sirius Scan leverages Docker Compose for defining and running its multi-container application environment. This ensures consistency across development, testing, and deployment, and simplifies the management of the various microservices.

### 2.1. `docker-compose.yaml` Overview

The main configuration is found in `Sirius/docker-compose.yaml`. It defines the services, networks, and volumes required for the application to run. The `name: sirius` directive at the top sets a project name for easier management of Docker resources.

```yaml
name: sirius

services:
  # ... service definitions below ...
```

_(Source: `Sirius/docker-compose.yaml`)_

### 2.2. Service Orchestration

The following services form the backbone of the Sirius Scan infrastructure:

#### 2.2.1. `sirius-rabbitmq` (Message Broker)

RabbitMQ serves as the central message bus for asynchronous communication between different services, particularly for decoupling long-running tasks and distributing workloads.

- **Purpose**: Facilitates asynchronous communication, task queuing, and event-driven interactions.
- **Image**: `rabbitmq:3.7.3-management` (Includes the RabbitMQ management plugin).
- **Ports**:
  - `5672:5672` (AMQP protocol for messaging)
  - `15672:15672` (Management UI)
- **Configuration**: Uses a custom `rabbitmq.conf` for tailored settings.
- **Healthcheck**: Ensures the RabbitMQ service is operational.

```yaml
sirius-rabbitmq:
  image: rabbitmq:3.7.3-management
  restart: always
  container_name: sirius-rabbitmq
  hostname: sirius-rabbitmq
  ports:
    - "5672:5672"
    - "15672:15672"
  volumes:
    - ./rabbitmq/rabbitmq.conf:/etc/rabbitmq/rabbitmq.conf:ro
  healthcheck:
    test: ["CMD", "rabbitmqctl", "status"]
    interval: 30s
    timeout: 15s
    retries: 5
```

_(Source: `Sirius/docker-compose.yaml`)_

#### 2.2.2. `sirius-postgres` (Relational Database)

PostgreSQL is used as the primary relational database for storing structured data such as host information, vulnerability details, scan results, and user data.

- **Purpose**: Persistent storage for relational application data.
- **Image**: `postgres:15-alpine`.
- **Environment Variables**: Sets up default user, password, and database name.
- **Ports**: `5432:5432` (Standard PostgreSQL port).
- **Healthcheck**: Verifies the database server is ready to accept connections.

```yaml
sirius-postgres:
  image: postgres:15-alpine
  restart: always
  container_name: sirius-postgres
  hostname: sirius-postgres
  environment:
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
    POSTGRES_DB: sirius
  ports:
    - "5432:5432"
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres"]
    interval: 10s
    timeout: 5s
    retries: 5
```

_(Source: `Sirius/docker-compose.yaml`)_

#### 2.2.3. `sirius-valkey` (Key-Value Store)

Valkey, a fork of Redis, provides a high-performance in-memory key-value store. It's used for caching, session management, storing temporary data, and potentially for managing NSE script manifests as indicated in scanner documentation.

- **Purpose**: In-memory data storage for caching, session data, and other non-relational, fast-access needs.
- **Image**: `valkey/valkey:latest`.
- **Ports**: `6379:6379` (Standard Valkey/Redis port).

```yaml
sirius-valkey:
  image: valkey/valkey:latest
  restart: always
  container_name: sirius-valkey
  hostname: sirius-valkey
  ports:
    - "6379:6379"
```

_(Source: `Sirius/docker-compose.yaml`)_

#### 2.2.4. Networking

Docker Compose sets up a default network for all services defined in the `docker-compose.yaml` file. This allows services to discover and communicate with each other using their service names as hostnames.

- **Default Network**: Unless specified otherwise, all services join a network named `<project_name>_default` (e.g., `sirius_default` since `name: sirius` is at the top of `docker-compose.yaml`).
- **Service Discovery**: Within this default network, services can reach each other using their names. For example, `sirius-api` can connect to `sirius-postgres` using the hostname `sirius-postgres` and port `5432`.
  ```go
  // Example connection string for sirius-api to connect to postgres
  // dsn := "host=sirius-postgres user=postgres password=postgres dbname=sirius port=5432 sslmode=disable"
  ```
- **Port Mapping**: The `ports` directive in `docker-compose.yaml` (e.g., `"3000:3000"` for `sirius-ui`) maps ports from the host machine to the container. The first port is the host port, and the second is the container port. This makes services accessible from the host machine (e.g., `localhost:3000`). Internal communication between containers typically uses the container port and service name.
- **Custom Networks**: While not explicitly used in the current `docker-compose.yaml`, Docker Compose allows for defining custom bridge networks for more complex networking scenarios or to isolate groups of services. This could be a future consideration if needed.
- **Dependencies (`depends_on`)**: The `depends_on` directive can control the startup order of services, but it only waits until the dependency has _started_, not until it's _ready_ to accept connections. For readiness, healthchecks (as used for `sirius-rabbitmq` and `sirius-postgres`) are a more robust solution to ensure a service is fully operational before dependent services try to connect to it.

## 3. Application Services

Beyond the core infrastructure, Sirius Scan is composed of three main application services: `sirius-ui` for the frontend and user interaction, `sirius-api` for backend RESTful services, and `sirius-engine` for core scanning and processing tasks. The `go-api` library serves as a critical shared SDK for the Go-based backend services.

### 3.1. `sirius-ui` (User Interface & BFF)

#### 3.1.1. Overview & Purpose

The `sirius-ui` service provides the web-based graphical user interface (GUI) for Sirius Scan. It allows users to manage scans, view results, configure settings, and interact with all aspects of the vulnerability scanner. It also acts as a Backend-For-Frontend (BFF), handling some UI-specific logic before communicating with other backend services.

As defined in `docker-compose.yaml`:

```yaml
sirius-ui:
  build:
    context: ./sirius-ui/
    dockerfile: Dockerfile
    args:
      NEXT_PUBLIC_CLIENTVAR: "clientvar"
  container_name: sirius-ui
  hostname: sirius-ui
  restart: always
  image: sirius-ui
  working_dir: /app
  ports:
    - "3000:3000"
    - "3001:3001"
  volumes:
    - ./sirius-ui:/app
    - /app/node_modules
```

_(Source: `Sirius/docker-compose.yaml`)_

#### 3.1.2. Technology Stack

`sirius-ui` is built with a modern JavaScript/TypeScript stack:

- **Next.js**: A React framework for server-side rendering (SSR), static site generation (SSG), and client-side applications. Chosen for its robust features and development experience, including routing and API routes (which contribute to its BFF capabilities).
- **TypeScript**: For static typing, improving code quality and maintainability.
- **tRPC**: Enables end-to-end typesafe APIs between the Next.js frontend and its backend (API routes). This simplifies data fetching and ensures type consistency.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development and styling.
- **Shadcn/ui**: A collection of re-usable UI components built with Radix UI and Tailwind CSS, used for building the user interface.
- **npm**: Used for package management and dependency installation, with Node.js as the JavaScript runtime.

#### 3.1.3. Docker Configuration (`sirius-ui/Dockerfile`)

The `sirius-ui` Docker image is built using `node:18-alpine` as the base, using npm for package management and running the Next.js application.

Key steps in the `Sirius/sirius-ui/Dockerfile` include:

```dockerfile
# sirius-ui Dockerfile - Multi-stage build

# Base stage with common dependencies
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache libc6-compat openssl ca-certificates

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build configuration
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Development stage
FROM base AS development
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000
CMD ["/app/start-dev.sh"]
```

_(Source: `Sirius/sirius-ui/Dockerfile`)_

This Dockerfile sets up the environment, installs dependencies using `bun install`, copies the application source, and runs the development server. It also exposes ports `3000` (likely for the application) and `3001` (possibly for a development or auxiliary service).

#### 3.1.4. UI Theming (`globals.css`)

The visual theme of `sirius-ui` is defined in `Sirius/sirius-ui/src/styles/globals.css`. It utilizes Tailwind CSS and defines CSS custom properties (variables) for theming, including support for a dark mode.

Example of theme variables (light mode):

```css
@layer base {
  :root {
    --background: 220, 13%, 100%, 1;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;

    /* ... other variables ... */
  }

  .dark {
    --background: 234, 26%, 15%, 1;
    --foreground: 210 40% 98%;

    /* ... other dark mode variables ... */
  }
}
```

_(Source: `Sirius/sirius-ui/src/styles/globals.css`)_

The file also includes styles for specific components and decorative elements like the `hexgrad` background.

#### 3.1.5. Extensibility (Marketplace Concept)

A key design consideration for choosing Next.js was to facilitate future development of a marketplace-style system. This implies that the UI is structured to allow third-party developers to contribute additional pages, modules, or plugins, enhancing the platform's capabilities over time. While not yet implemented, this architectural foresight influences the UI's design towards modularity.

#### 3.1.6. Communication

- **Frontend to BFF (Next.js Backend)**: Uses tRPC for type-safe API calls from the client-side components to the Next.js API routes.
- **BFF to other services**: The Next.js backend part of `sirius-ui` communicates with `sirius-engine` via RabbitMQ for asynchronous operations and potentially with `sirius-api` for other data needs (though direct REST calls from client components to `sirius-api` are also possible, tRPC typically centralizes data access through the BFF).

#### 3.1.7. Key Directory Structure

The `sirius-ui` service, being a Next.js application, follows a conventional directory structure. Here are some key directories within `Sirius/sirius-ui/`:

- **`src/`**: The primary directory for application source code.
  - **`src/pages/`**: Contains Next.js pages. Each `.tsx` or `.ts` file in this directory (excluding those in `api/`) becomes a route.
    - `src/pages/index.tsx`: The home page.
    - `src/pages/api/`\*\*: API routes for the Next.js backend (BFF).
      - `src/pages/api/trpc/[trpc].ts`: Handles all tRPC requests.
  - **`src/components/`**: Reusable React components.
    - `src/components/lib/ui/`: Shadcn/ui components (often imported as `~/components/lib/ui/...`).
    - Custom components are usually organized into subdirectories based on feature or type (e.g., `agent/`, `scanner/`, `terminal/`).
  - **`src/server/`**: Backend-specific code for the Next.js application.
    - `src/server/api/`:
      - `src/server/api/root.ts`: Defines the root tRPC router, merging other routers.
      - `src/server/api/routers/`: Contains individual tRPC routers (e.g., `terminal.ts`, `agent.ts`).
  - **`src/styles/`**: Styling files.
    - `src/styles/globals.css`: Global styles and Tailwind CSS base configuration, including theme variables.
  - **`src/utils/`**: Utility functions and helpers.
  - **`src/hooks/`**: Custom React hooks.
  - **`src/types/`**: TypeScript type definitions and interfaces.
  - **`src/services/`**: May contain client-side service integrations if not directly handled by tRPC hooks.
- **`public/`**: Static assets that are served directly from the root (e.g., images, favicons).
- **`prisma/`**: Contains Prisma schema (`schema.prisma`) and migration files, used for database interaction by the Next.js backend (though the primary database interaction seems to be driven by `sirius-api`). If `sirius-ui` needs direct DB access for some BFF tasks, Prisma might be used here.
- **`Dockerfile`**: Defines how the `sirius-ui` service is built as a Docker image.
- **`package-lock.json`, `package.json`, `tsconfig.json`**: Project configuration and dependency management files (using npm).
- **`.env` / `.env.example`**: Environment variable definitions.

#### 3.1.8. Local Development & Debugging

Developing and debugging `sirius-ui` typically involves the following:

- **Prerequisites**: Ensure Node.js and npm are installed locally.
- **Running with Docker Compose**:
  - The easiest way is to use `docker compose up`. The `sirius-ui` service definition in `docker-compose.yaml` mounts the `./sirius-ui:/app` directory into the container.
  - The `Dockerfile` for `sirius-ui` uses `CMD ["/app/start-dev.sh"]`, which starts the Next.js development server with hot reloading.
  - Changes made to your local `Sirius/sirius-ui/src/` files will be reflected in the container, and the Next.js dev server will automatically reload the application in your browser (typically `http://localhost:3000`).
- **Browser Developer Tools**:
  - Use your browser's developer tools (e.g., Chrome DevTools, Firefox Developer Tools) extensively for debugging frontend issues: inspecting HTML/CSS, debugging JavaScript (React components, tRPC calls), checking network requests, and viewing console logs.
  - React Developer Tools browser extension is highly recommended for inspecting React component hierarchy, props, and state.
- **tRPC Debugging**:
  - Network tab in browser dev tools can show tRPC requests (usually to `/api/trpc/...`).
  - For server-side tRPC procedure debugging, you can add `console.log` statements in your tRPC router functions (`sirius-ui/src/server/api/routers/*.ts`). These logs will appear in the `sirius-ui` container logs (`docker compose logs -f sirius-ui`).
- **VS Code Debugging (Next.js)**: You can configure VS Code to attach to the Node.js process running inside the Docker container for more advanced debugging of the Next.js backend (BFF) part. This usually involves:
  - Ensuring the Node.js process in the container is started with the `--inspect` flag (might require modifying the `dev` script in `package.json` and `Dockerfile` CMD if not already set up for this).
  - Configuring port forwarding in `docker-compose.yaml` for the inspect port (e.g., `9229`).
  - Setting up a `launch.json` configuration in VS Code to attach to the debugger.
- **Viewing Logs**: Use `docker compose logs -f sirius-ui` to see server-side logs from the Next.js application, including any errors or console output from tRPC procedures or server components.

#### 3.1.9. Environment Variables

`sirius-ui` utilizes environment variables for configuration. These are typically managed via an `.env` file in the `Sirius/sirius-ui/` directory.

- **`.env` File**: The `Sirius/sirius-ui/Dockerfile` copies a `.env` file into the image: `COPY .env ./`. You should create this file if it doesn't exist, possibly by copying from an `.env.example` if provided.
- **Next.js Environment Variables**:
  - Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser (client-side JavaScript).
  - Variables without this prefix are only available on the server-side (Next.js backend/BFF).
- **Key Variables (Examples - actual variables may differ)**:

  - `DATABASE_URL`: If Prisma or another ORM is used directly by the UI's BFF for some tasks (though primary DB interaction is via `sirius-api`).
  - `NEXTAUTH_URL`: For NextAuth.js if used for authentication.
  - `NEXTAUTH_SECRET`: Secret key for NextAuth.js.
  - `RABBITMQ_URL`: URL for connecting to the RabbitMQ service (e.g., `amqp://guest:guest@sirius-rabbitmq:5672/`). Used by the BFF to send messages to `sirius-engine`.
  - `SIRIUS_API_URL`: Base URL for the `sirius-api` service (e.g., `http://sirius-api:9001/api/v1`) if the BFF needs to call it directly.
  - `NEXT_PUBLIC_CLIENTVAR`: An example variable shown in `docker-compose.yaml` build args, exposed to the client.
  - `SKIP_ENV_VALIDATION=1`: As seen in the `Dockerfile`, this is set to bypass environment variable validation, likely from tRPC or a similar library that checks for expected env vars.

- **Loading in Docker**: The `Dockerfile` copies the `.env` file. During local development with `docker compose up`, the volume mount `- ./sirius-ui:/app` ensures that your local `.env` file is used.
- **Build Arguments**: The `docker-compose.yaml` for `sirius-ui` shows an example of passing build arguments:
  ```yaml
  args:
    NEXT_PUBLIC_CLIENTVAR: "clientvar"
  ```
  These can be used to set environment variables at build time.

### 3.2. `sirius-api` (Backend API)

#### 3.2.1. Overview & Purpose

The `sirius-api` service is a backend application written in Go. It exposes a RESTful API that serves as a primary interface for data manipulation and core business logic not directly handled by the UI's BFF or the specialized `sirius-engine`. It interacts with the data stores (PostgreSQL, Valkey) and communicates with other services like `sirius-engine` via RabbitMQ.

As defined in `docker-compose.yaml`:

```yaml
sirius-api:
  build: ./sirius-api/
  container_name: sirius-api
  hostname: sirius-api
  restart: always
  image: sirius-api
  ports:
    - "9001:9001"
  volumes:
    - ./sirius-api:/api
    # - ../minor-projects/go-api:/go-api # Local Development
```

_(Source: `Sirius/docker-compose.yaml`)_

The commented-out volume `../minor-projects/go-api:/go-api` suggests that `go-api` is a shared library used by this service, likely containing common Go code for database interaction, models, etc.

#### 3.2.2. Technology Stack

- **Go (Golang)**: The primary programming language, chosen for its performance and concurrency features.
- **Fiber**: A Go web framework inspired by Express.js, used for building the RESTful API. It's known for its speed and low memory footprint.
- **Go Modules**: For dependency management.
- **Air**: Used for live reloading during development, as indicated by the `Dockerfile`.

#### 3.2.3. Docker Configuration (`sirius-api/Dockerfile`)

The `Sirius/sirius-api/Dockerfile` sets up the Go environment and uses `air` for development, enabling hot reloading of the application upon code changes.

```dockerfile
# sirius-api Dockerfile

FROM golang:latest
WORKDIR /api

COPY .air.toml .air.toml

# Dependencies
RUN apt-get update

WORKDIR /api
#DEV Dependencies
RUN go install github.com/air-verse/air@latest


# Invoke air to run the server after volume mount
CMD ["air", "-c", ".air.toml"]

EXPOSE 9001
```

_(Source: `Sirius/sirius-api/Dockerfile`)_

The Dockerfile copies an `.air.toml` configuration file, installs `air`, and sets the `CMD` to run the API using `air`. Port `9001` is exposed for the API service.

#### 3.2.4. Key Functionalities (High-Level)

Based on the `go-api/docs/documentation.md` (which describes the `github.com/SiriusScan/go-api` package likely used by this service), the `sirius-api` would be responsible for functionalities such as:

- **Host Management**: CRUD operations for hosts, retrieving host details, and statistics.
- **Vulnerability Management**: Adding, retrieving, and checking for vulnerabilities.
- **Database Interaction**: Managing connections and operations with PostgreSQL via GORM (as suggested by `go-api` documentation).
- **Key-Value Store Interaction**: Interfacing with Valkey for caching or other purposes.
- **NVD Integration**: Potentially fetching CVE information from the National Vulnerability Database.

Example from `go-api/docs/documentation.md` showing host management functions:

```go
// GetHost retrieves a host by IP address
func GetHost(ip string) (sirius.Host, error)

// GetAllHosts retrieves all hosts from the database
func GetAllHosts() ([]sirius.Host, error)

// AddHost adds or updates a host in the database
func AddHost(host sirius.Host) error
```

_(Source: `go-api/docs/documentation.md`)_

#### 3.2.5. Communication

- **Client Interaction**: Exposes RESTful endpoints on port `9001` for consumption by `sirius-ui` (either directly or via its BFF) or other potential clients.
- **Internal Communication**: Communicates with `sirius-engine` via RabbitMQ for delegating tasks or sending notifications.
- **Data Stores**: Directly interacts with `sirius-postgres` and `sirius-valkey`.

#### 3.2.6. Key Directory Structure

The `sirius-api` service, being a Go application using the Fiber framework, typically has a structure that might include:

- **`main.go`**: The entry point of the application. Initializes the Fiber app, sets up middleware, defines routes, and starts the server.
- **`handlers/` (or `controllers/`)**: Contains Go files with handler functions for different API routes. Each handler processes incoming requests, interacts with services or databases, and returns responses.
- **`routes/`**: Might contain files that define route groups and associate them with handlers, helping to organize routing logic if `main.go` becomes too crowded.
- **`models/`**: Could contain Go struct definitions representing data entities (e.g., `Host`, `Vulnerability`). However, much of this might be centralized in the shared `go-api` library if it's used extensively.
- **`middleware/`**: For custom Fiber middleware (e.g., for authentication, logging, CORS).
- **`config/`**: For application configuration loading (e.g., reading database credentials, port numbers from environment variables or config files).
- **`Dockerfile`**: Defines how the `sirius-api` Go application is built into a Docker image.
- **`.air.toml`**: Configuration file for `air`, the live-reloading tool used for development. Specifies build commands, run commands, and files to watch.
- **`go.mod` and `go.sum`**: Go module files managing project dependencies.
- **Shared `go-api` Library**: The `docker-compose.yaml` mentions a commented-out volume mount for `../minor-projects/go-api`. This external library likely contains shared database models (GORM structs), database interaction logic (PostgreSQL, Valkey), RabbitMQ client utilities, and other common functionalities used by both `sirius-api` and potentially `sirius-engine`.
  - When developing `sirius-api`, if it relies on `go-api`, ensure this library is accessible in your Go module path or use the volume mount for local development of `go-api` itself.

#### 3.2.7. Local Development & Debugging

Developing and debugging the Go-based `sirius-api` service involves these common practices:

- **Prerequisites**: Ensure Go is installed locally.
- **Running with Docker Compose & Air**:
  - The `sirius-api` service in `docker-compose.yaml` mounts the local `./sirius-api:/api` directory.
  - Its `Dockerfile` sets `air -c .air.toml` as the command. `air` watches for file changes in the mounted directory and automatically recompiles and restarts the Go application.
  - Start services with `docker compose up`. Changes to `.go` files in your local `Sirius/sirius-api/` directory will trigger a reload within the container.
- **Viewing Logs**: Use `docker compose logs -f sirius-api` to see the output from `air` (compilation status, errors) and any logs generated by the Fiber application (e.g., request logs, `fmt.Println` or logger output).
- **Testing Endpoints**: Use tools like `curl`, Postman, or Insomnia to send HTTP requests to your API endpoints (e.g., `http://localhost:9001/your-endpoint`).
- **Go Debugging (Delve)**: For step-through debugging of Go code:

  - **Install Delve**: You might need Delve installed locally or ensure it's available within the Docker container if you intend to debug inside it.
  - **Modify `.air.toml` for Debugging**: You can adjust the `cmd` in `.air.toml` to start your application with Delve listening for a debugger. For example:

    ```toml
    # .air.toml example modification for delve
    [build]
    cmd = "go build -o ./tmp/main ."
    # ... other build settings

    [run]
    # cmd = "./tmp/main" # Original run command
    cmd = "dlv --listen=:2345 --headless=true --api-version=2 --accept-multiclient exec ./tmp/main" # Delve command
    # ... other run settings
    ```

  - **Expose Delve Port**: In `docker-compose.yaml`, expose the Delve port (e.g., `2345:2345`) for the `sirius-api` service.
  - **VS Code/GoLand Debug Configuration**: Configure your IDE (VS Code with Go extension, or GoLand) to attach to the remote Delve debugger running in the Docker container. Create a debug configuration (e.g., `Go Remote` in VS Code's `launch.json`) pointing to `localhost:2345`.
  - Set breakpoints in your Go code and start the debugging session from your IDE.

- **Database Interaction**: If debugging issues related to database queries (using `go-api` library and GORM), GORM has logging capabilities that can be enabled to see the exact SQL queries being executed. This logging would appear in the `sirius-api` container logs.

#### 3.2.8. Environment Variables

The Go-based `sirius-api` service is configured using environment variables. While a dedicated `.env` file isn't explicitly copied in its `Dockerfile` (unlike `sirius-ui`), environment variables can be supplied to Docker containers in several ways:

- **`docker-compose.yaml`**: The most common method for development is to set environment variables directly in the `docker-compose.yaml` file for the `sirius-api` service.
  ```yaml
  # Example in docker-compose.yaml
  sirius-api:
    # ... other settings ...
    environment:
      - API_PORT=9001
      - POSTGRES_HOST=sirius-postgres
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=sirius
      - POSTGRES_PORT=5432
      - VALKEY_HOST=sirius-valkey
      - VALKEY_PORT=6379
      - RABBITMQ_URL=amqp://guest:guest@sirius-rabbitmq:5672/
      # - GO_ENV=development # Or production
  ```
- **Operating System Environment**: Docker containers can inherit environment variables from the shell session where `docker compose up` is executed, though this is less explicit for service-specific configuration.
- **Go Code**: The Go application would typically use the `os` package (e.g., `os.Getenv("API_PORT")`) or a configuration library (like Viper) to read these environment variables at runtime.

- **Key Variables (Examples - derived from typical Go API needs and inter-service communication within Sirius Scan)**:
  - `API_PORT`: Port on which the Fiber API server listens (e.g., `9001`).
  - `POSTGRES_HOST`: Hostname for the PostgreSQL service (e.g., `sirius-postgres`).
  - `POSTGRES_USER`: Username for PostgreSQL.
  - `POSTGRES_PASSWORD`: Password for PostgreSQL.
  - `POSTGRES_DB`: Database name in PostgreSQL (e.g., `sirius`).
  - `POSTGRES_PORT`: Port for PostgreSQL (e.g., `5432`).
  - `VALKEY_HOST`: Hostname for the Valkey service (e.g., `sirius-valkey`).
  - `VALKEY_PORT`: Port for Valkey (e.g., `6379`).
  - `RABBITMQ_URL`: Connection string for RabbitMQ, used for publishing tasks or messages to `sirius-engine`.
  - `GO_ENV` or `GIN_MODE` (if Fiber uses similar conventions to Gin): To set a development or production mode, which might affect logging levels or error handling (e.g., `development`, `production`).

Check the `sirius-api` Go source code (especially `main.go` or any `config` package) to identify the exact environment variables it expects.

### 3.3. `sirius-engine` (Core Processing Engine)

#### 3.3.1. Overview & Purpose

The `sirius-engine` is the central nervous system of Sirius Scan. Written in Go, it is responsible for orchestrating scanning tasks, managing distributed agents (`app-agent`), and running various specialized sub-applications that provide core functionalities like scanning (`app-scanner`) and terminal access (`app-terminal`). It receives tasks primarily via RabbitMQ from `sirius-ui` or `sirius-api` and coordinates the execution of these tasks using its sub-modules and agents.

As defined in `docker-compose.yaml`:

```yaml
sirius-engine:
  build: ./sirius-engine/
  container_name: sirius-engine
  hostname: sirius-engine
  restart: always
  image: sirius-engine
  ports:
    - "5174:5174" # Likely a primary port for the engine itself
    - "50051:50051" # gRPC port for agent communication
  volumes:
    - ./sirius-engine:/engine
    - ../minor-projects/app-agent:/app-agent
    # - ../minor-projects/go-api:/go-api # Local Development
    # - ../minor-projects/app-scanner:/app-scanner # Local Development
    # - ../minor-projects/app-terminal:/app-terminal # Local Development
    # - ../minor-projects/nmap-db:/nmap-db # Local Development
  # depends_on:
  #   - rabbitmq # Dependency is implied for message consumption
```

_(Source: `Sirius/docker-compose.yaml`)_

The volume mounts for `app-agent` (and commented out ones for other `minor-projects`) indicate that these sub-applications are developed as potentially separate projects but are integrated into the engine's runtime environment.

#### 3.3.2. Technology Stack

- **Go (Golang)**: The primary language for its performance, concurrency, and suitability for system-level programming.
- **gRPC**: Used for communication with `app-agent` instances.
- **RabbitMQ Client**: For receiving tasks and publishing results/status.
- **Air**: For live reloading during development, as suggested by the `.air.toml` file and common Go development practices (though `air` itself is installed in the `app-scanner` context within the `sirius-engine` Dockerfile).

#### 3.3.3. Docker Configuration (`sirius-engine/Dockerfile`)

The `Sirius/sirius-engine/Dockerfile` is responsible for setting up a comprehensive environment that not only runs the engine's Go code but also prepares and includes several key tools and sub-applications.

Key aspects of the Dockerfile:

```dockerfile
# sirius-engine Dockerfile

FROM golang:latest
WORKDIR /engine

COPY .air.toml .air.toml # Air configuration for hot-reloading (likely for sub-apps)

RUN apt-get update -y
RUN apt-get upgrade -y
RUN apt-get install -y libpcap-dev libicu-dev # System dependencies

# NMAP Installation
RUN apt-get install -y nmap

# Rust Scan Installation
WORKDIR /tmp
RUN curl https://sh.rustup.rs -sSf | bash -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
RUN cargo install --git https://github.com/RustScan/RustScan.git --branch master

# PowerShell Installation
WORKDIR /opt/microsoft/powershell
RUN ARCH=$(uname -m) && \
    case "$ARCH" in \
    "aarch64") \
    echo "Installing ARM64 version" && \
    wget https://github.com/PowerShell/PowerShell/releases/download/v7.5.0/powershell-7.5.0-linux-arm64.tar.gz && \
    tar -xvf powershell-7.5.0-linux-arm64.tar.gz \
    ;; \
    "x86_64") \
    echo "Installing AMD64 version" && \
    wget https://github.com/PowerShell/PowerShell/releases/download/v7.5.0/powershell-7.5.0-linux-x64.tar.gz && \
    tar -xvf powershell-7.5.0-linux-x64.tar.gz \
    ;; \
    *) \
    echo "Unsupported architecture: $ARCH" && exit 1 \
    ;; \
    esac
RUN chmod +x /opt/microsoft/powershell/pwsh
RUN ln -s /opt/microsoft/powershell/pwsh /usr/bin/pwsh

# Set up NSE directory structure (for Nmap Scripting Engine used by app-scanner)
RUN mkdir -p /opt/sirius/nse && \
    chown -R 1000:1000 /opt/sirius && \
    chmod -R 755 /opt/sirius

# App Repos - Cloning sub-application source code
WORKDIR /
RUN git clone https://github.com/SiriusScan/app-scanner.git
RUN git clone https://github.com/SiriusScan/app-terminal.git
RUN git clone https://github.com/SiriusScan/go-api.git # go-api likely contains shared code/models

WORKDIR /app-scanner # Setting WORKDIR for app-scanner specific setup
#DEV Dependencies for app-scanner (Air)
RUN go install github.com/air-verse/air@latest

# Add startup script and make it the entrypoint
RUN apt install dos2unix
COPY start.sh /
RUN dos2unix /start.sh
RUN chmod +x /start.sh

ENTRYPOINT ["/start.sh"]
```

_(Source: `Sirius/sirius-engine/Dockerfile`)_

**Key takeaways from the Dockerfile:**

- **Tooling**: Installs essential scanning tools (Nmap, RustScan) and PowerShell, making them available within the engine's container environment, likely for use by sub-applications.
- **Sub-Module Integration**: It directly clones the repositories for `app-scanner`, `app-terminal`, and `go-api`. This means the source code for these modules is present within the `sirius-engine` container.
- **`start.sh` Script**: This is the crucial `ENTRYPOINT`. The `start.sh` script (not provided but its actions can be inferred) is responsible for:
  - Initializing the main `sirius-engine` Go application.
  - Potentially building and running the cloned sub-applications (`app-scanner`, `app-terminal`). It might use `air` for hot reloading these sub-apps if they are Go-based and have an `.air.toml` configurations.
  - Managing the lifecycle of these internal applications.

#### 3.3.4. Modular Design (Loading Sub-Applications)

The `sirius-engine` achieves its modularity by incorporating other specialized applications (`app-scanner`, `app-terminal`) directly into its operational environment. As indicated by the `Dockerfile` and `docker-compose.yaml`:

- **`app-scanner`**: Cloned into the container. Likely provides scanning capabilities, potentially invoked by the main engine process. The setup of `/opt/sirius/nse` suggests it heavily uses Nmap and its scripting engine.
- **`app-terminal`**: Cloned into the container. Provides terminal functionalities.
- **`app-agent`**: While its source might be volume-mounted from `../minor-projects/app-agent` (for local dev), the engine is designed to communicate with `app-agent` instances via gRPC. The engine itself might not run the `app-agent` code directly but orchestrates and communicates with separate agent processes (which could also be running in other containers or on remote hosts).
- **`go-api` (cloned repository)**: This is likely a shared Go library containing common code, models, and utilities used by both `sirius-api` (via its own build) and potentially `sirius-engine` or its sub-modules like `app-scanner`.

The `start.sh` script is the primary mechanism that brings these components to life within the `sirius-engine` container, managing their execution and potentially their inter-process communication if they run as separate processes within the container.

#### 3.3.5. Communication

- **Task Reception**: Listens to RabbitMQ queues for tasks (e.g., scan requests, command execution requests) from `sirius-ui` (via its BFF) and `sirius-api`.
- **Agent Communication**: Communicates with `app-agent` instances via gRPC on port `50051`. This is used for sending commands to agents and receiving results or status updates.
- **Internal Orchestration**: Manages and communicates with `app-scanner` and `app-terminal` (details depend on `start.sh` implementation - could be via IPC, local network calls if they expose ports, or direct function calls if they are run as libraries).
- **Data Stores**: Interacts with `sirius-postgres` and `sirius-valkey` for persisting and retrieving data related to scans, engine state, and agent information, likely using the shared `go-api` library.
- **Result/Status Publishing**: Publishes results, progress, and status updates back to RabbitMQ for consumption by other services.

#### 3.3.6. Key Directory Structure

The `Sirius/sirius-engine/` directory itself contains the core Go code for the engine. However, its operational environment inside the Docker container is more complex due to the integration of other tools and sub-applications as defined by its `Dockerfile`.

- **`Sirius/sirius-engine/` (Local Project Directory)**:

  - Contains the main Go source files for the `sirius-engine` application (e.g., `main.go`, packages for gRPC services, RabbitMQ listeners, task orchestration logic).
  - `Dockerfile`: Defines the build process for the `sirius-engine` image.
  - `.air.toml`: Potentially used if `air` is run directly for the main engine code, though `start.sh` manages the overall startup.
  - `start.sh`: The entrypoint script copied into the Docker image. This script is crucial as it initializes the engine and potentially manages the cloned sub-applications.

- **Inside the Docker Container (as per `sirius-engine/Dockerfile`)**:

  - `/engine/`: The `WORKDIR` where the `Sirius/sirius-engine/` contents are copied.
  - `/app-scanner/`: Cloned Git repository for `app-scanner`.
  - `/app-terminal/`: Cloned Git repository for `app-terminal`.
  - `/go-api/`: Cloned Git repository for the shared `go-api` library.
  - `/opt/sirius/nse/`: Directory structure for Nmap NSE scripts, managed by `app-scanner`.
  - Standard paths for installed tools like Nmap (`/usr/bin/nmap`), RustScan (`/root/.cargo/bin/rustscan`), PowerShell (`/usr/bin/pwsh`).

- **Sub-Module Interaction**: The `sirius-engine` Go code, running from `/engine/`, interacts with:
  - Cloned sub-applications (e.g., by executing their binaries if `start.sh` builds them, or via IPC if `start.sh` runs them as separate processes).
  - Tools like Nmap/PowerShell via system calls.
  - The `go-api` library as a Go module dependency.

Understanding the `sirius-engine/Dockerfile` and the `start.sh` script (even if its content needs to be inferred based on Dockerfile actions) is key to grasping the engine's internal structure and operation.

#### 3.3.7. Local Development & Debugging

Developing `sirius-engine` and its integrated sub-applications (`app-scanner`, `app-terminal`) involves understanding its Dockerized environment and the `start.sh` script.

- **Prerequisites**: Go installed locally.
- **Local Development of Sub-Modules (`app-scanner`, `app-terminal`, `go-api`)**:
  - Clone the respective sub-module repository locally (e.g., into `../minor-projects/app-scanner`).
  - In `Sirius/docker-compose.yaml`, uncomment the volume mount for that sub-module under the `sirius-engine` service definition (e.g., `- ../minor-projects/app-scanner:/app-scanner`). This mounts your local code into the engine's container, overriding the version cloned by the `sirius-engine/Dockerfile`.
  - Changes to your local Go files for that sub-module will be picked up. If the sub-module has an `.air.toml` and `start.sh` is configured to use `air` for it, it should hot-reload within the `sirius-engine` container.
- **Local Development of `sirius-engine` Core**:
  - The `Sirius/sirius-engine/` directory is already mounted by default in `docker-compose.yaml` (`- ./sirius-engine:/engine`).
  - If the main engine Go application (started by `start.sh`) is also configured with `air` (e.g., via the `.air.toml` in `/engine/`), changes to its core Go files will trigger a reload.
- **`start.sh` Script**: This script is central. It controls how the main engine and its sub-modules are built (if necessary, e.g., `go build` for sub-apps) and run inside the container. You might need to inspect or modify `start.sh` to understand or alter the development workflow for components within the engine.
- **Viewing Logs**: Crucial for debugging. Use `docker compose logs -f sirius-engine`. This will show output from the main engine, `air` (for any components it manages), and the sub-applications.
- **Go Debugging (Delve)**: Similar to `sirius-api`, you can use Delve for debugging Go code within `sirius-engine` or its Go-based sub-modules.
  - You'd need to ensure Delve is available in the container and modify `start.sh` (or an `.air.toml` used by `start.sh`) to launch the target Go application with Delve.
  - Expose Delve's port (e.g., `2345`) from the `sirius-engine` container in `docker-compose.yaml`.
  - Attach your IDE's debugger to the exposed port.
- **Interacting with Tools**: The engine has Nmap, RustScan, PowerShell, etc. The `start.sh` might make these available on the PATH within the container, or sub-modules might call them with full paths. You can use `docker exec -it sirius-engine bash` to get a shell inside the running container to manually test these tools or explore the environment.

#### 3.3.8. Environment Variables

The `sirius-engine` (a Go application) is configured using environment variables. These are typically set in the `docker-compose.yaml` file for the `sirius-engine` service or passed to the Docker container at runtime.

- **Setting via `docker-compose.yaml`**: This is the most common method for development.

  ```yaml
  # Example in docker-compose.yaml for sirius-engine
  services:
    sirius-engine:
      # ... other settings ...
      environment:
        - ENGINE_MAIN_PORT=5174 # Example port for engine-specific services
        - GRPC_AGENT_PORT=50051 # Port for gRPC communication with app-agents
        - RABBITMQ_URL=amqp://guest:guest@sirius-rabbitmq:5672/
        - POSTGRES_HOST=sirius-postgres
        - POSTGRES_USER=postgres
        - POSTGRES_PASSWORD=postgres
        - POSTGRES_DB=sirius
        - VALKEY_HOST=sirius-valkey
        # GO_ENV can be used to control behavior (e.g., logging level)
        - GO_ENV=development
        # Variables for sub-modules like app-scanner if they are configured via env vars
        # - SCANNER_DEFAULT_TIMEOUT=3600
  ```

- **Reading in Go**: The engine's Go code (and its sub-modules if they are also Go-based and configured via environment) would use the `os` package (e.g., `os.Getenv("GRPC_AGENT_PORT")`) or a configuration library to read these values.

- **Key Environment Variables (Examples for `sirius-engine`)**:
  - `ENGINE_MAIN_PORT`: A primary port the engine might use for its own services (if any, besides gRPC).
  - `GRPC_AGENT_PORT`: The port on which the engine's gRPC server listens for connections from `app-agent` instances (e.g., `50051`).
  - `RABBITMQ_URL`: Connection string for RabbitMQ, used for consuming tasks and publishing results/status.
  - `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`: For connecting to the PostgreSQL database (likely via the shared `go-api` library).
  - `VALKEY_HOST`: For connecting to the Valkey key-value store.
  - `GO_ENV`: To control execution mode (e.g., `development`, `production`), which might affect logging, debugging features, etc.
  - Sub-module specific variables: If sub-applications like `app-scanner` or `app-terminal` are configured via environment variables, those would also be passed through `sirius-engine`'s environment if `start.sh` propagates them.

Consult the `sirius-engine`'s `main.go`, `start.sh` script, and any configuration packages or sub-module documentation to identify the precise set of environment variables required and how they are consumed.

### 3.4. `go-api` (Shared Backend SDK)

#### 3.4.1. Overview & Purpose

The `go-api` project ([github.com/SiriusScan/go-api](https://github.com/SiriusScan/go-api)) is a crucial shared Go library, or Software Development Kit (SDK), designed to be used by all Go-based backend services within the Sirius Scan ecosystem, primarily `sirius-api` and `sirius-engine` (including its sub-modules like `app-scanner`).

Its main purpose is to provide a centralized and standardized way to interact with shared backend infrastructure components, abstracting away common functionalities and ensuring consistency across the platform. This SDK acts as the single source of truth for critical backend operations, offering several benefits:

- **Code Reusability**: Reduces code duplication significantly by providing common functions for database access, message queuing, caching, etc.
- **Consistency**: Ensures that all backend services interact with infrastructure components (like databases and message queues) in a uniform way, using the same data models and patterns. This minimizes integration errors and simplifies debugging.
- **Maintainability**: Centralizes the logic for core interactions. If a database schema changes or a message queue protocol needs an update, modifications can often be made primarily within `go-api`, with consuming services benefiting from these updates by simply updating their dependency.
- **Developer Productivity**: Speeds up development of new backend features and services by providing ready-to-use, tested components for common backend tasks. Developers can focus on business logic rather than boilerplate infrastructure code.
- **Simplified Onboarding**: New developers working on backend services can quickly understand how to interact with core infrastructure by learning the `go-api` interfaces.

Key areas of abstraction include:

- **Database Abstraction**: Simplifies interactions with PostgreSQL through GORM.
- **Message Queue Utilities**: Provides helpers for robust RabbitMQ communication.
- **Key-Value Store Access**: Offers a standardized interface for Valkey.
- **Core Data Models**: Defines common Go structs representing data entities used across services (e.g., hosts, vulnerabilities).
- **NVD Integration**: Facilitates fetching and using data from the National Vulnerability Database to enrich scan findings.

By centralizing these functions, `go-api` is fundamental to the stability, consistency, and agile development of Sirius Scan's backend capabilities.

#### 3.4.2. Technology Stack

The `go-api` library is built using a selection of robust and widely-used technologies in the Go ecosystem:

- **Go (Golang)**: The primary programming language, chosen for its performance, concurrency features, and strong standard library, making it well-suited for backend SDK development.
- **GORM ([gorm.io](https://gorm.io/))**: A popular Go ORM (Object-Relational Mapper) used for interacting with the PostgreSQL database. GORM simplifies database operations by allowing developers to work with Go structs instead of writing raw SQL queries, increases developer productivity, and provides features like schema migration, transaction management, and association handling.
- **RabbitMQ Client Libraries**: Standard Go libraries for the AMQP 0-9-1 protocol (e.g., `github.com/streadway/amqp` or a similar actively maintained fork) are used to interact with `sirius-rabbitmq`. These libraries provide the foundational tools for publishing messages and subscribing to queues.
- **Valkey Client Libraries**: Go libraries specifically designed for interacting with Valkey (or Redis-compatible stores) are used to connect to and perform operations against the `sirius-valkey` key-value store.
- **Go Modules**: `go-api` is structured as a Go module, which allows it to manage its own dependencies (like GORM and AMQP clients) and to be easily consumed as a versioned dependency by other Go projects (`sirius-api` in particular).

#### 3.4.3. Key Functionalities

Based on its documentation (`go-api/docs/documentation.md`) and observed usage patterns, `go-api` provides the following key functionalities, typically organized into distinct packages:

- **Database Layer (`sirius/postgres`)**:

  - **Connection Management**: Initializes and provides access to the global GORM database instance (`*gorm.DB`). This includes:
    - Handling of database connection parameters (e.g., host, port, user, password, DB name) typically read from environment variables.
    - Automatic connection retry mechanisms with exponential backoff to handle transient network issues.
    - Environment-aware configuration (e.g., different connection settings for Docker vs. local development environments).
    - Automatic schema initialization and migration capabilities using GORM's migration features, ensuring the database schema is up-to-date with model definitions.
    - Efficient connection pooling managed by GORM to optimize database resource usage.
  - **Data Models (`sirius/postgres/models`)**:
    - Defines a comprehensive set of GORM structs representing the core data entities of Sirius Scan. These include `Host`, `Vulnerability`, `Port`, `Service`, `Note`, `CPE (Common Platform Enumeration)`, and various CVE-related structures (e.g., for storing information from NVD).
    - These models define table names, columns, data types, relationships (e.g., one-to-many, many-to-many), and database constraints, serving as the ORM mapping layer.

- **Business Logic Modules (Database Interactors)**:

  - **Host Management (`sirius/host`)**: Provides an API for performing CRUD (Create, Read, Update, Delete) operations on host records stored in the database. For example:
    - `GetHost(ip string) (sirius.Host, error)`: Retrieves a host by its IP address.
    - `GetAllHosts() ([]sirius.Host, error)`: Fetches all host records.
    - `AddHost(host sirius.Host) error`: Adds a new host or updates an existing one.
    - Additional functionalities might include calculating host vulnerability statistics, managing associated ports and services, and computing risk scores or other metrics related to hosts.
  - **Vulnerability Management (`sirius/vulnerability`)**: Offers functions for managing vulnerability data within the system:
    - `GetVulnerability(vid string) (nvd.CveItem, error)`: Retrieves detailed vulnerability information, potentially by CVE ID.
    - `CheckVulnerabilityExists(vid string) bool`: Checks if a specific vulnerability is already known to the system.
    - `AddVulnerability(vuln sirius.Vulnerability) error`: Adds new vulnerability findings to the database.

- **Infrastructure Integration Modules**:

  - **Queue System (`sirius/queue`)**: Encapsulates interactions with RabbitMQ.
    - `MessageProcessor func(msg string)`: Defines a type for callback functions that process incoming messages.
    - `Listen(qName string, messageProcessor MessageProcessor)`: Subscribes to a specified RabbitMQ queue and invokes the `messageProcessor` for each received message. This often involves running processors in separate goroutines for concurrent handling.
    - `Send(qName string, message string) error`: Publishes a message to a specified RabbitMQ queue.
    - Handles details like automatic queue declaration (ensuring queues exist before use), connection management to RabbitMQ, and basic error handling/logging for queue operations.
  - **Key-Value Store (`sirius/store`)**: Provides a standardized way to interact with the Valkey cache.
    - `KVStore` interface: Defines a contract for key-value operations, promoting testability and potential future backend swaps.
    - `SetValue(ctx context.Context, key, value string) error`: Stores a value.
    - `GetValue(ctx context.Context, key string) (ValkeyResponse, error)`: Retrieves a value. `ValkeyResponse` likely encapsulates the result and any metadata.
    - `Close() error`: Closes the connection to the Valkey store.
    - The implementation uses a Valkey client to connect to `sirius-valkey`.
  - **NVD Integration (`nvd`)**: Contains logic for interacting with the National Vulnerability Database (NVD) API.
    - This is crucial for fetching up-to-date details about CVEs (Common Vulnerabilities and Exposures), such as severity scores (CVSS), descriptions, and references. This data enriches the vulnerability information identified by local scans.

- **Utility Functions (`utils`)** (if present):
  - This package would typically house common, reusable helper functions that don't fit neatly into the other categories. Examples could include:
    - Configuration loading helpers (e.g., reading specific environment variables with defaults).
    - Custom error handling types or wrappers.
    - Common logging setup or utility functions.
    - Data validation or sanitization routines.

#### 3.4.4. Usage & Integration

The `go-api` SDK is a cornerstone of Sirius Scan's backend architecture, used extensively by `sirius-api` and `sirius-engine`:

- **`sirius-api` (Backend API Service)**:

  - **Integration Method**: Consumes `go-api` as a standard Go module dependency, specified in its `go.mod` file. This allows `sirius-api` to depend on specific, versioned releases of `go-api`, promoting stable builds.
  - **Usage Examples**:
    - When an HTTP request to create a new host arrives at a `sirius-api` endpoint, the handler function would call `host.AddHost(newHostInfo)` from `go-api` to persist the host.
    - Endpoints for retrieving vulnerability details would use functions like `vulnerability.GetVulnerability(cveID)`.
    - It utilizes `go-api` for all its interactions with PostgreSQL (via GORM models and connection management provided by `go-api`), Valkey (via the `store` package), and potentially for publishing messages to RabbitMQ if it needs to delegate long-running tasks or notify `sirius-engine` (e.g., via `queue.Send()`).
  - **Local Development**: The `docker-compose.yaml` for `sirius-api` includes a commented-out volume mount: `- ../minor-projects/go-api:/go-api`. Uncommenting this allows developers to mount a local clone of the `go-api` repository directly into the `sirius-api` container. This is invaluable when making changes to `go-api` and wanting to test them immediately with `sirius-api` without needing to publish a new version of `go-api` first.

- **`sirius-engine` (Core Processing Engine & its Sub-Modules like `app-scanner`)**:
  - **Integration Method**: The `sirius-engine/Dockerfile` explicitly clones the `go-api` repository (e.g., `git clone https://github.com/SiriusScan/go-api.git /go-api`) into its build context. The main engine Go application and its Go-based sub-modules (like `app-scanner`, which is also cloned into the engine's image) then use `go-api` as a local library by adjusting their Go module paths or using `replace` directives in their `go.mod` files to point to this local copy.
    - This approach ensures that `sirius-engine` and its tightly coupled sub-modules are built with a specific, consistent version of `go-api` that is bundled directly within the engine's Docker image.
    - While simpler for the bundled environment of `sirius-engine`, it requires careful coordination if `go-api` undergoes breaking changes, as the `sirius-engine` image would need to be rebuilt to pick up the new `go-api` version.
  - **Usage Examples**:
    - When `sirius-engine` receives a scan task from RabbitMQ (via `queue.Listen()` from `go-api`), it might first retrieve target details using `host.GetHost()`.
    - After `app-scanner` (a sub-module of the engine) completes a scan, it would use `go-api` functions (e.g., `host.AddHost` to update host details, `port.AddPort`, `service.AddService`, `vulnerability.AddVulnerability`) to parse and store the scan results in the PostgreSQL database.
    - The engine might use `store.SetValue()` from `go-api` to cache intermediate scan states or frequently accessed data in Valkey.
    - It relies on `go-api`'s `queue` package for consuming tasks from RabbitMQ and potentially for publishing status updates or results back to other queues.
  - **Local Development**: Similar to `sirius-api`, the `docker-compose.yaml` for `sirius-engine` has a commented-out volume mount for `go-api`. Enabling this mount allows developers to test local changes to `go-api` directly within the `sirius-engine`'s operational environment.

This shared SDK strategy is pivotal. It ensures that all backend Go components operate on the same data models and use consistent, tested methods for accessing shared infrastructure resources, which is critical for the overall system's reliability and maintainability.

#### 3.4.5. Development & Testing of `go-api`

Developing and maintaining `go-api` as a standalone SDK involves its own set of practices to ensure its quality and reliability:

- **Repository Structure**: `go-api` is maintained in its own Git repository ([github.com/SiriusScan/go-api](https://github.com/SiriusScan/go-api)), allowing for independent versioning and development lifecycle.
- **Unit Testing**: Each package and significant function within `go-api` (e.g., database interaction logic, queue sending/receiving, NVD API calls) should be covered by comprehensive unit tests. Go's built-in `testing` package is used for this. Mocks and interfaces are employed to isolate components during testing (e.g., mocking database connections or RabbitMQ interactions).
- **Integration Testing**: Beyond unit tests, `go-api` likely requires integration tests that verify its interaction with actual external services (PostgreSQL, RabbitMQ, Valkey). These tests might be run in CI/CD pipelines against test instances of these services, or locally using Docker Compose to spin up the necessary dependencies.
- **Versioning**: `go-api` should follow semantic versioning (SemVer). New versions are tagged in its repository (e.g., `v1.0.0`, `v1.1.0`). Consuming services like `sirius-api` can then specify the version of `go-api` they depend on in their `go.mod` file.
- **Dependency Management**: `go-api` itself manages its dependencies (like GORM, AMQP clients) using Go Modules. These are specified in its own `go.mod` file.
- **Documentation**: Maintaining clear documentation (like the `go-api/docs/documentation.md`) is essential for developers of consuming services to understand how to use the SDK, its available functions, data models, and any conventions.

Careful testing and versioning of `go-api` are crucial because changes to it can impact multiple backend services. Breaking changes must be managed through major version increments and communicated clearly to the teams working on consuming services.

## 4. Sub-Modules & Agents

### 4.1. `app-scanner`

#### 4.1.1. Purpose and Functionality

The `app-scanner` sub-module, running within the `sirius-engine` container, is the primary component responsible for executing network scans. It leverages well-known scanning tools like Nmap and RustScan to discover hosts, open ports, services, and potential vulnerabilities based on Nmap Scripting Engine (NSE) scripts.

**Key Functionalities**:

- **Port Scanning**: Utilizes tools like Nmap and RustScan for fast and comprehensive port scanning to identify open TCP and UDP ports on target hosts.
- **Service Detection**: Employs Nmap's version detection capabilities (`-sV`) to identify the services running on discovered open ports and their versions.
- **OS Detection**: Uses Nmap's OS detection (`-O`) to attempt to identify the operating system of target hosts.
- **NSE Script Execution**: Manages and executes Nmap NSE scripts for vulnerability detection, further enumeration, or specific checks. This is a core feature for identifying potential issues.
- **Output Parsing**: Parses the XML output from Nmap (and potentially other tools) to extract structured data about hosts, ports, services, and script results.
- **Integration with `sirius-engine`**: Receives scan tasks from the main engine (which itself gets them from RabbitMQ), executes them, and returns structured results to the engine for persistence and further processing.

It is typically a Go application, cloned into the `sirius-engine` container during its build process (or volume-mounted for local development). The `sirius-engine/Dockerfile` installs Nmap and RustScan, making them available for `app-scanner` to use. The `start.sh` script within `sirius-engine` likely manages the execution of `app-scanner`.

#### 4.1.2. NSE (Nmap Script Engine) Management

The Nmap Scripting Engine (NSE) is a powerful Nmap feature allowing users to write and use scripts (in Lua) to automate a wide array of networking tasks. Within Sirius Scan, `app-scanner` leverages NSE for advanced vulnerability detection, deeper service analysis, and more targeted information gathering beyond standard Nmap checks.

The management of NSE scripts is a sophisticated process handled by the `app-scanner/internal/nse` Go package. This system ensures that NSE scripts are consistently managed, versioned, and synchronized across the platform.

**Key Aspects of NSE Management in `app-scanner`**:

- **Centralized Script Storage & Repositories**:

  - The primary directory for NSE scripts within the `sirius-engine` Docker container is `/opt/sirius/nse/`. This path is configured during the `sirius-engine` Docker build.
  - Scripts are organized into repositories (e.g., `sirius-nse` cloned from `https://github.com/SiriusScan/sirius-nse.git`). Each repository can contain multiple Lua scripts and has its own manifest file.

- **Manifest System for Script Definition & Discovery**:

  - **Repository List Manifest (`/opt/sirius/nse/manifest.json`)**: This top-level JSON file lists all external NSE script repositories that `app-scanner` should manage (containing their names and Git URLs).
  - **Repository Manifest (`<repo_name>/manifest.json`)**: Each individual script repository contains its own manifest. This file is the source of truth for scripts within that repository, detailing metadata for each script, such as its name, path within the repository, supported protocols, description, author, and tags (e.g., `"vulners": {"name": "vulners", "path": "scripts/vulners.nse", ...}`).
  - **Global Manifests in Valkey**: To ensure consistency across potentially multiple `sirius-engine` instances or for dynamic updates, `app-scanner` uses Valkey as a central store for global script information:
    - `nse:repo-manifest`: Stores the global list of repositories, taking precedence over the local file-based repository list.
    - `nse:manifest`: Stores a consolidated global manifest of all scripts from all repositories, including their metadata.
  - **Local In-Memory Manifests**: During runtime, `app-scanner` maintains local, in-memory copies of these manifests for efficient access during scan configuration and execution.

- **Synchronization Mechanism**:

  - `app-scanner` implements a robust synchronization system to keep scripts and their manifests up-to-date. The order of precedence is: **Global Valkey Manifests > Local Filesystem Manifests > Built-in Defaults**.
  - The `SyncManager` within the `nse` package handles this synchronization. It clones/pulls script repositories from Git, reads local manifest files, and reconciles them with the global manifests stored in Valkey.
  - This ensures that `app-scanner` always uses the most current and authoritative versions of scripts and their definitions.

- **Script Content Storage in Valkey**:

  - Beyond manifests, the actual Lua code of NSE scripts can also be stored in Valkey under keys like `nse:script:<script_name>`.
  - This allows for dynamic updates to script content without needing to rebuild Docker images or manually distribute script files. When Nmap is invoked, `app-scanner` can provide it with the script content retrieved from Valkey.

- **Usage During Scans**:

  - When a user configures a scan that includes NSE scripts, `sirius-engine` passes this configuration to `app-scanner`.
  - `app-scanner`, leveraging its synchronized script manifests, selects the appropriate NSE scripts.
  - It constructs Nmap command-line arguments to include these scripts (e.g., `--script <script_name_or_category>`) and their arguments.
  - Nmap executes these scripts against the target(s).

- **Processing NSE Results**:

  - The output from NSE scripts (usually embedded in Nmap's XML output) is parsed by `app-scanner`.
  - This output often contains crucial vulnerability information, detailed service enumerations, or specific findings relevant to the script's purpose.
  - `app-scanner` then transforms these findings into a structured format suitable for storage in `sirius-postgres` (via `go-api`) and display in `sirius-ui`.

- **Configuration & Extensibility**:
  - The system is designed for extensibility, allowing new NSE script repositories to be added by updating the `nse:repo-manifest` in Valkey or the local `/opt/sirius/nse/manifest.json`.
  - Users can select specific scripts or categories of scripts for their scans, providing fine-grained control over the scanning process.

This comprehensive NSE management system ensures that Sirius Scan can effectively utilize the power of Nmap's scripting capabilities for in-depth security assessments, with a flexible and synchronized approach to script handling.

### 4.2. [`app-terminal`](#app-terminal)

#### 4.2.1. Purpose and Functionality

The `app-terminal` sub-module, developed as a Go application within the `minor-projects/app-terminal` repository, provides a web-based PowerShell terminal interface accessible through `sirius-ui`. It is designed to enable users to execute commands securely on the system where `sirius-engine` is running, or potentially on remote systems if command execution is proxied through agents in the future.

**Key Functionalities** (as per `app-terminal/README.md`):

- **PowerShell Execution Backend**: Leverages PowerShell Core (`pwsh`) for command execution. PowerShell is installed within the `sirius-engine` Docker container specifically for use by `app-terminal`.
- **Secure Command Handling**: Aims to execute commands in isolated PowerShell sessions, with session cleanup after execution.
- **Message Queue Integration**: Communicates asynchronously with the broader Sirius Scan ecosystem (primarily `sirius-ui` via `sirius-engine`) using RabbitMQ.
  - Receives command execution requests from a RabbitMQ queue.
  - Sends command output (stdout, stderr) and status back via RabbitMQ queues.
- **Command Management**: `internal/terminal/manager.go` is responsible for handling incoming command requests from the queue and managing their lifecycle.
- **PowerShell Interface**: `internal/terminal/powershell.go` provides the abstraction layer for interacting with the PowerShell runtime, executing commands, and capturing output.
- **Output Formatting**: Processes and formats the raw output from PowerShell to be suitable for display in the `sirius-ui` terminal (which uses `xterm.js`).
- **Error Handling**: Implements error handling for PowerShell execution issues, queue communication problems, and session management.

**Integration with `sirius-engine`**:

- `app-terminal` is cloned into the `sirius-engine` Docker container during its build process (from `https://github.com/SiriusScan/app-terminal.git`).
- The `start.sh` script within `sirius-engine` is responsible for launching and managing the `app-terminal` Go application.
- `sirius-engine` acts as a router for terminal commands: when a user enters a command in `sirius-ui`'s terminal, the request (typically via tRPC to the UI's BFF) is put onto a RabbitMQ queue. `sirius-engine` consumes this message and, if it's a command for the local engine environment, forwards it to `app-terminal` for execution.

The `app-terminal` provides a crucial capability for direct interaction with the engine's environment or potentially managed endpoints, supporting tasks like manual enumeration, configuration checks, or diagnostic actions.

### 4.3. [`app-agent`](#app-agent)

#### 4.3.1. Purpose and Functionality

The `app-agent` is a Go application designed to run on remote hosts, acting as a client to the `sirius-engine`'s gRPC server. Its primary purpose is to extend the capabilities of Sirius Scan by allowing `sirius-engine` to delegate tasks, such as command execution or localized scanning, to these distributed agents. This enables Sirius Scan to interact with and assess systems that may not be directly accessible from the central `sirius-engine` instance.

**Key Functionalities** (based on `app-agent/cmd/agent/README.md`):

- **Remote Command Execution**: The core feature is its ability to receive shell command strings from `sirius-engine` via a gRPC call (`ExecuteCommand`) and execute these commands on the host where the agent is running. It then captures the standard output and standard error of the command and sends them back to the engine.
- **Connectivity Testing**: Implements a `Ping` gRPC method that `sirius-engine` can use to check the agent's reachability and operational status.
- **Persistent Connection**: Establishes a gRPC connection to the `sirius-engine` (server address configured via `SERVER_ADDRESS` environment variable, defaulting to `localhost:50051`).
- **Identification**: Identifies itself to the engine using an `AGENT_ID` (configurable via environment variable, defaults to the hostname), allowing the engine to manage and target specific agents.
- **Periodic Updates (Example)**: The example agent demonstrates the capability to perform actions periodically (e.g., running `ls -la` every 10 seconds and sending results), suggesting a model for continuous monitoring or data collection tasks.
- **Structured Logging**: Utilizes `zap` for structured logging, aiding in diagnostics and monitoring of the agent's behavior.
- **Graceful Shutdown**: Designed to handle termination signals for a clean shutdown process.

**Deployment and Development Context**:

- `app-agent` is developed in the `minor-projects/app-agent` repository.
- Unlike `app-scanner` or `app-terminal`, `app-agent` is not typically cloned into the `sirius-engine` Docker image. Instead, it's intended to be built and deployed as a separate binary or container on target machines where remote operations are needed.
- The `docker-compose.yaml` for `sirius-engine` includes a volume mount for `../minor-projects/app-agent:/app-agent`. This is primarily for a development scenario where `sirius-engine` might run an instance of `app-agent` locally for testing gRPC interactions, or if the engine itself needs to act as an agent for some reason, though its primary role is server.

**Security Considerations**: The provided `app-agent` README explicitly states it's a basic example and lacks production-grade security features such as TLS for gRPC, authentication/authorization, command validation, and sandboxing. These would be critical additions for a secure deployment.

#### 4.3.2. gRPC Communication with `sirius-engine`

Communication between `app-agent` instances and `sirius-engine` is facilitated by gRPC, a high-performance, open-source universal RPC framework.

- **Roles**:

  - `sirius-engine`: Acts as the gRPC **server**. It defines and implements the gRPC services (e.g., `AgentService` with methods like `Ping` and `ExecuteCommand`). It listens for incoming gRPC connections from agents, typically on port `50051` (as suggested by agent defaults and engine's Docker Compose port mapping).
  - `app-agent`: Acts as the gRPC **client**. It initiates a connection to the `sirius-engine`'s gRPC server address.

- **Protocol Definition (`.proto` files)**:

  - The gRPC services, methods, and message structures are defined in Protocol Buffer (`.proto`) files. The `app-agent` repository contains `proto/hello/hello.proto` (an example name) which would define services like:

    ```protobuf
    service AgentService {
      rpc Ping (PingRequest) returns (PingResponse);
      rpc ExecuteCommand (CommandRequest) returns (stream CommandResponse); // Example: streaming for output
    }

    message CommandRequest {
      string agent_id = 1;
      string command = 2;
    }

    message CommandResponse {
      string output = 1;
      string error = 2;
      bool completed = 3;
    }
    // ... other message definitions
    ```

  - Both `sirius-engine` and `app-agent` would generate gRPC server/client stubs and data types from these `.proto` files in Go using `protoc` and Go gRPC plugins. This ensures type safety and consistency in communication.

- **Communication Flow (Example: `ExecuteCommand`)**:

  1.  `sirius-engine` decides to execute a command on a specific agent (identified by `AGENT_ID`).
  2.  The engine, using its gRPC client stub for the `AgentService` (or by managing connections to agents), makes an `ExecuteCommand` RPC call to the target `app-agent`. The `CommandRequest` would contain the command string and potentially other parameters.
  3.  The `app-agent` (gRPC client) receives this request via its gRPC server implementation of `ExecuteCommand`.
  4.  The agent executes the command on its host system.
  5.  The agent captures stdout/stderr and streams `CommandResponse` messages back to `sirius-engine`. This streaming is useful for long-running commands or commands that produce continuous output.
  6.  `sirius-engine` receives the stream of responses and processes the output (e.g., stores it, forwards it to the UI via RabbitMQ).

- **Connection Management**: Agents establish a connection to the engine. The engine needs to manage connections from multiple agents if it is to orchestrate a fleet of them. This might involve keeping track of active agents, their capabilities, and their gRPC channel information.

- **Advantages of gRPC**: Chosen for its efficiency (uses HTTP/2 and Protocol Buffers), strong typing, support for streaming, and suitability for microservice communication.

This gRPC interface is fundamental for `sirius-engine` to control and leverage distributed `app-agent` instances for various scanning and operational tasks.

## 5. Data Persistence & Storage

Sirius Scan relies on two primary data stores for persistence and caching: PostgreSQL for structured relational data and Valkey for key-value storage, often used for caching, session management, and managing dynamic configurations like NSE script manifests.

### 5.1. PostgreSQL (`sirius-postgres`)

PostgreSQL serves as the main relational database, storing the core structured data of the application. This includes information about scanned assets, vulnerabilities, scan configurations, and potentially user data.

#### 5.1.1. Role and Data Stored

- **Primary Datastore**: The authoritative source for persistent, relational data.
- **Hosts Information**: Details about discovered and scanned hosts (IP addresses, hostnames, operating systems, MAC addresses, etc.).
- **Ports & Services**: Information about open ports on hosts and the services running on them (port number, protocol, service name, version, state).
- **Vulnerabilities**: Detailed records of identified vulnerabilities (CVE IDs, descriptions, severity, affected hosts/ports, remediation status).
- **Scan Configurations & Results**: Parameters for scans performed and the summarized results associated with them.
- **User and Access Management**: (If implemented) User accounts, roles, and permissions.
- **Audit Trails**: Logs of significant actions performed within the system.

The `go-api` SDK, particularly its GORM models, defines and interacts with this schema.

#### 5.1.2. Schema Overview (Conceptual)

While a full, detailed Entity-Relationship Diagram (ERD) is extensive, the conceptual schema revolves around several key entities and their relationships, managed via GORM models in `go-api`:

- **`Hosts`**: The central entity representing a scanned asset.
  - Attributes: `ID`, `IPAddress`, `Hostname`, `OS`, `MACAddress`, `Status` (e.g., up, down), `CreatedAt`, `UpdatedAt`.
- **`Ports`**: Represents network ports discovered on hosts.
  - Attributes: `ID`, `PortNumber`, `Protocol` (TCP/UDP), `State` (open, closed, filtered).
- **`Services`**: Describes services running on specific ports.
  - Attributes: `ID`, `Name`, `Version`, `Product`, `ExtraInfo`, `Banner`.
- **`Vulnerabilities`**: Stores information about identified vulnerabilities.
  - Attributes: `ID`, `CVEID` (e.g., "CVE-2023-1234"), `Name`/`Title`, `Description`, `Severity` (e.g., Critical, High, Medium, Low, Info), `CVSSScore`, `References` (URLs to advisories).
- **`HostPorts` (Join Table for Hosts ↔ Ports/Services)**:
  - Establishes a many-to-many relationship between `Hosts` and `Ports`.
  - Often, service information is directly linked here or through a specific `HostPortService` record if a single port can host multiple services (less common for basic TCP/UDP, but possible with virtual hosting or more complex protocols).
  - Likely contains `HostID`, `PortID`, and potentially `ServiceID` if services are modeled as distinct entities associated with a host-port pair.
- **`HostVulnerabilities` (Join Table for Hosts ↔ Vulnerabilities)**:
  - Establishes a many-to-many relationship between `Hosts` and `Vulnerabilities`.
  - Attributes: `HostID`, `VulnerabilityID`, `Port` (the specific port on the host where the vulnerability applies, if applicable), `Status` (e.g., new, confirmed, false positive, remediated), `FirstSeen`, `LastSeen`.
- **`CPEs (Common Platform Enumeration)`**: Stores CPE identifiers found on hosts/services, which can be linked to vulnerabilities.
- **`Notes`**: Allows users to add notes or comments to hosts, vulnerabilities, or other entities.
- **`ScanMetadata` / `ScanJobs`**: Tables to store information about scan configurations (targets, options used) and their execution status/history.

The `go-api` library uses GORM to define these models as Go structs and manages their migrations, ensuring the database schema aligns with the application's data structures. The `Sirius/documentation/README.testing.md` document highlights the importance of these many-to-many relationships (Hosts-Ports, Hosts-Vulnerabilities) and provides context on how they are structured and tested.

### 5.2. Valkey (`sirius-valkey`)

Valkey (a fork of Redis) is employed as a high-performance in-memory key-value store. It is primarily used for caching, session management, and storing transient or frequently accessed data that doesn't require the relational structure of PostgreSQL.

#### 5.2.1. Role and Data Stored

- **Caching**: Caching frequently accessed database query results to reduce load on PostgreSQL and improve response times (e.g., host details, vulnerability information that doesn't change often).
- **Session Management**: If `sirius-ui` or `sirius-api` implement user sessions, Valkey is a suitable store for session data.
- **Task/Job Queuing (Metadata/Status)**: While RabbitMQ handles the primary task queuing, Valkey might be used to store metadata about jobs, their current status, or intermediate results for quick lookups before final persistence in PostgreSQL.
- **Rate Limiting**: Storing counters for API rate limiting or other attempt-based security features.
- **Distributed Locks**: If needed for coordinating actions between multiple instances of a service.
- **NSE Script Management (as detailed in `app-scanner/internal/nse/README.md`)**:
  - **Global Repository Manifest (`nse:repo-manifest`)**: Stores a JSON string representing the list of all NSE script repositories (names, Git URLs). This allows dynamic updates to the repositories `app-scanner` should manage.
  - **Global Script Manifest (`nse:manifest`)**: Stores a JSON string representing a consolidated manifest of all scripts from all repositories, including their metadata (name, path, description, tags). This is the primary source of truth for available scripts.
  - **Individual Script Content (`nse:script:<script_name>`)**: Stores the actual Lua code of individual NSE scripts. This enables `app-scanner` to fetch and use the latest script versions without requiring image rebuilds or file deployments, as scripts can be updated directly in Valkey.
    For example, the content of `vulners.nse` would be stored under the key `nse:script:vulners`.
- **Agent Status/Heartbeats**: `sirius-engine` might use Valkey to keep track of connected `app-agent` instances, their last heartbeat times, and current status for quick lookups.

The `go-api` SDK provides an interface and implementation for interacting with Valkey, abstracting the direct client library calls for consuming services.

## 6. Inter-Service Communication

Sirius Scan employs a variety of communication patterns and technologies to enable its microservices to collaborate effectively. These include asynchronous messaging via RabbitMQ, type-safe APIs with tRPC, traditional RESTful APIs, and high-performance RPC with gRPC.

### 6.1. RabbitMQ (Asynchronous Messaging)

RabbitMQ is the backbone for asynchronous communication and task delegation within Sirius Scan. It decouples services, improves resilience (e.g., if a consuming service is temporarily down, messages remain queued), and enables scalable processing of background tasks like vulnerability scans and command executions.

**Key Roles & Usage**:

- **Task Queuing**: Long-running or resource-intensive tasks initiated by users (e.g., via `sirius-ui`) are typically offloaded to `sirius-engine` by publishing messages to specific RabbitMQ queues. This allows the user-facing services (`sirius-ui`, `sirius-api`) to remain responsive.
- **Decoupling Services**: Producers of messages don't need to know the exact location or number of consumers. Consumers process messages at their own pace.
- **Load Balancing**: If multiple instances of a consumer service (e.g., `sirius-engine`) are running, RabbitMQ can distribute messages among them.
- **Event Notifications**: Services can publish events (e.g., scan completed, new vulnerability found) to RabbitMQ, allowing other interested services to subscribe and react accordingly.

**Conceptual Queues and Message Flows** (Payloads are typically JSON):

1.  **Scan Initiation & Management**:

    - **`scan_jobs_queue`** (Producer: `sirius-ui` BFF -> Consumer: `sirius-engine`):
      - Purpose: To submit new vulnerability scan requests to the engine.
      - Example Payload:
        ```json
        {
          "scan_id": "uuid-scan-123",
          "user_id": "user-abc",
          "targets": ["192.168.1.0/24", "testserver.com"],
          "scan_type": "full_scan_aggressive", // or specific profile name
          "nmap_options": {
            "scripts": ["vulners", "http-enum"],
            "timing_template": "T4",
            "service_version": true
          },
          "rustscan_options": {
            "port_range": "1-65535"
          }
        }
        ```
    - **`scan_control_queue`** (Producer: `sirius-ui` BFF -> Consumer: `sirius-engine`):
      - Purpose: To send control commands for ongoing scans (e.g., pause, resume, stop).
      - Example Payload:
        ```json
        {
          "scan_id": "uuid-scan-123",
          "action": "pause" // "resume", "stop"
        }
        ```
    - **`scan_status_updates_queue`** (Producer: `sirius-engine` -> Consumer: `sirius-ui` BFF via WebSocket/SSE relay):
      - Purpose: To provide real-time progress updates for ongoing scans to the UI.
      - Example Payload:
        ```json
        {
          "scan_id": "uuid-scan-123",
          "status": "running", // "pending", "paused", "completed", "error"
          "progress_percentage": 45,
          "current_target": "192.168.1.10",
          "message": "Scanning host 10 of 254..."
        }
        ```
    - **`scan_results_notification_queue`** (Producer: `sirius-engine` -> Consumer: `sirius-ui` BFF and/or `sirius-api`):
      - Purpose: To notify that scan results (or significant partial results) are available for a given scan, often indicating data has been persisted to PostgreSQL.
      - Example Payload:
        ```json
        {
          "scan_id": "uuid-scan-123",
          "status": "completed",
          "result_summary_url": "/api/v1/scans/uuid-scan-123/summary", // Optional
          "message": "Scan completed. Results available."
        }
        ```
        (The UI would then typically fetch detailed results via tRPC/API calls to `sirius-api` or its own BFF which queries the DB).

2.  **Terminal Command Execution**:

    - **`terminal_commands_queue`** (Producer: `sirius-ui` BFF -> Consumer: `sirius-engine`):
      - Purpose: To send commands entered in the UI terminal to the engine for execution by `app-terminal` (or an agent).
      - Example Payload:
        ```json
        {
          "session_id": "uuid-session-xyz",
          "user_id": "user-abc",
          "command_string": "ls -la /tmp",
          "target_context": {
            // Optional, for routing to agent etc.
            "type": "agent",
            "agent_id": "agent-007"
          }
        }
        ```
    - **`terminal_output_queue`** (Producer: `sirius-engine` (from `app-terminal` or agent) -> Consumer: `sirius-ui` BFF via WebSocket/SSE relay):
      - Purpose: To stream command output back to the specific UI terminal session.
      - Example Payload (could be a series of messages for one command):
        ```json
        {
          "session_id": "uuid-session-xyz",
          "data_type": "stdout", // "stderr", "status"
          "payload": "total 4\ndrwxr-xr-x 2 root root 4096 Jan 1 10:00 .\n",
          "is_final_chunk": false
        }
        ```

3.  **Agent Tasking (Conceptual - if not solely gRPC from engine)**:
    - While direct gRPC is primary for engine-to-agent, RabbitMQ _could_ be used by the engine to broadcast tasks to groups of agents or for agents to report asynchronous results if direct gRPC streaming isn't suitable for a very long-running agent task.
    - **`agent_tasks_queue_group_<group_id>`** or **`agent_task_queue_<agent_id>`** (Producer: `sirius-engine` -> Consumer: `app-agent` instances)
    - **`agent_results_queue`** (Producer: `app-agent` instances -> Consumer: `sirius-engine`)

**Implementation Details**:

- **`go-api` SDK**: Go-based services (`sirius-engine`, `sirius-api`, and sub-modules like `app-scanner`, `app-terminal`) utilize the `sirius/queue` package from the `go-api` SDK. This package provides `Send()` and `Listen()` functions, abstracting RabbitMQ connection management, channel handling, queue declaration, and message publishing/consumption logic.
- **Exchanges and Bindings**: While not explicitly detailed in all component READMEs, a typical RabbitMQ setup involves exchanges (e.g., direct, topic, fanout) to route messages from producers to appropriate queues based on routing keys and binding rules. For instance, `scan_jobs_queue` might be bound to a direct exchange where `sirius-ui` publishes messages with a specific routing key.
- **Message Durability & Persistence**: For critical tasks like scan jobs, messages are likely published as persistent, and queues are declared as durable to survive RabbitMQ restarts. Status updates might be non-persistent if losing a few is acceptable.
- **Error Handling & Retries**: Robust consumers implement error handling, potentially using dead-letter exchanges (DLX) and retry mechanisms for messages that fail processing.

RabbitMQ's role is crucial for the scalability and resilience of Sirius Scan's distributed architecture, enabling efficient handling of potentially numerous and long-duration backend operations.

### 6.2. tRPC (UI Frontend to Next.js Backend)

tRPC is utilized within the `sirius-ui` service to facilitate highly efficient and type-safe communication between its React frontend components and its Next.js backend (which acts as a Backend-for-Frontend, or BFF). This approach significantly improves developer experience and reduces runtime errors related to client-server data contracts.

**Key Roles & Benefits**:

- **End-to-End Type Safety**: This is the primary advantage. TypeScript types defined on the server (Next.js API routes) are automatically inferred on the client (React components). This means if a server-side API changes its request parameters or response structure, TypeScript will immediately flag errors in the frontend code during development, preventing mismatches that would otherwise lead to runtime failures.
- **Improved Developer Experience**: Developers get autocompletion for API procedures and their inputs/outputs directly in their frontend code. Refactoring server-side procedures (e.g., renaming, changing parameters) can often be done with IDE support that also updates client-side usages.
- **No Code Generation Needed (for client-server calls)**: Unlike GraphQL or OpenAPI-based approaches that often require a code generation step to create client-side SDKs or type definitions, tRPC achieves type safety through TypeScript inference, simplifying the build process.
- **Simplified Data Fetching**: The tRPC client provides hooks (e.g., `useQuery` for data fetching, `useMutation` for data modification) that integrate seamlessly with React, handling loading states, errors, and caching with minimal boilerplate.

**Implementation in `sirius-ui`**:

- **Defining Procedures (Backend)**:

  - tRPC procedures are defined in the `sirius-ui/src/server/api/routers/` directory. Each file (e.g., `terminal.ts`, `agent.ts`, `scan.ts`) typically exports a `router` defining a set of related procedures.
  - Each procedure specifies its input validation (often using libraries like Zod) and the resolver function that contains the server-side logic.
  - Example conceptual procedure in `sirius-ui/src/server/api/routers/scan.ts`:

    ```typescript
    import { z } from "zod";
    import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
    // import { rabbitMQService } from '~/server/services/rabbitmq'; // Example service

    export const scanRouter = createTRPCRouter({
      startScan: publicProcedure
        .input(
          z.object({
            targets: z.array(z.string()),
            scanProfile: z.string(),
          })
        )
        .mutation(async ({ input, ctx }) => {
          // ctx might contain db access, session info, etc.
          console.log("Received scan request:", input);
          // 1. Validate input further if necessary
          // 2. Construct a message for sirius-engine
          const scanJobMessage = {
            scan_id: `uuid-scan-${Date.now()}`,
            user_id: ctx.session?.user?.id, // Example: if auth is used
            targets: input.targets,
            scan_type: input.scanProfile,
            // ... other parameters
          };
          // 3. Publish to RabbitMQ (example call)
          // await rabbitMQService.publishToQueue('scan_jobs_queue', scanJobMessage);
          // 4. Return a confirmation or initial status
          return {
            message: "Scan job submitted successfully",
            scan_id: scanJobMessage.scan_id,
          };
        }),
      // ... other procedures like getScanStatus, getScanResults etc.
    });
    ```

- **Root Router**: These individual routers are merged into a single `appRouter` in `sirius-ui/src/server/api/root.ts`.
- **API Handler**: An API route, typically `sirius-ui/src/pages/api/trpc/[trpc].ts`, handles all incoming tRPC requests and routes them to the appropriate procedure in the `appRouter`.

- **Consuming Procedures (Frontend)**:

  - React components in `sirius-ui/src/components/` or `sirius-ui/src/pages/` use hooks provided by the tRPC client to call backend procedures.
  - Example usage in a React component:

    ```tsx
    import { api } from "~/utils/api"; // Path to the tRPC client

    function ScanComponent() {
      const startScanMutation = api.scan.startScan.useMutation({
        onSuccess: (data) => {
          console.log("Scan submitted! ID:", data.scan_id);
          // navigate to results page or show notification
        },
        onError: (error) => {
          console.error("Failed to start scan:", error.message);
        },
      });

      const handleStartScan = () => {
        startScanMutation.mutate({
          targets: ["127.0.0.1"],
          scanProfile: "quick_scan",
        });
      };

      return (
        <button
          onClick={handleStartScan}
          disabled={startScanMutation.isLoading}
        >
          {startScanMutation.isLoading ? "Submitting..." : "Start Scan"}
        </button>
      );
    }
    ```

**Role in Orchestration**:

The Next.js backend (BFF) part of `sirius-ui`, powered by these tRPC procedures, often acts as an orchestrator:

- It receives requests from the frontend.
- Performs initial validation and UI-specific logic.
- For tasks requiring asynchronous processing (like starting a scan or executing a terminal command that might take time), it publishes messages to RabbitMQ queues for `sirius-engine` to consume.
- For fetching data that `sirius-api` owns (e.g., detailed host information, historical scan results), the tRPC procedure might make a REST call to `sirius-api` and then transform or relay the data to the frontend.
- It can also directly interact with `sirius-postgres` using Prisma (as suggested by `sirius-ui/prisma/schema.prisma`) for UI-specific data needs that don't fit the `sirius-api` domain, or for caching/aggregating data.

tRPC provides a clean, type-safe, and efficient communication layer that is internal to the `sirius-ui` service, streamlining its frontend-to-BFF interactions.

### 6.3. RESTful APIs (`sirius-api`)

The `sirius-api` service ([`Sirius/sirius-api`](https://github.com/SiriusScan/Sirius/tree/main/sirius-api)) functions as the primary backend API gateway for core data operations and business logic that is not directly handled by the UI's BFF or the specialized `sirius-engine`. It provides a set of RESTful HTTP endpoints for creating, reading, updating, and deleting (CRUD) key data entities like hosts, vulnerabilities, scan results, and potentially user management if centralized here.

**Key Roles & Characteristics**:

- **Centralized Data Access Logic**: Provides a consistent API layer over the primary data stores (`sirius-postgres` and `sirius-valkey`).
- **Business Logic Hub**: Implements business rules and data processing related to the core entities (e.g., aggregating vulnerability data for a host, calculating risk scores, managing scan result lifecycles).
- **Technology Stack**: Built using Go and the [Fiber](https://gofiber.io/) web framework, chosen for its high performance and Express.js-like API, making it relatively easy to define routes and handlers.
- **Database Interaction**: Heavily utilizes the `go-api` SDK (specifically packages like `sirius/host`, `sirius/vulnerability`, `sirius/postgres`) for all interactions with `sirius-postgres` (via GORM) and `sirius/store` for `sirius-valkey`.
- **RESTful Principles**: Adheres to REST principles by:
  - Using standard HTTP methods: `GET` (retrieve), `POST` (create), `PUT` (update/replace), `DELETE` (remove), `PATCH` (partial update).
  - Employing resource-based URLs (e.g., `/api/v1/hosts`, `/api/v1/hosts/{host_id}/vulnerabilities`).
  - Using standard HTTP status codes to indicate outcomes (e.g., `200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`).
  - Typically exchanging data in JSON format.
- **Authentication & Authorization**: This service is a logical place for enforcing authentication (e.g., validating JWT tokens passed in `Authorization` headers) and authorization (checking if the authenticated user has permission to perform the requested action on the resource).
- **API Versioning**: Endpoint paths often include a version (e.g., `/api/v1/`) to allow for future API evolution without breaking existing clients.
- **Port**: Runs on port `9001` by default, as configured in `docker-compose.yaml`.

**Interaction with Other Services**:

- **`sirius-ui`**: The UI (either its BFF or client-side components, depending on design choices) is a primary consumer of `sirius-api`. It makes HTTP requests to `sirius-api` to fetch data for display (e.g., list of hosts, details of a vulnerability) and to submit changes (e.g., adding a note to a host, updating a vulnerability's status).
  - The `sirius-ui`'s BFF (tRPC procedures) might call `sirius-api` endpoints server-side to aggregate data or perform actions before relaying results to the frontend.
- **`sirius-engine`**: While the engine primarily receives tasks via RabbitMQ, it might interact with `sirius-api` for specific needs:
  - To fetch detailed configuration or historical data that it doesn't store itself.
  - To notify `sirius-api` about the completion of certain tasks if `sirius-api` needs to update its own state or trigger further workflows (though this is often also handled by `sirius-api` consuming RabbitMQ messages produced by the engine).
- **Other Potential Clients**: Any future services or third-party tools needing programmatic access to Sirius Scan's core data would likely interact via `sirius-api`.

**Example Conceptual Endpoint (in Fiber/Go)**:

```go
package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/SiriusScan/Sirius/go-api/sirius/host" // Assuming go-api is accessible
	// ... other imports
)

// SetupHostRoutes configures routes related to hosts
func SetupHostRoutes(app *fiber.App) {
	api := app.Group("/api/v1") // API versioning
	hostRoutes := api.Group("/hosts")

	hostRoutes.Get("/", func(c *fiber.Ctx) error {
		// Logic to fetch all hosts using go-api's host.GetAllHosts()
		// Example: hosts, err := host.GetAllHosts( /* db_instance_from_go_api */ )
		// if err != nil { return c.Status(fiber.StatusInternalServerError).JSON(...) }
		// return c.JSON(hosts)
		return c.SendString("GET /api/v1/hosts - List all hosts")
	})

	hostRoutes.Get("/:hostId", func(c *fiber.Ctx) error {
		hostId := c.Params("hostId")
		// Logic to fetch a specific host by ID using go-api's host.GetHost(hostId)
		// Example: h, err := host.GetHost(hostId, /* db_instance */)
		// if err != nil { /* handle error, e.g., 404 if not found */ }
		// return c.JSON(h)
		return c.SendString("GET /api/v1/hosts/" + hostId)
	})

	hostRoutes.Post("/", func(c *fiber.Ctx) error {
		// var newHostPayload struct { /* ... fields ... */ }
		// if err := c.BodyParser(&newHostPayload); err != nil { return c.Status(fiber.StatusBadRequest).JSON(...) }
		// Logic to add a new host using go-api's host.AddHost(...)
		// return c.Status(fiber.StatusCreated).JSON( /* created_host_info */ )
		return c.SendString("POST /api/v1/hosts - Create new host")
	})
	// ... other routes for PUT, DELETE etc.
}

```

This service acts as the canonical source for much of the platform's data, ensuring that access and modification are managed centrally and consistently.

### 6.4. gRPC (Engine to Agents)

gRPC (gRPC Remote Procedure Calls) is the chosen framework for direct, high-performance communication between the `sirius-engine` and any deployed `app-agent` instances. This pattern is essential for scenarios requiring low-latency command execution, control, and data exchange with remote agents.

**Key Characteristics & Roles**:

- **Roles**: As detailed in section [4.3.2. gRPC Communication with `sirius-engine`](#app-agent-grpc):
  - `sirius-engine`: Acts as the gRPC **server**. It defines and implements the gRPC services that agents can call, and also makes calls to agent-exposed services if the model is bidirectional for certain features. Typically, the engine listens on a specific port (e.g., `50051`) for incoming agent connections.
  - `app-agent`: Acts as the gRPC **client**. It initiates a connection to the `sirius-engine`'s gRPC server address.
- **Purpose**: To enable `sirius-engine` to:
  - Discover and register agents.
  - Send commands (e.g., shell commands, requests to initiate local scans by the agent) to specific agents.
  - Receive results, status updates, or streams of data back from agents.
  - Perform health checks or retrieve agent capabilities (`Ping` method).
- **Technology**: Utilizes Protocol Buffers (`.proto` files) for defining service interfaces and message structures. This ensures strong typing and efficient serialization/deserialization of data over HTTP/2.
- **Communication Style**: Supports both unary RPCs (simple request-response) and streaming RPCs (client-streaming, server-streaming, or bidirectional-streaming). Streaming is particularly useful for long-running commands where `app-agent` can stream output back to `sirius-engine` as it becomes available.

**Core Interactions (refer to [4.3.2](#app-agent-grpc) for more details on `.proto` examples and `app-agent` implementation)**:

- **Agent Registration (Conceptual)**: Upon startup, an `app-agent` might register itself with `sirius-engine` by calling a specific gRPC endpoint on the engine, providing its `AGENT_ID` and capabilities.
- **Command Execution (`ExecuteCommand` method)**: `sirius-engine` invokes the `ExecuteCommand` RPC on a target `app-agent`, sending the command string. The `app-agent` executes it and streams back the output and completion status.
- **Health Checks (`Ping` method)**: `sirius-engine` can periodically call a `Ping` method on agents to ensure they are responsive.

**Advantages in the Sirius Scan Context**:

- **Performance**: gRPC is generally more performant than REST/JSON for inter-service communication due to its use of HTTP/2 and binary serialization (Protocol Buffers).
- **Streaming**: Native support for streaming is ideal for tasks like returning large outputs from commands or continuous data feeds.
- **Strong Typing & API Contracts**: `.proto` definitions provide a clear, language-agnostic contract between the engine and agents.
- **Network Efficiency**: Well-suited for potentially network-constrained environments where agents might be deployed.

This gRPC communication channel is vital for extending `sirius-engine`'s operational reach and enabling sophisticated interactions with remote `app-agent` instances, forming a key part of the distributed task execution framework. For a detailed look at the agent-side implementation and an example `.proto` definition, please see section [4.3.2. gRPC Communication with `sirius-engine`](#app-agent-grpc).

### 6.5. Workflow Sequence Diagrams

To better illustrate how these communication mechanisms are used in concert, this section provides sequence diagrams for the key architectural workflows outlined in Section B.

#### 6.5.1. B.1 User Initiates a Vulnerability Scan

```mermaid
sequenceDiagram
    actor User
    participant SF as sirius-ui (Frontend)
    participant SBFF as sirius-ui (BFF/tRPC)
    participant RMQ as RabbitMQ
    participant SE as sirius-engine
    participant AS as app-scanner
    participant SDB as sirius-postgres
    participant SAPI as sirius-api

    User->>SF: 1. Configure & Start Scan
    SF->>SBFF: 2. tRPC call (scan.startScan)
    SBFF->>RMQ: 3. Publish Scan Job (scan_jobs_queue)
    activate RMQ
    RMQ-->>SE: 4. Consume Scan Job
    deactivate RMQ
    activate SE
    SE->>AS: 5. Dispatch Scan Task
    activate AS
    Note over AS,SE: Intermediate Status Updates (Optional)
    SE->>RMQ: 6a. Publish Scan Status (scan_status_updates_queue)
    activate RMQ
    RMQ-->>SBFF: 6b. Consume Scan Status
    deactivate RMQ
    SBFF->>SF: 6c. Relay Status (e.g., WebSocket)

    AS->>SE: 7. Return Scan Results
    deactivate AS
    SE->>SDB: 8. Persist Results (via go-api)
    activate SDB
    deactivate SDB
    SE->>RMQ: 9. Publish Result Notification (scan_results_notification_queue)
    deactivate SE
    activate RMQ
    RMQ-->>SBFF: 10. Consume Notification
    deactivate RMQ

    User->>SF: 11. View Scan Results
    SF->>SBFF: 12. tRPC call (scan.getResults)
    SBFF->>SAPI: 13. Request Scan Results (REST API)
    activate SAPI
    SAPI->>SDB: 14. Query Database
    activate SDB
    SDB-->>SAPI: 15. Return Data
    deactivate SDB
    SAPI-->>SBFF: 16. Return Results
    deactivate SAPI
    SBFF-->>SF: 17. Return Results to UI
```

#### 6.5.2. B.2 Agent Interaction & Management (e.g., Remote Command Execution)

```mermaid
sequenceDiagram
    actor User
    participant SF as sirius-ui (Frontend)
    participant SBFF as sirius-ui (BFF/tRPC)
    participant RMQ as RabbitMQ
    participant SE as sirius-engine (gRPC Server)
    participant AGENT as app-agent (gRPC Client)

    User->>SF: 1. Initiate Agent Action (e.g., Execute Command)
    SF->>SBFF: 2. tRPC call (e.g., agent.executeRemoteCommand)
    SBFF->>RMQ: 3. Publish Agent Command Task (e.g., agent_commands_queue)
    activate RMQ
    RMQ-->>SE: 4. Consume Agent Command Task
    deactivate RMQ
    activate SE
    SE->>AGENT: 5. gRPC Call (e.g., ExecuteCommand RPC)
    activate AGENT
    Note over AGENT: Agent executes command on remote host
    AGENT-->>SE: 6. Stream/Return Command Output (gRPC)
    deactivate AGENT
    SE->>RMQ: 7. Publish Agent Result/Status (e.g., agent_results_queue)
    deactivate SE
    activate RMQ
    RMQ-->>SBFF: 8. Consume Agent Result/Status
    deactivate RMQ
    SBFF->>SF: 9. Relay Result/Status to UI (e.g., WebSocket)
    SF->>User: 10. Display Result/Status
```

#### 6.5.3. B.3 Terminal Command Execution (via `app-terminal`)

```mermaid
sequenceDiagram
    actor User
    participant SF as sirius-ui (Frontend/xterm.js)
    participant SBFF as sirius-ui (BFF/tRPC)
    participant RMQ as RabbitMQ
    participant SE as sirius-engine
    participant AT as app-terminal

    User->>SF: 1. Type Command in UI Terminal
    SF->>SBFF: 2. tRPC call (terminal.sendCommand)
    SBFF->>RMQ: 3. Publish Terminal Command (terminal_commands_queue)
    activate RMQ
    RMQ-->>SE: 4. Consume Terminal Command
    deactivate RMQ
    activate SE
    SE->>AT: 5. Dispatch Command to app-terminal
    activate AT
    Note over AT: app-terminal executes command (e.g., PowerShell)
    AT->>SE: 6. Return Command Output Stream/Chunks
    deactivate AT
    SE->>RMQ: 7. Publish Terminal Output (terminal_output_queue)
    deactivate SE
    activate RMQ
    RMQ-->>SBFF: 8. Consume Terminal Output
    deactivate RMQ
    SBFF->>SF: 9. Relay Output to UI Terminal (e.g., WebSocket)
    SF->>User: 10. Display Command Output
```

## 7. Development & Deployment

The development and deployment strategy for Sirius Scan centers around containerization with Docker and Docker Compose, enabling consistent environments and streamlined workflows. Hot reloading is utilized for Go and Next.js applications to enhance developer productivity.

### 7.1. Dockerized Environment (`docker-compose.yaml`)

The primary mechanism for orchestrating the various microservices during development (and potentially for simple deployments) is the `Sirius/docker-compose.yaml` file. This file defines:

- **Services**: Each core component of Sirius Scan runs as a distinct service:
  - `sirius-ui`: The Next.js frontend and BFF.
  - `sirius-api`: The Go-based backend API (Fiber framework).
  - `sirius-engine`: The Go-based core processing engine.
  - `sirius-postgres`: PostgreSQL database instance.
  - `sirius-valkey`: Valkey key-value store instance.
  - `sirius-rabbitmq`: RabbitMQ message broker instance.
- **Build Contexts & Dockerfiles**: For services like `sirius-ui`, `sirius-api`, and `sirius-engine`, the `build` instruction points to their respective directories containing their `Dockerfile`.
- **Image Usage**: For infrastructure services (`sirius-postgres`, `sirius-valkey`, `sirius-rabbitmq`), pre-built official Docker images are used.
- **Service Dependencies (`depends_on`)**: Explicitly defines startup order, ensuring that infrastructure services like databases and message queues are likely to be available before application services attempt to connect to them. However, `depends_on` does not guarantee that the dependent service is _fully initialized_ and ready, so applications should implement connection retry logic (as `go-api` does).
- **Volume Mounts for Local Development**: Crucial for an efficient development loop. For example:
  - `sirius-ui`: Mounts `./sirius-ui:/app` allowing local code changes to be reflected immediately by the Next.js development server.
  - `sirius-api`: Mounts `./sirius-api:/app` for Go code, used by `air` for hot reloading.
  - `sirius-engine`: Mounts `./sirius-engine:/engine`. It also has commented-out volume mounts for `go-api` and sub-modules like `app-scanner`, `app-terminal`, and `app-agent` (e.g., `- ../minor-projects/app-scanner:/app-scanner`). Uncommenting these allows developers to work on these shared libraries or sub-modules locally and have their changes reflected inside the `sirius-engine` container, overriding the versions cloned by the engine's Dockerfile.
- **Port Mappings (`ports`)**: Exposes service ports to the host machine (e.g., `sirius-ui` on `3000`, `sirius-api` on `9001`, `sirius-engine` on `5174` and `50051` for gRPC, PostgreSQL on `54321`, RabbitMQ on `5672` and `15672` for management UI).
- **Environment Variables (`environment`)**: A primary way to configure services. Connection strings, API keys, operational parameters (e.g., `GO_ENV=development`) are set here. For `sirius-ui`, build-time arguments (`args` under `build`) are also used for `NEXT_PUBLIC_` variables.
- **Networking**: By default, Docker Compose sets up a single default bridge network. Services can reach each other using their defined service names as hostnames (e.g., `sirius-api` can connect to `sirius-postgres` using the hostname `sirius-postgres`).

To run the entire stack: `docker compose up --build -d`.
To view logs: `docker compose logs -f <service_name>`.
To stop: `docker compose down`.

### 7.2. Local Development & Hot Reloading

Rapid iteration is supported by hot reloading mechanisms for the primary application services:

- **`sirius-ui` (Next.js)**:
  - The Next.js development server (typically started by `npm run dev` within the container, which is the default CMD in its `Dockerfile`) provides fast refresh and hot module replacement (HMR) out of the box. Changes to React components or Next.js pages are reflected in the browser almost instantly without a full page reload where possible.
- **`sirius-api` (Go/Fiber)**:
  - Uses [`air`](https://github.com/air-verse/air) for live reloading. The `sirius-api/Dockerfile` installs `air`, and its `CMD` is typically `["air", "-c", ".air.toml"]`.
  - The `sirius-api/.air.toml` configuration file tells `air` which files/directories to watch (e.g., `*.go`), what build commands to run (`go build -o ./tmp/main .`), and how to run the compiled binary (`./tmp/main`). When Go source files change, `air` automatically recompiles and restarts the `sirius-api` server.
- **`sirius-engine` (Go) & Go Sub-Modules (`app-scanner`, `app-terminal`)**:
  - The main `sirius-engine` Go application and its Go-based sub-modules (which run within the `sirius-engine` container) can also benefit from `air` if configured.
  - The `sirius-engine/Dockerfile` installs `air` (both globally and within the `/app-scanner` context as an example).
  - The `sirius-engine/start.sh` script, which is the `ENTRYPOINT` for the `sirius-engine` container, plays a crucial role. This script is responsible for:
    - Starting the main `sirius-engine` Go application. It _could_ use `air` (e.g., `air -c .air.toml` pointing to an `.air.toml` in the `/engine` directory) if desired for hot reloading of the core engine code.
    - Managing the Go-based sub-applications cloned into the image (like `app-scanner`, `app-terminal`). If these sub-apps have their own `.air.toml` files (e.g., `app-scanner/.air.toml`), the `start.sh` script might navigate to their directories and launch them using their respective `air` configurations.
  - When local source code for a sub-module (e.g., `../minor-projects/app-scanner`) is volume-mounted into the `sirius-engine` container (e.g., to `/app-scanner`), changes to those local files will be visible inside the container. If `start.sh` runs that sub-module via `air`, hot reloading will occur for that specific sub-module.

### 7.3. Build Processes (Dockerfiles & Scripts)

Each application service (`sirius-ui`, `sirius-api`, `sirius-engine`) has its own `Dockerfile` defining its build process:

- **`sirius-ui/Dockerfile`**:
  - Typically uses a Node.js base image.
  - Copies `package.json` and `package-lock.json` (or `yarn.lock`), installs dependencies (`npm install`).
  - Copies the rest of the application source code.
  - Builds the Next.js application for production (`npm run build`) if the `NODE_ENV` is `production`, though for development it often just installs deps and relies on `npm run dev` as the CMD.
  - Exposes the port (e.g., `3000`).
  - Sets the `CMD` (e.g., `npm run dev` or `npm start`).
- **`sirius-api/Dockerfile`**:
  - Uses a Go base image.
  - Sets the working directory (e.g., `/app`).
  - Copies `go.mod` and `go.sum`, downloads Go module dependencies (`go mod download`).
  - Installs `air` for live reloading.
  - Copies the rest of the application source code.
  - The `.air.toml` usually defines the build command (`go build -o ./tmp/main .`).
  - Exposes the application port (e.g., `9001`).
  - Sets the `CMD` to run `air` (e.g., `["air", "-c", ".air.toml"]`).
- **`sirius-engine/Dockerfile`**:
  - More complex, as it sets up the environment for the core engine and its bundled sub-applications/tools.
  - Uses a Go base image.
  - Installs system dependencies: `git`, `curl`, build tools, and crucially, scanning tools like `nmap`, `rustscan` (built from source), and `powershell`.
  - Sets up directories (e.g., `/opt/sirius/nse` for Nmap scripts).
  - Clones repositories for sub-applications directly into the image: `app-scanner`, `app-terminal`, `go-api`.
  - Installs `air` (potentially in multiple contexts if sub-apps use it independently).
  - Copies its own source code (main engine code) and the `start.sh` script.
  - Makes `start.sh` executable and sets it as the `ENTRYPOINT`.
- **`sirius-engine/start.sh` (Entrypoint Script)**:
  - This script is pivotal for the `sirius-engine`'s operation.
  - It is responsible for the final setup and launching of processes within the container after it starts.
  - Its tasks likely include:
    - Initializing or configuring any services or environment aspects needed at runtime.
    - Starting the main `sirius-engine` Go application (potentially using `air` if an `.air.toml` for the engine core is present).
    - Navigating into the directories of cloned Go sub-applications (e.g., `/app-scanner`, `/app-terminal`) and launching them. This might involve running `go build` for them first (if not already built by `air`) and then executing their binaries, or running them via `air` if they have their own `.air.toml` configurations for hot reloading during development (when volume mounts are active).
    - Managing the lifecycle or backgrounding of these multiple processes if they are meant to run concurrently within the engine container.

Understanding these build and runtime mechanisms is key to developing for and deploying Sirius Scan.

## 8. Conclusion

This document has outlined the comprehensive architecture of the Sirius Scan platform, detailing its distributed microservices, data management strategies, inter-service communication patterns, and development workflows. The architecture is designed to be modular, scalable, and resilient, providing a robust foundation for a versatile vulnerability scanning and management system.

### 8.1. Summary of Architecture

Sirius Scan operates as a cohesive system of containerized microservices orchestrated by Docker Compose, promoting consistency across development and deployment environments. The key components and their interactions are summarized below:

- **User Interface & BFF (`sirius-ui`)**: A Next.js application serves as the primary user interaction point. It includes a React frontend for rich user experience and a Next.js backend (BFF) that handles UI-specific logic. Communication between the frontend and its BFF is streamlined using type-safe tRPC calls.

- **Backend API (`sirius-api`)**: A Go-based service built with the Fiber framework, exposing RESTful APIs. It acts as the central gateway for CRUD operations on core data entities (hosts, vulnerabilities, etc.) and implements key business logic. It leverages the `go-api` SDK for database and cache interactions.

- **Core Processing Engine (`sirius-engine`)**: Another Go application, this is the workhorse of the system. It orchestrates scanning tasks, manages agents, and integrates several specialized sub-applications:

  - **`app-scanner`**: For performing network and vulnerability scans using tools like Nmap and RustScan, with sophisticated NSE script management.
  - **`app-terminal`**: Provides PowerShell terminal access within the engine's environment.
    The engine receives tasks primarily via RabbitMQ and uses the `go-api` SDK for data operations.

- **Shared Backend SDK (`go-api`)**: A critical Go library providing standardized modules for database access (PostgreSQL with GORM), message queuing (RabbitMQ), key-value store interaction (Valkey), and core data models. It is consumed by `sirius-api`, `sirius-engine`, and its sub-modules, ensuring consistency and reusability.

- **Remote Agents (`app-agent`)**: Go applications designed to run on remote hosts, extending the engine's reach for command execution and potentially distributed scanning tasks. These communicate with `sirius-engine` via gRPC.

- **Data Persistence & Storage**:

  - **`sirius-postgres` (PostgreSQL)**: The primary relational database for storing structured data like host information, scan results, and vulnerabilities.
  - **`sirius-valkey` (Valkey)**: An in-memory key-value store used for caching, session management, and dynamic configurations like NSE script manifests.

- **Inter-Service Communication**: A mix of patterns is employed:
  - **RabbitMQ**: For asynchronous task queuing and event-driven communication, decoupling services like `sirius-ui` (BFF) from `sirius-engine`.
  - **tRPC**: Ensures type-safe API calls within `sirius-ui` (frontend to BFF).
  - **RESTful APIs**: Exposed by `sirius-api` for general backend data and business logic access.
  - **gRPC**: Facilitates efficient, low-latency communication between `sirius-engine` and `app-agent` instances.

This layered and decoupled architecture allows for independent development, scaling, and maintenance of components, while the well-defined communication interfaces ensure effective collaboration between services.

### 8.2. Future Directions

Sirius Scan is envisioned as an evolving platform. Potential future enhancements and architectural considerations include:

- **Enhanced Scalability & Orchestration**: Moving beyond Docker Compose for production deployments to more robust orchestration platforms like Kubernetes for better scaling, self-healing, and resource management.
- **Advanced Agent Capabilities**: Expanding `app-agent` functionalities to include more sophisticated local scanning capabilities, evidence collection, and potentially persistent monitoring features.
- **Expanded Scan Tool Integration**: Incorporating a wider variety of security assessment tools and scanners into `sirius-engine` or via agents.
- **Improved Security Posture**: Further hardening all services, implementing end-to-end encryption for all sensitive data in transit and at rest, and adopting more granular authentication and authorization mechanisms (e.g., OAuth2/OIDC).
- **Workflow Automation & Customization**: Allowing users to define more complex, chained scanning and assessment workflows.
- **Data Analytics & Reporting**: Integrating more advanced data analytics features and customizable reporting capabilities to provide deeper insights into security posture.
- **Configuration Management**: Implementing a centralized configuration management system for all services, potentially integrated with secrets management solutions.
- **Service Mesh**: For larger deployments, exploring a service mesh (e.g., Istio, Linkerd) to manage inter-service communication, observability, and security policies more effectively.

By pursuing these directions, Sirius Scan aims to continuously improve its utility, performance, and security, serving as a valuable tool for the cybersecurity community.
