/*
 * 
 *  
 */

 // First and foremost check is configuration variables are available

 const configEnv = require('config');

 if (!configEnv.get('jwtPrivateKey')) {
   console.error('FATAL ERROR: jwtPrivateKey is not defined');
   process.exit(1)
 }
 
 if (!configEnv.get('databaseParams')) {
   console.error('FATAL ERROR: databaseParams is not defined');
   process.exit(1)
 } else {
   var dp = configEnv.get('databaseParams');
   dp = dp.replace(/\:/g, '":"')
   dp = dp.replace(/\,/g, '","')
   dp = '{"' + dp + '"}'
 }
 
 // ------ Prepare MySQL Connection
 const databaseParams = JSON.parse(dp);
 const mysql = require("mysql2");
 
 const queryStringFormatter = function (query, values) {
 
   if (!values) return query;
   return query.replace(/\:(\w+)/g, function (txt, key) {
     if (values.hasOwnProperty(key)) {
       return this.escape(values[key]);
     }
     return txt;
   }.bind(this));
 }; 

 var mySqlConnParams = { connectionLimit: 100,
                         host: databaseParams.host,
                         port: databaseParams.port,
                         user: databaseParams.user,
                         password: databaseParams.password,
                         database: databaseParams.database,
                         queryFormat: queryStringFormatter };
                         
 // -----  End MySQL Preparation 
 
 const StringDecoder = require('string_decoder').StringDecoder;
 const http = require('http');
 const https = require('https');
 
 // Instantiate the HTTPS server options

 
 const fs = require('fs');

 var httpsAvailable = fs.existsSync(/https/)

 var httpsServerOptions;

if (httpsAvailable) {
  var httpsServerOptions = {
    cert: fs.readFileSync(__dirname + '/https/comodo/67_205_142_44.crt'),
    key: fs.readFileSync(__dirname + '/https/comodo/67_205_142_44.key')
    }; 
}



const express = require('express');
var app = express();
var httpServer = http.createServer(app);
var httpsServer = https.createServer(httpsServerOptions, app);

const config = require(__dirname + '/lib/config');
const tokens = require(__dirname + '/routers/tokens');

httpServer.listen(config.httpPort, () => {
  console.log('HTTP Express server is listening on port ' + config.httpPort);
});
 
if (httpsAvailable) {
  httpsServer.listen(config.httpsPort, () => {
    console.log('HTTPS Express server listening on port ' + config.httpsPort);
  });
}
 
const jwt          = require('jsonwebtoken');
const cors         = require('cors');
const path         = require('path')
const csv          = require("csvtojson");


const readXlsxFile = require('read-excel-file/node'); 
const whitelist = configEnv.get('whitelist');
 
 var corsOptions = {
   
   origin: function (origin, callback) {
     if (whitelist !=  undefined && whitelist.indexOf(origin) !== -1) {
       callback(null, true);
     } else {
       callback(new Error('Not allowed by CORS'))
     }
   }
 
 }
 
 // Add headers
 app.use(function (req, res, next) {
 
   console.log('accessControlAllowOrigin ', config.accessControlAllowOrigin);
   
   // Website you wish to allow to connect
   res.setHeader('Access-Control-Allow-Origin', config.accessControlAllowOrigin);
 
   // Request methods you wish to allow
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
 
   // Request headers you wish to allow
   res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin, X-Requested-With, content-type, id');
 
   // Set to true if you need the website to include cookies in the requests sent
   // to the API (e.g. in case you use sessions)
   res.setHeader('Access-Control-Allow-Credentials', true);
   
   // res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, ID, Token");
   // Pass to next layer of middleware
   
   next();
 
 });
 
 app.options('*', cors(corsOptions));
 
 app.use(express.json()); // for parsing application/json
 app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencode
 //  app.use(rateLimiter); // redis config params
 app.use(authenticateToken);
 
 const multer = require('multer');
 const { string } = require('joi');
