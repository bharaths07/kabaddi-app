import React from 'react'

type Ratio = 'story' | 'square' | 'classic'

export default function RatioSelector({ value, onChange }: { value: Ratio; onChange: (v: Ratio) => void }) {
  const options: Array<{ k: Ratio; label: string }> = [
    { k: 'story', label: 'Story' },
    { k: 'square', label: 'Square' },
    { k: 'classic', label: '4:3' },
  ]
  return (
    <div style={{ display:'flex', gap:8 }}>
      {options.map(o => (
        <button key={o.k} onClick={() => onChange(o.k)} style={{
          padding:'6px 10px',
          borderRadius:8,
          border: value===o.k ? '1.5px solid #0ea5e9' : '1.5px solid #e2e8f0',
          background: value===o.k ? 'rgba(14,165,233,0.10)' : '#fff',
          color: value===o.k ? '#0ea5e9' : '#475569',
          fontWeight:800
        }}>{o.label}</button>
      ))}
    </div>
  )
}
