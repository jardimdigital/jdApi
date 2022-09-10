
/*
 *
 * 
  
Created by Edson Andrade
Creation Date: 05/09/2022
 *
 */


  const Joi = require('joi');

  const validationSchema = Joi.object({
        idContato:                Joi.number(),
        cliente:                  Joi.number(),
        telefones:                Joi.string().max(45).required(),
        tipo:                     Joi.string().max(01).required(),
        nomeContato:              Joi.string().max(45).allow(null),
        tipoContato:              Joi.string().max(45).allow(null),
        email:                    Joi.string().max(45).allow(null)
  }); 

  get = async function(req, res, callback) {
    const paramsObject  =  { cliente: req.params.cliente };
    const sqlQuery = "CALL lerContatosClientes(:cliente)";
    callback(sqlQuery, paramsObject);
  }
  
  post = async function (req, res, callback) {
  
    const paramsObject = req.body;

    const sqlQuery = "CALL clienteContatosCriar(:cliente, :telefones, :tipo, :nomeContato, :tipoContato, :email);";
    callback(sqlQuery, paramsObject);

  }
  
  put = async function (req, res, callback) {

    const paramsObject = req.body;

    const sqlQuery = "CALL clienteContatosAtualizar(:idContato, :cliente, :telefones, :tipo, :nomeContato, :tipoContato, :email);";
    callback(sqlQuery, paramsObject);

  }
  
  del = async function (req, res, callback) {
  
    const paramsObject = { idContato: req.params.idContato }
    const sqlQuery = "CALL clienteContatosExcluir(:idContato)";
    callback(sqlQuery, paramsObject);
        
  }
  
  module.exports.get = get;  
  module.exports.post = post;
  module.exports.put = put;
  module.exports.delete = del;
  module.exports.validationSchema = validationSchema;