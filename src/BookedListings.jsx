import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { auth, db } from './firebase'
import './assets/BookedListings.css'

export default function BookedListings() {
    const [user, setUser] = useState(null)
    const [authReady, setAuthReady] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [bookings, setBookings] = useState([])

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u || null)
            setAuthReady(true)
        })
        return () => unsub()
    }, [])

    useEffect(() => {
        if (!authReady) return
        if (!user) {
            setBookings([])
            setLoading(false)
            return
        }
        setLoading(true)

        const q = query(
            collection(db, 'bookings'),
            where('uid', '==', user.uid)
        )

        const unsub = onSnapshot(q, (snap) => {
            const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
            setBookings(rows)
            setLoading(false)
        }, (e) => {
            setError(e?.message || 'Failed to load bookings')
            setLoading(false)
        })

        return () => unsub()
    }, [authReady, user])

    if (!authReady || loading)
        return null

    if (error) {
        return (
            <div className="booked">
                <div className="booked__alert booked__alert--error">{error}</div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="booked">
                <div className="booked__empty">
                    <div className="booked__emptyTitle">Sign in required</div>
                    <div className="booked__emptyText">Please sign in to view your bookings.</div>
                </div>
            </div>
        )
    }

    if (bookings.length === 0) {
        return (
            <div className="booked">
                <div className="booked__empty">
                    <div className="booked__emptyTitle">No bookings yet</div>
                    <div className="booked__emptyText">You don\`t have any bookings at the moment.</div>
                </div>
            </div>
        )
    }

    const fmtDate = (s) => s || ''

    return (
        <div className="booked">
            <h1 className="booked__title">Your bookings</h1>
            <ul className="booked__list">
                {bookings.map((b) => (
                    <li key={b.id} className="booked__item">
                        <div
                            className="booked__itemTitle">{b.listingTitle || b.listingSnapshot?.title || 'Untitled listing'}</div>
                        <div className="booked__meta">
                            {fmtDate(b.checkIn)}
                        </div>
                        <div className="booked__meta">
                            {fmtDate(b.checkOut)} • {b.nights || 0} night{(b.nights || 0) === 1 ? '' : 's'}
                        </div>
                        <div className="booked__meta">
                            • {b.nights || 0} night{(b.nights || 0) === 1 ? '' : 's'}
                        </div>
                        <div className="booked__meta">
                            Guests: {b.guests || 1} • <span
                            className="booked__price">Total: ${(b.totalPrice)}</span>
                        </div>
                        <div className="booked__actions">
                            <Link className="booked__primary" to={`/listingpage/${b.listingId}`}>View listing</Link>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}