import React, { useRef } from 'react'
import PosterCanvas from '../engine/PosterCanvas'
import { exportNodePNG } from '../engine/exportPoster'
import type { PosterData } from '../engine/posterTypes'

export default function PosterPreview({ data, onClose }: { data: PosterData; onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 200 }}>
      <div style={{ background:'#fff', padding:12, borderRadius:12, width:'min(92vw, 720px)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <div style={{ fontWeight:900 }}>Poster Preview</div>
          <button onClick={onClose} style={{ border:'none', background:'transparent', cursor:'pointer', fontWeight:900 }}>×</button>
        </div>
        <div ref={containerRef}>
          <PosterCanvas data={data} />
        </div>
        <div style={{ display:'flex', gap:8, marginTop:10 }}>
          <button onClick={async () => {
            if (containerRef.current) await exportNodePNG(containerRef.current, 'poster.png')
          }} style={{ padding:'10px 12px', borderRadius:8, border:'1px solid #0ea5e9', color:'#0ea5e9', background:'transparent', fontWeight:800 }}>
            Download PNG
          </button>
          <button onClick={onClose} style={{ padding:'10px 12px', borderRadius:8, border:'1px solid #e2e8f0', background:'#f8fafc', fontWeight:800 }}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
