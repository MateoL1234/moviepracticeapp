import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../css/bootstrap.min.css';
import '../css/movieInfo.css';
import { PulseLoader } from "react-spinners";

function EpisodeInfo({ userInfo }) {
    const key = process.env.REACT_APP_API_KEY;
    const { seasonId, serieId, episodeId } = useParams();
    const [episode, setEpisode] = useState([]);
    const [episodeTrailer, setEpisodeTrailer] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: key
            }
        };

        fetch(`https://api.themoviedb.org/3/tv/${serieId}/season/${seasonId}/episode/${episodeId}?append_to_response=videos&language=${userInfo.language}`, options)
            .then(response => response.json())
            .then(data => {
                const trailer = data.videos.results.find((video) => video.site === "YouTube");
                if (data) {
                    setEpisode({
                        title: data.name,
                        image: data.still_path,
                        description: data.overview,
                        vote: data.vote_average,
                        releaseDate: data.air_date
                    });
                } else {
                    setEpisode([]);
                }
                if (!trailer) {
                    fetch(`https://api.themoviedb.org/3/tv/${serieId}/season/${seasonId}/episode/${episodeId}/videos`, options)
                        .then(response => response.json())
                        .then(data => {
                            const newTrailer = data.results.find((video) => video.site === "YouTube");
                            setEpisodeTrailer(newTrailer);
                            setIsLoading(false);
                        })
                }
                else {
                    setEpisodeTrailer(trailer);
                    setIsLoading(false);
                }
            })
            .catch(error => {
                console.log(error);
                setIsLoading(false);
            });
    }, []);

    if (episode.length === 0) {
        if (isLoading) {
            return (
                <div className='container col-10'>
                    <PulseLoader className="spinner-container" size={15} color="#ffffff" />
                </div>
            );
        } else {
            return <p className='m-4'>Episodio no encontrado</p>;
        }
    }

    return (
        <React.Fragment>
            <div className='container col-10'>
                <div className="row">
                    <div className="col-12 w-300">
                        {episodeTrailer ? (
                            <Link className='links' target="_blank" to={`https://www.youtube.com/watch?v=${episodeTrailer.key}`}>
                                <h3 className='mb-4'> {episode.title} ({episode.releaseDate})</h3>
                                <img src={`https://image.tmdb.org/t/p/w342/${episode.image}`} alt="Movie Poster" className="img-fluid" />
                            </Link>
                        ) : (
                            <>
                                <h3 className='mb-4'> {episode.title} ({episode.releaseDate})</h3>
                                <img src={`https://image.tmdb.org/t/p/w342/${episode.image}`} alt="Movie Poster" className="img-fluid" />
                            </>
                        )
                        }
                        <h5 className='mt-4'>Puntaje: {episode.vote}</h5>
                        <p className='mt-4'>{episode.description}</p>
                    </div>
                </div>
            </div>
        </React.Fragment >
    );
}

export default EpisodeInfo;
