import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../css/bootstrap.min.css';
import '../css/forms.css';

const CreateUserForm = () => {
    const [countries, setCountries] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [country, setCountry] = useState('');
    const [language, setLanguage] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const key = process.env.REACT_APP_API_KEY;
    const URL = process.env.REACT_APP_SERVER

    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: key,
        },
    };

    const checkSession = async () => {
        try {
            const response = await fetch(`${URL}/api/user`, {
                credentials: 'include'
            });
            const data = await response.json();

            if (!data.error) {
                navigate('/');
            }
        } catch (error) {
        }
    };

    checkSession();

    const register = async (e) => {
        e.preventDefault();

        const userData = {
            name: name,
            email: email,
            password: password,
            country: country,
            language: language,
            confirmPassword: confirmPassword
        };

        if (country === '') {
            setErrors({ country: { msg: 'Selecciona un país' } });
            return;
        }

        if (language === '') {
            setErrors({ language: { msg: 'Selecciona un idioma' } });
            return;
        }
        try {
            const response = await fetch(`${URL}/api/register`, {
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
                setName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setErrors({});
                navigate('/login');
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetch('https://api.themoviedb.org/3/configuration/countries', options)
            .then((response) => response.json())
            .then((data) => {
                setCountries(
                    data.map((country) => ({
                        name: country.english_name,
                        iso: country.iso_3166_1,
                    }))
                );
            });
        fetch('https://api.themoviedb.org/3/configuration/languages', options)
            .then((response) => response.json())
            .then((data) => {
                setLanguages(
                    data.map((language) => ({
                        name: language.english_name,
                        iso: language.iso_639_1,
                    }))
                );
            });
    }, []);

    return (
        <form onSubmit={register} className="create-user-form">
            <div>
                <label htmlFor="name">Nombre:</label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                {errors.name && <p className="error-message">{errors.name.msg}</p>}
            </div>
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
                <label htmlFor="country">Country:</label>
                <select onChange={(e) => setCountry(e.target.value)}>
                    <option value="">Seleccionar país</option>
                    {countries.map((country, index) => (
                        <option key={index + country.iso} value={country.iso}>
                            {country.name}
                        </option>
                    ))}
                </select>
                {errors.country && <p className="error-message">{errors.country.msg}</p>}
            </div>
            <div>
                <label htmlFor="language">Language:</label>
                <select onChange={(e) => setLanguage(e.target.value)}>
                    <option value="">Seleccionar idioma</option>
                    {languages.map((language, index) => (
                        <option key={index + language.iso} value={language.iso}>
                            {language.name}
                        </option>
                    ))}
                </select>
                {errors.language && <p className="error-message">{errors.language.msg}</p>}
            </div>
            <div>
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && <p className="error-message">{errors.password.msg}</p>}
            </div>
            <div>
                <label htmlFor="confirmPassword">Confirm Password:</label>
                <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {errors.confirmPassword && <p className="error-message">{errors.confirmPassword.msg}</p>}
            </div>
            <button className="buttons" type="submit">Crear usuario</button>
            <Link to={"/login"}>
                <p className='links mt-2'>Ya tengo una cuenta</p>
            </Link>
        </form>
    );
};

export default CreateUserForm;
