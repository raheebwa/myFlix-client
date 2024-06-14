import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { UpdateUser } from './update-user';
import PropTypes from "prop-types";
import { UserInfo } from './user-info';
import { FavouriteMovies } from './favourite-movies';

export const ProfileView = ({ localUser, movies, token }) => {
  const [user, setUser] = useState(localUser);
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    password: user.password,
    birthDate: user.birthDate,
  });
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const navigate = useNavigate();

  const handleUpdate = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetch(`https://testingmovieapi-l6tp.onrender.com/users/${user.username}`, {
      method: 'PUT',
      body: JSON.stringify(formData),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Update failed');
      })
      .then((updatedUser) => {
        alert('Update successful');
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      })
      .catch((error) => {
        alert(error.message);
        console.error(error);
      });
  };

  const handleDeleteAccount = () => {
    fetch(`https://testingmovieapi-l6tp.onrender.com/users/${user.username}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.ok) {
          alert('Account deleted successfully.');
          localStorage.clear();
          navigate('/');
        } else {
          alert('Something went wrong.');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const addFavorite = (movieTitle) => {
    fetch(`https://testingmovieapi-l6tp.onrender.com/users/${user.username}/movies/${encodeURIComponent(movieTitle)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to add movie to favorites.');
      }
      return response.json();
    })
    .then((updatedUser) => {
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      navigate('/profile');
    })
    .catch((error) => {
      console.error(error);
      alert('Failed to add favorite.');
    });
  };

  const removeFavorite = (movieTitle) => {
    fetch(`https://testingmovieapi-l6tp.onrender.com/users/${user.username}/movies/${encodeURIComponent(movieTitle)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to remove movie from favorites.');
      }
      return response.json();
    })
    .then((updatedUser) => {
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      const updatedFavoriteMovies = movies.filter((m) => updatedUser.favoriteMovies.includes(m.title));
      setFavoriteMovies(updatedFavoriteMovies);
      navigate('/profile');
    })
    .catch((error) => {
      console.error(error);
      alert('Failed to remove favorite.');
    });
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    fetch('https://testingmovieapi-l6tp.onrender.com/users', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        const currentUser = data.find((u) => u.username === localUser.username);
        setUser(currentUser);
        const favMovies = movies.filter((m) => currentUser.favoriteMovies.includes(m.title));
        setFavoriteMovies(favMovies);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [token, localUser.username, movies]);

  return (
    <Container className="mx-1">
      <Row>
        <Card className="mb-5">
          <Card.Body>
            <Card.Title>My Profile</Card.Title>
            <Card.Text>
              {user && <UserInfo name={user.username} email={user.email} />}
            </Card.Text>
          </Card.Body>
        </Card>
        <Card className="mb-5">
          <Card.Body>
            <UpdateUser
              formData={formData}
              handleUpdate={handleUpdate}
              handleSubmit={handleSubmit}
              handleDeleteAccount={handleDeleteAccount}
            />
          </Card.Body>
        </Card>
      </Row>
      <Row>
        <Col className="mb-5" xs={12} md={12}>
          {favoriteMovies && (
            <FavouriteMovies
              user={user}
              favoriteMovies={favoriteMovies}
              onFavoriteChange={removeFavorite}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
};

ProfileView.propTypes = {
  localUser: PropTypes.object.isRequired,
  movies: PropTypes.array.isRequired,
  token: PropTypes.string.isRequired,
};
