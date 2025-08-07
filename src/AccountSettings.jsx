import React, { useState } from 'react'
import './assets/AccountSettings.css'

export default function AccountSettings() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = e => {
        e.preventDefault()
        // Handle account update logic here
    }

    return (
        <div className="settings-container">
            <form className="settings-form" onSubmit={handleSubmit}>
                <h2>Account Settings</h2>
                <label>
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Enter new email"
                        required
                    />
                </label>
                <label>
                    New Password
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                    />
                </label>
                <button type="submit">Update Account</button>
            </form>
        </div>
    )
}