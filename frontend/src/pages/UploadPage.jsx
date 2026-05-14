import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Upload, FileText, X, Zap, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../components/Layout'
import { Card, PageHeader, Button, Badge, Spinner } from '../components/UI'
import { jobsAPI, candidatesAPI } from '../services/api'

export default function UploadPage() {
  const [searchParams]    = useSearchParams()
  const [jobs, setJobs]   = useState([])
  const [jobId, setJobId] = useState(searchParams.get('job') || '')
  const [files, setFiles] = useState([])
  const [results, setResults] = useState({})
  const [uploading, setUploading]   = useState(false)
  const [processing, setProcessing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadDone, setUploadDone] = useState(false)
  const inputRef = useRef()
  const navigate = useNavigate()

  useEffect(() => { jobsAPI.getAll({ status: 'active' }).then(r => setJobs(r.data.jobs || [])).catch(()=>{}) }, [])

  const addFiles = useCallback((incoming) => {
    const allowed = Array.from(incoming).filter(f => /\.(pdf|doc|docx)$/i.test(f.name))
    if (allowed.length < incoming.length) toast.error('Only PDF, DOC, DOCX accepted')
    setFiles(prev => { const names = new Set(prev.map(f=>f.name)); return [...prev, ...allowed.filter(f=>!names.has(f.name))] })
  }, [])

  const handleUpload = async () => {
    if (!jobId)        { toast.error('Select a job first'); return }
    if (!files.length) { toast.error('Add at least one resume'); return }
    setUploading(true)
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('files', f))
      const { data } = await candidatesAPI.upload(jobId, fd)
      const map = {}
      data.results.forEach(r => { map[r.original_filename] = r })
      setResults(map)
      const ok = data.results.filter(r=>r.status==='success').length
      const bad = data.results.filter(r=>r.status==='failed').length
      if (ok)  toast.success(`${ok} resume${ok>1?'s':''} uploaded`)
      if (bad) toast.error(`${bad} file${bad>1?'s':''} failed`)
      setUploadDone(true)
    } catch (err) { toast.error(err.response?.data?.detail || 'Upload failed.') }
    finally { setUploading(false) }
  }

  const handleProcess = async () => {
    setProcessing(true)
    try {
      await candidatesAPI.processAll(jobId)
      toast.success('Resumes processed by Gemini AI!')
      navigate(`/candidates?job=${jobId}`)
    } catch (err) { toast.error(err.response?.data?.detail || 'Processing failed.') }
    finally { setProcessing(false) }
  }

  return (
    <Layout>
      <div className="fade-up" style={{ maxWidth: 660 }}>
        <PageHeader title="Upload Resumes" subtitle="Upload PDF / DOC / DOCX resumes. AI will extract structured data automatically." />
        <Card style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 7 }}>Select Job Posting *</label>
          <div style={{ position: 'relative' }}>
            <select value={jobId} onChange={e => setJobId(e.target.value)} style={{ width: '100%', background: '#fff', border: '1.5px solid var(--border-2)', borderRadius: 'var(--r-md)', padding: '9px 34px 9px 13px', color: jobId ? 'var(--text)' : 'var(--text-3)', fontSize: 14, outline: 'none', appearance: 'none' }}>
              <option value="">— Choose a job —</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
          </div>
        </Card>
        <Card style={{ marginBottom: 16 }}>
          <div onDragOver={e=>{e.preventDefault();setIsDragging(true)}} onDragLeave={()=>setIsDragging(false)}
            onDrop={e=>{e.preventDefault();setIsDragging(false);addFiles(e.dataTransfer.files)}}
            onClick={() => inputRef.current?.click()}
            style={{ border: `2px dashed ${isDragging ? 'var(--accent)' : 'var(--border-2)'}`, borderRadius: 'var(--r-lg)', padding: '36px 24px', textAlign: 'center', cursor: 'pointer', background: isDragging ? 'var(--accent-light)' : 'var(--surface-2)', transition: 'all 0.2s' }}>
            <input ref={inputRef} type="file" multiple accept=".pdf,.doc,.docx" className="sr-only" onChange={e => addFiles(e.target.files)} />
            <Upload size={28} color={isDragging ? 'var(--accent)' : 'var(--text-3)'} style={{ marginBottom: 10 }} />
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 5, color: isDragging ? 'var(--accent)' : 'var(--text)' }}>
              {isDragging ? 'Drop files here' : 'Drag & drop resumes here'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>or click to browse · PDF, DOC, DOCX · Max 5 MB each</div>
          </div>
          {files.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8 }}>{files.length} file{files.length>1?'s':''} selected</div>
              {files.map(f => {
                const r = results[f.name]
                const size = (f.size/1024).toFixed(1) + ' KB'
                return (
                  <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 34, height: 34, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={15} color="var(--text-2)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{f.name.split('.').pop().toUpperCase()} · {size}</div>
                      {r?.error && <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 2 }}>⚠ {r.error}</div>}
                    </div>
                    {!r ? <Badge>Queued</Badge> : r.status==='success' ? <Badge color="success">✓ Uploaded</Badge> : <Badge color="danger">✗ Failed</Badge>}
                    {!uploading && !r && <button onClick={() => setFiles(p=>p.filter(x=>x.name!==f.name))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4, display: 'flex' }}><X size={13} /></button>}
                  </div>
                )
              })}
            </div>
          )}
        </Card>
        <div style={{ display: 'flex', gap: 10 }}>
          {!uploadDone ? (
            <Button onClick={handleUpload} loading={uploading} disabled={!files.length || !jobId}>
              {uploading ? 'Uploading…' : <><Upload size={14} /> Upload {files.length > 0 ? `${files.length} Resume${files.length>1?'s':''}` : 'Resumes'}</>}
            </Button>
          ) : (
            <>
              <Button onClick={handleProcess} loading={processing}>
                {processing ? 'Processing…' : <><Zap size={14} /> Process with Gemini AI</>}
              </Button>
              <Button variant="ghost" onClick={() => navigate(`/candidates?job=${jobId}`)}>Skip → View Candidates</Button>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}