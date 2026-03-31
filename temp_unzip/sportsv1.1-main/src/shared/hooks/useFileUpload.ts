import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface UploadResult {
  url: string | null;
  path: string | null;
  error: string | null;
}

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (
    file: File, 
    bucket: 'player-photos' | 'match-highlights', 
    pathPrefix: string = ''
  ): Promise<UploadResult> => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${pathPrefix}${pathPrefix ? '/' : ''}${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return { url: data.publicUrl, path: filePath, error: null };
    } catch (error: any) {
      console.error('Error uploading file:', error);
      return { url: null, path: null, error: error.message };
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, uploading };
};
