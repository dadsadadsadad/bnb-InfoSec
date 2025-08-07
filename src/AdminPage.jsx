import React from 'react'
import './assets/AdminPage.css'

export default function AdminPage() {
    return (
        <div className="admin-container">
            <header className="admin-header">
                <h1>Admin Dashboard</h1>
                <p>Manage users and site settings</p>
            </header>
            <section className="admin-section">
                <h2>User Management</h2>
                <button className="admin-add-btn">Add User</button>
                {/* Add user list or management tools here */}
            </section>
        </div>
    )
}