const { validationSchema } = require('./routers/enderecosClientes');
 
 const storage = multer.diskStorage({
   destination: function (req, file, cb) {
     cb(null, './uploads')
   },
   filename: function (req, file, cb) {
     const baseName = path.parse(file.originalname).name;
     cb(null, baseName + '-' + req.body.client + path.extname(file.originalname))
   }
 })
 
 var upload = multer({ storage: storage })
 
 
 // AUTHENTICATE ------------------------------------------------------------------------------- // 
 app.post('/user/authenticate', (req, res) => {
   login.login(req, res)
 });
 
 // For Express routes
 function authenticateToken(req, res, next) {
 
   if ('/createToken,/toknes/create,/user/authenticate'.indexOf(req.path) === -1) {

     const authHeader = req.headers['authorization'];
     const token = authHeader && authHeader.split(' ')[1];
 
     if (token == null) 
         return res.status(401).json({ code: 401,
                                       message: 'Token was not provided' });
     
     jwt.verify(token, configEnv.get('jwtPrivateKey'), (err, tokenPayload) => {
       if (err) return res.status(403).json(err);
 
       //
       //  ToDo: check for authorized routes.
       //  NOTE: when processing request use req.auth to get client and user information
       //        even if it is passed as part of request body. 
       //
 
       req.auth = tokenPayload
       next();
     });
   } else {
     next(); // Ignore token validation is request is to create token itself
   }
 
 }
 
 
 // TOKENS ------------------------------------------------------------------------------------ // 
 
 app.post('/createToken', async (req, res) => {
 
  console.log("tokens: ",  tokens);

   try {
    console.log(mySqlConnParams)
     let conn = mysql.createConnection(mySqlConnParams);
     tokens.createToken(req, res, conn);
     conn.end();
   } catch (error) {
     console.log('um error aconteceu', error)
     res.writeHead(500);
     res.end(JSON.stringify({ message: "Alert! Database connection attempt failed while createing token " }));
   }
 
 });
 
 // TEMPLATES ---------------------------------------------------------------------------------- // 
 app.post('/templates', (req, res) => {
   const entity = req.body.entity;
   const language = req.body.language;
   const filePath = './templates/' + language + '/';
   const fileName = entity + '-' + language + '.xlsx';
   res.download( filePath + fileName ); 
 });
 
 // UPLOAD ------------------------------------------------------------------------------------ //
 app.post('/upload', upload.single('file'), async function (req, res, next) {
 
   /* Important  ----------------------------------------------------------------- /
 
     To solve  "Error: Multipart: Boundary not found" is importat to omit
     header.set('content-type', 'multipart/form-data')
 
   / ---------------------------------------------------------------------------- */
 
   if(req.auth.client != req.body.client) {
     var payloadString = JSON.stringify({ processed: 0, error: null, errorLog: { message: "Not authorized to access other client's data" } });
     res.writeHead(401);
     res.end(payloadString); // returns a stringifyed value   
     return 
   }
 
   if (!req.file) {
     res.writeHead(400);
     var payloadString = JSON.stringify({ error: 'field data was not provided' });
     res.end(payloadString); // returns a stringifyed value   
     return;
   }
 
  const baseName  = path.parse(req.file.originalname).name;
  const extension = path.extname(req.file.originalname);
  const clientId  = req.body.client;
  const fileName  = baseName + '-' + clientId + extension;
  const entity    = req.body.entity;

  // ... implement upload logic below ...

 
 });
 
 // Application's handlers

 const clientes             = require(__dirname + '/routers/clientes');
 const enderecosClientes    = require(__dirname + '/routers/enderecosClientes');
 const contatosClientes     = require(__dirname + '/routers/contatosClientes');
 const profissionais        = require(__dirname + '/routers/profissionais');
 const profissionalAgenda   = require(__dirname + '/routers/profissionalAgenda')
 const servicos             = require(__dirname + '/routers/servicos');
 const produtos             = require(__dirname + '/routers/produtos');
 const recursos             = require(__dirname + '/routers/recursos');
 const compromissos         = require(__dirname + '/routers/compromissos');
 const compromissoItens     = require(__dirname + '/routers/compromissoItens');
 
 
 // CLIENTES -------------------------------------------------------------------------------- //
 
 app.get('/clientes/:criterio', (req, res) => {
  const sqlQuery = "CALL lerClientes(:criterio)";
  const paramsObject  =  { criterio: req.params.criterio };
  processGetRequest(sqlQuery, paramsObject, res);
})

