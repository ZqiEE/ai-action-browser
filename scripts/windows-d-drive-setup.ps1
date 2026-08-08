param(
  [string]$ProjectRoot = "D:\Projects\ai-action-browser"
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$RepoUrl = "https://github.com/ZqiEE/ai-action-browser.git"
$RepoZipUrl = "https://github.com/ZqiEE/ai-action-browser/archive/refs/heads/main.zip"
$NodeVersion = "22.12.0"
$NodeFolder = "node-v$NodeVersion-win-x64"
$ToolsRoot = "D:\Tools"
$NodeRoot = Join-Path $ToolsRoot $NodeFolder
$NpmCache = "D:\npm-cache"
$PlaywrightRoot = "D:\playwright-browsers"
$TempRoot = "D:\Temp\ai-action-browser"
$ProjectsRoot = Split-Path -Parent $ProjectRoot
$ApiRoot = Join-Path $ProjectRoot "apps\api"
$WebRoot = Join-Path $ProjectRoot "apps\web"
$ExtensionRoot = Join-Path $ProjectRoot "apps\extension"

function Write-Step([string]$Message) {
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Require-DDrive {
  if (-not (Test-Path "D:\")) {
    throw "D: drive was not found. This launcher intentionally refuses to install the project on C:."
  }
}

function Ensure-Directory([string]$Path) {
  if (-not (Test-Path $Path)) {
    New-Item -ItemType Directory -Path $Path -Force | Out-Null
  }
}

function Configure-DDriveEnvironment {
  Ensure-Directory $ToolsRoot
  Ensure-Directory $NpmCache
  Ensure-Directory $PlaywrightRoot
  Ensure-Directory $TempRoot
  Ensure-Directory $ProjectsRoot

  # Heavy temporary/cache data for this launcher and its child processes stays on D:.
  $env:TEMP = $TempRoot
  $env:TMP = $TempRoot
  $env:NPM_CONFIG_CACHE = $NpmCache
  $env:PLAYWRIGHT_BROWSERS_PATH = $PlaywrightRoot

  # Persist only the two large cache locations for future shells.
  try { setx NPM_CONFIG_CACHE $NpmCache | Out-Null } catch {}
  try { setx PLAYWRIGHT_BROWSERS_PATH $PlaywrightRoot | Out-Null } catch {}
}

function Get-NodeVersion {
  $node = Get-Command node -ErrorAction SilentlyContinue
  $npm = Get-Command npm -ErrorAction SilentlyContinue
  if (-not $node -or -not $npm) { return $null }
  try {
    return [version]((& node -p "process.versions.node").Trim())
  } catch {
    return $null
  }
}

function Ensure-Node {
  $required = [version]$NodeVersion
  $installed = Get-NodeVersion
  if ($installed -and $installed -ge $required) {
    Write-Host "Node $installed and npm are already available." -ForegroundColor Green
    return
  }

  Write-Step "Installing portable Node.js $NodeVersion on D:"
  if (-not (Test-Path (Join-Path $NodeRoot "node.exe"))) {
    $zipPath = Join-Path $TempRoot "$NodeFolder.zip"
    $nodeUrl = "https://nodejs.org/dist/v$NodeVersion/$NodeFolder.zip"
    Invoke-WebRequest -Uri $nodeUrl -OutFile $zipPath
    if (Test-Path $NodeRoot) { Remove-Item $NodeRoot -Recurse -Force }
    Expand-Archive -Path $zipPath -DestinationPath $ToolsRoot -Force
    Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
  }

  $env:Path = "$NodeRoot;$env:Path"
  $installed = Get-NodeVersion
  if (-not $installed -or $installed -lt $required) {
    throw "Portable Node.js/npm could not be started from $NodeRoot."
  }
  Write-Host "Portable Node $installed ready at $NodeRoot" -ForegroundColor Green
}

function Get-Git {
  return Get-Command git -ErrorAction SilentlyContinue
}

function Download-RepositoryZip {
  Write-Step "Git is not installed; downloading the repository ZIP directly to D:"
  $zipPath = Join-Path $TempRoot "ai-action-browser-main.zip"
  $extractRoot = Join-Path $TempRoot "repo-extract"
  Remove-Item $extractRoot -Recurse -Force -ErrorAction SilentlyContinue
  Ensure-Directory $extractRoot
  Invoke-WebRequest -Uri $RepoZipUrl -OutFile $zipPath
  Expand-Archive -Path $zipPath -DestinationPath $extractRoot -Force
  $source = Join-Path $extractRoot "ai-action-browser-main"
  if (-not (Test-Path $source)) { throw "Repository ZIP did not contain the expected folder." }
  if (Test-Path $ProjectRoot) { Remove-Item $ProjectRoot -Recurse -Force }
  Move-Item $source $ProjectRoot
  Remove-Item $extractRoot -Recurse -Force -ErrorAction SilentlyContinue
  Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
}

function Ensure-Repository {
  Write-Step "Getting AI Action Browser into $ProjectRoot"
  $git = Get-Git

  if (Test-Path (Join-Path $ProjectRoot ".git")) {
    if (-not $git) {
      Write-Warning "Existing Git checkout found, but Git is unavailable. Keeping the existing checkout."
      return
    }
    & git -C $ProjectRoot fetch origin main
    & git -C $ProjectRoot checkout main
    & git -C $ProjectRoot pull --ff-only origin main
    if ($LASTEXITCODE -ne 0) { throw "Git update failed. Resolve local changes and run the launcher again." }
    return
  }

  if (Test-Path $ProjectRoot) {
    Write-Warning "A non-Git project folder already exists at $ProjectRoot. It will be kept as-is."
    return
  }

  if ($git) {
    & git clone --branch main --single-branch $RepoUrl $ProjectRoot
    if ($LASTEXITCODE -ne 0) { throw "Git clone failed." }
  } else {
    Download-RepositoryZip
  }
}

function Invoke-NpmCi([string]$WorkingDirectory) {
  Push-Location $WorkingDirectory
  try {
    & npm ci --ignore-scripts
    if ($LASTEXITCODE -ne 0) { throw "npm ci failed in $WorkingDirectory" }
  } finally {
    Pop-Location
  }
}

function Configure-LocalFiles {
  Write-Step "Configuring local API/Web connection"

  $apiVars = Join-Path $ApiRoot ".dev.vars"
  if (-not (Test-Path $apiVars)) {
    @"
BRAVE_SEARCH_API_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=
PROVIDER_ADMIN_TOKEN=local-only-change-me
PROVIDER_WEBHOOK_SECRET=local-only-change-me-too
ALLOWED_ORIGIN=http://127.0.0.1:5173,http://localhost:5173
"@ | Set-Content -Path $apiVars -Encoding ascii
  } else {
    $content = Get-Content $apiVars -Raw
    if ($content -match '(?m)^ALLOWED_ORIGIN=.*$') {
      $content = [regex]::Replace($content, '(?m)^ALLOWED_ORIGIN=.*$', 'ALLOWED_ORIGIN=http://127.0.0.1:5173,http://localhost:5173')
    } else {
      $content = $content.TrimEnd() + "`r`nALLOWED_ORIGIN=http://127.0.0.1:5173,http://localhost:5173`r`n"
    }
    Set-Content -Path $apiVars -Value $content -Encoding ascii
  }

  $webEnv = Join-Path $WebRoot ".env.local"
  "VITE_API_BASE_URL=http://127.0.0.1:8787" | Set-Content -Path $webEnv -Encoding ascii
}

function Apply-LocalDatabaseMigrations {
  Write-Step "Preparing local D1 database on D:"
  Push-Location $ApiRoot
  try {
    & npm run db:migrate:local
    if ($LASTEXITCODE -ne 0) { throw "Local D1 migration failed." }
  } finally {
    Pop-Location
  }
}

function Get-PowerShellExecutable {
  $pwsh = Get-Command pwsh -ErrorAction SilentlyContinue
  if ($pwsh) { return $pwsh.Source }
  $windowsPowerShell = Get-Command powershell -ErrorAction SilentlyContinue
  if ($windowsPowerShell) { return $windowsPowerShell.Source }
  throw "No PowerShell executable was found for launching the development servers."
}

function Start-DevWindow([string]$Title, [string]$WorkingDirectory, [string]$Command) {
  $psExe = Get-PowerShellExecutable
  $safeName = ($Title -replace '[^A-Za-z0-9_-]', '-')
  $childScript = Join-Path $TempRoot "$safeName.ps1"
  @"
`$Host.UI.RawUI.WindowTitle = '$Title'
`$env:TEMP = '$TempRoot'
`$env:TMP = '$TempRoot'
`$env:NPM_CONFIG_CACHE = '$NpmCache'
`$env:PLAYWRIGHT_BROWSERS_PATH = '$PlaywrightRoot'
`$env:Path = '$NodeRoot;' + `$env:Path
Set-Location '$WorkingDirectory'
$Command
"@ | Set-Content -Path $childScript -Encoding ascii

  Start-Process -FilePath $psExe -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-File", $childScript
  ) -WorkingDirectory $WorkingDirectory | Out-Null
}

function Wait-ForWeb {
  Write-Step "Waiting for the local browser UI"
  for ($i = 0; $i -lt 60; $i++) {
    try {
      $response = Invoke-WebRequest -Uri "http://127.0.0.1:5173" -UseBasicParsing -TimeoutSec 2
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) { return $true }
    } catch {}
    Start-Sleep -Seconds 1
  }
  return $false
}

function Open-ExtensionPage {
  if (Test-Path $ExtensionRoot) {
    try { Set-Clipboard -Value $ExtensionRoot } catch {}
  }

  $chromeCandidates = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
  ) | Where-Object { $_ -and (Test-Path $_) }

  if ($chromeCandidates.Count -gt 0) {
    Start-Process $chromeCandidates[0] "chrome://extensions/" | Out-Null
    return
  }

  $edgeCandidates = @(
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
  ) | Where-Object { $_ -and (Test-Path $_) }

  if ($edgeCandidates.Count -gt 0) {
    Start-Process $edgeCandidates[0] "edge://extensions/" | Out-Null
  }
}

try {
  Require-DDrive
  Configure-DDriveEnvironment
  Ensure-Node
  Ensure-Repository

  if (-not (Test-Path $ApiRoot) -or -not (Test-Path $WebRoot)) {
    throw "The repository layout is incomplete. Expected apps\api and apps\web under $ProjectRoot."
  }

  Write-Step "Installing API dependencies on D:"
  Invoke-NpmCi $ApiRoot

  Write-Step "Installing Web dependencies on D:"
  Invoke-NpmCi $WebRoot

  Configure-LocalFiles
  Apply-LocalDatabaseMigrations

  Write-Step "Starting local API and Web servers"
  Start-DevWindow "AI Action Browser API" $ApiRoot "npm run dev -- --port 8787"
  Start-Sleep -Seconds 2
  Start-DevWindow "AI Action Browser Web" $WebRoot "npm run dev -- --host 127.0.0.1 --port 5173"

  if (Wait-ForWeb) {
    Start-Process "http://127.0.0.1:5173" | Out-Null
  } else {
    Write-Warning "The Web server did not answer within 60 seconds. Check the two server windows for an error."
  }

  Open-ExtensionPage

  Write-Host ""
  Write-Host "READY" -ForegroundColor Green
  Write-Host "Web:       http://127.0.0.1:5173"
  Write-Host "API:       http://127.0.0.1:8787"
  Write-Host "Project:   $ProjectRoot"
  Write-Host "Extension: $ExtensionRoot"
  Write-Host "npm cache: $NpmCache"
  Write-Host "Temp:      $TempRoot"
  Write-Host "Playwright cache (future tests): $PlaywrightRoot"
  Write-Host ""
  Write-Host "Chrome/Edge extension page was opened when possible. Turn on Developer mode, click Load unpacked, then paste the Extension path above (it is also copied to the clipboard)."
  Write-Host ""
  Write-Host "Live Search needs a BRAVE_SEARCH_API_KEY in: $ApiRoot\.dev.vars"
  Write-Host "Without that key, the UI still starts, but live Search will correctly report that search is not configured."
} catch {
  Write-Host ""
  Write-Host "SETUP FAILED" -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red
  Write-Host "Everything this launcher creates is intended to stay on D:."
  exit 1
}
