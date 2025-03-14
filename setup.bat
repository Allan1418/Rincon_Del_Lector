
@echo off

rem configuracion django
echo Verificando instalacion de Python...
where python > nul 2>&1
if %errorlevel% neq 0 (
  echo Python no esta instalado. Por favor, instale Python y agreguelo a su PATH.
  pause
  exit /b 1
)


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

rem configuaricon React






rem creacion archios de configuracion para conexiones
echo Copiando archivos de configuaricon...
if not exist "connections" (
  mkdir "connections"
)

copy "templates\mysqlConnection.json" "connections\mysqlConnection.json"

echo Archivos de configuaricon copiados correctamente.

echo Proyecto configuardo correctamente.
pause