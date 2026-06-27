from django.urls import path
from . import views # Import views to use the views.function syntax
from .views import RecommendView, register_user, login_user, handle_comments, handle_favorites

urlpatterns = [
    path('recommend/', RecommendView.as_view(), name='recommend'),
    path('register/', register_user, name='register'),
    path('login/', login_user, name='login'),
    path('comments/', handle_comments, name='comments'),
    
    # Favorites - Standard path for GET (list) and POST (create)
    path('favorites/', handle_favorites, name='favorites'),
    
    # Favorites - ID path for DELETE (remove)
    path('favorites/<int:pk>/', handle_favorites, name='favorite-detail'),
]