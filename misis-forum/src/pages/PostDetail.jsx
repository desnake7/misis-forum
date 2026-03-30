import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [isAnon, setIsAnon] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPost()
    fetchComments()

    const channel = supabase
      .channel(`post-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: `post_id=eq.${id}` },
        () => fetchComments())
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [id])

  async function fetchPost() {
    const { data } = await supabase.from('public_posts').select('*').eq('id', id).single()
    setPost(data)
    setLoading(false)
  }

  async function fetchComments() {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(username, flair, karma)')
      .eq('post_id', id)
      .order('created_at', { ascending: true })
    setComments(data || [])
  }

  async function submitComment(e) {
    e.preventDefault()
    if (!newComment.trim() || !user) return
    setSubmitting(true)
    await supabase.from('comments').insert({
      post_id: id,
      author_id: user.id,
      body: newComment.trim(),
      is_anonymous: isAnon,
    })
    setNewComment('')
    setSubmitting(false)
  }

  const timeAgo = (ts) => {
    const diff = (Date.now() - new Date(ts)) / 1000
    if (diff < 60) return 'только что'
    if (diff < 3600) return `${Math.floor(diff/60)}м назад`
    if (diff < 86400) return `${Math.floor(diff/3600)}ч назад`
    return `${Math.floor(diff/86400)}д назад`
  }

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-10 text-center text-[#555568] font-mono">Загрузка...</div>
  if (!post) return <div className="max-w-2xl mx-auto px-4 py-10 text-center text-[#555568] font-mono">Пост не найден</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">

      <button onClick={() => navigate(-1)} className="text-sm text-[#8888a0] hover:text-white mb-4 flex items-center gap-1 transition-colors">
        ← Назад
      </button>

      {/* Post */}
      <div className="bg-[#141416] border border-[#2e2e38] rounded-xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-400">r/{post.subreddit}</span>
          <span className="text-xs bg-[#2e2e34] text-[#555568] font-mono px-2 py-0.5 rounded">{post.flair}</span>
          <span className="text-xs text-[#555568]">{post.is_anonymous ? '🎭 анон' : post.author_name}</span>
          <span className="text-xs text-[#3e3e48] font-mono">{timeAgo(post.created_at)}</span>
        </div>

        <h1 className={`text-lg font-semibold mb-3 leading-snug ${post.is_anonymous ? 'text-purple-300' : 'text-white'}`}>
          {post.title}
        </h1>

        {post.body && <p className="text-sm text-[#8888a0] leading-relaxed mb-3">{post.body}</p>}

        {post.file_url && (
          <a href={post.file_url} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs bg-green-500/10 border border-green-500/20 text-green-400 font-mono px-3 py-1.5 rounded-lg hover:bg-green-500/15 transition-colors">
            📎 {post.file_name} — Скачать
          </a>
        )}

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#1c1c20] text-sm text-[#555568]">
          <span>▲ {post.vote_count}</span>
          <span>💬 {post.comment_count} комментариев</span>
        </div>
      </div>

      {/* Comment form */}
      {user ? (
        <form onSubmit={submitComment} className="bg-[#141416] border border-[#2e2e38] rounded-xl p-4 mb-4">
          <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
            placeholder="Написать комментарий..."
            rows={3}
            className="w-full bg-[#1c1c20] border border-[#2e2e38] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#555568] outline-none focus:border-accent transition-colors resize-none mb-3" />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-[#8888a0] cursor-pointer">
              <button type="button" onClick={() => setIsAnon(!isAnon)}
                className={`w-8 h-5 rounded-full transition-colors relative ${isAnon ? 'bg-purple-500' : 'bg-[#2e2e34]'}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isAnon ? 'translate-x-3' : 'translate-x-0.5'}`} />
              </button>
              Анонимно
            </label>
            <button type="submit" disabled={submitting || !newComment.trim()}
              className="ml-auto bg-accent hover:bg-blue-500 disabled:opacity-40 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">
              {submitting ? '...' : 'Отправить'}
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center py-5 text-[#555568] text-sm border border-[#2e2e38] rounded-xl mb-4">
          <a href="#" className="text-accent hover:underline">Войди</a> чтобы написать комментарий
        </div>
      )}

      {/* Comments */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-[#555568] font-mono text-sm">Комментариев пока нет</div>
        ) : comments.map(c => (
          <div key={c.id} className="bg-[#141416] border border-[#2e2e38] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-[#8888a0] font-medium">
                {c.is_anonymous ? '🎭 анон' : c.profiles?.username}
              </span>
              {!c.is_anonymous && c.profiles?.flair && (
                <span className="text-[10px] bg-[#2e2e34] text-[#555568] font-mono px-1.5 py-0.5 rounded">{c.profiles.flair}</span>
              )}
              <span className="text-[10px] text-[#3e3e48] font-mono ml-auto">{timeAgo(c.created_at)}</span>
            </div>
            <p className="text-sm text-[#c8c8d0] leading-relaxed">{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
