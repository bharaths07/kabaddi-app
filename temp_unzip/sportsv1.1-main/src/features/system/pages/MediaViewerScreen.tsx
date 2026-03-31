import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGlobalState } from '@/app/AppProviders';
import { playerService } from '@/features/players/api/playerService';
import { Player, Photo, Highlight } from '@/features/players/types/player';
import { X, Maximize2, Minimize2, Share2, ChevronLeft, ChevronRight, Grid } from 'lucide-react';

export const MediaViewerScreen: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { players, updatePlayerState } = useGlobalState();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showGrid, setShowGrid] = useState(false); // [NEW] Gallery grid view
  const [captionInput, setCaptionInput] = useState('');
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchDelta = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const allMedia = useMemo(() => {
    const list: Array<{ id: string; type: 'photo' | 'highlight'; src: string; thumb: string; title: string; date?: string; isVideo: boolean }> = [];
    players.forEach((p: Player) => {
      (p.photos || []).forEach((ph: Photo) => {
        if (ph?.id && ph?.url) {
          list.push({ id: ph.id, type: 'photo', src: ph.url, thumb: ph.url, title: ph.caption || 'Photo', date: ph.date, isVideo: false });
        }
      });
      (p.highlights || []).forEach((h: Highlight) => {
        if (h?.id && h.thumbnailUrl) {
          // If it's a video, 'src' should eventually be the video URL, not thumb.
          // For now we assume thumbnailUrl is the display, but we'll mark it as isVideo.
          list.push({ id: h.id, type: 'highlight', src: h.thumbnailUrl, thumb: h.thumbnailUrl, title: h.title || 'Highlight', date: h.date, isVideo: true });
        }
      });
    });
    return list;
  }, [players]);
  const index = useMemo(() => allMedia.findIndex(m => m.id === id), [allMedia, id]);
  const item = index >= 0 ? allMedia[index] : null;
  const prev = useCallback(() => {
    if (index > 0) {
      navigate(`/media/${allMedia[index - 1].id}`);
    }
  }, [index, allMedia, navigate]);
  const next = useCallback(() => {
    if (index < allMedia.length - 1) {
      navigate(`/media/${allMedia[index + 1].id}`);
    }
  }, [index, allMedia, navigate]);
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement && containerRef.current) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
  }, []);
  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied');
    } catch {
      alert('Failed to copy link');
    }
  };
  const beginEdit = useCallback(() => {
    if (!item || item.type !== 'photo') return;
    setCaptionInput(item.title || '');
    setIsEditing(true);
  }, [item]);
  const saveCaption = async () => {
    if (!item || item.type !== 'photo') return;
    const owner = players.find((p: Player) => (p.photos || []).some((ph: Photo) => ph.id === item.id));
    if (!owner) {
      setIsEditing(false);
      return;
    }
    const updatedPhotos = (owner.photos || []).map((ph: Photo) => ph.id === item.id ? { ...ph, caption: captionInput } : ph);
    try {
      const updatedPlayer = await playerService.updatePlayer(owner.id, { photos: updatedPhotos });
      updatePlayerState(updatedPlayer);
      setIsEditing(false);
    } catch {
      alert('Failed to save caption');
    }
  };
  const cancelEdit = () => {
    setIsEditing(false);
    setCaptionInput('');
  };
  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = e => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
    touchDelta.current = { x: 0, y: 0 };
  };
  const onTouchMove: React.TouchEventHandler<HTMLDivElement> = e => {
    if (!touchStart.current) return;
    const t = e.touches[0];
    touchDelta.current = { x: t.clientX - touchStart.current.x, y: t.clientY - touchStart.current.y };
  };
  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = () => {
    const dx = touchDelta.current.x;
    if (Math.abs(dx) > 50) {
      if (dx < 0) next();
      else prev();
    }
    touchStart.current = null;
    touchDelta.current = { x: 0, y: 0 };
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate(-1);
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key.toLowerCase() === 'f') toggleFullscreen();
      if (e.key.toLowerCase() === 'e') beginEdit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, index, prev, next, toggleFullscreen, beginEdit]);
  if (!item) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center">
          <p className="text-slate-900 font-bold">Media not found</p>
          <button
            type="button"
            onClick={() => navigate('/profile/game')}
            className="mt-4 px-4 py-2 rounded-full bg-blue-600 text-white font-bold"
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }
  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-label="Media Viewer"
      className="min-h-screen w-full bg-black flex flex-col overflow-hidden"
    >
      {/* 1. Header with Controls */}
      <div className="flex items-center justify-between p-4 z-50 bg-gradient-to-b from-black/80 to-transparent">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition backdrop-blur-md"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            className={`p-3 rounded-xl transition backdrop-blur-md ${showGrid ? 'bg-blue-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
            aria-label="Toggle Grid"
          >
            <Grid size={20} />
          </button>
          <button
            type="button"
            onClick={share}
            className="p-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition backdrop-blur-md"
            aria-label="Share"
          >
            <Share2 size={20} />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition backdrop-blur-md"
            aria-label="Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>

      {showGrid ? (
        /* 2. Grid View */
        <div className="flex-1 overflow-y-auto p-6 animate-in fade-in zoom-in duration-300">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {allMedia.map((m, i) => (
              <button
                key={m.id}
                onClick={() => {
                  navigate(`/media/${m.id}`);
                  setShowGrid(false);
                }}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${index === i ? 'border-blue-500 scale-95' : 'border-transparent hover:scale-105'
                  }`}
              >
                <img src={m.thumb} alt={m.title} className="w-full h-full object-cover" />
                {m.isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                      <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* 3. Main Viewer View */
        <div className="flex-1 flex flex-col">
          <div
            className="flex-1 flex items-center justify-center relative touch-none"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {item.isVideo ? (
              <video
                src={item.src}
                className="max-h-[70vh] max-w-full shadow-2xl"
                controls
                autoPlay
              />
            ) : (
              <img
                src={item.src}
                alt={item.title}
                className="max-h-[70vh] max-w-full object-contain select-none shadow-2xl animate-in fade-in zoom-in duration-300"
              />
            )}

            {/* Navigation Arrows */}
            <button
              type="button"
              onClick={prev}
              disabled={index <= 0}
              className="absolute left-6 top-1/2 -translate-y-1/2 p-4 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition backdrop-blur-md disabled:opacity-0 disabled:pointer-events-none"
              aria-label="Previous"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              type="button"
              onClick={next}
              disabled={index >= allMedia.length - 1}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-4 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition backdrop-blur-md disabled:opacity-0 disabled:pointer-events-none"
              aria-label="Next"
            >
              <ChevronRight size={32} />
            </button>
          </div>

          {/* 4. Bottom Info & Gallery Strip */}
          <div className="bg-gradient-to-t from-black/90 to-black/0 pt-20 pb-8 px-8">
            <div className="max-w-4xl mx-auto">
              {isEditing ? (
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/10">
                  <input
                    value={captionInput}
                    onChange={e => setCaptionInput(e.target.value.slice(0, 80))}
                    className="flex-1 bg-transparent text-white text-lg px-4 py-2 outline-none"
                    autoFocus
                  />
                  <div className="flex gap-2 pr-2">
                    <button onClick={saveCaption} className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition">Save</button>
                    <button onClick={cancelEdit} className="px-6 py-2 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-end justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h2 className="text-3xl font-extrabold text-white tracking-tight">{item.title}</h2>
                      {item.type === 'photo' && (
                        <button onClick={beginEdit} className="text-white/40 hover:text-white transition-colors">
                          Edit
                        </button>
                      )}
                    </div>
                    {item.date && <p className="text-white/60 font-medium">{item.date}</p>}
                  </div>

                  {/* Thumbnail Stripe */}
                  <div className="hidden md:flex gap-2 overflow-x-auto pb-2 scrollbar-none max-w-md">
                    {allMedia.map((m, i) => (
                      <button
                        key={m.id}
                        onClick={() => navigate(`/media/${m.id}`)}
                        className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${index === i ? 'border-blue-500 scale-110 translate-y-[-4px]' : 'border-white/10 opacity-50 hover:opacity-100'
                          }`}
                      >
                        <img src={m.thumb} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
