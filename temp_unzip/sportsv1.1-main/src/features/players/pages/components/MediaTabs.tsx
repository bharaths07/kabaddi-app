import React from 'react';
import { Highlight, Photo } from '@/features/players/types/player';
import { Play, Image as ImageIcon } from 'lucide-react';

interface HighlightCardProps {
  highlight: Highlight;
}

const HighlightCard: React.FC<HighlightCardProps> = ({ highlight }) => {
  return (
    <div className="group relative aspect-video overflow-hidden rounded-xl bg-gray-900">
      <img
        src={highlight.thumbnailUrl}
        alt={highlight.title}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Duration Badge */}
      <div className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white">
        {highlight.duration}
      </div>

      {/* Play Icon Overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          <Play className="h-5 w-5 fill-white text-white" />
        </div>
      </div>

      {/* Title Gradient */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
        <h4 className="line-clamp-1 text-sm font-medium text-white">{highlight.title}</h4>
        <p className="mt-0.5 text-xs text-gray-300">{highlight.views} views • {highlight.date}</p>
      </div>
    </div>
  );
};

interface PhotoCardProps {
  photo: Photo;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo }) => {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100">
      <img
        src={photo.url}
        alt={photo.caption || 'Player photo'}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      {photo.caption && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6 opacity-0 transition-opacity group-hover:opacity-100">
          <p className="line-clamp-1 text-xs text-white">{photo.caption}</p>
        </div>
      )}
    </div>
  );
};

interface MediaTabsProps {
  highlights: Highlight[];
  photos: Photo[];
  activeTab: 'highlights' | 'photos';
}

export const MediaTabs: React.FC<MediaTabsProps> = ({ highlights, photos, activeTab }) => {
  if (activeTab === 'highlights') {
    if (highlights.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <Play className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900">No highlights yet</h3>
          <p className="mt-1 text-xs text-gray-500">Match highlights will appear here</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
        {highlights.map((highlight) => (
          <HighlightCard key={highlight.id} highlight={highlight} />
        ))}
      </div>
    );
  }

  if (activeTab === 'photos') {
    if (photos.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <ImageIcon className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900">No photos yet</h3>
          <p className="mt-1 text-xs text-gray-500">Action shots will appear here</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo) => (
          <PhotoCard key={photo.id} photo={photo} />
        ))}
      </div>
    );
  }

  return null;
};
