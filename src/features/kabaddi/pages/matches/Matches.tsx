import React from 'react'
import { Link } from 'react-router-dom'
import { can } from '../../../../shared/constants/ROLES'

export default function Matches() {
  const role: 'organizer' | 'scorer' | 'viewer' = 'organizer'
  return (
    <div>
      <h1>Matches</h1>
      <div>
        <div>
          <div>Kabaddi Match 1</div>
          <div>
            <Link to="/matches/1/summary">Summary</Link>
            {can(role, 'scoring:update') && <> · <Link to="/matches/1">Details</Link></>}
          </div>
        </div>
      </div>
    </div>
  )
}
