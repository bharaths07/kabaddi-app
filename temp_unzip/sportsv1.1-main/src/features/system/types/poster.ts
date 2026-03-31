export type PosterSize = 'instagram_story' | 'instagram_post' | 'a4' | 'landscape_hd';

export interface PosterLayer {
  id: string;
  type: 'text' | 'image' | 'shape' | 'data_field';
  content?: string; // Text content or Image URL
  dataField?: string; // e.g., 'match.homeTeam.name' for dynamic binding
  
  // Positioning & Style
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  
  // Text Styles
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  
  // Shape Styles
  backgroundColor?: string;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
}

export interface PosterTemplate {
  id: string;
  name: string;
  category: 'match_day' | 'result' | 'player_stats' | 'tournament_bracket';
  size: PosterSize;
  thumbnailUrl: string;
  layers: PosterLayer[];
  isPremium: boolean;
}

export interface PosterProject {
  id: string;
  userId: string;
  name: string;
  templateId?: string;
  size: PosterSize;
  layers: PosterLayer[];
  createdAt: string;
  updatedAt: string;
}
