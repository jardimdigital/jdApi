
/*
 *
    Created by Edson Andrade
    Creation Date: 05/09/2022
 *
 */


  const Joi = require('joi');

  const validationSchema = Joi.object({
        idProfissional:    Joi.number(),
        nome:              Joi.string().max(45).required(),
        tipo:              Joi.string().max(01).required(),
        ativo:             Joi.string().max(01).required(),
        habilitado:        Joi.string().max(01).required(),
        diasTrabalho:      Joi.string().max(20).allow('', null),
        servicos:          Joi.string().max(2048).allow('', null)
  }); 

  const validationSchemaAgenda =  Joi.object({
        profissional:             Joi.number().required(),
        compromisso:              Joi.number().required(),
        dataCompromisso:          Joi.string().required(),
        usuario:                  Joi.string().required(),
        origem:                   Joi.number().required()
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


  postAgenda = async function (req, res, callback) {
    const paramsObject = req.body;
    const sqlQuery = "CALL profissionalAgendaCriar(:profissional, :compromisso, :dataCompromisso, :usuario, :origem);";
    callback(sqlQuery, paramsObject);
  }

  put = async function (req, res, callback) {
    const paramsObject = req.body;
    console.log(paramsObject);
    const sqlQuery = "CALL profissionaisAtualizar(:idProfissional, :nome, :tipo, :ativo, :habilitado, :diasTrabalho, :servicos);";
    callback(sqlQuery, paramsObject);
  }


  del = async function (req, res, callback) {
    const paramsObject = { idProfissional: req.params.idProfissional }
    const sqlQuery = "CALL profissionaisExcluir(:idProfissional)";
    callback(sqlQuery, paramsObject);    
  }
  
  delAgenda = async function (req, res, callback) {
    const paramsObject = { profissional: req.params.profissional, compromisso: req.params.compromisso }
    const sqlQuery = "CALL profissionalAgendaExcluir(:profissional, :compromisso)";
    callback(sqlQuery, paramsObject); 
  }

  module.exports.get = get;  
  module.exports.post = post;
  module.exports.postAgenda = postAgenda;
  module.exports.put = put;
  module.exports.delete = del;
  module.exports.deleteAgenda = delAgenda;
  module.exports.validationSchema = validationSchema;
  module.exports.validationSchemaAgenda = validationSchemaAgenda;
