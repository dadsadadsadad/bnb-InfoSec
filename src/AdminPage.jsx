import React, { useEffect, useState } from 'react'
import { collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { db } from './firebase'
import './assets/AdminPage.css'

export default function AdminPage() {
    const [users, setUsers] = useState([])
    const [msg, setMsg] = useState('')

    useEffect(() => {
        //gets all users and data from database
        const unsub = onSnapshot(collection(db, 'users'), (snap) => {
            const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }))
            setUsers(rows)
        }, (e) => setMsg(e?.message || 'Failed to load users'))
        return () => unsub()
    }, [])

    const makeHost = async (u, next) => {
        //show different confirmation based on user role
        const label = next ? 'add host status' : 'remove host status'
        if (!window.confirm(`Are you sure you want to ${label} for ${u.email || u.id}?`))
            return
        try {
            // update user data to either make them host or remove host
            const ref = doc(db, 'users', u.id)
            await updateDoc(ref, { isHost: next })
        } catch (e) {
            setMsg(e?.message || 'Failed to update host status')
        } finally {
        }
    }

    const deleteUser = async (u) => {
        if (!window.confirm(`Permanently delete user ${u.email || u.id}? This cannot be undone.`))
            return
        try {
            try {
                //gets cloud function adminDeleteUser to delete from firebase auth
                const functions = getFunctions()
                const adminDeleteUser = httpsCallable(functions, 'adminDeleteUser')
                await adminDeleteUser({ uid: u.id })
            } catch (fnErr) {
                await deleteDoc(doc(db, 'users', u.id))
            }
        } catch (e) {
            setMsg(e?.message || 'Failed to delete user')
        } finally {
        }
    }

    return (
        <div className="admin-container">
            <header className="admin-header">
                <h1>Admin Dashboard</h1>
                <p>Manage users and site settings</p>
            </header>

            {msg && <div className="admin-alert">{msg}</div>}

            <section className="admin-section">
                <h2>Users</h2>
                <div className="admin-table-wrap">
                    <table className="admin-table" aria-label="All users">
                        <thead>
                        <tr>
                            <th>User</th>
                            <th>UID</th>
                            <th>Host</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.length === 0 ? (
                            <tr><td colSpan={4} className="admin-empty">No users found.</td></tr>
                        ) : users.map(u => (
                            <tr key={u.id}>
                                <td>
                                    <div className="user-cell">
                                        <div className="user-email">{u.email || 'unknown'}</div>
                                        {u.displayName && <div className="user-name">{u.displayName}</div>}
                                    </div>
                                </td>
                                <td className="uid-cell">{u.id}</td>
                                <td>
                                    {u.isHost ? <span className="tag tag-host">Host</span> : <span className="tag">Guest</span>}
                                </td>
                                <td className="actions-cell">
                                    {u.isHost ? (
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => makeHost(u, false)}
                                        >
                                            Remove host
                                        </button>
                                    ) : (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => makeHost(u, true)}
                                        >
                                            Make host
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => deleteUser(u)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    )
}