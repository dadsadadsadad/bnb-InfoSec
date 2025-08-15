import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from './firebase'
import {
    onAuthStateChanged,
    deleteUser,
    updateEmail,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    sendEmailVerification
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import './assets/AccountSettings.css'

export default function AccountSettings() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [verified, setVerified] = useState(false)

    const [msg, setMsg] = useState('')
    const [savingEmail, setSavingEmail] = useState(false)
    const [savingPass, setSavingPass] = useState(false)

    const [newEmail, setNewEmail] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            //check if logged in, then get data from database
            if (!u) {
                navigate('/login', { replace: true })
                return
            }
            setUser(u)
            let isVerified = !!u.emailVerified
            try {
                const snap = await getDoc(doc(db, 'users', u.uid))
                if (snap.exists() && snap.data()?.verified === true) {
                    isVerified = true
                }
            } finally {
                setVerified(isVerified)
            }
        })
        return () => unsub()
    }, [navigate])

    const reauth = async () => {
        //logs you in again
        if (!user) throw new Error('Not signed in.')
        if (!currentPassword) throw new Error('Enter your current password.')
        const cred = EmailAuthProvider.credential(user.email || '', currentPassword)
        await reauthenticateWithCredential(user, cred)
    }

    const handleUpdateEmail = async () => {
        if (!user)
            return
        const next = (newEmail || '').trim()
        if (!next || next === user.email) {
            setMsg('Enter a different email.')
            return
        }
        if (!window.confirm(`Update email to ${next}? A verification email will be sent.`)) {
            return
        }
        setMsg('')
        setSavingEmail(true)
        try {
            //logs you back in, change email, and send verification to email
            await reauth()
            await updateEmail(user, next)
            await sendEmailVerification(user)
            setMsg('Email updated. Verification sent to the new address.')
            setNewEmail('')
        } catch (e) {
            setMsg(e?.message || 'Failed to update email.')
        } finally {
            setSavingEmail(false)
        }
    }

    const handleUpdatePassword = async () => {
        if (!user) return
        if (!newPassword || newPassword.length < 6) {
            setMsg('New password must be at least 6 characters.')
            return
        }
        if (newPassword !== confirmPassword) {
            setMsg('New passwords do not match.')
            return
        }
        if (!window.confirm('Change your password now?')) {
            return
        }
        setMsg('')
        setSavingPass(true)
        try {
            //logs you back in, change password and clear inputs
            await reauth()
            await updatePassword(user, newPassword)
            setMsg('Password updated.')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (e) {
            setMsg(e?.message || 'Failed to update password.')
        } finally {
            setSavingPass(false)
        }
    }

    const handleDelete = async () => {
        if (!user) return
        if (!window.confirm('Are you sure you want to permanently delete your account?')) {
            return
        }
        setMsg('')
        try {
            //deletes the user and goes back to login page
            await deleteUser(user)
            navigate('/login', { replace: true })
        } catch (e) {
            setMsg(e?.message || 'Failed to delete account. Reauthenticate and try again.')
        }
    }

    return (
        <div className="acct">
            <h2 className="acct__title">Account settings</h2>

            {/* if email is not verified, they can't edit their account details */}
            {!verified && (
                <>
                    <div className="acct__alert acct__alert--warn">
                        Verify your email to edit your account. You can still delete your account.
                    </div>
                    <div className="acct__verifyAction">
                        <button
                            type="button"
                            className="acct__primary"
                            onClick={() => navigate('/verify-email')}
                        >
                            Go to verify email
                        </button>
                    </div>
                </>
            )}

            {msg && <div className="acct__alert">{msg}</div>}

            <div className="acct__field">
                <label>Current email</label>
                <input className="acct__input" value={user?.email || ''} readOnly />
            </div>

            <div className="acct__field">
                <label>New email</label>
                <input
                    className="acct__input"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    disabled={!verified || savingEmail}
                    placeholder="name@example.com"
                />
            </div>

            <div className="acct__actions">
                <button
                    className="acct__primary"
                    onClick={handleUpdateEmail}
                    disabled={!verified || savingEmail}
                >
                    Update email
                </button>
            </div>

            <hr className="acct__divider" />

            <div className="acct__field">
                <label>Current password</label>
                <input
                    className="acct__input"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={!verified || savingPass || savingEmail}
                />
            </div>

            <div className="acct__field">
                <label>New password</label>
                <input
                    className="acct__input"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={!verified || savingPass}
                />
            </div>

            <div className="acct__field">
                <label>Confirm new password</label>
                <input
                    className="acct__input"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={!verified || savingPass}
                />
            </div>

            <div className="acct__actions">
                <button
                    className="acct__primary"
                    onClick={handleUpdatePassword}
                    disabled={!verified || savingPass}
                >
                    Update password
                </button>
                <button className="acct__danger" onClick={handleDelete}>
                    Delete account
                </button>
            </div>
        </div>
    )
}