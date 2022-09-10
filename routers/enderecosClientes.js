
/*
 *
 * 
  
Created by Edson Andrade
Creation Date: 02/09/2022
 *
 */


  const Joi = require('joi');

  const validationSchema = Joi.object({
        idEndereco:               Joi.number(),
        cliente:                  Joi.number(),
        apelido:                  Joi.string().max(45).required(),
        logradouro:               Joi.string().max(45).required(),
        complemento:              Joi.string().max(45).allow(null),
        cidade:                   Joi.string().max(45).allow(null),
        bairro:                   Joi.string().max(45).allow(null),
        estado:                   Joi.string().max(45).allow(null),
        cep:                      Joi.string().max(9).allow(null),
        diaMes:                   Joi.number().allow(null),
        diaSemana:                Joi.number().allow(null),
        semanaMes:                Joi.number().allow(null),
        georeferenciamento:       Joi.string().max(40).allow(null, ''),
        ordem:                    Joi.number().allow(null),
        padrao:                   Joi.string().max(1).allow(null),
        observacoes:              Joi.string().max(512).allow(null),
        profissionalExclusivo:    Joi.number().allow(null),
        profissionalPreferencial: Joi.number().allow(null)
  }); 

  get = async function(req, res, callback) {
    const paramsObject  =  { cliente: req.params.cliente };
    const sqlQuery = "CALL lerEnderecosClientes(:cliente)";
    callback(sqlQuery, paramsObject);
  }
  
  post = async function (req, res, callback) {
  
    const paramsObject = req.body;

    const sqlQuery = "CALL clienteEnderecosCriar(:cliente, :apelido, :logradouro, :complemento, :cep, :georeferenciamento, :ordem, :padrao, :cidade, :bairro, :estado, :profissionalExclusivo, :profissionalPreferencial, :observacoes, :diaSemana, :diaMes, :semanaMes);";
    callback(sqlQuery, paramsObject);

  }
  
  put = async function (req, res, callback) {

    const paramsObject = req.body;

    const sqlQuery = "CALL clienteEnderecosAtualizar(:idEndereco, :cliente, :apelido, :logradouro, :complemento, :cep, :georeferenciamento, :ordem, :padrao, :cidade, :bairro, :estado, :profissionalExclusivo, :profissionalPreferencial, :observacoes, :diaSemana, :diaMes, :semanaMes);";
    callback(sqlQuery, paramsObject);

  }
  
  del = async function (req, res, callback) {
  
    const paramsObject = { idEndereco: req.params.idEndereco }
    const sqlQuery = "CALL clienteEnderecosExcluir(:idEndereco)";
    callback(sqlQuery, paramsObject);
        
  }
  
  module.exports.get = get;  
  module.exports.post = post;
  module.exports.put = put;
  module.exports.delete = del;
  module.exports.validationSchema = validationSchema;