app.post('/clientes', (req, res) => {
  clientes.post(req, res, (postQuery, params) => {
      processPost(postQuery, params, res);
  });
})

app.put('/clientes', (req, res) => {
  clientes.put(req, res, (putQuery, params) => {
      processPut(putQuery, params, res);
  });
})

app.delete('/clientes/:idCliente', (req, res) => {
  clientes.delete(req, res, (deleteQuery, params) => {
      processDelete(deleteQuery, params, res);
  });
})

 
 // ENDERECOS CLIENTES ------------------------------------------------------------------------- //
 
app.get('/enderecosClientes/:cliente', (req, res) => {
  enderecosClientes.get(req, res, (sqlQuery, params) => {
    processGetRequest(sqlQuery, params, res);
  })
})

app.post('/enderecosClientes', (req, res) => {
  if (validatePayload(req, res, enderecosClientes.validationSchema))
    enderecosClientes.post(req, res, (sqlQuery, params) => {
        processPut(sqlQuery, params, res);
    });
})

app.put('/enderecosClientes', (req, res) => {
  if (validatePayload(req, res, enderecosClientes.validationSchema))
    enderecosClientes.put(req, res, (sqlQuery, params) => {
      processPut(sqlQuery, params, res);
  });
})

app.delete('/enderecosClientes/:idEndereco', (req, res) => {
  enderecosClientes.delete(req, res, (sqlQuery, params) => {
      processDelete(sqlQuery, params, res);
  });
})

 
 // CONTATOS CLIENTES ------------------------------------------------------------------------- //
 
 app.get('/contatosClientes/:cliente', (req, res) => {
  contatosClientes.get(req, res, (sqlQuery, params) => {
    processGetRequest(sqlQuery, params, res);
  })
})

app.post('/contatosClientes', (req, res) => {
  if (validatePayload(req, res, contatosClientes.validationSchema))
    contatosClientes.post(req, res, (sqlQuery, params) => {
        processPut(sqlQuery, params, res);
    });
})

app.put('/contatosClientes', (req, res) => {
  console.log(req.body)
  if (validatePayload(req, res, contatosClientes.validationSchema))
    contatosClientes.put(req, res, (sqlQuery, params) => {
      processPut(sqlQuery, params, res);
  });
})

app.delete('/contatosClientes/:idContato', (req, res) => {
  contatosClientes.delete(req, res, (sqlQuery, params) => {
      processDelete(sqlQuery, params, res);
  });
})

 // PROFISSIONAIS  ---------------------------------------------------------------------------------- //
 
 app.get('/profissionais/:idProfissional', (req, res) => {
  profissionais.get(req, res, (sqlQuery, params) => {
    processGetRequest(sqlQuery, params, res);
  })
})
 
app.get('/profissionais/:dataIncial/:dataFinal', (req, res) => {
    const params = { dataIncial: req.params.dataIncial, dataFinal: req.params.dataFinal };
    processGetRequest('CALL agendaSemanaProfissional(:dataIncial, :dataFinal);', params, res);
})

app.post('/profissionais', (req, res) => {
  if (validatePayload(req, res, profissionais.validationSchema))
    profissionais.post(req, res, (sqlQuery, params) => {
        processPut(sqlQuery, params, res);
    });
})

