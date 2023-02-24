function New-CPE {
    <#
     .SYNOPSIS
     This module will
     Function: New-CPE
     Author: Matthew Toussain (@0sm0s1z)
     License: MIT
     Required Dependencies: None
     Optional Dependencies: None
     .DESCRIPTION
       This module will submit a specified CPE to a Sirius API endpoint.
     .EXAMPLE
     C:\PS> New-CPE -API localhost:8080 -HostIP "192.168.1.15" -CPE "cpe:2.3:a:mruby:mruby:*:*:*:*:*:*:*:*"
    #>
    Param
    (
     [Parameter(Position = 0, Mandatory = $True)]
     [string]$API = "",
     [Parameter(Position = 0, Mandatory = $True)]
     [string]$HostIP = "",
     [Parameter(Position = 0, Mandatory = $True)]
     [string]$CPE = ""
    )

    $headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
    $headers.Add("Content-Type", "application/json")
    
    $body = "{`n    `"ip`":`"$HostIP`",`n    `"CPE`": [`"$CPE`"]`n}"
    
    $response = Invoke-RestMethod "http://$API/api/update/host" -Method 'POST' -Headers $headers -Body $body
    $response | ConvertTo-Json


}
