# AI Recipe Recommender

An AI-powered full-stack web application that recommends recipes based on ingredients entered by the user. The project combines Machine Learning, Natural Language Processing (NLP), Django REST Framework, and React to provide personalized recipe recommendations along with YouTube cooking tutorials.

## Features

* AI-based recipe recommendation
* Ingredient-based recipe search
* TF-IDF text vectorization
* Nearest Neighbors recommendation algorithm
* User authentication
* Save favorite recipes
* Recipe comments
* YouTube cooking tutorial integration
* RESTful API architecture
* Responsive React user interface

## Tech Stack

### Frontend

* React.js
* Axios
* HTML
* CSS
* JavaScript

### Backend

* Django
* Django REST Framework
* SQLite

### Machine Learning

* Scikit-learn
* Pandas
* NumPy
* TF-IDF Vectorizer
* Nearest Neighbors Algorithm

### APIs

* YouTube Data API v3

## Machine Learning Workflow

1. Collect recipe dataset
2. Clean ingredient data
3. TF-IDF Vectorization
4. Train Nearest Neighbors model
5. Compute cosine similarity
6. Recommend the most relevant recipes
7. Display YouTube cooking tutorials

## Project Structure

```
backend/
frontend/
core/
manage.py
requirements.txt
README.md
```

## Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/AI-Recipe-Recommender.git
```

### Backend

```bash
python -m venv venv
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Machine Learning Model Files

Large serialized model files (.pkl) are not included in this repository because they exceed GitHub's file size limit.

Download them separately and place them inside the `core/` directory before running the project.

## Future Improvements

* Deep Learning recommendation models
* Personalized user preferences
* Nutrition analysis
* Meal planning
* Recipe image recognition
* Mobile application
* Docker deployment

## Team Members

- Syeda Maleeha Bano Naqvi
- Laiba Tauseef

## Author

Syeda Maleeha Bano Naqvi
BS Computer Science
Bahria University Islamabad
