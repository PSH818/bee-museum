@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title 蜂之境 · 局域网开发服务器 (4300)
cd /d "%~dp0"
echo.
echo  正在启动 蜂之境 开发服务器(局域网可访问,端口 4300)...
echo  关闭本窗口即停止服务器。
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4" ^| findstr /v "127.0.0.1"') do (
  set "ip=%%a"
  set "ip=!ip: =!"
  echo  手机访问: http://!ip!:4300/
)
echo.
call npm run dev:lan
pause