app.post('/profissionais/agenda', (req, res) => {
  if (validatePayload(req, res, profissionais.validationSchemaAgenda))
    profissionais.postAgenda(req, res, (sqlQuery, params) => {
        processPut(sqlQuery, params, res);
    });
})

app.put('/profissionais', (req, res) => {
  console.log(req.body)
  if (validatePayload(req, res, profissionais.validationSchema))
    profissionais.put(req, res, (sqlQuery, params) => {
      processPut(sqlQuery, params, res);
  });
})

app.delete('/profissionais/:idProfissional', (req, res) => {
  profissionais.delete(req, res, (sqlQuery, params) => {
      processDelete(sqlQuery, params, res);
  });
})

app.delete('/profissionais/agenda/:profissional/:compromisso', (req, res) => {
  profissionais.deleteAgenda(req, res, (sqlQuery, params) => {
      processDelete(sqlQuery, params, res);
  });

})


 // PROFISSIONAIS  AGENDAS ----------------------------------------------------------------------------- //
 
 app.get('/profissionalAgenda/:profissional/:compromisso', (req, res) => {
  profissionalAgenda.get(req, res, (sqlQuery, params) => {
    processGetRequest(sqlQuery, params, res);
  })
})

app.post('/profissionalAgenda', (req, res) => {
  if (validatePayload(req, res, profissionalAgenda.validationSchema))
  profissionalAgenda.post(req, res, (sqlQuery, params) => {
        processPut(sqlQuery, params, res);
    });
})


app.delete('/profissionalAgenda/:profissional/:compromisso', (req, res) => {
  profissionalAgenda.delete(req, res, (sqlQuery, params) => {
      processDelete(sqlQuery, params, res);
  });
})


 // SERVICOS ------------------------------------------------------------------------------------- //
 
 app.get('/servicos/ativos', (req, res) => {
    sqlQuery = 'CALL lerServicosAtivos();'
    processGetRequest(sqlQuery, {}, res);
})

 app.get('/servicos/:nomeServico', (req, res) => {
  servicos.get(req, res, (sqlQuery, params) => {
    processGetRequest(sqlQuery, params, res);
  })
})

app.post('/servicos', (req, res) => {
  if (validatePayload(req, res, servicos.validationSchema))
    servicos.post(req, res, (sqlQuery, params) => {
        processPut(sqlQuery, params, res);
    });
})

app.put('/servicos', (req, res) => {
  if (validatePayload(req, res, servicos.validationSchema))
    servicos.put(req, res, (sqlQuery, params) => {
      processPut(sqlQuery, params, res);
  });
})

app.delete('/servicos/:idServico', (req, res) => {
  servicos.delete(req, res, (sqlQuery, params) => {
      processDelete(sqlQuery, params, res);
  });
})


 // PRODUTOS  ------------------------------------------------------------------------------------- //
 
  
 app.get('/produtos/ativos', (req, res) => {
  sqlQuery = 'CALL lerProdutosAtivos();'
  processGetRequest(sqlQuery, {}, res);
})

 app.get('/produtos/:nomeProduto', (req, res) => {
  produtos.get(req, res, (sqlQuery, params) => {
    processGetRequest(sqlQuery, params, res);
  })
})

app.post('/produtos', (req, res) => {
  if (validatePayload(req, res, produtos.validationSchema))
    produtos.post(req, res, (sqlQuery, params) => {
        processPut(sqlQuery, params, res);
    });
})

app.put('/produtos', (req, res) => {
  console.log(req.body)
  if (validatePayload(req, res, produtos.validationSchema))
    produtos.put(req, res, (sqlQuery, params) => {
      processPut(sqlQuery, params, res);
  });
})

app.delete('/produtos/:idProduto', (req, res) => {
  produtos.delete(req, res, (sqlQuery, params) => {
      processDelete(sqlQuery, params, res);
  });
})


 // RECURSOS  ------------------------------------------------------------------------------------- //
 
 app.get('/recursos/:nomeRecurso', (req, res) => {
  recursos.get(req, res, (sqlQuery, params) => {
    processGetRequest(sqlQuery, params, res);
  })
})

