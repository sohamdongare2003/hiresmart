import { create } from 'zustand'

const useAuthStore = create((set) => ({
  token: localStorage.getItem('hs_token') || null,
  user:  JSON.parse(localStorage.getItem('hs_user') || 'null'),
  setAuth: (token, user) => {
    localStorage.setItem('hs_token', token)
    localStorage.setItem('hs_user', JSON.stringify(user))
    set({ token, user })
  },
  logout: () => {
    localStorage.removeItem('hs_token')
    localStorage.removeItem('hs_user')
    set({ token: null, user: null })
  },
}))

export default useAuthStore