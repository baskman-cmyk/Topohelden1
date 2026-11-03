(function(){
 'use strict';
 const appStorage=window.TopoStorage||localStorage;
 const data=window.TopoBook,byId=id=>data.chapters.find(c=>c.id===id),$=id=>document.getElementById(id),key='topo-book-v1';
 const modes=['none','knowledge','application'];let current=null,map=null,mounted=null,rendering=false;
 const clone=v=>JSON.parse(JSON.stringify(v));
 const text=(type,value,cls)=>{const e=document.createElement(type);if(value!==undefined)e.textContent=value;if(cls)e.className=cls;return e};
 const btn=(label,action,cls='secondary')=>{const b=text('button',label,cls);b.type='button';b.onclick=action;return b};
 function program(grade){return state.programs[grade]||{order:[...data.order[grade]],skip:[],tests:{}}}
 function route(grade){const p=program(grade);return p.order.filter(id=>!p.skip.includes(id))}
 function fresh(c){return {version:c.version,phase:0,step:0,answers:c.questions.map(()=>null),activity:{},finished:false,reflection:''}}
 function load(){
  const clean={version:1,programs:{},cursor:{},sessions:{}};
  try{const v=JSON.parse(appStorage.getItem(key));if(v?.version!==1)return clean;
   for(const g of [4,5,6,7,8]){
    const p=v.programs?.[g];if(p&&Array.isArray(p.order)){const ids=[...new Set(p.order.filter(id=>data.order[g].includes(id)))];for(const id of data.order[g])if(!ids.includes(id))ids.push(id);const skip=Array.isArray(p.skip)?p.skip.filter(id=>ids.includes(id)):[];clean.programs[g]={order:ids,skip:skip.length===ids.length?skip.slice(1):skip,tests:{}};for(const [id,mode] of Object.entries(p.tests||{}))if(ids.includes(id)&&modes.includes(mode))clean.programs[g].tests[id]=mode}
    if(data.order[g].includes(v.cursor?.[g]))clean.cursor[g]=v.cursor[g];
   }
   for(const c of data.chapters){const s=v.sessions?.[c.id];if(s?.version!==c.version||![0,1,2,3].includes(s.phase)||!Array.isArray(s.answers)||s.answers.length!==c.questions.length||!s.answers.every((a,i)=>a===null||(Number.isInteger(a)&&a>=0&&a<c.questions[i].options.length)))continue;
    const t=fresh(c);t.phase=s.phase;t.step=Number.isInteger(s.step)&&s.step>=0&&s.step<=c.questions.length?s.step:0;t.answers=s.answers;t.finished=s.finished===true;t.reflection=typeof s.reflection==='string'?s.reflection.slice(0,600):'';
    if(s.activity&&typeof s.activity==='object'&&!Array.isArray(s.activity)&&JSON.stringify(s.activity).length<40000)t.activity=s.activity;if(t.activity.choices&&(typeof t.activity.choices!=='object'||Array.isArray(t.activity.choices)))t.activity.choices={};
    if(s.test&&modes.includes(s.test.mode)&&s.test.mode!=='none'&&typeof s.test==='object'&&JSON.stringify(s.test).length<20000){const raw=s.test,n=knowledge(c).length,answers=Array.from({length:n},(_,i)=>Number.isInteger(raw.answers?.[i])&&raw.answers[i]>=0&&raw.answers[i]<Object.keys(c.terms).length?raw.answers[i]:null);const task=raw.task&&typeof raw.task==='object'&&!Array.isArray(raw.task)?raw.task:{};if(task.choices&&(typeof task.choices!=='object'||Array.isArray(task.choices)))task.choices={};const score=raw.score;const valid=score&&Number.isSafeInteger(score.correct)&&Number.isSafeInteger(score.total)&&score.total>0&&score.total<=20&&score.correct>=0&&score.correct<=score.total;t.test={mode:raw.mode,answers,task,submitted:raw.submitted===true&&Boolean(valid)};if(valid)t.test.score={correct:score.correct,total:score.total,explanation:typeof score.explanation==='string'?score.explanation.slice(0,2000):''}}
    clean.sessions[c.id]=t;
   }
  }catch{}return clean;
 }
 let state=load();
 function save(){try{appStorage.setItem(key,JSON.stringify(state));$('bookStorageNotice').hidden=true}catch{$('bookStorageNotice').hidden=false}}
 function session(c){return state.sessions[c.id]||(state.sessions[c.id]=fresh(c))}
 function cursor(g){const ids=route(g);return ids.includes(state.cursor[g])?state.cursor[g]:ids.find(id=>!state.sessions[id]?.finished)||ids[0]}
 function renderHome(){
  const id=cursor(activeGrade),c=byId(id),ids=route(activeGrade),n=ids.filter(id=>state.sessions[id]?.finished).length;
  $('bookHomeTitle').textContent=data.titles[activeGrade];$('bookHomeLesson').textContent='Les '+(ids.indexOf(id)+1)+' van '+ids.length+' · '+c.title;
  $('bookHomeProgress').textContent=n+' van '+ids.length+' lessen doorlopen. Je plek in het boek wordt automatisch bewaard.';
  $('bookContinue').onclick=()=>open(id);$('bookHomeButton').textContent=state.sessions[id]?'Ga verder met je doeboek':'Begin je doeboek';
 }
 function renderOverview(){const host=$('bookChapters');host.replaceChildren();$('bookOverviewTitle').textContent=data.titles[activeGrade];for(const [i,id] of route(activeGrade).entries()){const c=byId(id),card=text('div',undefined,'panel');card.append(text('h2',(i+1)+'. '+c.title),text('p',c.goal),text('p',state.sessions[id]?.finished?'Doorlopen ✓':'Nog te ontdekken','small muted'),btn('Open deze les',()=>open(id),'primary'));host.append(card)}}
 function open(id){const c=byId(id);if(!c)return;current=id;state.cursor[c.grade]=id;session(c);save();show('book');render();window.scrollTo(0,0)}
 function continueBook(){open(cursor(activeGrade))}
 function render(){
  if(rendering)return;rendering=true;window.StoryApp?.leave();map?.remove();map=null;mounted=null;
  const c=byId(current),s=session(c),host=$('bookBody');host.replaceChildren();$('bookTitle').textContent=c.title;$('bookSubtitle').textContent='Groep '+c.grade+' · '+c.goal;
  const tabs=$('bookStages');tabs.replaceChildren();for(const [i,label] of ['Verhaal & uitleg','Doen','Oefenen','Afronden'].entries()){const b=btn(label,()=>go(i),'book-stage');b.disabled=i>s.phase&&!s.finished;b.setAttribute('aria-current',i===s.phase?'step':'false');tabs.append(b)}
  if(s.phase===0)reading(c,s,host);if(s.phase===1)activity(c,s,host);if(s.phase===2)practice(c,s,host);if(s.phase===3)finishPage(c,s,host);
  rendering=false;renderHome();
 }
 function reading(c,s,host){
  if(!window.StoryApp?.mount(c,host))host.append(text('p','Je hoeft dit nog niet te weten. We ontdekken het samen.','book-kicker'),text('h2',c.storyTitle),text('p',c.story,'book-story'));
  host.append(text('h2','Zo zit het'));for(const p of c.paragraphs)host.append(text('p',p));
  const terms=text('dl',undefined,'lesson-terms');for(const [word,meaning] of Object.entries(c.terms))terms.append(text('dt',word),text('dd',meaning));host.append(terms);
  if(c.activity.type==='province'){host.append(text('h2','Kijk eerst naar de ingevulde kaart'),text('p','Tik op een provincie om de naam te zien. We gebruiken West-Nederland als voorbeeld: Noord-Holland, Zuid-Holland en Utrecht. Bij Doen oefen je met dezelfde kaart zonder namen.'));provinceMap(host,{target:c.activity.target},{},true,()=>{})}
  const sources=text('details');sources.append(text('summary','Bronnen'));for(const source of c.sources){const a=text('a',source.title);a.href=source.url;a.target='_blank';a.rel='noopener';const p=text('p');p.append(a);sources.append(p)}host.append(sources);
  host.append(btn('Nu samen aan de slag',()=>go(1),'primary'));if(window.DigitalApp)host.append(btn('Samen op het digibord',()=>DigitalApp.board(c.id)));
 }
 function activity(c,s,host){
  host.append(text('h2','We gebruiken wat je net hebt geleerd'),text('p','Probeer rustig. Je krijgt uitleg en mag je keuze aanpassen.','muted'));
  if(c.activity.type==='mission'){
   const title=text('h3');title.id='bookMissionTitle';const feedback=text('p',undefined,'notice');feedback.id='bookMissionFeedback';feedback.setAttribute('role','status');const body=text('div');body.id='bookMissionBody';host.append(title,feedback,body);
   mounted=c.activity.id;window.MissionsApp.mount(c.activity.id,s.activity.mission,c.activity.level);onActivityChange();
   const next=btn('Verder met oefenen',()=>go(2),'primary');next.id='bookActivityNext';next.disabled=!s.activity.complete;host.append(next);
  }else{const holder=text('div');host.append(holder);renderTask(c.activity,holder,s.activity,false,()=>{save();render()});const next=btn('Verder met oefenen',()=>go(2),'primary');next.disabled=!s.activity.complete;host.append(next)}
  const work=document.createElement('section');work.id='digitalWork';host.append(work);window.DigitalApp?.mount(c.id,work);const forward=host.querySelector('#bookActivityNext')||[...host.querySelectorAll('button')].find(b=>b.textContent==='Verder met oefenen');if(forward)host.append(forward);host.append(btn('Nog even de uitleg lezen',()=>go(0)));
 }
 function onActivityChange(){
  if(!current||!mounted||!$('book').classList.contains('active'))return;const c=byId(current),s=session(c);if(s.phase!==1)return;const snap=window.MissionsApp.snapshot();s.activity.mission={[mounted]:snap[mounted]};s.activity.complete=snap[mounted]?.recorded===true;save();const next=$('bookActivityNext');if(next)next.disabled=!s.activity.complete;
 }
 function go(phase){const c=byId(current),s=session(c);if(![0,1,2,3].includes(phase))return;if(phase===2&&!s.activity.complete)return;if(phase===3&&s.answers.some(a=>a===null))return;s.phase=phase;save();render();$('bookBody').scrollIntoView({block:'start'})}
 function practice(c,s,host){
  if(s.step>=c.questions.length){s.phase=3;save();finishPage(c,s,host);return}
  const q=c.questions[s.step],a=s.answers[s.step];host.append(text('p','Oefenvraag '+(s.step+1)+' van '+c.questions.length,'small muted'),text('h2',q.prompt));
  const choices=text('div',undefined,'lesson-options');for(const i of shuffle(q.options.map((_,i)=>i))){const b=btn(q.options[i],()=>answerPractice(i),'lesson-answer');b.disabled=a!==null;if(a!==null&&i===q.answer)b.classList.add('correct');choices.append(b)}host.append(choices);
  if(a!==null){host.append(text('p',(a===q.answer?'✓ Goed. ':'Nog niet. ')+q.explanation,'lesson-feedback'));host.append(btn(s.step===c.questions.length-1?'Rond deze les af':'Volgende vraag',()=>{s.step++;if(s.step===c.questions.length)s.phase=3;save();render()},'primary'))}
 }
 function answerPractice(index){const c=byId(current),s=session(c),q=c.questions[s.step];if(s.phase!==2||!q||s.answers[s.step]!==null||!Number.isInteger(index)||index<0||index>=q.options.length)return;s.answers[s.step]=index;save();render()}
 function finishPage(c,s,host){
  const score=s.answers.reduce((n,a,i)=>n+(a===c.questions[i].answer),0);host.append(text('h2','Je hebt deze les doorlopen'),text('p','Oefenen: '+score+' van '+c.questions.length+' goed. De uitleg blijft beschikbaar.'));
  const reflection=text('textarea');reflection.rows=3;reflection.maxLength=600;reflection.id='bookReflection';reflection.value=s.reflection;reflection.oninput=e=>{s.reflection=e.target.value.slice(0,600);save()};const label=text('label','Wat ontdekte je, of aan welke plek doet dit je denken? (Mag je overslaan.)');label.htmlFor=reflection.id;host.append(label,reflection,text('p','Je eigen ervaring krijgt geen cijfer en blijft op dit apparaat.','small muted'));
  const mode=program(c.grade).tests[c.id]||'none';if(mode!=='none'&&(!s.test?.submitted||s.test.mode!==mode)){host.append(text('p','Voor deze les staat een '+(mode==='knowledge'?'kennistoets':'toepassingstoets')+' klaar.'),btn('Maak de toets',()=>startTest(mode),'primary'));return}
  s.finished=true;save();const ids=route(c.grade),i=ids.indexOf(c.id),next=ids[i+1];host.append(btn(next?'Volgende les: '+byId(next).title:'Bekijk je doeboek',()=>next?open(next):(show('bookOverview'),renderOverview()),'primary'));host.append(btn('Oefenvragen opnieuw',()=>{s.answers=c.questions.map(()=>null);s.step=0;s.phase=2;save();render()}),btn('Bekijk deze les opnieuw',()=>{s.phase=0;save();render()}));
  if(s.test?.submitted)host.append(text('p','Toets: '+s.test.score.correct+' van '+s.test.score.total+' onderdelen juist.','small'));
 }
 function knowledge(c){const entries=Object.entries(c.terms);return entries.slice(0,3).map(([word],i)=>({prompt:'Welke uitleg past bij '+word+'?',options:entries.map(x=>x[1]),answer:i}))}
 function startTest(mode){if(!['knowledge','application'].includes(mode))return;const c=byId(current),s=session(c);if(!s.test||s.test.mode!==mode||s.test.submitted)s.test={mode,answers:knowledge(c).map(()=>null),task:{},submitted:false};$('bookTestMessage').textContent='';save();show('bookTest');renderTest()}
 function renderTest(){const c=byId(current),s=session(c),t=s.test,host=$('bookTestBody');host.replaceChildren();$('bookTestTitle').textContent=(t.mode==='knowledge'?'Kennistoets · ':'Toepassingstoets · ')+c.title;
  host.append(text('p',t.submitted?'Je toets is nagekeken.':'Werk zelfstandig. Je kunt je antwoorden wijzigen. Je krijgt pas na inleveren uitleg.','muted'));
  if(t.mode==='knowledge'){knowledge(c).forEach((q,i)=>{const label=text('label',q.prompt),select=text('select');select.id='knowledge-'+i;const empty=text('option','Kies je antwoord');empty.value='';select.append(empty);q.options.forEach((v,j)=>{const o=text('option',v);o.value=j;select.append(o)});select.value=t.answers[i]??'';select.disabled=t.submitted;select.onchange=e=>{t.answers[i]=e.target.value===''?null:Number(e.target.value);save()};label.htmlFor=select.id;host.append(label,select);if(t.submitted)host.append(text('p',(t.answers[i]===q.answer?'✓ Goed. ':'Juist: ')+q.options[q.answer],'small'))})}
  else{const box=text('div');host.append(box);renderTask(c.testActivity,box,t.task,true,()=>{save();renderTest()})}
  if(!t.submitted)host.append(btn('Lever mijn toets in',submitTest,'primary'));else host.append(text('h2',t.score.correct+' van '+t.score.total+' onderdelen juist'),text('p',t.score.explanation||'Bekijk welke begrippen je nog eens wilt lezen.'),btn('Verder in mijn doeboek',()=>{show('book');render()},'primary'));
  host.append(text('p','Dit is een korte lestoets over de getoonde inhoud, geen volledige kerndoelen- of 36-namentoets.','small muted'));
 }
 function submitTest(){const c=byId(current),t=session(c).test;if(!t||t.submitted)return;let score;
  if(t.mode==='knowledge'){if(t.answers.some(a=>a===null)){$('bookTestMessage').textContent='Beantwoord eerst alle vragen.';return}const qs=knowledge(c);score={correct:qs.reduce((n,q,i)=>n+(t.answers[i]===q.answer),0),total:qs.length}}
  else{score=scoreTask(c.testActivity,t.task);if(!score.ready){$('bookTestMessage').textContent='Maak eerst alle onderdelen af.';return}}
  t.score=score;t.submitted=true;$('bookTestMessage').textContent='';save();renderTest();
 }
 function taskChanged(model,change){change();model.complete=false;model.feedback='';save()}
 function renderTask(task,host,model,test,changed){
  const frozen=test&&session(byId(current)).test?.submitted;const update=fn=>{if(frozen)return;taskChanged(model,fn);changed()};host.replaceChildren();host.append(text('h3',task.prompt||({barrier:'Probeer de kering open en dicht. Sluit haar daarna voor een storm vanuit zee.',hemisphere:'Plaats Nederland en het Australische vasteland op het juiste halfrond.'}[task.type]||'Gebruik de kaart.')));
  if(task.type==='order'){
   model.sequence=Array.isArray(model.sequence)?model.sequence.filter((x,i,a)=>Number.isInteger(x)&&x>=0&&x<task.items.length&&a.indexOf(x)===i):[];
   const options=text('div',undefined,'toolbar');for(const i of [...task.items.keys()].reverse()){const b=btn(task.items[i],()=>update(()=>model.sequence.push(i)));b.disabled=frozen||model.sequence.includes(i);options.append(b)}host.append(options,text('p','Jouw volgorde: '+model.sequence.map(i=>task.items[i]).join(' → ')));if(!frozen)host.append(btn('Volgorde wissen',()=>update(()=>model.sequence=[])));
  }else if(task.type==='sort'){
   model.choices=model.choices||{};task.items.forEach(([label],i)=>{const row=text('label',label,'book-sort-row'),select=text('select');const none=text('option','Kies een groep');none.value='';select.append(none);task.buckets.forEach((b,j)=>{const o=text('option',b);o.value=j;select.append(o)});select.value=model.choices[i]??'';select.disabled=frozen;select.onchange=e=>update(()=>model.choices[i]=e.target.value===''?null:Number(e.target.value));row.append(select);host.append(row)})
  }else if(task.type==='province'){provinceMap(host,task,model,false,value=>update(()=>model.choice=value),frozen)}
  else if(task.type==='tap'){
   const grid=text('div',undefined,'mission-grid');for(let y=0;y<5;y++)for(let x=0;x<5;x++){const b=btn(String.fromCharCode(65+x)+(y+1)+(x===0&&y===4?' · Huis':''),()=>update(()=>model.point=[x,y]),'mission-cell');b.setAttribute('aria-pressed',String(model.point?.[0]===x&&model.point?.[1]===y));b.disabled=frozen;grid.append(b)}host.append(text('p','↑ Noord · Oost is rechts. Elke stap gaat naar een aangrenzend vak.','small'),grid);
  }else if(task.type==='hemisphere'){
   model.choices=model.choices||{};const items=['Nederland','Australische vasteland'];const at=[0,1].find(i=>!model.choices[i]);host.append(text('p',at===undefined?'Beide plekken geplaatst.':'Plaats nu: '+items[at]));const globe=text('div',undefined,'book-globe');for(const [id,label] of [['north','Noordelijk halfrond'],['south','Zuidelijk halfrond']]){const b=btn(label,()=>update(()=>model.choices[at===undefined?0:at]=id),'globe-half');b.disabled=frozen;globe.append(b);if(id==='north')globe.append(text('div','Evenaar','globe-equator'))}host.append(globe);for(let i=0;i<2;i++)host.append(text('p',items[i]+': '+(model.choices[i]==='north'?'noordelijk':model.choices[i]==='south'?'zuidelijk':'nog plaatsen')));
  }else if(task.type==='barrier'||task.type==='gate'){
   const stand=model.gate||'open',picture=text('div',undefined,'book-gate');picture.append(text('div','Zee · storm vanuit zee','gate-sea'),text('div',stand==='closed'?'Kering gesloten ║':'Kering open ⇢','gate-door'),text('div',stand==='closed'?'Zee-instroming beperkt':'Verbinding met zee open','gate-land'));host.append(picture,text('p','Schematische voorstelling, geen echte waterstandberekening.','small'));const controls=text('div',undefined,'toolbar');for(const [id,label] of [['open','Open de kering'],['closed','Sluit de kering']]){const b=btn(label,()=>update(()=>{model.gate=id;model.seen=[...new Set([...(model.seen||[]),id])]}));b.setAttribute('aria-pressed',String(stand===id));b.disabled=frozen;controls.append(b)}host.append(controls);
  }else if(task.type==='site'){
   model.layer=model.layer||'height';const toggles=text('div',undefined,'toolbar');for(const [id,label] of [['height','Hoogte'],['water','Water'],['roads','Wegen']])toggles.append(btn(label,()=>update(()=>model.layer=id)));host.append(toggles);const h=[[4,4,3,3,2],[4,3,3,1,1],[2,2,0,0,0],[3,3,3,2,1],[4,4,4,3,2]],spots={A:[3,1],B:[2,0],C:[0,0]},grid=text('div',undefined,'mission-grid');for(let y=0;y<5;y++)for(let x=0;x<5;x++){const id=Object.keys(spots).find(id=>spots[id][0]===x&&spots[id][1]===y);const value=model.layer==='height'?'hoogte '+h[y][x]:model.layer==='water'?(y===2?'rivier':h[y][x]<2?'laag gebied':'buiten laag gebied'):(x===task.road?'weg':'geen weg');grid.append(text('div',(id?id+' · ':'')+String.fromCharCode(65+x)+(y+1)+'\n'+value,'mission-cell'))}host.append(grid,text('p','Bedachte oefenkaart. Hoogte 0 en 1 is laag; de weg loopt door kolom '+String.fromCharCode(65+task.road)+'.','small'));for(const id of Object.keys(spots)){const b=btn('Kies '+id,()=>update(()=>model.choice=id));b.disabled=frozen;b.setAttribute('aria-pressed',String(model.choice===id));host.append(b)}
  }
  if(!test){host.append(btn('Controleer mijn opdracht',()=>{const score=scoreTask(task,model);model.feedback=score.ready?score.explanation:'Maak eerst de opdracht af.';model.complete=score.ready&&score.correct===score.total;save();changed()},'primary'));if(model.feedback)host.append(text('p',model.feedback,'lesson-feedback'))}
 }
 function scoreTask(task,m){
  let ready=false,correct=0,total=1,explanation='';
  if(task.type==='order'){const seq=m.sequence||[];ready=seq.length===task.items.length;total=task.items.length;correct=seq.reduce((n,v,i)=>n+(v===i),0);explanation='Een passende volgorde is: '+task.items.join(' → ')+'.'}
  if(task.type==='sort'){ready=task.items.every((_,i)=>Number.isInteger(m.choices?.[i]));total=task.items.length;correct=task.items.reduce((n,v,i)=>n+(m.choices?.[i]===v[1]),0);explanation=task.items.map(([label,b])=>label+' → '+task.buckets[b]).join(' · ')}
  if(task.type==='province'){ready=Boolean(m.choice);correct=Number(m.choice===task.target);explanation='Het gevraagde gebied is '+places.find(p=>p.id===task.target)?.name+'.'}
  if(task.type==='tap'){ready=Array.isArray(m.point);correct=Number(m.point?.[0]===task.target[0]&&m.point?.[1]===task.target[1]);explanation='Direct ten oosten van A5 ligt B5: één vak naar rechts.'}
  if(task.type==='hemisphere'){ready=Boolean(m.choices?.[0]&&m.choices?.[1]);total=2;correct=Number(m.choices?.[0]==='north')+Number(m.choices?.[1]==='south');explanation='Nederland ligt op het noordelijk halfrond, het Australische vasteland op het zuidelijk halfrond.'}
  if(task.type==='gate'||task.type==='barrier'){ready=Boolean(m.gate)&&(task.type==='gate'||['open','closed'].every(x=>m.seen?.includes(x)));correct=Number(m.gate==='closed');explanation='Bij gevaarlijk hoogwater vanuit zee kan een beweegbare stormvloedkering de verbinding tijdelijk sluiten. In dit schema is gesloten de passende stand.'}
  if(task.type==='site'){ready=['A','B','C'].includes(m.choice);correct=Number(m.choice===task.target);explanation='C voldoet hier: hoogte 4, buiten het lage gebied en bij de weg. B ligt te ver van de weg; A is laag.'}
  return {ready,correct,total,explanation:(ready&&correct===total?'✓ Goed uitgevoerd. ':'')+explanation};
 }
 function provinceMap(host,task,model,filled,onchoose,frozen=false){
  map?.remove();map=null;const box=text('div');box.className='book-map';host.append(box);if(!window.L){host.append(text('p','Kaartbibliotheek ontbreekt. Controleer de uploadbestanden.'));return}
  map=L.map(box).setView([52.25,4.8],8);contextMap(map);const provinces=places.filter(p=>p.type==='provincie');provinces.forEach((p,i)=>{const layer=makeFeatureLayer(p,true).addTo(map);layer.bindTooltip(filled?p.name:String(i+1),{permanent:true,direction:'center',className:'quiz-number'});layer.on('click',()=>{if(filled){$('bookMapInfo').textContent=p.name}else if(!frozen)onchoose(p.id)});if(!filled){const b=btn('Gebied '+(i+1),()=>onchoose(p.id));b.disabled=frozen;b.setAttribute('aria-pressed',String(model.choice===p.id));host.append(b)}});const info=text('p','', 'small');info.id='bookMapInfo';host.append(info);setTimeout(()=>map?.invalidateSize(),50);
 }
 function settings(){const host=$('bookSettingsRows');host.replaceChildren();const p=program(activeGrade);$('bookSettingsGrade').textContent='Groep '+activeGrade+' · '+data.titles[activeGrade];for(const [i,id] of p.order.entries()){
   const row=text('div',undefined,'book-settings-row');row.append(text('strong',byId(id).title));const controls=text('div',undefined,'toolbar');controls.append(btn('↑',()=>reorder(id,-1)),btn('↓',()=>reorder(id,1)));const label=text('label','Overslaan '),cb=text('input');cb.type='checkbox';cb.checked=p.skip.includes(id);cb.onchange=()=>{const copy=clone(program(activeGrade));if(cb.checked&&copy.skip.length===copy.order.length-1){cb.checked=false;return}copy.skip=cb.checked?[...copy.skip,id]:copy.skip.filter(x=>x!==id);state.programs[activeGrade]=copy;save();settings();renderHome()};label.append(cb);controls.append(label);
   const select=text('select');for(const [mode,title] of [['none','Geen toets na deze les'],['knowledge','Kennistoets na deze les'],['application','Toepassingstoets na deze les']]){const o=text('option',title);o.value=mode;select.append(o)}select.value=p.tests[id]||'none';select.setAttribute('aria-label','Toetsvorm voor '+byId(id).title);select.onchange=e=>{const copy=clone(program(activeGrade));copy.tests[id]=e.target.value;state.programs[activeGrade]=copy;save()};row.append(controls,select);host.append(row)
  }host.append(btn('Standaardopbouw terugzetten',()=>{delete state.programs[activeGrade];save();settings();renderHome()}));
 }
 function reorder(id,delta){const p=clone(program(activeGrade)),i=p.order.indexOf(id),j=i+delta;if(i<0||j<0||j>=p.order.length)return;[p.order[i],p.order[j]]=[p.order[j],p.order[i]];state.programs[activeGrade]=p;save();settings();renderHome()}
 window.BookApp={continueBook,open,renderHome,renderOverview,settings,onActivityChange,go,answerPractice,startTest,submitTest,scoreTask,snapshot:()=>clone(state),renderTest,renderProgress:()=>{const host=$('bookProgress');host.replaceChildren();host.append(text('h2','Mijn doeboek · groep '+activeGrade));for(const id of route(activeGrade)){const c=byId(id),s=state.sessions[id];host.append(text('p',c.title+': '+(s?.finished?'doorlopen':s?'bezig':'nog te ontdekken')+(s?.test?.submitted?' · toets '+s.test.score.correct+'/'+s.test.score.total:'')))}}};
 renderHome();
})();
