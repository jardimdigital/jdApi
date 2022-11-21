/*
 *
 * 
  
Created by Edson Andrade
Creation Date: 16/11/2022
 *
 */


const Joi = require('joi');

const validationSchema = Joi.object({

        idOrdemServico:  Joi.number(),
        numeroOS:        Joi.string().max(45).required(),
        origem:          Joi.string().max(1).required(),
        dataCriacao:     Joi.string().max(10).allow('', null),
        cliente:         Joi.number().required(),
        novoEndereco:    Joi.string().max(1).required(),
        enderecoCliente: Joi.number().allow(null),
        logradouro:      Joi.string().max(45).allow(null, ''),
        complemento:     Joi.string().max(45).allow(null, ''),
        bairro:          Joi.string().max(45).allow(null, ''),
        cidade:          Joi.string().max(45).allow(null, ''),
        georeferencia:   Joi.string().max(45).allow(null, ''),
        observacoes:     Joi.string().max(512).allow(null, ''),
        ultimoContato:   Joi.string().max(10).allow('', null),
        acompanhamento:  Joi.string().max(1024).allow(null, ''),
        situacao:        Joi.string().max(1).required(),
        criadoPor:       Joi.string().max(45).allow(null, ''),
}); 

const validationSchemaItem = Joi.object({
    idOrdemServicoItem:  Joi.number(),
    ordemServico:        Joi.number(),
    servico:             Joi.number().allow(null),
    produto:             Joi.number().allow(null),
    quantidade:          Joi.number().required(),
    valor:               Joi.number().required(),
    observacoes:         Joi.string().max(512).allow(null, ''),
    desconto:            Joi.number().allow(null),
    descPerc:            Joi.number().allow(null),
    valorComDesconto:    Joi.number().required()

});

get = async function(req, res, callback) {

  const paramsObject  =  { idCliente: req.query.idCliente, numeroOS: req.query.numeroOS};

  console.log(paramsObject);

  const sqlQuery = "CALL lerOrdensServico(:idCliente, :numeroOS)";
  callback(sqlQuery, paramsObject);
}

post = async function (req, res, callback) {

  const paramsObject = req.body;

  const sqlQuery = "CALL ordemServicosCriar(:numeroOS, :origem, :dataCriacao, :cliente, :novoEndereco, :enderecoCliente, :logradouro, :complemento, :bairro, :cidade, :georeferencia, :observacoes, :ultimoContato, :acompanhamento, :situacao, :criadoPor);";
  callback(sqlQuery, paramsObject);

}

put = async function (req, res, callback) {

  const paramsObject = req.body;

  const sqlQuery = "CALL ordemServicosAtualizar(:idOrdemServico, :numeroOS, :origem, :dataCriacao, :cliente, :novoEndereco, :enderecoCliente, :logradouro, :complemento, :bairro, :cidade, :georeferencia, :observacoes, :ultimoContato, :acompanhamento, :situacao, :criadoPor);"
  callback(sqlQuery, paramsObject);

}

del = async function (req, res, callback) {

  const paramsObject = { idOrdemServico: req.params.idOrdemServico }
  const sqlQuery = "CALL ordemServicosExcluir(:idOrdemServico)";
  callback(sqlQuery, paramsObject);
      
}

// Itens Ordens Serviço -------------------------------------------

 getItensOS = async function(req, res, callback) {
    const paramsObject  =  { idOrdemServico: req.params.idOrdemServico};
    const sqlQuery = "CALL lerItensOrdemServico(:idOrdemServico)";
    callback(sqlQuery, paramsObject);
  }
  
  postItemOS = async function (req, res, callback) {
  
    const paramsObject = req.body;
  
    const sqlQuery = "CALL itemOrdemServicoCriar(:ordemServico, :servico, :produto, :quantidade, :valor, :observacoes, :desconto, :descPerc, :valorComDesconto);";
    callback(sqlQuery, paramsObject);
  
  }
  
  putItemOS = async function (req, res, callback) {
  
    const paramsObject = req.body;
  
    const sqlQuery = "CALL itemOrdemServicoAtualizar(:idOrdemServicoItem, :ordemServico, :servico, :produto, :quantidade, :valor, :observacoes, :desconto, :descPerc, :valorComDesconto);"
    callback(sqlQuery, paramsObject);
  
  }
  
  delItemOS = async function (req, res, callback) {
  
    const paramsObject = { idServico: req.params.idServico }
    const sqlQuery = "CALL itemOrdemServicoExcluir(:idOrdemServicoItem)";
    callback(sqlQuery, paramsObject);
        
  }


module.exports.get = get;  
module.exports.post = post;
module.exports.put = put;
module.exports.delete = del;
module.exports.validationSchema = validationSchema;

module.exports.getItensOS = getItensOS;  
module.exports.postItemOS = postItemOS;
module.exports.putItemOS = putItemOS;
module.exports.deleteItemOS = delItemOS;
module.exports.validationSchemaItem = validationSchemaItem;

