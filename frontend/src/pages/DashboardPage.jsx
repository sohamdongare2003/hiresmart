import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, Users, CheckCircle, Zap, Plus, ArrowRight } from 'lucide-react'
import Layout from '../components/Layout'
import { Card, PageHeader, Button, Badge, Spinner, EmptyState } from '../components/UI'
import { jobsAPI } from '../services/api'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ width: 42, height: 42, borderRadius: 11, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color={color} strokeWidth={2} />
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 24, color: 'var(--text)' }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{label}</div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [jobs, setJobs]     = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    jobsAPI.getAll()
      .then(r => setJobs(r.data.jobs || []))
      .catch(() => toast.error('Failed to load jobs'))
      .finally(() => setLoading(false))
  }, [])

  const statusColor = { active: 'accent', closed: 'default', draft: 'warn' }

  return (
    <Layout>
      <div className="fade-up">
        <PageHeader
          title={`Welcome back${user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''} 👋`}
          subtitle="Your AI-powered hiring pipeline at a glance."
          actions={<Button onClick={() => navigate('/jobs/create')}><Plus size={14} /> New Job</Button>}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
          <StatCard icon={Briefcase}     label="Total Jobs"       value={jobs.length} color="var(--accent)"  bg="var(--accent-light)" />
          <StatCard icon={Zap}           label="Active Jobs"      value={jobs.filter(j=>j.status==='active').length} color="var(--info)" bg="#dbeafe" />
          <StatCard icon={Users}         label="Total Applicants" value={jobs.reduce((s,j)=>s+(j.total_applications||0),0)} color="var(--warn)" bg="var(--warn-light)" />
          <StatCard icon={CheckCircle}   label="Company"          value={user?.company_name?.split(' ')[0]||'—'} color="var(--success)" bg="var(--success-light)" />
        </div>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ fontWeight: 700, fontSize: 15 }}>Job Postings</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/jobs/create')}><Plus size={13} /> Create Job</Button>
          </div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div>
          ) : jobs.length === 0 ? (
            <EmptyState icon="💼" title="No jobs yet" desc="Create your first job to start screening candidates." />
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 100px 90px 24px', gap: 12, padding: '7px 10px', fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                <span>Title</span><span>Skills</span><span>Experience</span><span>Status</span><span></span>
              </div>
              {jobs.map(j => (
                <div key={j.id} onClick={() => navigate(`/candidates?job=${j.id}`)} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 100px 90px 24px', gap: 12, padding: '11px 10px', borderRadius: 8, alignItems: 'center', cursor: 'pointer', transition: 'background var(--t)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{j.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{j.total_applications || 0} applicants</div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {(j.required_skills||[]).slice(0,3).map(s => <span key={s} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 6px', fontSize: 10, color: 'var(--text-2)' }}>{s}</span>)}
                    {(j.required_skills||[]).length > 3 && <span style={{ fontSize: 10, color: 'var(--text-3)' }}>+{j.required_skills.length-3}</span>}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{j.experience||'—'}</span>
                  <Badge color={statusColor[j.status]||'default'}>{j.status}</Badge>
                  <ArrowRight size={14} color="var(--text-3)" />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  )
}