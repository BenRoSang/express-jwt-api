const { CheckDuplicateEmailOrUsername, CheckRoleExist} = require('../middlewares/verifySignup')
const {signin, signup, refreshToken} = require('../controllers/auth.controller')
module.exports = (app) => {
    app.use((req, res, next) => {
        res.header(
            "Access-control-Allow-Headers",
            "access-token, Origin, Content-type, Accept"
        )
        next()
    })

    app.post('/api/auth/signup', [CheckDuplicateEmailOrUsername, CheckRoleExist], signup)

    app.post('/api/auth/signin', signin)
    app.get('/api/auth/refresh', refreshToken)
}