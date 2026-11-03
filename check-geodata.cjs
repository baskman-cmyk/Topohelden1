const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const data=JSON.parse(fs.readFileSync(path.join(__dirname,'geodata.json'),'utf8'));
function inRing([x,y],ring){let yes=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const [a,b]=ring[i],[c,d]=ring[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)yes=!yes}return yes}
function contains(p,g){const polygons=g.type==='MultiPolygon'?g.coordinates:[g.coordinates];return polygons.some(poly=>inRing(p,poly[0])&&!poly.slice(1).some(hole=>inRing(p,hole)))}
const f=data.features;
assert.equal(Object.keys(f).length,9);
for(const [id,cityPoint,outside] of [['westnl-01',[4.30,52.08],[5.12,52.09]],['westnl-02',[4.64,52.38],[4.30,52.08]],['westnl-03',[5.12,52.09],[4.64,52.38]]]){
 const feature=f[id];assert.ok(['Polygon','MultiPolygon'].includes(feature.geometry.type));assert.equal(feature.properties.license,'CC-BY-4.0');assert.equal(contains(cityPoint,feature.geometry),true);assert.equal(contains(outside,feature.geometry),false);
 for(const poly of (feature.geometry.type==='MultiPolygon'?feature.geometry.coordinates:[feature.geometry.coordinates]))for(const ring of poly){assert.ok(ring.length>=4);assert.deepEqual(ring[0],ring[ring.length-1])}
}
for(const id of ['westnl-08','westnl-19','westnl-21','westnl-22','westnl-23']){const feature=f[id];assert.equal(feature.geometry.type,'MultiLineString');assert.equal(feature.properties.assessmentReady,false);assert.ok(feature.properties.sourceIds.length>0);for(const line of feature.geometry.coordinates)assert.ok(line.length>=2)}
assert.equal(f['westnl-16'].geometry.type,'Point');assert.equal(contains(f['westnl-16'].geometry.coordinates,f['westnl-03'].geometry),true);
function walk(coords){if(typeof coords[0]==='number'){assert.ok(coords[0]>3&&coords[0]<6);assert.ok(coords[1]>51&&coords[1]<54)}else coords.forEach(walk)}
for(const feature of Object.values(f)){walk(feature.geometry.coordinates);assert.ok(feature.properties.sourceUrl.startsWith('https://api.pdok.nl/'))}
console.log('PASS: source metadata, coordinate order/bounds, closed province rings, capitals inside correct provinces, cross-province rejection, water coverage gate, Vleuten inside Utrecht.');
