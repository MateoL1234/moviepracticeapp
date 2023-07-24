import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../css/bootstrap.min.css';
import '../css/movieInfo.css';

function SerieRecommendation({ userInfo }) {
    const key = process.env.REACT_APP_API_KEY;
    const { serieId } = useParams();
    const [serie, setSerie] = useState([]);

    useEffect(() => {
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: key
            }
        };

        fetch(`https://api.themoviedb.org/3/tv/${serieId}/recommendations?language=${userInfo.language}&page=1`, options)
            .then((response) => response.json())
            .then((data) => {
                if (data && data.results) {
                    setSerie(data.results.slice(0, 10).map(serie => ({
                        serieId: serie.id,
                        title: serie.name || serie.original_name,
                        image: serie.poster_path,
                    })));
                } else {
                    setSerie([]);
                }
            });
    }, [serieId, userInfo.language]);

    if (serie.length === 0) {
        return <div></div>;
    }

    return (
        <React.Fragment>
            <h3 className='m-4'>Te recomendamos lo siguiente</h3>
            <div className='col-10 container pt-5 pb-5'>
                {serie.map(serie => (
                    <Link className="links" to={`/tv/${serie.serieId}`} key={serie.serieId}>
                        <div className="card" style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w780${serie.image})` }}>
                            <div className="movie-info">
                                <h2>
                                    {serie.title}
                                </h2>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </React.Fragment>
    );
}

export default SerieRecommendation;
