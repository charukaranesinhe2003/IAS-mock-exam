'use strict';
(() => {
 const shuffle=(a,rng=Math.random)=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 function diverse(pool,count,rng=Math.random){
  const groups=new Map();for(const q of shuffle(pool,rng)){if(!groups.has(q.week))groups.set(q.week,[]);groups.get(q.week).push(q);}
  const result=[];while(result.length<count){const weeks=shuffle([...groups.keys()].filter(w=>groups.get(w).length),rng);if(!weeks.length)throw Error('Not enough questions for this practice paper.');for(const w of weeks){result.push(groups.get(w).pop());if(result.length===count)break;}}return result;
 }
 function validatePaper(paper){
  const expected={1:[35,35],2:[11,43],3:[3,22]};
  if(new Set(paper.map(q=>q.id)).size!==49||paper.length!==49)throw Error('A mock must have 49 unique questions.');
  for(const [part,[count,marks]] of Object.entries(expected)){const qs=paper.filter(q=>q.part===Number(part));if(qs.length!==count||qs.reduce((s,q)=>s+q.marks,0)!==marks)throw Error('Mock section total does not match the confirmed notice.');}
  return true;
 }
 function generate(bank,rng=Math.random){
  const p1=['single','multi','blank'].flatMap((format,i)=>diverse(bank.filter(q=>q.part===1&&q.format===format),[21,7,7][i],rng));
  const p2=[...diverse(bank.filter(q=>q.part===2&&q.marks===4),10,rng),...diverse(bank.filter(q=>q.part===2&&q.marks===3&&['multi','blank','single'].includes(q.format)),1,rng)];
  const sevens=diverse(bank.filter(q=>q.part===3&&q.marks===7),2,rng),used=new Set(sevens.map(q=>q.week));
  const eights=diverse(bank.filter(q=>q.part===3&&q.marks===8&&!used.has(q.week)),1,rng);
  const paper=[...shuffle(p1,rng),...shuffle(p2,rng),...sevens,...eights];validatePaper(paper);return paper;
 }
 const normalize=v=>String(v??'').normalize('NFKC').toLowerCase().trim().replace(/\s+/g,' ').replace(/[.!?]+$/,'');
 function grade(q,response={}){
  if(q.format==='single'||q.format==='multi'){
   const selected=response.selected||[],expected=[...q.correct].sort((a,b)=>a-b),got=[...new Set(selected)].sort((a,b)=>a-b);
   const correct=got.length===selected.length&&expected.length===got.length&&expected.every((n,i)=>got[i]===n);
   return{auto:true,correct,score:correct?q.marks:0,max:q.marks};
  }
  if(q.format==='blank'){
   const numeric=v=>{const s=normalize(v).replace(/,/g,'');return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)?Number(s):null;};
   const given=normalize(response.text),value=numeric(given);
   const correct=q.accepted.some(v=>normalize(v)===given||(value!==null&&numeric(v)!==null&&value===numeric(v)));
   return{auto:true,correct,score:correct?q.marks:0,max:q.marks};
  }
  return{auto:false,score:null,max:q.marks};
 }
 const answered=(q,r)=>Boolean(r&&(q.format==='single'||q.format==='multi'?(r.selected||[]).length:String(r.text||'').trim()));
 globalThis.IASMockEngine={shuffle,diverse,generate,validatePaper,grade,normalize,answered};
})();
