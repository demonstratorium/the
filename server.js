'use strict'
// -----------------------------------------(internal) NODE-Modules -----
const http                                 = require('http')//('http2')('https')('http')
// -----------------------------------------(own) NODE-Modules ------
,     config                                = require('./package.json').config
,     rw                                    = require('./'+config.build+'sw_r')                // Module mit Promise für Lesen Schreiben von app/ und /data directory
,     rest                                  = require('./'+config.build+'sw_rest')
// -----------------------------------------(own) NODE-Modules ------
// --------------------------------------------------------------------
,     port                                  = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || config.webport
,     ipaddress                             = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP   || '*'
// --------------------------------------------------------------------
,     router                                = (req,res,data,config) => {
                                                let postdata = ''
                                                ;
                                                const method = req.method                                     //headers ['method'            ]
                                                ,     path   = req.url                                        //headers [ 'url'              ]
                                                ,     accenc = req.headers [ 'accept-encoding'  ]             //kann der response gezippt werden
                                                ,     reqenc = req.headers [ 'x-encoding' ]             //wurden req-data gezippt
                                                ,     brest  = /rest\//.test(  path )                         // RESTDB
                                                ,     bfrest = /rest\/_app\//.test(  path )                   // RESTDB
                                                ,     bevent = /event-source\//.test(  path )                 // EVENT-SOURCE
                                                ,     bfile  = !(brest||bevent)                               // FILE
                                                ,     arurl  = path.split('?')[0].split('/')                  // url als array
                                                ,     index  = arurl[(brest||bevent)?2:1]                     // /rest/name name [2]
                                                ,     bzip   = accenc && accenc.match(/\bdeflate\b/)
                                                ;
                                                console.log('ROUTER', req.headers['x-encoding'], req.headers['accept-encoding'],req.url,req.method);
                                                if (config.is_log) data['_log'].push({time:Date.now(),method:req.method,path:req.url,remote:req.connection.remoteAddress.split(':').pop()})

                                                //req.on('data',chunk=>postdata+=chunk);// OHNE ENCODINg
                                                let writeSStream   = new require('stream').Writable()
                                                ,   ldata         = []
                                                ,   ldata_length  = 0
                                                ;
                                                writeSStream.on('finish', (   ) => { let buf = new Buffer(ldata_length)
                                                                                  ,     pos = 0;
                                                                                  for ( let i=0, len = ldata.length, pos = 0; i < len; i++) {
                                                                                        ldata[i].copy(buf, pos);
                                                                                        pos += ldata[i].length;
                                                                                  }
                                                                                  postdata = buf.toString();
                                                                                  console.log('WRITESTREAM-FINISHED',buf.toString('hex').slice(0,100));
                                                                                  if (config.is_debug) console.log(`Finish WRITESSTREAM for LEN ${ldata_length} ${postdata.length} `);
                                                                                  res.setHeader('Access-Control-Allow-Origin','*');//2018-01-09
                                                                                  res.writeHead(200,{ 'content-encoding': 'deflate'
                                                                                                    , 'content-type'    : (  brest && (!bfrest) )?'application/json':'' //weil die pdf darstellung sonst nicht funzt, musste statt text/htm '' 2018-03-19
                                                                                                    });
                                                                                   let readStream  = new require('stream').Readable();
                                                                                   if ( bfile  ) { readStream.push( !data[ index ]?data[config.first]:data[ index ] ) } //wenn das File nicht existiert, dann startseite
                                                                                   if ( brest  ) { rest(config,method,arurl,data,readStream,postdata);}
                                                                                   if ( bevent ) {  }                                                                      //stream.end();
                                                                                   readStream.push(null);
                                                                                   if (bzip) readStream                                                                    // ENTSCHEIDUNG ÜBER ENCODING
                                                                                             .pipe(require('zlib').createDeflate())
                                                                                             //.pipe(require('crypz').createDeflate())
                                                                                             .pipe(res);
                                                                                   else      readStream
                                                                                             .pipe(res);

                                                                                  }
                                                              );
                                                              //writeSStream.on('end'  , (d)=>{ console.log('WRITESTREAM END' + d); });
                                                              //writeSStream.on('error', (d)=>{ console.log('WRITESTREAM ERROR'+d); });
                                                              writeSStream.write = (d)=>{ ldata.push(d); ldata_length+=d.length;/*console.log('WRITE',d);*/ }
                                                if ( reqenc && reqenc.match(/\bdeflate\b/) ) {console.log('wir haben ein deflate');
                                                                                             req
                                                                                             .pipe ( require('zlib').createInflate() )
                                                                                             .pipe ( writeSStream                  );}
                                                else                                         req
                                                                                             //.pipe ( require('zlib').createInflate() )
                                                                                             .pipe ( writeSStream                     );

                                                req.on('end',()=>{ if (config.is_debug) console.log(`REQONEND ${bfrest?'FREST':''}${bfile?'FILE':''}${brest?'REST':''}${bevent?'EVENT':''} [${method}] ${path}(${arurl.length}) index:${index} data.l:${postdata.length} zip:${bzip}`);
                                                                   /*res.setHeader('Access-Control-Allow-Origin','*');//2018-01-09
                                                                   res.writeHead(200,{ 'content-encoding': 'deflate'
                                                                                     , 'content-type'    : (  brest && (!bfrest) )?'application/json':'' //weil die pdf darstellung sonst nicht funzt, musste statt text/htm '' 2018-03-19
                                                                                     });
                                                                    let readStream  = new require('stream').Readable();
                                                                    if ( bfile  ) { readStream.push( !data[ index ]?data[config.first]:data[ index ] ) } //wenn das File nicht existiert, dann startseite
                                                                    if ( brest  ) { require('./'+config.build+'sw_rest')(config,method,arurl,data,readStream,postdata);}
                                                                    if ( bevent ) {  }                                                                      //stream.end();
                                                                    readStream.push(null);
                                                                    if (bzip) readStream                                                                    // ENTSCHEIDUNG ÜBER ENCODING
                                                                              .pipe(require('zlib').createDeflate())
                                                                              .pipe(res);
                                                                    else      readStream
                                                                              .pipe(res);
                                                                              */
                                                                }
                                                      )
                                              }
