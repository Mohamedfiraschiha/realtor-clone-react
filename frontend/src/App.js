import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateListing from "./pages/CreateListing";
import Offers from "./pages/Offers";
import Profile from "./pages/Profile";
import Signin from "./pages/Signin";
import Signup from "./pages/signup";
import ForGotPassword from "./pages/ForGotPassword";
import EditListing from "./pages/EditListing";
import ShowListing from "./pages/ShowListing";
import Header from "./Components/Header";
function App() {
  return (
    <>
      <Router>
        <Header/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForGotPassword />} />
<Route path="/create-listing" element={<CreateListing />} />
<Route path="/edit-listing/:id" element={<EditListing />} />
<Route path="/show-listing/:id" element={<ShowListing />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
