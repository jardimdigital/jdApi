const jwt = require('jsonwebtoken');
const configEnv = require('config');
const config = require(__dirname + '/../lib/config');

// npm i axios
// promise based HTTP client for the browser and node.js
const axios = require('axios');

var _tokens = {};

_tokens.createToken = async function (req, res, connection) {

    if (!connection) { 
        res.writeHead(500);
        res.end(JSON.stringify({ message: "Alert! Database connection attempt failed before while creating a token" }));
    }

    // req.body.lifetime or 30 minutes
    const lifeTime = (req.body.lifetime && ! isNaN(parseInt(req.body.lifetime)) ) ? parseInt(req.body.lifetime) : 1000 * 60 * 60 * 24 * 7;

    console.log(isNaN(parseInt(req.body.lifetime)));

    const createdAt = new Date().getTime();
    const expiresAt = createdAt + lifeTime;

    const token = jwt.sign({"idCliente"     : req.body.cliente,
                            "idUsuario"     : req.body.idUsuario,
                            "nomeUsuario"   : req.body.nomeUsuario,
                            "login"         : req.body.login,
                            "email"         : req.body.email,
                            "createdAt"     : createdAt,
                            "expiresAt"     : expiresAt },  
                            configEnv.get('jwtPrivateKey'), 
                            { expiresIn: config.tokenLifeTime});


    let createdAtDateTime = new Date(createdAt);
    let expiresAtDateTime = new Date(expiresAt);

    let createdAtLong       = createdAtDateTime.getFullYear() + '/' + createdAtDateTime.getMonth() + '/' + createdAtDateTime.getDate() + ' ' + createdAtDateTime.toLocaleTimeString('en-US');
    let expiresAtDateLong   = expiresAtDateTime.getFullYear() + '/' + expiresAtDateTime.getMonth() + '/' + expiresAtDateTime.getDate() + ' ' + expiresAtDateTime.toLocaleTimeString('en-US');

    let payload = { idCliente:  req.body.cliente,
                    idUsuario:  req.body.idUsuario,
                    criadoEm:   createdAtLong,
                    expiraEm:   expiresAtDateLong,
                    token:      token };        

    const postQuery = "CALL tokensPost(:idCliente, :idUsuario, :criadoEm, :expiraEm, :token);"; 


    // tokensPost(:client, :user, :moment, :token) will verify existence of user and return token only if user is valid
    // it will also return data necessary to call callback endpoint and send token to client api
    connection.query(postQuery, payload, async function (error, results, fields) {

        if (error) {
            errorObject = { error: "An unexpected error occured while posting tokens/createTokens ",
                            code: error.code,
                            sqlErrno: error.errno,
                            sqlState: error.sqlState,
                            sqlMessage: error.sqlMessage };

            res.status(500).json(errorObject);

        } else {

            console.log(results[0])

            if (results[0][0].posted === 1) {

                const posted        = results[0][0].posted;
                const token         = results[0][0].token;
                const nomeUsuario   = results[0][0].nomeUsuario;
                const email         = results[0][0].email;
                const usuario       = results[0][0].usuario;
      
                res.status(200).json({
                    code: 200,
                    status:         'token was created successfuly! ',
                    posted:         posted,
                    nomeUsuario:    nomeUsuario,
                    email:          email,
                    usuario:        usuario,
                    token:          token,
                    expiraEm:       expiresAtDateLong,
                    expiresAt:      expiresAt
                });

                
            } else {
                res.status(200).json({
                    code:    400,
                    status:  'token was not created!',
                    payload: payload
                });
            }
            
            res.end();
        }
    });

}   


module.exports = _tokens;