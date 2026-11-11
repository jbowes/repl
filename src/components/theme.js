import React from 'react';

// Runs blocking in <head>, before first paint, so the saved theme is applied
// without a flash. "system" (or no saved choice) leaves data-theme unset so
// the prefers-color-scheme media query in CSS decides.
export const themeInit = `(function(){
var d=document.documentElement,m=window.matchMedia('(prefers-color-scheme: dark)');
function get(){try{var t=localStorage.getItem('theme');return t==='light'||t==='dark'?t:'system'}catch(e){return 'system'}}
function apply(t){
if(t==='system')d.removeAttribute('data-theme');else d.setAttribute('data-theme',t);
var dark=t==='dark'||(t==='system'&&m.matches),ms=document.querySelectorAll('meta[name=theme-color]');
for(var i=0;i<ms.length;i++)ms[i].setAttribute('content',t==='system'?ms[i].getAttribute('data-c'):dark?'#0d1315':'#2d4247');
}
window.__setTheme=function(t){try{t==='system'?localStorage.removeItem('theme'):localStorage.setItem('theme',t)}catch(e){}apply(t)};
window.__getTheme=get;
apply(get());
})();`;

const wire = `(function(){var s=document.getElementById('theme-select');if(!s||!window.__getTheme)return;
s.value=window.__getTheme();s.hidden=false;
s.addEventListener('change',function(){window.__setTheme(s.value)});})();`;

// Hidden until JS enables it, since it does nothing without JS.
export const ThemeToggle = () => (
  <div className="mh5-l mh4-m mh3 pt2 tr f7">
    <select id="theme-select" className="theme-toggle" aria-label="Color theme" hidden defaultValue="system">
      <option value="system">System theme</option>
      <option value="light">Light theme</option>
      <option value="dark">Dark theme</option>
    </select>
    <script dangerouslySetInnerHTML={{ __html: wire }} />
  </div>
);
