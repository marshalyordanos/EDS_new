from django_cron import CronJobBase, Schedule
from django.conf import settings
import os
import subprocess
import zipfile
from datetime import datetime

class BackupFullCronJob(CronJobBase):
    RUN_EVERY_MINS = 60 * 24 * 7  # weekly

    schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
    code = 'expert_registration.backup_full_cron'  # unique ID

    def do(self):
        BASE_DIR = settings.BASE_DIR
        MEDIA_ROOT = settings.MEDIA_ROOT or os.path.join(BASE_DIR, 'media')
        BACKUP_DIR = os.path.join(BASE_DIR, 'backups')
        CV_FOLDER = os.path.join(MEDIA_ROOT, 'cvs')
        DB_BACKUP_FILE = os.path.join(BASE_DIR, 'db_backup.sql')

        db_name = settings.DATABASES['default']['NAME']
        db_user = settings.DATABASES['default']['USER']
        db_password = settings.DATABASES['default']['PASSWORD']
        db_host = settings.DATABASES['default'].get('HOST', 'localhost')
        db_port = settings.DATABASES['default'].get('PORT', '5432')

        os.environ['PGPASSWORD'] = db_password
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
        zip_filename = os.path.join(BACKUP_DIR, f'full_backup_{timestamp}.zip')
        os.makedirs(BACKUP_DIR, exist_ok=True)

        # Dump PostgreSQL DB
        dump_cmd = ['pg_dump', '-U', db_user, '-h', db_host, '-p', str(db_port), '-f', DB_BACKUP_FILE, db_name]
        try:
            subprocess.run(dump_cmd, check=True)
        except Exception as e:
            print("[❌] DB Backup Failed:", e)
            return

        # Zip with CVs
        with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
            zipf.write(DB_BACKUP_FILE, 'db_backup.sql')
            for root, dirs, files in os.walk(CV_FOLDER):
                for file in files:
                    path = os.path.join(root, file)
                    arcname = os.path.relpath(path, CV_FOLDER)
                    zipf.write(path, os.path.join('cv', arcname))

        os.remove(DB_BACKUP_FILE)

        # Delete old backups
        backups = sorted(
            [os.path.join(BACKUP_DIR, f) for f in os.listdir(BACKUP_DIR) if f.endswith('.zip')],
            key=os.path.getctime
        )
        for old in backups[:-8]:
            os.remove(old)
            print(f"[🗑] Deleted old: {old}")
