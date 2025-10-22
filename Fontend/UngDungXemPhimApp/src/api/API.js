// src/api/API.js - Simplified (No Auth, No Comments, No Ratings)
import axios from "axios";
import getEnvVars from "../config/env";

const { apiUrl, assetUrl } = getEnvVars();

// Sử dụng environment variables
export const BASE_URL = apiUrl;
export const ASSET_URL = assetUrl;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API lấy danh sách phim
export const getMovies = async (config = {}) => {
  console.log("Gọi API:", BASE_URL + "/Movies");
  try {
    const response = await api.get("/Movies", config);
    console.log("Phản hồi API:", response.data);
    return response;
  } catch (error) {
    console.error("Lỗi kết nối backend:", error);
    throw error;
  }
};

// API lấy danh sách thể loại
export const getGenres = async () => {
  console.log("Gọi API:", BASE_URL + "/Genres");
  try {
    const response = await api.get("/Genres");
    console.log("Phản hồi API Genres:", response.data);
    return response;
  } catch (error) {
    console.error("Lỗi kết nối backend:", error);
    throw error;
  }
};

// API lấy chi tiết phim
export const getMovieDetail = async (id) => {
  console.log("Gọi API:", BASE_URL + `/Movies/${id}`);
  try {
    const response = await api.get(`/Movies/${id}`);
    console.log("Phản hồi API:", response.data);
    return response;
  } catch (error) {
    console.error("Lỗi kết nối backend:", error);
    throw error;
  }
};

// API lấy danh sách tập phim
export const getEpisodes = async (movieId) => {
  return api.get(`/Movies/${movieId}/Episodes`);
};
