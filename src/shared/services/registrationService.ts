import { supabase } from '../lib/supabase'

export interface RegistrationRequest {
  id?: string
  tournament_id: string
  user_id: string
  team_name: string
  team_short: string
  team_color: string
  captain_name: string
  players: any[]
  status: 'pending' | 'approved' | 'rejected'
  created_at?: string
}

class RegistrationService {
  /**
   * Submit a new team registration request
   */
  async submitRequest(request: Partial<RegistrationRequest>) {
    try {
      const { data, error } = await supabase
        .from('registration_requests')
        .insert({
          ...request,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data as RegistrationRequest
    } catch (err) {
      console.error('Error submitting registration request:', err)
      return null
    }
  }

  /**
   * Fetch all requests for a specific tournament (Organizer view)
   */
  async getTournamentRequests(tournamentId: string) {
    try {
      const { data, error } = await supabase
        .from('registration_requests')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as RegistrationRequest[]
    } catch (err) {
      console.error('Error fetching tournament requests:', err)
      return []
    }
  }

  /**
   * Update request status (Approve/Reject)
   */
  async updateStatus(requestId: string, status: 'approved' | 'rejected') {
    try {
      const { data, error } = await supabase
        .from('registration_requests')
        .update({ status })
        .eq('id', requestId)
        .select()
        .single()

      if (error) throw error
      return data as RegistrationRequest
    } catch (err) {
      console.error('Error updating registration status:', err)
      return null
    }
  }

  /**
   * Check if a user has already applied to a tournament
   */
  async getUserRequest(tournamentId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('registration_requests')
        .select('*')
        .eq('tournament_id', tournamentId)
        .eq('user_id', userId)
        .maybeSingle()

      if (error) throw error
      return data as RegistrationRequest | null
    } catch (err) {
      console.error('Error checking user request:', err)
      return null
    }
  }
}

export const registrationService = new RegistrationService()
