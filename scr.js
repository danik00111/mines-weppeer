document.addEventListener('click',()=>{
  let idek = !(document.querySelector('#custom:checked'));
  document.querySelector('input#width').disabled = idek;
  document.querySelector('input#height').disabled = idek;
  document.querySelector('input#mines').disabled = idek;
});
const getCell=(x,y)=>document.querySelector(`row[pos="${y}"] cell[pos="${x}"]`);
const neighbourlib = [
  {x:-1,y:-1},
  {x:-1,y: 0},
  {x:-1,y: 1},
  {x: 0,y: 1},
  {x: 1,y: 1},
  {x: 1,y: 0},
  {x: 1,y:-1},
  {x: 0,y:-1},
];
const numbor = (x,y) => {
  let count = 0;
  for(let i=0;i<neighbourlib.length;i++)try{
    if(isMine[y+neighbourlib[i].y][x+neighbourlib[i].x])count++
  }catch(e){/*ignore error*/}
  return count;
}
let gamestate = 'waiting';
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
  //^ return if h
  if(gamestate=='waiting') gameStart(
    [...document.querySelectorAll('row')].length,
    [...document.querySelector('row').querySelectorAll('cell')].length,
    parseInt(document.getElementById('minecount').innerHTML),
  x,y);
  //^ start the game if its the first click
  if(isMine[y][x]){
    clearInterval(timer);
    time=0;
    gamestate = 'kaboom';
  
    getCell(x,y).classList.add('explo');
    for(let i=0;i<minespots.length;i++)getCell(minespots[i].x,minespots[i].y).classList.add('mine');
    minespots = [];
    isMine = undefined;
  };
  //^ blow the player's house up if they click a mine
  if(numbor(x,y)>0){
    getCell(x,y).setAttribute("n",numbor(x,y)); // i couldve just done a `count || ''`, but i need to stuff more logic inside this
  } else {
    getCell(x,y).setAttribute("n",'');
    const queue=[{x,y}];
    while(queue.length){
      const{x:cX,y:cY}=queue.shift();
      for(let i=0;i<neighbourlib.length;i++){
        const nX=cX+neighbourlib[i].x;
        const nY=cY+neighbourlib[i].y;
        if((nX>=0)&&(nY>=0)&&(nX<width)&&(nY<height))if((getCell(nX,nY).getAttribute('n')===null)){
          const nC=numbor(nX,nY);
          if(nC>0){
            getCell(nX,nY).setAttribute('n',nC.toString())
          }else{
            getCell(nX,nY).setAttribute('n','');
            queue.push({"x":nX,"y":nY});
          }
        }
        try{getCell(nX,nY).classList.remove('flag')}catch(e){/*ignore and opt out*/};
      }
    }
  }
  //^ display the numbor, and if it's a 0, trigger a nuclear chain reaction
  if([...document.querySelectorAll('cell:not([n])')].length == minespots.length) {
    for(let i=0;i<minespots.length;i++)getCell(minespots[i].x,minespots[i].y).classList.add('hooray');
    clearInterval(timer); gamestate = 'yahoo';
  }
  //^ if amt of unopen cells = amt of mines on the board total then a winner is you
}

let minespots = [];
let timer;
let time;
const gameStart = (minecount,firstClickX,firstClickY) => {
  time = 0;
  timer = setInterval(()=>{time++;document.getElementById('timer').innerHTML=time},1000);
  gamestate = 'on';
  let aray = []; let msp = [];
  //^ restart a game if one is ongoing
  for(let v=0;v<width;v++) for(let g=0;g<height;g++) aray.push({"x":v,"y":g});
  // ^ makes an array of objects with every pair of x and y in range specified
  let i=0;
  // ^ the i has to be accessed later, so here
  for(;i<aray.length;i++) if(aray[i].x===firstClickX && aray[i].y===firstClickY) break;
  // ^ find the {x,y} object corresponding to the user's first click,
  aray.splice(i,1);
  // ^ and remove it. (does nothing for invalid input.)
  for(let counter=minecount;counter>0;counter--) msp.push(aray.splice(Math.floor(Math.random()*aray.length),1)[0]);
  // ^ take n random elements from the array of {x,y} objects
  minespots = msp;
  aray = [...Array(height)].map(_=>Array(width).fill(0));
  // ^ make a matrix with all zeros of specified size
  for(let l=0;l<minecount;l++) aray[msp[l].y][msp[l].x] = 1;
  // ^ on each iteration, change one number in the matrix to one according to arr of obj
  isMine = aray;
}
let width; let height;
const makeboard = (w,h,m) => {
  width = w; height = h;
  gamestate = 'waiting'; isMine = undefined; time = 0; clearInterval(timer); document.getElementById('timer').innerHTML = 0;
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
}