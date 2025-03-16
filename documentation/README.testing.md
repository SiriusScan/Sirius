# Testing Many-to-Many Relationships in the Database Schema

This document provides instructions on how to test the many-to-many relationships between:

1. Hosts and Ports
2. Hosts and Vulnerabilities

## Available Test Methods

There are two ways to test the relationships:

1. **SQL Test Script**: Tests the database schema directly with SQLite queries
2. **Go Test Program**: Tests the GORM model relationships in application code

## 1. SQL Test Script

The SQL test script (`test_relationships.sql`) inserts sample data and runs several verification queries to ensure that the many-to-many relationships work correctly.

### Running the SQL Test:

```bash
# Option 1: Run with the shell script wrapper
./run_relationship_test.sh

# Option 2: Run directly with Turso
turso db shell http://127.0.0.1:9010 < test_relationships.sql
```

### What the SQL Test Validates:

- **Host-Port Relationship**:

  - Web hosts have HTTP, HTTPS, and SSH ports
  - DB host has only SSH port
  - SSH port is shared by all hosts
  - HTTP and HTTPS ports are shared by web hosts only

- **Host-Vulnerability Relationship**:

  - Web vulnerability affects only web hosts
  - SSH vulnerability affects all hosts
  - OS vulnerability affects only the Windows host

- **Complex Joins**:
  - Verifies queries that join across both relationships

### Cleaning Up Test Data:

To remove the test data after running the tests:

1. Connect to the Turso shell: `turso db shell http://127.0.0.1:9010`
2. Run: `ROLLBACK;`

## 2. Go Test Program

The Go test program (`go_test_relationships.go`) uses GORM to test the relationships, validating that the many-to-many associations work correctly at the application level.

### Running the Go Test:

```bash
# Make sure you're in the go-api directory
cd /path/to/go-api

# Run the test program
go run go_test_relationships.go
```

The Go test will automatically ask if you want to keep or discard the test data when it completes.

### What the Go Test Validates:

- **GORM Association Methods**: Tests that GORM can correctly establish and query the many-to-many relationships
- **Association Count Validation**: Verifies that each host has the correct number of ports and vulnerabilities
- **Bi-directional Relationships**: Checks both sides of the relationships (host → port and port → host)
- **Complex GORM Query**: Tests that complex SQL joins work with the GORM model

## Test Data Structure

Both tests use the same basic test data structure:

- **Hosts**:

  - web1.test.local (192.168.1.1): Linux server
  - web2.test.local (192.168.1.2): Linux server
  - db1.test.local (192.168.1.3): Windows server

- **Ports**:

  - 22/tcp (SSH): On all hosts
  - 80/tcp (HTTP): On web hosts only
  - 443/tcp (HTTPS): On web hosts only

- **Vulnerabilities**:
  - TEST-CVE-2023-1234: Web vulnerability (affects web hosts)
  - TEST-CVE-2023-5678: SSH vulnerability (affects all hosts)
  - TEST-CVE-2023-9012: OS vulnerability (affects Windows host only)

## Expected Results

If the many-to-many relationships are working correctly, both tests should complete without errors and show that:

1. Many hosts can share the same port
2. Many hosts can share the same vulnerability
3. Complex queries joining across both relationships work correctly

## Troubleshooting

If the tests fail:

1. **Schema Issues**: Check that the tables were created without foreign key constraints
2. **Junction Tables**: Verify that `host_ports` and `host_vulnerabilities` tables exist and have the correct columns
3. **Model Mapping**: Ensure GORM models correctly define the many-to-many relationships
4. **Indexes**: Check that the recommended indexes were created for the junction tables