;
let   data                                  = { '_utc'     : {}
                                              , '_log'     : []
                                              , '_file'    : {}
                                              , '_app'     : []
                                              , '_all'     : {}
                                              , 'default'  : ' '                                              // SimulationVonMemchan
                                              , 'login'    : '<body>login <h3>sonst</h3> nix</body>'
                                              }                                                               // index environement fastkeine Unterschied zwischenmemcha und data
,     stime                                 = Date.now()
;
//if (config.is_data) rw.rbfa(config,data);                                                                //--Einlesen der REST_DB indizees
//if (config.is_app ) rw.rdf (config,data);                                                                //--Einlesen des FileSystems APP und speichern im MemCache
setInterval ( () => {                                                                                    //--Backup-System der Rest-RestApi
                     Object                                                                             //if (config.is_debug) console.log(`Backup_Interval ${stime} ${Object.entries(data['_utc'])}`);
                     .keys    ( data['_utc']                          )
                     .filter  ( e => data['_utc'][e] > stime          )
                     .forEach ( async e => await rw.wbF(e,config,data))
                     ;
                     stime        = Date.now();
                   },960000//config.backup_time
            );
http
.createServer(// { key  : require('fs').readFileSync( 'cert/'+config.cert+'.key.pem'    ), cert : require('fs').readFileSync( 'cert/'+config.cert+'.server.crt' )   },
               (req,res) => router(req,res,data,config)
             )
.listen( port
       , ipaddress
        ,()=>{if (config.is_debug) console.log(`listen on webport ${port} ${ipaddress}`)}
       )
;
