(function(){
 'use strict';
 const appStorage=window.TopoStorage||localStorage;
 let embedded=false;
 const $=id=>document.getElementById(embedded&&['missionBody','missionTitle','missionFeedback'].includes(id)?'book'+id[0].toUpperCase()+id.slice(1):id);
 const key='topo-missions-v1';
 const size=5,start=[0,4],goal=[4,0],park=[0,0];
 const layers=['height','water','roads'];
 const buckets=['country','netherlands'];
 const kingdom={Aruba:'country','Curaçao':'country','Sint Maarten':'country',Bonaire:'netherlands','Sint Eustatius':'netherlands',Saba:'netherlands'};
 const sites={A:[3,1],B:[2,0],C:[0,0]};
 const heights=[[4,4,3,3,2],[4,3,3,1,1],[2,2,0,0,0],[3,3,3,2,1],[4,4,4,3,2]];
 function node(type,text,cls){const n=document.createElement(type);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n}
 function button(text,action,cls='secondary'){const b=node('button',text,cls);b.type='button';b.onclick=action;return b}
 const same=(a,b)=>a[0]===b[0]&&a[1]===b[1];
 const water=(x,y)=>y===2&&x!==2;
 const validCell=p=>Array.isArray(p)&&p.length===2&&p.every(Number.isInteger)&&p.every(v=>v>=0&&v<size);
 const coord=p=>String.fromCharCode(65+p[0])+(p[1]+1);
 const passable=(x,y)=>validCell([x,y])&&!water(x,y);
 const freshRoute=level=>({level,path:[[...start]],recorded:false});
 const routeSolved=r=>same(r.path[r.path.length-1],goal)&&(r.level===1||r.path.some(p=>same(p,park)));
 const routeValid=r=>r&&[1,2,3].includes(r.level)&&Array.isArray(r.path)&&r.path.length>0&&r.path.length<=201&&same(r.path[0],start)&&r.path.every((p,i)=>validCell(p)&&passable(...p)&&(!i||Math.abs(p[0]-r.path[i-1][0])+Math.abs(p[1]-r.path[i-1][1])===1));
 const freshDetective=()=>({layer:'height',seen:['height'],inspected:null,choice:null,wrong:0,recorded:false});
 function initial(){return {version:1,route:freshRoute(1),detective:freshDetective(),kingdom:{assignments:{},recorded:false},world:[],progress:{route:0,detective:0,kingdom:0},bestSteps:{}}}
 function cleanPlace(p){
  if(!p||typeof p.name!=='string'||!p.name.trim()||p.name.length>80||typeof p.meaning!=='string'||!p.meaning.trim()||p.meaning.length>600)return null;
  return {id:typeof p.id==='string'?p.id.slice(0,100):'place-'+Date.now()+'-'+Math.random().toString(36).slice(2),name:p.name.trim(),meaning:p.meaning.trim(),placeId:places.some(f=>f.id===p.placeId)?p.placeId:null,kind:['herinnering','natuur','geleerd','droomplek'].includes(p.kind)?p.kind:'herinnering'};
 }
 function load(){
  const clean=initial();try{
   const v=JSON.parse(appStorage.getItem(key));if(v?.version!==1)return clean;
   if(routeValid(v.route))clean.route={level:v.route.level,path:v.route.path,recorded:v.route.recorded===true&&routeSolved(v.route)};
   const d=v.detective;if(d&&layers.includes(d.layer)&&Array.isArray(d.seen))clean.detective={layer:d.layer,seen:[...new Set(d.seen.filter(x=>layers.includes(x)))],inspected:validCell(d.inspected)?d.inspected:null,choice:Object.keys(sites).includes(d.choice)?d.choice:null,wrong:Number.isSafeInteger(d.wrong)&&d.wrong>=0?d.wrong:0,recorded:d.recorded===true&&d.choice==='B'&&layers.every(x=>d.seen.includes(x))};
   for(const [name,bucket] of Object.entries(v.kingdom?.assignments||{}))if(Object.hasOwn(kingdom,name)&&buckets.includes(bucket))clean.kingdom.assignments[name]=bucket;
   clean.kingdom.recorded=v.kingdom?.recorded===true&&Object.entries(kingdom).every(([n,b])=>clean.kingdom.assignments[n]===b);
   if(Array.isArray(v.world)){const ids=new Set();clean.world=v.world.slice(0,30).map(cleanPlace).filter(p=>p&&!ids.has(p.id)&&ids.add(p.id))}
   for(const kind of ['route','detective','kingdom'])if(Number.isSafeInteger(v.progress?.[kind])&&v.progress[kind]>=0)clean.progress[kind]=v.progress[kind];
   for(const level of [1,2,3])if(Number.isSafeInteger(v.bestSteps?.[level])&&v.bestSteps[level]>=8&&v.bestSteps[level]<=200)clean.bestSteps[level]=v.bestSteps[level];
  }catch{}return clean;
 }
 let state=load(),current=null,selectedCard=null,personalMap=null,message='',lastDeleted=null;
 function save(){window.BookApp?.onActivityChange();try{appStorage.setItem(key,JSON.stringify(state));$('missionStorageNotice').hidden=true}catch{$('missionStorageNotice').hidden=false}}
 function announce(text){message=text;const out=$('missionFeedback');if(out)out.textContent=text}
 function finish(kind){if(state[kind].recorded)return;state[kind].recorded=true;state.progress[kind]++;if(kind==='route'){const r=state.route,n=r.path.length-1;state.bestSteps[r.level]=Math.min(state.bestSteps[r.level]||Infinity,n)}save();renderOverview();}
 function renderOverview(){
  const host=$('missionCards');host.replaceChildren();
  const cards=[['route','🧭 Routezoeker','Lees de legenda en bereik je bestemming met windrichtingen.','oriëntatie'],['detective','🔎 Kaartdetective','Vergelijk hoogte, water en wegen. Kies een plek voor een school.','bronnen vergelijken'],['kingdom','🏝️ Bouw het Koninkrijk','Ontdek welke eilanden landen zijn en welke bij Nederland horen.','staatkundige indeling'],['world','📍 Mijn wereld','Bewaar een plaats die iets voor jou betekent en vertel waarom.','persoonlijke betekenis']];
  for(const [id,title,description,skill] of cards){const c=node('div',undefined,'panel mission-card');c.append(node('h2',title),node('p',description),node('p','Je oefent: '+skill,'small muted'));const n=id==='world'?state.world.length:state.progress[id];c.append(node('p',id==='world'?n+' eigen plaatsen, zonder goed/foutscore':n+' keer uitgevoerd','small'));c.append(button('Ontdek deze missie',()=>open(id),'primary'));host.append(c)}
  $('dashboardMissions').textContent='Missies: '+Object.values(state.progress).reduce((a,b)=>a+b,0)+' keer uitgevoerd · '+state.world.length+' eigen plaatsen.';
 }
 function renderProgress(){
  const host=$('missionProgress');host.replaceChildren();host.append(node('h2','Vaardigheden · missies op dit apparaat'));
  const rows=[['Oriëntatie en legenda',state.progress.route+' routes uitgevoerd'],['Kaarten vergelijken',state.progress.detective+' onderzoeken uitgevoerd'],['Koninkrijk begrijpen',state.progress.kingdom+' sorteermissies uitgevoerd'],['Persoonlijke betekenis',state.world.length+' eigen plaatsen verkend · geen cijfer']];
  for(const [name,text] of rows){const c=node('div',undefined,'place-progress');c.append(node('strong',name),node('span',text));host.append(c)}
  host.append(node('p','Uitgevoerd betekent niet automatisch beheerst. Dit overzicht is gedeeld binnen deze browser en is nog niet per kind gescheiden.','small muted'));
 }
 function open(id){if(!['route','detective','kingdom','world'].includes(id))return;embedded=false;current=id;message='';selectedCard=null;show('mission');render()}
 function render(){
  personalMap?.remove();personalMap=null;const host=$('missionBody');host.replaceChildren();
  const titles={route:'Routezoeker',detective:'Kaartdetective',kingdom:'Bouw het Koninkrijk',world:'Mijn wereld'};$('missionTitle').textContent=titles[current]||'Missie';
  if(current==='route')renderRoute(host);if(current==='detective')renderDetective(host);if(current==='kingdom')renderKingdom(host);if(current==='world')renderWorld(host);
  $('missionFeedback').textContent=message;
 }
 function gridCellLabel(x,y){return water(x,y)?'water':y===2&&x===2?'brug':same([x,y],park)?'park':same([x,y],goal)?'school':same([x,y],start)?'huis':'pad'}
 function renderRoute(host){
  const r=state.route,position=r.path[r.path.length-1],done=routeSolved(r);
  host.append(node('p','Een bedachte oefenkaart. Noord is boven. Blauwe vakken zijn water; alleen bij de brug kun je oversteken.','muted'));
  const label=node('label','Kies je uitdaging '),select=node('select');select.id='routeLevel';
  for(const [value,text] of [[1,'Instap: naar school'],[2,'Extra: eerst langs het park'],[3,'Uitdaging: via het park in zo weinig mogelijk stappen']]){const o=node('option',text);o.value=value;select.append(o)}select.value=r.level;select.onchange=e=>setLevel(Number(e.target.value));label.append(select);host.append(label);
  host.append(node('h2',r.level===1?'Ga van het huis naar de school.':'Ga via het park naar de school.'));
  host.append(node('p','Je bent op '+coord(position)+' · '+(r.path.length-1)+' stappen'+(r.level>1?' · park '+(r.path.some(p=>same(p,park))?'bezocht ✓':'nog bezoeken'):''),'route-status'));
  if(r.level===3)host.append(node('p','Plan eerst je route. Met 12 stappen kan het; een langere goede route telt ook.','small'));
  const board=node('div',undefined,'mission-grid');board.setAttribute('role','group');board.setAttribute('aria-label','Routekaart. Gebruik de pijltjestoetsen of tik op een aangrenzend vak.');board.id='routeBoard';board.tabIndex=0;board.onkeydown=e=>{const d={ArrowUp:[0,-1],ArrowRight:[1,0],ArrowDown:[0,1],ArrowLeft:[-1,0]}[e.key];if(d){e.preventDefault();move(...d);$('routeBoard')?.focus()}};
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const p=[x,y],kind=gridCellLabel(x,y),b=button(coord(p)+' '+(same(p,position)?'● Jij':kind==='pad'?'':kind),()=>move(x-position[0],y-position[1]),'mission-cell '+(kind==='water'?'cell-water':kind==='brug'?'cell-bridge':kind==='park'?'cell-park':''));
   b.setAttribute('aria-label',coord(p)+', '+kind+(same(p,position)?', je bent hier':''));b.setAttribute('aria-current',same(p,position)?'location':'false');if(same(p,position))b.classList.add('cell-current');if(r.path.some(v=>same(v,p)))b.classList.add('cell-visited');board.append(b);
  }host.append(board);
  const controls=node('div',undefined,'route-controls');for(const [name,dx,dy] of [['↑ Noord',0,-1],['← West',-1,0],['↓ Zuid',0,1],['→ Oost',1,0]])controls.append(button(name,()=>move(dx,dy)));host.append(controls);
  host.append(node('p','Legenda: huis = start · school = eindpunt · park = tussenstop · water = niet lopen · brug = oversteken.','small'));
  if(done){finish('route');host.append(node('div','✓ Missie uitgevoerd! Je gebruikte richting, legenda en een oversteek.','mission-success'));if(r.level===3)host.append(node('p','Kortste route: 12 stappen. Jouw route: '+(r.path.length-1)+'. Kun je een omweg vinden die je kunt weglaten?'))}
  host.append(button('Deze route opnieuw',()=>setLevel(r.level)));
 }
 function setLevel(level){if(![1,2,3].includes(level))return;state.route=freshRoute(level);message='Nieuwe route. Kijk eerst naar de legenda.';save();render()}
 function move(dx,dy){
  const r=state.route;if(routeSolved(r))return;
  if(!Number.isInteger(dx)||!Number.isInteger(dy)||Math.abs(dx)+Math.abs(dy)!==1){announce('Kies één aangrenzend vak: noord, oost, zuid of west.');return}
  const p=r.path[r.path.length-1],next=[p[0]+dx,p[1]+dy];if(!passable(...next)){announce(validCell(next)?'Dat is water. Zoek de brug in de legenda en op de kaart.':'Je bent aan de rand van de kaart. Kies een andere richting.');return}
  if(r.path.length>=201){announce('Je hebt een lange ontdekroute gemaakt. Start opnieuw om een kortere route te plannen.');return}
  r.path.push(next);message=same(next,goal)&&r.level>1&&!r.path.some(p=>same(p,park))?'Je bent bij school, maar je moet eerst nog langs het park.':same(next,park)?'Het park is bezocht. Zoek nu de school.':'Je ging naar '+coord(next)+'.';save();render();
 }
 function renderDetective(host){
  const d=state.detective;
  host.append(node('h2','Waar bouwen we een school?'),node('p','In deze bedachte plaats zoeken we een droge, bereikbare plek. Kies A, B of C: hoogte minstens 3, niet in het lage gebied bij de rivier, en hoogstens één vak van de weg.'));
  const toggles=node('div',undefined,'toolbar');for(const [id,label] of [['height','Hoogtekaart'],['water','Waterkaart'],['roads','Wegenkaart']]){const b=button(label,()=>viewLayer(id));b.setAttribute('aria-pressed',String(d.layer===id));toggles.append(b)}host.append(toggles);
  host.append(node('p','Bekeken: '+d.seen.length+' van 3 kaartlagen. De kaartlagen beschrijven steeds dezelfde plek.','small'));
  const board=node('div',undefined,'mission-grid');board.setAttribute('aria-label','Thematische oefenkaart. Noord is boven.');
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const site=Object.keys(sites).find(k=>same(sites[k],[x,y])),h=heights[y][x];
   const value=d.layer==='height'?'hoogte '+h:d.layer==='water'?(y===2?'rivier':h<2?'laag gebied':'buiten laag gebied'):(x===2?'weg':'geen weg');
   const b=button((site?site+' · ':'')+coord([x,y])+'\n'+value,()=>inspect(x,y),'mission-cell theme-'+d.layer+' tone-'+h);b.setAttribute('aria-label',(site?'Locatie '+site+', ':'')+coord([x,y])+', '+value);if(site)b.classList.add('candidate-cell');board.append(b);
  }host.append(board);
  host.append(node('p',d.layer==='height'?'Legenda: hoogte 0–4 is een verzonnen vergelijkingsschaal. Een hoger getal betekent hoger terrein.':d.layer==='water'?'Legenda: de rivier loopt door rij 3. Hoogte 0 en 1 geldt in dit scenario als laag gebied.':'Legenda: de weg loopt door kolom C. Afstand tellen we in horizontale of verticale vakstappen.','small'));
  if(d.inspected)host.append(node('p','Je bekeek '+coord(d.inspected)+'. Wissel van laag om deze plek te vergelijken.','small'));
  const actions=node('div',undefined,'toolbar');for(const id of Object.keys(sites))actions.append(button('Kies locatie '+id,()=>chooseSite(id),'primary'));host.append(actions);
  if(d.recorded)host.append(node('div','✓ Onderzoek uitgevoerd. B voldoet aan alle drie de voorwaarden: hoogte 3, buiten het lage gebied en direct bij de weg.','mission-success'));
  host.append(button('Onderzoek opnieuw',()=>{state.detective=freshDetective();message='Vergelijk opnieuw de drie kaarten.';save();render()}));
 }
 function viewLayer(layer){if(!layers.includes(layer))return;state.detective.layer=layer;if(!state.detective.seen.includes(layer))state.detective.seen.push(layer);save();render()}
 function inspect(x,y){if(!validCell([x,y]))return;state.detective.inspected=[x,y];save();announce('Vak '+coord([x,y])+' bekeken. Wat verandert er als je een andere kaartlaag kiest?')}
 function chooseSite(id){
  if(!Object.hasOwn(sites,id)||state.detective.recorded)return;
  const d=state.detective;if(!layers.every(x=>d.seen.includes(x))){announce('Gebruik eerst alle drie de bronnen: hoogte, water en wegen. Eén kaart vertelt niet alles.');return}
  d.choice=id;if(id==='B'){finish('detective');message='Goed onderzocht: B ligt hoog genoeg, buiten het lage gebied en bij de weg.'}else{d.wrong++;message=id==='A'?'A ligt bij de weg, maar is laag. Bekijk de hoogte- en waterkaart samen.':'C ligt hoog, maar is twee vakken van de weg. Zoek een plek die aan alle voorwaarden voldoet.'}save();render();
 }
 function renderKingdom(host){
  const k=state.kingdom;
  host.append(node('h2','Eén Koninkrijk, vier landen'),node('p','Nederland is één van de vier landen. Kies een kaartje en plaats het bij de juiste groep. Nederland omvat Europees Nederland én Caribisch Nederland.'));
  const cards=node('div',undefined,'kingdom-cards');for(const name of Object.keys(kingdom)){const b=button(name,()=>{selectedCard=name;render()});b.setAttribute('aria-pressed',String(selectedCard===name));cards.append(b)}host.append(cards);
  host.append(node('p',selectedCard?'Gekozen kaartje: '+selectedCard:'Kies eerst een kaartje.','small'));
  const groups=node('div',undefined,'kingdom-groups');
  for(const [bucket,title] of [['country','Andere landen binnen het Koninkrijk'],['netherlands','Caribisch Nederland · onderdeel van het land Nederland']]){
   const group=node('div',undefined,'panel');group.append(node('h3',title));const assigned=Object.keys(kingdom).filter(n=>k.assignments[n]===bucket);group.append(node('p',assigned.length?assigned.join(' · '):'Nog geen kaartjes'));group.append(button('Plaats gekozen kaartje hier',()=>assign(selectedCard,bucket),'primary'));groups.append(group);
  }host.append(groups);
  const correct=Object.entries(kingdom).filter(([n,b])=>k.assignments[n]===b).length;host.append(node('p',correct+' van 6 kaartjes op de juiste plek.'));
  if(correct===6){finish('kingdom');host.append(node('div','✓ Het Koninkrijk bestaat uit Nederland, Aruba, Curaçao en Sint Maarten. Bonaire, Sint Eustatius en Saba zijn onderdeel van Nederland.','mission-success'))}
  const source=node('a','Bron: Rijksoverheid · opbouw van het Koninkrijk');source.href='https://www.rijksoverheid.nl/themas/overheid-en-democratie/caribische-deel-van-het-koninkrijk/vraag-en-antwoord/caribische-deel-van-het-koninkrijk/waaruit-bestaat-het-koninkrijk-der-nederlanden';source.target='_blank';source.rel='noopener';host.append(source);
  host.append(button('Kaartjes opnieuw verdelen',()=>{state.kingdom={assignments:{},recorded:false};selectedCard=null;message='Kies een kaartje en vergelijk de twee groepen.';save();render()}));
 }
 function assign(name,bucket){
  if(!Object.hasOwn(kingdom,name)||!buckets.includes(bucket)||state.kingdom.recorded){announce('Kies eerst een kaartje.');return}
  state.kingdom.assignments[name]=bucket;message=kingdom[name]===bucket?'✓ '+name+(bucket==='country'?' is een land binnen het Koninkrijk.':' hoort bij Caribisch Nederland en is onderdeel van Nederland.'):'Nog niet: '+name+(kingdom[name]==='country'?' is een land binnen het Koninkrijk, net als Nederland.':' is onderdeel van het land Nederland, geen apart land in het Koninkrijk.');selectedCard=null;save();render();
 }
 function renderWorld(host){
  host.append(node('p','Welke plaats betekent iets voor jou? Dat kan dichtbij zijn, een herinnering aan een reis of een plek waar je graag naartoe wilt. Jouw betekenis heeft geen goed of fout. Je notities blijven op dit apparaat.'));
  const form=node('form',undefined,'world-form');
  const name=node('input');name.id='worldName';name.maxLength=80;name.placeholder='Bijvoorbeeld: mijn favoriete strand';const nl=node('label','Naam van jouw plek');nl.htmlFor=name.id;form.append(nl,name);
  const select=node('select');select.id='worldPlace';const blank=node('option','Geen koppeling met de oefenkaart');blank.value='';select.append(blank);for(const p of places){const o=node('option',p.name+' ('+p.type+')');o.value=p.id;select.append(o)}const sl=node('label','Eventueel koppelen aan een bestaande kaartlocatie');sl.htmlFor=select.id;form.append(sl,select);
  const meaning=node('textarea');meaning.id='worldMeaning';meaning.maxLength=600;meaning.rows=4;meaning.required=true;const ml=node('label','Waarom is deze plek bijzonder, of wat ontdekte je er?');ml.htmlFor=meaning.id;form.append(ml,meaning);
  const kind=node('select');kind.id='worldKind';for(const [id,title] of [['herinnering','Een herinnering'],['natuur','Natuur die me opvalt'],['geleerd','Iets dat ik ontdekte'],['droomplek','Hier wil ik naartoe']]){const o=node('option',title);o.value=id;kind.append(o)}const kl=node('label','Wat past bij jouw plek?');kl.htmlFor=kind.id;form.append(kl,kind);
  const saveButton=node('button','Bewaar mijn plek','primary');saveButton.type='submit';form.append(saveButton);form.onsubmit=e=>{e.preventDefault();savePlace({name:name.value,meaning:meaning.value,placeId:select.value||null,kind:kind.value})};host.append(form);
  const linked=state.world.filter(p=>p.placeId);if(linked.length&&window.L){const box=node('div');box.id='personalMap';box.className='personal-map';box.setAttribute('aria-label','Jouw aan de oefenkaart gekoppelde plaatsen');host.append(box);personalMap=L.map(box).setView([52.25,4.9],8);contextMap(personalMap);for(const p of linked){const feature=places.find(f=>f.id===p.placeId);const marker=L.circleMarker(featureFor(feature).geometry.type==='Point'?latLngs(feature)[0]:[feature.lat,feature.lon],{radius:9,color:'#fff',fillColor:'#397dcc',fillOpacity:1}).addTo(personalMap);marker.bindTooltip(node('span',p.name));}setTimeout(()=>personalMap?.invalidateSize(),50)}
  host.append(node('h2','Mijn bijzondere plaatsen'));
  for(const p of state.world){const card=node('div',undefined,'panel world-card');card.append(node('h3',p.name),node('p',p.meaning),node('p',p.placeId?'Gekoppeld aan '+places.find(f=>f.id===p.placeId).name:'Vrije plek · nog niet op de oefenkaart','small muted'));card.append(button('Verwijder deze plek',()=>removePlace(p.id)));host.append(card)}
  if(!state.world.length)host.append(node('p','Je verzameling is nog leeg. Begin met een plek die jij zelf kiest.','muted'));
  const controls=node('div',undefined,'toolbar');controls.append(button('Download mijn plaatsen',exportPlaces));if(lastDeleted)controls.append(button('Laatste verwijdering ongedaan maken',undoDelete));host.append(controls);
 }
 function savePlace(data){
  const fallback=places.find(p=>p.id===data.placeId)?.name||'';const p=cleanPlace({...data,name:data.name?.trim()||fallback});
  if(!p){announce('Geef je plek een naam en vertel waarom deze betekenis voor je heeft.');return false}
  if(state.world.length>=30){announce('Je hebt 30 plaatsen bewaard. Download je verzameling of verwijder eerst een plek.');return false}
  state.world.push(p);message='Je plek is bewaard. Jouw verhaal krijgt geen cijfer.';save();renderOverview();render();return true;
 }
 function removePlace(id){const i=state.world.findIndex(p=>p.id===id);if(i<0)return;lastDeleted={place:state.world[i],index:i};state.world.splice(i,1);message='Plek verwijderd. Je kunt de laatste verwijdering ongedaan maken.';save();renderOverview();render()}
 function undoDelete(){if(!lastDeleted||state.world.length>=30)return;state.world.splice(lastDeleted.index,0,lastDeleted.place);lastDeleted=null;message='Je plek is teruggezet.';save();renderOverview();render()}
 function exportPlaces(){const a=node('a');a.download='mijn-topohelden-plaatsen.json';a.href=URL.createObjectURL(new Blob([JSON.stringify({version:1,places:state.world},null,2)],{type:'application/json'}));a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
 window.MissionsApp={mount:(id,restore,level)=>{embedded=true;current=id;message='';selectedCard=null;if(!restore?.[id])state[id]=id==='route'?freshRoute(level||1):id==='detective'?freshDetective():id==='kingdom'?{assignments:{},recorded:false}:state[id];if(restore?.[id]){const r=restore[id];if(id==='route'&&routeValid(r))state.route=JSON.parse(JSON.stringify(r));if(id==='kingdom'&&r.assignments&&typeof r.assignments==='object'){const assignments={};for(const [name,bucket] of Object.entries(r.assignments))if(Object.hasOwn(kingdom,name)&&buckets.includes(bucket))assignments[name]=bucket;state.kingdom={assignments,recorded:r.recorded===true&&Object.entries(kingdom).every(([n,b])=>assignments[n]===b)}}if(id==='detective'&&layers.includes(r.layer)&&Array.isArray(r.seen))state.detective={layer:r.layer,seen:[...new Set(r.seen.filter(x=>layers.includes(x)))],inspected:validCell(r.inspected)?r.inspected:null,choice:Object.keys(sites).includes(r.choice)?r.choice:null,wrong:Number.isSafeInteger(r.wrong)&&r.wrong>=0?r.wrong:0,recorded:r.recorded===true&&r.choice==='B'&&layers.every(x=>r.seen.includes(x))};}if(id==='route'&&level&&state.route.level!==level)state.route=freshRoute(level);render()},renderOverview,renderProgress,open,move,setLevel,viewLayer,inspect,chooseSite,assign,savePlace,removePlace,undoDelete,snapshot:()=>JSON.parse(JSON.stringify(state)),data:{start,goal,park,sites,kingdom}};
 renderOverview();
})();
