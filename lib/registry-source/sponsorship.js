/* Rotating referral candidates. Vendor links are placeholders until referral URLs are supplied. */
const sponsorRail=document.createElement('aside');
sponsorRail.className='sponsor-rail';sponsorRail.setAttribute('aria-label','Sponsor placement');
const sponsorRotations=[
 {name:'n8n',mark:'n8n',color:'#b84e68',message:'Put your workflows on autopilot.',url:'https://n8n.io'},
 {name:'Firecrawl',mark:'F',color:'#c36b30',message:'Turn the web into data for your agents.',url:'https://firecrawl.dev'},
 {name:'Apify',mark:'A',color:'#7a9a3c',message:'Give your agents a world of useful data.',url:'https://apify.com'},
 {name:'ElevenLabs',mark:'Ⅱ',color:'#444843',message:'Give your next AI product a voice.',url:'https://elevenlabs.io'},
 {name:'Atoms',mark:'At',color:'#7b60ad',message:'Build your next product with an AI team.',url:'https://atoms.dev'},
 {name:'Cursor',mark:'↗',color:'#536c68',message:'Take your next idea from prompt to code.',url:'https://cursor.com'}
];
sponsorRail.innerHTML=`<div class="sponsor-rail-inner departure-rail"><span class="sponsor-label">BUILDER TOOLS<span>REFERRAL PREVIEW</span></span><div class="departure-window"><a class="departure-link" target="_blank" rel="noopener noreferrer" title="Preview placement · ordinary website link; referral URL pending"><span class="departure-logo" aria-hidden="true"></span><span class="departure-name"></span><span class="departure-message"></span><span class="departure-visit">Explore ↗</span></a></div><div class="departure-controls" aria-label="Tool rotation controls"><button data-departure="previous" aria-label="Previous tool">‹</button><span class="departure-counter" aria-label="Current tool"></span><button data-departure="next" aria-label="Next tool">›</button><button data-departure="pause" aria-label="Pause tool rotation" aria-pressed="false">Ⅱ</button></div><a class="sponsor-rail-cta" href="/sponsor">Feature your tool →</a><button class="sponsor-dismiss" aria-label="Hide sponsor placement for this session" title="Hide for this session">×</button></div>`;
document.body.append(sponsorRail);
function showSponsorRail(show){sponsorRail.hidden=!show;document.body.classList.toggle('with-sponsor-rail',show)}
let sponsorHidden=false;try{sponsorHidden=sessionStorage.getItem('ap-sponsor-hidden')==='1'}catch{}showSponsorRail(!sponsorHidden);
// Sponsor buttons are plain links to /sponsor (the LinkedIn pop-up was retired 20 Oct 2026).
document.addEventListener('click',e=>{const target=e.target.closest('.sponsor-dismiss');if(!target)return;e.preventDefault();e.stopImmediatePropagation();showSponsorRail(false);try{sessionStorage.setItem('ap-sponsor-hidden','1')}catch{}},true);

let departureIndex=0,departurePaused=false,departureHovered=false,departureFocused=false,departureBusy=false;
const departureMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const departureWindow=sponsorRail.querySelector('.departure-window');
function paintDeparture(){const t=sponsorRotations[departureIndex],link=sponsorRail.querySelector('.departure-link');link.href=t.url;link.setAttribute('aria-label',t.name+': '+t.message+' Visit website. Referral preview.');const logo=link.querySelector('.departure-logo');logo.textContent=t.mark;logo.style.setProperty('--tool-color',t.color);link.querySelector('.departure-name').textContent=t.name;link.querySelector('.departure-message').textContent=t.message;sponsorRail.querySelector('.departure-counter').textContent=String(departureIndex+1).padStart(2,'0')+' / '+String(sponsorRotations.length).padStart(2,'0')}
function rotateDeparture(step){if(departureBusy)return;departureIndex=(departureIndex+step+sponsorRotations.length)%sponsorRotations.length;if(departureMotion.matches){paintDeparture();return}departureBusy=true;departureWindow.classList.add('flap-out');setTimeout(()=>{paintDeparture();departureWindow.classList.remove('flap-out');departureWindow.classList.add('flap-in');setTimeout(()=>{departureWindow.classList.remove('flap-in');departureBusy=false},220)},170)}
function updatePause(){let b=sponsorRail.querySelector('[data-departure="pause"]');b.textContent=departurePaused?'▶':'Ⅱ';b.setAttribute('aria-label',departurePaused?'Resume tool rotation':'Pause tool rotation');b.setAttribute('aria-pressed',String(departurePaused))}
sponsorRail.addEventListener('mouseenter',()=>departureHovered=true);sponsorRail.addEventListener('mouseleave',()=>departureHovered=false);sponsorRail.addEventListener('focusin',()=>departureFocused=true);sponsorRail.addEventListener('focusout',()=>setTimeout(()=>departureFocused=sponsorRail.contains(document.activeElement),0));
sponsorRail.addEventListener('click',e=>{let b=e.target.closest('[data-departure]');if(!b)return;if(b.dataset.departure==='pause'){departurePaused=!departurePaused;updatePause()}else rotateDeparture(b.dataset.departure==='next'?1:-1)});
setInterval(()=>{if(!departurePaused&&!departureHovered&&!departureFocused&&!departureMotion.matches&&!sponsorRail.hidden&&!document.hidden&&!document.querySelector('#detail').open)rotateDeparture(1)},6500);
paintDeparture();
