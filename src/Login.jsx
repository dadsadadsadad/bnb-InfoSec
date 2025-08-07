import React, { useState } from 'react'
import './assets/Login.css'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = e => {
        e.preventDefault()
        // Handle login logic here
    }

    const handleSignUp = () => {
        // Redirect to sign up page or open sign up modal
    }

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Sign in to your account</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Log In</button>
                <h4>or</h4>
                <button
                    type="button"
                    className="signup-btn"
                    onClick={handleSignUp}
                >
                    Create account
                </button>
            </form>
        </div>
    )
}