app.post('/recursos', (req, res) => {
  if (validatePayload(req, res, recursos.validationSchema))
    recursos.post(req, res, (sqlQuery, params) => {
        processPut(sqlQuery, params, res);
    });
})

app.put('/recursos', (req, res) => {
  console.log(req.body)
  if (validatePayload(req, res, recursos.validationSchema))
    recursos.put(req, res, (sqlQuery, params) => {
      processPut(sqlQuery, params, res);
  });
})

app.delete('/recursos/:idRecurso', (req, res) => {
  recursos.delete(req, res, (sqlQuery, params) => {
      processDelete(sqlQuery, params, res);
  });
})

//  MANUTENCOES -----------------------------------------------------------------------------

app.get('/manutencoes', (req, res) => {
  sqlQuery = 'CALL lerAgendasPendentes();'
  processGetRequest(sqlQuery, null, res);
})

app.get('/manutencoes/:idCliente', (req, res) => {
  const params =  { idCliente: req.params.idCliente };
  sqlQuery = 'CALL lerCompromissosPendentes(:idCliente, null);'
  processGetRequest(sqlQuery, params, res);
})



 // COMPROMISSOS  ------------------------------------------------------------------------------------- //
 
app.get('/compromissos/:idCliente', (req, res) => {
  sqlQuery = 'CALL lerCompromissos(:idCliente, NULL);'
  processGetRequest(sqlQuery, {idCliente: req.params.idCliente}, res);
})

app.get('/compromissos/:idCliente/:idCompromisso', (req, res) => {
  compromissos.get(req, res, (sqlQuery, params) => {
    console.log(params)
    processGetRequest(sqlQuery, params, res);
  })
})

app.post('/compromissos', (req, res) => {
  if (validatePayload(req, res, compromissos.validationSchema))
    compromissos.post(req, res, (sqlQuery, params) => {
        processPut(sqlQuery, params, res);
    });
})

app.put('/compromissos', (req, res) => {
  console.log(req.body)
  if (validatePayload(req, res, compromissos.validationSchema))
    compromissos.put(req, res, (sqlQuery, params) => {
      processPut(sqlQuery, params, res);
  });
})

app.delete('/compromissos/:idCompromisso', (req, res) => {
  compromissos.delete(req, res, (sqlQuery, params) => {
      processDelete(sqlQuery, params, res);
  });
})


 // COMPROMISSO ITENS  -------------------------------------------------------------------------------- //
 
 app.get('/compromissoItens/:idCompromisso', (req, res) => {
  compromissoItens.get(req, res, (sqlQuery, params) => {
    processGetRequest(sqlQuery, params, res);
  })
})

app.post('/compromissoItens', (req, res) => {
  if (validatePayload(req, res, compromissoItens.validationSchema))
    compromissoItens.post(req, res, (sqlQuery, params) => {
        processPut(sqlQuery, params, res);
    });
})

app.put('/compromissoItens', (req, res) => {
  console.log(req.body)
  if (validatePayload(req, res, compromissoItens.validationSchema))
    compromissoItens.put(req, res, (sqlQuery, params) => {
      processPut(sqlQuery, params, res);
  });
})

