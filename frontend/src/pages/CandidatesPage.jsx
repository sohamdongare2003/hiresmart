import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, RefreshCw, FileText, StickyNote, Zap, ChevronDown, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../components/Layout'
import { PageHeader, Button, Badge, Spinner, ScoreRing, SkillPill, EmptyState } from '../components/UI'
import { jobsAPI, applicationsAPI, matchingAPI } from '../services/api'

function NotesModal({ appId, current, onClose, onSave }) {
  const [notes, setNotes] = useState(current || '')
  const [saving, setSaving] = useState(false)
  const save = async () => {
    if (!notes.trim()) { toast.error('Notes cannot be empty'); return }
    setSaving(true)
    try { await applicationsAPI.addNotes(appId, notes); toast.success('Notes saved'); onSave(); onClose() }
    catch { toast.error('Failed to save') } finally { setSaving(false) }
  }
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: 24, width: 420, maxWidth: '90vw', boxShadow: 'var(--shadow-lg)' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>HR Notes</h3>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes about this candidate…" rows={4} style={{ width: '100%', background: 'var(--surface-2)', border: '1.5px solid var(--border-2)', borderRadius: 'var(--r-md)', padding: '9px 13px', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} autoFocus />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" loading={saving} onClick={save}>Save Notes</Button>
        </div>
      </div>
    </div>
  )
}

function CandidateCard({ candidate, onAction, onNotes }) {
  const [expanded, setExpanded] = useState(false)
  const statusColor = { shortlisted: 'success', rejected: 'danger', pending: 'warn' }
  return (
    <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'box-shadow var(--t)' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: 16, padding: '16px 20px', alignItems: 'center' }}>
        <ScoreRing score={candidate.match_score || 0} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{candidate.full_name || 'Unknown'}</span>
            {candidate.rank && <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid #c4b5fd', borderRadius: 4, padding: '1px 6px' }}>#{candidate.rank}</span>}
            <Badge color={statusColor[candidate.status] || 'default'}>{candidate.status?.toUpperCase()}</Badge>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8 }}>
            {candidate.email && <span style={{ marginRight: 12 }}>{candidate.email}</span>}
            {candidate.experience_years && <span>⏱ {candidate.experience_years}</span>}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {(candidate.matched_skills||[]).map(s => <SkillPill key={s} skill={s} matched />)}
            {(candidate.missing_skills||[]).slice(0,3).map(s => <SkillPill key={s} skill={s} />)}
            {(candidate.missing_skills||[]).length > 3 && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>+{candidate.missing_skills.length-3} missing</span>}
          </div>
          {candidate.notes && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--accent)', background: 'var(--accent-light)', border: '1px solid #c4b5fd', borderRadius: 6, padding: '5px 10px' }}>📝 {candidate.notes}</div>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 5 }}>
            {candidate.status !== 'shortlisted' && (
              <button onClick={() => onAction('shortlist', candidate.application_id)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #6ee7b7', background: 'var(--success-light)', color: 'var(--success)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all var(--t)' }}>
                <CheckCircle size={14} />
              </button>
            )}
            {candidate.status !== 'rejected' && (
              <button onClick={() => onAction('reject', candidate.application_id)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #fca5a5', background: 'var(--danger-light)', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all var(--t)' }}>
                <XCircle size={14} />
              </button>
            )}
            {candidate.status !== 'pending' && (
              <button onClick={() => onAction('reset', candidate.application_id)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RefreshCw size={13} />
              </button>
            )}
            <button onClick={() => onNotes(candidate)} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${candidate.notes ? '#c4b5fd' : 'var(--border)'}`, background: candidate.notes ? 'var(--accent-light)' : 'var(--surface-2)', color: candidate.notes ? 'var(--accent)' : 'var(--text-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <StickyNote size={13} />
            </button>
          </div>
          <a href={`http://localhost:8000${candidate.resume_link}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-3)', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
            <FileText size={11} /> Resume
          </a>
        </div>
      </div>
      {candidate.match_summary && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '10px 20px' }}>
          <button onClick={() => setExpanded(e=>!e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
            <ChevronDown size={13} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform var(--t)' }} />
            {expanded ? 'Hide' : 'Show'} AI summary
          </button>
          {expanded && <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{candidate.match_summary}</p>}
        </div>
      )}
    </div>
  )
}

