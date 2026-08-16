
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Expert
from .utils import extract_text

import requests
from io import BytesIO
from .utils import extract_text
@receiver(post_save, sender=Expert)
def save_resume_text(sender, instance, created, **kwargs):
    # Re-extract on every save that has a CV attached - not just the first -
    # so replacing an out-of-date CV also replaces its searchable text. The
    # write-back below uses .update(), which is queryset-level and does not
    # re-fire post_save, so this cannot loop.
    if instance.cv_file:
        try:
            # Read through the storage backend rather than fetching the URL:
            # local storage serves relative URLs that requests cannot resolve.
            with instance.cv_file.open('rb') as fh:
                file_bytes = BytesIO(fh.read())
            text = extract_text(file_bytes, filename=instance.cv_file.name)
            if instance.resume_text != text:
                instance.resume_text = text
                Expert.objects.filter(pk=instance.pk).update(resume_text=text)
        except Exception as e:
            print(f"Error extracting text: {e}")