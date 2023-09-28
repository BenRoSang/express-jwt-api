
exports.allAccess = (req, res) => {
    res.send('Public Content')
}

exports.userBoard = (req, res) => {
    res.send('User Content')
}
exports.moderatorBoard = (req, res) => {
    res.send('Moderator Content')
}
exports.adminBoard = (req, res) => {
    res.send('Admin Content')
}