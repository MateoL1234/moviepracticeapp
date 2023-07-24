function sessionMiddleware(req, res, next) {
    if (req.session.user) {
        return res.json({
            sessionMsg: "La sesión ya existe"
        })
    }
    next()
}

module.exports = sessionMiddleware
