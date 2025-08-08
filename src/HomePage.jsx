import { Link } from 'react-router-dom'
import './assets/HomePage.css'

const products = [
    { id: 1, name: 'Cozy Loft', description: 'A cozy loft in the city center.', image: 'https://source.unsplash.com/400x300/?apartment,loft' },
    { id: 2, name: 'Beach House', description: 'Relax at this beautiful beach house.', image: 'https://source.unsplash.com/400x300/?beach,house' },
    { id: 3, name: 'Mountain Cabin', description: 'Escape to a peaceful mountain cabin.', image: 'https://source.unsplash.com/400x300/?cabin,mountain' },
]

function HomePage() {
    return (
        <div className="homepage-container">
            <h1 className="homepage-title">Stays nearby</h1>
            <div className="homepage-grid">
                {products.map(product => (
                    <Link
                        key={product.id}
                        to={`/listingpage/${product.id}`}
                        className="homepage-card"
                    >
                        <img
                            src={product.image}
                            alt={product.name}
                            className="homepage-card-image"
                        />
                        <div className="homepage-card-content">
                            <h2 className="homepage-card-name">{product.name}</h2>
                            <p className="homepage-card-desc">{product.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default HomePage