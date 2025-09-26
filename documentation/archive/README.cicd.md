# Sirius Scan CI/CD Pipeline Overview

This document provides an overview of the Continuous Integration and Continuous Deployment (CI/CD) pipeline for the Sirius Scan project. It outlines the structure, triggers, environment management, and key processes involved in automatically building, testing, and integrating changes across the multi-repository application.

## 1. Repository Structure and CI

Sirius Scan is composed of a main `Sirius` repository and several submodule repositories (e.g., `go-api`, `app-scanner`, `app-terminal`, `app-agent`, `sirius-nse`).

- **Submodule CI**: Each submodule has its own basic CI workflow (`.github/workflows/ci.yml`) located within its respective repository. These workflows typically perform:

  - Code checkout.
  - Setup of the required runtime (e.g., Go, Node.js).
  - Dependency installation.
  - Linting (e.g., `golangci-lint` for Go projects).
  - Unit testing.
  - **Crucially**, upon a successful push/merge to its main branch, the submodule CI sends a `repository_dispatch` event to the main `SiriusScan/Sirius` repository. This event signals that the submodule has been updated.

- **Main `Sirius` Repository CI**: The primary CI/CD logic resides in `Sirius/.github/workflows/ci.yml`. This workflow orchestrates the build and integration of the entire application stack.

## 2. CI/CD Triggers

The main `Sirius` CI/CD pipeline (`Sirius/.github/workflows/ci.yml`) is triggered by the following events:

1.  **Push to `main` branch**: Any commit pushed directly to the `main` branch of the `Sirius` repository.
2.  **Pull Request to `main` branch**: When a pull request is opened or updated targeting the `main` branch of the `Sirius` repository.
3.  **`repository_dispatch` event (type: `submodule-update`)**: This custom event is sent by the CI workflows of the individual submodule repositories upon a successful update to their main branches. The payload of this event includes:
    - `submodule`: The name of the submodule repository that was updated (e.g., `SiriusScan/go-api`).
    - `commit_sha`: The specific commit SHA of the update in the submodule.

## 3. Simulating Staging in CI

While there isn't a dedicated, persistent staging server, the CI pipeline simulates a staging-like environment for integration testing:

- **Dynamic Configuration**: The `build` job in the main CI workflow dynamically generates:
  - A `docker-compose.ci.yml` file: This file defines the service stack for CI, using the Docker images built during the current workflow run.
  - `.env.ci.*` files: Environment configuration files (e.g., `.env.ci.sirius-api`, `.env.ci.sirius-engine`) tailored for the CI environment. These typically use test-specific database names, disable production features, and use services like an in-memory PostgreSQL database (`tmpfs`) for speed and isolation.
- **Isolated Network**: The `docker-compose.ci.yml` defines a dedicated Docker bridge network (`sirius_network`) for the services, ensuring isolation during CI runs.
- **Smoke Tests**: After building and starting the services using `docker compose -f docker-compose.ci.yml up -d`, a smoke test is performed. This involves basic checks like ensuring services are running (`docker compose ps`) and that key services are reachable (e.g., a `wget` to the `sirius-api` health endpoint).

This CI environment provides confidence that the built images of the services can start and communicate with each other correctly with a test configuration.

## 4. Environment Variables, Volumes, and Mounts

Understanding how configurations and code are handled in different contexts is key:

- **Local Development (`docker-compose.yaml`)**:

  - **`.env` files**: Each service (e.g., `sirius-ui`, `sirius-api`) typically relies on its own `.env` file (e.g., `Sirius/sirius-ui/.env`) for local development configuration (database connection strings, API keys, ports).
  - **Volume Mounts**: The main `docker-compose.yaml` heavily uses volume mounts to map your local source code directories directly into the running containers (e.g., `./sirius-ui:/app`). This enables hot reloading and immediate reflection of code changes.
  - Submodule development is also supported via commented-out volume mounts in `docker-compose.yaml` for services like `sirius-engine`, allowing you to mount a local clone of `go-api` or `app-scanner`.

