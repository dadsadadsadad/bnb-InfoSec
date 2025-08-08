import Login from './Login.jsx'
import HomePage from './HomePage.jsx'
import AccountSettings from './AccountSettings.jsx'
import AdminPage from './AdminPage.jsx'
import ListingPage from './ListingPage.jsx'
import HostListingPage from './HostListingPage.jsx'
import {Routes, Route} from 'react-router-dom'


function App() {
    return (
        <div>
            <Routes>
                <Route path="/" element={<Login/>} />
                <Route path="/adminpage" element={<AdminPage/>} />
                <Route path="/listingpage/:id" element={<ListingPage/>} />
                <Route path="/hostlistingpage" element={<HostListingPage/>} />
                <Route path="/homepage" element={<HomePage/>} />
                <Route path="/accountsettings" element={<AccountSettings/>} />
            </Routes>
            <a href={"/"}>login  </a>
            <a href={"/adminpage"}>adminpage  </a>
            <a href={"/hostlistingpage"}>hostlistingpage  </a>
            <a href={"/listingpage"}>listingpage  </a>
            <a href={"/homepage"}>homepage  </a>
            <a href={"/accountsettings"}>accountsettings  </a>
        </div>
    )
}

export default App
