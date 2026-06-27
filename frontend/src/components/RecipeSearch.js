import React, { useState } from 'react';
import { getRecommendations } from '../api';
import { Card, Row, Col, Badge, Accordion, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const RecipeSearch = () => {
    const [ingredients, setIngredients] = useState('');
    const [priority, setPriority] = useState('None');
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Ensure these match the order sent from recommendation.py
    const nutritionLabels = ["Calories", "Total Fat", "Sugar", "Sodium", "Protein", "Sat. Fat", "Carbs"];

    const handleSearch = async () => {
        const forbidden = ['petrol', 'diesel', 'oil', 'kerosene', 'gasoline'];
        const inputLower = ingredients.toLowerCase();
        
        if (forbidden.some(item => inputLower.includes(item))) {
            setError("❌ Invalid input: These are not edible ingredients. Please enter food items.");
            setRecipes([]);
            return;
        }

        setError(null);
        setLoading(true);
        try {
            const res = await getRecommendations({ ingredients, priority });
            setRecipes(res.data);
        } catch (err) {
            alert("Error fetching recommendations");
        }
        setLoading(false);
    };

    const handleSaveFavorite = async (recipe) => {
        const userId = localStorage.getItem('user_id');
        if (!userId) { alert("Please login first!"); return; }
        
        try {
            await axios.post('http://127.0.0.1:8000/api/favorites/', {
                user: parseInt(userId),
                recipe_id: recipe.id, 
                name: recipe.name,
                ingredients: JSON.stringify(recipe.clean_ingredients || []),
                steps: JSON.stringify(recipe.steps || [])
            });
            alert("✨ Recipe saved!");
        } catch (err) { 
            console.error("Save Error Details:", err.response?.data);
            alert("Save failed. This recipe might already be in your favorites."); 
        }
    };

    const handleRemoveFavorite = async (recipe) => {
        const userId = localStorage.getItem('user_id');
        if (!userId) { alert("Please login first!"); return; }
        
        try {
            // Hits the specific recipe PK endpoint: /api/favorites/<id>/
            await axios.delete(`http://127.0.0.1:8000/api/favorites/${recipe.id}/`, {
                data: { user: parseInt(userId) }
            });
            alert("🗑️ Removed!");
        } catch (err) { 
            console.error("Remove Error Details:", err.response?.data);
            alert("Failed to remove. Check if the recipe was actually saved first."); 
        }
    };

    const handlePrintRecipe = (e) => {
        const card = e.currentTarget.closest('.recipe-printable-card');
        document.body.classList.add('printing-single-recipe');
        card.classList.add('target-recipe');
        window.print();
        document.body.classList.remove('printing-single-recipe');
        card.classList.remove('target-recipe');
    };

    return (
        <div className="container mt-4">
            <h1 className="text-center mb-4 d-print-none">🔥 AI Kitchen Concierge</h1>
            
            <div className="card p-4 mb-4 shadow-sm d-print-none">
                <div className="row">
                    <div className="col-md-8">
                        <input 
                            type="text" className="form-control" 
                            placeholder="Enter ingredients (e.g., chicken, tomato)..." 
                            value={ingredients}
                            onChange={(e) => setIngredients(e.target.value)}
                        />
                    </div>
                    <div className="col-md-2">
                        <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                            <option value="None">No Priority</option>
                            <option value="Time">Time</option>
                            <option value="Rating">Rating</option>
                        </select>
                    </div>
                    <div className="col-md-2">
                        <button className="btn btn-success w-100" onClick={handleSearch} disabled={loading}>
                            {loading ? 'Searching...' : 'Recommend'}
                        </button>
                    </div>
                </div>
                {error && <Alert variant="danger" className="mt-3 mb-0">{error}</Alert>}
            </div>

            <Row>
                {recipes.map((recipe, index) => {
                    const nutrition = recipe.nutrition || [];
                    const ingList = recipe.clean_ingredients || [];
                    const stepList = recipe.steps || [];
                    const videoId = recipe.youtube?.video_id;
                    const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                    const videoLink = videoId ? `https://www.youtube.com/watch?v=${videoId}` : `https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.name)}`;

                    return (
                        <Col key={index} md={12} className="mb-4 recipe-printable-card">
                            <Card className="shadow-sm">
                                <Card.Body>
                                    <Row>
                                        <Col md={4} className="d-print-none">
                                            <div className="rounded overflow-hidden border bg-dark d-flex flex-column shadow-sm">
                                                <a href={videoLink} target="_blank" rel="noreferrer" className="d-block position-relative bg-black text-center" style={{ minHeight: '180px' }}>
                                                    <img src={thumbUrl} alt="" className="img-fluid" />
                                                    <div className="position-absolute top-50 start-50 translate-middle">
                                                        <div style={{ backgroundColor: 'rgba(255,0,0,0.9)', color: 'white', padding: '10px 20px', borderRadius: '10px' }}>▶</div>
                                                    </div>
                                                </a>
                                                <Button variant="danger" className="rounded-0 fw-bold" href={videoLink} target="_blank">WATCH ON YOUTUBE</Button>
                                            </div>
                                        </Col>

                                        <Col md={8} className="print-full-width">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <h3 className="h4 text-capitalize">{recipe.name}</h3>
                                                <div className="text-end d-print-none">
                                                    <Badge bg="success" className="d-block mb-1">🎯 {recipe.similarity}% Match</Badge>
                                                    <Badge bg="dark" className="d-block">📈 {recipe.rating_count || 0} reviews</Badge>
                                                </div>
                                            </div>
                                            
                                            <div className="mb-2">
                                                <Badge bg="warning" text="dark" className="me-2">⭐ {recipe.avg_rating}</Badge>
                                                <Badge bg="info" className="me-2">⏱️ {recipe.minutes}m</Badge>
                                            </div>

                                            <div className="mb-3 p-3 bg-light rounded border">
                                                <strong className="d-block mb-2 small text-uppercase">📊 Nutritional Value (Per Serving):</strong>
                                                <Row className="g-2">
                                                    {nutrition.length > 0 ? nutrition.slice(0, 7).map((val, i) => (
                                                        <Col key={i} xs={6} sm={4} md={3}>
                                                            <div className="p-2 border bg-white rounded text-center shadow-sm">
                                                                <div className="text-muted" style={{ fontSize: '0.7rem' }}>{nutritionLabels[i]}</div>
                                                                {/* Fixed: Directly render val to allow decimals like 96.8 */}
                                                                <div className="fw-bold">{val}</div>
                                                            </div>
                                                        </Col>
                                                    )) : <Col xs={12}><span className="text-muted">Nutrition data unavailable</span></Col>}
                                                </Row>
                                            </div>

                                            <Accordion className="mb-3">
                                                <Accordion.Item eventKey="0">
                                                    <Accordion.Header>🛒 Ingredients ({ingList.length})</Accordion.Header>
                                                    <Accordion.Body>
                                                        <ul>{ingList.map((ing, i) => <li key={i}>{ing}</li>)}</ul>
                                                    </Accordion.Body>
                                                </Accordion.Item>
                                                <Accordion.Item eventKey="1">
                                                    <Accordion.Header>👨‍🍳 Cooking Steps ({stepList.length})</Accordion.Header>
                                                    <Accordion.Body>
                                                        <ol>{stepList.map((step, i) => <li key={i} className="mb-2">{step}</li>)}</ol>
                                                    </Accordion.Body>
                                                </Accordion.Item>
                                            </Accordion>

                                            <div className="d-flex gap-2 d-print-none">
                                                <Button variant="outline-primary" className="flex-grow-1 fw-bold" onClick={() => handleSaveFavorite(recipe)}>❤️ Save</Button>
                                                <Button variant="outline-danger" className="fw-bold" onClick={() => handleRemoveFavorite(recipe)}>🗑️ Remove</Button>
                                                <Button variant="outline-dark" onClick={handlePrintRecipe}>🖨️ Print PDF</Button>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })}
            </Row>
        </div>
    );
};

export default RecipeSearch;