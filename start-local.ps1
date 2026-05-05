$ErrorActionPreference = "Stop"

Write-Host "Starting Vibe Coder locally (MySQL + app)..."
docker compose up -d --build

Write-Host "Done."
Write-Host "Open: http://localhost:3000"
Write-Host "LAN:  http://<YOUR_PC_IP>:3000"
Write-Host "Default logins:"
Write-Host "  vitya / vitya12345"
Write-Host "  sega  / sega12345"
