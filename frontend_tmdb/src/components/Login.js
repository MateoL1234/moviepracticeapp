import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/bootstrap.min.css';
import '../css/forms.css';
import { PulseLoader } from "react-spinners";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const URL = process.env.REACT_APP_SERVER

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch(`${URL}/api/user`, {
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.id) {
                    navigate('/');
                }
            } catch (error) {
                console.log(error);
            }
        };

        checkSession();
    }, []);


    const login = async (e) => {
        e.preventDefault();

        const userData = {
            email: email,
            password: password,
        };

        try {
            setLoading(true)
            const response = await fetch(`${URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData),
                credentials: 'include'
            });

            const data = await response.json();

            if (data.errors) {
                setErrors(data.errors);
            } else {
                setEmail('');
                setPassword('');
                setErrors({});
                navigate('/');
            }
        } catch (error) {
            console.log(error);
        }
        finally {
            setLoading(false)
        }
    };

    return (
        <div>
            <form onSubmit={login} className="create-user-form">
                {errors.unauthorize && <p className="error-message">{errors.unauthorize.msg}</p>}
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && <p className="error-message">{errors.email.msg}</p>}
                </div>
                <div>
                    <label htmlFor="password">Contraseña:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {errors.password && <p className="error-message">{errors.password.msg}</p>}
                </div>
                {!loading ? (
                    <>
                        <button className="buttons" type="submit">Crear usuario</button>
                        <Link to={"/register"}>
                            <p className='links mt-2'>Todavía no tengo cuenta</p>
                        </Link>
                    </>
                ) : (
                    <PulseLoader className="spinner-container" size={15} color="#ffffff" />
                )
                }
            </form>
        </div>
    );
};

export default Login;

