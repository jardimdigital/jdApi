/*
 *
 * 
  
Created by Edson Andrade
Creation Date: 10/09/2022
 *
 */


const Joi = require('joi');

const validationSchema = Joi.object({
      idRecurso:      Joi.number(),
      nome:           Joi.string().max(45).required(),
      descricao:      Joi.string().max(512).allow(null, ''),
      tipo:           Joi.string().max(01).required(),
      ativo:          Joi.string().max(01).required()
}); 

get = async function(req, res, callback) {
  const paramsObject  =  { nomeRecurso: req.params.nomeRecurso };
  const sqlQuery = "CALL lerRecursos(:nomeRecurso)";
  callback(sqlQuery, paramsObject);
}

post = async function (req, res, callback) {

  const paramsObject = req.body;

  const sqlQuery = "CALL recursosCriar(:nome, :descricao, :tipo, :ativo);";
  callback(sqlQuery, paramsObject);

}

put = async function (req, res, callback) {

  const paramsObject = req.body;

  const sqlQuery = "CALL recursosAtualizar(:idRecurso, :nome, :descricao, :tipo, :ativo);";
  callback(sqlQuery, paramsObject);

}

del = async function (req, res, callback) {

  const paramsObject = { idRecurso: req.params.idRecurso }
  const sqlQuery = "CALL recursosExcluir(:idRecurso)";
  callback(sqlQuery, paramsObject);
      
}

module.exports.get = get;  
module.exports.post = post;
module.exports.put = put;
module.exports.delete = del;
module.exports.validationSchema = validationSchema;