(function(){
 'use strict';
 const appStorage=window.TopoStorage||localStorage;
 const lessons=window.TopoLessons?.lessons||[];
 const byId=id=>lessons.find(l=>l.id===id);
 const el=id=>document.getElementById(id);
 function tag(name,text,cls){const n=document.createElement(name);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n}
 function load(){
  const clean={progress:{},sessions:{}};
  try{
   const v=JSON.parse(appStorage.getItem('topo-geography-v1'));
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
 function save(){try{appStorage.setItem('topo-geography-v1',JSON.stringify(state));el('geographyStorageNotice').hidden=true}catch{el('geographyStorageNotice').hidden=false}}
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
 function thematicMaps(host){
  const data=[['Overzichtskaart','Plaatsen, rivier en zonegrens'],['Bevolkingskaart','Licht = 10; donker = 100 inwoners per km²']];
  for(const [index,[title,legend]]of data.entries()){
   const fig=tag('figure',undefined,'thematic-map');fig.append(tag('h3',title));
   const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 440 210');svg.setAttribute('role','img');svg.setAttribute('aria-label',title+'. West links en Oost rechts; beide zones 100 km². De rivier loopt in beide kaarten onder de plaatsen langs. '+legend);
   const add=(name,attrs,text)=>{const n=document.createElementNS(svg.namespaceURI,name);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);if(text)n.textContent=text;svg.append(n)};
   add('rect',{x:10,y:10,width:210,height:185,fill:index?'#d9e8fb':'#ecf2de',stroke:'#263e56'});add('rect',{x:220,y:10,width:210,height:185,fill:index?'#355a94':'#ecf2de',stroke:'#263e56'});
   add('path',{d:'M10 160 C100 115 125 185 210 155 S340 120 430 160',fill:'none',stroke:'#1685af','stroke-width':7});
   add('text',{x:30,y:40,fill:'#14293f','font-size':18},index?'West · 10 / km²':'Zone West');add('text',{x:235,y:40,fill:index?'white':'#14293f','font-size':18},index?'Oost · 100 / km²':'Zone Oost');
   for(const[x,label]of [[75,'Plaats A'],[280,'Plaats B']]){add('circle',{cx:x,cy:85,r:6,fill:index?'#fff':'#263e56',stroke:'#14293f'});add('text',{x:x-35,y:115,fill:index&&x>220?'white':'#14293f','font-size':16},label)}
   fig.append(svg,tag('figcaption',legend+' · N ↑ · bedachte voorbeeldgegevens, geen echte landkaart.','small'));host.append(fig);
  }
  const table=tag('table');const caption=tag('caption','Dezelfde voorbeeldgegevens in een tabel');table.append(caption);const head=tag('thead'),row=tag('tr');for(const text of ['Zone','Oppervlakte','Inwoners','Dichtheid']){const th=tag('th',text);th.scope='col';row.append(th)}head.append(row);const body=tag('tbody');for(const values of [['West','100 km²','1.000','10 / km²'],['Oost','100 km²','10.000','100 / km²']]){const row=tag('tr');for(const text of values)row.append(tag('td',text));body.append(row)}table.append(head,body);host.append(table);
 }
 function open(id){
  const l=byId(id);if(!l)return;
  currentId=id;if(!state.sessions[id])state.sessions[id]=fresh(l);save();show('lesson');render();
 }
 function render(){
  const l=byId(currentId);if(!l)return;const s=state.sessions[currentId],body=el('lessonBody');if(s.phase==='reading'){s.phase='quiz';save()}body.replaceChildren();el('lessonTitle').textContent=l.title;el('lessonSubtitle').textContent='Groep '+l.grade+' · '+l.goal;
  const layout=tag('div',undefined,'geography-layout'),left=tag('article',undefined,'lesson-reading'),right=tag('aside',undefined,'west-question-panel geography-question');layout.append(left,right);body.append(layout);if(l.diagram==='map')diagram(left);else if(l.diagram==='themes')thematicMaps(left);else if(window.TopoVisuals)left.append(TopoVisuals.picture(l));left.append(tag('h2','Dit ga je leren'),tag('p',l.goal,'lesson-goal'));for(const paragraph of l.paragraphs)left.append(tag('p',paragraph));const terms=tag('dl',undefined,'lesson-terms');for(const[word,meaning]of Object.entries(l.terms))terms.append(tag('dt',word),tag('dd',meaning));left.append(terms);const details=tag('details');details.append(tag('summary','Bronnen en verantwoording'));for(const src of l.sources){const a=tag('a',src.title);a.href=src.url;a.target='_blank';a.rel='noopener noreferrer';const line=tag('p');line.append(a);details.append(line)}left.append(details);
  if(s.phase==='quiz'){const q=l.questions[s.step],chosen=s.answers[s.step];right.append(tag('p','Opdracht '+(s.step+1)+' van '+l.questions.length,'book-kicker'),tag('h2',q.prompt));const meter=tag('div',undefined,'progress'),fill=tag('div');fill.style.width=100*s.step/l.questions.length+'%';meter.append(fill);right.append(meter);const answers=tag('div',undefined,'lesson-options'),indices=q.options.map((_,i)=>i),offset=(l.id.length+s.step)%indices.length,order=indices.slice(offset).concat(indices.slice(0,offset));for(const index of order){const b=tag('button',q.options[index],'lesson-answer');b.disabled=chosen!==null;b.setAttribute('aria-pressed',String(chosen===index));b.onclick=()=>answer(index);if(chosen!==null&&index===q.answer)b.classList.add('correct');if(chosen===index&&chosen!==q.answer)b.classList.add('incorrect');answers.append(b)}right.append(answers);if(chosen!==null){const feedback=tag('p',(chosen===q.answer?'✓ Goed. ':'Nog niet. Het juiste antwoord is: '+q.options[q.answer]+'. ')+q.explanation,'lesson-feedback');feedback.setAttribute('role','status');right.append(feedback);const next=tag('button',s.step===l.questions.length-1?'Bekijk resultaat':'Volgende vraag','primary');next.onclick=()=>advance();right.append(next)}right.append(tag('p','Je mag de afbeelding en uitleg blijven gebruiken. Dit zijn oefenopdrachten.','small muted'));
  }else{finish(l,s);right.append(tag('h2',result(l,s)+' van '+l.questions.length+' goed'),tag('p','Dit is een oefenresultaat, geen toetscijfer.'));for(let i=0;i<l.questions.length;i++)if(s.answers[i]!==l.questions[i].answer){const q=l.questions[i],card=tag('div',undefined,'lesson-review');card.append(tag('strong',q.prompt),tag('p','Juist: '+q.options[q.answer]),tag('p',q.explanation));right.append(card)}const again=tag('button','Opdrachten opnieuw','secondary');again.onclick=()=>restart();right.append(again)}if(l.mission&&window.MissionsApp){const b=tag('button','Probeer een kaartopdracht','secondary');b.onclick=()=>MissionsApp.open(l.mission);right.append(b)}
 }

 function begin(){const s=state.sessions[currentId];if(!s||s.phase!=='reading')return;s.phase='quiz';save();render()}
 function answer(index){const l=byId(currentId),s=state.sessions[currentId];if(!l||s?.phase!=='quiz'||s.answers[s.step]!==null||!Number.isInteger(index)||index<0||index>=l.questions[s.step].options.length)return;s.answers[s.step]=index;save();render()}
 function advance(){const l=byId(currentId),s=state.sessions[currentId];if(!l||s?.phase!=='quiz'||s.answers[s.step]===null)return;s.step++;if(s.step===l.questions.length)s.phase='result';save();render()}
 function finish(l,s){if(s.recorded)return;const score=result(l,s),old=state.progress[l.id];state.progress[l.id]={version:l.version,attempts:(old?.attempts||0)+1,best:Math.max(old?.best||0,score),last:score};s.recorded=true;save();renderOverview(activeGrade)}
 function restart(){const l=byId(currentId);if(!l)return;state.sessions[currentId]=fresh(l);save();render()}
 function renderProgress(grade){const host=el('geographyProgress');host.replaceChildren();host.append(tag('h2','Aardrijkskunde · groep '+grade));for(const l of lessons.filter(l=>l.grade===grade)){const p=state.progress[l.id];host.append(tag('p',l.title+': '+(p?'beste resultaat '+p.best+'/'+l.questions.length+' · laatst '+p.last+'/'+l.questions.length:'nog niet afgerond')))}}
 window.GeographyApp={renderOverview,renderProgress,open,begin,answer,advance,restart,snapshot:()=>JSON.parse(JSON.stringify(state))};
 renderOverview(activeGrade);
})();
