import { useParams } from 'react-router-dom'

const listings = [
    {
        id: '1',
        title: 'Cozy Loft in City Center',
        image: 'https://source.unsplash.com/800x500/?apartment,loft',
        host: 'Jane Doe',
        description: 'A beautiful, sunlit loft in the heart of the city. Walk to cafes, shops, and parks. Perfect for couples or solo travelers.',
        price: 120,
        rating: 4.8,
        reviews: 42,
    },
    {
        id: '2',
        title: 'Beach House',
        image: 'https://source.unsplash.com/800x500/?beach,house',
        host: 'John Smith',
        description: 'Relax at this beautiful beach house with ocean views.',
        price: 200,
        rating: 4.9,
        reviews: 30,
    },
    {
        id: '3',
        title: 'Mountain Cabin',
        image: 'https://source.unsplash.com/800x500/?cabin,mountain',
        host: 'Emily Clark',
        description: 'Escape to a peaceful mountain cabin surrounded by nature.',
        price: 150,
        rating: 4.7,
        reviews: 25,
    },
]

export default function ListingPage() {
    const { id } = useParams()
    const listing = listings.find(l => l.id === id)

    if (!listing) {
        return <div>Listing not found.</div>
    }

    return (
        <div className="listing-container">
            <img className="listing-image" src={listing.image} alt={listing.title} />
            <div className="listing-main">
                <div className="listing-details">
                    <h1 className="listing-title">{listing.title}</h1>
                    <div className="listing-host">Hosted by {listing.host}</div>
                    <div className="listing-rating">
                        <span>⭐ {listing.rating}</span>
                        <span className="listing-reviews">({listing.reviews} reviews)</span>
                    </div>
                    <p className="listing-description">{listing.description}</p>
                </div>
                <div className="listing-booking-card">
                    <div className="listing-price">${listing.price} <span className="listing-night">/ night</span></div>
                    <button className="listing-book-btn">Book now</button>
                </div>
            </div>
        </div>
    )
}