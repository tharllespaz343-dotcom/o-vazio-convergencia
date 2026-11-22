@echo off
setlocal EnableExtensions
cd /d "%~dp0"
echo ======================================================
echo O VAZIO: CONVERGENCIA - PUBLICACAO CORRIGIDA
 echo ======================================================
echo.
where git >nul 2>nul
if errorlevel 1 (
 echo ERRO: Git nao encontrado no PATH.
 pause
 exit /b 1
)
if not exist "%~dp0index.html" (
 echo ERRO: index.html nao encontrado. Extraia TODOS os arquivos do ZIP primeiro.
 pause
 exit /b 1
)
if not exist "%~dp0assets\demo_cards.json" (
 echo ERRO: pasta assets incompleta. Extraia TODOS os arquivos do ZIP.
 pause
 exit /b 1
)
set "REPO=https://github.com/tharllespaz343-dotcom/o-vazio-convergencia.git"
set "DEST=%TEMP%\ovazio-publicacao-%RANDOM%-%RANDOM%"
echo [1/4] Baixando repositorio...
git clone "%REPO%" "%DEST%"
if errorlevel 1 goto failclone
echo.
echo [2/4] Copiando arquivos do site sem alterar .git...
set "OVAZIO_SRC=%~dp0"
set "OVAZIO_DEST=%DEST%"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $src=$env:OVAZIO_SRC; $dest=$env:OVAZIO_DEST; $files=@('index.html','editor.html','duelo.html','site.js','.nojekyll','README.md','PUBLICAR.md','LEIA_PRIMEIRO.txt','INICIAR_LOCAL.bat','PUBLICAR_NO_GITHUB.bat'); foreach($f in $files){$p=Join-Path $src $f; if(Test-Path -LiteralPath $p){Copy-Item -LiteralPath $p -Destination (Join-Path $dest $f) -Force -ErrorAction Stop; Write-Host ('OK: '+$f)}}; $assets=Join-Path $src 'assets'; if(!(Test-Path -LiteralPath $assets -PathType Container)){throw 'Pasta assets ausente'}; Copy-Item -LiteralPath $assets -Destination $dest -Recurse -Force -ErrorAction Stop; Write-Host 'OK: assets'; if(!(Test-Path (Join-Path $dest 'assets\demo_cards.json'))){throw 'Arquivos de assets ausentes'}"
if errorlevel 1 goto failcopy
 echo.
echo [3/4] Preparando commit...
git -C "%DEST%" add -A
if errorlevel 1 goto failcopy
git -C "%DEST%" diff --cached --quiet
if not errorlevel 1 goto nothing
 git -C "%DEST%" commit -m "Publicar site integrado O Vazio Convergencia"
if errorlevel 1 goto failcommit
echo.
echo [4/4] Enviando para GitHub...
git -C "%DEST%" push origin HEAD:main
if errorlevel 1 goto failpush
 echo.
echo SUCESSO! Arquivos enviados ao GitHub.
start "" "https://github.com/tharllespaz343-dotcom/o-vazio-convergencia"
pause
exit /b 0
:nothing
echo Nenhuma alteracao para enviar. Arquivos ja podem estar publicados.
pause
exit /b 0
:failclone
echo ERRO ao baixar repositorio. Confira autenticacao e internet.
pause
exit /b 1
:failcopy
echo ERRO ao copiar arquivos. Veja o erro mostrado acima.
echo Nada foi enviado ao GitHub.
pause
exit /b 1
:failcommit
echo ERRO ao criar commit. Configure nome e email do Git se solicitado.
pause
exit /b 1
:failpush
echo ERRO ao enviar. Verifique permissao e mensagens acima.
pause
exit /b 1
