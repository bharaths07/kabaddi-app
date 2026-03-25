import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../shared/lib/supabase'
import { useAuth } from '../../shared/context/AuthContext'
import './feed.css'

// ── Types ─────────────────────────────────────────────────────────
type PostType = 'photo' | 'announcement' | 'achievement' | 'result'

interface FeedPost {
  id: string
  user_id: string
  type: PostType
  caption: string
  image_url?: string
  likes_count: number
  created_at: string
  tournament_id?: string
  match_id?: string
  // joined
  author_name?: string
  author_initials?: string
  author_color?: string
  author_avatar?: string
  tournament_name?: string
  liked_by_me?: boolean
}

const TYPE_CONFIG: Record<PostType, { emoji: string; label: string; bg: string; color: string }> = {
  photo:        { emoji: '📸', label: 'Photo',        bg: '#eff6ff', color: '#0ea5e9' },
  announcement: { emoji: '📢', label: 'Announcement', bg: '#fff7ed', color: '#ea580c' },
  achievement:  { emoji: '🏆', label: 'Achievement',  bg: '#fefce8', color: '#d97706' },
  result:       { emoji: '⚡', label: 'Result',        bg: '#f0fdf4', color: '#16a34a' },
}

const COLORS = ['#0ea5e9','#ea580c','#16a34a','#7c3aed','#db2777','#d97706','#0284c7']

