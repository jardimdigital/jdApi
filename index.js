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

  var httpsAvailable = fs.existsSync('./https/comodo')
  var httpsServerOptions;

  if (httpsAvailable) {
    var httpsServerOptions = {
      cert: fs.readFileSync(__dirname + '/https/comodo/newgardenadmin_com.crt'),
      key: fs.readFileSync(__dirname + '/https/comodo/newgardenadmin_com.key'),
      ca: fs.readFileSync(__dirname + '/https/comodo/newgardenadmin_com.ca-bundle')
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
 
 console.log('accessControlAllowOrigin ', config.accessControlAllowOrigin);

 // Add headers
 
 app.use(function (req, res, next) {
 
  console.log('passing app.use for CORS');

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


 var corsOptions = {
   
  origin: function (origin, callback) {
    console.log(whitelist)
    if (whitelist !=  undefined && whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }

 }

 app.options('*', cors(corsOptions));
 
 app.use(express.json()); // for parsing application/json
 app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencode
 //  app.use(rateLimiter); // redis config params
 app.use(authenticateToken);
 
 const multer = require('multer');
 const { string } = require('joi');
 const { json } = require('express');
 
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
 

 // For Express routes
 function authenticateToken(req, res, next) {
 console.log(req.path)
   if ('/createToken,/login/'.indexOf(req.path) === -1) {

     const authHeader = req.headers['authorization'];
     const token = authHeader && authHeader.split(' ')[1];
 
     if (token == null) 
         return res.status(401).json({ code: 401,
                                       message: 'Token was not provided' });
     
     jwt.verify(token, configEnv.get('jwtPrivateKey'), (err, tokenPayload) => {
       if (err) return res.status(401).json(err);
 
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
     let conn = mysql.createConnection(mySqlConnParams);
     tokens.createToken(req, res, conn);
     conn.end();
   } catch (error) {
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
 const veiculos             = require(__dirname + '/routers/veiculos');
 const compromissos         = require(__dirname + '/routers/compromissos');
 const compromissoItens     = require(__dirname + '/routers/compromissoItens');
 const compromissoRecursos  = require(__dirname + '/routers/compromissoRecursos');
 const usuarios             = require(__dirname + '/routers/usuarios');
 const menus                = require(__dirname + '/routers/menus');
 const ordensServico        = require(__dirname + '/routers/ordensServico');
 
 
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
});

app.get('/profissionais/compromisso/:compromisso', (req, res) => {
  profissionais.getAgenda(req, res, (sqlQuery, params) => {
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
        processPost(sqlQuery, params, res);
    });
})

app.post('/profissionais/agenda', (req, res) => {
  if (validatePayload(req, res, profissionais.validationSchemaAgenda))
    profissionais.postAgenda(req, res, (sqlQuery, params) => {
        processPost(sqlQuery, params, res);
    });
})

app.post('/profissionais/grupoAgenda', (req, res) => {
    profissionais.postGrupoAgenda(req, res, (sqlQuery, params) => {
        processPost(sqlQuery, params, res);
    });
})

app.put('/profissionais', (req, res) => {
  if (validatePayload(req, res, profissionais.validationSchema))
    profissionais.put(req, res, (sqlQuery, params) => {
      processPut(sqlQuery, params, res);
  });
})

app.put('/profissionais/agenda', (req, res) => {
  if (validatePayload(req, res, profissionais.validationSchemaAgenda))
      profissionais.putAgenda(req, res, (sqlQuery, params) => {
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

app.get('/servicos/recursos/:idServico', (req, res) => {
  params = { idServico: req.params.idServico }
  sqlQuery = 'CALL lerRecursosServico(:idServico);';
  processGetRequest(sqlQuery, params, res);
})


app.post('/servicos', (req, res) => {
  if (validatePayload(req, res, servicos.validationSchema))
    servicos.post(req, res, (sqlQuery, params) => {
        processPut(sqlQuery, params, res);
    });
})

app.post('/servicos/recursos', (req, res) => {
  servicos.postRecursosServicos(req, res, (sqlQuery, params) => {
      processPost(sqlQuery, params, res);
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
 
 app.get('/recursos/ativos', (req, res) => {
  sqlQuery = 'CALL lerRecursosAtivos();'
  processGetRequest(sqlQuery, {}, res);
})

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


 // VEICULOS  ------------------------------------------------------------------------------------- //
 
 app.get('/veiculos/ativos', (req, res) => {
  sqlQuery = 'CALL lerVeiculosAtivos();'
  processGetRequest(sqlQuery, {}, res);
})

 app.get('/veiculos/:nomeVeiculo', (req, res) => {
  veiculos.get(req, res, (sqlQuery, params) => {
    processGetRequest(sqlQuery, params, res);
  })
})

app.post('/veiculos', (req, res) => {
  if (validatePayload(req, res, veiculos.validationSchema))
    veiculos.post(req, res, (sqlQuery, params) => {
        processPut(sqlQuery, params, res);
    });
})

app.put('/veiculos', (req, res) => {
  
  if (validatePayload(req, res, veiculos.validationSchema))
    veiculos.put(req, res, (sqlQuery, params) => {
      processPut(sqlQuery, params, res);
  });
})

app.delete('/veiculos/:idVeiculo', (req, res) => {
  veiculos.delete(req, res, (sqlQuery, params) => {
      processDelete(sqlQuery, params, res);
  });
})

//  MANUTENCOES -----------------------------------------------------------------------------

app.get('/manutencoes/:dataInicial/:dataFinal', (req, res) => {
  sqlQuery = 'CALL lerAgendasPendentes(:dataInicial, :dataFinal);'
  params = { dataInicial: req.params.dataInicial, dataFinal: req.params.dataFinal}
  processGetRequest(sqlQuery, params, res);
})

app.get('/manutencoes/:idCliente', (req, res) => {
  const params =  { idCliente: req.params.idCliente };
  sqlQuery = 'CALL lerCompromissosPendentes(:idCliente, null);'
  processGetRequest(sqlQuery, params, res);
})



 // COMPROMISSOS  ------------------------------------------------------------------------------------- //
 
app.get('/compromissos', (req, res) => {
  sqlQuery = 'CALL lerCompromissos(NULL, NULL);'
  processGetRequest(sqlQuery, null, res);
});

app.get('/compromissos/status', (req, res) => {
  const params = { status: req.query.status }
  processGetRequest('CALL lerCompromissosPorStatus(:status)', params, res);
});

app.get('/compromissos/:idCliente', (req, res) => {
  sqlQuery = 'CALL lerCompromissos(:idCliente, NULL);'
  processGetRequest(sqlQuery, {idCliente: req.params.idCliente}, res);
})

app.get('/compromissos/:idCliente/:idCompromisso', (req, res) => {
  compromissos.get(req, res, (sqlQuery, params) => {
    processGetRequest(sqlQuery, params, res);
  })
})

app.get('/compromisso/impressao/:idCompromisso', (req, res) => {
  compromissos.getImpressao(req, res, (sqlQuery, params) => {
    console.log(params)
    processGetRequest(sqlQuery, params, res, true);
  })
})

app.get('/compromisso/status', (req, res) => {
  sqlQuery = 'CALL lerStatusCompromisso();'
  processGetRequest(sqlQuery, null, res);
})

app.post('/compromissos', (req, res) => {
  if (validatePayload(req, res, compromissos.validationSchema))
    compromissos.post(req, res, (sqlQuery, params) => {
        processPost(sqlQuery, params, res);
    });
})

app.put('/compromissos', (req, res) => {
  
  if (validatePayload(req, res, compromissos.validationSchema))
    compromissos.put(req, res, (sqlQuery, params) => {
      processPut(sqlQuery, params, res);
  });
});


app.put('/compromisso/alteraStatus', (req, res) => {

  let sqlQuery = 'CALL compromissoAlteraStatus(:idCompromisso, :status, :observacoes, :user);'
  let params = req.body;
  
  processPut(sqlQuery, params, res);

});

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
  if (validatePayload(req, res, compromissoItens.validationSchema))
    compromissoItens.put(req, res, (sqlQuery, params) => {
      processPut(sqlQuery, params, res);
  });
})

app.put('/compromissoItens/ajustes', (req, res) => {

    let sqlQuery = 'CALL compromissoItensAjustar(:idCompromissoItem, :qtdeAjustada, :valorAjustado, :observacoes, :user);'
    let params = req.body;
    
    processPut(sqlQuery, params, res);
  });

app.delete('/compromissoItens/:idCompromissoItem', (req, res) => {
  compromissoItens.delete(req, res, (sqlQuery, params) => {
      processDelete(sqlQuery, params, res);
  });
})

 // COMPROMISSO RECURSOS  ---------------------------------------------------------------------------- //
 
 app.get('/compromissoRecursos/:idCompromisso', (req, res) => {
  compromissoRecursos.get(req, res, (sqlQuery, params) => {
    processGetRequest(sqlQuery, params, res);
  })
})

app.post('/compromissoRecursos', (req, res) => {

  if (validatePayload(req, res, compromissoRecursos.validationSchema))
    compromissoRecursos.post(req, res, (sqlQuery, params) => {
        processPost(sqlQuery, params, res);
    });
})

app.put('/compromissoRecursos', (req, res) => {
  
  if (validatePayload(req, res, compromissoRecursos.validationSchema))
    compromissoRecursos.put(req, res, (sqlQuery, params) => {
      processPut(sqlQuery, params, res);
  });
})

app.delete('/compromissoRecursos/:idCompromissoRecurso', (req, res) => {
  compromissoRecursos.delete(req, res, (sqlQuery, params) => {
      processDelete(sqlQuery, params, res);
  });
})

 // USUARIOS ------------------------------------------------------------------------------------- //
 
  app.get('/usuarios/:nomeUsuario', (req, res) => {
    usuarios.get(req, res, (sqlQuery, params) => {
      processGetRequest(sqlQuery, params, res);
    })
  })

  app.post('/usuarios', (req, res) => {
    if (validatePayload(req, res, usuarios.validationSchema))
      usuarios.post(req, res, (sqlQuery, params) => {
          processPut(sqlQuery, params, res);
      });
  })

  app.put('/usuarios', (req, res) => {
    if (validatePayload(req, res, usuarios.validationSchema))
      usuarios.put(req, res, (sqlQuery, params) => {
        processPut(sqlQuery, params, res);
    });
  })

  app.delete('/usuarios/:idUsuario', (req, res) => {
    usuarios.delete(req, res, (sqlQuery, params) => {
        processDelete(sqlQuery, params, res);
    });
  })


  app.get('/gruposAcessos', (req, res) => {
    sqlQuery = 'CALL lerGruposAcesso();'
    processGetRequest(sqlQuery, {}, res);
})

 // LOGIN  -------------------------------------------------------------------------------------- //
 
 app.post('/login', (req, res) => {
 
  const sqlQuery = "CALL autenticaUsuario(:login, :senha);";
  processPost(sqlQuery, req.body, res);

 });
 
  // WEATHER  -------------------------------------------------------------------------------------- //
 
  app.get('/weather/:today/:hour/:startDate/:endDate', (req, res) => {
    const sqlQuery = "CALL lerWeatherInfo(:today, :hour, :startDate, :endDate);";
    const params = { today: req.params.today, hour: req.params.hour, startDate: req.params.startDate, endDate: req.params.endDate };
    processGetRequest(sqlQuery, params, res);
  });

  app.post('/weather', (req, res) => {
    const sqlQuery = "CALL weatherCriar(:date, :hour, :weatherInfo);";
    processPost(sqlQuery, req.body, res);
  });




 // USUARIOS ------------------------------------------------------------------------------------- //
 
app.get('/menus/grupos', (req, res) => {
  menus.getGrupos(req, res, (sqlQuery, params) => {
    processGetRequest(sqlQuery, params, res);
  })
});


app.get('/menus/opcoesGrupos', (req, res) => {
  menus.getOpcoesGrupos(req, res, (sqlQuery, params) => {
    processGetRequest(sqlQuery, params, res);
  })
});

app.post('/grupoAcessos', (req, res) => {
  if (validatePayload(req, res, menus.grupoValidationSchema))
    menus.post(req, res, (sqlQuery, params) => {
        processPut(sqlQuery, params, res);
    });
});

app.put('/grupoAcessos', (req, res) => {
  if (validatePayload(req, res, menus.grupoValidationSchema))
    menus.put(req, res, (sqlQuery, params) => {
      processPut(sqlQuery, params, res);
  });
});

app.delete('/grupoAcessos/:idGrupoAcesso', (req, res) => {
  menus.delete(req, res, (sqlQuery, params) => {
      processDelete(sqlQuery, params, res);
  });
});


app.get('/gruposAcessos', (req, res) => {
  sqlQuery = 'CALL lerGruposAcesso();'
  processGetRequest(sqlQuery, {}, res);
});

// -- Opcoes Menu -------------------------------------------------------------------------------------- //


app.get('/menus/opcoes', (req, res) => {
  menus.getOpcoesMenu(req, res, (sqlQuery, params) => {
    processGetRequest(sqlQuery, params, res);
  })
});

app.post('/menus', (req, res) => {
  if (validatePayload(req, res, menus.menuValidationSchema))
    menus.postOpcaoMenu(req, res, (sqlQuery, params) => {
        processPut(sqlQuery, params, res);
    });
});

app.put('/menus', (req, res) => {
  if (validatePayload(req, res, menus.menuValidationSchema))
    menus.putOpcaoMenu(req, res, (sqlQuery, params) => {
      processPut(sqlQuery, params, res);
  });
});

app.delete('/menus/:idOpcaoMenu', (req, res) => {
  menus.deleteOpcaoMenu(req, res, (sqlQuery, params) => {
      processDelete(sqlQuery, params, res);
  });
});


// -- Ordens Servico -------------------------------------------------------------------------------------- //

  app.get('/ordensServico', (req, res) => {
    ordensServico.get(req, res, (sqlQuery, params) => {
      processGetRequest(sqlQuery, params, res);
    })
  });
  
  app.get('/ordemServico/inexiste', (req, res) => {
    const params = { idOrdemServico: req.query.idOrdemServico }
    console.log(params)
    processGetRequest('CALL numeroOSInexistente(:idOrdemServico)', params, res);
  });
  

  app.post('/ordensServico', (req, res) => {
    if (validatePayload(req, res, ordensServico.validationSchema))
      ordensServico.post(req, res, (sqlQuery, params) => {
          processPut(sqlQuery, params, res);
      });
  });
  
  app.put('/ordemServico/aprova', (req, res) => {
      ordensServico.putAprovaOS(req, res, (sqlQuery, params) => {
      processPut(sqlQuery, params, res);
    });
  });
  
  app.put('/ordemServico/cancela', (req, res) => {
    ordensServico.putCancelaOS(req, res, (sqlQuery, params) => {
    processPut(sqlQuery, params, res);
  });
});

  app.put('/ordensServico', (req, res) => {
    if (validatePayload(req, res, ordensServico.validationSchema))
      ordensServico.put(req, res, (sqlQuery, params) => {
        processPut(sqlQuery, params, res);
    });
  });
  

  app.delete('/ordensServico/:idOrdemServico', (req, res) => {
    ordensServico.delete(req, res, (sqlQuery, params) => {
        processDelete(sqlQuery, params, res);
    });
  });

  // -- Itens Ordens Servico --------------------------------------------------------------------------------- //

  app.get('/ordensServico/itensOS/:idOrdemServico', (req, res) => {
    ordensServico.getItensOS(req, res, (sqlQuery, params) => {
      processGetRequest(sqlQuery, params, res);
    })
  });

  app.post('/ordensServico/itemOS', (req, res) => {
    if (validatePayload(req, res, ordensServico.validationSchemaItem))
      ordensServico.postItemOS(req, res, (sqlQuery, params) => {
          processPut(sqlQuery, params, res);
      });
  });
  
  app.put('/ordensServico/itemOS', (req, res) => {
    if (validatePayload(req, res, ordensServico.validationSchemaItem))
      ordensServico.putItemOS(req, res, (sqlQuery, params) => {
        processPut(sqlQuery, params, res);
    });
  });
  
  app.delete('/ordensServico/itemOS/:idOrdemServico', (req, res) => {
    ordensServico.deleteItemOS(req, res, (sqlQuery, params) => {
        processDelete(sqlQuery, params, res);
    });
  });

 // ------------------------------------------------------------------------------------------
 //
 // ---- SUPPORT FUNCTIONS  ------------------------------------------------------------------
 //
 // ------------------------------------------------------------------------------------------

 async function processGetRequest(sqlQuery, paramsObject, res, returnAll = false) {
 
     try {
 
       let conn = mysql.createConnection(mySqlConnParams);
       conn.query(sqlQuery, paramsObject, function (error, results) {
 
         if (error || results === undefined) {
           res.writeHead(500);
           res.end(JSON.stringify({ message: "Error: An unexpected error occured while getting " + sqlQuery }))
           console.log(error);
         } else if (results[0] === undefined || results[0].length === 0) {
           res.status(204).json([]);
         } else {
            returnAll === true ? res.json(results) : res.json(results[0]);
            console.log(results)
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

        if (error || results === undefined) { res.status(500).json(error); return; }

        if (results[0].length === 0) { res.status(204).json([]); return; }
         
        if (results[0][0].code) { res.status(results[0][0].code).json(results[0][0]); return; }
        
        console.log(results)
        if (Array.isArray(results[0]) && Array.isArray(results[0][0])) {
          res.status(200).json(results[0])  // return array 
          return;
        }

        res.status(200).json(results[0][0]);  // return object

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
    
    console.log(sqlQuery, putParams)
     let conn = mysql.createConnection(mySqlConnParams);

       conn.query(sqlQuery, putParams, function (error, results) {

        if (error || results === undefined) { res.status(500).json(error); return; }

        if (results[0].length === 0) { res.status(204).json([]); return; }
         
        if (results[0][0].code) { res.status(results[0][0].code).json(results[0][0]); return; }
        
        if (Array.isArray(results[0]) && Array.isArray(results[0][0])) {
          res.status(200).json(results[0])  // return array 
          return;
        }

        res.status(200).json(results[0][0]);  // return object

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
       if (error || results === undefined) {
         res.status(500).json(error);
       } else {
         res.status(200).json(results[0][0]);
       }
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
    res.writeHead(412);
    res.end(JSON.stringify({ code   : 412,
              message: 'A estrutura ou valores dos dados fornecidos é inválida.',
              payload: req.body,
              details: validData.error.details 
            }));
    return false;
  }
  return true;

 }