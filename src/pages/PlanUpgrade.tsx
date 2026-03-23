import React, { useEffect, useMemo, useState } from 'react'
import './plan-upgrade.css'
import { getPlan, setPlan, upgradePlan } from '../shared/state/planStore'
import { useAuth } from '../shared/context/AuthContext'
import { useNavigate } from 'react-router-dom'

type Tier = {
  id: 'free' | 'pro' | 'enterprise'
  name: string
  price: string
  features: string[]
  color: string
}

const TIERS: Tier[] = [
  { id:'free', name:'Free', price:'₹0', color: '#64748b', features:['Basic matches','Manual updates','Community support'] },
  { id:'pro', name:'Pro', price:'₹499/mo', color: '#0ea5e9', features:['Live scoring','Auto News & Highlights','Advanced stats','Email support'] },
  { id:'enterprise', name:'Enterprise', price:'Custom', color: '#8b5cf6', features:['Multi-tournament admin','Team dashboards','Priority support','Custom integrations'] },
]

export default function PlanUpgrade() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const current = useMemo(() => getPlan(), [])
  const [selected, setSelected] = useState(current)
  const [loading, setLoading] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [targetPlan, setTargetPlan] = useState<Tier | null>(null)

  useEffect(() => { setSelected(current) }, [current])

  const onUpgrade = async (t: Tier) => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/upgrade' } } })
      return
    }
    if (t.id === 'free') {
      await upgradePlan('free')
      setPlan('free')
      setSelected('free')
      return
    }
    setTargetPlan(t)
    setShowModal(true)
  }

  const simulatePayment = async () => {
    if (!targetPlan) return
    setLoading(targetPlan.id)
    setShowModal(false)
    
    // Simulate Razorpay processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    try {
      await upgradePlan(targetPlan.id)
      setPlan(targetPlan.id)
      setSelected(targetPlan.id)
      alert(`Success! You are now on the ${targetPlan.name} plan.`)
    } catch (err) {
      console.error(err)
      alert('Upgrade failed. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="page-wrapper--narrow">
      <div className="page-header">
        <h1 className="pl-title">Choose Your Plan</h1>
        <p className="pl-subtitle">Current: <span className="pl-current-badge">{current.toUpperCase()}</span></p>
      </div>

      <div className="pl-grid">
        {TIERS.map(t => (
          <div key={t.id} className={`card pl-card ${selected===t.id ? 'active' : ''}`} style={{ '--tier-color': t.color } as any}>
            <div className="pl-card-head">
              <div className="pl-name">{t.name}</div>
              <div className="pl-price">{t.price}</div>
            </div>
            <ul className="pl-features">
              {t.features.map((f,i)=>(
                <li key={i} className="pl-feature">
                  <span className="pl-feature-icon">✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              className={`btn ${selected===t.id ? 'btn-primary' : 'btn-outline'} btn-full`}
              onClick={()=>onUpgrade(t)}
              disabled={loading !== null || selected === t.id}
            >
              {loading === t.id ? 'Processing...' : selected === t.id ? 'Current Plan' : `Upgrade to ${t.name}`}
            </button>
          </div>
        ))}
      </div>
      <p className="pl-note">Payments are secured via Razorpay. Features unlock instantly.</p>

      {showModal && targetPlan && (
        <div className="pl-modal-overlay">
          <div className="pl-modal">
            <div className="pl-modal-header">
              <h3>Confirm Upgrade</h3>
              <button className="pl-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="pl-modal-body">
              <p>You are upgrading to <strong>{targetPlan.name}</strong></p>
              <div className="pl-modal-amount">
                <span>Total Amount:</span>
                <strong>{targetPlan.price}</strong>
              </div>
              <div className="pl-razorpay-simulation">
                <div className="pl-razorpay-logo">Razorpay</div>
                <p>Simulating secure payment gateway...</p>
              </div>
            </div>
            <div className="pl-modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={simulatePayment}>Pay Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
