import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BiX } from 'react-icons/bi';
import { IconContext } from 'react-icons';
import { PulseLoader } from "react-spinners";
import { checkProfileToFetch } from './checkSelectedProfile';

function UserProfiles({ userInfo }) {
    const [profilesData, setProfilesData] = useState([]);
    const [profileId, setProfileId] = useState()
    const [loading, setLoading] = useState(true);
    const [reqLoading, setReqLoading] = useState(false);
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const URL = process.env.REACT_APP_SERVER

    const fetchAllProfiles = async () => {
        try {
            const response = await fetch(`${URL}/api/profiles`, {
                credentials: 'include'
            });
            const data = await response.json();
            if (Array.isArray(data)) {
                const profilesData = data.map((profile) => ({
                    id: profile.id,
                    name: profile.name,
                    image: profile.image,
                }));
                setProfilesData(profilesData);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const getUserData = async () => {
            try {
                const response = await fetch(`${URL}/api/user`, {
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.error) {
                    setProfileId(null)
                } else {
                    setProfileId(data.id);
                }
            } catch (error) {
                console.error(error);
            }
            finally {
                setLoading(false);
            }
        };
        getUserData();
    }, [navigate]);

    useEffect(() => {
        setLoading(true);
        fetchAllProfiles();
    }, [profileId]);

    const deleteProfile = async (id) => {
        try {
            await checkProfileToFetch(id);
            setReqLoading(true)
            const response = await fetch(`${URL}/api/deleteProfile/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
                credentials: 'include'
            });
            const data = await response.json();
            if (id) {
                sessionStorage.removeItem('selectedProfile');
            }
            if (data.deleteSuccess) {
                fetchAllProfiles();
            }
        } catch (error) {
            setError(error.message);
            setReqLoading(false);
        }
        finally {
            setReqLoading(false)
        }
    };
    const saveToSessionStorage = (profile) => {
        sessionStorage.setItem('selectedProfile', JSON.stringify(profile));
    };

    function deleteErrorMessage() {
        setError('')
    }

    return (
        <React.Fragment>
            <h3 className='m-4'>Tus perfiles</h3>
            {reqLoading &&
                <div className='col-10 container pt-5 pb-5'>
                    <PulseLoader className="spinner-container" size={15} color="#ffffff" />
                </div>
            }
            {!reqLoading && error && (
                <div className="d-flex mt-2 mb-2 container align-items-center justify-content-center alert alert-warning alert-dismissible fade show" role="alert">
                    {error}
                    <button onClick={deleteErrorMessage} type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            )}
            {!loading ? (
                <div className='col-10 container pt-5 pb-5'>
                    <React.Fragment>
                        {profilesData &&
                            profilesData.length > 0 &&
                            profilesData.map((profile, index) => (
                                <Link to={"/home"} key={index + profile.id}>
                                    <React.Fragment>
                                        <div
                                            className='profileCard'
                                            onClick={() => saveToSessionStorage(profile)}
                                        >
                                            <div
                                                className='background-image'
                                                style={{ backgroundImage: `url(${profile.image})` }}
                                            ></div>
                                            <div className='overlay'>
                                                <h2 className='profile-info'>{profile.name}</h2>
                                                <IconContext.Provider value={{ size: '2em' }}>
                                                    <form
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            deleteProfile(profile.id);
                                                        }}
                                                    >
                                                        <button className="close-button" type='submit'>
                                                            <BiX />
                                                        </button>
                                                    </form>
                                                </IconContext.Provider>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                </Link>
                            ))}
                    </React.Fragment>
                    <div className='profileCard'>
                        <div
                            className='background-image'
                            style={{ backgroundImage: `url(https://i.imgur.com/oHtrDes.png)` }}
                        ></div>
                        <Link to="/addProfile">
                            <div className='overlay'>
                                <h2 className='profile-info'>Añadir perfil</h2>
                            </div>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className='col-10 container pt-5 pb-5'>
                    <PulseLoader className="spinner-container" size={15} color="#ffffff" />
                </div>
            )}
        </React.Fragment>
    );
}

export default UserProfiles;

