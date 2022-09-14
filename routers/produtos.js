/*
 *
 * 
  
Created by Edson Andrade
Creation Date: 10/09/2022
 *
 */


const Joi = require('joi');

const validationSchema = Joi.object({
      idProduto:      Joi.number(),
      nome:           Joi.string().max(45).required(),
      descricao:      Joi.string().max(512).allow(null, ''),
      ativo:          Joi.string().max(01).required(),
      valorUnitario:  Joi.number().allow(0, null)
}); 

get = async function(req, res, callback) {
  const paramsObject  =  { nomeProduto: req.params.nomeProduto };
  const sqlQuery = "CALL lerProdutos(:nomeProduto)";
  callback(sqlQuery, paramsObject);
}

post = async function (req, res, callback) {

  const paramsObject = req.body;

  const sqlQuery = "CALL produtosCriar(:nome, :descricao, :valorUnitario, :ativo);";
  callback(sqlQuery, paramsObject);

}

put = async function (req, res, callback) {

  const paramsObject = req.body;

  const sqlQuery = "CALL produtosAtualizar(:idProduto, :nome, :descricao, :valorUnitario, :ativo);";
  callback(sqlQuery, paramsObject);

}

del = async function (req, res, callback) {

  const paramsObject = { idProduto: req.params.idProduto }
  const sqlQuery = "CALL produtosExcluir(:idProduto)";
  callback(sqlQuery, paramsObject);
      
}

module.exports.get = get;  
module.exports.post = post;
module.exports.put = put;
module.exports.delete = del;
module.exports.validationSchema = validationSchema;