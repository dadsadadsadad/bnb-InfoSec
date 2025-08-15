import React, { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { addDoc, collection, serverTimestamp, doc, getDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { auth, db } from './firebase.js'
import './assets/CreateListingPage.css'

export default function CreateListingPage() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [ready, setReady] = useState(false)

    const [title, setTitle] = useState('')
    const [price, setPrice] = useState('')
    const [description, setDescription] = useState('') // optional

    const [isHost, setIsHost] = useState(false)
    const [checkingHost, setCheckingHost] = useState(true)

    const [submitting, setSubmitting] = useState(false)
    const [err, setErr] = useState('')

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u || null)
            setReady(true)
        })
        return () => unsub()
    }, [])

    useEffect(() => {
        let cancelled = false
        const loadHostFlag = async () => {
            setCheckingHost(true)
            setIsHost(false)
            if (!user) {
                setCheckingHost(false)
                return
            }
            try {
                const snap = await getDoc(doc(db, 'users', user.uid))
                if (!cancelled) setIsHost(Boolean(snap.exists() && snap.data()?.isHost === true))
            } catch {
                if (!cancelled) setIsHost(false)
            } finally {
                if (!cancelled) setCheckingHost(false)
            }
        }
        loadHostFlag()
        return () => { cancelled = true }
    }, [user?.uid])

    const onSubmit = async (e) => {
        e.preventDefault()
        setErr('')

        if (!user) {
            setErr('Please sign in to create a listing.')
            return
        }
        if (!isHost) {
            setErr('You must be a host to create a listing.')
            return
        }

        const t = title.trim()
        const priceNum = Number(price)
        if (!t) {
            setErr('Title is required.')
            return
        }
        if (!Number.isFinite(priceNum) || priceNum < 0) {
            setErr('Price must be a non-negative number.')
            return
        }

        const data = {
            title: t,
            price: priceNum,
            ownerId: user.uid,
            hostUid: user.uid,
            description: description.trim(),
            createdAt: serverTimestamp()
        }

        setSubmitting(true)
        try {
            await addDoc(collection(db, 'listings'), data)
            navigate('/my-listings')
        } catch (error) {
            setErr(error?.message || 'Failed to create listing.')
        } finally {
            setSubmitting(false)
        }
    }

    if (!ready || checkingHost)
        return null

    return (
        <div className="create-section">
            <h2 className="create-title">Create listing</h2>

            {!isHost && (
                <div className="error" aria-live="polite" style={{ marginBottom: 12 }}>
                    You must be a host to create a listing.
                </div>
            )}

            <form className="create-card" onSubmit={onSubmit}>
                <div className="form-grid">
                    <div className="field">
                        <label>Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Listing Title"
                            required
                            disabled={!isHost || submitting}
                        />
                    </div>

                    <div className="field">
                        <label>Price per night</label>
                        <input
                            type="number"
                            min="0"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="0"
                            required
                            disabled={!isHost || submitting}
                        />
                        <div className="hint">Use whole numbers</div>
                    </div>

                    <div className="field">
                        <label>Description (optional)</label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your place, amenities, and house rules"
                            disabled={!isHost || submitting}
                        />
                    </div>

                    {err && <div className="error" aria-live="polite">{err}</div>}

                    <div className="actions">
                        <button className="btn" type="submit" disabled={!isHost || submitting}>
                            {submitting ? 'Creating…' : 'Create'}
                        </button>
                        <button className="btn secondary" type="button" onClick={() => navigate(-1)} disabled={submitting}>
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}