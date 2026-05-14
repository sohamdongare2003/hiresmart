import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'
import useAuthStore from '../store/authStore'

export default function LoginPage() {
  const [form, setForm]   = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const validate = () => {
    const e = {}
    if (!form.email)           e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password)        e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const { data } = await authAPI.login(form)
      setAuth(data.access_token, data.user)
      toast.success(`Welcome back!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f6fa 0%, #ede9fe 100%)', padding: 24 }}>
      <div className="fade-up" style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, background: 'var(--accent)', borderRadius: 14, marginBottom: 14, boxShadow: '0 8px 24px rgba(79,70,229,0.3)' }}>
            <Zap size={26} color="#fff" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontWeight: 800, fontSize: 28, letterSpacing: '-0.5px' }}>HireSmart</h1>
          <p style={{ color: 'var(--text-2)', marginTop: 5, fontSize: 13 }}>AI-powered hiring assistant</p>
        </div>
        <div style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
          <h2 style={{ fontWeight: 700, fontSize: 17, marginBottom: 22 }}>Sign in to your account</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>Email</label>
              <input value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="you@company.com" style={{ background: '#fff', border: `1.5px solid ${errors.email ? 'var(--danger)' : 'var(--border-2)'}`, borderRadius: 'var(--r-md)', padding: '9px 13px', fontSize: 14, outline: 'none', width: '100%' }} />
              {errors.email && <span style={{ fontSize: 11, color: 'var(--danger)' }}>⚠ {errors.email}</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>Password</label>
              <input value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} type="password" placeholder="••••••••" style={{ background: '#fff', border: `1.5px solid ${errors.password ? 'var(--danger)' : 'var(--border-2)'}`, borderRadius: 'var(--r-md)', padding: '9px 13px', fontSize: 14, outline: 'none', width: '100%' }} />
              {errors.password && <span style={{ fontSize: 11, color: 'var(--danger)' }}>⚠ {errors.password}</span>}
            </div>
            <button type="submit" disabled={loading} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', padding: '10px', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--text-2)' }}>
            No account? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}