export default function CandidatesPage() {
  const [searchParams]          = useSearchParams()
  const [jobs, setJobs]         = useState([])
  const [jobId, setJobId]       = useState(searchParams.get('job') || '')
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(false)
  const [matching, setMatching] = useState(false)
  const [filter, setFilter]     = useState('')
  const [page, setPage]         = useState(1)
  const [notesTarget, setNotesTarget] = useState(null)
  const LIMIT = 5

  useEffect(() => { jobsAPI.getAll().then(r => setJobs(r.data.jobs||[])).catch(()=>{}) }, [])

  const load = useCallback(async (jId, sf, pg) => {
    if (!jId) return
    setLoading(true)
    try {
      const params = { page: pg, limit: LIMIT }
      if (sf) params.status = sf
      const { data: res } = await applicationsAPI.listByJob(jId, params)
      setData(res)
    } catch { toast.error('Failed to load candidates') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load(jobId, filter, page) }, [jobId, filter, page, load])

  const runMatch = async () => {
    if (!jobId) { toast.error('Select a job first'); return }
    setMatching(true)
    try { await matchingAPI.runMatch(jobId); toast.success('Matching complete!'); load(jobId, filter, 1) }
    catch (err) { toast.error(err.response?.data?.detail || 'Matching failed') }
    finally { setMatching(false) }
  }

  const handleAction = async (type, id) => {
    try {
      if (type === 'shortlist')  await applicationsAPI.shortlist(id)
      else if (type === 'reject') await applicationsAPI.reject(id)
      else if (type === 'reset')  await applicationsAPI.reset(id)
      toast.success(type === 'shortlist' ? '✓ Shortlisted' : type === 'reject' ? '✗ Rejected' : 'Reset to pending')
      load(jobId, filter, page)
    } catch (err) { toast.error(err.response?.data?.detail || 'Action failed') }
  }

  const exportCSV = async () => {
    if (!jobId) { toast.error('Select a job first'); return }
    try {
      const { data: blob } = await applicationsAPI.exportCSV(jobId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `shortlisted_job_${jobId}.csv`; a.click()
      window.URL.revokeObjectURL(url)
      toast.success('CSV downloaded!')
    } catch { toast.error('Export failed') }
  }

  const candidates = data?.candidates || []
  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1

  return (
    <Layout>
      <div className="fade-up">
        <PageHeader
          title="Candidate Pipeline"
          subtitle="Review and act on AI-ranked candidates."
          actions={
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="ghost" onClick={exportCSV}><Download size={14} /> Export CSV</Button>
              <Button onClick={runMatch} loading={matching} disabled={!jobId}><Zap size={14} />{matching ? 'Ranking…' : 'Run AI Match'}</Button>
            </div>
          }
        />

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <select value={jobId} onChange={e => { setJobId(e.target.value); setData(null); setPage(1) }} style={{ background: '#fff', border: '1.5px solid var(--border-2)', borderRadius: 'var(--r-md)', padding: '8px 32px 8px 12px', color: jobId ? 'var(--text)' : 'var(--text-3)', fontSize: 13, outline: 'none', appearance: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
              <option value="">— Select Job —</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
            <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
          </div>
          {['','pending','shortlisted','rejected'].map(s => (
            <button key={s} onClick={() => { setFilter(s); setPage(1) }} style={{ padding: '7px 14px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: '1.5px solid transparent', background: filter === s ? (s==='shortlisted' ? 'var(--success-light)' : s==='rejected' ? 'var(--danger-light)' : s==='pending' ? 'var(--warn-light)' : 'var(--accent-light)') : '#fff', color: filter === s ? (s==='shortlisted' ? 'var(--success)' : s==='rejected' ? 'var(--danger)' : s==='pending' ? '#b45309' : 'var(--accent)') : 'var(--text-2)', borderColor: filter === s ? 'currentColor' : 'var(--border)', boxShadow: 'var(--shadow-sm)', transition: 'all var(--t)' }}>
              {s === '' ? 'All' : s.charAt(0).toUpperCase()+s.slice(1)}
              {s !== '' && data && ` (${s==='shortlisted'?data.shortlisted:s==='rejected'?data.rejected:data.pending})`}
            </button>
          ))}
        </div>

        {/* Stats */}
        {data && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            {[['Total',data.total,'var(--text)'],['Shortlisted',data.shortlisted,'var(--success)'],['Rejected',data.rejected,'var(--danger)'],['Pending',data.pending,'#b45309']].map(([l,v,c]) => (
              <div key={l} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '10px 18px', textAlign: 'center', minWidth: 80, boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontWeight: 800, fontSize: 20, color: c }}>{v}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{l}</div>
              </div>
            ))}
          </div>
        )}

        {/* List */}
        {!jobId ? (
          <EmptyState icon="🎯" title="Select a job" desc="Choose a job posting to view ranked candidates." />
        ) : loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
        ) : candidates.length === 0 ? (
          <EmptyState icon="👤" title="No candidates yet" desc="Upload resumes and run AI matching to see ranked candidates." />
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {candidates.map(c => (
                <CandidateCard key={c.application_id || c.candidate_id} candidate={c}
                  onAction={handleAction} onNotes={setNotesTarget} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 24 }}>
                <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 14px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', background: '#fff', color: page===1 ? 'var(--text-3)' : 'var(--text-2)', cursor: page===1 ? 'not-allowed' : 'pointer', fontSize: 13, fontFamily: 'inherit', boxShadow: 'var(--shadow-sm)' }}>
                  <ChevronLeft size={14} /> Prev
                </button>
                {Array.from({length: totalPages},(_,i)=>i+1).map(n => (
                  <button key={n} onClick={() => setPage(n)} style={{ width: 34, height: 34, borderRadius: 'var(--r-md)', border: `1.5px solid ${n===page?'var(--accent)':'var(--border)'}`, background: n===page?'var(--accent-light)':'#fff', color: n===page?'var(--accent)':'var(--text-2)', cursor: 'pointer', fontSize: 13, fontWeight: n===page?700:400, fontFamily: 'inherit', boxShadow: 'var(--shadow-sm)' }}>{n}</button>
                ))}
                <button onClick={() => setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 14px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', background: '#fff', color: page===totalPages?'var(--text-3)':'var(--text-2)', cursor: page===totalPages?'not-allowed':'pointer', fontSize: 13, fontFamily: 'inherit', boxShadow: 'var(--shadow-sm)' }}>
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {notesTarget && <NotesModal appId={notesTarget.application_id} current={notesTarget.notes} onClose={() => setNotesTarget(null)} onSave={() => load(jobId, filter, page)} />}
    </Layout>
  )
}