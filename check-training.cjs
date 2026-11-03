const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const nodes=new Map(),saved=new Map();
function node(){return {children:[],textContent:'',value:'6',style:{},hidden:false,classList:{toggle(){}},addEventListener(){},replaceChildren(){this.children=[]},append(...items){this.children.push(...items)},appendChild(item){this.children.push(item)}}}
const doc={getElementById(id){if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)},querySelectorAll(){return []},createElement:node,querySelector(){return node()}};doc.getElementById('quizCategory').value='all';doc.getElementById('quizScope').value='mixed';doc.getElementById('quizMode').value='find';
const L={map:()=>({setView(){return this},fitBounds(){},invalidateSize(){},removeLayer(){}}),tileLayer:()=>({addTo(){}}),circleMarker:(p,options)=>({options,addTo(){return this},bindTooltip(){return this},on(){},setStyle(){}}),geoJSON:(f,o)=>({options:{},addTo(){return this},bindTooltip(){return this},on(){},setStyle(){}}),latLngBounds:()=>({pad(){return this}})};
const context={document:doc,localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},L,window:{L},setTimeout(){}};vm.createContext(context);vm.runInContext(fs.readFileSync(require('path').join(__dirname,'geodata.js'),'utf8'),context);vm.runInContext(fs.readFileSync(require('path').join(__dirname,'index.html'),'utf8').split('<script>').pop().split('</script>')[0],context);
function run(s){return vm.runInContext(s,context)}
run('startQuiz();');assert.equal(run('quizSet.length'),10);run('const first=quizSet[0];answerQuiz(quizPlaces().find(p=>p.id!==first.id));answerQuiz(first)');assert.equal(run('stats.done'),1);assert.equal(run('sessionMisses.size'),1);run("document.getElementById('next').onclick();document.getElementById('next').onclick()");assert.equal(run('quizStep'),1);
run("while(quizStep<quizSet.length){answerQuiz(quizSet[quizStep]);document.getElementById('next').onclick()}");assert.equal(doc.getElementById('bar').style.width,'100%');assert.match(doc.getElementById('feedback').textContent,/nog eens/);
doc.getElementById('answers').children.find(b=>b.textContent==='Oefen mijn fouten opnieuw').onclick();assert.equal(run('quizSet.length'),1);assert.equal(run('quizSet[0].id===first.id'),true);
run('answerQuiz(quizSet[0])');assert.equal(run('needsReview(first)'),true);run('startQuiz([first.id]);answerQuiz(quizSet[0])');assert.equal(run('needsReview(first)'),false);assert.equal(run('loadStats().locations[first.id].streak'),2);
run("document.getElementById('quizScope').value='review';quizPlaces().forEach(p=>stats.locations[p.id]={attempts:2,correct:2,streak:2});startQuiz()");assert.equal(run('quizSet.length'),0);assert.match(doc.getElementById('question').textContent,/geen locaties klaar/);
run("document.getElementById('quizScope').value='mixed';selected=new Set();startQuiz()");assert.equal(run('quizSet.length'),0);assert.match(doc.getElementById('question').textContent,/Selecteer eerst/);
run("selected=new Set(places.filter(p=>p.type==='stad').slice(0,2).map(p=>p.id));document.getElementById('quizMode').value='name';startQuiz()");assert.equal(doc.getElementById('answers').children.filter(b=>b.onclick).length,2);
run('renderProgress()');assert.equal(doc.getElementById('placeProgress').children.length,2);
saved.set('topo-progress-v1','{bad');assert.equal(run('loadStats().done'),0);saved.set('topo-progress-v1',JSON.stringify({done:4,correct:3,points:30}));assert.equal(run('loadStats().points'),30);assert.equal(run('Object.keys(loadStats().locations).length'),0);
context.localStorage.setItem=()=>{throw Error('blocked')};run('answerQuiz(quizSet[0])');assert.equal(doc.getElementById('storageNotice').hidden,false);
run("quizMap=null;window.L=null;startQuiz()");assert.match(doc.getElementById('feedback').textContent,/kaart kon niet/);
console.log('PASS: scoring and duplicate guard; result and retry; two-success review rule; saved per-place progress; empty review/selection; limited options; progress rendering; corrupt data; old score migration; blocked storage; missing map.');

// Group/period planning uses the same geographic dataset with separate selections.
context.localStorage.setItem=(k,v)=>saved.set(k,v);
run("setContext(6,1);selected=new Set(['westnl-16']);saveSelection();setContext(5,2)");assert.equal(run('hasProgram()'),false);assert.equal(run('selected.size'),0);
doc.getElementById('assignWest').onclick();assert.equal(run('hasProgram()'),true);assert.equal(run('selected.size'),36);
run("selected=new Set(['westnl-26','westnl-35']);saveSelection();setContext(6,1)");assert.equal(run('selected.size'),1);assert.equal(run("selected.has('westnl-16')"),true);
run('setContext(5,2)');assert.equal(run('selected.size'),2);assert.equal(run('programs["5:2"].listId===programs["6:1"].listId'),true);
assert.equal(run('places.length'),36);assert.equal(run('loadPrograms()["5:2"].placeIds.length'),2);
run('setContext(8,4)');assert.equal(run('hasProgram()'),false);assert.match(doc.getElementById('activeProgramText').textContent,/nog geen lijst/);
console.log('PASS: group/period switching, empty group, list reuse, independent selection, stored program data.');
const restored=vm.createContext({...context,window:{L}});
vm.runInContext(fs.readFileSync(require('path').join(__dirname,'index.html'),'utf8').split('<script>').pop().split('</script>')[0],restored);
assert.equal(vm.runInContext('activeGrade',restored),8);assert.equal(vm.runInContext('activePeriod',restored),4);assert.equal(vm.runInContext('hasProgram()',restored),false);assert.equal(vm.runInContext('programs["5:2"].placeIds.length',restored),2);
console.log('PASS: restoring group, period and program selections after app reload.');

run("window.L=L;setContext(6,1);selected=new Set(places.map(p=>p.id));document.getElementById('quizCategory').value='provincie';startQuiz()");assert.equal(run('quizSet.length'),3);assert.equal(run('quizSet.every(p=>p.type==="provincie")'),true);assert.equal(doc.getElementById('answers').children.filter(b=>b.onclick).length,3);
run("document.getElementById('quizCategory').value='all'");assert.equal(run('quizPlaces().length'),23);assert.equal(run('quizPlaces().some(p=>p.type==="water")'),false);assert.equal(run('geometryType(places[0])'), 'vlak');assert.equal(run('geometryType(places.find(p=>p.name==="Lek"))'), 'lijn');assert.equal(run('geometryType(places.find(p=>p.name==="Vleuten"))'), 'punt');
console.log('PASS: province questions use polygons, 23 eligible items, water excluded, point/line/polygon dispatch.');
