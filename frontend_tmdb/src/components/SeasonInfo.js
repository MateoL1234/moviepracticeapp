import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PulseLoader } from "react-spinners";

function SeasonInfo({ userInfo }) {
    const key = process.env.REACT_APP_API_KEY;
    const { serieId, seasonId } = useParams();
    const [season, setSeason] = useState([]);
    const [seasonTrailer, setSeasonTrailer] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const commonTypes = ["Clip", "Trailer", "Teaser", "Scene"];
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: key
            }
        };

        fetch(`https://api.themoviedb.org/3/tv/${serieId}/season/${seasonId}?append_to_response=videos&language=${userInfo.language}`, options)
            .then(response => response.json())
            .then(data => {
                const trailer = data.videos.results.find((video) => video.site === "YouTube" && commonTypes.includes(video.type));
                if (data && data.episodes) {
                    setSeason(
                        data.episodes.map(episode => ({
                            number: episode.episode_number,
                            name: episode.name,
                            image: episode.still_path,
                            episodeId: episode.episode_number
                        }))
                    );
                } else {
                    setSeason([]);
                }
                setIsLoading(false);
                if (!trailer) {
                    fetch(`https://api.themoviedb.org/3/tv/${serieId}/season/${seasonId}/videos`, options)
                        .then(response => response.json())
                        .then(data => {
                            const newTrailer = data.results.find((video) => video.site === "YouTube" && commonTypes.includes(video.type));
                            setSeasonTrailer(newTrailer);
                        });
                } else {
                    setSeasonTrailer(trailer);
                }
            })
            .catch(error => {
                console.log(error);
                setIsLoading(false);
            });
    }, []);

    if (season.length === 0) {
        if (isLoading) {
            return (
                <div className='col-10 container pt-5 pb-5'>
                    <PulseLoader className="spinner-container" size={15} color="#ffffff" />
                </div>
            );
        } else {
            return <p className='m-4'>Temporada no encontrada</p>;
        }
    }

    return (
        <React.Fragment>
            <h3 className='m-4'>{`Capitulos de la temporada ${seasonId}`} </h3>
            {seasonTrailer ? (
                <Link target="_blank" className="links" to={`https://www.youtube.com/watch?v=${seasonTrailer.key}`}>
                    <h2>Ver Tráiler</h2>
                </Link>
            ) : (
                <h2></h2>
            )}
            <div className='col-10 container pt-5 pb-5'>
                {season.map((episode, index) => (
                <div key={episode.episodeId + index} className='episodeInfo d-inline justify-content-between text-align-center'>
                    <h6 className='episodeInfoName'>
                        {`${episode.number}. ${episode.name}`}
                    </h6>
                    <Link className="links" to={`/episode/${serieId}/${seasonId}/${episode.episodeId}`} key={episode.episodeId}>
                        <img src={`https://image.tmdb.org/t/p/w780${episode.image}`} />
                    </Link>
                </div>
                ))}
            </div>
        </React.Fragment>
    );
}

export default SeasonInfo;
