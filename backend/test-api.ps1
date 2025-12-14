# test-api.ps1
$base = "http://localhost:8080/api/v1/items"
$resultsDir = ".\test-results"
New-Item -ItemType Directory -Path $resultsDir -Force | Out-Null

# future epoch (1 day ahead)
$future = [DateTimeOffset]::UtcNow.AddDays(1).ToUnixTimeSeconds()
$payloadSuccess = "{ `"title`": `"Smoke Test`", `"description`": `"Smoke success`", `"dueEpoch`": $future }"
$payloadPast = "{ `"title`": `"Smoke Past`", `"description`": `"Should be 501`", `"dueEpoch`": 1000000000 }"
$payloadInvalid = "{ `"title`": `""`, `"description`": `"x`" }"

# write payload files
$payloadSuccess | Out-File -FilePath "$resultsDir\payload-success.json" -Encoding UTF8
$payloadPast | Out-File -FilePath "$resultsDir\payload-past.json" -Encoding UTF8
$payloadInvalid | Out-File -FilePath "$resultsDir\payload-invalid.json" -Encoding UTF8

function runCurl {
    param($desc, $method, $url, $dataFile)
    $outFile = "$resultsDir\$desc.txt"
    Write-Host "`n== $desc =="
    if ($dataFile) {
        curl.exe -s -i -X $method $url -H "Content-Type: application/json" --data-binary "@$dataFile" 2>&1 | Tee-Object $outFile
    } else {
        curl.exe -s -i $url 2>&1 | Tee-Object $outFile
    }
    Write-Host "Saved -> $outFile"
}

# Make sure backend is running before executing
Write-Host "Running smoke tests. Ensure backend (mvn spring-boot:run) is running." -ForegroundColor Cyan

runCurl "GET_items_before" "GET" $base $null
runCurl "POST_success" "POST" $base "$resultsDir\payload-success.json"
runCurl "POST_past" "POST" $base "$resultsDir\payload-past.json"
runCurl "POST_invalid" "POST" $base "$resultsDir\payload-invalid.json"
runCurl "GET_items_after" "GET" $base $null

# if created, attempt to extract id of first item for update/delete
$get = Get-Content "$resultsDir\GET_items_after.txt" -Raw
try {
    $json = $get -split "`r?`n" | Select-Object -Last 1
    $arr = ConvertFrom-Json $json
    if ($arr -and $arr.Count -gt 0) {
        $id = $arr[0].id
        Write-Host "Found item id: $id"
        # update payload with new future+2days
        $future2 = [DateTimeOffset]::UtcNow.AddDays(2).ToUnixTimeSeconds()
        $updatePayload = "{ `"title`": `"Updated`", `"description`": `"Updated via script`", `"dueEpoch`": $future2 }"
        $updatePayload | Out-File -FilePath "$resultsDir\payload-update.json" -Encoding UTF8
        runCurl "PUT_update" "PUT" "$base/$id" "$resultsDir\payload-update.json"
        runCurl "DELETE" "DELETE" "$base/$id" $null
    } else {
        Write-Host "No items found to update/delete."
    }
} catch {
    Write-Host "Could not parse GET output to JSON. $_"
}

Write-Host "`nSmoke tests finished. Results saved to $resultsDir"
