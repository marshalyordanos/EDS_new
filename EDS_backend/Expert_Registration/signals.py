
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Expert
from .utils import extract_text

import requests
from io import BytesIO
from .utils import extract_text
@receiver(post_save, sender=Expert)
def save_resume_text(sender, instance, created, **kwargs):
    if instance.cv_file and (created or not instance.resume_text):
        try:
            response = requests.get(instance.cv_file.url)
            response.raise_for_status()
            file_bytes = BytesIO(response.content)
            text = extract_text(file_bytes, filename=instance.cv_file.name)
            if instance.resume_text != text:
                instance.resume_text = text
                Expert.objects.filter(pk=instance.pk).update(resume_text=text)
        except Exception as e:
            print(f"Error extracting text: {e}")