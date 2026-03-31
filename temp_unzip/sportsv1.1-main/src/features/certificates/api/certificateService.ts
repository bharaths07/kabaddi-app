import { supabase } from '@/shared/lib/supabase';
import type { PostgrestError } from '@supabase/supabase-js';
import { Certificate } from '../types/certificate';

interface DbCertificate {
  id: string;
  template_id?: string;
  type: Certificate['type'];
  player_id: string;
  recipient_name?: string;
  match_id?: string;
  tournament_id?: string;
  achievement_id?: string;
  title: string;
  description?: string;
  date: string;
  created_at?: string;
  created_by?: string;
  verification_hash?: string;
  status?: Certificate['status'];
  metadata?: Record<string, unknown>;
}

type QueryResponse<T> = { data: T | null; error: PostgrestError | null };

export const certificateService = {
  async createCertificate(certificate: Certificate): Promise<Certificate> {
    const dbCertificate = {
      type: certificate.type,
      title: certificate.title,
      player_id: certificate.playerId,
      match_id: certificate.matchId,
      achievement_id: certificate.achievementId,
      date: certificate.date,
      description: certificate.description,
      metadata: certificate.metadata
    };

    const { data, error }: QueryResponse<DbCertificate> = await supabase
      .from('certificates')
      .insert(dbCertificate)
      .select()
      .single();

    if (error) {
      console.error('Error creating certificate:', error);
      throw error;
    }

    return mapToDomain(data as DbCertificate);
  },

  async getCertificatesByPlayer(playerId: string): Promise<Certificate[]> {
    const { data, error }: QueryResponse<DbCertificate[]> = await supabase
      .from('certificates')
      .select('*')
      .eq('player_id', playerId);

    if (error) {
      console.error('Error fetching player certificates:', error);
      return [];
    }

    return (data ?? []).map(mapToDomain);
  },

  async getAllCertificates(): Promise<Certificate[]> {
    const { data, error }: QueryResponse<DbCertificate[]> = await supabase
      .from('certificates')
      .select('*');

    if (error) {
      console.error('Error fetching all certificates:', error);
      return [];
    }

    return (data ?? []).map(mapToDomain);
  }
};

function mapToDomain(db: DbCertificate): Certificate {
  return {
    id: db.id,
    templateId: db.template_id || 'default', // Default fallback
    type: db.type,
    recipientId: db.player_id, // Assuming recipient is the player
    recipientName: db.recipient_name || 'Unknown', // Fallback

    // Context
    playerId: db.player_id,
    matchId: db.match_id,
    tournamentId: db.tournament_id,
    achievementId: db.achievement_id,

    // Content
    title: db.title,
    description: db.description || undefined,
    date: db.date,

    // Verification
    issueDate: db.created_at || new Date().toISOString(),
    issuerId: db.created_by || 'system',
    verificationHash: db.verification_hash || 'pending',
    status: (db.status as 'issued' | 'draft' | 'revoked') || 'issued',

    metadata: db.metadata || {}
  };
}
