import React, { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from './firebase'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import './assets/HostRequestPage.css'

export default function HostAppeal() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [appeal, setAppeal] = useState(null)
    const [message, setMessage] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            setUser(u || null)
            if (u) {
                try {
                    const snap = await getDoc(doc(db, 'hostAppeals', u.uid))
                    if (snap.exists()) {
                        const a = { id: snap.id, ...snap.data() }
                        setAppeal(a)
                        setMessage(a.message || '')
                    }
                } catch (e) {}
            }
            setLoading(false)
        })
        return () => unsub()
    }, [])

    const submit = async (e) => {
        e.preventDefault()
        if (!user) return
        setSaving(true); setError('')
        try {
            const ref = doc(db, 'hostAppeals', user.uid)
            await setDoc(ref, {
                uid: user.uid,
                displayName: user.displayName || '',
                email: user.email || '',
                message: message || '',
                status: 'pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            }, { merge: true })
            const snap = await getDoc(ref)
            setAppeal({ id: snap.id, ...snap.data() })
        } catch (e) {
            console.error('submit appeal error:', e)
            setError('Failed to submit appeal')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return null

    const status = appeal?.status
    const isPending = status === 'pending'
    const isApproved = status === 'approved'
    const isDenied = status === 'denied'

    return (
        <div className="hostRequest">
            <div className="hostRequest__header">
                <h2 className="hostRequest__title">Appeal to become a host</h2>
                {status && (
                    <span
                        className={[
                            'hostRequest__badge',
                            isApproved ? 'hostRequest__badge--approved' : '',
                            isPending ? 'hostRequest__badge--pending' : '',
                            isDenied ? 'hostRequest__badge--denied' : '',
                        ].join(' ').trim()}
                    >
            {status}
          </span>
                )}
            </div>

            <p className="hostRequest__text">
                Tell us why you want to be a host. An admin will review your appeal.
            </p>

            {isApproved && (
                <div className="hostRequest__alert hostRequest__alert--approved" role="status">
                    Your appeal has been approved. You now have host access.
                </div>
            )}
            {isPending && (
                <div className="hostRequest__alert hostRequest__alert--pending" role="status">
                    Your appeal is pending review by an admin.
                </div>
            )}
            {isDenied && (
                <div className="hostRequest__alert hostRequest__alert--denied" role="status">
                    Your appeal was denied. You may update your message and resubmit.
                </div>
            )}
            {error && (
                <div className="hostRequest__alert hostRequest__alert--error" role="alert">
                    {error}
                </div>
            )}

            {!isApproved && (
                <form className="hostRequest__form" onSubmit={submit}>
                    <label className="hostRequest__label" htmlFor="appealMsg">
                        Reason for becoming a host
                    </label>
                    <textarea
                        id="appealMsg"
                        className="hostRequest__textarea"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={6}
                        placeholder="Explain your experience, hosting plans, and how you will provide a great stay..."
                    />
                    <div className="hostRequest__actions">
                        <button
                            type="submit"
                            className="hostRequest__primary"
                            disabled={saving || isPending}
                        >
                            {isPending ? 'Awaiting review…' : saving ? 'Submitting…' : (isDenied ? 'Resubmit appeal' : 'Submit appeal')}
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}