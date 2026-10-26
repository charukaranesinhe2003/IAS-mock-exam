'use strict';
(() => {
 const rules=[
 {id:'A',src:'Any',sp:'Any',dst:'10.1.0.1',dp:'Any',proto:'Any',action:'Deny'},
 {id:'B',src:'10.1.0.0/16',sp:'Any',dst:'10.2.12.12',dp:'Any',proto:'Any',action:'Deny'},
 {id:'C',src:'10.1.0.0/16',sp:'Any',dst:'Any',dp:80,proto:'TCP',action:'Allow'},
 {id:'D',src:'Any',sp:80,dst:'10.1.0.0/16',dp:'Any',proto:'TCP',action:'Allow'},
 {id:'E',src:'Any',sp:'Any',dst:'10.1.1.2',dp:25,proto:'TCP',action:'Allow'},
 {id:'F',src:'10.1.1.2',sp:25,dst:'Any',dp:'Any',proto:'TCP',action:'Allow'},
 {id:'G',src:'Any',sp:'Any',dst:'10.1.0.20',dp:80,proto:'TCP',action:'Allow'},
 {id:'H',src:'10.1.0.20',sp:80,dst:'Any',dp:'Any',proto:'TCP',action:'Allow'},
 {id:'I',src:'Any',sp:'Any',dst:'Any',dp:'Any',proto:'Any',action:'Deny'}];
 function ip(value){const parts=String(value).split('.');if(parts.length!==4||parts.some(x=>!/^\d{1,3}$/.test(x)||Number(x)>255))throw Error('Enter a valid IPv4 address.');return parts.reduce((a,x)=>(a*256+Number(x))>>>0,0);}
 function inNetwork(address,network){if(network==='Any')return true;const [base,bits='32']=network.split('/'),n=Number(bits);if(!Number.isInteger(n)||n<0||n>32)throw Error('Invalid network prefix.');const mask=n===0?0:(0xffffffff<<(32-n))>>>0;return(ip(address)&mask)===(ip(base)&mask);}
 function trace(packet,badOrder=false){ip(packet.src);ip(packet.dst);for(const p of [packet.sp,packet.dp])if(!Number.isInteger(Number(p))||Number(p)<0||Number(p)>65535)throw Error('Ports must be integers from 0 to 65535.');if(!['TCP','UDP'].includes(packet.proto))throw Error('Choose TCP or UDP for this packet exercise.');const ordered=badOrder?[rules[0],rules[2],rules[1],...rules.slice(3)]:rules;const steps=[];for(const r of ordered){const match=inNetwork(packet.src,r.src)&&inNetwork(packet.dst,r.dst)&&(r.proto==='Any'||r.proto===packet.proto)&&(r.sp==='Any'||Number(r.sp)===Number(packet.sp))&&(r.dp==='Any'||Number(r.dp)===Number(packet.dp));steps.push({id:r.id,matched:match});if(match)return{rule:r.id,action:r.action,steps,order:ordered.map(x=>x.id)};}return{rule:'Default',action:'Deny',steps};}
 const permissions={student:{results:['read'],notes:['read'],accounts:[]},lecturer:{results:['read','write'],notes:['read','write'],accounts:[]},admin:{results:[],notes:[],accounts:['manage']}};
 function access(user,resource,action,inScope=true){const rights=permissions[user]?.[resource]||[];return{allow:rights.includes(action)&&(resource!=='results'||inScope),rights,scopeRequired:resource==='results'};}
 function minutes(t){if(!/^\d{2}:\d{2}$/.test(t))throw Error('Use HH:MM times.');const [h,m]=t.split(':').map(Number);if(h>23||m>59)throw Error('Enter a valid same-day time.');return h*60+m;}
 function intervals(failure,alternate,restored){const a=minutes(failure),b=minutes(alternate),c=minutes(restored);if(a>b||b>c)throw Error('Use same-day times: failure ≤ alternate service ≤ full restoration.');return{interruption:b-a,alternate:c-b,total:c-a};}
 const duration=n=>`${Math.floor(n/60)?Math.floor(n/60)+' h ':''}${n%60||!n?n%60+' min':''}`.trim();
 const detection=(attack,alarm)=>attack?(alarm?'True Positive':'False Negative'):(alarm?'False Positive':'True Negative');
 const replay=(current,captured,used)=>captured===current&&!used;
 globalThis.IASGuideEngine={rules,trace,ip,inNetwork,access,permissions,intervals,duration,detection,replay};
})();
