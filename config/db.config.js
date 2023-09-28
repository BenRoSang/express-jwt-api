module.exports = {
    HOST: 'localhost',
    DB: 'testdb',
    USER: 'root',
    PASSWORD: 'asdfhjkl',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}