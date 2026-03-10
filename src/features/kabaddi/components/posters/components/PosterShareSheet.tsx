import React from 'react'

export default function PosterShareSheet({ onDownload, onClose }: { onDownload: () => void; onClose: () => void }) {
  return (
    <div style={{ position:'fixed', left:0, right:0, bottom:0, background:'#fff', borderTopLeftRadius:16, borderTopRightRadius:16, boxShadow:'0 -6px 24px rgba(0,0,0,0.12)', padding:16, zIndex:201 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <div style={{ fontWeight:900 }}>Share Poster</div>
        <button onClick={onClose} style={{ border:'none', background:'transparent', cursor:'pointer', fontWeight:900 }}>Close</button>
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={onDownload} style={{ padding:'10px 12px', borderRadius:8, border:'1px solid #0ea5e9', color:'#0ea5e9', background:'transparent', fontWeight:800 }}>
          Download PNG
        </button>
      </div>
    </div>
  )
}
