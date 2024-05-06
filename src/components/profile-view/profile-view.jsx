import React, { useEffect, useState } from "react";
import { Card, Container, Row, Col } from 'react-bootstrap';
import { UserInfo } from './user-info';
import { FavouriteMovies } from './favourite-movies';
import { UpdateUser } from "./update-user";

export const ProfileView = ({ localUser, movies, token }) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    const [username, setUsername] = useState(storedUser.username);
    const [email, setEmail] = useState(storedUser.email);
    const [password, setPassword] = useState(storedUser.password);
    const [birthDate, setBirthdate] = useState(storedUser.birthDate);
    const [user, setUser] = useState();
    const favoriteMovies = user === undefined ? [] : movies.filter(m => user.favoriteMovies.includes(m.title));

    const formData = {
        username: username,
        email: email,
        birthDate: birthDate,
        password: password
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        fetch(`https://testingmovieapi-l6tp.onrender.com/users/${user.username}`, {
            method: "PUT",
            body: JSON.stringify(formData),
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        })
        .then((response) => {
            if (response.ok) {
                alert("Update successful");
                window.location.reload();
                return response.json();
            }
            alert("Update failed");
        })
        .then((user) => {
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
                setUser(user);
            }    
        })
        .catch((error) => {
            console.error(error);
        });
    };

    const handleUpdate = (e) => {
        const { type, value } = e.target;
        switch(type) {
            case "text":
                setUsername(value);
                break;
            case "email":
                setEmail(value);
                break;
            case "password":
                setPassword(value);
                break;
            case "date":
                setBirthdate(value);
                break;
            default:
                break;
        }
    }

    const handleDeleteAccount = () => {
        fetch(`https://testingmovieapi-l6tp.onrender.com/users/${storedUser.username}`, {
            method: "DELETE",
            headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        .then((response) => {
            if (response.ok) {
                alert("Account deleted successfully.");
                localStorage.clear();
                window.location.reload();
            } else {
                alert("Something went wrong.");
            }
        });
    };

    useEffect(() => {
        if (!token) {
            return;
        }

        fetch("https://testingmovieapi-l6tp.onrender.com/users", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then((response) => response.json())
        .then((data) => {
            console.log("Users data: ", data);
            const usersFromApi = data.map((resultUser) => {
                return {
                    id: resultUser._id,
                    username: resultUser.username,
                    password: resultUser.password,
                    email: resultUser.email,
                    birthDate: resultUser.birthDate,
                    favoriteMovies: resultUser.favoriteMovies
                };
            });
            setUser(usersFromApi.find((u) => u.username === localUser.username));
        })
        .catch((error) => {
            console.error(error);
        });
    }, [token, localUser.username]);

    return (
        <Container className="mx-1">
            <Row>
                <Card className="mb-5">
                    <Card.Body>
                        <Card.Title>My Profile</Card.Title>
                        <Card.Text>
                            {
                                user && (<UserInfo name={user.username} email={user.email} />)
                            }
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
                    {
                        favoriteMovies && (<FavouriteMovies user={user} favoriteMovies={favoriteMovies} />)
                    }
                </Col>
            </Row>
        </Container>
    );
};
