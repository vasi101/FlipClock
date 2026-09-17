process.chdir(require('node:path').join(__dirname, '../shared'));
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
async function boot(savedImage = null, wallpaper = 'none', pixel = 220) {
  const nodes = {}, variables = {}, classes = {}, saved = {};
  const el = () => ({hidden:false,style:{setProperty(k,v){variables[k]=v},removeProperty(k){delete variables[k]}},classList:{toggle(k,v){classes[k]=v}}});
  const $ = id => nodes[id] ??= el();
  const canvas = () => ({getContext:()=>({fillRect(){},drawImage(){},getImageData:()=>({data:new Uint8ClampedArray(4096).fill(pixel)})}),toBlob:fn=>fn(new Blob(['image'],{type:'image/jpeg'}))});
  let currentImage = savedImage;
  const db = {close(){},transaction(){const transaction={};transaction.objectStore=()=>({get(){const request={result:currentImage};queueMicrotask(()=>transaction.oncomplete());return request},put(value){currentImage=value;queueMicrotask(()=>transaction.oncomplete());return {}},delete(){currentImage=null;queueMicrotask(()=>transaction.oncomplete());return {}}});return transaction}};
  let blobCount = 0;
  class Image {set src(value){this.value=value;this.onload()}get src(){return this.value}}
  const context = {$,prefs:{wallpaper},document:{body:el(),documentElement:el(),createElement:canvas},localStorage:{getItem:()=>null,setItem(k,v){saved[k]=v}},indexedDB:{open(){const request={result:db};queueMicrotask(()=>request.onsuccess());return request}},URL:{createObjectURL:()=>`blob:test-${++blobCount}`,revokeObjectURL(){}},Blob,Image,createImageBitmap:async()=>({width:4000,height:2000,close(){}})};
  context.apply=()=>context.updateGlass();
  vm.createContext(context);vm.runInContext(fs.readFileSync('background.js','utf8'),context);
  await new Promise(resolve=>setImmediate(resolve));
  return {context,nodes,variables,classes,getImage:()=>currentImage};
}
(async()=>{
  const app=await boot();
  await app.nodes['background-file'].onchange({target:{files:[{type:'text/plain',size:10}],value:''}});
  assert.match(app.nodes['background-status'].textContent,/Choose a JPG/);
  await app.nodes['background-file'].onchange({target:{files:[{type:'image/png',size:100}],value:''}});
  assert.equal(app.context.prefs.wallpaper,'custom');assert.equal(app.classes.glass,true);assert(app.getImage() instanceof Blob);assert.equal(app.variables['--glass-ink'],'#102022');
  app.nodes['glass-opacity'].oninput({target:{value:'60'}});assert.equal(app.variables['--glass-opacity'],.6);
  app.context.prefs.wallpaper='forest';app.context.apply();assert.equal(app.classes.glass,false);
  app.nodes['use-custom'].onclick();assert.equal(app.classes.glass,true);
  const restored=await boot(app.getImage(),'custom',30);assert.equal(restored.classes.glass,true);assert.equal(restored.variables['--glass-ink'],'#f5faf9');
  await app.nodes['remove-custom'].onclick();assert.equal(app.getImage(),null);assert.equal(app.classes.glass,false);assert.equal(app.context.prefs.wallpaper,'none');
  console.log('Passed: file validation, image conversion/save/restore/removal, light/dark adaptation, opacity, wallpaper switching.');
})().catch(error=>{console.error(error);process.exitCode=1});
