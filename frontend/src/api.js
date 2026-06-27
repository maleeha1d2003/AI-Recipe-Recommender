import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/';

export const register = (userData) => axios.post(`${API_URL}register/`, userData);
export const login = (userData) => axios.post(`${API_URL}login/`, userData);
export const getRecommendations = (data) => axios.post(`${API_URL}recommend/`, data);