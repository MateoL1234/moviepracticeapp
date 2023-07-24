import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BsX } from 'react-icons/bs';

const SearchComponent = ({ userInfo }) => {
  const key = process.env.REACT_APP_API_KEY;
  const [search, setSearch] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [update, setUpdate] = useState(false);

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: key
    }
  };

  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/search/multi?query=${keyword}&include_adult=false&language=${userInfo.language}&page=1`, options)
      .then(response => response.json())
      .then(data => {
        if (data && data.results) {
          const filteredResults = data.results.filter(result => result.media_type === 'movie' || result.media_type === 'tv');
          setSearch(
            filteredResults.slice(0, 10).map(result => ({
              id: result.id,
              title: result.title || result.name || result.original_title || result.original_name,
              image: result.poster_path,
              media: result.media_type
            }))
          );
        } else {
          setSearch([]);
        }
      });
  }, [keyword]);

  const onChangeInput = e => {
    setKeyword(e.target.value);
  };

  const addStorage = (result) => {
    const storedSearch = JSON.parse(localStorage.getItem("search")) || [];
    const updatedSearch = [...storedSearch, result];
    if (!storedSearch.some(item => item.id === result.id)) {
      localStorage.setItem("search", JSON.stringify(updatedSearch))
    }
  };

  const deleteStorage = (result) => {
    const storedSearch = JSON.parse(localStorage.getItem("search")) || [];
    const newSearch = storedSearch.filter(item => item.id !== result.id);
    localStorage.setItem("search", JSON.stringify(newSearch));
    setUpdate(previousUpdate => !previousUpdate);
  };

  let storage = JSON.parse(localStorage.getItem("search"));

  return (
    <div>
      <form onSubmit={e => e.preventDefault()} className="d-flex searchForm" role="search">
        <input
          onChange={onChangeInput}
          className="form-control me-2"
          type="search"
          placeholder="Buscar"
          aria-label="Buscar"
          value={keyword}
        />
      </form>
      {storage && storage.length > 0 && (
        <React.Fragment>
          <h5 className="m-4">Tus últimas búsquedas</h5>
          <div className="lastSearchContainer flex-column m-4">
            {storage.map((result, index) => (
              <div className="d-flex mt-2 mb-2 w-100 justify-content-between align-items-center" key={index}>
                <Link className="links" to={`/${result.media}/${result.id}`}>
                  <p>{result.title}</p>
                </Link>
                <BsX onClick={() => deleteStorage(result)} className="close-icon ml-2" />
              </div>
            ))}
          </div>
        </React.Fragment>
      )}
      {
        search.length > 0 && (
          <React.Fragment>
            <h3 className='m-2'>Búsqueda:</h3>
            <div className='col-10 container pt-5 pb-5'>
              {search.map(result => (
                <Link
                  onClick={() => addStorage(result)}
                  key={result.id}
                  className="links"
                  to={`/${result.media}/${result.id}`}
                >
                  <div className="card" style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w780${result.image})` }}>
                    <div className="movie-info">
                      <h2>{result.title}</h2>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </React.Fragment>
        )
      }
    </div >
  );
};

export default SearchComponent;
