const authConfig = require('../config/auth.config')
const { v4: uuid} = require('uuid')
const jwt = require('jsonwebtoken')

module.exports = (sequelize, Sequelize) => {
    const RefreshToken = sequelize.define('refreshToken', {
        token: {
            type: Sequelize.STRING
        },
        expiryDate: {
            type: Sequelize.DATE
        }
    })

    RefreshToken.createToken = async(user) => {
        let expireAt = new Date();
        expireAt.setSeconds(expireAt.getSeconds() + authConfig.jwtRefreshExpiration)

        // const _token = uuid();
        const _token = jwt.sign({id: user.id}, authConfig.refreshSecret, {
            expiresIn: authConfig.jwtRefreshExpiration,
            algorithm: 'HS256',
            allowInsecureKeySizes: true
        })
        let refreshToken = await RefreshToken.create({
            token: _token,
            userId: user.id,
            expiryDate: expireAt.getTime()
        })

        return refreshToken.token;
    }

    RefreshToken.verifyExpiration = (token) => {
        return token.expiryDate.getTime() < new Date().getTime();
    }

    return RefreshToken
}