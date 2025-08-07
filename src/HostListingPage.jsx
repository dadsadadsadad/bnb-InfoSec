import { useParams } from 'react-router-dom';
export default function HostProduct() {
    const { id } = useParams();
    return (
        <div>
            <h1>Manage Your Listing #{id}</h1>
            <p>Edit pricing, availability, and description for your listing.</p>
        </div>
    );
}
