const db = require('../models')
const User = db.user
const Role = db.ROLE
const CheckDuplicateEmailOrUsername = (req, res, next) => {
    User.findOne({
        where: {
            username: req.body.username
        }
    }).then(user => {
        if(user) {
            res.status(400).send({
                message: 'User name already exist'
            })
            return
        }

        User.findOne({
            where: {
                email: req.body.email
            }
        }).then(user => {
            if(user) {
                res.status(400).send({
                    message: 'Email already exist'
                })
                return
            }
        })
        next()
    })
}

const CheckRoleExist = (req, res, next) => {
    if(req.body.roles) {
        for (let i = 0; i < req.body.roles.length; i++) {
            if(!Role.includes(req.body.roles[i])) {
                res.status(400).send({ message: `Role does not exist ${req.body.roles[i]}`})
            }
        }
    }
    next()
}

module.exports = {
    CheckDuplicateEmailOrUsername, CheckRoleExist
}