# usuarios/views.py
from dj_rest_auth.registration.views import RegisterView
from .serializers import CustomRegisterSerializer
from rest_framework.generics import RetrieveAPIView, ListAPIView
from rest_framework.permissions import AllowAny
from rest_framework.viewsets import GenericViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Usuario
from .serializers import PublicUserSerializer, PublicShortUserSerializer
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes, extend_schema_view




class CustomRegisterView(RegisterView):
    serializer_class = CustomRegisterSerializer

class UserRetrieveView(RetrieveAPIView):
    serializer_class = PublicUserSerializer
    permission_classes = [AllowAny]
    lookup_field = "username"
    queryset = Usuario.objects.all()


@extend_schema_view(
    get=extend_schema(
        parameters=[
            OpenApiParameter(
                name='q',
                description='Texto de busqueda para filtrar usuarios por nombre de usuario sin matchcase.',
                required=False,
                type=OpenApiTypes.STR,
            ),
        ]
    )
)
class UserSearchView(ListAPIView):
    serializer_class = PublicUserSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        query = self.request.query_params.get("q", "")
        return Usuario.objects.filter(username__icontains=query)



class UserRelationshipViewSet(GenericViewSet):
    queryset = Usuario.objects.all()
    serializer_class = PublicShortUserSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'username'

    @action(detail=True, methods=['post'])
    def follow(self, request, username=None):
        user_to_follow = get_object_or_404(Usuario, username=username)
        
        if request.user == user_to_follow:
            return Response(
                {'detail': 'No puedes seguirte a ti mismo'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if request.user.following.filter(pk=user_to_follow.pk).exists():
            return Response(
                {'detail': 'Ya sigues a este usuario'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        request.user.following.add(user_to_follow)
        return Response({'status': 'success'}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'])
    def unfollow(self, request, username=None):
        user_to_unfollow = get_object_or_404(Usuario, username=username)
        request.user.following.remove(user_to_unfollow)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def following_list(self, request):
        users = request.user.following.all()
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def followers_list(self, request):
        users = request.user.followers.all()
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)