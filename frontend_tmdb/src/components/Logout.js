import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PulseLoader } from "react-spinners";
import '../css/bootstrap.min.css';

function Logout({ setLoggedIn }) {
  const navigate = useNavigate();
  const URL = process.env.REACT_APP_SERVER

  useEffect(() => {
    handleLogout();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch(`${URL}/api/logout`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok) {
        setLoggedIn(false);
        sessionStorage.removeItem("selectedProfile");
        navigate('/');
      }
    } catch (error) {
    }
  };

  return <PulseLoader className="mt-5 justify-content-center d-flex" size={15} color="#ffffff" />;
}

export default Logout;

