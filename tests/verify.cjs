process.chdir(require('node:path').join(__dirname, '../shared'));
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
function boot(saved = {}) {
 const nodes = {};
 const element = () => ({dataset:{}, children:[], events:{}, style:{setProperty(){}}, classList:{toggle(){},add(){},remove(){}}, append(...items){for(const item of items){item.parentNode=this;this.children.push(item)}}, replaceChildren(...items){for(const child of this.children) child.parentNode=null;this.children=[];this.append(...items)}, addEventListener(name,fn){this.events[name]=fn},setAttribute(k,v){this[k]=v}, focus(){},remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(child=>child!==this);this.parentNode=null},querySelector(){return this.digits??=element()}});
 const context = {document:{getElementById:id=>nodes[id]??=element(), createElement:element, body:element(), documentElement:element(), querySelectorAll:()=>[],addEventListener(){}},localStorage:{getItem:()=>JSON.stringify(saved),setItem(k,v){saved=JSON.parse(v)}},matchMedia:()=>({matches:false}),setTimeout:()=>0,clearTimeout(){},Date};
 vm.createContext(context);vm.runInContext(fs.readFileSync('app.js','utf8'),context);
 return {nodes,run:code=>vm.runInContext(code,context),saved:()=>saved};
}
const app = boot();
assert.equal(app.nodes['theme-options'].children.length,10);
assert.equal(app.nodes['wallpaper-options'].children.length,10);
for (const button of app.nodes['theme-options'].children) {button.onclick();assert.equal(app.saved().theme,button.dataset.themeOption)}
for (const button of app.nodes['wallpaper-options'].children) {button.onclick();assert.equal(app.saved().wallpaper,button.dataset.wallpaperOption)}
const restored = boot(app.saved());assert.equal(restored.saved().wallpaper,'grid');assert.equal(restored.saved().theme,'mint');
app.run('prefs.theme="midnight";for(let i=0;i<10;i++) theme()');assert.equal(app.saved().theme,'midnight');
assert.equal(boot({light:true}).saved().theme,'paper');
assert.equal(boot({theme:'invalid',wallpaper:'invalid'}).saved().wallpaper,'none');
app.run('prefs.date=false;apply()');assert.equal(app.nodes['date-header'].hidden,true);
app.run('render(new Date(2026,8,18,0,0,0))');assert.equal(app.nodes.day.textContent,'Friday');assert.equal(app.run('previous.hours'),'12');
const html=fs.readFileSync('index.html','utf8');assert(html.indexOf('id="date-header"')<html.indexOf('id="hours"'));
app.run('setCard("minutes","41")');
const digits=app.nodes.minutes.digits;
assert.equal(digits.children.length,5);
const staleFinish=digits.children[4].events.animationend;
app.run('setCard("minutes","42")');
staleFinish();assert.equal(digits.children.length,5);
assert.equal(digits.children[2].children[0].textContent,'41');
digits.children[4].events.animationend();
assert.equal(digits.children.length,2);
assert(digits.children.every(half=>half.children[0].textContent==='42'));
console.log('Passed: flip staging, old digit preservation, cleanup, and stale animation completion.');
console.log('Passed: 10 themes, 10 wallpapers, every selection, persistence, legacy migration, theme cycling, date visibility, midnight rollover, header placement.');
