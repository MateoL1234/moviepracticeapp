import React, { useEffect, useState } from 'react';
import { useLocation, Routes, Link, Route, useNavigate, Navigate } from 'react-router-dom';
import PopularMovies from '../components/PopularMovies';
import PopularSeries from '../components/PopularSeries';
import MovieInfo from '../components/MovieInfo';
import SerieInfo from '../components/SerieInfo';
import SeasonInfo from '../components/SeasonInfo';
import EpisodeInfo from '../components/EpisodeInfo';
import Search from '../components/Search';
import Register from '../components/Register';
import Login from '../components/Login';
import ProfileAdding from '../components/ProfileAdding';
import Profile from '../components/Profile';
import Logout from '../components/Logout';
import NotFound from '../components/NotFound';
import UserProfiles from '../components/UserProfiles';
import CheckSelectedProfile from '../components/checkSelectedProfile';

import '../css/bootstrap.min.css';
import '../css/header.css';
import '../css/seasonInfo.css';
import '../css/lastMovies.css';

function Header() {
  const location = useLocation();
  const [loggedIn, setLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const navigate = useNavigate()
  const profile = JSON.parse(sessionStorage.getItem('selectedProfile'));
  const URL = process.env.REACT_APP_SERVER

  useEffect(() => {
    checkSession();
    checkStorage()
  }, [location]);

  const checkSession = async () => {
    try {
      const response = await fetch(`${URL}/api/user`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data) {
        setUserInfo({
          country: data?.country,
          language: data?.language
        })
      }
      if (!data.error) {
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkStorage = async () => {
    if (location.pathname !== '/') {
      try {
        const storage = JSON.parse(sessionStorage?.getItem('selectedProfile'));
        if (storage?.id) {
          const response = await fetch(`${URL}/api/profile/${storage?.id}`, {
            credentials: 'include'
          });
          const data = await response.json();
          if (data.error) {
            sessionStorage.removeItem('selectedProfile')
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${URL}/api/logout`, {
        credentials: 'include'
      });
      setLoggedIn(false);
    } catch (error) {
      console.log(error);
    }
  };

  if (location.pathname === '/') {
    return <UserProfiles />;
  }

  return (
    <React.Fragment>
      <header className="App-header bg-dark">
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
          <div className="container-fluid">
            <Link to={'/home'} className="navbar-brand links" href="#">
              Películas ML 🎥
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className=" navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse justify-content-around" id="navbarSupportedContent">
              <ul className="navbar-nav me-auto mb-2 mb-md-0">
                {loggedIn ? (
                  <>
                    {profile && profile.name &&
                      <Link to="/profile" className='links'>
                        <li className="nav-item">
                          {profile?.name}
                          <img src={`${profile?.image}`} alt="Profile" className="profile-image" />
                        </li>
                      </Link>
                    }
                    <li className="nav-item">
                      <Link className='links' to="/">Ver perfiles</Link>
                    </li>
                    <li className="nav-item">
                      <Link className='links' to="/logout" onClick={handleLogout}>Cerrar sesión</Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="nav-item">
                      <Link className='links' to="/login">Iniciar sesión</Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={< UserProfiles userInfo={userInfo} />} />
        <Route
          path="/home"
          element={
            <React.Fragment>
              <CheckSelectedProfile />
              <Search userInfo={userInfo} />
              <PopularMovies userInfo={userInfo} />
              <PopularSeries userInfo={userInfo} />
            </React.Fragment>
          }
        />
        <Route path="/addProfile" element={<ProfileAdding />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile userInfo={userInfo} />} />
        <Route path="/movie/:movieId" element={<><MovieInfo userInfo={userInfo} loggedIn={loggedIn} /> <CheckSelectedProfile /> </>} />
        <Route path="/tv/:serieId" element={<><SerieInfo userInfo={userInfo} loggedIn={loggedIn} /> <CheckSelectedProfile /> </>} />
        <Route path="/season/:serieId/:seasonId" element={<><SeasonInfo userInfo={userInfo} /> <CheckSelectedProfile /> </>} />
        <Route path="/episode/:serieId/:seasonId/:episodeId" element={<><EpisodeInfo userInfo={userInfo} /> <CheckSelectedProfile /> </>} />
        <Route path="/logout" element={<Logout setLoggedIn={setLoggedIn} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </React.Fragment >
  );
}

export default Header;