function getColor(userId: string) {
  let h = 0
  for (let i = 0; i < userId.length; i++) h = userId.charCodeAt(i) + ((h << 5) - h)
  return COLORS[Math.abs(h) % COLORS.length]
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'PL'
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

// ── Create Post Modal ─────────────────────────────────────────────
function CreatePostModal({ onClose, onPosted }: { onClose: () => void; onPosted: () => void }) {
  const { user, profile } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)
  const [type, setType] = useState<PostType>('photo')
  const [caption, setCaption] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setImageFile(f)
    const r = new FileReader()
    r.onload = ev => setImagePreview(ev.target?.result as string)
    r.readAsDataURL(f)
  }

  const handleSubmit = async () => {
    if (!caption.trim()) { setError('Write something first!'); return }
    if (!user) { setError('Please login first'); return }
    setLoading(true)
    setError('')
    try {
      let image_url: string | undefined
      // Upload image if selected
      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        const path = `feed/${user.id}/${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage
          .from('feed-images')
          .upload(path, imageFile, { upsert: true })
        if (upErr) throw upErr
        const { data } = supabase.storage.from('feed-images').getPublicUrl(path)
        image_url = data.publicUrl
      }

      const { error: insertErr } = await supabase.from('feed_posts').insert({
        user_id: user.id,
        type,
        caption: caption.trim(),
        image_url,
      })
      if (insertErr) throw insertErr

      onPosted()
      onClose()
    } catch (e: any) {
      // If storage bucket doesn't exist yet, post without image
      if (e.message?.includes('bucket') || e.message?.includes('storage')) {
        try {
          const { error: insertErr } = await supabase.from('feed_posts').insert({
            user_id: user.id,
            type,
            caption: caption.trim(),
          })
          if (insertErr) throw insertErr
          onPosted()
          onClose()
          return
        } catch (e2: any) {
          setError(e2.message || 'Failed to post')
        }
      } else {
        setError(e.message || 'Failed to post')
      }
    } finally {
      setLoading(false)
    }
  }

  const authorName = profile?.full_name || user?.email?.split('@')[0] || 'You'
  const authorColor = user ? getColor(user.id) : '#0ea5e9'

  return (
    <div className="feed-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="feed-modal">
        {/* Header */}
        <div className="feed-modal-header">
          <div className="feed-modal-title">Create Post</div>
          <button className="feed-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Author */}
        <div className="feed-modal-author">
          <div className="feed-post-avatar" style={{ background: authorColor }}>
            {initials(authorName)}
          </div>
          <div className="feed-modal-author-name">{authorName}</div>
        </div>

        {/* Post type selector */}
        <div className="feed-type-selector">
          {(Object.entries(TYPE_CONFIG) as [PostType, typeof TYPE_CONFIG[PostType]][]).map(([t, cfg]) => (
            <button key={t} className={`feed-type-btn ${type === t ? 'active' : ''}`}
              style={type === t ? { background: cfg.bg, color: cfg.color, borderColor: cfg.color } : {}}
              onClick={() => setType(t)}>
              {cfg.emoji} {cfg.label}
            </button>
          ))}
        </div>

        {/* Caption */}
        <textarea
          className="feed-caption-input"
          placeholder={
            type === 'photo' ? "Share a winning moment..." :
            type === 'announcement' ? "Make an announcement..." :
            type === 'achievement' ? "Share your achievement..." :
            "Share a match result..."
          }
          value={caption}
          onChange={e => setCaption(e.target.value)}
          maxLength={500}
          rows={4}
          autoFocus
        />
        <div className="feed-char-count">{caption.length}/500</div>

        {/* Image upload */}
        <div className="feed-image-upload" onClick={() => fileRef.current?.click()}>
          {imagePreview ? (
            <div className="feed-image-preview-wrap">
              <img src={imagePreview} className="feed-image-preview" alt="preview"/>
              <button className="feed-image-remove" onClick={e => { e.stopPropagation(); setImageFile(null); setImagePreview(null) }}>✕</button>
            </div>
          ) : (
            <div className="feed-upload-placeholder">
              <div className="feed-upload-icon">📷</div>
              <div className="feed-upload-text">Add a photo (optional)</div>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage}/>

        {error && <div className="feed-error">{error}</div>}

        {/* Submit */}
        <button className="feed-submit-btn" onClick={handleSubmit} disabled={loading || !caption.trim()}>
          {loading ? <span className="feed-spinner"/> : 'Post'}
        </button>
      </div>
    </div>
  )
}

// ── Post Card ─────────────────────────────────────────────────────
function PostCard({ post, onLike, onShare }: {
  post: FeedPost
  onLike: (id: string, liked: boolean) => void
  onShare: (post: FeedPost) => void
}) {
  const cfg = TYPE_CONFIG[post.type] || TYPE_CONFIG.announcement
  const [likeAnim, setLikeAnim] = useState(false)

  const handleLike = () => {
    setLikeAnim(true)
    setTimeout(() => setLikeAnim(false), 600)
    onLike(post.id, !!post.liked_by_me)
  }

  return (
    <div className="feed-post-card">
      {/* Header */}
      <div className="feed-post-header">
        <div className="feed-post-avatar" style={{
          background: post.author_avatar
            ? `url(${post.author_avatar}) center/cover`
            : (post.author_color || '#0ea5e9')
        }}>
          {!post.author_avatar && (post.author_initials || 'PL')}
        </div>
        <div className="feed-post-meta">
          <div className="feed-post-author">{post.author_name || 'Anonymous'}</div>
          <div className="feed-post-time">
            {post.tournament_name && (
              <span className="feed-post-tournament">🏉 {post.tournament_name} · </span>
            )}
            {timeAgo(post.created_at)}
          </div>
        </div>
        <div className="feed-post-type-badge"
          style={{ background: cfg.bg, color: cfg.color }}>
          {cfg.emoji} {cfg.label}
        </div>
      </div>

      {/* Image */}
      {post.image_url && (
        <div className="feed-post-image-wrap">
          <img src={post.image_url} alt="post" className="feed-post-image"/>
        </div>
      )}

      {/* Caption */}
      <p className="feed-post-caption">{post.caption}</p>

      {/* Actions */}
      <div className="feed-post-actions">
        <button
          className={`feed-action-btn feed-like-btn ${post.liked_by_me ? 'liked' : ''} ${likeAnim ? 'pop' : ''}`}
          onClick={handleLike}>
          <span className="feed-like-icon">{post.liked_by_me ? '❤️' : '🤍'}</span>
          <span className="feed-action-count">{post.likes_count}</span>
        </button>
        <button className="feed-action-btn" onClick={() => onShare(post)}>
          <span>↗</span>
          <span className="feed-action-label">Share</span>
        </button>
        <div className="feed-post-date">{new Date(post.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</div>
      </div>
    </div>
  )
}

// ── Share Sheet ───────────────────────────────────────────────────
function ShareSheet({ post, onClose }: { post: FeedPost; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const text = `${post.caption}\n\n— via KabaddiPulse`

  const copy = () => {
    navigator.clipboard?.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => { setCopied(false); onClose() }, 1500)
  }
  const share = (platform: string) => {
    const encoded = encodeURIComponent(text)
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encoded}`,
      twitter:  `https://twitter.com/intent/tweet?text=${encoded}`,
    }
    if (urls[platform]) window.open(urls[platform], '_blank')
    onClose()
  }

  return (
    <div className="feed-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="feed-share-sheet">
        <div className="feed-modal-header">
          <div className="feed-modal-title">Share Post</div>
          <button className="feed-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="feed-share-preview">{post.caption.slice(0, 100)}{post.caption.length > 100 ? '...' : ''}</div>
        <div className="feed-share-options">
          <button className="feed-share-option" onClick={() => share('whatsapp')}>
            <div className="feed-share-icon" style={{ background: '#25d366' }}>W</div>
            <div className="feed-share-label">WhatsApp</div>
          </button>
          <button className="feed-share-option" onClick={() => share('twitter')}>
            <div className="feed-share-icon" style={{ background: '#1da1f2' }}>X</div>
            <div className="feed-share-label">Twitter / X</div>
          </button>
          <button className="feed-share-option" onClick={copy}>
            <div className="feed-share-icon" style={{ background: '#64748b' }}>
              {copied ? '✓' : '📋'}
            </div>
            <div className="feed-share-label">{copied ? 'Copied!' : 'Copy'}</div>
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN FEED PAGE
// ═══════════════════════════════════════════════════════════════════
export default function FeedPage() {
  const { user, profile } = useAuth()
  const [posts, setPosts]           = useState<FeedPost[]>([])
  const [loading, setLoading]       = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore]       = useState(true)
  const [tab, setTab]               = useState<'all' | 'my-team' | 'tournaments'>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [sharePost, setSharePost]   = useState<FeedPost | null>(null)
  const [error, setError]           = useState('')
  const PAGE_SIZE = 10

  useEffect(() => { fetchPosts(true) }, [tab])

  async function fetchPosts(reset = false) {
    if (reset) setLoading(true)
    else setLoadingMore(true)
    setError('')

    try {
      const from = reset ? 0 : posts.length
      const { data, error: err } = await supabase
        .from('feed_posts')
        .select(`
          id, user_id, type, caption, image_url,
          likes_count, created_at, tournament_id, match_id,
          profiles!inner(full_name, avatar_url),
          tournaments(name)
        `)
        .order('created_at', { ascending: false })
        .range(from, from + PAGE_SIZE - 1)

      if (err) throw err

      // Also fetch which posts the current user liked
      let likedIds = new Set<string>()
      if (user && data?.length) {
        try {
          const ids = data.map((p: any) => p.id)
          const { data: likes, error: lErr } = await supabase
            .from('feed_likes')
            .select('post_id')
            .eq('user_id', user.id)
            .in('post_id', ids)
          
          if (!lErr) {
            likedIds = new Set((likes || []).map((l: any) => l.post_id))
          }
        } catch (le) {
          console.warn('Could not fetch feed_likes, continuing without liked states.')
        }
      }

      const mapped: FeedPost[] = (data || []).map((p: any) => ({
        id:              p.id,
        user_id:         p.user_id,
        type:            p.type as PostType,
        caption:         p.caption,
        image_url:       p.image_url,
        likes_count:     p.likes_count || 0,
        created_at:      p.created_at,
        tournament_id:   p.tournament_id,
        match_id:        p.match_id,
        author_name:     p.profiles?.full_name || 'Anonymous',
        author_initials: initials(p.profiles?.full_name || 'Anonymous'),
        author_color:    getColor(p.user_id),
        author_avatar:   p.profiles?.avatar_url,
        tournament_name: p.tournaments?.name,
        liked_by_me:     likedIds.has(p.id),
      }))

      setPosts(reset ? mapped : [...posts, ...mapped])
      setHasMore(mapped.length === PAGE_SIZE)
    } catch (e: any) {
      setError(e.message || 'Failed to load feed')
      // No mock posts in production
      if (reset) setPosts([])
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  async function handleLike(postId: string, alreadyLiked: boolean) {
    if (!user) return
    // Optimistic update
    setPosts(prev => prev.map(p => p.id === postId
      ? { ...p, liked_by_me: !alreadyLiked, likes_count: alreadyLiked ? p.likes_count - 1 : p.likes_count + 1 }
      : p
    ))
    try {
      if (alreadyLiked) {
        await supabase.from('feed_likes').delete()
          .eq('post_id', postId).eq('user_id', user.id)
      } else {
        await supabase.from('feed_likes').insert({ post_id: postId, user_id: user.id })
      }
    } catch {
      // Revert on error
      setPosts(prev => prev.map(p => p.id === postId
        ? { ...p, liked_by_me: alreadyLiked, likes_count: alreadyLiked ? p.likes_count + 1 : p.likes_count - 1 }
        : p
      ))
    }
  }

  const authorName  = profile?.full_name || user?.email?.split('@')[0] || 'You'
  const authorColor = user ? getColor(user.id) : '#0ea5e9'

  return (
    <div className="feed-page">
      {/* Header */}
      <div className="feed-header">
        <div className="feed-header-top">
          <h1 className="feed-title">Feed</h1>
          <button className="feed-create-fab" onClick={() => setShowCreate(true)}>
            + Post
          </button>
        </div>

        {/* Tabs */}
        <div className="feed-tabs">
          {([['all','🌍 All'],['my-team','👥 My Team'],['tournaments','🏆 Tournaments']] as const).map(([t,label]) => (
            <button key={t} className={`feed-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t as any)}>{label}</button>
          ))}
        </div>
      </div>

      {/* Create post prompt */}
      <div className="feed-create-prompt" onClick={() => setShowCreate(true)}>
        <div className="feed-post-avatar" style={{ background: authorColor, flexShrink: 0 }}>
          {initials(authorName)}
        </div>
        <div className="feed-create-placeholder">
          Share a winning moment, result or announcement...
        </div>
        <div className="feed-create-icons">
          <span>📸</span>
          <span>📢</span>
        </div>
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="feed-error-banner">
          ⚠️ {error}
          {error.includes('feed_posts') && (
            <span> — Run <code>feed_tables.sql</code> in Supabase first</span>
          )}
        </div>
      )}

      {/* Posts */}
      <div className="feed-list">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="feed-skeleton">
              <div className="feed-skeleton-header">
                <div className="feed-skeleton-avatar"/>
                <div className="feed-skeleton-lines">
                  <div className="feed-skeleton-line" style={{ width: '60%' }}/>
                  <div className="feed-skeleton-line" style={{ width: '40%', marginTop: 6 }}/>
                </div>
              </div>
              <div className="feed-skeleton-body"/>
            </div>
          ))
        ) : posts.length === 0 ? (
          <div className="feed-empty">
            <div className="feed-empty-icon">📸</div>
            <div className="feed-empty-title">No posts yet</div>
            <div className="feed-empty-sub">Be the first to share a kabaddi moment!</div>
            <button className="feed-empty-btn" onClick={() => setShowCreate(true)}>
              Create First Post
            </button>
          </div>
        ) : (
          posts.map(post => (
            <PostCard key={post.id} post={post}
              onLike={handleLike}
              onShare={setSharePost}
            />
          ))
        )}

        {/* Load more */}
        {!loading && hasMore && posts.length > 0 && (
          <button className="feed-load-more" onClick={() => fetchPosts(false)} disabled={loadingMore}>
            {loadingMore ? <span className="feed-spinner"/> : 'Load more'}
          </button>
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <CreatePostModal
          onClose={() => setShowCreate(false)}
          onPosted={() => fetchPosts(true)}
        />
      )}
      {sharePost && (
        <ShareSheet post={sharePost} onClose={() => setSharePost(null)}/>
      )}
    </div>
  )
}