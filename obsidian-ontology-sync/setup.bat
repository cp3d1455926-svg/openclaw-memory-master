@echo off
echo ========================================
echo  Obsidian-Ontology Sync 定时任务设置
echo ========================================
echo.

REM 创建同步批处理文件
echo 创建同步脚本...
(
echo @echo off
echo $env:PYTHONUTF8=1
echo python "C:\Users\shenz\.openclaw\workspace\skills\obsidian-ontology-sync\scripts\sync.py" extract
) > "C:\Users\shenz\.openclaw\workspace\skills\obsidian-ontology-sync\run-sync.bat"

echo.
echo 同步脚本已创建：run-sync.bat
echo.
echo 手动运行同步：
echo   run-sync.bat
echo.
echo 设置 Windows 任务计划程序（每 3 小时运行一次）：
echo   schtasks /Create /TN "ObsidianOntologySync" /TR "C:\Users\shenz\.openclaw\workspace\skills\obsidian-ontology-sync\run-sync.bat" /SC HOURLY /MO 3 /RL HIGHEST
echo.
echo 查看任务状态：
echo   schtasks /Query /TN "ObsidianOntologySync"
echo.
echo 删除任务：
echo   schtasks /Delete /TN "ObsidianOntologySync" /F
echo.
pause
