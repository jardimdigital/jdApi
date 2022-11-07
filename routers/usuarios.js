/*
 *
 * 
  
  Created by Edson Andrade
  Creation Date: 02/11/2022

 *
 */


const Joi = require('joi');

const validationSchema = Joi.object({
      idUsuario:          Joi.number(),
      grupoAcesso:        Joi.number(),
      nomeUsuario:        Joi.string().max(45).required(),
      login:              Joi.string().max(30).required(),
      ativo:              Joi.string().max(01).required(),
      email:              Joi.string().max(45),
      emailAlternativo:   Joi.string().max(45).allow(null, ''),
      telefone1:          Joi.string().max(20).allow(null, ''),
      telefone2:          Joi.string().max(20).allow(null, '')
    }); 

get = async function(req, res, callback) {
  const paramsObject  =  { nomeUsuario: req.params.nomeUsuario };
  const sqlQuery = "CALL lerUsuarios(:nomeUsuario)";
  callback(sqlQuery, paramsObject);
}

post = async function (req, res, callback) {

  const paramsObject = req.body;

  const sqlQuery = "CALL usuarioCriar(:grupoAcesso, :nomeUsuario, :login, :ativo, :email, :emailAlternativo, :telefone1, :telefone2);";
  callback(sqlQuery, paramsObject);

}

put = async function (req, res, callback) {

  const paramsObject = req.body;

  const sqlQuery = "CALL usuarioAtualizar(:idUsuario, :grupoAcesso, :nomeUsuario, :login, :ativo, :email, :emailAlternativo, :telefone1, :telefone2);";
  callback(sqlQuery, paramsObject);

}

del = async function (req, res, callback) {

  const paramsObject = { idUsuario: req.params.idUsuario }
  const sqlQuery = "CALL usuarioExcluir(:idUsuario)";
  callback(sqlQuery, paramsObject);
      
}

module.exports.get = get;  
module.exports.post = post;
module.exports.put = put;
module.exports.delete = del;
module.exports.validationSchema = validationSchema;