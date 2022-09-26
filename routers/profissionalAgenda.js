
/*
 *
    Created by Edson Andrade
    Creation Date: 05/09/2022
 *
 */


  const Joi = require('joi');

  const validationSchema = Joi.object({ profissional:      Joi.number().required(),
                                        compromisso:       Joi.number().required(),
                                        usuario:           Joi.number().required(),
                                        origem:            Joi.number().required()
                                      }); 

  get = async function(req, res, callback) {
    const paramsObject  =  { profissional: req.params.profissional };
    const sqlQuery = "CALL lerProfissionalAgenda(:profissional)";
    callback(sqlQuery, paramsObject);
  }
  
  post = async function (req, res, callback) {
  
    const paramsObject = req.body;

    const sqlQuery = "CALL profissionalAgendaCriar(:profissional, :compromisso, :usuario, :origem);";
    callback(sqlQuery, paramsObject);

  }
  
  del = async function (req, res, callback) {
  
    const paramsObject = { profissional: req.params.profissional, compromisso: req.params.compromisso }
    const sqlQuery = "CALL profissionalAgendaExcluir(:profissional, :compromisso)";
    callback(sqlQuery, paramsObject);
        
  }
  
  module.exports.get = get;  
  module.exports.post = post;
  module.exports.delete = del;
  module.exports.validationSchema = validationSchema;
