import axios, { AxiosInstance } from 'axios'
import { useStore } from '../store'

const API_BASE_URL = (import.meta.env as any).VITE_API_URL || 'http://localhost:3000/api'

/**
 * Axios instance for API calls
 * Automatically attaches auth token from store
 */
const instance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor: attach token to all requests
 */
instance.interceptors.request.use((config) => {
  const token = useStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Response interceptor: handle 401 and clear auth on token expiry
 */
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      useStore.getState().clearAuth()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const apiClient = instance
