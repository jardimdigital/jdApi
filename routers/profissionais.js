
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
        apelido:           Joi.string().max(25).required(),
        identidade:        Joi.string().max(20).allow('', null),
        nascimento:        Joi.string().max(10).allow('', null),
        tipo:              Joi.string().max(01).required(),
        ativo:             Joi.string().max(01).required(),
        habilitado:        Joi.string().max(01).required(),
        diasTrabalho:      Joi.string().max(20).allow('', null),
        servicos:          Joi.string().max(2048).allow('', null)
  }); 

  const validationSchemaAgenda =  Joi.object({
        profissional:             Joi.number().required(),
        compromisso:              Joi.number().required(),
        dataAgenda:               Joi.string().required(),
        usuario:                  Joi.string().required(),
        origem:                   Joi.number().required(),
        profAnterior:             Joi.number().allow(null)
  }); 

  get = async function(req, res, callback) {
    const paramsObject  =  { idProfissional: req.params.idProfissional };
    const sqlQuery = "CALL lerProfissionais(:idProfissional)";
    callback(sqlQuery, paramsObject);
  }
  
  getAgenda = async function(req, res, callback) {
    const paramsObject  =  { compromisso: req.params.compromisso };
    const sqlQuery = "CALL lerProfissionaisCompromisso(:compromisso)";
    callback(sqlQuery, paramsObject);
  }
  
  post = async function (req, res, callback) {
    const paramsObject = req.body;
    const sqlQuery = "CALL profissionaisCriar(:nome, :tipo, :apelido, :identidade, :nascimento, :ativo, :habilitado, :diasTrabalho, :servicos);";
    callback(sqlQuery, paramsObject);

  }

  postAgenda = async function (req, res, callback) {
    const paramsObject = req.body;
    const sqlQuery = "CALL profissionalAgendaCriar(:profissional, :compromisso, :dataAgenda, :usuario, :origem);";
    callback(sqlQuery, paramsObject);
  }

  postGrupoAgenda = async function (req, res, callback) {
    const paramsObject = req.body;
    const sqlQuery = "CALL profissionaisAgendasCriar(:compromisso, :profissionais, :dataCompromisso, :usuario, :origem);"
    callback(sqlQuery, paramsObject);
  }

  put = async function (req, res, callback) {
    const paramsObject = req.body;
    console.log(paramsObject);
    const sqlQuery = "CALL profissionaisAtualizar(:idProfissional, :nome, :apelido, :identidade, :nascimento, :tipo, :ativo, :habilitado, :diasTrabalho, :servicos);";
    callback(sqlQuery, paramsObject);
  }

  putAgenda = async function (req, res, callback) {
    const paramsObject = req.body;
    const sqlQuery = "CALL profissionalAgendaAlterar(:profissional, :compromisso, :dataAgenda, :usuario, :origem, :profAnterior);"
    callback(sqlQuery, paramsObject);
  }


  del = async function (req, res, callback) {
    const paramsObject = { idProfissional: req.params.idProfissional }
    const sqlQuery = "CALL profissionaisExcluir(:idProfissional)";
    callback(sqlQuery, paramsObject);    
  }
  
  deleteAgenda = async function (req, res, callback) {
    const paramsObject = { profissional: req.params.profissional, compromisso: req.params.compromisso }
    console.log(paramsObject)
    const sqlQuery = "CALL profissionalAgendaExcluir(:profissional, :compromisso)";
    callback(sqlQuery, paramsObject); 
  }

  module.exports.get = get;  
  module.exports.getAgenda = getAgenda;  
  module.exports.post = post;
  module.exports.postAgenda = postAgenda;
  module.exports.postGrupoAgenda = postGrupoAgenda;
  module.exports.put = put;
  module.exports.putAgenda = putAgenda;
  module.exports.delete = del;
  module.exports.deleteAgenda = deleteAgenda;
  module.exports.validationSchema = validationSchema;
  module.exports.validationSchemaAgenda = validationSchemaAgenda;
