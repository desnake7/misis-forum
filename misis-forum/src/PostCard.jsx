import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const SUB_COLORS = {
  confess: 'bg-purple-500/15 text-purple-400',
  notes:   'bg-green-500/12 text-green-400',
  study:   'bg-blue-500/15 text-blue-400',
  exam:    'bg-red-500/12 text-red-400',
  general: 'bg-yellow-500/12 text-yellow-400',
}

const SUB_LABELS = {
  confess: 'признания',
  notes:   'конспекты',
  study:   'учёба',
  exam:    'экзамены',
  general: 'общее',
}

export default function PostCard({ post, onVote }) {
  const { user } = useAuth()
  const [voting, setVoting] = useState(false)

  async function vote(value) {
    if (!user) { alert('Войди чтобы голосовать'); return }
    if (voting) return
    setVoting(true)

    const { data: existing } = await supabase
      .from('votes').select('id, value').eq('user_id', user.id).eq('post_id', post.id).single()

    if (existing) {
      if (existing.value === value) {
        await supabase.from('votes').delete().eq('id', existing.id)
        onVote && onVote(post.id, -value)
      } else {
        await supabase.from('votes').update({ value }).eq('id', existing.id)
        onVote && onVote(post.id, value * 2)
      }
    } else {
      await supabase.from('votes').insert({ user_id: user.id, post_id: post.id, value })
      onVote && onVote(post.id, value)
    }
    setVoting(false)
  }

  const timeAgo = (ts) => {
    const diff = (Date.now() - new Date(ts)) / 1000
    if (diff < 60) return 'только что'
    if (diff < 3600) return `${Math.floor(diff/60)}м назад`
    if (diff < 86400) return `${Math.floor(diff/3600)}ч назад`
    return `${Math.floor(diff/86400)}д назад`
  }

  return (
    <div className="flex bg-[#141416] border border-[#2e2e38] rounded-xl overflow-hidden hover:border-[#3e3e48] transition-all hover:-translate-y-0.5 group">

      {/* Vote column */}
      <div className="w-11 bg-[#1c1c20] flex flex-col items-center py-3 gap-1 flex-shrink-0">
        <button onClick={() => vote(1)} className="w-7 h-7 rounded-md flex items-center justify-center text-[#555568] hover:text-accent hover:bg-[#2e2e34] transition-all text-base">▲</button>
        <span className="font-mono text-xs font-semibold text-[#8888a0]">{post.vote_count}</span>
        <button onClick={() => vote(-1)} className="w-7 h-7 rounded-md flex items-center justify-center text-[#555568] hover:text-red-400 hover:bg-[#2e2e34] transition-all text-base">▼</button>
      </div>

      {/* Content */}
      <Link to={`/post/${post.id}`} className="flex-1 p-3.5 no-underline min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${SUB_COLORS[post.subreddit] || SUB_COLORS.general}`}>
            r/{SUB_LABELS[post.subreddit] || post.subreddit}
          </span>
          <span className="text-[11px] bg-[#2e2e34] text-[#555568] font-mono px-2 py-0.5 rounded">{post.flair}</span>
          <span className="text-[11px] text-[#555568]">
            {post.is_anonymous ? '🎭 анон' : post.author_name}
          </span>
          <span className="text-[10px] text-[#3e3e48] font-mono">{timeAgo(post.created_at)}</span>
        </div>

        <h3 className={`text-sm font-semibold leading-snug mb-1.5 ${post.is_anonymous ? 'text-purple-300' : 'text-white'}`}>
          {post.title}
        </h3>

        {post.body && (
          <p className="text-xs text-[#8888a0] leading-relaxed line-clamp-2 mb-2">{post.body}</p>
        )}

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#555568] flex items-center gap-1">
            💬 {post.comment_count}
          </span>
          {post.file_name && (
            <span className="text-[11px] bg-green-500/10 border border-green-500/20 text-green-400 font-mono px-2 py-0.5 rounded flex items-center gap-1">
              📎 {post.file_name}
            </span>
          )}
          {post.is_anonymous && (
            <span className="ml-auto text-[11px] text-purple-400/60 font-mono">🎭 анонимно</span>
          )}
        </div>
      </Link>
    </div>
  )
}
