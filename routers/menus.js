/*
 *
 * 
  
  Created by Edson Andrade
  Creation Date:11/11/2022

 *
 */


const Joi = require('joi');

const grupoValidationSchema = Joi.object({
      idGrupoAcesso:   Joi.number(),
      nomeGrupo:       Joi.string().max(45).required(),
      descricao:       Joi.string().max(512).allow(null, ''),
      opcoesMenu:      Joi.string().max(512).allow(null, '')
    }); 

    const menuValidationSchema = Joi.object({
      idOpcaoMenu:  Joi.number(),
      rotulo:       Joi.string().max(45).required(),
      descricao:    Joi.string().max(512).allow(null, ''),
      endpoint:     Joi.string().max(45).required(),
      icone:        Joi.string().max(45).required()
    }); 


getGrupos = async function(req, res, callback) {
  const paramsObject  =  {};
  const sqlQuery = "CALL lerGruposAcesso();";
  callback(sqlQuery, paramsObject);
}


getOpcoesGrupos = async function(req, res, callback) {
  const paramsObject  =  {};
  const sqlQuery = "CALL lerOpcoesGrupos();";
  callback(sqlQuery, paramsObject);
}

post = async function (req, res, callback) {

  const paramsObject = req.body;

  const sqlQuery = "CALL grupoAcessosCriar(:nomeGrupo, :descricao, :opcoesMenu);";
  callback(sqlQuery, paramsObject);

}

put = async function (req, res, callback) {

  const paramsObject = req.body;

  const sqlQuery = "CALL grupoAcessosAtualizar(:idGrupoAcesso, :nomeGrupo, :descricao, :opcoesMenu);";
  callback(sqlQuery, paramsObject);

}


del = async function (req, res, callback) {

  const paramsObject = { idUsuario: req.params.idUsuario }
  const sqlQuery = "CALL usuarioExcluir(:idUsuario)";
  callback(sqlQuery, paramsObject);
      
}

// -- Opcoes menu ------------------------------------------------------------

getOpcoesMenu = async function(req, res, callback) {
  const paramsObject  =  {};
  const sqlQuery = "CALL lerOpcoesMenus();";
  callback(sqlQuery, paramsObject);
}

postOpcaoMenu = async function (req, res, callback) {

  const paramsObject = req.body;

  const sqlQuery = "CALL opcaoMenuCriar(:rotulo, :descricao, :endpoint, :icone);";
  callback(sqlQuery, paramsObject);

}

putOpcaoMenu = async function (req, res, callback) {

  const paramsObject = req.body;

  const sqlQuery = "CALL opcaoMenuAtualizar(:idOpcaoMenu, :rotulo, :descricao, :endpoint, :icone);";
  callback(sqlQuery, paramsObject);

}

deleteOpcaoMenu = async function (req, res, callback) {

  const paramsObject = { idOpcaoMenu: req.params.idOpcaoMenu }
  const sqlQuery = "CALL opcaoMenuExcluir(:idOpcaoMenu)";
  callback(sqlQuery, paramsObject);
      
}

module.exports.getGrupos = getGrupos;  
module.exports.getOpcoesGrupos = getOpcoesGrupos;
module.exports.post = post;
module.exports.put = put;
module.exports.delete = del;

module.exports.getOpcoesMenu    = getOpcoesMenu;  
module.exports.postOpcaoMenu    = postOpcaoMenu;
module.exports.putOpcaoMenu     = putOpcaoMenu;
module.exports.deleteOpcaoMenu  = deleteOpcaoMenu;

module.exports.grupoValidationSchema = grupoValidationSchema;
module.exports.menuValidationSchema = menuValidationSchema;