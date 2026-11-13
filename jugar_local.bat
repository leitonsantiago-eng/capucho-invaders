@echo off
title Capucho Invaders - Servidor Local Offline
cd /d "%~dp0"

where python >nul 2>nul
if %errorlevel%==0 (
    python jugar_local.py
    goto :eof
)

where py >nul 2>nul
if %errorlevel%==0 (
    py -3 jugar_local.py
    goto :eof
)

echo ====================================================================
echo  No se encontro Python instalado en este equipo.
echo  Para jugar con modulos ES6 en modo local sin internet:
echo   1. Instala Python 3 desde https://www.python.org/ (o usa VS Code Live Server).
echo   2. Ejecuta nuevamente este archivo jugar_local.bat.
echo ====================================================================
pause
