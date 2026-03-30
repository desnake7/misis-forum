import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import PostCard from '../components/PostCard'

const SUBS = [
  { key: 'all', label: 'Все' },
  { key: 'confess', label: '🎭 признания' },
  { key: 'notes', label: '📚 конспекты' },
  { key: 'study', label: '💡 учёба' },
  { key: 'exam', label: '📝 экзамены' },
  { key: 'general', label: '💬 общее' },
]

const SORTS = [
  { key: 'hot', label: '🔥 Горячее' },
  { key: 'new', label: '🆕 Новое' },
  { key: 'top', label: '🏆 Топ' },
]

export default function Home() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [sub, setSub] = useState('all')
  const [sort, setSort] = useState('hot')

  useEffect(() => { fetchPosts() }, [sub, sort])

  // Realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('posts-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, payload => {
        setPosts(prev => [payload.new, ...prev])
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchPosts() {
    setLoading(true)
    let query = supabase
      .from('public_posts')
      .select('*')

    if (sub !== 'all') query = query.eq('subreddit', sub)

    if (sort === 'hot') query = query.order('vote_count', { ascending: false })
    else if (sort === 'new') query = query.order('created_at', { ascending: false })
    else if (sort === 'top') query = query.order('vote_count', { ascending: false })

    query = query.limit(50)

    const { data, error } = await query
    if (!error) setPosts(data || [])
    setLoading(false)
  }

  function handleVote(postId, delta) {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, vote_count: p.vote_count + delta } : p))
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">

      {/* Feed */}
      <main>
        {/* Sort tabs */}
        <div className="flex gap-1 bg-[#141416] border border-[#2e2e38] rounded-xl p-1 mb-4">
          {SORTS.map(s => (
            <button key={s.key} onClick={() => setSort(s.key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${sort === s.key ? 'bg-[#2e2e34] text-white' : 'text-[#8888a0] hover:text-white'}`}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Sub filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {SUBS.map(s => (
            <button key={s.key} onClick={() => setSub(s.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${sub === s.key ? 'border-accent text-accent bg-accent/10' : 'border-[#2e2e38] text-[#8888a0] hover:border-accent hover:text-accent'}`}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-[#141416] border border-[#2e2e38] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-[#555568]">
            <div className="text-4xl mb-3">📭</div>
            <div className="font-mono text-sm">Постов пока нет — будь первым!</div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {posts.map(post => (
              <PostCard key={post.id} post={post} onVote={handleVote} />
            ))}
          </div>
        )}
      </main>

      {/* Sidebar */}
      <aside className="space-y-4 lg:sticky lg:top-20 self-start">
        <div className="bg-[#141416] border border-[#2e2e38] rounded-xl overflow-hidden">
          <div className="bg-[#1c1c20] px-4 py-2.5 border-b border-[#2e2e38]">
            <span className="text-xs font-mono font-semibold text-[#8888a0] uppercase tracking-wider">О сообществе</span>
          </div>
          <div className="p-4 text-sm text-[#8888a0] leading-relaxed">
            Форум студентов Душанбинского филиала МИСИС. Общайся, учись, делись конспектами 🎓
          </div>
          <div className="px-4 pb-4 space-y-2">
            {[['Участников','1,247'],['Онлайн','34'],['Постов сегодня', posts.length]].map(([k,v]) => (
              <div key={k} className="flex justify-between text-sm border-b border-[#1c1c20] pb-2 last:border-0">
                <span className="text-[#8888a0]">{k}</span>
                <span className="font-mono font-semibold">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#141416] border border-[#2e2e38] rounded-xl overflow-hidden">
          <div className="bg-[#1c1c20] px-4 py-2.5 border-b border-[#2e2e38]">
            <span className="text-xs font-mono font-semibold text-[#8888a0] uppercase tracking-wider">Правила</span>
          </div>
          <div className="p-4 space-y-2">
            {['Уважай других','Не деанонь авторов признаний','Конспекты — только свои','Не спамь'].map((r, i) => (
              <div key={i} className="flex gap-3 text-sm text-[#8888a0] pb-2 border-b border-[#1c1c20] last:border-0">
                <span className="text-accent font-mono font-semibold">{i+1}</span>
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}
