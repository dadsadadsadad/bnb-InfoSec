export default function AccountSettings() {
    return (
        <div>
            <h1>👤 Account Settings</h1>
            <form>
                <label>Name:</label>
                <input type="text" placeholder="Your name" />
                <label>Email:</label>
                <input type="email" placeholder="Your email" />
                <button>Save Changes</button>
            </form>
        </div>
    );
}