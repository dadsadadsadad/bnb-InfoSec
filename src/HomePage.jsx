import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from './firebase.js'
import './assets/HomePage.css'

export default function HomePage() {
    const navigate = useNavigate()
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const q = query(
            collection(db, 'listings'),
            orderBy('createdAt', 'desc')
        )

        const unsub = onSnapshot(
            q,
            (snap) => {
                setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
                setError('')
                setLoading(false)
            },
            (e) => {
                console.error('Failed to load listings:', e)
                setError('Failed to load listings')
                setLoading(false)
            }
        )
        return () => unsub()
    }, [])

    const handleListingClick = (listingId) => {
        navigate(`/listingpage/${listingId}`)
    }

    return (
        <div className="homepage">
            <div className="search-section">
                <div className="search-container">
                    <h1>Find your perfect stay</h1>
                    <div className="search-bar">
                        <input type="text" placeholder="Where are you going?" className="search-input location" />
                        <input type="date" className="search-input date" />
                        <input type="date" className="search-input date" />
                        <select className="search-input guests">
                            <option>1 Guest</option>
                            <option>2 Guests</option>
                            <option>3 Guests</option>
                            <option>4+ Guests</option>
                        </select>
                        <button className="search-button">Search</button>
                    </div>
                </div>
            </div>

            <div className="listings-section">
                <h2>Explore homes</h2>

                {loading && <p>Loading listings…</p>}
                {error && <p className="error">{error}</p>}

                {!loading && !error && (
                    <div className="listings-grid">
                        {items.map(listing => (
                            <div
                                key={listing.id}
                                className="listing-card"
                                onClick={() => handleListingClick(listing.id)}
                                role="button"
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
                                    <h3>{listing.title || 'Untitled'}</h3>
                                    <p>${listing.price || 0}/night</p>
                                    <p>⭐ {listing.rating || 0} ({listing.reviews || 0} reviews)</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}