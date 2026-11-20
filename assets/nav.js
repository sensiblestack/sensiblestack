document.addEventListener('click',function(e){
  var link=e.target.closest('.hasdrop > a');
  document.querySelectorAll('.hasdrop.open').forEach(function(el){
    if(!link||el!==link.parentElement){el.classList.remove('open');}
  });
  if(link&&!link.parentElement.classList.contains('open')){
    e.preventDefault();
    link.parentElement.classList.add('open');
  }
});
