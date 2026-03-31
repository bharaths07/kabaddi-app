import React, { useState, useRef, useEffect } from 'react';
import { Upload, Plus, X, Pencil, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFileUpload } from '@/shared/hooks/useFileUpload';
import { useGlobalState } from '@/app/AppProviders';
import { playerService } from '@/features/players/api/playerService';
import { supabase } from '@/shared/lib/supabase';
import { Photo } from '@/features/players/types/player';

export const GameProfilePhotos: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploading } = useFileUpload();
  const { currentUser, players, updatePlayerState } = useGlobalState();

  // Find current player
  const player = players.find(p => p.userId === currentUser?.id);

  // Initialize with persisted photos or empty array
  const [photos, setPhotos] = useState<Photo[]>(player?.photos || []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [captionInput, setCaptionInput] = useState<string>('');
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Sync with player data when it changes
  useEffect(() => {
    if (player?.photos) {
      setPhotos(player.photos);
    }
  }, [player]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!player) {
      alert("Player profile not found. Please ensure you are logged in.");
      return;
    }
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const tempId = `temp-${Date.now()}-${i}`;

      const tempPhoto = {
        id: tempId,
        url: '',
        caption: 'Uploading...',
        date: new Date().toISOString().split('T')[0],
        uploading: true
      } as any;

      setPhotos(prev => [tempPhoto, ...prev]);

      const { url, path, error } = await uploadFile(file, 'player-photos');

      if (url) {
        const finalPhoto: Photo = {
          id: Date.now().toString(),
          url,
          path: path || undefined,
          bucket: 'player-photos',
          caption: file.name,
          date: new Date().toISOString().split('T')[0]
        };

        setPhotos(prev => {
          const withoutTemp = prev.filter(p => p.id !== tempId);
          return [finalPhoto, ...withoutTemp];
        });

        try {
          const updatedPhotos = [finalPhoto, ...photos.filter(p => p.id !== tempId)];
          const updatedPlayer = await playerService.updatePlayer(player.id, { photos: updatedPhotos });
          updatePlayerState(updatedPlayer);
        } catch (err) {
          console.error("Failed to save photo metadata", err);
        }
      } else {
        setPhotos(prev => prev.filter(p => p.id !== tempId));
        alert(`Upload failed: ${error}`);
      }
    }
    // Reset input to allow re-uploading same files if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const deletePhoto = async (photoId: string) => {
    if (!player) return;
    if (!confirm('Delete this photo?')) return;
    const photo = photos.find(p => p.id === photoId);
    try {
      if (photo?.bucket && photo?.path) {
        await supabase.storage.from(photo.bucket).remove([photo.path]);
      }
    } catch (e) { void e; }
    const updatedPhotos = photos.filter(p => p.id !== photoId);
    setPhotos(updatedPhotos);
    try {
      const updatedPlayer = await playerService.updatePlayer(player.id, { photos: updatedPhotos });
      updatePlayerState(updatedPlayer);
    } catch (err) {
      console.error('Failed to delete photo', err);
    }
  };

  const startEdit = (photoId: string) => {
    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;
    setEditingId(photoId);
    setCaptionInput(photo.caption || '');
  };

  const saveCaption = async () => {
    if (!player || !editingId) return;
    const updatedPhotos = photos.map(p => p.id === editingId ? { ...p, caption: captionInput } : p);
    setPhotos(updatedPhotos);
    setEditingId(null);
    try {
      const updatedPlayer = await playerService.updatePlayer(player.id, { photos: updatedPhotos });
      updatePlayerState(updatedPlayer);
    } catch (err) {
      console.error('Failed to update caption', err);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setCaptionInput('');
  };

  const onItemKeyDown = (idx: number, e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const p = photos[idx];
      if (p) navigate(`/media/${p.id}`);
    } else if (e.key === 'ArrowRight') {
      const next = itemRefs.current[idx + 1];
      next?.focus();
    } else if (e.key === 'ArrowLeft') {
      const prev = itemRefs.current[idx - 1];
      prev?.focus();
    } else if (e.key === 'Escape') {
      (document.activeElement as HTMLElement)?.blur();
    }
  };

  return (
    <div className="space-y-6" role="region" aria-label="Photo Gallery">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*"
        multiple
      />

      {/* Upload Action */}
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-900 text-lg">Photo Gallery</h3>
        <button
          type="button"
          onClick={triggerUpload}
          disabled={uploading}
          className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <span className="animate-pulse">Uploading...</span>
          ) : (
            <>
              <Upload size={16} />
              <span>Upload</span>
            </>
          )}
        </button>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4" role="grid" aria-label="Photos">
        {/* Add New Placeholder */}
        <div
          onClick={triggerUpload}
          className="aspect-square bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all cursor-pointer group"
          role="button"
          tabIndex={0}
          aria-label="Add Photo"
        >
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
            <Plus size={20} />
          </div>
          <span className="text-xs font-bold">Add Photo</span>
        </div>

        {/* Photos */}
        {photos.map((photo, idx) => (
          <div
            key={photo.id}
            onClick={() => navigate(`/media/${photo.id}`)}
            className="aspect-square relative group overflow-hidden rounded-xl cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={photo.caption ? `Open ${photo.caption}` : 'Open photo'}
            onKeyDown={(e: any) => onItemKeyDown(idx, e)}
            ref={(el) => { itemRefs.current[idx] = el; }}
          >
            {/* Photo Image */}
            <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />

            {(photo as any).uploading && (
              <div className="absolute inset-0 bg-black/40 text-white flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  <span className="text-xs font-bold">Uploading...</span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={(e: any) => { e.stopPropagation(); deletePhoto(photo.id); }}
              className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/90 text-slate-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Delete"
            >
              <X size={16} />
            </button>

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
              {editingId === photo.id ? (
                <div className="flex items-center gap-2">
                  <input
                    value={captionInput}
                    onChange={(e: any) => setCaptionInput(e.target.value.slice(0, 60))}
                    className="flex-1 bg-white/90 text-slate-900 text-xs px-2 py-1 rounded"
                    aria-label="Caption"
                  />
                  <span className="text-[10px] text-white/80">{Math.max(0, 60 - captionInput.length)}</span>
                  <button
                    type="button"
                    onClick={(e: any) => { e.stopPropagation(); saveCaption(); }}
                    className="text-xs font-bold bg-green-600 text-white px-2 py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={(e: any) => { e.stopPropagation(); cancelEdit(); }}
                    className="text-xs font-bold bg-slate-600 text-white px-2 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-white text-sm font-bold truncate">{photo.caption}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-white/70 text-[10px]">{photo.date}</p>
                    <button
                      type="button"
                      onClick={(e: any) => { e.stopPropagation(); startEdit(photo.id); }}
                      className="text-white/80 hover:text-white transition-colors"
                      aria-label="Edit caption"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
