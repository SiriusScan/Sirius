# Sirius Scan

Sirius is the first truly open-source general purpose vulnerability scanner. Today, the information security community remains the best and most expedient source for cybersecurity intelligence. The community itself regularly outperforms commercial vendors. This is the primary advantage Sirius Scan intends to leverage.

The framework is built around four general vulnerability identification concepts: The vulnerability database, network vulnerability scanning, agent-based discovery, and custom assessor analysis. With these powers combined around an easy to use interface Sirius hopes to enable industry evolution.

## Getting Started

To run Sirius clone this repository and invoke the containers with `docker-compose`. Note that both `docker` and `docker-compose` must be installed to do this.

```
git clone https://github.com/SiriusScan/Sirius.git
cd Sirius
docker compose up
```

### Logging in

The default username and password for Sirius is: `admin/sirius`

## Services

The system is composed of the following services:

- Mongo: a NoSQL database used to store data.
- RabbitMQ: a message broker used to manage communication between services.
- Sirius API: the API service which provides access to the data stored in Mongo.
- Sirius Web: the web UI which allows users to view and manage their data pipelines.
- Sirius Engine: the engine service which manages the execution of data pipelines.

## Usage

To use Sirius, first start all of the services by running `docker-compose up`. Then, access the web UI at `localhost:3000`.

### Remote Scanner

If you would like to setup Sirius Scan on a remote machine and access it you must modify the `./UI/config.json` file to include your server details.

## Testing

The project contains a comprehensive testing framework designed to be run in Docker containers.

### Test Organization

- `/tests`: Central directory for all project-wide test scripts and utilities
- `/go-api/tests`: Go API-specific tests including models and API endpoints

### Running Tests

Use the master test script for all testing operations:

```bash
# Show all available test options
./run_tests.sh --help

# Run all tests
./run_tests.sh --all

# Run only model tests
./run_tests.sh --models

# Run UI verification tests
./run_tests.sh --ui

# Reset the database
./run_tests.sh --reset

# Clean up test data
./run_tests.sh --cleanup
```

### Docker Container Tests

Tests are designed to run inside Docker containers, with the exception of Turso database operations which must be run from the host. The containers used for testing are:

- **sirius-api**: The Go API service
- **sirius-engine**: The processing engine
- **sirius-ui**: The frontend UI

For more details on testing, see the documentation in the `/tests` and `/go-api/tests` directories.

**Good Luck! Have Fun! Happy Hacking!**

# UI Notes

Environment variables are passed into the container via the .env file

# Docker Test Fix for Sirius API

This repository contains scripts to fix and run tests for the Sirius API in Docker containers.

## Problem Summary

The tests were failing due to two main issues:

1. **SQL Keyword Conflict**: The `references` table name was causing conflicts with the SQL `REFERENCES` keyword.
2. **Column Name Mismatch**: The Go model used `VID` as the field name, but GORM was mapping it to `v_id` in the database, while the tests were looking for `vid`.

## Solution

The final solution addresses both issues:

1. **SQL Keyword Fix**: Properly quote the `"references"` table name in SQL statements.
2. **Column Name Fix**: Update the SQL queries in the test files to use `v_id` instead of `vid`.
3. **Auto-Migration**: Add auto-migration to the test setup to ensure all tables exist with the correct schema.

## Scripts

- `final_solution.sh`: The complete solution that fixes all issues and runs the tests successfully.
- `setup.sql`: The SQL script to set up the database schema with proper column names.
- `fix_test_files.sh`: A script to fix the test files in the container.
- `complete_fix.sh`: An earlier attempt at fixing the issues.
- `fixed_test_runner.sh`: Another attempt at fixing the issues.

## Usage

To run the tests with all fixes applied:

```bash
./final_solution.sh
```

## How It Works

The final solution script:

1. Resets the database completely, dropping all tables and views.
2. Fixes the test files in the container to use `v_id` instead of `vid`.
3. Creates a new `db_reset.sql` file in the container.
4. Creates a modified `init_test.go` file that includes auto-migration.
5. Runs the tests.

## Common Issues

- **SQL Keyword Conflicts**: Always quote table or column names that might conflict with SQL keywords.
- **GORM Naming Conventions**: GORM converts camelCase field names to snake_case column names by default.
- **Auto-Migration**: Make sure to auto-migrate your models before running tests to ensure the correct schema.

## Lessons Learned

1. **SQL Reserved Keywords**: Be careful with table and column names that might conflict with SQL keywords.
2. **GORM Naming Conventions**: Understand how GORM maps Go struct field names to database column names.
3. **Test Environment Setup**: Ensure proper test environment setup, including database schema and data.
4. **Error Handling**: Pay attention to error messages, as they often provide clues to the underlying issues.
