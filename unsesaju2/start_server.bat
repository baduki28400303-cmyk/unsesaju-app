@echo off
echo 운세사주 앱 서버를 시작합니다...
echo.
cd /d "%~dp0"
python -m http.server 8080 2>nul
if errorlevel 1 (
    python3 -m http.server 8080 2>nul
    if errorlevel 1 (
        echo Python이 설치되어 있지 않습니다.
        echo 아래 주소로 직접 열어보세요:
        pause
    )
)