- **CI Environment (`docker-compose.ci.yml` generated in workflow)**:
  - **No Local `.env` Files Used**: The CI environment _does not_ use your local `.env` files.
  - **Generated `.env.ci.*` files**: As mentioned above, the CI workflow creates specific `.env.ci.*` files (e.g., `.env-ci/.env.ci.sirius-api`) with configurations suitable for automated testing. These are referenced by the `env_file` directive in `docker-compose.ci.yml`.
  - **No Source Code Volume Mounts**: For CI, the services run from the Docker images built during the workflow. There are no mounts of local source code. This ensures the test is against the actual built artifact.
  - **Database**: PostgreSQL runs in `tmpfs` (RAM disk) for speed and to ensure a clean state for each CI run.

## 5. Submodule Version Pinning

To ensure reproducible and stable builds of the main `Sirius` application, specific versions of submodules are used:

- **Commit SHA Tracking**: When a submodule's CI triggers the main `Sirius` CI via `repository_dispatch`, it sends the exact `commit_sha` of the submodule's update.
- **Build Arguments (`ARG`)**: The `Sirius` CI workflow passes these received commit SHAs as build arguments (e.g., `GO_API_COMMIT_SHA`, `APP_SCANNER_COMMIT_SHA`) to the `docker build` commands for services that depend on these submodules (primarily `sirius-engine` and `sirius-api`).
- **Dockerfile Integration**: The `Dockerfile` for services like `sirius-engine` and `sirius-api` define these `ARG`s. During the build process, when cloning submodule repositories, they use `git checkout ${SUBMODULE_COMMIT_SHA}` to check out the exact version specified by the build argument.
  - For example, `sirius-engine/Dockerfile` has:
    ```Dockerfile
    ARG APP_SCANNER_COMMIT_SHA=main
    # ...
    RUN git clone https://github.com/SiriusScan/app-scanner.git && \
        cd /app-scanner && \
        git checkout ${APP_SCANNER_COMMIT_SHA}
    ```
- **Default to `main`**: If no commit SHA is explicitly passed (e.g., for a direct push/PR to `Sirius` that doesn't involve a submodule update dispatch), the Dockerfiles default to using the `main` branch of the submodules.

This mechanism ensures that the `Sirius` application is always built against known, specific states of its constituent submodules, preventing unexpected behavior due to uncoordinated submodule updates.

## 6. Interpreting Build Logs

When a CI build fails, check the GitHub Actions logs for the specific job and step that failed:

- **`detect-changes` job**: Check if it correctly identified which services need rebuilding. Incorrect logic here might skip necessary builds.
- **`build` job**:
  - **`Set environment variables` step**: Verify `TAG_SUFFIX` and submodule commit SHAs (if from dispatch) are set correctly.
  - **`Build sirius-xxx` steps**: Docker build errors will appear here. Examine the output for issues in `Dockerfile` commands, compilation errors, or problems fetching dependencies (including submodule checkouts).
  - **`Create CI environment config` step**: Ensure `docker-compose.ci.yml` and `.env.ci.*` files are generated as expected.
  - **`Smoke Test` step**: This is critical.
    - `docker compose ... up -d` failures indicate issues with service startup. Logs from `docker compose ps` can show which containers are unhealthy.
    - `wget` failures (or other connectivity checks) indicate a service might have started but is not responsive or configured correctly.
    - Use `docker compose -f docker-compose.ci.yml logs <service-name>` (you might need to add steps to print these logs on failure) to get detailed logs from specific services during the smoke test if they fail to start or behave unexpectedly.
- **`push-images` job**: Failures here usually relate to GHCR login issues or Docker tagging/pushing problems.

For submodule CI failures, check the logs directly in the respective submodule repository's Actions tab.

---

This document provides a foundational understanding. As the CI/CD pipeline evolves, this documentation will be updated.
