#!/bin/bash

# Test Data Population Script for Phase 1 Validation
# This script populates test data to validate source-aware functionality
# DELETE THIS SCRIPT after Phase 1 testing is complete

set -e

API_BASE="http://localhost:9001"
echo "🧪 Starting Phase 1 Test Data Population..."
echo "API Base: $API_BASE"
echo ""

# Function to make API calls with error handling
make_api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo "📡 $description"
    echo "   Method: $method"
    echo "   Endpoint: $endpoint"
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" "$API_BASE$endpoint")
    fi
    
    # Extract response body and HTTP code
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo "   ✅ Success ($http_code)"
        echo "   Response: $(echo "$response_body" | jq -c . 2>/dev/null || echo "$response_body")"
    else
        echo "   ❌ Failed ($http_code)"
        echo "   Response: $response_body"
        return 1
    fi
    echo ""
}

# Test Case 1: Multi-Source Data Loss Prevention Test
echo "🔥 TEST CASE 1: Multi-Source Data Loss Prevention"
echo "Testing that different sources don't overwrite each other's data"
echo ""

# 1a. Add host with NMAP source
nmap_data='{
  "host": {
    "ip": "192.168.1.100",
    "hostname": "test-host-1",
    "os": "Linux",
    "osversion": "Ubuntu 22.04",
    "vulnerabilities": [
      {
        "vid": "CVE-2017-0144",
        "title": "EternalBlue SMB Vulnerability",
        "description": "Microsoft SMB Remote Code Execution Vulnerability",
        "riskscore": 8.1
      },
      {
        "vid": "CVE-2019-0708",
        "title": "BlueKeep RDP Vulnerability",
        "description": "Remote Desktop Services Remote Code Execution Vulnerability",
        "riskscore": 9.8
      }
    ]
  },
  "source": {
    "name": "nmap",
    "version": "7.94",
    "config": "nmap -sV -sC --script vuln"
  }
}'

make_api_call "POST" "/host/with-source" "$nmap_data" "Adding host with NMAP source"

# 1b. Add same host with AGENT source (should NOT overwrite NMAP data)
agent_data='{
  "host": {
    "ip": "192.168.1.100",
    "hostname": "test-host-1",
    "os": "Linux",
    "osversion": "Ubuntu 22.04",
    "vulnerabilities": [
      {
        "vid": "CVE-2021-34527",
        "title": "PrintNightmare Vulnerability",
        "description": "Windows Print Spooler Remote Code Execution Vulnerability",
        "riskscore": 8.8
      },
      {
        "vid": "CVE-2019-0708",
        "title": "BlueKeep RDP Vulnerability",
        "description": "Remote Desktop Services Remote Code Execution Vulnerability (Agent detected)",
        "riskscore": 9.8
      }
    ]
  },
  "source": {
    "name": "agent",
    "version": "2.1.0",
    "config": "full-system-scan"
  }
}'

make_api_call "POST" "/host/with-source" "$agent_data" "Adding same host with AGENT source"

# Test Case 2: Temporal Tracking Test
echo "🕐 TEST CASE 2: Temporal Tracking"
echo "Testing first_seen and last_seen timestamps"
echo ""

# 2a. Create initial scan
temporal_data_1='{
  "host": {
    "ip": "192.168.1.200",
    "hostname": "temporal-test",
    "vulnerabilities": [
      {
        "vid": "CVE-2020-1472",
        "title": "Zerologon Vulnerability",
        "description": "Netlogon Remote Protocol (MS-NRPC) Elevation of Privilege Vulnerability",
        "riskscore": 10.0
      }
    ]
  },
  "source": {
    "name": "nmap",
    "version": "7.94",
    "config": "initial-scan"
  }
}'

make_api_call "POST" "/host/with-source" "$temporal_data_1" "Initial scan for temporal tracking"

# 2b. Wait and rescan with same source (should update last_seen)
echo "⏳ Waiting 3 seconds to test temporal tracking..."
sleep 3

