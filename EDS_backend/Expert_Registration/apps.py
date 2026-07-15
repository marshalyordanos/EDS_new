from django.apps import AppConfig


class ExpertRegistrationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Expert_Registration'
    def ready(self):
        import Expert_Registration.signals