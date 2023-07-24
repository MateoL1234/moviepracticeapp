const jwt = require("jsonwebtoken")

function checkSession(req, res, next) {
    const { token } = req.cookies
    if (!token) {
        return res.json({
            error: "No hay token"
        });
    }
    jwt.verify(token, "secretToken", (error, user) => {
        if (error) { return res.json({ error: "Token inválido" }) }
        req.user = user
        next()
    })
}

module.exports = checkSession;
