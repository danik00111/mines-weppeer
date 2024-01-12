document.addEventListener('click',()=>{
  let idek = !(document.querySelector('#custom:checked'));
  document.querySelector('input#width').disabled = idek;
  document.querySelector('input#height').disabled = idek;
  document.querySelector('input#mines').disabled = idek;
});
const makeboard = (w,h,m) => {
  document.querySelectorAll('.temp').forEach(e=>{e.classList.remove('temp')})
  document.querySelector('board').innerHTML='';
  for(let i=0;i<h;i++){
    g = document.createElement('row');
    g.setAttribute('pos',i);
    g = document.querySelector('board').appendChild(g);
    for(let j=0;j<w;j++){
      r = document.createElement('cell');
      r.setAttribute('pos',j);
      r.setAttribute('onclick',`open(${j},${i})`);
      g.appendChild(r);
    }
  }
  console.log(`${w}x${h}&${m}`)
}
// const open = (x,y) => {
//   console.log(x+','+y)
// }