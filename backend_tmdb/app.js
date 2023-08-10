const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');

const port = process.env.PORT || 3032
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
const origin = ['https://mlmovieapp.netlify.app', "http://localhost:7000", "https://postman.com"]
app.use(cors({ origin: origin, credentials: true }));

const userApiRoutes = require('./router');
app.use('/api', userApiRoutes);

app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
});
