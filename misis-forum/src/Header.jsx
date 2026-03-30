import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'

export default function Header() {
  const { user, profile, logout } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#2e2e38] bg-[#0d0d0f]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center font-mono font-semibold text-xs text-white">
              МИ
            </div>
            <div>
              <div className="font-mono font-semibold text-sm text-white leading-none">MISIS.tj</div>
              <div className="font-mono text-[10px] text-[#555568] leading-none mt-0.5">Душанбинский филиал</div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {user && profile ? (
              <>
                <Link to="/create" className="px-3 py-1.5 bg-accent hover:bg-blue-500 text-white rounded-md text-sm font-medium transition-colors">
                  + Пост
                </Link>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1c1c20] border border-[#2e2e38] rounded-full text-sm font-mono">
                  <span className="text-yellow-400">⚡</span>
                  <span className="text-yellow-400">{profile.karma}</span>
                  <span className="text-[#555568]">·</span>
                  <span className="text-[#8888a0]">{profile.username}</span>
                </div>
                <button onClick={logout} className="px-3 py-1.5 text-sm text-[#8888a0] hover:text-white border border-[#2e2e38] rounded-md transition-colors">
                  Выйти
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setShowAuth('login')} className="px-3 py-1.5 text-sm text-[#8888a0] hover:text-white border border-[#2e2e38] rounded-md transition-colors">
                  Войти
                </button>
                <button onClick={() => setShowAuth('register')} className="px-3 py-1.5 bg-accent hover:bg-blue-500 text-white rounded-md text-sm font-medium transition-colors">
                  Регистрация
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {showAuth && <AuthModal mode={showAuth} onClose={() => setShowAuth(false)} />}
    </>
  )
}
