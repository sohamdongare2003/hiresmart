import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'https://hiresmart-backend-xvu5.onrender.com' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hs_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hs_token')
      localStorage.removeItem('hs_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  register: (d) => api.post('/api/auth/register', d),
  login:    (d) => api.post('/api/auth/login', d),
  me:       ()  => api.get('/api/auth/me'),
}

export const jobsAPI = {
  create:  (d)      => api.post('/api/jobs', d),
  getAll:  (params) => api.get('/api/jobs', { params }),
  getById: (id)     => api.get(`/api/jobs/${id}`),
  delete:  (id)     => api.delete(`/api/jobs/${id}`),
}

export const candidatesAPI = {
  upload:     (jobId, fd) => api.post(`/api/candidates/upload?job_id=${jobId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  processAll: (jobId)     => api.post(`/api/candidates/process/job/${jobId}`),
  getById:    (id)        => api.get(`/api/candidates/${id}`),
}

export const applicationsAPI = {
  listByJob: (jobId, params) => api.get(`/api/jobs/${jobId}/candidates`, { params }),
  shortlist: (id, payload)   => api.post(`/api/applications/${id}/shortlist`, payload || {}),
  reject:    (id, payload)   => api.post(`/api/applications/${id}/reject`,    payload || {}),
  reset:     (id)            => api.post(`/api/applications/${id}/reset`),
  addNotes:  (id, notes)     => api.post(`/api/applications/${id}/notes`, { notes }),
  exportCSV: (jobId)         => api.get(`/api/jobs/${jobId}/export/csv`, { responseType: 'blob' }),
}

export const matchingAPI = {
  runMatch: (jobId) => api.post(`/api/matching/job/${jobId}`),
}

export default api
