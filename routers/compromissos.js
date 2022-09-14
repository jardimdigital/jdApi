
/*
 *
 * 
  
Created by Edson Andrade
Creation Date: 05/09/2022
 *
 */


const Joi = require('joi');

const validationSchema = Joi.object({
      idCompromisso: Joi.number(),
      cliente:       Joi.number(),
      endereco:      Joi.number(),
      data:          Joi.string(),
      periodo:       Joi.string().max(1).required(),
      veiculo:       Joi.number().allow(null),
      descricao:     Joi.string().max(512).allow(null),
      orcamento:     Joi.number().allow(null),
      status:        Joi.number().allow(null)
}); 

get = async function(req, res, callback) {
  const paramsObject  =  { idCliente: req.params.idCliente };
  const sqlQuery = "CALL lerCompromissos(:idCliente)";
  callback(sqlQuery, paramsObject);
}

post = async function (req, res, callback) {

  const paramsObject = req.body;

  const sqlQuery = "CALL compromissosCriar(:cliente, :endereco, :data, :periodo, :veiculo, :descricao, :orcamento, :status);";
  callback(sqlQuery, paramsObject);

}

put = async function (req, res, callback) {

  const paramsObject = req.body;

  const sqlQuery = "CALL compromissosAtualizar(:idCmpromisso, :cliente, :endereco, :data, :periodo, :veiculo, :descricao, :orcamento, :status);";
  callback(sqlQuery, paramsObject);

}

del = async function (req, res, callback) {

  const paramsObject = { idContato: req.params.idContato }
  const sqlQuery = "CALL compromissosExcluir(:idCompromisso)";
  callback(sqlQuery, paramsObject);
      
}

module.exports.get = get;  
module.exports.post = post;
module.exports.put = put;
module.exports.delete = del;
module.exports.validationSchema = validationSchema;