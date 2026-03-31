import React, { useState } from 'react';
import { Image as ImageIcon, Type, Square, Download } from 'lucide-react';

interface PosterElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  content?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color?: string;
  fontSize?: number;
}

export const PosterGeneratorScreen: React.FC = () => {
  const [elements, setElements] = useState<PosterElement[]>([
    { id: 'bg', type: 'shape', x: 0, y: 0, w: 400, h: 500, color: '#1e293b' },
    { id: 't1', type: 'text', content: 'MATCH DAY', x: 20, y: 40, w: 200, h: 40, color: '#ffffff', fontSize: 32 },
    { id: 't2', type: 'text', content: 'VS', x: 180, y: 200, w: 40, h: 40, color: '#facc15', fontSize: 24 },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [snapSize, setSnapSize] = useState<number | null>(null);
  const canvasW = 400;
  const canvasH = 500;

  const addElement = (type: 'text' | 'shape') => {
    const newEl: PosterElement = {
      id: Date.now().toString(),
      type,
      content: type === 'text' ? 'New Text' : undefined,
      x: 50,
      y: 50,
      w: 100,
      h: 50,
      color: type === 'shape' ? '#3b82f6' : '#ffffff',
      fontSize: 20
    };
    setElements([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const updateElement = (id: string, updates: Partial<PosterElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  };
  const applySnap = (n: number) => (snapSize ? Math.round(n / snapSize) * snapSize : n);
  const selectedElement = elements.find(e => e.id === selectedId) || null;
  const alignX = (pos: 'left' | 'center' | 'right') => {
    if (!selectedElement || !selectedId) return;
    const w = selectedElement.w;
    const x = pos === 'left' ? 0 : pos === 'center' ? Math.round((canvasW - w) / 2) : canvasW - w;
    updateElement(selectedId, { x: applySnap(x) });
  };
  const alignY = (pos: 'top' | 'middle' | 'bottom') => {
    if (!selectedElement || !selectedId) return;
    const h = selectedElement.h;
    const y = pos === 'top' ? 0 : pos === 'middle' ? Math.round((canvasH - h) / 2) : canvasH - h;
    updateElement(selectedId, { y: applySnap(y) });
  };

  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
      
      {/* Toolbar */}
      <div className="w-16 flex flex-col items-center py-4 bg-slate-800 border-r border-slate-700 gap-4">
        <div className="w-10 h-10 rounded bg-indigo-600 flex items-center justify-center mb-4">
          <Palette className="w-6 h-6" />
        </div>
        <button onClick={() => addElement('text')} className="p-3 hover:bg-slate-700 rounded transition-colors" title="Add Text">
          <Type className="w-6 h-6 text-slate-300" />
        </button>
        <button onClick={() => addElement('shape')} className="p-3 hover:bg-slate-700 rounded transition-colors" title="Add Shape">
          <Square className="w-6 h-6 text-slate-300" />
        </button>
        <button className="p-3 hover:bg-slate-700 rounded transition-colors" title="Add Image">
          <ImageIcon className="w-6 h-6 text-slate-300" />
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center bg-slate-950 relative overflow-hidden">
        {/* The Canvas */}
        <div 
          className="bg-slate-800 shadow-2xl relative overflow-hidden w-[400px] h-[500px]"
        >
          {elements.map(el => (
            <div
              key={el.id}
              onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
              className={`absolute cursor-move flex items-center justify-center font-bold left-[var(--x)] top-[var(--y)] w-[var(--w)] h-[var(--h)] [background-color:var(--bg)] [color:var(--fg)] text-[var(--fs)] ${selectedId === el.id ? 'ring-2 ring-indigo-500' : ''}`}
              style={{
                ['--x']: `${el.x}px`,
                ['--y']: `${el.y}px`,
                ['--w']: `${el.w}px`,
                ['--h']: `${el.h}px`,
                ['--bg']: el.type === 'shape' ? el.color || 'transparent' : 'transparent',
                ['--fg']: el.color || '#ffffff',
                ['--fs']: `${el.fontSize || 16}px`,
              } as React.CSSProperties & Record<string, string>}
            >
              {el.content}
            </div>
          ))}
        </div>
      </div>

      {/* Properties Panel */}
      <div className="w-72 bg-slate-800 border-l border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700 font-bold">Properties</div>
        
        {selectedId ? (
          <div className="p-4 space-y-4">
            {selectedElement?.type === 'text' && (
               <div>
                <label className="block text-xs text-slate-400 mb-1">Text Content</label>
                <input 
                  type="text" 
                  value={selectedElement?.content || ''}
                  onChange={(e) => updateElement(selectedId, { content: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm"
                />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1">X Position</label>
                <input 
                  type="number" 
                  value={selectedElement?.x ?? 0}
                  onChange={(e) => updateElement(selectedId, { x: applySnap(Number(e.target.value)) })}
                  className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Y Position</label>
                <input 
                  type="number" 
                  value={selectedElement?.y ?? 0}
                  onChange={(e) => updateElement(selectedId, { y: applySnap(Number(e.target.value)) })}
                  className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Width</label>
                <input
                  type="number"
                  value={selectedElement?.w ?? 0}
                  onChange={(e) => updateElement(selectedId, { w: applySnap(Number(e.target.value)) })}
                  className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Height</label>
                <input
                  type="number"
                  value={selectedElement?.h ?? 0}
                  onChange={(e) => updateElement(selectedId, { h: applySnap(Number(e.target.value)) })}
                  className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm"
                />
              </div>
            </div>

            {selectedElement?.type === 'text' && (
              <div>
                <label className="block text-xs text-slate-400 mb-1">Font Size</label>
                <input
                  type="number"
                  value={selectedElement?.fontSize ?? 16}
                  onChange={(e) => updateElement(selectedId, { fontSize: applySnap(Number(e.target.value)) })}
                  className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-400 mb-1">Color</label>
              <input 
                type="color" 
                value={selectedElement?.color || '#ffffff'}
                onChange={(e) => updateElement(selectedId, { color: e.target.value })}
                className="w-full h-10 bg-slate-900 border border-slate-600 rounded cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => alignX('left')}
                disabled={!selectedElement}
                className="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded text-xs"
              >
                Align Left
              </button>
              <button
                type="button"
                onClick={() => alignX('center')}
                disabled={!selectedElement}
                className="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded text-xs"
              >
                Align Center
              </button>
              <button
                type="button"
                onClick={() => alignX('right')}
                disabled={!selectedElement}
                className="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded text-xs"
              >
                Align Right
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => alignY('top')}
                disabled={!selectedElement}
                className="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded text-xs"
              >
                Align Top
              </button>
              <button
                type="button"
                onClick={() => alignY('middle')}
                disabled={!selectedElement}
                className="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded text-xs"
              >
                Align Middle
              </button>
              <button
                type="button"
                onClick={() => alignY('bottom')}
                disabled={!selectedElement}
                className="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded text-xs"
              >
                Align Bottom
              </button>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Snap to Grid</label>
              <select
                value={snapSize ?? 'none'}
                onChange={(e) => {
                  const val = e.target.value;
                  setSnapSize(val === 'none' ? null : Number(val));
                }}
                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm"
              >
                <option value="none">None</option>
                <option value="5">5px</option>
                <option value="10">10px</option>
                <option value="20">20px</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-sm">
            Select an element to edit its properties.
          </div>
        )}

        <div className="mt-auto p-4 border-t border-slate-700">
           <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded font-bold flex items-center justify-center gap-2">
             <Download className="w-4 h-4" /> Export Poster
           </button>
        </div>
      </div>

    </div>
  );
};

// Icon component needed for the layout above
const Palette = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
  </svg>
);
