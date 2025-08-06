import { useState } from 'react'
import './assets/Login.css'

export default function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        alert(`Logged in with:\nEmail: ${email}\nPassword: ${password}`)
        // Replace with actual auth logic
    };

    return (
        <div className="login-container">
            <h2>Welcome to Airbnb</h2>
            <form onSubmit={handleSubmit} className="login-form">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Log In</button>
                <p>
                    Don’t have an account? <a href="#">Sign Up</a>
                </p>
            </form>
        </div>
    );
}
 