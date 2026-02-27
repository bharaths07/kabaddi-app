import React, { useEffect, useMemo, useState } from 'react'
import './plan-upgrade.css'
import { getPlan, setPlan } from '../shared/state/planStore'

type Tier = {
  id: 'free' | 'pro' | 'enterprise'
  name: string
  price: string
  features: string[]
}

const TIERS: Tier[] = [
  { id:'free', name:'Free', price:'$0', features:['Basic matches','Manual updates','Community support'] },
  { id:'pro', name:'Pro', price:'$9/mo', features:['Live scoring','Auto News & Highlights','Advanced stats','Email support'] },
  { id:'enterprise', name:'Enterprise', price:'Contact', features:['Multi-tournament admin','Team dashboards','Priority support','Custom integrations'] },
]

export default function PlanUpgrade() {
  const current = useMemo(() => getPlan(), [])
  const [selected, setSelected] = useState(current)
  useEffect(() => { setSelected(current) }, [current])

  const onUpgrade = (p: 'free'|'pro'|'enterprise') => {
    setSelected(p)
    setPlan(p)
  }

  return (
    <div className="pl-page">
      <div className="pl-header">
        <h1 className="pl-title">Choose Your Plan</h1>
        <div className="pl-sub">Current: {current.toUpperCase()}</div>
      </div>
      <div className="pl-grid">
        {TIERS.map(t => (
          <div key={t.id} className={`pl-card ${selected===t.id?'active':''}`}>
            <div className="pl-card-head">
              <div className="pl-name">{t.name}</div>
              <div className="pl-price">{t.price}</div>
            </div>
            <ul className="pl-features">
              {t.features.map((f,i)=><li key={i} className="pl-feature">{f}</li>)}
            </ul>
            <button className={`pl-btn ${selected===t.id?'selected':''}`} onClick={()=>onUpgrade(t.id)}>
              {selected===t.id?'Selected':'Choose'}
            </button>
          </div>
        ))}
      </div>
      <div className="pl-note">Upgrading updates features instantly across the app.</div>
    </div>
  )
}
