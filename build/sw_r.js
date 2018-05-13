'user strict'
const zlib        = require('zlib')
,     fs          = require('fs')
,     crypto      = require('crypto')
;
module.exports = x = { wbF  : async (c,cfg,env) =>  { const ws     = fs.createWriteStream(cfg.data + c + '.' + cfg.zip)
                                                    , readStream = new require('stream').Readable();
                                                    ;
                                                    readStream.push( JSON.stringify( env[c] ) );
                                                    readStream.push(null);
                                                    readStream
                                                    .pipe( zlib.createDeflate() )
                                                    .pipe( ws );
                                                    if (cfg.is_debug) console.log(`BACKUP wbF ${c} RECS ${env[c].length}`);
                                                    }
                    , rbf   : async (c,cfg,env) =>  { const readStream = fs.createReadStream(cfg.data + c + '.' + cfg.zip )
                                                    , writeStream    = new require('stream').Writable();
                                                    ;
                                                    let ldata         = []
                                                    ,   ldata_length  = 0
                                                    ;
                                                    writeStream.on('error',  ( e ) => console.log('ERROR WRITESTREAM',c,e));
                                                    writeStream.on('finish', (   ) => { let buf= new Buffer(ldata_length)
                                                                                      , pos=0;
                                                                                      for ( let i=0, len = ldata.length, pos = 0; i < len; i++) {
                                                                                      ldata[i].copy(buf, pos);
                                                                                      pos += ldata[i].length;
                                                                                      }
                                                                                      env[ c ] = JSON.parse( buf.toString() );
                                                                                      env[ '_all'][c ] = env[ c ].length;
                                                                                      if (cfg.is_debug) console.log(`Finish WRITESTREAM for ${c} LEN ${ldata_length} RECS ${env[c].length}`);
                                                                                      }
                                                                  );
                                                    writeStream.write = (d)=>{ ldata.push(d); ldata_length+=d.length; }
                                                    readStream
                                                    .pipe( zlib.createInflate() )
                                                    .pipe( writeStream          );
                                                    }
                    , rbfa  : async (cfg,env  ) =>  { await Promise.all ( cfg.tabs.map( async e => x.rbf(e,cfg,env) ) ) } //Einlesen aller deflate REST-DB-Files
                    , rdf   : async (cfg,env  ) => fs.readdir(cfg.app, (r,d) => d.forEach( (e,i) => fs.readFile(cfg.app+ e  , (err,data)=>{ if (err) throw err;
                                                                                                                                            let ckey=(cfg.is_fcrypt)?crypto
                                                                                                                                                     .createHmac('sha256',cfg.cert+Date.now()).update(e)
                                                                                                                                                     .digest('hex'):e;
                                                                                                                                            env['_file'][e]=ckey;
                                                                                                                                            //env['app'].push({_id:ckey,file:e,content:data.toString('hex')});
                                                                                                                                            env[ckey] = data/*zlib.createGzip(data)*/;
                                                                                                                                            if (cfg.is_debug) console.log(`fcrypt ${cfg.is_fcrypt} FILE ${e} loaded ${data.length} ${ckey}`)
                                                                                                                                          }
                                                                                                                )
                                                                                         )
                                                             )

}
