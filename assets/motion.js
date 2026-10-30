/* motion-pack: scroll reveal (OHANAトップ方式) */
(function(){
document.documentElement.classList.add('js');
if(!('IntersectionObserver' in window) || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
var list = Array.prototype.slice.call(document.querySelectorAll('section, footer'));
list.forEach(function(el){ el.classList.add('mrv'); });
var io = new IntersectionObserver(function(entries){
entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
}, {threshold: 0, rootMargin: '0px 0px 15% 0px'});
list.forEach(function(el){ io.observe(el); });
})();
