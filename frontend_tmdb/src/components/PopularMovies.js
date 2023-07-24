import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/bootstrap.min.css';
import '../css/lastMovies.css';
import { PulseLoader } from "react-spinners";

function PopularMovies({ userInfo }) {
    const key = process.env.REACT_APP_API_KEY;
    const [movies, setMovies] = useState([]);
    const [genres, setGenres] = useState([]);
    const [filterGenres, setFilterGenres] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: key
            }
        };
        setIsLoading(true);

        fetch(`https://api.themoviedb.org/3/genre/movie/list?language=${userInfo.language}`, options)
            .then(response => response.json())
            .then(response => {
                const hasNullNames = response.genres.find(genre => genre.name == null)
                if (!hasNullNames) {
                    setGenres(response.genres);
                } else {
                    fetch(`https://api.themoviedb.org/3/genre/movie/list?language=en-US`, options)
                        .then(response => response.json())
                        .then(response => setGenres(response.genres))
                        .catch(err => console.error(err));
                }
            })
            .catch(err => console.error(err))


        fetch(`https://api.themoviedb.org/3/discover/movie?include_adult=true&include_video=true&language=${userInfo.language}&page=1&watch_region=${userInfo.country}&region=${userInfo.country}&sort_by=popularity.desc&with_genres=${filterGenres}`, options)
            .then(response => response.json())
            .then(data => {
                if (data.results && data.results.length > 0) {
                    setMovies(data.results.slice(0, 10).map(movie => ({
                        id: movie.id,
                        title: movie.title || movie.original_title,
                        image: movie.poster_path,
                    })));
                } else {
                    setMovies([]);
                }
            })
            .catch(err => {
                console.error(err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [userInfo, filterGenres]);

    const handleCheckboxChange = (e) => {
        const checkedValue = e.target.value;
        setFilterGenres((prevGenres) => {
            if (e.target.checked) {
                return prevGenres ? prevGenres + "," + checkedValue : checkedValue;
            } else {
                return prevGenres.split(",").filter((genre) => genre !== checkedValue).join(",");
            }
        });
    };

    return (
        <React.Fragment>
            <h3 className='m-4'>Las películas más populares disponibles en tu país</h3>
            <div className='col-7 container '>
                {genres.map((genre, index) => (
                    <React.Fragment key={index + genre.id}>
                        <label htmlFor={genre.id + index + genre.name}>{genre.name}</label>
                        <input onChange={handleCheckboxChange} type='checkbox' value={genre.id} id={genre.id + index + genre.name} />
                    </React.Fragment>
                ))}
            </div>
            {isLoading ? (
                <div className='col-10 container pt-5 pb-5'>
                    <PulseLoader className="spinner-container" size={15} color="#ffffff" />
                </div>
            ) : movies.length === 0 ? (
                <></>
            ) : (
                <div className='col-10 container pt-5 pb-5'>
                    {movies.map(movie => (
                        <Link className="links" to={`/movie/${movie.id}`} key={movie.id}>
                            <div className="card" style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w780${movie.image})` }}>
                                <div className="movie-info">
                                    <h2>
                                        {movie.title}
                                    </h2>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </React.Fragment>
    );
}

export default PopularMovies