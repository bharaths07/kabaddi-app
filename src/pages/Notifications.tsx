import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import './notifications.css'
import { notificationService, Notification as NotiItem, NotiType } from '../shared/services/notificationService'
import { useAuth } from '../shared/context/AuthContext'

function agoLabel(dateStr: string) {
  const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (d < 60) return `${d}s`
  if (d < 3600) return `${Math.floor(d/60)}m`
  if (d < 86400) return `${Math.floor(d/3600)}h`
  return `${Math.floor(d/86400)}d`
}

export default function Notifications() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'all' | NotiType>('all')
  const [items, setItems] = useState<NotiItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    const data = await notificationService.getNotifications(user?.id)
    setItems(data)
    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  const filtered = useMemo(() => items.filter(i => tab === 'all' ? true : i.type === tab), [items, tab])
  const today = filtered.filter(i => Date.now() - new Date(i.created_at).getTime() < 86400000)
  const earlier = filtered.filter(i => Date.now() - new Date(i.created_at).getTime() >= 86400000)

  const markAllRead = async () => {
    const success = await notificationService.markAllAsRead(user?.id)
    if (success) {
      setItems(prev => prev.map(i => ({ ...i, is_read: true })))
    }
  }

  const clearAll = async () => {
    const success = await notificationService.clearAll(user?.id)
    if (success) {
      setItems([])
    }
  }

  const toggleRead = async (id: string) => {
    const item = items.find(i => i.id === id)
    if (!item) return
    
    // Toggle logic: if unread, mark as read. If already read, we don't have a "mark unread" in DB yet but we can simulate it for now or just mark as read.
    // For now, let's just implement mark as read if it's unread.
    if (!item.is_read) {
      const success = await notificationService.markAsRead(id)
      if (success) {
        setItems(prev => prev.map(i => i.id === id ? ({ ...i, is_read: true }) : i))
      }
    }
  }

  const remove = async (id: string) => {
    const success = await notificationService.deleteNotification(id)
    if (success) {
      setItems(prev => prev.filter(i => i.id !== id))
    }
  }

  const Tab = ({ k, label }: { k: 'all' | NotiType; label: string }) => (
    <button className={`nt-tab ${tab===k?'active':''}`} onClick={() => setTab(k)}>{label}</button>
  )

  const Row = ({ n }: { n: NotiItem }) => (
    <div className={`nt-row ${!n.is_read ? 'unread' : ''}`}>
      <div className={`nt-dot ${!n.is_read ? 'on' : ''}`} />
      <div className={`nt-badge t-${n.type}`}>{n.type}</div>
      <div className="nt-main">
        <div className="nt-title">{n.title}</div>
        <div className="nt-body">{n.body}</div>
      </div>
      <div className="nt-meta">{agoLabel(n.created_at)}</div>
      <div className="nt-actions">
        {n.href && <Link to={n.href} className="btn btn-outline-sky btn-sm">Open</Link>}
        {!n.is_read && <button className="btn btn-ghost btn-sm" onClick={() => toggleRead(n.id)}>Mark read</button>}
        <button className="btn btn-danger btn-sm" onClick={() => remove(n.id)}>Delete</button>
      </div>
    </div>
  )

  if (loading && items.length === 0) {
    return <div className="nt-page"><div className="nt-empty">Loading notifications...</div></div>
  }

  return (
    <div className="nt-page">
      <div className="nt-head">
        <div className="nt-title">Notifications</div>
        <div className="nt-actions-head">
          <button className="btn btn-outline-sky btn-sm" onClick={markAllRead}>Mark all read</button>
          <button className="btn btn-danger btn-sm" onClick={clearAll}>Clear all</button>
        </div>
      </div>
      <div className="nt-tabs">
        <Tab k="all" label="All" />
        <Tab k="match" label="Matches" />
        <Tab k="tournament" label="Tournaments" />
        <Tab k="poster" label="Posters" />
        <Tab k="system" label="System" />
      </div>
      {today.length > 0 && (
        <div className="nt-section">
          <div className="nt-section-title">Today</div>
          <div className="nt-list">
            {today.map(n => <Row key={n.id} n={n} />)}
          </div>
        </div>
      )}
      {earlier.length > 0 && (
        <div className="nt-section">
          <div className="nt-section-title">Earlier</div>
          <div className="nt-list">
            {earlier.map(n => <Row key={n.id} n={n} />)}
          </div>
        </div>
      )}
      {today.length === 0 && earlier.length === 0 && (
        <div className="nt-empty">
          <div className="nt-empty-title">No notifications</div>
          <div className="nt-empty-sub">You’re all caught up</div>
        </div>
      )}
    </div>
  )
}
