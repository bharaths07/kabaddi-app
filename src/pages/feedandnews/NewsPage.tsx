import { useState, useEffect } from 'react'
import { supabase } from '../../shared/lib/supabase'
import { useNavigate } from 'react-router-dom'
import './news.css'

interface NewsPost {
    id: string
    type: 'announcement' | 'result' | 'update'
    title: string
    body: string
    image_url?: string
    created_at: string
    tournament_name?: string
}

const TYPE_ICONS = {
    announcement: '📢',
    result: '⚡',
    update: '🔄'
}

export default function NewsPage() {
    const [news, setNews] = useState<NewsPost[]>([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        fetchNews()
    }, [])

    const fetchNews = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('news_posts')
                .select(`
                    id, type, title, body, image_url, created_at,
                    tournaments(name)
                `)
                .order('created_at', { ascending: false })

            if (error) throw error
            const mapped: NewsPost[] = (data || []).map((n: any) => ({
                id: n.id,
                type: n.type,
                title: n.title,
                body: n.body,
                image_url: n.image_url,
                created_at: n.created_at,
                tournament_name: n.tournaments?.name
            }))
            setNews(mapped)
        } catch (e) {
            console.error('Failed to fetch news:', e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="news-page">
            <header className="news-header">
                <h1 className="news-title">Official News</h1>
                <p className="news-sub">Tournament updates & match results</p>
            </header>

            <div className="news-list">
                {loading ? (
                    <div className="news-loading"><div className="news-spinner" /></div>
                ) : news.length === 0 ? (
                    <div className="news-empty">
                        <div className="news-empty-icon">📰</div>
                        <h3>No news yet</h3>
                        <p>Official updates will appear here.</p>
                    </div>
                ) : (
                    news.map(post => (
                        <div key={post.id} className="news-card">
                            {post.image_url && (
                                <img src={post.image_url} alt={post.title} className="news-image" />
                            )}
                            <div className="news-card-content">
                                <div className="news-meta">
                                    <span className="news-type">{TYPE_ICONS[post.type]} {post.type.toUpperCase()}</span>
                                    {post.tournament_name && <span className="news-tournament">· 🏉 {post.tournament_name}</span>}
                                    <span className="news-date">· {new Date(post.created_at).toLocaleDateString()}</span>
                                </div>
                                <h2 className="news-card-title">{post.title}</h2>
                                <p className="news-card-body">{post.body}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
