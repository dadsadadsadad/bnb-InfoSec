import React, { useEffect, useState } from 'react'
import { onAuthStateChanged, getIdTokenResult } from 'firebase/auth'
import { auth, db } from './firebase'
import {
    collection, onSnapshot, query, where,
    doc, writeBatch, serverTimestamp
} from 'firebase/firestore'
import './assets/AdminHostRequestPage.css'

export default function AdminHostRequestPage() {
    const [ready, setReady] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [appeals, setAppeals] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            //set to default
            setError('')
            setIsAdmin(false)
            setReady(false)
            setLoading(true)
            if (!u) {
                setReady(true)
                setLoading(false)
                return
            }
            //check if user is admin
            const token = await getIdTokenResult(u, true)
            setIsAdmin(!!token.claims?.admin)
            setReady(true)
            setLoading(false)
        })
        return () => unsub()
    }, [])

    useEffect(() => {
        if (!isAdmin)
            return
        setLoading(true)
        setError('')
        //gets the data from database of host appeals where status is pending
        const q = query(collection(db, 'hostAppeals'), where('status', '==', 'pending'))
        const unsub = onSnapshot(q, {
            //update whenever a new appeal is added or changed
            next: (snap) => {
                const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }))
                //sort based on date created
                rows.sort((a, b) => {
                    const av = a.createdAt?.seconds || 0
                    const bv = b.createdAt?.seconds || 0
                    return av - bv
                })
                //update the appeals
                setAppeals(rows)
                setLoading(false)
            },
            error: (e) => {
                console.error('hostAppeals subscription error:', e)
                setError(`${e.code || 'error'}: ${e.message || 'Failed to load appeals'}`)
                setLoading(false)
            }
        })
        return () => unsub()
    }, [isAdmin])

    const handle = async (appeal, decision) => {
        setError('')
        try {
            const batch = writeBatch(db)
            const appealRef = doc(db, 'hostAppeals', appeal.id)
            //function gets the appeal and update status based on approved or denied
            if (decision === 'approve') {
                //gets the uid of the user who sent appeal, then set status to host
                const userRef = doc(db, 'users', appeal.uid)
                batch.set(userRef, { isHost: true }, { merge: true })
                //update the status of the appeal to approve and add time of review and uid of admin
                batch.update(appealRef, {
                    status: 'approved',
                    reviewedAt: serverTimestamp(),
                    reviewedBy: auth.currentUser?.uid || null
                })
            } else {
                batch.update(appealRef, {
                    status: 'denied',
                    reviewedAt: serverTimestamp(),
                    reviewedBy: auth.currentUser?.uid || null
                })
            }
            //wait for everything to finish
            await batch.commit()
        } catch (e) {
            console.error('update appeal error:', e)
            setError('Failed to update appeal')
        }
    }

    if (!ready) return null

    if (!isAdmin) {
        return (
            <div className="adminRequests adminRequests--unauthorized">
                <div className="adminRequests__notice">Not authorized.</div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="adminRequests adminRequests--loading">
                <div className="adminRequests__notice">Loading…</div>
            </div>
        )
    }

    return (
        <div className="adminRequests">
            <div className="adminRequests__header">
                <h2 className="adminRequests__title">Host Appeals (Admin)</h2>
            </div>

            {error && <div className="adminRequests__error">{error}</div>}

            {appeals.length === 0 ? (
                <div className="adminRequests__empty">No pending appeals.</div>
            ) : (
                <ul className="adminRequests__list">
                    {appeals.map(a => (
                        <li key={a.id} className="adminRequests__item">
                            <div className="adminRequests__name">{a.displayName || a.email || a.uid}</div>
                            <div className="adminRequests__email">{a.email}</div>
                            <p className="adminRequests__message">{a.message || '(no message)'}</p>
                            <div className="adminRequests__actions">
                                <button
                                    className="btn btn--approve"
                                    onClick={() => handle(a, 'approve')}
                                >
                                    Approve
                                </button>
                                <button
                                    className="btn btn--deny"
                                    onClick={() => handle(a, 'deny')}
                                >
                                    Deny
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}