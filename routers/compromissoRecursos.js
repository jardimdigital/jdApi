
/*
 *
 * 
  
Created by Edson Andrade
Creation Date: 05/09/2022
 *
 */


const Joi = require('joi');

const validationSchema = Joi.object({
      idCompromissoRecurso:  Joi.number().required(),
      compromisso:          Joi.number().required(),
      recurso:              Joi.number().required(),
      quantidade:           Joi.number().required(),
      observacoes:          Joi.string().allow(null)
}); 

get = async function(req, res, callback) {
  const paramsObject  =  { idCompromisso: req.params.idCompromisso };
  const sqlQuery = "CALL lerCompromissoRecursos(:idCompromisso, null)";
  callback(sqlQuery, paramsObject);
}

post = async function (req, res, callback) {

  const paramsObject = req.body;

  const sqlQuery = "CALL compromissoRecursosCriar(:compromisso, :recurso, :quantidade, :observacoes);";
  callback(sqlQuery, paramsObject);

}

put = async function (req, res, callback) {

  const paramsObject = req.body;

  const sqlQuery = "CALL compromissoRecursosAtualizar(:idCompromissoRecurso, :compromisso, :recurso, :quantidade, :observacoes);";
  callback(sqlQuery, paramsObject);

}

del = async function (req, res, callback) {

  const paramsObject = { idCompromissoRecurso: req.params.idCompromissoRecurso }
  const sqlQuery = "CALL CompromissoRecursosExcluir(:idCompromissoRecurso)";
  callback(sqlQuery, paramsObject);
      
}

module.exports.get = get;  
module.exports.post = post;
module.exports.put = put;
module.exports.delete = del;
module.exports.validationSchema = validationSchema;
