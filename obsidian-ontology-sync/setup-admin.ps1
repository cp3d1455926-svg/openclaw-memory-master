#Requires -RunAsAdministrator

# Obsidian-Ontology Sync 定时任务安装脚本（管理员权限）

$taskName = "ObsidianOntologySync"
$taskPath = "C:\Users\shenz\.openclaw\workspace\skills\obsidian-ontology-sync\run-sync.bat"
$triggerTime = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Hours 3)

Write-Host "========================================"
Write-Host " Obsidian-Ontology Sync 定时任务安装"
Write-Host "========================================"
Write-Host ""

# 检查是否已存在
$existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "⚠️  检测到已有任务，正在删除..."
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# 创建新任务
Write-Host "📅 创建每 3 小时运行的定时任务..."
$action = New-ScheduledTaskAction -Execute $taskPath
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Hours 3) -RepetitionDuration ([TimeSpan]::MaxValue)
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable -WakeToRun
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal

Write-Host ""
Write-Host "✅ 定时任务创建成功！"
Write-Host ""
Write-Host "任务名称：$taskName"
Write-Host "运行频率：每 3 小时"
Write-Host "脚本路径：$taskPath"
Write-Host ""
Write-Host "查看任务状态："
Write-Host "  Get-ScheduledTask -TaskName $taskName"
Write-Host ""
Write-Host "查看任务历史："
Write-Host "  Get-ScheduledTaskInfo -TaskName $taskName"
Write-Host ""
Write-Host "删除任务："
Write-Host "  Unregister-ScheduledTask -TaskName $taskName -Confirm:`$false"
Write-Host ""
Write-Host "按任意键退出..."
Pause
