import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/bootstrap.min.css';
import '../css/forms.css';
import { PulseLoader } from "react-spinners";

const ProfileAdding = () => {
    const [name, setName] = useState('');
    const [image, setImage] = useState('');
    const [id, setId] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const URL = process.env.REACT_APP_SERVER;

    useEffect(() => {
        const getUserData = async () => {
            try {
                const response = await fetch(`${URL}/api/user`, {
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.error) {
                    navigate('/login', { replace: true });
                } else {
                    setId(data.id);
                }
            } catch (error) {
                console.error(error);
            }
        };

        getUserData();
    }, []);

    const profileAdding = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await fetch(`${URL}/api/addProfile/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, image }),
                credentials: 'include'
            });
            const data = await response.json();
            if (data.errors) {
                setErrors(data.errors);
                setLoading(false);
            } else {
                setLoading(false);
                navigate('/', { replace: true });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleName = (e) => {
        setName(e.target.value);
    };

    const handleImage = (e) => {
        setImage(e.target.value);
    };

    return (
        <div>
            <form onSubmit={profileAdding} className="create-user-form">
                <div>
                    <input
                        id="name"
                        name="name"
                        onChange={handleName}
                    />
                    {errors && errors.name && <p className="error-message">{errors.name.msg}</p>}
                </div>
                <div>
                    <input
                        id="image"
                        name="image"
                        placeholder='https://url-a-una-imagen.jpg'
                        onChange={handleImage}
                    />
                </div>
                {!loading ? (
                    <button className="buttons" type="submit">
                        Añadir Perfil
                    </button>
                ) : (
                    <PulseLoader className="spinner-container" size={15} color="#ffffff" />
                )}
            </form>
        </div>
    );
};

export default ProfileAdding;
