const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
async function boot({screensaver=false,fail=false}={}) {
 const nodes={'keep-awake':{},'wake-status':{}},events={},locks=[];
 const context={flipClockScreensaver:screensaver,localStorage:{getItem:()=>null,setItem(){}},document:{visibilityState:'visible',getElementById:id=>nodes[id],addEventListener:(name,fn)=>events[name]=fn},window:{addEventListener:(name,fn)=>events[name]=fn},navigator:{wakeLock:{request:async()=>{if(fail)throw Error('denied');const lock={released:false,addEventListener(name,fn){this.listener=fn},async release(){this.released=true;this.listener?.()}};locks.push(lock);return lock}}}};
 vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../shared/awake.js'),'utf8'),context);await new Promise(setImmediate);
 return {context,nodes,events,locks};
}
(async()=>{
 const app=await boot();assert.equal(app.locks.length,0);
 app.context.document.fullscreenElement={};await app.events.fullscreenchange();assert.equal(app.locks.length,1);assert.match(app.nodes['wake-status'].textContent,/Active/);
 app.context.document.visibilityState='hidden';await app.events.visibilitychange();assert(app.locks[0].released);
 app.context.document.visibilityState='visible';await app.events.visibilitychange();assert.equal(app.locks.length,2);
 app.nodes['keep-awake'].checked=false;app.nodes['keep-awake'].onchange();await new Promise(setImmediate);assert(app.locks[1].released);
 app.nodes['keep-awake'].checked=true;app.nodes['keep-awake'].onchange();await new Promise(setImmediate);await app.events.pagehide();assert(app.locks[2].released);
 assert.equal((await boot({screensaver:true})).locks.length,0);
 await app.events.pageshow();assert.equal(app.locks.length,4);
 app.context.document.fullscreenElement=null;await app.events.fullscreenchange();assert(app.locks[3].released);
 await app.events.pointerdown();assert.equal(app.locks.length,4);
 const denied=await boot({fail:true});denied.context.document.fullscreenElement={};await denied.events.fullscreenchange();assert.match(denied.nodes['wake-status'].textContent,/not allowed/);
 console.log('Passed: windowed exclusion, fullscreen acquire/exit release, hide/restore, toggle, page exit, screensaver exclusion, denied request.');
})().catch(e=>{console.error(e);process.exitCode=1});
