from django.db import models
from django.contrib.auth.models import User

class FavoriteRecipe(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    recipe_id = models.IntegerField()
    name = models.CharField(max_length=255)
    ingredients = models.TextField(default="[]")  # Add this
    steps = models.TextField(default="[]")        # Add this
    created_at = models.DateTimeField(auto_now_add=True)

class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    recipe_name = models.CharField(max_length=255)
    content = models.TextField()
    rating = models.IntegerField(default=5)