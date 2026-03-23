import React from 'react'
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom'

export default function ErrorPage() {
  const error = useRouteError()
  const isResp = isRouteErrorResponse(error as any)
  const statusText = isResp ? (error as any).statusText : 'Unexpected Error'
  const status = isResp ? (error as any).status : 500
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h1 style={{ margin: 0 }}>Something went wrong</h1> 
      <div style={{ color: '#cbd5e1' }}>{status} {statusText}</div >
      <div style={{ display: 'flex', gap: 8 }}>
        <Link to="/" style={{ background: '#4169e1', color: '#fff', textDecoration: 'none', padding: '8px 12px', borderRadius: 8 }}>Go Home</Link>
        <Link to="/news" style={{ border: '1px solid #1c2450', color: '#fff', textDecoration: 'none', padding: '8px 12px', borderRadius: 8 }}>News & Updates</Link>
      </div>
    </div>
  )
}
  