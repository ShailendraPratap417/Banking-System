Write-Host "==========================================================" -ForegroundColor Green
Write-Host "                AURABANK SYSTEMS STARTUP" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Starting Spring Boot API in a separate window..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; ..\maven_portable\bin\mvn.cmd spring-boot:run" -WindowStyle Normal

Write-Host "Starting React Frontend in a separate window..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH = 'C:\Users\Shailendra Pratap\OneDrive\Documents\Desktop\Banking_system\node_portable;' + `$env:PATH; cd frontend; npm run dev" -WindowStyle Normal

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Both processes have been launched!" -ForegroundColor Green
Write-Host "- Backend API: http://localhost:8080" -ForegroundColor Gray
Write-Host "- Frontend App: http://localhost:5173" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Green
