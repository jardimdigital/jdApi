
/*
 *
 * 
  
Created by Edson Andrade
Creation Date: 05/09/2022
 *
 */


const Joi = require('joi');

const validationSchema = Joi.object({
      idCompromisso:      Joi.number().required(),
      cliente:            Joi.number().required(),
      endereco:           Joi.number().required(),
      ordemServico:       Joi.number().allow(null),
      data:               Joi.string(),
      periodo:            Joi.number().required(),
      veiculo:            Joi.number().allow(null),
      descricao:          Joi.string().max(512).allow(null, ''),
      orcamento:          Joi.number().allow(null),
      status:             Joi.number().allow(null),
      usuarioAtualizacao: Joi.string(),
      profissional:       Joi.number().allow(null)
}); 



get = async function(req, res, callback) {
  const paramsObject  =  { idCliente: req.params.idCliente,
                           idCompromisso: req.params.idCompromisso };
  const sqlQuery = "CALL lerCompromissos(:idCliente, :idCompromisso)";
  callback(sqlQuery, paramsObject);
}

post = async function (req, res, callback) {

  const paramsObject = req.body;
  const sqlQuery = "CALL compromissosCriar(:cliente, :endereco, :ordemServico, :data, :periodo, :veiculo, :descricao, :orcamento, :status, :usuarioAtualizacao, :profissional);";
  callback(sqlQuery, paramsObject);

}


put = async function (req, res, callback) {

  const paramsObject = req.body;
  const sqlQuery = "CALL compromissosAtualizar(:idCompromisso, :cliente, :endereco, :ordemServico, :data, :periodo, :veiculo, :descricao, :orcamento, :status, :usuarioAtualizacao, :profissional);";
  callback(sqlQuery, paramsObject);

}

del = async function (req, res, callback) {

  const paramsObject = { idCompromisso: req.params.idCompromisso }
  const sqlQuery = "CALL compromissosExcluir(:idCompromisso)";
  callback(sqlQuery, paramsObject);
      
}

module.exports.get = get;  
module.exports.post = post;
module.exports.put = put;
module.exports.delete = del;
module.exports.validationSchema = validationSchema;
