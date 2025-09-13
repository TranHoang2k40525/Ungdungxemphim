// src/api/API.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Chỉ cần sửa BASE_URL khi đổi IP/backend
export const BASE_URL = "http://192.168.1.105:5016/api"; // Đổi thành IP backend khi deploy

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json', // Đảm bảo gửi JSON
  },
});

// Loại bỏ interceptor async, chuyển sang lấy token khi gọi API
export const getMovies = async (config = {}) => {
  const token = await AsyncStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  console.log("Gọi API:", BASE_URL + "/Movies");
  console.log("Headers:", headers);
  try {
    const response = await api.get("/Movies", { ...config, headers });
    console.log("Phản hồi API:", response.data);
    return response;
  } catch (error) {
    console.error("Lỗi kết nối backend:", error);
    throw error;
  }
};

export const getGenres = async () => {
  const token = await AsyncStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  console.log("Gọi API:", BASE_URL + "/Genres");
  console.log("Headers:", headers);
  try {
    const response = await api.get("/Genres", { headers });
    console.log("Phản hồi API Genres:", response.data);
    return response;
  } catch (error) {
    console.error("Lỗi kết nối backend:", error);
    throw error;
  }
};

export const getMovieDetail = async (id) => {
  const token = await AsyncStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  console.log("Gọi API:", BASE_URL + `/Movies/${id}`);
  console.log("Headers:", headers);
  try {
    const response = await api.get(`/Movies/${id}`, { headers });
    console.log("Phản hồi API:", response.data);
    return response;
  } catch (error) {
    console.error("Lỗi kết nối backend:", error);
    throw error;
  }
};

// API lấy danh sách tập phim
export const getEpisodes = async (movieId) => {
  const token = await AsyncStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return api.get(`/Movies/${movieId}/Episodes`, { headers });
};

// API lấy bình luận
export const getComments = async (movieId) => {
  return api.get(`/Movies/${movieId}/Comments`);
};

// API gửi bình luận
export const postComment = async (movieId, text, token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  console.log("Payload gửi bình luận:", JSON.stringify({ text })); // Log để debug
  return api.post(`/Movies/${movieId}/Comments`, { text }, { headers });
};

// API lấy đánh giá
export const getRatings = async (movieId) => {
  return api.get(`/Movies/${movieId}/Ratings`);
};

// API gửi đánh giá
export const postRating = async (movieId, value, token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  console.log("Payload gửi đánh giá:", JSON.stringify({ value })); // Log để debug
  return api.post(`/Movies/${movieId}/Ratings`, { value }, { headers });
};

// API lấy lịch sử xem phim
export const getWatchHistory = async (token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return api.get(`/Users/WatchHistory`, { headers });
};
export const deleteComment = async (movieId, commentId, token) => {
  return api.delete(`/Movies/${movieId}/Comments/${commentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  };