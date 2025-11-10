@echo off
echo ========================================
echo Android模拟器网络配置脚本
echo ========================================
echo.

echo [1/5] 检查模拟器连接...
adb devices
if %errorlevel% neq 0 (
    echo 错误：无法连接模拟器，请确保模拟器正在运行
    pause
    exit /b 1
)
echo.

echo [2/5] 启用WiFi...
adb shell svc wifi enable
timeout /t 2 /nobreak >nul
echo.

echo [3/5] 配置DNS服务器...
adb shell settings put global private_dns_mode off
timeout /t 1 /nobreak >nul
echo.

echo [4/5] 重启WiFi服务...
adb shell svc wifi disable
timeout /t 2 /nobreak >nul
adb shell svc wifi enable
timeout /t 3 /nobreak >nul
echo.

echo [5/5] 测试网络连接...
adb shell ping -c 3 8.8.8.8
echo.

echo ========================================
echo 配置完成！
echo ========================================
echo.
echo 如果ping测试失败，请尝试：
echo 1. 重启模拟器
echo 2. 在Android Studio中重新配置AVD网络设置
echo 3. 检查Windows防火墙设置
echo.
pause


