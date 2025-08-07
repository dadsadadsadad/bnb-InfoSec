import { useState } from 'react'
import './assets/Login.css'

export default function Login() {
    return (
        <div className="login-container">
            <div className="login-box">
                <h1 className="login-title">Log in</h1>
                <form className="login-form">
                    <input type="email" placeholder="Email" className="login-input" />
                    <input type="password" placeholder="Password" className="login-input" />
                    <button type="submit" className="login-button">Continue</button>
                </form>
                <div className="login-footer">
                    <p>Don't have an account?</p>
                    <a href="/signup">Sign up</a>
                </div>
            </div>
        </div>
    )
}