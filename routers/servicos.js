/*
 *
 * 
  
Created by Edson Andrade
Creation Date: 05/09/2022
 *
 */


const Joi = require('joi');

const validationSchema = Joi.object({
      idServico:      Joi.number(),
      nome:           Joi.string().max(45).required(),
      descricao:      Joi.string().max(512).allow(null, ''),
      ativo:          Joi.string().max(01).required(),
      valorPadrao:    Joi.number().allow(0, null),
      unidadeMedida:  Joi.string().max(8).allow('', null)
}); 

get = async function(req, res, callback) {
  const paramsObject  =  { nomeServico: req.params.nomeServico };
  const sqlQuery = "CALL lerServicos(:nomeServico)";
  callback(sqlQuery, paramsObject);
}

post = async function (req, res, callback) {

  const paramsObject = req.body;

  const sqlQuery = "CALL servicosCriar(:nome, :descricao, :valorPadrao, :unidadeMedida, :ativo);";
  callback(sqlQuery, paramsObject);

}

postRecursosServicos = async function (req, res, callback) {
  const paramsObject = req.body;
  const sqlQuery = "CALL recursosServicoCriar(:servico, :recursos);"
  callback(sqlQuery, paramsObject);
}


put = async function (req, res, callback) {

  const paramsObject = req.body;

  const sqlQuery = "CALL servicosAtualizar(:idServico, :nome, :descricao, :valorPadrao, :unidadeMedida, :ativo);";
  callback(sqlQuery, paramsObject);

}

del = async function (req, res, callback) {

  const paramsObject = { idServico: req.params.idServico }
  const sqlQuery = "CALL servicosExcluir(:idServico)";
  callback(sqlQuery, paramsObject);
      
}

module.exports.get = get;  
module.exports.post = post;
module.exports.postRecursosServicos = postRecursosServicos;
module.exports.put = put;
module.exports.delete = del;
module.exports.validationSchema = validationSchema;