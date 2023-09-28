const { verifyToken, isAdmin, isModerator, isAdminOrModerator} = require('../middlewares/authJwt')
const {allAccess, userBoard, adminBoard, moderatorBoard} = require('../controllers/user.controller')
module.exports = (app) => {
    app.use((req, res, next) => {
        res.header(
            "Access-control-Allow-Headers",
            "access-token, Origin, Content-type, Accept"
        )
        next()
    })

    app.get('/api/test/all', allAccess)
    app.get('/api/test/user', [verifyToken], userBoard)
    app.get('/api/test/admin', [verifyToken, isAdmin],adminBoard)

    app.get('/api/test/mod', [verifyToken, isModerator], moderatorBoard)
}