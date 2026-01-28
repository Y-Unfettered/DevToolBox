param(
  [string]$Message = "Update data"
)

Write-Host "Exporting JSON..."
npm run export
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Staging data/devtoolbox.json..."
git add data/devtoolbox.json
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$status = git status --porcelain
if (-not $status) {
  Write-Host "No changes to commit."
  exit 0
}

Write-Host "Committing..."
git commit -m $Message
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Pushing..."
git push
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Done."
