const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    // console.log(authHeader);
    if (!authHeader) {
        const error = new Error('No autenticado.');
        error.statusCode = 401;
        throw error;
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'Aquievaelpasswordmuymuymuymuysecreto');
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }
    if (!decodedToken) {
        const error = new Error('No autenticado.');
        error.statusCode = 401;
        throw error;
    }
    console.log('Felicidades lograste validar tu token')
    req.idUsuario = decodedToken.idUsuario;
    next();
};