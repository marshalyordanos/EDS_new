import os
import zipfile
import subprocess
from datetime import datetime

from django.core.management.base import BaseCommand
from django.conf import settings


class Command(BaseCommand):
    help = 'Backs up PostgreSQL DB and CV files'

    def handle(self, *args, **options):
        BASE_DIR = settings.BASE_DIR
        BACKUP_DIR = os.path.join(BASE_DIR, 'backups')
        MEDIA_ROOT = settings.MEDIA_ROOT or os.path.join(BASE_DIR, 'media')
        CV_FOLDER = os.path.join(MEDIA_ROOT, 'cvs')
        DB_BACKUP_FILE = os.path.join(BASE_DIR, 'db_backup.sql')

        # Use credentials from your settings.py
        db_name = settings.DATABASES['default']['NAME']
        db_user = settings.DATABASES['default']['USER']
        db_password = settings.DATABASES['default']['PASSWORD']
        db_host = settings.DATABASES['default']['HOST']
        db_port = settings.DATABASES['default']['PORT']

        os.environ['PGPASSWORD'] = db_password
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
        zip_filename = os.path.join(BACKUP_DIR, f'full_backup_{timestamp}.zip')
        os.makedirs(BACKUP_DIR, exist_ok=True)

        dump_cmd = [
            'pg_dump',
            '-U', db_user,
            '-h', db_host,
            '-p', str(db_port),
            '-f', DB_BACKUP_FILE,
            db_name
        ]

        try:
            subprocess.run(dump_cmd, check=True)
            self.stdout.write("[✔] Database dump created.")
        except Exception as e:
            self.stderr.write(f"[❌] Database backup failed: {e}")
            return

        with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
            zipf.write(DB_BACKUP_FILE, 'db_backup.sql')
            for root, dirs, files in os.walk(CV_FOLDER):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, CV_FOLDER)
                    zipf.write(file_path, os.path.join('cv', arcname))

        os.remove(DB_BACKUP_FILE)
        self.stdout.write(f"[✔] Backup created: {zip_filename}")

        backups = sorted(
            [os.path.join(BACKUP_DIR, f) for f in os.listdir(BACKUP_DIR) if f.endswith(".zip")],
            key=os.path.getctime
        )
        if len(backups) > 8:
            for old in backups[:-8]:
                os.remove(old)
                self.stdout.write(f"[🗑] Deleted old backup: {old}")

        self.stdout.write(self.style.SUCCESS("Backup process complete."))