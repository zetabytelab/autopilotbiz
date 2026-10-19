// Homepage signup box under the headline, plus the header button that scrolls to it.
// The form itself is the React SubscribeForm (components/SubscribeForm.tsx), which
// components/registry/Registry.tsx portals into [data-subscribe-mount] after mount,
// so the homepage posts to /api/subscribe exactly like every other signup box.
// Reader figure: 1,015 LinkedIn newsletter subscribers, as stated by Antonio on 19 Oct 2026
// (/workspace/sponsor/2026-10-19-sponsor-page-draft.md). Update or drop it here.
{
const PULSE_LINKEDIN_SUBSCRIBERS='1,015';
const intro=document.querySelector('.intro-copy');
if(intro&&!document.querySelector('#subscribe')){
intro.insertAdjacentHTML('beforeend',`<div class="hero-subscribe" id="subscribe" aria-labelledby="hero-subscribe-copy"><p id="hero-subscribe-copy" class="hero-subscribe-copy"><strong>Get the Autopilot Pulse:</strong> signals from the businesses that run themselves. Free${PULSE_LINKEDIN_SUBSCRIBERS?`, ${PULSE_LINKEDIN_SUBSCRIBERS} subscribers on LinkedIn`:''}.</p><div class="hero-subscribe-form" data-subscribe-mount="home_hero"></div></div>`);
}
const headerLink=document.querySelector('.mast-links a.subscribe');
if(headerLink){headerLink.setAttribute('href','#subscribe');headerLink.removeAttribute('target');headerLink.removeAttribute('rel');headerLink.textContent='Get the Pulse';headerLink.dataset.subscribeScroll='header'}
const goToSubscribe=(via)=>{
 const box=document.querySelector('#subscribe');if(!box)return false;
 // The Capital and $1B Solo Founder tabs hide the intro; go back to Companies first.
 if(!box.offsetParent)document.querySelector('.main-tabs [data-tab="Companies"]')?.click();
 box.scrollIntoView({behavior:'smooth',block:'center'});
 if(via)window.dispatchEvent(new CustomEvent('ap:subscribe-via',{detail:{target:'home_hero',placement:via}}));
 setTimeout(()=>box.querySelector('input[type=email]')?.focus({preventScroll:true}),350);
 return true;
};
document.addEventListener('click',e=>{const a=e.target.closest('[data-subscribe-scroll]');if(!a)return;if(goToSubscribe(a.dataset.subscribeScroll))e.preventDefault()});
// Arriving on /#subscribe from another page: scroll to the box (no focus, so no phone keyboard).
if(location.hash==='#subscribe')setTimeout(()=>document.querySelector('#subscribe')?.scrollIntoView({block:'center'}),60);
}
