import React from 'react'

export default function StylePicker({ value, onChange }: { value: 'A'|'B'|'C'; onChange: (v: 'A'|'B'|'C') => void }) {
  return (
    <div style={{ display:'flex', gap:8 }}>
      {(['A','B','C'] as const).map(k => (
        <button key={k} onClick={() => onChange(k)} style={{
          padding:'6px 10px',
          borderRadius:8,
          border: value===k ? '1.5px solid #0ea5e9' : '1.5px solid #e2e8f0',
          background: value===k ? 'rgba(14,165,233,0.10)' : '#fff',
          color: value===k ? '#0ea5e9' : '#475569',
          fontWeight:800
        }}>{k}</button>
      ))}
    </div>
  )
}
