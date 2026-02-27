import React from 'react'
import { useParams } from 'react-router-dom'

export default function MatchSummary() {
  const { id } = useParams()
  return (
    <div>
      <h1>Match Summary</h1>
      <p>Summary for match {id}.</p>
    </div>
  )
}
