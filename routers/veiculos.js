/*
 *
 * 
  
Created by Edson Andrade
Creation Date: 29/09/2022
 *
 */


const Joi = require('joi');

const validationSchema = Joi.object({
      idVeiculo:      Joi.number(),
      nome:           Joi.string().max(45).required(),
      placa:          Joi.string().max(10).required(),
      ativo:          Joi.string().max(01).required()
}); 

get = async function(req, res, callback) {
  const paramsObject  =  { nomeVeiculo: req.params.nomeVeiculo };
  const sqlQuery = "CALL lerVeiculos(:nomeVeiculo)";
  callback(sqlQuery, paramsObject);
}

post = async function (req, res, callback) {

  const paramsObject = req.body;

  const sqlQuery = "CALL veiculosCriar(:nome, :placa, :ativo);";
  callback(sqlQuery, paramsObject);

}

put = async function (req, res, callback) {

  const paramsObject = req.body;

  const sqlQuery = "CALL veiculosAtualizar(:idVeiculo, :nome, :placa, :ativo);";
  callback(sqlQuery, paramsObject);

}

del = async function (req, res, callback) {

  const paramsObject = { idVeiculo: req.params.idVeiculo }
  const sqlQuery = "CALL veiculosExcluir(:idVeiculo)";
  callback(sqlQuery, paramsObject);
      
}

module.exports.get = get;  
module.exports.post = post;
module.exports.put = put;
module.exports.delete = del;
module.exports.validationSchema = validationSchema;