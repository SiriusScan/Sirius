# Task ID: 1.6

# Title: Integrate SBOM Data with Database

# Status: done

# Dependencies: 1.5

# Priority: high

# Description: Integrate enhanced SBOM data with PostgreSQL database using JSONB fields

# Details:

Implement database integration for enhanced SBOM data collected in Task 1.5. This involves:

1. **Update agent API client** to send enhanced scan data to sirius-api
2. **Modify host handler** to accept and store JSONB data in new schema fields
3. **Implement merge strategy** to preserve existing data from other sources
4. **Use source attribution system** for agent data
5. **Test SBOM data persistence** and retrieval

## Implementation Requirements:

### Agent Side:

- Extend scan command to convert enhanced package data to JSONB format
- Create API client methods for sending enhanced data
- Implement conversion functions for scan results to host data with JSONB fields

### API Side:

- Update host handler to detect and process enhanced data requests
- Implement JSONB field population in database operations
- Maintain backward compatibility with existing API endpoints

### Database Integration:

- Use existing JSONB fields: software_inventory, system_fingerprint, agent_metadata
- Implement source-aware updates to preserve data from multiple sources
- Record enhanced scan history with JSONB data indicators

## JSONB Field Structure:

### software_inventory:

```json
{
  "packages": [EnhancedPackageInfo],
  "package_count": number,
  "collected_at": timestamp,
  "source": "sirius-agent",
  "statistics": {
    "architectures": {"amd64": count},
    "publishers": {"Ubuntu": count}
  }
}
```

### system_fingerprint:

```json
{
  "fingerprint": SystemFingerprint,
  "collected_at": timestamp,
  "source": "sirius-agent",
  "platform": "linux|windows|darwin",
  "collection_duration_ms": number,
  "summary": {
    "has_cpu_info": boolean,
    "network_interfaces": number
  }
}
```

### agent_metadata:

```json
{
  "agent_id": string,
  "host_id": string,
  "scan_timestamp": timestamp,
  "agent_version": string,
  "platform": string,
  "scan_summary": {
    "packages_collected": number,
    "fingerprint_collected": boolean
  }
}
```

# Test Strategy:

1. **Unit tests** for JSONB data conversion functions
2. **Integration tests** for API client enhanced data submission
3. **Database tests** for JSONB field persistence and retrieval
4. **End-to-end tests** for complete scan-to-database workflow
5. **Backward compatibility tests** to ensure existing functionality works

## Implementation Status: ✅ COMPLETED

### ✅ **Agent API Client Updates**

- Added `UpdateHostRecordWithEnhancedData` method to APIClient interface
- Implemented enhanced data submission with JSONB fields
- Created structured request format for enhanced host data

### ✅ **Scan Command Integration**

- Updated scan command to convert results to JSONB format
- Implemented `convertScanResultToHostWithJSONB` function
- Added automatic enhanced data submission when available

### ✅ **API Handler Enhancements**

- Created `EnhancedHostRequest` structure for JSONB data
- Updated `AddHostWithSource` handler to detect and process enhanced data
- Implemented graceful fallback to basic request parsing

### ✅ **Database Integration**

- Added `AddHostWithSourceAndJSONB` function for enhanced data persistence
- Integrated JSONB field population with existing source-aware operations
- Enhanced scan history recording with JSONB data indicators

### ✅ **Testing Framework**

- Created comprehensive test suite with mock API client
- Implemented validation for JSONB data structures
- Added tests for package conversion and data integrity

### **Key Features Implemented:**

1. **Enhanced Data Flow**: Agent → API Client → Handler → Database
2. **JSONB Field Population**: Structured data in software_inventory, system_fingerprint, agent_metadata
3. **Source Attribution**: Enhanced data tagged with agent source information
4. **Backward Compatibility**: Existing API endpoints continue to work
5. **Graceful Degradation**: Falls back to basic data if enhanced data unavailable
6. **Comprehensive Testing**: Mock-based testing for all integration points

### **Files Modified:**

- `app-agent/internal/commands/scan/scan_command.go`: Enhanced data conversion and submission
- `app-agent/internal/commands/command.go`: API client interface extension
- `app-agent/internal/apiclient/client.go`: Enhanced data submission implementation
- `sirius-api/handlers/host_handler.go`: Enhanced request handling
- `go-api/sirius/host/source_aware.go`: JSONB database integration
- `app-agent/internal/commands/scan/database_integration_test.go`: Comprehensive test suite

The implementation provides a complete database integration solution for enhanced SBOM data, maintaining backward compatibility while adding powerful new capabilities for software inventory management and system fingerprinting.
