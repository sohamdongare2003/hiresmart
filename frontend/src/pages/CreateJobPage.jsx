import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../components/Layout'
import { Card, PageHeader, Input, Textarea, Button } from '../components/UI'
import { jobsAPI } from '../services/api'

export default function CreateJobPage() {
  const [form, setForm]     = useState({ title: '', description: '', experience: '', location: '' })
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Job title is required'
    if (skills.length === 0) e.skills = 'Add at least one skill'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const addSkill = () => {
    const parts = skillInput.split(',').map(s => s.trim()).filter(s => s && !skills.includes(s))
    if (parts.length) setSkills(p => [...p, ...parts])
    setSkillInput('')
    setErrors(p => ({...p, skills: ''}))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const { data } = await jobsAPI.create({ ...form, required_skills: skills })
      toast.success('Job created!')
      navigate(`/upload?job=${data.id}`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create job.')
    } finally { setLoading(false) }
  }

  const expOpts = ['Fresher','0-1 years','1-2 years','2-4 years','4-6 years','6+ years']

  return (
    <Layout>
      <div className="fade-up" style={{ maxWidth: 640 }}>
        <PageHeader title="Create Job Posting" subtitle="Define the role and required skills for AI-powered candidate matching." />
        <Card>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Input label="Job Title *" placeholder="e.g. Backend Developer" value={form.title} error={errors.title}
              onChange={e => { setForm(f=>({...f,title:e.target.value})); setErrors(p=>({...p,title:''})) }} autoFocus />
            <Textarea label="Job Description" placeholder="Describe the role…" value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>Required Skills *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill() } }}
                  placeholder="Type skill + Enter (or comma-separated)"
                  style={{ flex: 1, background: '#fff', border: `1.5px solid ${errors.skills ? 'var(--danger)' : 'var(--border-2)'}`, borderRadius: 'var(--r-md)', padding: '9px 13px', fontSize: 14, outline: 'none' }} />
                <Button type="button" variant="ghost" onClick={addSkill}><Plus size={14} /> Add</Button>
              </div>
              {errors.skills && <span style={{ fontSize: 11, color: 'var(--danger)' }}>⚠ {errors.skills}</span>}
              {skills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {skills.map(s => (
                    <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent-light)', border: '1px solid #c4b5fd', borderRadius: 7, padding: '3px 10px', fontSize: 12, color: 'var(--accent)' }}>
                      {s}
                      <button type="button" onClick={() => setSkills(p => p.filter(x => x !== s))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: 0, display: 'flex' }}><X size={11} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>Experience Required</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {expOpts.map(opt => (
                  <button key={opt} type="button" onClick={() => setForm(f=>({...f,experience:f.experience===opt?'':opt}))} style={{ padding: '6px 14px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', background: form.experience === opt ? 'var(--accent-light)' : 'var(--surface-2)', border: `1px solid ${form.experience === opt ? '#c4b5fd' : 'var(--border)'}`, color: form.experience === opt ? 'var(--accent)' : 'var(--text-2)', transition: 'all var(--t)' }}>{opt}</button>
                ))}
              </div>
            </div>
            <Input label="Location" placeholder="e.g. Pune, Remote" value={form.location} onChange={e => setForm(f=>({...f,location:e.target.value}))} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <Button type="button" variant="ghost" onClick={() => navigate('/dashboard')}>Cancel</Button>
              <Button type="submit" loading={loading}>Create Job & Upload Resumes →</Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  )
}