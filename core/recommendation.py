import pickle
import pandas as pd
import os
from django.conf import settings
from googleapiclient.discovery import build

# --- CONFIG ---
YOUTUBE_API_KEY = "YOUR_API_KEY_HERE"
SIMILARITY_THRESHOLD = 0.05

# Get the path to the core folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# --- LOAD FILES ONCE ---
def load_ml_assets():
    vectorizer = pickle.load(open(os.path.join(BASE_DIR, "vectorizer (1).pkl"), "rb"))
    tfidf = pickle.load(open(os.path.join(BASE_DIR, "tfidf_matrix (1).pkl"), "rb"))
    model = pickle.load(open(os.path.join(BASE_DIR, "nn_model (1).pkl"), "rb"))
    df = pd.read_pickle(os.path.join(BASE_DIR, "recipes_df (1).pkl"))
    return vectorizer, tfidf, model, df

vectorizer, tfidf, model, df = load_ml_assets()

# --- YOUTUBE HELPER ---
def get_youtube_video(query):
    try:
        youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)
        request = youtube.search().list(
            q=query + " recipe tutorial",
            part="snippet",
            maxResults=1,
            type="video"
        )
        response = request.execute()
        
        if response.get("items"):
            item = response["items"][0]
            return {
                "video_id": item["id"]["videoId"],
                "title": item["snippet"]["title"],
                "thumbnail": item["snippet"]["thumbnails"]["medium"]["url"]
            }
            
    except Exception as e:
        print(f"❌ YOUTUBE API ERROR: {e}")
    
    return {
        "video_id": None, 
        "search_query": query.replace(" ", "+"),
        "thumbnail": "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    }

def get_recommendations(user_input, priority="None"):
    if not user_input.strip():
        return []

    # Preprocess input
    user_list = [i.lower().strip() for i in user_input.split(",")]
    user_text = " ".join(user_list)
    user_vec = vectorizer.transform([user_text])

    # Get Nearest Neighbors
    distances, indices = model.kneighbors(user_vec, n_neighbors=10)

    recommended = []
    for i, idx in enumerate(indices[0]):
        similarity = 1 - distances[0][i]
        
        if similarity <= 0 or similarity < SIMILARITY_THRESHOLD:
            continue 

        recipe = df.iloc[idx].copy()
        
        # Prepare recipe data - THE ID IS NOW INCLUDED HERE
        recipe_data = {
            "id": int(idx),  # Uses the DataFrame index as a unique ID
            "name": str(recipe["name"]).title(),
            "minutes": int(recipe["minutes"]),
            "avg_rating": float(recipe["avg_rating"]),
            "similarity": round(float(similarity) * 100, 2),
            "rating_count": int(recipe["rating_count"]),
            "clean_ingredients": recipe["clean_ingredients"] if isinstance(recipe["clean_ingredients"], list) else eval(str(recipe["clean_ingredients"])),
            "steps": eval(str(recipe["steps"])) if isinstance(recipe["steps"], str) else recipe["steps"],
            "nutrition": eval(str(recipe["nutrition"])) if isinstance(recipe["nutrition"], str) else recipe["nutrition"]
        }
        
        # Get YouTube data
        recipe_data["youtube"] = get_youtube_video(recipe_data["name"])
        
        recommended.append(recipe_data)

    # Sorting logic
    if priority == "Time":
        recommended.sort(key=lambda x: x["minutes"])
    elif priority == "Rating":
        recommended.sort(key=lambda x: x["avg_rating"], reverse=True)

    return recommended[:5]