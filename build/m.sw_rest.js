'use strict';const filters={"eF":f=>v=>o=>o[f].toString()===v.toString(),"rF":f=>v=>o=>(new RegExp(v,'i')).test(o[f]),"NrF":f=>v=>o=>!(new RegExp(v,'i')).test(o[f]),"tF":f=>v=>o=>o[f],"NtF":f=>v=>o=>!o[f],"gF":f=>v=>o=>o[f]>=v,"lF":f=>v=>o=>o[f]<=v,"bF":f=>v=>o=>o[f]>=v.k&&o[f]<=v.g,"NbF":f=>v=>o=>o[f]<=v.k&&o[f]>=v.g,"iF":f=>a=>o=>(new RegExp(a.join('|'))).test(o[f]),"mfs":a=>b=>c=>a.reduce((a,d)=>a||new RegExp(b,'i').test(c[d].replace(/[<>;:\- ./\\]/g,'')),!1)},mfms=a=>(b,c)=>b.filter(filters.mfs(a)(c)),eof=s=>(t,e)=>{if(t.indexOf(e[s])===-1)t.push(e[s]);return t},fc=(t,e)=>t.filter(filters[e.f](e.k)(e.v)),as=a=>b=>a.reduce((a,c)=>{return a[c]=b[c],a},{}),icuv=(e,i)=>{e._id=e._id||'VSMC'+Date.now().toString(35)+i;e._ctime=e._ctime||Date.now();e._utime=Date.now();e._version=(e._version||0)+1;return e},bxpl=a=>{const A=a.map(e=>e||0).sort();return{min:A[0],q1:A[parseInt(A.length*0.25)],q5:A[parseInt(A.length*0.50)],mean:A.reduce((t,e,i,a)=>t+(e||0)/a.length,0),q7:A[parseInt(A.length*0.75)],max:A[A.length-1],l:A.length}};module.exports=(config,method,arurl,data,readStream,jpost)=>{const index=arurl[2],pjpost=jpost&&JSON.parse(jpost);if(config.is_debug)console.log(`-----------REST_${method}${arurl.length} ${index} ${data[index]&&data[index].length} ${jpost.slice(0,30)}`);switch(method){
  
  case 'GET':switch(arurl.length){
    
    case 3:if(index==='_cmd'){if(config.is_debug)console.log('Wir haben ein sfunc',pjpost.sfunc,pjpost.cmd);pjpost.sfunc&&Function.apply(null,pjpost.sfunc)(data,null);pjpost.cmd&&Function.apply(null,data.commands.filter(e=>e.cmd===pjpost.cmd)[0].sfunc)(data,null)}
else readStream.push(JSON.stringify((!data[index])?[{"no":"nothing"}]:data[index]));break;
    
    case 4:switch(arurl[3]){
      case '_first':readStream.push(JSON.stringify((!data[index])?[{"no":"nothing"}]:data[index][0]));break;
      case '_last':readStream.push(JSON.stringify((!data[index])?[{"no":"nothing"}]:data[index][data[index].length-1]));break;case '_first5':readStream.push(JSON.stringify((!data[index])?[{"no":"nothing"}]:data[index].slice(0,5)));break;
      case '_last5':readStream.push(JSON.stringify((!data[index])?[{"no":"nothing"}]:data[index].slice(-5)));break;
      case '_version5':readStream.push(JSON.stringify((!data[index])?[{"no":"nothing"}]:data[index].sort((a,b)=>b._version-a._version).slice(0,5)));break;
      case '_utime5':readStream.push(JSON.stringify((!data[index])?[{"no":"nothing"}]:data[index].sort((a,b)=>b._utime-a._utime).slice(0,5)));break;
      case '_filter':readStream.push(JSON.stringify((!data[index])?[{"no":"nothing"}]:pjpost.reduce(fc,data[index])));break;
      case '_combine':readStream.push(JSON.stringify((!data[index])?[{"no":"nothing"}]:pjpost.filter.reduce(fc,data[index]).map(as(pjpost.structure))));break;
      case '_structure':readStream.push(JSON.stringify((!data[index])?[{"no":"nothing"}]:data[index].map(as(pjpost))));break;
      case '_mcombine':readStream.push(JSON.stringify((!data[index])?[{"no":"nothing"}]:pjpost.searchvalues.split(' ').reduce(mfms(pjpost.searchfields),pjpost.filter.reduce(fc,data[index])).map(as(pjpost.structure))));break;
      
      default:if(index==='_cmd'){const content=data['commands'].filter(e=>e['cmd']===arurl[3]),file=JSON.stringify((content.length>0)?Function.apply(null,content[0].sfunc)(data,null):{});readStream.push(file);break}
if(index==='_app'){const content=data[index].filter(e=>e['_id']===arurl[3]),file=Buffer.from((content.length>0)?content[0]['content']:'20','hex').toString('utf8');readStream.push(file);break}}
break;case 5:readStream.push(JSON.stringify((!data[index])?[{"no":"nothing"}]:data[index].filter(e=>e[arurl[3]]===arurl[4])));break;default:readStream.push('{}');break}break;
  
  case 'POST':switch(arurl.length){
    case 3:if(index==='_bulk'){pjpost.forEach(e=>{if(!data[e.index])data[e.index]=[];data[e.index].push(icuv(e.row,0))})
pjpost.map(e=>e.index).forEach(E=>{data._utc[E]=Date.now();data._all[E]=data[E].length})}
else{if(!data[index])data[index]=[];data[index].push(icuv(pjpost,0));data._utc[index]=Date.now();data._all[index]=data[index].length}
readStream.push('{}');break;
    
    case 4:switch(arurl[3]){case '_summary':let erg=pjpost.reduce((t,e)=>{t[e]={};return t},{});readStream.push(JSON.stringify(data[index].reduce((T,E)=>{Object.keys(erg).forEach(A=>{T[A][E[A]]=(T[A][E[A]]||0)+1 });return T},erg)));break;
      
      case '_arfield':readStream.push(JSON.stringify((!data[ index ])?[{"no":"nothing"}]:pjpost['ar'].reduce((t,e)=>{t.push(data[index].filter(E=>E[pjpost['field']]===e)[0]);return t},[] )));break;
      
      case '_boxplot':let boxplot=pjpost.reduce((t,e)=>{t[e]=bxpl(data[index].map(E=>E[e]));return t},{});readStream.push(JSON.stringify(boxplot));break;
      
      case '_filter':readStream.push(JSON.stringify((!data[index])?[{"no":"nothing"}]:pjpost.reduce(fc,data[index])));break;
      
      case '_combine':readStream.push(JSON.stringify((!data[index])?[{"no":"nothing"}]:pjpost.filter.reduce(fc,data[index]).map(as(pjpost.structure))));break;
      
      case '_structure':readStream.push(JSON.stringify((!data[index])?[{"no":"nothing"}]:data[index].map(as(pjpost))));break;case '_mcombine':readStream.push(JSON.stringify((!data[index])?[{"no":"nothing"}]:pjpost.searchvalues.split(' ').reduce(mfms(pjpost.searchfields),pjpost.filter.reduce(fc,data[index])).map(as(pjpost.structure))));break;
      
      case '_bulk':if(!data[index])data[index]=[];pjpost.forEach(icuv);data[index]=data[index].concat(pjpost);data._utc[index]=Date.now();data._all[index]=data[index].length;break}
break;
    case 5:console.log(5,'POST',arurl[3],arurl[4]);switch(arurl[4]){case "raspc":console.log(5,'POST','raspc');require('./swSendUDP')(pjpost);break;case "mail":console.log(5,'POST','mail',pjpost);require('./swMailClient')(pjpost);break}
break;
    case 6:let pelem=data[index].filter(e=>e._id===arurl[3]);if(pelem.length===1){pelem[0][arurl[4]]=arurl[5];pelem[0]=icuv(pelem[0],0)}
break;default:readStream.push('{}');break}break;
  
  case 'PUT':switch(arurl.length){case 3:if(!data[index]){data[index]=[];data[index].push(icuv(pjpost,0))}
else{let pelem=data[index].filter(e=>e._id===pjpost._id);if(pelem.length===1){Object.keys(pjpost).forEach(e=>{pelem[0][e]=pjpost[e]});pelem[0]=icuv(pelem[0],0)}}
break;case 6:let pelem=data[index].filter(e=>e._id===arurl[3]);if(pelem.length===1){pelem[0][arurl[4]]=arurl[5];pelem[0]=icuv(pelem[0],0)}
break;case 4:if(!data[index]){data[index]=[]}
else{let pelem=data[index].filter(e=>e._id===arurl[3]);if(pelem.length===1){Object.keys(pjpost).forEach(e=>{pelem[0][e]=pjpost[e]});pelem[0]=icuv(pelem[0],0)}}
break}data._utc[index]=Date.now();break;
  
  case 'DELETE':switch(arurl.length){case 3:data[index]=[];break;case 4:switch(arurl[3]){case '_filter':data[index]=pjpost.reduce(fc,data[index]);break;case '_structure':pjpost.forEach(e=>{data[index].forEach(E=>E[e]&&delete E[e])});break;default:data[index]=data[index].filter(e=>e._id!==arurl[3])};break}
data._utc[index]=Date.now();break}}
