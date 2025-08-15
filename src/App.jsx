import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import AdminRoute from './AdminRoute.jsx'

import Navbar from './assets/Navbar.jsx'
import HomePage from './HomePage.jsx'
import Login from './Login.jsx'
import Signup from './SignUp.jsx'
import AccountSettings from './AccountSettings.jsx'
import BookedListingsPage from './BookedListings.jsx'
import MyListings from './MyListings.jsx'
import AdminPage from './AdminPage.jsx'
import ListingPage from './ListingPage.jsx'
import AdminHostRequestPage from './AdminHostRequestPage.jsx'
import AuthError from './AuthError.jsx'
import CreateListingPage from './CreateListingPage.jsx'
import HostRequestPage from './HostRequestPage.jsx'
import VerifyEmail from './VerifyEmail.jsx'

export default function App() {
    const [ready, setReady] = useState(false)
    const [user, setUser] = useState(null)
    const [isHost, setIsHost] = useState(false)

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            try {
                setUser(u || null)
                if (u) {
                    try {
                        const snap = await getDoc(doc(db, 'users', u.uid))
                        setIsHost(Boolean(snap.exists() && snap.data()?.isHost))
                    } catch {
                        setIsHost(false)
                    }
                } else {
                    setIsHost(false)
                }
            } finally {
                setReady(true)
            }
        })
        return () => unsub()
    }, [])

    return (
        <>
            <Navbar />
            <Routes>
                {/* public routes */}
                <Route path="/" element={<Navigate to="/homepage" replace />} />
                <Route path="/homepage" element={<HomePage />} />
                <Route path="/listingpage/:id" element={<ListingPage />} />

                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route
                    path="/verify-email"
                    element={!ready ? null : (user ? <VerifyEmail /> : <Navigate to="/login" replace />)}
                />
                <Route path="/auth-error" element={<AuthError />} />

                {/* user routes */}
                <Route
                    path="/account-settings"
                    element={!ready ? null : (user ? <AccountSettings /> : <Navigate to="/login" replace />)}
                />
                <Route
                    path="/booked-listings"
                    element={!ready ? null : (user ? <BookedListingsPage /> : <Navigate to="/login" replace />)}
                />
                <Route
                    path="/host-request"
                    element={!ready ? null : (user ? <HostRequestPage /> : <Navigate to="/login" replace />)}
                />

                {/* host routes */}
                <Route
                    path="/my-listings"
                    element={!ready ? null : (user && isHost ? <MyListings /> : <Navigate to="/homepage" replace />)}
                />
                <Route
                    path="/create-listing"
                    element={!ready ? null : (user && isHost ? <CreateListingPage /> : <Navigate to="/homepage" replace />)}
                />

                {/* admin.jsx routes */}
                {/* check first if admin.jsx using adminroute */}
                <Route element={<AdminRoute />}>
                    <Route path="/adminpage" element={<AdminPage />} />
                </Route>
                <Route element={<AdminRoute />}>
                    <Route path="/admin-requests" element={<AdminHostRequestPage />} />
                </Route>
            </Routes>
        </>
    )
}