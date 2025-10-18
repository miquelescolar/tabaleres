import axios from "axios";

const API_URL = "https://tabaleres.onrender.com/api";

export const getEvents = () => axios.get(`${API_URL}/events`);
export const getStudents = () => axios.get(`${API_URL}/students`);
export const getAttendance = (eventId) => axios.get(`${API_URL}/attendance/${eventId}`);
export const postAttendance = (data) => axios.post(`${API_URL}/attendance`, data);
