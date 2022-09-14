
/*
 *
 * 
  
Created by Edson Andrade
Creation Date: 05/09/2022
 *
 */


  const Joi = require('joi');

  const validationSchema = Joi.object({
        idProfissional:      Joi.number(),
        nome:                Joi.string().max(45).required(),
        tipo:                Joi.string().max(01).required(),
        ativo:               Joi.string().max(01).required(),
        habilitado:          Joi.string().max(01).required(),
        diasTrabalho:        Joi.string().max(20).allow('', null),
        servicos:            Joi.string().max(2048).allow('', null)
  }); 

  get = async function(req, res, callback) {
    const paramsObject  =  { idProfissional: req.params.idProfissional };
    const sqlQuery = "CALL lerProfissionais(:idProfissional)";
    callback(sqlQuery, paramsObject);
  }
  
  post = async function (req, res, callback) {
  
    const paramsObject = req.body;

    const sqlQuery = "CALL profissionaisCriar(:nome, :tipo, :ativo, :habilitado, :diasTrabalho, :servicos);";
    callback(sqlQuery, paramsObject);

  }
  
  put = async function (req, res, callback) {

    const paramsObject = req.body;

    const sqlQuery = "CALL profissionaisAtualizar(:idProfissional, :nome, :tipo, :ativo, :habilitado, :diasTrabalho, :servicos);";
    callback(sqlQuery, paramsObject);

  }
  
  del = async function (req, res, callback) {
  
    const paramsObject = { idProfissional: req.params.idProfissional }
    const sqlQuery = "CALL profissionaisExcluir(:idProfissional)";
    callback(sqlQuery, paramsObject);
        
  }
  
  module.exports.get = get;  
  module.exports.post = post;
  module.exports.put = put;
  module.exports.delete = del;
  module.exports.validationSchema = validationSchema;
