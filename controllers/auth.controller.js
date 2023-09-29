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
    }).then(async(user) => {
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
            expiresIn: '30s' //24 hours
        })

        const refreshToken = await db.refreshToken.createToken(user)
        var authorities = []
        user.getRoles().then(roles => {
            for (let i = 0; i < roles.length; i++) {
                console.log(roles[i].name)
                authorities.push(`ROLE_${roles[i].name.toUpperCase()}`)
            }

            res.cookie('refreshToken', refreshToken, {httpOnly: true, maxAge: authConfig.jwtRefreshExpiration})

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

exports.refreshToken = async (req, res) => {
    const cookies = req.cookies
    if(cookies?.refreshToken == null) {
        res.status(401).send({ message: 'Refresh token not provided'})
    }

    try {
        const refreshToken = await db.refreshToken.findOne({
            where: {
                token: cookies?.refreshToken
            }
        })

        if(!refreshToken) return res.status(403).send({message: 'Invalid Refresh Token'})

        if(db.refreshToken.verifyExpiration(refreshToken)) {
            db.refreshToken.destroy({ where: { id: refreshToken.id}})
            res.status(403).send({message: "Refresh token is expired, make a new sign in request"})
        }

        const user = await refreshToken.getUser();
        const newAccessToken = jwt.sign({id: user.id}, authConfig.secret, {
            expiresIn: '30s',
            algorithm: 'HS256',
            allowInsecureKeySizes: true
        })

        res.status(200).send({
            newToken: newAccessToken
        })

    } catch (error) {
        res.status(500).send({ message: error})
    }
}

exports.signout = async(req, res) => {
    const cookies = req.cookies;
    if(!cookies) {
        res.status(204).send({status: 1, message: 'Successful logout'})
    }
    try {
        //Find token in database
        const refreshToken = await db.refreshToken.findOne({
            where: {
                token: cookies.refreshToken
            }
        })

        if(!refreshToken) {
            res.clearCookie('refreshToken', {httpOnly: true, maxAge: authConfig.jwtRefreshExpiration})
            res.status(204).send({status: 1, message: 'Successful logout'})
        }
        //Delete refresh token in database
        const destoryCookie = await db.refreshToken.destroy({
            where: {
                id: refreshToken.id
            }
        })
        if(destoryCookie) {
            res.clearCookie('refreshToken', {httpOnly: true, maxAge: authConfig.jwtRefreshExpiration})
            res.status(200).send({status: 1, message: 'Successful logout'})
        }
    } catch (error) {
        res.status(500).send({status: 0, message: error})
    }
}