const db = require('../models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authConfig = require('../config/auth.config')
const User = db.user
const Role = db.role
const Op = db.Sequelize.Op
exports.signup = (req, res) => {
    User.create({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8)
    }).then(user => {
        if(req.body.roles) {
            Role.findAll({
                where: {
                    name: {
                        [Op.or]: req.body.roles
                    }
                }
            }).then(roles => {
                user.setRoles(roles).then(() => {
                    res.status(200).send({ message: "Register Successful with Roles"})
                }).catch(err => {
                    console.log(err)
                })
            })
        }else{
            user.setRoles([2]).then(() => {
                res.status(200).send({ message: 'Register Successful'})
            })
        }
    }).catch(err => {
        res.status(500).send({ message: err.message })
    })
}

exports.signin = (req, res) => {
    User.findOne({
        where: {
            username: req.body.username
        }
    }).then(user => {
        if(!user) {
            res.status(404).send({ message: 'User not found'})
        }

        const isValidPassword = bcrypt.compareSync(req.body.password, user.password)
        if(!isValidPassword) {
            return res.status(401).send({
                accessToken: null,
                message: 'Invalid password'
            })
        }
        const token = jwt.sign({id: user.id}, authConfig.secret, {
            algorithm: 'HS256',
            allowInsecureKeySizes: true,
            expiresIn: 86400 //24 hours
        })
        var authorities = []
        user.getRoles().then(roles => {
            console.log(roles, 'in sign in')
            for (let i = 0; i < roles.length; i++) {
                console.log(roles[i].name)
                authorities.push(`ROLE_${roles[i].name.toUpperCase()}`)
            }
            res.status(200).send({
                id: user.id,
                username: user.username,
                email: user.email,
                token: token,
                roles: authorities
            })
        })

    }).catch(err => {
        res.status(500).send({ message: err.message })
    })
}