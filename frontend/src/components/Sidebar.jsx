import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Briefcase, Upload, Users, LogOut, Zap } from 'lucide-react'
import useAuthStore from '../store/authStore'

const links = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/jobs/create', icon: Briefcase,        label: 'Create Job' },
  { to: '/upload',      icon: Upload,           label: 'Upload CVs' },
  { to: '/candidates',  icon: Users,            label: 'Candidates' },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  return (
    <aside style={{ width: 220, minHeight: '100vh', background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 34, height: 34, background: 'var(--accent)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: 'var(--text)' }}>HireSmart</span>
        </div>
        {user && (
          <>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{user.company_name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{user.email}</div>
          </>
        )}
      </div>
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 'var(--r-md)',
            marginBottom: 3, fontSize: 13, fontWeight: 500, color: isActive ? 'var(--accent)' : 'var(--text-2)',
            background: isActive ? 'var(--accent-light)' : 'transparent',
            border: isActive ? '1px solid #c4b5fd' : '1px solid transparent', transition: 'all var(--t)',
          })}>
            <Icon size={15} strokeWidth={2} />{label}
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
        <button onClick={() => { logout(); navigate('/login') }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 'var(--r-md)', background: 'transparent', border: '1px solid transparent', color: 'var(--text-3)', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all var(--t)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-light)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'transparent' }}>
          <LogOut size={15} strokeWidth={2} />Sign out
        </button>
      </div>
    </aside>
  )
}