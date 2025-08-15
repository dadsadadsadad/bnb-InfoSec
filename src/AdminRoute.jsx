import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAdmin } from './useAdmin'

export default function AdminRoute() {
    const { isAdmin, loading } = useAdmin()
    if (loading)
        return null

    //if not admin, go to home page
    return isAdmin ? <Outlet /> : <Navigate to="/" replace />
}