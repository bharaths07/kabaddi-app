import React from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './styles/tokens.css'
import './styles/global.css'
import './styles/components.css'
import './index.css'
import { AuthProvider } from './shared/context/AuthContext'
import { router } from './routes/AppRoutes'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
)
