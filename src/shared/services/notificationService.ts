import { supabase } from '../lib/supabase'

export type NotiType = 'match' | 'tournament' | 'poster' | 'system'

export interface Notification {
  id: string
  user_id?: string
  type: NotiType
  title: string
  body: string
  created_at: string
  is_read: boolean
  href?: string
  metadata?: any
}

export const notificationService = {
  async getNotifications(userId?: string): Promise<Notification[]> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })

      if (userId) {
        query = query.eq('user_id', userId)
      } else {
        query = query.is('user_id', null)
      }

      const { data, error } = await query

      if (error) {
        console.warn('Error fetching notifications:', error.message)
        return []
      }
      return (data || []).map(n => ({
        id: n.id,
        user_id: n.user_id,
        type: n.type,
        title: n.title,
        body: n.body,
        created_at: n.created_at,
        is_read: n.is_read,
        href: n.href,
        metadata: n.metadata
      }))
    } catch (err) {
      console.error('Unexpected error in getNotifications:', err)
      return []
    }
  },

  async createNotification(noti: Omit<Notification, 'id' | 'created_at' | 'is_read'>): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: noti.user_id,
          type: noti.type,
          title: noti.title,
          body: noti.body,
          href: noti.href,
          metadata: noti.metadata,
          is_read: false
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error creating notification:', err)
      return null
    }
  },

  async markAsRead(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)

      if (error) throw error
      return true
    } catch (err) {
      console.error('Error marking notification as read:', err)
      return false
    }
  },

  async markAllAsRead(userId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false)

      if (userId) {
        query = query.eq('user_id', userId)
      } else {
        query = query.is('user_id', null)
      }

      const { error } = await query
      if (error) throw error
      return true
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
      return false
    }
  },

  async deleteNotification(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (err) {
      console.error('Error deleting notification:', err)
      return false
    }
  },

  async clearAll(userId?: string): Promise<boolean> {
    try {
      let query = supabase.from('notifications').delete()
      if (userId) {
        query = query.eq('user_id', userId)
      } else {
        query = query.is('user_id', null)
      }

      const { error } = await query
      if (error) throw error
      return true
    } catch (err) {
      console.error('Error clearing notifications:', err)
      return false
    }
  }
}
