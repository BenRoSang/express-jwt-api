const jwt = require('jsonwebtoken')
const authConfig = require('../config/auth.config')
const db = require('../models')


const verifyToken = (req, res, next) => {
    const token = req.headers['access-token'];
    if(!token) {
        res.status(403).send({
            message: 'Token is not provided'
        })
        return
    }

    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if(err) {
            res.status(401).send({
                message: 'Unathorized'
            })
        }
        req.userId = decoded.id
        next()
    })
}

const isAdmin = (req, res, next) => {
    db.user.findByPk(req.userId).then(user => {
        user.getRoles().then(roles => {
            for (let i = 0; i < roles.length; i++) {
                if(roles[i].name === 'admin') {
                    next();
                    return 
                }
            }
            res.status(500).send({
                message: 'Admin Role required'
            })
            return
        })
    })
}

const isModerator = (req, res, next) => {
    db.user.findByPk(req.userId).then(user => {
        user.getRoles().then(roles => {
            for (let i = 0; i < roles.length; i++) {
                if(roles[i].name === 'moderator') {
                    next();
                    return
                }
            }
            res.status(500).send({
                message: 'Moderator Role required'
            })
            return
        })
    })
}

const isAdminOrModerator = (req, res, next) => {
    db.user.findByPk(req.userId).then(user => {
        user.getRoles().then(roles => {
            for (let i = 0; i < roles.length; i++) {
                if(roles[i].name === 'admin') {
                    next();
                    return
                }

                if(roles[i].name === 'moderator') {
                    next();
                    return
                }
            }
            res.status(500).send({
                message: 'Moderator or Admin Role required'
            })
            return
        })
    })
}

module.exports = {
    verifyToken,isAdmin,isModerator, isAdminOrModerator
}