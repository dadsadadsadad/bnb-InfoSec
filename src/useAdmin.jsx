import { useEffect, useState } from 'react'
import { onAuthStateChanged, getIdTokenResult } from 'firebase/auth'
import { auth } from './firebase'

export function useAdmin() {
    const [user, setUser] = useState(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            setUser(u)
            if (!u) {
                setIsAdmin(false)
                setLoading(false)
                return }
            try {
                //check token to see if user is admin.jsx
                const token = await getIdTokenResult(u)
                setIsAdmin(!!token.claims.admin)
            } finally {
                setLoading(false)
            }
        })
        return () => unsub()
    }, [])

    return { user, isAdmin, loading }
}