# Windows Registry Vulnerability Detection Test Script
# This script tests the Windows registry detection capabilities

Write-Host "🔍 Starting Windows Registry Vulnerability Detection Test" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Set up test registry entries
Write-Host "`n📝 Setting up test registry entries..." -ForegroundColor Yellow

try {
    # Create test vulnerable app registry entry
    Write-Host "   Creating test vulnerable app entry..."
    reg add "HKLM\SOFTWARE\SiriusTest\VulnerableApp" /v "Version" /t REG_SZ /d "16.0.15330.20264" /f | Out-Null
    
    # Set UAC disabled (for testing)
    Write-Host "   Setting UAC disabled (test)..."
    reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" /v "EnableLUA" /t REG_DWORD /d 0 /f | Out-Null
    
    # Set Print Spooler enabled (for testing)
    Write-Host "   Setting Print Spooler enabled (test)..."
    reg add "HKLM\SYSTEM\CurrentControlSet\Services\Spooler" /v "Start" /t REG_DWORD /d 2 /f | Out-Null
    
    Write-Host "✅ Test registry entries created successfully" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Failed to create test registry entries: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Run the agent scan with registry templates
Write-Host "`n🚀 Running agent scan with registry detection..." -ForegroundColor Yellow

try {
    # Set environment variables for standalone mode
    $env:SERVER_ADDRESS = "localhost:50051"
    $env:AGENT_ID = "windows-test-agent"
    $env:HOST_ID = "windows-test-host"
    $env:API_BASE_URL = "http://localhost:9001"
    $env:ENABLE_SCRIPTING = "true"
    
    # Check if agent executable exists
    $agentPath = ".\agent.exe"
    if (-not (Test-Path $agentPath)) {
        $agentPath = ".\agent-windows.exe"
        if (-not (Test-Path $agentPath)) {
            Write-Host "❌ Agent executable not found. Please build with: GOOS=windows GOARCH=amd64 go build -o agent-windows.exe ." -ForegroundColor Red
            exit 1
        }
    }
    
    Write-Host "   Using agent: $agentPath"
    Write-Host "   Templates directory: .\templates\"
    
    # Run the scan
    Write-Host "`n📊 Executing registry vulnerability scan..."
    & $agentPath scan 2>&1 | Tee-Object -FilePath "windows-registry-test.log"
    
    $scanResult = $LASTEXITCODE
    
    if ($scanResult -eq 0) {
        Write-Host "✅ Agent scan completed successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Agent scan completed with exit code: $scanResult" -ForegroundColor Orange
    }
    
} catch {
    Write-Host "❌ Failed to run agent scan: $($_.Exception.Message)" -ForegroundColor Red
}

# Clean up test registry entries
Write-Host "`n🧹 Cleaning up test registry entries..." -ForegroundColor Yellow

try {
    Write-Host "   Removing test vulnerable app entry..."
    reg delete "HKLM\SOFTWARE\SiriusTest" /f 2>$null | Out-Null
    
    Write-Host "   Restoring UAC to enabled..."
    reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" /v "EnableLUA" /t REG_DWORD /d 1 /f | Out-Null
    
    Write-Host "✅ Test registry entries cleaned up" -ForegroundColor Green
    
} catch {
    Write-Host "⚠️  Failed to clean up some registry entries: $($_.Exception.Message)" -ForegroundColor Orange
}

# Display results
Write-Host "`n📋 Test Results Summary:" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

if (Test-Path "windows-registry-test.log") {
    Write-Host "📄 Detailed log saved to: windows-registry-test.log"
    Write-Host "`n🔍 Looking for registry detection results..."
    
    $logContent = Get-Content "windows-registry-test.log" -Raw
    
    if ($logContent -match "template.*registry" -or $logContent -match "vulnerable.*found") {
        Write-Host "✅ Registry detection functionality appears to be working" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Registry detection results not clearly visible in logs" -ForegroundColor Orange
    }
    
    if ($logContent -match "error" -or $logContent -match "failed") {
        Write-Host "⚠️  Some errors detected in logs - check windows-registry-test.log for details" -ForegroundColor Orange
    }
} else {
    Write-Host "⚠️  Log file not found" -ForegroundColor Orange
}

Write-Host "`n🎯 Registry Detection Test Completed!" -ForegroundColor Cyan
Write-Host "   Check the above output and windows-registry-test.log for detailed results" -ForegroundColor Gray 