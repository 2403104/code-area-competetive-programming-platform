import React from 'react'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({children}) => {
  const token=localStorage.getItem('auth-token');
  if(!token){
    return <Navigate to="/auth/codearea-login"/>
  }
  return children
}

export default ProtectedRoute
