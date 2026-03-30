import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AuthModal({ mode, onClose }) {
  const { login, register } = useAuth()
  const [tab, setTab] = useState(mode)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [flair, setFlair] = useState('1 курс')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (tab === 'login') {
      const { error } = await login(username, password)
      if (error) setError('Неверный логин или пароль')
      else onClose()
    } else {
      if (username.length < 3) { setError('Никнейм минимум 3 символа'); setLoading(false); return }
      if (password.length < 6) { setError('Пароль минимум 6 символов'); setLoading(false); return }
      const { error } = await register(username, password)
      if (error) setError(error.message.includes('already') ? 'Этот никнейм занят' : error.message)
      else onClose()
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#141416] border border-[#3e3e48] rounded-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>

        <div className="flex gap-1 mb-5 bg-[#0d0d0f] rounded-lg p-1">
          {['login','register'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError('') }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${tab === t ? 'bg-[#2e2e34] text-white' : 'text-[#8888a0] hover:text-white'}`}>
              {t === 'login' ? 'Войти' : 'Регистрация'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-mono text-[#555568] uppercase tracking-wider mb-1.5 block">Никнейм</label>
            <input value={username} onChange={e => setUsername(e.target.value)}
              placeholder="например: student_42"
              className="w-full bg-[#1c1c20] border border-[#2e2e38] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#555568] outline-none focus:border-accent transition-colors"
              required />
          </div>

          {tab === 'register' && (
            <div>
              <label className="text-xs font-mono text-[#555568] uppercase tracking-wider mb-1.5 block">Курс</label>
              <select value={flair} onChange={e => setFlair(e.target.value)}
                className="w-full bg-[#1c1c20] border border-[#2e2e38] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-accent transition-colors">
                {['1 курс','2 курс','3 курс','4 курс','Магистратура'].map(f => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-mono text-[#555568] uppercase tracking-wider mb-1.5 block">Пароль</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#1c1c20] border border-[#2e2e38] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#555568] outline-none focus:border-accent transition-colors"
              required />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-accent hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-medium transition-colors mt-1">
            {loading ? 'Загрузка...' : tab === 'login' ? 'Войти' : 'Создать аккаунт'}
          </button>
        </form>
      </div>
    </div>
  )
}
