from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework import status


User = get_user_model()


class EmailOrUsernameAuthToken(ObtainAuthToken):
    """
    Permite autenticación usando username o email.
    """

    def post(self, request, *args, **kwargs):
        username = request.data.get("username") or ""
        password = request.data.get("password") or ""

        if not username or not password:
            return Response({"detail": "Credenciales requeridas."}, status=status.HTTP_400_BAD_REQUEST)

        user = None
        try:
            user = User.objects.get(Q(username__iexact=username) | Q(email__iexact=username))
        except User.DoesNotExist:
            pass

        if user and user.check_password(password):
            token, created = Token.objects.get_or_create(user=user)
            return Response({"token": token.key, "username": user.username})

        return Response({"detail": "Credenciales inválidas."}, status=status.HTTP_400_BAD_REQUEST)
