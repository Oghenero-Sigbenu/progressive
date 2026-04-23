import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000/api/v1";

const isBrowser = typeof window !== "undefined";

const readToken = () => {
  if (!isBrowser) return null;
  try {
    const raw = window.localStorage.getItem("user");
    if (raw) return JSON.parse(raw)?.token || null;
  } catch (_) {}
  return null;
};

const http = axios.create({
  baseURL,
  timeout: 45000,
  headers: { Accept: "application/json" },
});

const privateHttp = axios.create({
  baseURL,
  timeout: 45000,
  headers: { Accept: "application/json" },
});

privateHttp.interceptors.request.use((req) => {
  const token = readToken();
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// AUTH
export const loginUser = (payload) => http.post("/user/login", payload);
export const forgotPassword = (payload) =>
  http.post("/user/forgot-password", payload);
export const resetPassword = (payload) =>
  http.post("/user/reset-password", payload);

// PARISH
export const postParish = (payload) => privateHttp.post("/parish", payload);
export const updateParish = ({ parishId, parishData }) =>
  privateHttp.put(`/parish/${parishId}`, parishData);
export const deleteParish = (parishId) =>
  privateHttp.delete(`/parish/${parishId}`);
export const fetchAllParish = () => http.get("/parish");
export const fetchAllPaidParish = () => http.get("/parish/paid-parishes");
export const fetchParishById = (id) => http.get(`/parish/${id}`);

// DEANERY
export const postDeanery = (payload) => privateHttp.post("/deanery", payload);
export const fetchAllDeaneries = () =>
  http.get(`/deanery?page=${1}&limit=${30}`);
export const fetchAllPaidParishByDeanery = (deaneryId) =>
  http.get(`/deanery/${deaneryId}/paid-parishes`);

// AYD / DELEGATES
export const fetchAllAyds = () => http.get("/ayd");
export const fetchActiveAyd = () => http.get("/ayd/active");
export const aydDelegateRegistration = (payload) =>
  http.post("/delegate/new", payload);
export const getAllAydDelegates = (id) =>
  privateHttp.get(`/delegate?aydId=${id}`);

// USERS
export const fetchUsers = () => privateHttp.get("/user");
export const fetchMe = () => privateHttp.get("/user/me");
