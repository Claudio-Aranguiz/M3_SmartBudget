# Script para remover importaciones de variables en archivos SCSS
# Esto es necesario para migrar a Bootstrap SCSS

$files = @(
    "assets\sass\pages\_dashboard.scss",
    "assets\sass\pages\_historial.scss", 
    "assets\sass\layout\_hero.scss",
    "assets\sass\components\_transactions.scss",
    "assets\sass\components\_navigation.scss",
    "assets\sass\components\_header.scss",
    "assets\sass\components\_menu-icons.scss",
    "assets\sass\layout\_footer.scss",
    "assets\sass\layout\_auth.scss",
    "assets\sass\base\_reset.scss"
)

foreach ($file in $files) {
    Write-Host "Procesando: $file"
    
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Remover líneas que contengan @use "../abstracts/variables" as *;
        $newContent = $content -replace '@use\s+"\.\.\/abstracts\/variables"\s+as\s+\*;\s*\r?\n', ''
        $newContent = $newContent -replace '@use\s+''\.\.\/abstracts\/variables''\s+as\s+\*;\s*\r?\n', ''
        
        # Agregar comentario explicativo al inicio
        $comment = "// NOTA: Las variables ahora están disponibles globalmente desde Bootstrap en main.scss`r`n"
        $newContent = $comment + $newContent
        
        Set-Content $file $newContent -NoNewline
        Write-Host "✓ Actualizado: $file"
    } else {
        Write-Host "⚠ No encontrado: $file"
    }
}

Write-Host "✅ Todos los archivos procesados"