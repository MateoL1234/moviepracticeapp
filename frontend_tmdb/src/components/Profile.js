import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/bootstrap.min.css';
import Favourites from './Favourites';
import { PulseLoader } from "react-spinners";

function Profile({ userInfo }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [editedName, setEditedName] = useState('');
  const [userData, setUserData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const URL = process.env.REACT_APP_SERVER


  useEffect(() => {

    const fetchUserData = async () => {
      try {
        const response = await fetch(`${URL}/api/user`, {
          credentials: 'include'
        });
        const data = await response.json();

        if (data.error) {
          navigate('/', { replace: true });
        } else {
          setEmail(data.email);
          setName(data.name);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const storage = JSON.parse(sessionStorage?.getItem('selectedProfile'));
        setLoading(true);
        const response = await fetch(`${URL}/api/profile/${storage?.id}`, {
          credentials: 'include'
        });
        const data = await response.json();
        if (data.error) {
          navigate('/');
          sessionStorage?.removeItem('selectedProfile')
        }
        else {
          setUserData(data);
          setEditedName(data?.name);
          setImage(data?.image);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);


  const editProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${URL}/api/editProfile/${userData?.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ editedName, image }),
        credentials: 'include'
      });
      const data = await response.json();
      if (data.errors) {
        setErrors(data.errors);
      } else {
        navigate('/', { replace: true });
      }
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleName = (e) => {
    setEditedName(e.target.value);
  };

  const handleImage = (e) => {
    setImage(e.target.value);
  };
  return (
    <React.Fragment>
      {!loading ? (
        <>
          <div className='container col-10'>
            <div className="row">
              <div className="col-12 w-300">
                <h3 className='mb-4'>Hola {name}</h3>
                <p>Email: {email}</p>
              </div>
            </div>
          </div>
          <div>
            <form onSubmit={editProfile} className="create-user-form">
              <div>
            {errors && errors.server && <p className="error-message">{errors.server.msg}</p>}
                <input
                  id="name"
                  name="editedName"
                  value={editedName}
                  onChange={handleName}
                />
                {errors && errors.editedName && <p className="error-message">{errors.editedName.msg}</p>}
              </div>
              <div>
                <input
                  id="image"
                  name="image"
                  value={image}
                  onChange={handleImage}
                />
              </div>
              <button className="buttons" type="submit">
                Editar Perfil
              </button>
            </form>
          </div>
          <Favourites userInfo={userInfo} />
        </>
      ) : (
        <div className='container col-10'>
          <PulseLoader className="spinner-container" size={15} color="#ffffff" />
        </div>
      )
      }
    </React.Fragment>
  );
}

export default Profile;
