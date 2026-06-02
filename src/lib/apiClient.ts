// src/lib/apiClient.ts
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'

// 1. Create API Base Configuration (Aktivitas 2, 7)
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000, // Request akan dibatalkan jika server tidak merespons dalam 10 detik
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
})

// 2. Setup Request Interceptor (Aktivitas 3, 6)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Mengambil token otentikasi dari localStorage (atau state management)
    const token = localStorage.getItem('access_token')

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Request Logging untuk Debugging (Hanya aktif di mode development)
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config)
    }

    return config
  },
  (error: AxiosError) => {
    if (import.meta.env.DEV) {
      console.error('[API Request Error]', error)
    }
    return Promise.reject(error)
  }
)

// Variabel bantuan untuk mencegah multiple token refresh secara bersamaan
let isRefreshing = false
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> =
  []

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// 3. Setup Response Interceptor & Error Handling (Aktivitas 4, 5, 6, 9)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Response Logging
    if (import.meta.env.DEV) {
      console.log(
        `✅ [API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`,
        response.data
      )
    }
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Response Error Logging
    if (import.meta.env.DEV) {
      console.error(
        `[API Response Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        error.response?.data || error.message
      )
    }

    // Standardisasi Error Response (Aktivitas 9)
    // Menangkap error 401 (Unauthorized) untuk Token Refresh Logic (Aktivitas 5)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token
            return apiClient(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Asumsi endpoint untuk refresh token
        const refreshToken = localStorage.getItem('refresh_token')
        const response = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, {
          refreshToken: refreshToken,
        })

        const data = response.data.data

        // Simpan token baru
        localStorage.setItem('access_token', data.accessToken)
        localStorage.setItem('refresh_token', data.refreshToken)
        apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + data.accessToken
        originalRequest.headers.Authorization = 'Bearer ' + data.accessToken

        processQueue(null, data.accessToken)
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null)
        // Jika refresh token gagal (misal: sudah expired), tendang user ke halaman login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/auth'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Standardisasi format error untuk dilempar ke komponen UI
    const standardizedError = {
      message:
        (error.response?.data as { message: string })?.message || 'Terjadi kesalahan pada server.',
      status: error.response?.status || 500,
      code: error.code,
    }

    return Promise.reject(standardizedError)
  }
)

export default apiClient
