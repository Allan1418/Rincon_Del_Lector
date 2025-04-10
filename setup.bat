
@echo off

rem Verificacion de Python
echo Verificando instalacion de Python...
where python > nul 2>&1
if %errorlevel% neq 0 (
  echo Python no esta instalado. Por favor, instale Python y agreguelo a su PATH.
  pause
  exit /b 1
)

rem Verificacion Node JS

echo Verificando si Node.js está instalado...
where node > nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js no esta instalado. Por favor, instale Node.js y agreguelo a su PATH.
    echo Puede descargar el instalador desde: https://nodejs.org/en/download
    pause
    exit /b 1
)


rem configuracion django

rmdir /s /q BACKEND\venv

echo Creando entorno virtual en BACKEND...
python -m venv BACKEND\venv

echo Activando entorno virtual...
call BACKEND\venv\Scripts\activate.bat

echo Instalando dependencias desde BACKEND\requirements.txt...
pip install -r BACKEND\requirements.txt

echo Entorno virtual creado y dependencias instaladas.

echo Desactivando entorno virtual...
call deactivate


rem configuracion React

pushd FRONTEND

echo Verificando version de npm...
call npm -v

echo Verificando si existe la carpeta node_modules y borrandola si existe...
rmdir /s /q node_modules

echo Instalando dependencias del proyecto FRONTEND...
call npm install

echo Instalando librería router en FRONTEND...
call npm install react-router-dom

echo Instalando librería pdf en FRONTEND...
call npm install react-pdf pdfjs-dist

echo Istalando libreria de iconos FRONTEND...
call npm i react-icons

echo Instalando Bootstrap 5.3.3 en FRONTEND...
call npm install bootstrap@5.3.3

echo Dependencias y Bootstrap instalados correctamente.
call npm install lucide-react

echo Biblioteca chart.js instalados correctamente.
call npm install chart.js

echo libreria classnames instalados correctamente
call npm install classnames
popd

pause

rem creacion archivos de configuracion para conexiones
echo Copiando archivos de configuaricon...
if not exist "connections" (
  mkdir "connections"
)

copy "templates\mysqlConnection.json" "connections\mysqlConnection.json"

echo Archivos de configuaricon copiados correctamente.

echo Proyecto configuardo correctamente.
pause