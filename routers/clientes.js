/*
 *
 * 
  
Created by Edson Andrade
Creation Date: 20/08/2022


 *
 */


  const Joi = require('joi');

  const validationSchema = Joi.object({
              idCliente:                 Joi.number(),
              nome:                      Joi.string().max(45).required(),
              apelido:                   Joi.string().max(45).required(),
              tipo:                      Joi.string().max(1).allow('F', 'J'),
              cpfCnpj:                   Joi.string().max(45).required(),
              origemContato:             Joi.number().allow(null),
              dataNascimento:            Joi.date().allow(null),
              ativo:                     Joi.string().allow('S', 'N'),
              profissionalExclusivo:     Joi.number().allow(null),
              profissionalPreferencial:  Joi.number().allow(null),
              observacoes:               Joi.string().max(512).allow(null, "")
          }); 
  




  post = async function (req, res, callback) {
  
    const paramsObject = {
    idCliente:                 req.body.idCliente,
    nome:                      req.body.nome,
    apelido:                   req.body.apelido,
    tipo:                      req.body.tipo,
    cpfCnpj:                   req.body.cpfCnpj,
    origemContato:             req.body.origemContato,
    dataNascimento:            req.body.dataNascimento,
    ativo:                     req.body.ativo,
    profissionalExclusivo:     req.body.profissionalExclusivo,
    profissionalPreferencial:  req.body.profissionalPreferencial, 
    observacoes:               req.body.observacoes
    };

    const validData = validationSchema.validate(paramsObject);

    if (validData.error != null) {
        res.json({
            code: 404,
            message: 'Provided create data is invalid or not properly structured',
            details: validData.error.details
        });
    } else {
        const putQuery = "CALL clientesCriar(:nome, :apelido, :tipo, :cpfCnpj, :origemContato, :dataNascimento, :ativo, :profissionalExclusivo, :profissionalPreferencial, :observacoes);";
        callback(putQuery, paramsObject);
    }
  }
  
  put = async function (req, res, callback) {

    const paramsObject = {
        idCliente:                 req.body.idCliente,
        nome:                      req.body.nome,
        apelido:                   req.body.apelido,
        tipo:                      req.body.tipo,
        cpfCnpj:                   req.body.cpfCnpj,
        origemContato:             req.body.origemContato,
        dataNascimento:            req.body.dataNascimento,
        ativo:                     req.body.ativo,
        profissionalExclusivo:     req.body.profissionalExclusivo,
        profissionalPreferencial:  req.body.profissionalPreferencial, 
        observacoes:               req.body.observacoes
        };
    
        const validData = validationSchema.validate(paramsObject);
    
        if (validData.error != null) {
            res.json({
                code: 404,
                message: 'Provided create data is invalid or not properly structured',
                details: validData.error.details
            });
        } else {
            const putQuery = "CALL clientesAtualizar(:idCliente, :nome, :apelido, :tipo, :cpfCnpj, :origemContato, :dataNascimento, :ativo, :profissionalExclusivo, :profissionalPreferencial, :observacoes);";
            callback(putQuery, paramsObject);
        }  
     
  }
  
  del = async function (req, res, callback) {
  
      const validationSchema = Joi.object({ idCliente: Joi.string() });
  
      const paramsObject = { idCliente: req.params.idCliente }
  
      const validData = validationSchema.validate(paramsObject);
  
      if (validData.error != null) {
          res.json({
              code: 404,
              message: 'Provided delete data is invalid or not properly structured',
              details: validData.error.details
          });
      } else {
          const deleteQuery = "CALL clientesExcluir(:idCliente)";
          callback(deleteQuery, paramsObject);
      }
  
  }
  
  module.exports.post = post;
  module.exports.put = put;
  module.exports.delete = del;