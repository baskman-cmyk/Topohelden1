(function(){
 'use strict';
 const lessons=window.TopoLessons?.lessons||[];
 const byId=id=>lessons.find(l=>l.id===id);
 const el=id=>document.getElementById(id);
 function tag(name,text,cls){const n=document.createElement(name);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n}
 function load(){
  const clean={progress:{},sessions:{}};
  try{
   const v=JSON.parse(localStorage.getItem('topo-geography-v1'));
   for(const l of lessons){
    const p=v?.progress?.[l.id],n=l.questions.length;
    if(p?.version===l.version&&Number.isSafeInteger(p.attempts)&&p.attempts>0&&Number.isSafeInteger(p.best)&&p.best>=0&&p.best<=n&&Number.isSafeInteger(p.last)&&p.last>=0&&p.last<=p.best)clean.progress[l.id]={version:l.version,attempts:p.attempts,best:p.best,last:p.last};
    const s=v?.sessions?.[l.id];
    if(s?.version===l.version&&['reading','quiz','result'].includes(s.phase)&&Number.isSafeInteger(s.step)&&s.step>=0&&s.step<=n&&Array.isArray(s.answers)&&s.answers.length===n&&s.answers.every((a,i)=>a===null||(Number.isInteger(a)&&a>=0&&a<l.questions[i].options.length))&&s.answers.slice(0,s.step).every(a=>a!==null)&&s.answers.slice(s.step+1).every(a=>a===null)&&((s.phase==='reading'&&s.step===0&&s.answers.every(a=>a===null))||(s.phase==='quiz'&&s.step<n)||(s.phase==='result'&&s.step===n&&s.answers.every(a=>a!==null))))clean.sessions[l.id]={version:l.version,phase:s.phase,step:s.step,answers:s.answers,recorded:s.phase==='result'&&s.recorded===true};
   }
  }catch{}
  return clean;
 }
 let state=load(),currentId=null;
 function save(){try{localStorage.setItem('topo-geography-v1',JSON.stringify(state));el('geographyStorageNotice').hidden=true}catch{el('geographyStorageNotice').hidden=false}}
 function fresh(l){return {version:l.version,phase:'reading',step:0,answers:Array(l.questions.length).fill(null),recorded:false}}
 function result(l,s){return s.answers.reduce((n,a,i)=>n+(a===l.questions[i].answer?1:0),0)}
 function renderOverview(grade){
  const host=el('geographyLessons');host.replaceChildren();
  const list=lessons.filter(l=>l.grade===grade);
  for(const l of list){
   const card=tag('div',undefined,'panel lesson-card');card.append(tag('h2',l.title),tag('p',l.goal));
   const p=state.progress[l.id],s=state.sessions[l.id];
   card.append(tag('p',p?'Beste resultaat: '+p.best+' van '+l.questions.length+' goed · '+p.attempts+' afgeronde reeks(en)':'Nog geen reeks afgerond','small muted'));
   const b=tag('button',s&&s.phase!=='result'?'Ga verder':'Open les','primary');b.onclick=()=>open(l.id);card.append(b);host.append(card);
  }
  const done=list.filter(l=>state.progress[l.id]).length;
  el('dashboardGeography').textContent='Aardrijkskunde: '+done+' van '+list.length+' lessen geoefend in groep '+grade+'.';
 }
 function diagram(host){
  const box=tag('figure',undefined,'lesson-map');box.setAttribute('aria-label','Oefenkaart met noord boven: school ten noorden van het huis, vijver ten oosten en park ten zuidwesten.');
  box.append(tag('p','↑ N · Noord is op deze oefenkaart boven','small'));
  const grid=tag('div',undefined,'lesson-map-grid');
  for(const text of ['', '■ School', '', '', '⌂ Huis', '■ Vijver', '● Park', '', ''])grid.append(tag('div',text));
  grid.children[1].className='map-school';grid.children[5].className='map-water';grid.children[6].className='map-park';box.append(grid);
  box.append(tag('figcaption','Legenda: rood vierkant = school · blauw vierkant = vijver · groen rondje = park. Dit is een bedachte oefenkaart.','small'));host.append(box);
 }
 function open(id){
  const l=byId(id);if(!l)return;
  currentId=id;if(!state.sessions[id])state.sessions[id]=fresh(l);save();show('lesson');render();
 }
 function render(){
  const l=byId(currentId);if(!l)return;
  const s=state.sessions[currentId],body=el('lessonBody');body.replaceChildren();
  el('lessonTitle').textContent=l.title;el('lessonSubtitle').textContent='Groep '+l.grade+' · '+l.goal;
  if(s.phase==='reading'){
   body.append(tag('h2','Dit ga je leren'),tag('p',l.goal,'lesson-goal'));
   for(const p of l.paragraphs)body.append(tag('p',p));
   if(l.diagram==='map')diagram(body);
   const terms=tag('dl',undefined,'lesson-terms');for(const [word,meaning] of Object.entries(l.terms))terms.append(tag('dt',word),tag('dd',meaning));body.append(terms);
   const details=tag('details'),summary=tag('summary','Bronnen en verantwoording');details.append(summary,tag('p','Eigen uitleg en oefenvragen van Topohelden. De onderstaande bronnen zijn gebruikt voor controle van de feiten. De groepsindeling is een voorstel.','small'));
   for(const src of l.sources){const a=tag('a',src.title);a.href=src.url;a.target='_blank';a.rel='noopener noreferrer';const p=tag('p');p.append(a);details.append(p)}body.append(details);
   const b=tag('button','Start de '+l.questions.length+' vragen','primary');b.onclick=()=>begin();body.append(b);
  }else if(s.phase==='quiz'){
   const q=l.questions[s.step],chosen=s.answers[s.step];
   body.append(tag('p','Vraag '+(s.step+1)+' van '+l.questions.length+' · '+(q.type==='boolean'?'Waar of niet waar':'Kies het beste antwoord'),'small muted'));
   const meter=tag('div',undefined,'progress'),fill=tag('div');fill.style.width=100*s.step/l.questions.length+'%';meter.append(fill);body.append(meter,tag('h2',q.prompt));
   if(l.diagram==='map')diagram(body);
   const answers=tag('div',undefined,'lesson-options');
   const order=q.type==='boolean'?q.options.map((_,i)=>i):shuffle(q.options.map((_,i)=>i));
   for(const index of order){const b=tag('button',q.options[index],'lesson-answer');b.disabled=chosen!==null;b.setAttribute('aria-pressed',String(chosen===index));b.onclick=()=>answer(index);if(chosen!==null&&index===q.answer)b.classList.add('correct');if(chosen===index&&chosen!==q.answer)b.classList.add('incorrect');answers.append(b)}body.append(answers);
   if(chosen!==null){const feedback=tag('p',(chosen===q.answer?'✓ Goed. ':'Nog niet. Het juiste antwoord is: '+q.options[q.answer]+'. ')+q.explanation,'lesson-feedback');feedback.setAttribute('role','status');body.append(feedback);const next=tag('button',s.step===l.questions.length-1?'Bekijk resultaat':'Volgende vraag','primary');next.onclick=()=>advance();body.append(next)}
  }else{
   finish(l,s);body.append(tag('h2',result(l,s)+' van '+l.questions.length+' goed'),tag('p','Dit is een oefenresultaat, geen cijfer voor een toets.'));
   for(let i=0;i<l.questions.length;i++)if(s.answers[i]!==l.questions[i].answer){const q=l.questions[i],card=tag('div',undefined,'lesson-review');card.append(tag('strong',q.prompt),tag('p','Jouw antwoord: '+q.options[s.answers[i]]),tag('p','Juist: '+q.options[q.answer]),tag('p',q.explanation));body.append(card)}
   if(result(l,s)===l.questions.length)body.append(tag('p','Alles goed in deze reeks. Je kunt later opnieuw oefenen.'));
   const again=tag('button','Les opnieuw bekijken','secondary');again.onclick=()=>restart();body.append(again);
  }
 }
 function begin(){const s=state.sessions[currentId];if(!s||s.phase!=='reading')return;s.phase='quiz';save();render()}
 function answer(index){const l=byId(currentId),s=state.sessions[currentId];if(!l||s?.phase!=='quiz'||s.answers[s.step]!==null||!Number.isInteger(index)||index<0||index>=l.questions[s.step].options.length)return;s.answers[s.step]=index;save();render()}
 function advance(){const l=byId(currentId),s=state.sessions[currentId];if(!l||s?.phase!=='quiz'||s.answers[s.step]===null)return;s.step++;if(s.step===l.questions.length)s.phase='result';save();render()}
 function finish(l,s){if(s.recorded)return;const score=result(l,s),old=state.progress[l.id];state.progress[l.id]={version:l.version,attempts:(old?.attempts||0)+1,best:Math.max(old?.best||0,score),last:score};s.recorded=true;save();renderOverview(activeGrade)}
 function restart(){const l=byId(currentId);if(!l)return;state.sessions[currentId]=fresh(l);save();render()}
 function renderProgress(grade){const host=el('geographyProgress');host.replaceChildren();host.append(tag('h2','Aardrijkskunde · groep '+grade));for(const l of lessons.filter(l=>l.grade===grade)){const p=state.progress[l.id];host.append(tag('p',l.title+': '+(p?'beste resultaat '+p.best+'/'+l.questions.length+' · laatst '+p.last+'/'+l.questions.length:'nog niet afgerond')))}}
 window.GeographyApp={renderOverview,renderProgress,open,begin,answer,advance,restart};
 renderOverview(activeGrade);
})();
