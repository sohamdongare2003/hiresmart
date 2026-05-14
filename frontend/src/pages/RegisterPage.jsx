import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', company_name: '', company_size: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validate = () => {
    const e = {}
    if (!form.full_name)    e.full_name = 'Full name is required'
    if (!form.email)        e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password)     e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'Min 8 characters'
    else if (!/[A-Z]/.test(form.password)) e.password = 'Must include 1 uppercase letter'
    else if (!/[0-9]/.test(form.password)) e.password = 'Must include 1 number'
    if (!form.company_name) e.company_name = 'Company name is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await authAPI.register(form)
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed.')
    } finally { setLoading(false) }
  }

  const f = (k) => (e) => { setForm(p => ({...p, [k]: e.target.value})); if (errors[k]) setErrors(p => ({...p, [k]: ''})) }
  const inp = (k, label, placeholder, type='text') => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>{label}</label>
      <input value={form[k]} onChange={f(k)} placeholder={placeholder} type={type} style={{ background: '#fff', border: `1.5px solid ${errors[k] ? 'var(--danger)' : 'var(--border-2)'}`, borderRadius: 'var(--r-md)', padding: '9px 13px', fontSize: 14, outline: 'none', width: '100%' }} />
      {errors[k] && <span style={{ fontSize: 11, color: 'var(--danger)' }}>⚠ {errors[k]}</span>}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f6fa 0%, #ede9fe 100%)', padding: 24 }}>
      <div className="fade-up" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, background: 'var(--accent)', borderRadius: 12, marginBottom: 12, boxShadow: '0 8px 24px rgba(79,70,229,0.3)' }}>
            <Zap size={22} color="#fff" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontWeight: 800, fontSize: 26, letterSpacing: '-0.4px' }}>HireSmart</h1>
        </div>
        <div style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
          <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Create your account</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            {inp('full_name',    'Full Name *',     'Soham Patil')}
            {inp('email',        'Work Email *',    'you@company.com', 'email')}
            {inp('password',     'Password *',      'Min 8 chars, 1 uppercase, 1 digit', 'password')}
            {inp('company_name', 'Company Name *',  'TechCorp Pvt Ltd')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>Company Size</label>
              <select value={form.company_size} onChange={f('company_size')} style={{ background: '#fff', border: '1.5px solid var(--border-2)', borderRadius: 'var(--r-md)', padding: '9px 13px', fontSize: 14, outline: 'none', width: '100%' }}>
                <option value="">Select size</option>
                <option value="1-10">1–10</option><option value="11-50">11–50</option>
                <option value="51-200">51–200</option><option value="200+">200+</option>
              </select>
            </div>
            <button type="submit" disabled={loading} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', padding: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>
              {loading ? 'Creating…' : 'Create Account →'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-2)' }}>
            Have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}