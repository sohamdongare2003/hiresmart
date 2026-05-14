export function Card({ children, style = {} }) {
  return <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 24, boxShadow: 'var(--shadow-sm)', ...style }}>{children}</div>
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <h1 style={{ fontWeight: 800, fontSize: 24, letterSpacing: '-0.4px', color: 'var(--text)' }}>{title}</h1>
        {subtitle && <p style={{ color: 'var(--text-2)', marginTop: 4, fontSize: 13 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
    </div>
  )
}

export function Input({ label, error, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>{label}</label>}
      <input {...props} style={{ background: 'var(--surface)', border: `1.5px solid ${error ? 'var(--danger)' : 'var(--border-2)'}`, borderRadius: 'var(--r-md)', padding: '9px 13px', color: 'var(--text)', fontSize: 14, outline: 'none', width: '100%', transition: 'border-color var(--t)', ...props.style }}
        onFocus={e => e.target.style.borderColor = error ? 'var(--danger)' : 'var(--accent)'}
        onBlur={e  => e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border-2)'}
      />
      {error && <span style={{ fontSize: 11, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}>⚠ {error}</span>}
    </div>
  )
}

export function Textarea({ label, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>{label}</label>}
      <textarea {...props} style={{ background: 'var(--surface)', border: '1.5px solid var(--border-2)', borderRadius: 'var(--r-md)', padding: '9px 13px', color: 'var(--text)', fontSize: 14, outline: 'none', resize: 'vertical', minHeight: 90, width: '100%', ...props.style }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e  => e.target.style.borderColor = 'var(--border-2)'}
      />
    </div>
  )
}

export function Button({ children, variant = 'primary', loading, size = 'md', ...props }) {
  const base = { display: 'inline-flex', alignItems: 'center', gap: 7, borderRadius: 'var(--r-md)', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all var(--t)', border: '1.5px solid transparent', opacity: loading ? 0.65 : 1, fontFamily: 'inherit', fontSize: size === 'sm' ? 12 : 13, padding: size === 'sm' ? '6px 12px' : '9px 16px' }
  const variants = {
    primary: { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' },
    ghost:   { background: 'var(--surface)', color: 'var(--text-2)', borderColor: 'var(--border-2)' },
    danger:  { background: 'var(--danger-light)', color: 'var(--danger)', borderColor: '#fca5a5' },
    success: { background: 'var(--success-light)', color: 'var(--success)', borderColor: '#6ee7b7' },
  }
  return <button {...props} disabled={loading || props.disabled} style={{ ...base, ...variants[variant], ...props.style }}>{loading ? <Spinner size={14} /> : null}{children}</button>
}

export function Badge({ children, color = 'default' }) {
  const colors = {
    default: ['var(--surface-2)', 'var(--text-2)', 'var(--border-2)'],
    accent:  ['var(--accent-light)', 'var(--accent)', '#c4b5fd'],
    success: ['var(--success-light)', 'var(--success)', '#6ee7b7'],
    danger:  ['var(--danger-light)', 'var(--danger)', '#fca5a5'],
    warn:    ['var(--warn-light)', '#b45309', '#fcd34d'],
  }
  const [bg, fg, bd] = colors[color] || colors.default
  return <span style={{ background: bg, color: fg, border: `1px solid ${bd}`, borderRadius: 5, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{children}</span>
}

export function Spinner({ size = 20 }) {
  return <div style={{ width: size, height: size, border: '2px solid var(--border-2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
}

export function SkillPill({ skill, matched }) {
  return <span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: 100, fontSize: 11, fontWeight: 500, background: matched ? 'var(--accent-light)' : 'var(--surface-2)', color: matched ? 'var(--accent)' : 'var(--text-2)', border: `1px solid ${matched ? '#c4b5fd' : 'var(--border)'}` }}>{skill}</span>
}

export function ScoreRing({ score }) {
  const color = score >= 75 ? 'var(--success)' : score >= 50 ? 'var(--warn)' : 'var(--danger)'
  const bgColor = score >= 75 ? '#d1fae5' : score >= 50 ? '#fef3c7' : '#fee2e2'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <div style={{ width: 52, height: 52, borderRadius: '50%', background: `conic-gradient(${color} ${score * 3.6}deg, var(--border) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color }}>{Math.round(score)}</div>
      </div>
      <span style={{ fontSize: 10, color: 'var(--text-3)' }}>score</span>
    </div>
  )
}

export function EmptyState({ icon, title, desc }) {
  return (
    <div style={{ textAlign: 'center', padding: '52px 24px', color: 'var(--text-3)' }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-2)', marginBottom: 5 }}>{title}</div>
      <div style={{ fontSize: 13 }}>{desc}</div>
    </div>
  )
}