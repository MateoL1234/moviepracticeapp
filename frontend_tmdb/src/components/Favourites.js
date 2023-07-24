import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BiX } from 'react-icons/bi';
import { IconContext } from 'react-icons';
import { PulseLoader } from "react-spinners";
import { checkProfileToFetch } from './checkSelectedProfile';
import '../css/profile.css';

function Favourites({ userInfo }) {
    const [moviesData, setMoviesData] = useState([]);
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reqLoading, setReqLoading] = useState(false);
    const [error, setError] = useState('');

    const URL = process.env.REACT_APP_SERVER;

    const userFavourites = async () => {
        try {
            const profile = JSON.parse(sessionStorage.getItem('selectedProfile'));
            const profileId = profile?.id;
            const response = await fetch(`${URL}/api/favouriteMovies?profileId=${profileId}`, {
                credentials: 'include'
            });
            const data = await response.json();
            setMoviesData(data);
        } catch (error) {
            console.log(error);
        }
    };

    const deleteFavourite = async (movieId, movieType) => {
        try {
            const profile = JSON.parse(sessionStorage.getItem('selectedProfile'));
            const profileId = profile?.id;
            await checkProfileToFetch(profileId);
            setReqLoading(true);
            const response = await fetch(`${URL}/api/favouriteDestroy/${movieId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ movieId, movieType, profileId }),
                credentials: 'include'
            });
            const data = await response.json();

            if (data.deleteSuccess) {
                userFavourites();
            }
        } catch (error) {
            setError(error.message);
            setReqLoading(false);
        } finally {
            setReqLoading(false);
        }
    };

    useEffect(() => {
        userFavourites();
    }, []);

    useEffect(() => {
        setLoading(true)
        const fetchMovieData = async () => {
            try {
                const moviePromises = moviesData.map(async (movie) => {
                    const response = await fetch(
                        `https://api.themoviedb.org/3/${movie.type}/${movie.movie_id}?append_to_response=videos&language=${userInfo.language}`,
                        {
                            method: 'GET',
                            headers: {
                                accept: 'application/json',
                                Authorization: process.env.REACT_APP_API_KEY,
                            },
                        }
                    );
                    const data = await response.json();
                    if (data) {
                        const movieData = {
                            movieId: movie.movie_id,
                            title: data.title || data.original_title || data.name || data.original_name,
                            image: data.poster_path,
                            description: data.overview,
                            vote: data.vote_average,
                            releaseDate: data.release_date || data.first_air_date,
                            type: movie.type,
                        };
                        return movieData;
                    }
                });
                const movieDataArray = await Promise.all(moviePromises);
                setMovies(movieDataArray);
            } catch (error) {
                console.log(error);
                setLoading(false);
            } finally {
                setLoading(false);
            }
        };
        fetchMovieData();
    }, [moviesData, userInfo.language]);

    function deleteErrorMessage() {
        setError('')
    }
    
    return (
        <React.Fragment>
            {loading ? (
                <div className='col-10 loading-container pt-5 pb-5'>
                    <PulseLoader className="spinner-container" size={15} color="#ffffff" />
                </div>
            ) : movies && movies.length > 0 ? (
                <>
                    <h3 className='m-4'>Tus películas/series favoritas</h3>
                    {reqLoading && (
                        <div className='col-10 loading-container pt-5 pb-5'>
                            <PulseLoader className="spinner-container" size={15} color="#ffffff" />
                        </div>
                    )}
                    {!reqLoading && error && (
                        <div className="d-flex mt-2 mb-2 container align-items-center justify-content-center alert alert-warning alert-dismissible fade show" role="alert">
                            {error}
                            <button onClick={deleteErrorMessage} type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    )}
                    <div className='col-10 container pt-5 pb-5'>
                        {movies.map((movie, index) => (
                            <React.Fragment key={index + movie.movieId}>
                                <Link className='links' to={`/${movie.type}/${movie.movieId}`} key={index + movie.movieId}>
                                    <div className='card' style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w780${movie.image})` }}>
                                        <div className='favourites-info'>
                                            <h2>{movie.title}</h2>
                                            <form
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    deleteFavourite(movie.movieId, movie.type);
                                                }}
                                            >
                                                <IconContext.Provider value={{ size: '2em' }}>
                                                    <button className="close-button" type='submit'>
                                                        <BiX />
                                                    </button>
                                                </IconContext.Provider>
                                            </form>
                                        </div>
                                    </div>
                                </Link>
                            </React.Fragment>
                        ))}
                    </div>
                </>
            ) : (
                <h3 className='m-4'>Añade películas/series favoritas</h3>
            )}
        </React.Fragment>
    );
}

export default Favourites;
