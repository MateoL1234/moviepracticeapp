import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CheckSelectedProfile() {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const URL = process.env.REACT_APP_SERVER;

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const storage = JSON.parse(sessionStorage?.getItem('selectedProfile'));
                const response = await fetch(`${URL}/api/profile/${storage?.id}`, {
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.error) {
                    setError(data.error);
                }
            } catch (error) {
                setError('Se produjo un error al obtener el perfil.');
            }
        };
        fetchUserProfile();
    }, []);

    useEffect(() => {
        if (error) {
            sessionStorage.removeItem('selectedProfile')
            navigate('/');
        }
    }, [error, navigate]);

    return <></>;
}

export default CheckSelectedProfile;


export async function checkProfileToFetch(profileId) {
    const URL = process.env.REACT_APP_SERVER;
    try {
        const response = await fetch(`${URL}/api/profile/${profileId}`, {
            credentials: 'include'
        });
        const data = await response.json();
        if (data.error) {
            throw new Error('Error al obtener el perfil');
        }
    } catch (error) {
        throw new Error('Error al obtener el perfil');
    }
}