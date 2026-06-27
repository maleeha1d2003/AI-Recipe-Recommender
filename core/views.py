from rest_framework.views import APIView
from rest_framework.response import Response
from .recommendation import get_recommendations 
from rest_framework import status
from rest_framework.decorators import api_view
from .serializers import UserSerializer, FavoriteRecipeSerializer
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import FavoriteRecipe, Comment

class RecommendView(APIView):
    def post(self, request):
        ingredients = request.data.get('ingredients', '')
        priority = request.data.get('priority', 'None')
        results = get_recommendations(ingredients, priority)
        return Response(results)

@api_view(['POST'])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        return Response({"message": "Login successful", "user_id": user.id})
    return Response({"error": "Invalid Credentials"}, status=status.HTTP_401_UNAUTHORIZED)

# --- COMMENT CRUD ---
@api_view(['GET', 'POST'])
def handle_comments(request):
    if request.method == 'GET':
        recipe_name = request.query_params.get('recipe_name')
        comments = Comment.objects.filter(recipe_name=recipe_name)
        data = [{"user": c.user.username, "content": c.content, "rating": c.rating} for c in comments]
        return Response(data)
    
    if request.method == 'POST':
        try:
            user = User.objects.get(id=request.data.get('user_id'))
            comment = Comment.objects.create(
                user=user,
                recipe_name=request.data.get('recipe_name'),
                content=request.data.get('content'),
                rating=request.data.get('rating')
            )
            return Response({"message": "Comment added!"}, status=status.HTTP_201_CREATED)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

# --- FAVORITES CRUD ---
@api_view(['POST', 'GET', 'DELETE'])
def handle_favorites(request, pk=None):
    # CREATE FAVORITE
    if request.method == 'POST':
        serializer = FavoriteRecipeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        # This will return {recipe_id: ["This field must be unique"]} if duplicate
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    # LIST FAVORITES
    if request.method == 'GET':
        user_id = request.query_params.get('user_id')
        favorites = FavoriteRecipe.objects.filter(user_id=user_id)
        serializer = FavoriteRecipeSerializer(favorites, many=True)
        return Response(serializer.data)
    
    # REMOVE FAVORITE
    if request.method == 'DELETE':
        # Retrieve user_id from body or query params
        user_id = request.data.get('user') or request.query_params.get('user')
        
        if not user_id:
            return Response({"error": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Use the ID from the URL (pk) which is the recipe_id we want to remove
        if pk:
            deleted_count, _ = FavoriteRecipe.objects.filter(recipe_id=pk, user_id=user_id).delete()
            if deleted_count > 0:
                return Response({"message": "Removed from favorites"}, status=status.HTTP_204_NO_CONTENT)
            else:
                return Response({"error": "Favorite not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response({"error": "No recipe ID (pk) provided in URL"}, status=status.HTTP_400_BAD_REQUEST)

    return Response({"error": "Method not allowed"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)