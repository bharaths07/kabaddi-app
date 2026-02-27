import React, { useEffect, useMemo, useState } from 'react'
import './settings.css'
import { getSettings, updateSettings } from '../shared/state/settingsStore'

export default function Settings() {
  const initial = useMemo(() => getSettings(), [])
  const [theme, setTheme] = useState(initial.theme)
  const [newsRefreshMs, setNewsRefreshMs] = useState(initial.newsRefreshMs)
  const [showLiveHints, setShowLiveHints] = useState(initial.showLiveHints)

  useEffect(() => { updateSettings({ theme }) }, [theme])
  useEffect(() => { updateSettings({ newsRefreshMs }) }, [newsRefreshMs])
  useEffect(() => { updateSettings({ showLiveHints }) }, [showLiveHints])

  return (
    <div className="st-page">
      <div className="st-header">
        <h1 className="st-title">Settings</h1>
        <div className="st-sub">Customize your experience</div>
      </div>

      <div className="st-section">
        <div className="st-section-title">Appearance</div>
        <div className="st-field">
          <label className="st-label">Theme</label>
          <div className="st-options">
            <button className={`st-option ${theme==='dark'?'active':''}`} onClick={()=>setTheme('dark')}>Dark</button>
            <button className={`st-option ${theme==='light'?'active':''}`} onClick={()=>setTheme('light')}>Light</button>
          </div>
        </div>
      </div>

      <div className="st-section">
        <div className="st-section-title">Feed & News</div>
        <div className="st-field">
          <label className="st-label">Auto-refresh interval (ms)</label>
          <input className="st-input" type="number" min={0} step={500} value={newsRefreshMs} onChange={e=>setNewsRefreshMs(Number(e.target.value))}/>
        </div>
        <div className="st-field">
          <label className="st-toggle"><input type="checkbox" checked={showLiveHints} onChange={e=>setShowLiveHints(e.target.checked)} /> <span>Show live match hints</span></label>
        </div>
      </div>
    </div>
  )
}
