import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged, signOut, getIdTokenResult } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase.js'
import './Navbar.css'

export default function Navbar() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [displayName, setDisplayName] = useState('Guest')
    const [isHost, setIsHost] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            setUser(u || null)
            //if not logged in, set to default
            if (!u) {
                setDisplayName('Guest')
                setIsHost(false)
                setIsAdmin(false)
                return
            }

            //if logged in, check if host
            let host = false
            try {
                const snap = await getDoc(doc(db, 'users', u.uid))
                if (snap.exists()) host = !!snap.data()?.isHost
            } catch {}

            //if logged in, check if admin
            const token = await getIdTokenResult(u)
            const admin = !!token.claims?.admin

            setIsHost(host)
            setIsAdmin(admin)
            //change value based on role
            setDisplayName(admin ? 'Admin' : host ? 'Host' : 'Logged on')
        })
        return () => unsub()
    }, [])

    //navigation links
    const goHome = () => navigate('/homepage')
    const goSettings = () => (user ? navigate('/account-settings') : navigate('/login'))
    const goBooked = () => (user ? navigate('/booked-listings') : navigate('/login'))
    const goMyListings = () => (isHost ? navigate('/my-listings') : null)
    const goRequests = () => navigate('/host-request')
    const goAdmin = () => (isAdmin ? navigate('/adminpage') : null)
    const goAdminRequest = () => (isAdmin ? navigate('/admin-requests') : null)

    //pop out before signing out
    const handleSignOut = async () => {
        if (!window.confirm('Sign out of your account?'))
            return
        try {
            await signOut(auth)
            navigate('/')
        } catch (e) {
            console.error(e)
        }
    }

    const handleSignIn = () => navigate('/login')

    return (
        <nav className="navbar" role="navigation" aria-label="Primary">
            <div className="nav-left">
                <button className="nav-brand" onClick={goHome} aria-label="Home">BnB</button>
                <div className="nav-links">
                    <button className="nav-link" onClick={goHome}>Home</button>

                    {/* if admin, show admin links in navbar */}
                    {user && isAdmin ? (
                        <>
                            <button className="nav-link" onClick={goAdmin}>Admin</button>
                            <button className="nav-link" onClick={goAdminRequest}>Host Requests</button>
                        </>
                    ) : user ? (
                        <>
                            <button className="nav-link" onClick={goSettings}>Settings</button>
                            <button className="nav-link" onClick={goBooked}>Booked Listings</button>
                            {/* if logged in and host, show host links in navbar */}
                            {!isHost && (
                                <button className="nav-link" onClick={goRequests}>Apply to be Host</button>
                            )}
                            {isHost && (
                                <button className="nav-link" onClick={goMyListings}>My Listings</button>
                            )}
                        </>
                    ) : null}
                </div>
            </div>

            <div className="nav-right">
                <span className="nav-username" title={displayName}>{displayName}</span>
                {/* if logged in, show sign out button, and show sign in if not logged in */}
                {user ? (
                    <button className="nav-auth-btn signout" onClick={handleSignOut}>Sign out</button>
                ) : (
                    <button className="nav-auth-btn signin" onClick={handleSignIn}>Sign in</button>
                )}
            </div>
        </nav>
    )
}