process.chdir(require('node:path').join(__dirname, '../shared'));
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let now=100000,interval,tones=0; const nodes={},stored={};
const el=()=>({value:'0',hidden:true,dataset:{},listeners:{},addEventListener(e,fn){this.listeners[e]=fn},setAttribute(){},focus(){}});
const get=id=>nodes[id]??=el();
class Audio {state='running';currentTime=0;destination={};createOscillator(){return {frequency:{setValueAtTime(){}},connect(){},start(){tones++},stop(){},disconnect(){}}}createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}}}}
const context={document:{getElementById:get,querySelectorAll:()=>[],addEventListener(){}},localStorage:{getItem:k=>stored[k]??null,setItem:(k,v)=>stored[k]=v},Date:{now:()=>now},AudioContext:Audio,setInterval:fn=>interval=fn};
vm.createContext(context);vm.runInContext(fs.readFileSync('timer.js','utf8'),context);
assert.equal(get('timer-display').textContent,'00:05:00');
get('timer-start').onclick();now+=12345;interval();assert.equal(get('timer-display').textContent,'00:04:48');
get('timer-start').onclick();const paused=get('timer-display').textContent;now+=60000;interval();assert.equal(get('timer-display').textContent,paused);
get('timer-start').onclick();now+=300000;interval();assert.equal(get('timer-status').textContent,'Time is up!');assert(tones>0);assert.equal(get('timer-panel').hidden,false);
get('timer-dismiss').onclick();assert.equal(get('timer-status').textContent,'Ready');const endedTones=tones;now+=1500;interval();assert.equal(tones,endedTones);
get('timer-hours').value='0';get('timer-minutes').value='0';get('timer-seconds').value='0';get('timer-start').onclick();assert.match(get('timer-status').textContent,/Enter a time/);
get('timer-seconds').value='1';get('timer-seconds').listeners.input();get('timer-alarm').onchange({target:{checked:false}});get('timer-start').onclick();now+=1000;interval();assert.equal(get('timer-status').textContent,'Time is up!');assert.equal(tones,endedTones);
console.log('Passed: countdown, pause/resume, delayed completion, alarm playback/stop, invalid duration, one-second timer, muted alarm.');
