import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SerieRecommendation from './SerieRecommendation';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/bootstrap.min.css';
import '../css/movieInfo.css';
import { PulseLoader } from "react-spinners";
import { checkProfileToFetch } from './checkSelectedProfile';

function SerieInfo({ userInfo, loggedIn }) {
    const key = process.env.REACT_APP_API_KEY;
    const { serieId } = useParams();
    const [serie, setSerie] = useState(null);
    const [serieTrailer, setSerieTrailer] = useState([])
    const [success, setSuccess] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [reqLoading, setReqLoading] = useState(false)
    const [error, setError] = useState('')
    const URL = process.env.REACT_APP_SERVER

    useEffect(() => {
        setSuccess(null);
        const commonTypes = ["Clip", "Trailer", "Teaser", "Scene"];
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: key
            }
        };

        if (userInfo && userInfo.language) {
            fetch(`https://api.themoviedb.org/3/tv/${serieId}?append_to_response=videos&language=${userInfo?.language}`, options)
                .then(response => response.json())
                .then(data => {
                    if (data && data.status_code !== 34) {
                        setSerie({
                            id: data.id,
                            title: data.name || data.original_name,
                            image: data.poster_path,
                            description: data.overview,
                            vote: data.vote_average,
                            releaseDate: data.first_air_date,
                            type: "tv",
                            seasons: data?.seasons.map(season => season.season_number)
                        });
                    } else {
                        setSerie(null);
                    }
                    setIsLoading(false);

                    const trailer = data?.videos?.results.find((video) => video.site === "YouTube" && commonTypes.includes(video.type));
                    if (!trailer) {
                        fetch(`https://api.themoviedb.org/3/tv/${serieId}/videos`, options)
                            .then(response => response.json())
                            .then(data => {
                                const newTrailer = data?.results?.find((video) => video.site === "YouTube" && commonTypes.includes(video.type));
                                setSerieTrailer(newTrailer);
                            });
                    } else {
                        setSerieTrailer(trailer);
                    }
                })
                .catch(error => {
                    console.error(error);
                    setIsLoading(false);
                })
                .finally(() => {
                    setIsLoading(false);
                    window.scrollTo(0, 0);
                });
        }
    }, [serieId, userInfo.language]);



    const addFavourite = async function (e) {
        const profile = JSON.parse(sessionStorage.getItem('selectedProfile'));
        const profileId = profile?.id
        e.preventDefault();
        try {
            await checkProfileToFetch(profileId);
            setReqLoading(true)
            setSuccess(null);
            const response = await fetch(`${URL}/api/favourite/${serieId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ serieId, profileId }),
                credentials: 'include'
            });

            const data = await response.json();

            if (data.errorAdding) {
                setSuccess(false)
                setReqLoading(false)
            }
            else {
                setReqLoading(false)
                setSuccess(true)
            }
        } catch (error) {
            setReqLoading(false)
            setSuccess(null)
            setError(error.message);
        }
    };

    function deleteErrorMessage() {
        setError('')
    }

    if (!serie) {
        if (isLoading) {
            return (
                <div className='col-10 container pt-5 pb-5'>
                    <PulseLoader className="spinner-container" size={15} color="#ffffff" />
                </div>
            );
        } else {
            return <p className='m-4'>Serie no encontrada</p>;
        }
    }
    return (
        <React.Fragment>
            <div className="container col-10">

                {serie && (
                    <div className="row">
                        <div className="col-12 w-300">
                            {
                                serieTrailer ? (
                                    <Link className='links' target="_blank" to={`https://www.youtube.com/watch?v=${serieTrailer.key}`}>
                                        <h3 className='mb-4 links'>{serie.title} ({serie.releaseDate})</h3>
                                        <img src={`https://image.tmdb.org/t/p/w342/${serie.image}`} alt="Serie Poster" className="img-fluid links" />
                                    </Link>
                                ) : (
                                    <>
                                        <h3 className='mb-4 links'>{serie.title} ({serie.releaseDate})</h3>
                                        <img src={`https://image.tmdb.org/t/p/w342/${serie.image}`} alt="Serie Poster" className="img-fluid links" />
                                    </>
                                )
                            }
                            <h5 className="mt-4">Puntaje: {serie.vote}</h5>
                            <p className="mt-4">{serie.description}</p>
                            {loggedIn && (
                                <>
                                    <form onSubmit={addFavourite}>
                                        <button className="buttons" type="submit">Add to Favourite</button>
                                    </form>
                                    {!reqLoading && error &&
                                        <div className="d-flex mt-2 align-items-center justify-content-center alert alert-warning alert-dismissible fade show" role="alert">
                                            {error}
                                            <button type="button" onClick={deleteErrorMessage} className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                        </div>
                                    }
                                    {success === true ? (
                                        <div id="liveAlertPlaceholder">
                                            <div className="d-flex mt-2 align-items-center justify-content-center alert alert-success alert-dismissible fade show" role="alert">
                                                Agegada a Favoritos con éxito
                                                <button type="button" className="btn-close" data-bs-dismiss="alert" ></button>
                                            </div>
                                        </div>
                                    ) : success === false ? (
                                        <div id="liveAlertPlaceholder">
                                            <div className="d-flex mt-2 align-items-center justify-content-center alert alert-danger alert-dismissible fade show" role="alert">
                                                Ya tenés esta serie en Favoritos
                                                <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
                                            </div>
                                        </div>
                                    ) : null}
                                    {reqLoading ? (
                                        <div className="d-flex mt-2 align-items-center justify-content-center alert alert-primary alert-dismissible fade show" role="alert">
                                            <PulseLoader className="spinner-container" size={15} color="#ffffff" />
                                        </div>
                                    ) : (
                                        <></>
                                    )
                                    }
                                </>
                            )
                            }
                            <h5 className="mt-4">Temporadas</h5>
                            <div className="seasons">
                                {serie.seasons.map(number => (
                                    <Link className="links" to={`/season/${serie.id}/${number}`} key={number}>
                                        <p>Temporada {number}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )
                }
            </div>
            <SerieRecommendation userInfo={userInfo} />
        </React.Fragment>
    );
}

export default SerieInfo;
