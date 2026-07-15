from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()

class EmailBackend(ModelBackend):
    """
    Custom authentication backend that allows users to authenticate using their email address instead of username
    """
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)
        if username is None or password is None:
            return None
        
        try:
            user = User.objects.get(email=username)
        except User.DoesNotExist:
            User().set_password(password)
            return None
        
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
    
    async def aauthenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)
        if username is None or password is None:
            return None
        
        try:
            user = await User.objects.aget(email=username)
        except User.DoesNotExist:
            User().set_password(password)
            return None
        
        if await user.acheck_password(password) and self.user_can_authenticate(user):
            return user 