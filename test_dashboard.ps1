try {
    $login = Invoke-RestMethod -Uri 'http://localhost:8000/api/v1/auth/login' -Method Post -Body (@{email = 'testuser3@example.com'; password = 'password123' } | ConvertTo-Json) -ContentType 'application/json'
    $token = $login.access_token
    Write-Host "Token retrieved: $token"
    
    $headers = @{
        Authorization = "Bearer $token"
    }
    
    Write-Host "Calling Overview..."
    $overview = Invoke-RestMethod -Uri 'http://localhost:8000/api/v1/dashboard/overview' -Method Get -Headers $headers
    Write-Host "Overview: $($overview | ConvertTo-Json)"
    
    Write-Host "Calling Spending..."
    $spending = Invoke-RestMethod -Uri 'http://localhost:8000/api/v1/dashboard/spending-by-category' -Method Get -Headers $headers
    Write-Host "Spending: $($spending | ConvertTo-Json)"
    
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "RESPONSE BODY: $($reader.ReadToEnd())"
    }
}
