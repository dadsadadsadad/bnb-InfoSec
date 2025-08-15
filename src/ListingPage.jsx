import React, { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase'
import './assets/ListingPage.css'

export default function ListingPage() {
    const { id, listingId } = useParams()
    const docId = id || listingId
    const navigate = useNavigate()

    const [user, setUser] = useState(null)
    const [authReady, setAuthReady] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [listing, setListing] = useState(null)

    const [checkIn, setCheckIn] = useState('')
    const [checkOut, setCheckOut] = useState('')
    const [guests, setGuests] = useState(1)
    const [reserveErr, setReserveErr] = useState('')
    const [reserving, setReserving] = useState(false)

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u || null)
            setAuthReady(true)
        })
        return () => unsub()
    }, [])

    useEffect(() => {
        let cancelled = false
        async function load() {
            if (!docId) {
                setError('Missing listing id')
                setLoading(false)
                return
            }
            try {
                const snap = await getDoc(doc(db, 'listings', docId))
                if (!cancelled) {
                    if (snap.exists()) setListing({ id: snap.id, ...snap.data() })
                    else setError('Listing not found')
                }
            } catch (e) {
                if (!cancelled) setError(e?.message || 'Failed to load listing')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [docId])

    const nights = useMemo(() => {
        if (!checkIn || !checkOut)
            return 0
        const inD = new Date(checkIn + 'T00:00:00')
        const outD = new Date(checkOut + 'T00:00:00')
        const d = Math.round((outD - inD) / 86400000)
        return d > 0 ? d : 0
    }, [checkIn, checkOut])

    const nightly = Number(listing?.price ?? 0)
    const totalPrice = nights > 0 && Number.isFinite(nightly) ? nights * nightly : 0
    const canReserve = !!user && nights > 0 && guests >= 1 && !reserving

    const onReserve = async () => {
        setReserveErr('')
        if (!user) { setReserveErr('Please sign in to reserve.'); return }
        if (nights <= 0) { setReserveErr('Select valid dates.'); return }
        if (guests < 1) { setReserveErr('Guests must be at least 1.'); return }
        try {
            setReserving(true)
            await addDoc(collection(db, 'bookings'), {
                // reserver id
                uid: user.uid,
                userId: user.uid,

                // listing id & host id
                listingId: listing.id,
                listingOwnerId: listing.ownerId || '',

                // details
                listingSnapshot: {
                    id: listing.id,
                    ownerId: listing.ownerId || '',
                    title: listing.title || '',
                    description: listing.description || '',
                    imageUrl: listing.imageUrl || '',
                    price: nightly,
                    createdAt: listing.createdAt || null,
                },

                listingTitle: listing.title || '',
                listingImageUrl: listing.imageUrl || '',
                checkIn,           // YYYY-MM-DD
                checkOut,          // YYYY-MM-DD
                guests: Number(guests),
                nights,
                pricePerNight: nightly,
                totalPrice,
                reservedAt: serverTimestamp(),
            })
            navigate('/booked-listings', { replace: true })
        } catch (e) {
            if (e?.code === 'permission-denied') {
                setReserveErr('Missing or insufficient permissions. Please check Firestore rules.')
            } else {
                setReserveErr(e?.message || 'Failed to reserve.')
            }
        } finally {
            setReserving(false)
        }
    }

    if (loading || !authReady)
        return null
    if (error)
        return <div className="error">{error}</div>
    if (!listing)
        return <div className="error">Listing not found</div>

    const createdAt = listing.createdAt?.toDate ? listing.createdAt.toDate().toLocaleString() : null
    const stockPhoto = 'https://images.unsplash.com/photo-1505692794403-34d4982f88aa?auto=format&fit=crop&w=1600&q=60'
    const heroUrl = listing.imageUrl || stockPhoto

    return (
        <div className="listing-page">
            <div className="listing-header">
                <Link to={-1} className="back-link">Back</Link>
                <h1 className="title">{listing.title}</h1>
                <div className="meta">
                    <span className="price">{fmt(nightly)} <small>/ night</small></span>
                    {createdAt && <span className="dot">•</span>}
                    {createdAt && <span className="created">Created {createdAt}</span>}
                </div>
            </div>

            <div className="hero">
                <img src={heroUrl} alt={listing.title || 'Listing photo'} loading="eager" />
            </div>

            <div className="listing-body">
                <div className="listing-main">
                    {listing.description && <p className="description">{listing.description}</p>}
                    <div className="owner">Owner: {listing.ownerId}</div>
                </div>

                <aside className="reserve-card">
                    <h3 className="reserve-title">Reserve</h3>
                    <div className="reserve-grid">
                        <label className="reserve-row">
                            <span>Check-in</span>
                            <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                        </label>
                        <label className="reserve-row">
                            <span>Check-out</span>
                            <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                        </label>
                        <label className="reserve-row">
                            <span>Guests</span>
                            <input type="number" min="1" value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
                        </label>
                    </div>

                    <div className="reserve-summary">
                        <div className="line">
                            <span>{nights || 0} night{nights === 1 ? '' : 's'} × {fmt(nightly)}</span>
                            <span>{fmt(nights > 0 ? nights * nightly : 0)}</span>
                        </div>
                        <div className="line total">
                            <strong>Total</strong>
                            <strong>{fmt(totalPrice)}</strong>
                        </div>
                    </div>

                    {!user && <div className="hint">Sign in to reserve.</div>}
                    {reserveErr && <div className="error" aria-live="polite">{reserveErr}</div>}

                    <button className="btn reserve-btn" onClick={onReserve} disabled={!canReserve}>
                        {reserving ? 'Reserving…' : 'Reserve'}
                    </button>
                </aside>
            </div>
        </div>
    )
}