import { useParams } from 'react-router-dom';
export default function Product() {
    const { id } = useParams();
    return (
        <div>
            <h1>Listing #{id}</h1>
            <p>Details about the place, host info, booking calendar, etc.</p>
        </div>
    );
}
