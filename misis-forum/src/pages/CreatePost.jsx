import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const SUBS = ['general','study','exam','confess','notes']
const SUB_LABELS = { general:'💬 Общее', study:'💡 Учёба', exam:'📝 Экзамены', confess:'🎭 Признания', notes:'📚 Конспекты' }
const FLAIRS = ['1 курс','2 курс','3 курс','4 курс']

export default function CreatePost() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sub, setSub] = useState('general')
  const [flair, setFlair] = useState(profile?.flair || '1 курс')
  const [isAnon, setIsAnon] = useState(false)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!user) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="text-4xl mb-4">🔐</div>
      <p className="text-[#8888a0] font-mono">Войди чтобы создать пост</p>
    </div>
  )

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) { setError('Добавь заголовок'); return }
    setLoading(true); setError('')

    let file_url = null, file_name = null

    // Upload file if attached
    if (file) {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('notes').upload(path, file)
      if (uploadError) { setError('Ошибка загрузки файла'); setLoading(false); return }
      const { data: urlData } = supabase.storage.from('notes').getPublicUrl(path)
      file_url = urlData.publicUrl
      file_name = file.name
    }

    const { data, error: postError } = await supabase.from('posts').insert({
      author_id: user.id,
      title: title.trim(),
      body: body.trim() || null,
      subreddit: sub,
      flair,
      is_anonymous: isAnon || sub === 'confess',
      file_url,
      file_name,
    }).select().single()

    if (postError) { setError('Ошибка при публикации'); setLoading(false); return }
    navigate(`/post/${data.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold mb-6">Новый пост</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Subreddit */}
        <div>
          <label className="text-xs font-mono text-[#555568] uppercase tracking-wider mb-2 block">Раздел</label>
          <div className="flex gap-2 flex-wrap">
            {SUBS.map(s => (
              <button type="button" key={s} onClick={() => setSub(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-mono border transition-all ${sub === s ? 'border-accent bg-accent/10 text-accent' : 'border-[#2e2e38] text-[#8888a0] hover:border-[#3e3e48]'}`}>
                {SUB_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-mono text-[#555568] uppercase tracking-wider mb-2 block">Заголовок *</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="О чём хочешь написать?"
            className="w-full bg-[#1c1c20] border border-[#2e2e38] rounded-xl px-4 py-3 text-sm text-white placeholder-[#555568] outline-none focus:border-accent transition-colors"
            maxLength={200} />
          <div className="text-right text-xs text-[#3e3e48] mt-1">{title.length}/200</div>
        </div>

        {/* Body */}
        <div>
          <label className="text-xs font-mono text-[#555568] uppercase tracking-wider mb-2 block">Текст</label>
          <textarea value={body} onChange={e => setBody(e.target.value)}
            placeholder="Подробности (необязательно)..."
            rows={4}
            className="w-full bg-[#1c1c20] border border-[#2e2e38] rounded-xl px-4 py-3 text-sm text-white placeholder-[#555568] outline-none focus:border-accent transition-colors resize-none" />
        </div>

        {/* Flair + options row */}
        <div className="flex gap-3 flex-wrap items-center">
          <div>
            <label className="text-xs font-mono text-[#555568] uppercase tracking-wider mb-1.5 block">Курс</label>
            <select value={flair} onChange={e => setFlair(e.target.value)}
              className="bg-[#1c1c20] border border-[#2e2e38] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent">
              {FLAIRS.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>

          {/* File upload (only for notes) */}
          {sub === 'notes' && (
            <div>
              <label className="text-xs font-mono text-[#555568] uppercase tracking-wider mb-1.5 block">Файл</label>
              <label className="flex items-center gap-2 bg-[#1c1c20] border border-[#2e2e38] hover:border-green-500/50 rounded-lg px-3 py-2 text-sm text-[#8888a0] cursor-pointer transition-colors">
                📎 {file ? file.name : 'Прикрепить'}
                <input type="file" className="hidden" onChange={e => setFile(e.target.files[0])} accept=".pdf,.doc,.docx,.txt,.png,.jpg" />
              </label>
            </div>
          )}

          {/* Anon toggle */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-[#8888a0]">Анонимно</span>
            <button type="button" onClick={() => setIsAnon(!isAnon)}
              className={`w-10 h-6 rounded-full transition-colors relative ${isAnon || sub === 'confess' ? 'bg-purple-500' : 'bg-[#2e2e34]'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${isAnon || sub === 'confess' ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate('/')}
            className="px-5 py-2.5 border border-[#2e2e38] text-[#8888a0] hover:text-white rounded-xl text-sm transition-colors">
            Отмена
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 bg-accent hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-medium transition-colors">
            {loading ? 'Публикуем...' : 'Опубликовать'}
          </button>
        </div>
      </form>
    </div>
  )
}