app.delete('/compromissoItens/:idCompromissoItem', (req, res) => {
  compromissoItens.delete(req, res, (sqlQuery, params) => {
      processDelete(sqlQuery, params, res);
  });
})


 // dataCheckin  -------------------------------------------------------------------------------------- //
 
 app.post('/dataCheckin/download', (req, res) => {
 
   const sqlQuery = "CALL uploadedFieldsReadAllColumns(:client, :user, :form, :date);";
   const paramsObject = {  client:       req.auth.client, 
                           language:     req.auth.userLanguage,
                           user:         req.body.user,
                           form:         req.body.form,
                           date:         req.body.date,
                           action:       req.body.action };
   processGetRequest('uploadedData', sqlQuery, paramsObject, true, res);
 
 })
 
 // SUPPORT FUNCTIONS  ---------------------------------------------------------------------- //
 
 async function processGetRequest(sqlQuery, paramsObject, res) {
 
     try {
 
       let conn = mysql.createConnection(mySqlConnParams);
       conn.query(sqlQuery, paramsObject, function (error, results) {
 
         if (error) {
           res.writeHead(500);
           res.end(JSON.stringify({ message: "Error: An unexpected error occured while getting " + sqlQuery }))
           console.log(error);
         } else if (results[0].length === 0) {
           res.status(204).json([]);
         } else {
             res.json(results[0])
         }
       });
       conn.end();
     } catch (error) {
         console.log('um error aconteceu', error)
         res.writeHead(500);
         res.end(JSON.stringify({ message: "Alert! Database connection attempt failed before " + sqlQuery }));
     }
 
 
 }
 
 async function processPost(sqlQuery, postParams, res) {
 
     try {
       let conn = mysql.createConnection(mySqlConnParams);
       conn.query(sqlQuery, postParams, function (error, results) {
 
         console.log('post results:  ', results);

         if (error) {
           res.status(500).json(error);
         } else {
           if (results[0][0].code)
             res.status(results[0][0].code).json(results[0][0]);
           else 
             res.status(200).json(results[0][0]);
         }
       });
       conn.end();
     } catch (error) {
       console.log('um error aconteceu', error)
       res.writeHead(500);
       res.end(JSON.stringify({ message: "Alert! Database connection attempt failed before " + sqlQuery }));
     }
 
 }
 
 async function processPut(sqlQuery, putParams, res) {
 
   try {
    
     let conn = mysql.createConnection(mySqlConnParams);
       conn.query(sqlQuery, putParams, function (error, results) {

        console.log('put results:  ', results);

         if (error) {
           error.putQuery = sqlQuery;
           res.status(500).json(error);
         } else {
           res.status(200).json(results[0][0]);
         }
       });
       conn.end();
 
   } catch (error) {
     console.log('um error aconteceu', error)
     res.writeHead(500);
     res.end(JSON.stringify({ message: "Alert! Database connection attempt failed before " + sqlQuery }));
   }
 
 }
 
 async function processDelete(sqlQuery, deleteParams, res) {
   try {
     let conn = mysql.createConnection(mySqlConnParams);
     conn.query(sqlQuery, deleteParams, function (error, results, fields) {
 
       if (error) {
         error.putQuery = sqlQuery;
         res.status(500).json(error);
       } else {
         res.status(200).json(results[0][0]);
       }

       console.log(sqlQuery, deleteParams);

     });
     conn.end();
 
   } catch (error) {
     res.writeHead(500);
     res.end(JSON.stringify({ message: "Alert! Database connection attempt failed before " + sqlQuery }));
   }
 
 }
 
 
 function formatDate(date, xlmsDateFormat) {
 
   var formatedDate = '';
 
   switch (xlmsDateFormat) {
     case 'pt_br' :
       formatedDate = date.substring(6, 10) + "-" + date.substring(3, 5) + "-" + date.substring(0, 2);
       break;
     case 'es_es' :
       formatedDate = date.substring(6, 10) + "-" + date.substring(3, 5) + "-" + date.substring(0, 2);
       break;
     case 'es_es' :
       formatedDate = date;
       break;
     }
     
     return new Date(formatedDate) instanceof Date ? formatedDate : null;
 
 }
 
 function validatePayload(req, res, validationSchema) {

  const validData = validationSchema.validate(req.body);
  
  if (validData.error != null) {
    res.writeHead(403);
    res.end(JSON.stringify({ code   : 403,
              message: 'Provided data is invalid or not properly structured',
              payload: req.body,
              details: validData.error.details 
            }));
    return false;
  }
  return true;

 }