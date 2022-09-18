
/*
 *
 * 
  
Created by Edson Andrade
Creation Date: 05/09/2022
 *
 */


const Joi = require('joi');

const validationSchema = Joi.object({
      idCompromissoItem:  Joi.number().required(),
      compromisso:        Joi.number().required(),
      cliente:            Joi.number().required(),
      orcamento:          Joi.number().allow(null),      
      servico:            Joi.number().allow(null),      
      produto:            Joi.number().allow(null),
      quantidade:         Joi.number().required(),
      quantidadeAjustada: Joi.number().allow(null),
      valor:              Joi.number().required(),
      valorAjustado:      Joi.number().allow(null)
}); 

get = async function(req, res, callback) {
  const paramsObject  =  { idCompromisso: req.params.idCompromisso };
  const sqlQuery = "CALL lerCompromissoItens(:idCompromisso, null)";
  callback(sqlQuery, paramsObject);
}

post = async function (req, res, callback) {

  const paramsObject = req.body;

  const sqlQuery = "CALL compromissoItensCriar(:compromisso, :cliente, :orcamento, :servico, :produto, :quantidade, :valor, :quantidadeAjustada, :valorAjustado);";
  callback(sqlQuery, paramsObject);

}

put = async function (req, res, callback) {

  const paramsObject = req.body;

  const sqlQuery = "CALL compromissoItensAtualizar(:idCompromissoItem, :compromisso, :cliente, :orcamento, :servico, :produto, :quantidade, :valor, :quantidadeAjustada, :valorAjustado);";
  callback(sqlQuery, paramsObject);

}

del = async function (req, res, callback) {

  const paramsObject = { idCompromissoItem: req.params.idCompromissoItem }
  const sqlQuery = "CALL CompromissoItensExcluir(:idCompromissoItem)";
  callback(sqlQuery, paramsObject);
      
}

module.exports.get = get;  
module.exports.post = post;
module.exports.put = put;
module.exports.delete = del;
module.exports.validationSchema = validationSchema;