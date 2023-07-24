import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/bootstrap.min.css';
import '../css/lastMovies.css';
import { PulseLoader } from "react-spinners";

function PopularSeries({ userInfo }) {
    const key = process.env.REACT_APP_API_KEY;
    const [seriesList, setSeriesList] = useState([]);
    const [genres, setGenres] = useState([]);
    const [filterGenres, setFilterGenres] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: key
        }
    }

    useEffect(() => {
        setIsLoading(true);

        fetch(`https://api.themoviedb.org/3/genre/tv/list?language=${userInfo.language}`, options)
            .then(response => response.json())
            .then(response => {
                const hasNullNames = response.genres.find(genre => genre.name == null)
                if (!hasNullNames) {
                    setGenres(response.genres);
                } else {
                    fetch(`https://api.themoviedb.org/3/genre/tv/list?language=en-US`, options)
                        .then(response => response.json())
                        .then(response => setGenres(response.genres))
                        .catch(err => console.error(err));
                }
            })
            .catch(err => console.error(err))

        fetch(`https://api.themoviedb.org/3/discover/tv?include_adult=true&include_null_first_air_dates=true&language=${userInfo.language}&page=1&sort_by=popularity.desc&watch_region=${userInfo.country}&with_watch_providers=384|8|9|337|531|619&with_genres=${filterGenres}`, options)
            .then(response => response.json())
            .then(data => {
                if (data.results && data.results.length > 0) {
                    setSeriesList(
                        data.results.slice(0, 10).map(serie => ({
                            id: serie.id,
                            title: serie.name || serie.original_name,
                            image: serie.poster_path
                        }))
                    );
                } else {
                    setSeriesList([]);
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
            <h3 className="m-4">
                Las series más populares en el mundo disponibles en tu país y en los servicios de streaming más populares
            </h3>
            <div className='col-7 container '>
                {genres.map((genre, index) => (
                    <React.Fragment key={index + genre.id}>
                        <label htmlFor={genre.id}>{genre.name}</label>
                        <input onChange={handleCheckboxChange} type='checkbox' value={genre.id} id={genre.id} />
                    </React.Fragment>
                ))}
            </div>
            {isLoading ? (
                <div className='col-10 container pt-5 pb-5'>
                    <PulseLoader className="spinner-container" size={15} color="#ffffff" />
                </div>
            ) : seriesList.length === 0 ? (
                <></>
            ) : (
                <div className="col-10 container pt-5 pb-5">
                    {seriesList.map(serie => (
                        <Link className="links" to={`/tv/${serie.id}`} key={serie.id}>
                            <div
                                className="card"
                                style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w780${serie.image})` }}
                            >
                                <div className="movie-info">
                                    <h2>{serie.title}</h2>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </React.Fragment >
    );
}


export default PopularSeries;