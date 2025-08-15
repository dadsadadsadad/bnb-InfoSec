import React, { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, onSnapshot, orderBy, query, where, doc, deleteDoc } from 'firebase/firestore'
import { useNavigate, useParams } from 'react-router-dom'
import { auth, db } from './firebase'
import './assets/HomePage.css'

export default function MyListingsPage() {
    const navigate = useNavigate()
    const { hostId } = useParams()
    const [ready, setReady] = useState(Boolean(hostId))
    const [user, setUser] = useState(null)
    const [items, setItems] = useState([])
    const [deletingId, setDeletingId] = useState(null)
    const [err, setErr] = useState('')

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u || null)
            if (!hostId)
                setReady(true)
        })
        if (hostId)
            setReady(true)
        return () => unsub()
    }, [hostId])

    useEffect(() => {
        if (!ready)
            return
        const owner = hostId || user?.uid
        if (!owner)
            return

        //get listings from database for current host
        const q = query(
            collection(db, 'listings'),
            where('ownerId', '==', owner),
            orderBy('createdAt', 'desc')
        )

        const unsub = onSnapshot(
            q,
            (snap) => {
                setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
                setErr('')
            },
            (e) => {
                console.error('Failed to load listings', e)
                setErr('Failed to load listings')
            }
        )
        return () => unsub()
    }, [ready, hostId, user?.uid])

    const currentUser = !hostId || (user && user.uid === hostId)

    const handleDelete = async (e, listing) => {
        e.preventDefault()
        e.stopPropagation()
        const current = auth.currentUser
        if (!current || current.uid !== listing.ownerId)
            return
        if (!window.confirm('Delete this listing?'))
            return

        setDeletingId(listing.id)

        try {
            await deleteDoc(doc(db, 'listings', listing.id))
            //removes the deleted listing so it doesn't show up
            setItems(prev => prev.filter(i => i.id !== listing.id))
        } catch (error) {
            console.error('Delete failed', error)
            alert(`Delete failed: ${error?.message || 'Unknown error'}`)
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="listings-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Listings</h2>
                <button className="search-button" type="button" onClick={() => navigate('/create-listing')}>
                    Create listing
                </button>
            </div>

            {err && <p className="error" aria-live="polite">{err}</p>}

            <div className="listings-grid">
                {items.map(listing => (
                    <div
                        key={listing.id}
                        className="listing-card"
                        onClick={() => navigate(`/listingpage/${listing.id}`)}
                        role="button"
                        tabIndex={0}
                    >
                        <div
                            className="listing-image"
                            style={{
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundImage: listing.imageUrl ? `url(${listing.imageUrl})` : undefined
                            }}
                        />
                        <div className="listing-info">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                                <h3 style={{ margin: 0 }}>{listing.title || 'Untitled'}</h3>
                                {currentUser && (
                                    <button
                                        className="search-button"
                                        type="button"
                                        onClick={(e) => handleDelete(e, listing)}
                                        disabled={deletingId === listing.id}
                                        aria-label="Delete listing"
                                        title="Delete listing"
                                    >
                                        {deletingId === listing.id ? 'Deleting…' : 'Delete'}
                                    </button>
                                )}
                            </div>
                            <p>${listing.price || 0}/night</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}