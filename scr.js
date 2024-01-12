document.addEventListener('click',()=>{
  let idek = !(document.querySelector('#custom:checked'));
  document.querySelector('input#width').disabled = idek;
  document.querySelector('input#height').disabled = idek;
  document.querySelector('input#mines').disabled = idek;
});
const getCell=(x,y)=>document.querySelector(`row[pos="${y}"] cell[pos="${x}"]`)
const neighbourlib = [
  {x:-1,y:-1},
  {x:-1,y: 0},
  {x:-1,y: 1},
  {x: 0,y: 1},
  {x: 1,y: 1},
  {x: 1,y: 0},
  {x: 1,y:-1},
  {x: 0,y:-1},
]
let gameOn = false;
let isMine;
const flag_ = (x,y) => {
  if(getCell(x,y).getAttribute("n")!==null)return;
  getCell(x,y).classList.toggle('flag');
  document.getElementById('minecount').innerHTML =
    parseInt(document.getElementById('minecount').innerHTML) +
      (getCell(x,y).classList.contains('flag') ? -1 : 1)
}
const open_ = (x,y) => {
  if(getCell(x,y).classList.contains('flag') || getCell(x,y).getAttribute("n")!==null)return;
  console.log('opening',x+','+y)

  if(!gameOn) gameStart(
    [...document.querySelectorAll('row')].length,
    [...document.querySelector('row').querySelectorAll('cell')].length,
    parseInt(document.getElementById('minecount').innerHTML),
  x,y);

  if(isMine[y][x]){
    clearInterval(timer);
    time=0;
    gameOn = false;
    getCell(x,y).classList.add('explo');
    for(let i=0;i<minespots.length;i++)getCell(minespots[i].x,minespots[i].y).classList.add('mine');
    minespots = [];
    isMine = undefined;
  };

  let count = 0;
  for(let i=0;i<neighbourlib.length;i++) try{
    if(isMine[y+neighbourlib[i].y][x+neighbourlib[i].x]) count++;
  }catch(e){/*ignore error*/}

  getCell(x,y).setAttribute("n",count||'');

  if([...document.querySelectorAll('cell:not([n])')].length == minespots.length) {
    for(let i=0;i<minespots.length;i++)getCell(minespots[i].x,minespots[i].y).classList.add('hooray');
    clearInterval(timer);
  }

}
let minespots = [];
let timer;
let time;
const gameStart = (width,height,minecount,firstClickX,firstClickY) => {
  time = 0;
  timer = setInterval(()=>{time++;document.getElementById('timer').innerHTML=time},1000);
  gameOn = true;
  console.log('game on');

  let aray = []; let msp = [];
  for(let v=0;v<width;v++) for(let g=0;g<height;g++) aray.push({"x":v,"y":g});
  // ^ makes an array of objects with every pair of x and y in range specified
  let i=0;
  // ^ the i has to be accessed later, so here
  for(;i<aray.length;i++) if(aray[i].x===firstClickX && aray[i].y===firstClickY) break;
  // ^ find the {x,y} object corresponding to the user's first click,
  aray.splice(i,1);
  // ^ and remove it. (does nothing for invalid input.)
  for(let counter=minecount; counter>0; counter--) msp.push(aray.splice(Math.floor(Math.random()*aray.length),1)[0]);
  // ^ take n random elements from the array of {x,y} objects
  minespots = msp;
  aray = [...Array(height)].map(_=>Array(width).fill(0));
  // ^ make a matrix with all zeros of specified size
  for(let l=0;l<minecount;l++) aray[msp[l].y][msp[l].x] = 1;
  // ^ on each iteration, change one number in the matrix to one according to arr of obj
  isMine = aray;

}
const makeboard = (w,h,m) => {
  gameOn = false; isMine = undefined;
  w = parseInt(w); h = parseInt(h); m = parseInt(m);
  if((w<3)||(h<3)||((m+2)>(w*h))||(m<2)||(isNaN(w))||(isNaN(h))||(isNaN(m))){
    document.querySelector('board').innerHTML='<h1>INVALID INPUT???</h1>';return}
  document.querySelector('board').innerHTML='';
  for(let i=0;i<h;i++){
    g = document.createElement('row');
    g.setAttribute('pos',i);
    g = document.querySelector('board').appendChild(g);
    for(let j=0;j<w;j++){
      r = document.createElement('cell');
      r.setAttribute('pos',j);
      r.setAttribute('onclick',`open_(${j},${i})`);
      r.setAttribute('oncontextmenu',`flag_(${j},${i});return false`);
      g.appendChild(r);
    }
  }
  console.log(`${w}x${h}&${m}`)
}