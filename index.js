const express = require('express');
const cors = require('cors')
const cookieParser = require('cookie-parser');
const db = require('./models')

const app = express();

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
//for cookie middleware
app.use(cookieParser());

db.sequelize.sync({force: true}).then(() => {
    console.log('Databse Start')
    RoleInsert()
})

require('./routes/auth.route')(app)
require('./routes/user.route')(app)

app.get('/', (req, res) => {
    res.send('Hello ')
})

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`App is Listening in PORT ${PORT}`)
})

const RoleInsert = () => {
    db.role.create({
        id: 1,
        name: 'user'
    })
    db.role.create({
        id: 2,
        name: 'moderator'
    })
    db.role.create({
        id: 3,
        name: 'admin'
    })
}