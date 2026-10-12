import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),source=path.join(root,'lib/registry-source'),out=path.join(root,'public/registry');
const files=['content.js','observations.js','socials.js','founder-portraits.js','signals.js','workflows.js','registry-dense.js','registry-evolution.js','sponsorship.js','milestones.js','frontier-data.js','frontier.js','frontier-visual.js','capital.js'];
const css=['registry-dense.css','registry-evolution.css','sponsorship.css','milestones.css','frontier.css','frontier-visual.css','capital.css'];
const prelude=`window.mountAutopilotRegistry=function(){
const abort=new AbortController(), timers=[],timeouts=[];
const listen=(target,event,fn,options)=>target.addEventListener(event,fn,{...(typeof options==='boolean'?{capture:options}:options),signal:abort.signal});
const setInterval=(fn,delay)=>{const id=window.setInterval(fn,delay);timers.push(id);return id};
const setTimeout=(fn,delay)=>{const id=window.setTimeout(fn,delay);timeouts.push(id);return id};
// Hackathon-only provider snapshots and portraits are not bundled for public distribution.
window.FUNDAMENTALS={};window.PORTRAITS={};
`;
let bundle=files.map(f=>fs.readFileSync(path.join(source,f),'utf8')).join('\n;\n');
bundle=bundle.replace(/\b(document|window|app)\.addEventListener\(/g,'listen($1,')
 .replaceAll('assets/','/registry/assets/').replaceAll('href="favicon.svg"','href="/registry/favicon.svg"').replaceAll('src="favicon.svg"','src="/registry/favicon.svg"')
 .replaceAll('href="registry.html"','href="/"')
 .replace(/<div class="preview-strip">[\s\S]*?<\/div><main/,'<main')
 .replaceAll('REFERRAL PREVIEW','TOOL SPOTLIGHT')
 .replaceAll('Preview placement · ordinary website link; referral URL pending','Independent tool spotlight · no paid placement')
 .replaceAll('PROPOSED V1 PLACEMENT','SPONSORSHIP ENQUIRIES')
 .replaceAll('This is a sponsorship concept. Availability, pricing and audience figures will be confirmed before booking. No payment or enquiry is submitted from this preview.','For availability and pricing, contact Antonio on LinkedIn. Sponsored placements will be labeled.')
 .replaceAll('<button class="outline-link" data-sponsor-show>Show the placement on the page</button>','<a class="outline-link" href="https://www.linkedin.com/in/antonioserranopabon/" target="_blank" rel="noopener noreferrer">Discuss sponsorship ↗</a>')
 .replaceAll('No exact-domain Dealroom match in this refresh. Existing sourced observations appear below.','Company fundamentals below retain their original sources.')
 .replaceAll('Dealroom API ·','Dealroom API ·');
const cleanup=`
return ()=>{abort.abort();timers.forEach(window.clearInterval);timeouts.forEach(window.clearTimeout);sponsorRail.remove();document.querySelector('#app')?.replaceChildren();};
};`;
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'runtime.js'),prelude+bundle+cleanup);
fs.writeFileSync(path.join(out,'registry.css'),css.map(f=>fs.readFileSync(path.join(source,f),'utf8').replaceAll('assets/','/registry/assets/')).join('\n')+'\nbody.registry-active{background:#fff;color:#293b2e;display:block} .registry-active #app{min-height:100vh} .registry-active .preview-strip{display:none}\n');
console.log('Registry assets generated. Restricted Dealroom snapshots excluded.');
