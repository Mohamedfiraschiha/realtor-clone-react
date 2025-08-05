import React, { useEffect, useState } from 'react'
import { useLocation ,useNavigate } from 'react-router-dom'

export default function Header() {
    const location=useLocation()
    const navigate=useNavigate()
    function pathMatchRoute(Route){
        if(Route===location.pathname){
            return true;
        }
    }
    // Track login state with state and storage events
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return payload.exp * 1000 > Date.now();
        } catch {
          return false;
        }
      }
      return false;
    });
    useEffect(() => {
      const onStorage = () => {
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setIsLoggedIn(payload.exp * 1000 > Date.now());
          } catch {
            setIsLoggedIn(false);
          }
        } else {
          setIsLoggedIn(false);
        }
      };
      window.addEventListener('storage', onStorage);
      return () => window.removeEventListener('storage', onStorage);
    }, []);
    // Logout handler
    function handleLogout() {
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      navigate("/signin");
    }
    return (
      <div className='bg-white border-b shadow-sm sticky top-0 z-50'>
          <header className='flex justify-between items-center px-3 max-w-6xl mx-auto'>
              <div>
                  <img src="https://static.rdc.moveaws.com/rdc-ui/logos/logo-brand.svg" alt="logo" className='h-5 cursor-pointer' onClick={() => navigate("/")}/>
              </div>
              <div>
                  <ul className='flex space-x-10'>
                      <li   className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${
                  pathMatchRoute("/") && "text-black border-b-red-500"
                }`}onClick={() => navigate("/")}
                > home</li>
                      <li  className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${
                  pathMatchRoute("/offers") && "text-black border-b-red-500"
                }`} 
                onClick={() => navigate("/offers")}
                >Offers</li>
                      {isLoggedIn ? (
                        <>
                          <li className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${
                              pathMatchRoute("/profile") && "text-black border-b-red-500"
                            }`} onClick={() => navigate("/profile")}>Profile</li>
                          <li className="cursor-pointer py-3 text-sm font-semibold text-gray-400 hover:text-black" 
                              onClick={handleLogout}>
                            Logout
                          </li>
                        </>
                      ) : (
                        <li className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${
                          pathMatchRoute("/sign-in") && "text-black border-b-red-500"
                        }`} onClick={() => navigate("/signin")}>Sign In</li>
                      )}
                  </ul>
              </div>
          </header>
      </div>
    )
}
