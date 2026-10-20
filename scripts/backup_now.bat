@echo off
cd /d "%~dp0\.."
echo Taking verified hot snapshot of ApexOps primary database...
python -c "from operations.backups.backup_manager import BackupManager; res = BackupManager.create_backup('Manual CLI snapshot'); print('BACKUP STATUS:', res)"
pause
