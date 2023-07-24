import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../css/bootstrap.min.css';
import '../css/movieInfo.css';

function MovieRecommendation({ userInfo }) {
    const key = process.env.REACT_APP_API_KEY;
    const { movieId } = useParams();
    const [movie, setMovie] = useState([]);

    useEffect(() => {
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: key,
            },
        };

        fetch(`https://api.themoviedb.org/3/movie/${movieId}/recommendations?language=${userInfo.language}&page=1`, options)
            .then((response) => response.json())
            .then((data) => {
                if (data && data.results) {
                    setMovie(data.results.slice(0, 10).map(movie => ({
                        movieId: movie.id,
                        title: movie.title || movie.original_title,
                        image: movie.poster_path,
                    }))
                    );
                } else {
                    setMovie([]);
                }
            });
    }, [movieId, userInfo.language]);

    if (movie.length === 0) {
        return <div></div>;
    }

    return (
        <React.Fragment>
            <h3 className="m-4">Te recomendamos lo siguiente</h3>
            <div className="col-10 container pt-5 pb-5">
                {movie.map((movie) => (
                    <Link className="links" to={`/movie/${movie.movieId}`} key={movie.movieId}>
                        <div className="card" style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w780${movie.image})` }}>
                            <div className="movie-info">
                                <h2>{movie.title}</h2>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </React.Fragment>
    );
}

export default MovieRecommendation;
