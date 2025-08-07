import React from 'react'
import './assets/HomePage.css'

const listings = [
    {
        id: 1,
        title: 'Cozy Cabin in the Woods',
        location: 'Lake Tahoe, CA',
        price: '$120/night',
        image: 'https://source.unsplash.com/400x300/?cabin,house',
    },
    {
        id: 2,
        title: 'Modern Apartment Downtown',
        location: 'New York, NY',
        price: '$200/night',
        image: 'https://source.unsplash.com/400x300/?apartment,city',
    },
    {
        id: 3,
        title: 'Beachfront Bungalow',
        location: 'Malibu, CA',
        price: '$350/night',
        image: 'https://source.unsplash.com/400x300/?beach,house',
    },
    {
        id: 4,
        title: 'Mountain Retreat',
        location: 'Aspen, CO',
        price: '$180/night',
        image: 'https://source.unsplash.com/400x300/?mountain,house',
    },
]

export default function HomePage() {
    return (
        <div className="home-container">
            <header className="hero">
                <h1>Find your next stay</h1>
                <p>Discover unique places to stay, from cozy cabins to city apartments.</p>
                <div className="search-bar">
                    <input type="text" placeholder="Search destinations" />
                    <button>Search</button>
                </div>
            </header>
            <section className="listings">
                {listings.map(listing => (
                    <div className="listing-card" key={listing.id}>
                        <img src={listing.image} alt={listing.title} />
                        <div className="listing-info">
                            <h2>{listing.title}</h2>
                            <p>{listing.location}</p>
                            <span>{listing.price}</span>
                        </div>
                    </div>
                ))}
            </section>
        </div>
    )
}