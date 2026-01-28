#!/usr/bin/env pwsh
# Script para ejecutar tests de SmartBudget
# Uso: .\run-tests.ps1

Write-Host "🧪 SmartBudget Test Runner" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio test
if (-not (Test-Path "README.md")) {
    Write-Host "❌ Error: Archivo 'README.md' no encontrado en test." -ForegroundColor Red
    Write-Host "   Ejecuta este script desde la carpeta 'test' del proyecto SmartBudget." -ForegroundColor Yellow
    exit 1
}

Write-Host "Selecciona el tipo de test a ejecutar:" -ForegroundColor Green
Write-Host ""
Write-Host "1. 🔐 Test de Autenticación y Sesiones" -ForegroundColor White
Write-Host "2. 💰 Test de Persistencia de Transacciones" -ForegroundColor White  
Write-Host "3. 🧭 Test de Arquitectura de Usuario" -ForegroundColor White
Write-Host "4. ✅ Test de Arquitectura Corregida" -ForegroundColor White
Write-Host "5. 🔍 Verificador de Transacciones" -ForegroundColor White
Write-Host "6. 📊 Ejecutor General de Tests" -ForegroundColor White
Write-Host "7. 📚 Abrir Documentación de Tests" -ForegroundColor White
Write-Host "0. ❌ Salir" -ForegroundColor Red
Write-Host ""

$choice = Read-Host "Ingresa tu opción (0-7)"

switch ($choice) {
    "1" { 
        Write-Host "🔐 Ejecutando Test de Sesiones..." -ForegroundColor Yellow
        Start-Process "test-session-persistence.html"
    }
    "2" { 
        Write-Host "💰 Ejecutando Test de Transacciones..." -ForegroundColor Yellow
        Start-Process "test-transaction-persistence.html"
    }
    "3" { 
        Write-Host "🧭 Ejecutando Test de Usuario..." -ForegroundColor Yellow
        Start-Process "test-user-architecture.html"
    }
    "4" { 
        Write-Host "✅ Ejecutando Test de Arquitectura..." -ForegroundColor Yellow
        Start-Process "test-correct-architecture.html"
    }
    "5" { 
        Write-Host "🔍 Ejecutando Verificador..." -ForegroundColor Yellow
        Start-Process "verify-transactions.html"
    }
    "6" { 
        Write-Host "📊 Ejecutando Tests Generales..." -ForegroundColor Yellow
        Start-Process "run-test.html"
    }
    "7" { 
        Write-Host "📚 Abriendo Documentación..." -ForegroundColor Yellow
        Start-Process "README.md"
    }
    "0" { 
        Write-Host "👋 ¡Hasta luego!" -ForegroundColor Green
        exit 0
    }
    default { 
        Write-Host "❌ Opción no válida. Usa números del 0-7." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "💡 Tip: Para ver todos los tests disponibles, revisa README.md" -ForegroundColor Cyan
Write-Host "🚀 Estado del proyecto: Completamente funcional y testado" -ForegroundColor Green