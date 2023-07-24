const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const usersController = require("./apis/controller");
const checkSession = require("./middlewares/checkSession");

const validationsUserRegister = [
    body('name')
        .notEmpty().withMessage('Debe poner un nombre').bail()
        .isLength({ min: 2 }).withMessage('El nombre debe contener al menos 2 caracteres'),
    body('email')
        .notEmpty().withMessage('Debe ingresar un email').bail()
        .isEmail().withMessage('Debe ingresar un email válido'),
    body('password')
        .notEmpty().withMessage('Debe ingresar una contraseña').bail()
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?]).{8,}$/)
        .withMessage('La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial y tener al menos 8 caracteres'),
    body("confirmPassword")
        .notEmpty().withMessage('Tienes que volver a escribir tu contraseña').bail()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Las contraseñas no coinciden');
            } else {
                return value;
            }
        }).withMessage('Las contraseñas no coinciden'),
];

const validationsUserLogin = [
    body('email')
        .notEmpty().withMessage('Debe ingresar un email').bail()
        .isEmail().withMessage('Debe ingresar un email válido'),
    body('password')
        .notEmpty().withMessage('Debe ingresar una contraseña').bail()
];

const profileValidation = [
    body('name')
        .notEmpty().withMessage('Debe poner un nombre').bail()
        .isLength({ min: 2 }).withMessage('El nombre debe contener al menos 2 caracteres'),
];

const editValidation = [
    body('editedName')
        .notEmpty().withMessage('Debe poner un nombre').bail()
        .isLength({ min: 2 }).withMessage('El nombre debe contener al menos 2 caracteres'),
];



router.get('/user', checkSession, usersController.user);
router.get('/logout', checkSession, usersController.logout);
router.get('/favouriteMovies', checkSession, usersController.lookForMovie);
router.get('/profiles', checkSession, usersController.lookForProfiles);
router.get('/profile/:id', checkSession, usersController.lookForOneProfile);
router.post('/addProfile/:id', checkSession, profileValidation, usersController.addProfile);
router.post('/editProfile/:id', checkSession, editValidation, usersController.editProfile);
router.post('/deleteProfile/:id', checkSession, usersController.deleteProfile);
router.post('/favourite/:id', checkSession, usersController.addMovie);
router.post('/favouriteDestroy/:id', checkSession, usersController.deleteMovie);
router.post('/register', validationsUserRegister, usersController.register);
router.post('/login', validationsUserLogin, usersController.login);


module.exports = router;