temporal_data_2='{
  "host": {
    "ip": "192.168.1.200",
    "hostname": "temporal-test",
    "vulnerabilities": [
      {
        "vid": "CVE-2020-1472",
        "title": "Zerologon Vulnerability",
        "description": "Netlogon Remote Protocol (MS-NRPC) Elevation of Privilege Vulnerability - rescan",
        "riskscore": 10.0
      }
    ]
  },
  "source": {
    "name": "nmap",
    "version": "7.94",
    "config": "rescan"
  }
}'

make_api_call "POST" "/host/with-source" "$temporal_data_2" "Rescan for temporal tracking (should update last_seen)"

# Test Case 3: Backward Compatibility Test
echo "🔄 TEST CASE 3: Backward Compatibility"
echo "Testing that old API still works with source attribution"
echo ""

legacy_data='{
  "ip": "192.168.1.300",
  "hostname": "legacy-test",
  "os": "Windows",
  "osversion": "Server 2019",
  "vulnerabilities": [
    {
      "vid": "CVE-2018-8174",
      "title": "VBScript Engine Memory Corruption",
      "description": "VBScript Engine Remote Code Execution Vulnerability",
      "riskscore": 7.5
    }
  ]
}'

make_api_call "POST" "/host" "$legacy_data" "Testing legacy API (should assign unknown source)"

# Test Case 4: Multiple Sources on Same Vulnerability
echo "🔀 TEST CASE 4: Multiple Sources on Same CVE"
echo "Testing that same CVE from different sources creates separate records"
echo ""

# 4a. Manual source finds CVE-2023-SHARED
manual_data='{
  "host": {
    "ip": "192.168.1.400",
    "hostname": "multi-source-test",
    "vulnerabilities": [
      {
        "vid": "CVE-2019-1182",
        "title": "Windows RDP Vulnerability",
        "description": "Remote Desktop Protocol Remote Code Execution Vulnerability",
        "riskscore": 8.1
      }
    ]
  },
  "source": {
    "name": "manual",
    "version": "1.0.0",
    "config": "manual-analysis"
  }
}'

make_api_call "POST" "/host/with-source" "$manual_data" "Manual source finds shared CVE"

# 4b. RustScan also finds the same CVE
rustscan_data='{
  "host": {
    "ip": "192.168.1.400",
    "hostname": "multi-source-test",
    "vulnerabilities": [
      {
        "vid": "CVE-2019-1182",
        "title": "Windows RDP Vulnerability",
        "description": "Remote Desktop Protocol Remote Code Execution Vulnerability (RustScan detected)",
        "riskscore": 8.1
      }
    ]
  },
  "source": {
    "name": "rustscan",
    "version": "2.0.1",
    "config": "rustscan -p 1-65535"
  }
}'

make_api_call "POST" "/host/with-source" "$rustscan_data" "RustScan finds same CVE (should create separate record)"

# Test Case 5: Port Tracking with Source Attribution
echo "🔌 TEST CASE 5: Port Source Attribution"
echo "Testing port discovery with source attribution"
echo ""

port_data='{
  "host": {
    "ip": "192.168.1.500",
    "hostname": "port-test",
    "ports": [
      {
        "id": 80,
        "protocol": "tcp",
        "state": "open"
      },
      {
        "id": 443,
        "protocol": "tcp", 
        "state": "open"
      },
      {
        "id": 22,
        "protocol": "tcp",
        "state": "closed"
      }
    ]
  },
  "source": {
    "name": "nmap",
    "version": "7.94",
    "config": "nmap -p 1-1000"
  }
}'

make_api_call "POST" "/host/with-source" "$port_data" "Port discovery with source attribution"

echo "✅ Test data population completed!"
echo ""
echo "📋 Summary of test data created:"
echo "   • 192.168.1.100 - Multi-source vulnerability test (nmap + agent)"
echo "   • 192.168.1.200 - Temporal tracking test (nmap rescan)"
echo "   • 192.168.1.300 - Backward compatibility test (legacy API)"
echo "   • 192.168.1.400 - Same CVE from multiple sources (manual + rustscan)"
echo "   • 192.168.1.500 - Port source attribution test (nmap)"
echo ""
echo "🔍 Run 'test-phase1-verify.sh' to validate the results" 