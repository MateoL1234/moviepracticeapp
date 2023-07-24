const db = require("../database/models");
const bcryptjs = require("bcryptjs");
const { validationResult } = require('express-validator');
const jwt = require("jsonwebtoken")
require("dotenv").config();

const controller = {
    register: async (req, res) => {
        try {
            const resultValidation = validationResult(req);

            if (resultValidation.errors.length > 0) {
                return res.json({ errors: resultValidation.mapped() });
            }

            const userInDB = await db.User.findOne({
                where: {
                    email: req.body.email
                }
            });

            if (userInDB) {
                return res.json({
                    errors: {
                        email: {
                            msg: 'Este email ya está registrado'
                        }
                    }
                });
            }
            let userToCreate = {
                name: req.body.name,
                email: req.body.email,
                country: req.body.country,
                language: req.body.language,
                password: bcryptjs.hashSync(req.body.password, 10),
            }

            const createdUser = await db.User.create(userToCreate);

            const token = await new Promise((resolve, reject) => {
                jwt.sign({ id: createdUser.id }, 'secretToken', {}, (error, token) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(token);
                    }
                });
            });
            res.cookie('token', token, {
                sameSite: 'none',
                secure: true,
            });
            return res.status(200).json({ success: true, ok: 'Creado con éxito' })

        } catch (error) {
            console.error(error);
            return res.json({ success: false, error: 'Error en el servidor' });
        }
    },
    login: async (req, res) => {
        try {
            const resultValidation = validationResult(req);
            if (resultValidation.errors.length > 0) {
                return res.json(
                    { errors: resultValidation.mapped() }
                );
            }
            const user = await db.User.findOne({
                where: {
                    email: req.body.email
                }
            });
            if (!user) {
                return res.json({ errors: { unauthorize: { msg: 'Usuario y/o contraseña invalidos' } } });
            }
            if (!bcryptjs.compareSync(req.body.password, user.password)) {
                return res.json({ errors: { unauthorize: { msg: 'Usuario y/o contraseña invalidos' } } });
            }
            const token = await new Promise((resolve, reject) => {
                jwt.sign({ id: user.id }, 'secretToken', {}, (error, token) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(token);
                    }
                });
            });
            res.cookie('token', token, {
                sameSite: 'none',
                secure: true,
            });
            return res.json({
                success: true,
                message: 'Inicio de sesión exitoso',
                user: {
                    email: user.email,
                    name: user.name
                }
            });
        } catch (error) {
            console.error(error);
            return res.json({ success: false, error: 'Error en el servidor' });
        }
    },
    user: async (req, res) => {
        try {
            const user = await db.User.findByPk(req.user.id);
            if (user) {
                return res.status(200).json({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    country: user.country,
                    language: user.language
                });
            } else {
                return res.json({ error: 'No se encontró un usuario válido' });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: "Error en el servidor"
            });
        }
    },
    logout: (req, res) => {
        res.cookie("token", "", {
            expires: new Date(0),
            sameSite: 'none',
            secure: true,
        });
        return res.json({ ok: "Cerrado con éxito" });
    },
    addProfile: async (req, res) => {
        const userId = req.user.id;
        try {
            const resultValidation = validationResult(req);
            if (resultValidation.errors.length > 0) {
                return res.json(
                    { errors: resultValidation.mapped(), }
                );
            } else {
                let newProfile = {
                    name: req.body.name,
                    users_id: userId,
                    image: req.body && req.body.image ? req.body.image : 'https://i.imgur.com/dxKHVRU.jpg',
                };
                await db.Profile.create(newProfile);
                res.json({
                    addedSuccess: "Perfil agregado correctamente"
                });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: "Error en el servidor"
            });
        }
    },
    lookForProfiles: async (req, res) => {
        const userId = req.user.id;
        try {
            const profiles = await db.Profile.findAll({
                where: {
                    users_id: userId
                }
            });
            return res.status(200).json(profiles)
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: "Error en el servidor"
            });
        }
    },
    lookForOneProfile: async (req, res) => {
        const userId = req.user.id;
        const id = req.params.id;
        try {
            const profile = await db.Profile.findOne({
                where: {
                    id: id,
                    users_id: userId
                }
            });
            if (!profile) {
                res.status(404).json({
                    error: 'Perfil no encontrado'
                });
            } else {
                res.json(profile);
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: "Error en el servidor"
            });
        }
    },
    deleteProfile: async (req, res) => {
        const userId = req.user.id;
        const { id } = req.body
        try {
            await db.Favourites.destroy({
                where: {
                    users_id: userId,
                    profile_id: id
                }
            });
            const profileToDelete = await db.Profile.destroy({
                where: {
                    id: id,
                    users_id: userId
                }
            });
            if (profileToDelete)
                return res.json({
                    deleteSuccess: "Borrada"
                });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: "Error en el servidor"
            });
        }
    },
    addMovie: async (req, res) => {
        const userId = req.user.id;
        const movieId = req.body.movieId || req.body.serieId
        const profileId = req.body.profileId
        let type;
        if (req.body.movieId) {
            type = "movie"
        }
        else {
            type = "tv"
        }
        try {
            const movieAdded = await db.Favourites.findOne({
                where: {
                    movie_id: movieId,
                    users_id: userId,
                    profile_id: profileId,
                }
            });

            if (movieAdded) {
                return res.json({
                    errorAdding: "Ya está en la db"
                });
            } else {
                let newMovieFav = {
                    users_id: userId,
                    movie_id: movieId,
                    profile_id: profileId,
                    type: type
                };
                await db.Favourites.create(newMovieFav);
            }
            res.json({
                addedSuccess: "Agregado"
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                serverError: "Error en el servidor"
            });
        }
    },
    lookForMovie: async (req, res) => {
        const userId = req.user.id;
        const profileId = req.query.profileId;
        console.log(profileId);
        try {
            const movies = await db.Favourites.findAll({
                where: {
                    users_id: userId,
                    profile_id: profileId,
                },
            });
            return res.json(movies);
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: 'Error en el servidor',
            });
        }
    },
    deleteMovie: async (req, res) => {
        const userId = req.user.id;
        const movieId = req.body.movieId;
        const movieType = req.body.movieType;
        const profileId = req.body.profileId;

        try {
            const movieToDelete = await db.Favourites.destroy({
                where: {
                    movie_id: movieId,
                    users_id: userId,
                    profile_id: profileId,
                    type: movieType
                }
            });
            if (movieToDelete) {
                return res.json({
                    deleteSuccess: "Borrada"
                });
            } else {
                return res.status(500).json({
                    error: "Error en el servidor"
                });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: "Error en el servidor"
            });
        }
    },

    editProfile: async (req, res) => {
        const userId = req.user.id;
        try {
            const resultValidation = validationResult(req);
            if (resultValidation.errors.length > 0) {
                return res.json(
                    { errors: resultValidation.mapped(), }
                );
            }
            const profileId = await db.Profile.findByPk(req.params.id)
            if (!profileId) {
                return res.json(
                    { errors: { server: { msg: 'Error en el servidor' } } }
                );
            }
            else {
                let editedProfile = {
                    name: req.body.editedName,
                    users_id: userId,
                    image: req.body && req.body.image ? req.body.image : 'https://i.imgur.com/dxKHVRU.jpg',
                };
                await db.Profile.update(editedProfile, { where: { id: req.params.id } });
                res.json({
                    addedSuccess: "Perfil editado correctamente"
                });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: "Error en el servidor"
            });
        }
    },
};

module.exports = controller;
