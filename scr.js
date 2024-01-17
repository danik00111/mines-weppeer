document.addEventListener('click',()=>{
  let idek = !(document.querySelector('#custom:checked'));
  document.querySelector('input#width').disabled = idek;
  document.querySelector('input#height').disabled = idek;
  document.querySelector('input#mines').disabled = idek;
});
document.addEventListener('keypress',e=>{
  if(e.key=='z') document.getElementById('toggle-zerg').click();
  if(e.key=='l') document.getElementById('toggle-rbmlock').click();
  if(e.key=='t') document.getElementById('toggle-darkmode').click();
  if(e.key=='?') document.getElementById('hotkeys').classList.toggle('shown');
  if(e.key=='.') try{document.querySelector(':is(#difficulty-select label,cell):hover').click()}catch(_){};
  if(e.key=='Enter') try{document.querySelector('#quickend.shown').click()}catch(_){};
  if(gamestate != 'on'){
    if(e.key=='b') document.getElementById('beginner').click();
    if(e.key=='i') document.getElementById('intermediate').click();
    if(e.key=='x') document.getElementById('expert').click();
    if(e.key=='c') document.getElementById('custom').click();
  }
  console.log(e.key)
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
const vinReEval = () => {
  let count; let x; let y; let dbg = true;
  [...document.querySelectorAll('cell[n]:not([n=""])')].forEach(e=>{
    if(dbg){debugger;dbg=false}
    count = 0;
    x = parseInt(e.getAttribute('pos'));
    y = parseInt(e.parentElement.getAttribute('pos'));
    for(let i=0;i<neighbourlib.length;i++)try{
      if(isMine[y+neighbourlib[i].y][x+neighbourlib[i].x])count++;
      if(getCell(x+neighbourlib[i].x,y+neighbourlib[i].y).classList.contains("flag")) count--;
    }catch(_){/*ignore error*/}
    e.setAttribute("vin",count);
  })
}
const flagReEval = () => {document.getElementById('minecount').innerHTML=minespots.length-[...document.querySelectorAll('cell.flag')].length;if(document.getElementById('minecount').innerHTML=='0'&&gamestate=='on')document.getElementById('quickend').classList.add('shown')}
const zumbor = (x,y) => {
  let count = 0;
  for(let i=0;i<neighbourlib.length;i++)try{
    if(isMine[y+neighbourlib[i].y][x+neighbourlib[i].x])count++;
    if(getCell(x+neighbourlib[i].x,y+neighbourlib[i].y).classList.contains("flag")) count--;
  }catch(_){/*ignore error*/}
  return count;
}
const numbor = (x,y) => {
  let count = 0;
  for(let i=0;i<neighbourlib.length;i++)try{
    if(isMine[y+neighbourlib[i].y][x+neighbourlib[i].x])count++
  }catch(_){/*ignore error*/}
  return count;
}
let gamestate = 'waiting';
let isMine;
let quickend = false;
const flag_ = (x,y) => {
  if(gamestate!='on')return;
  document.getElementById('quickend').classList.remove('shown')
  if(getCell(x,y).getAttribute("n")!==null){open_(x,y,'real click');return} /* shorthand to instead goto a chord check, allows chording with rbm */
  getCell(x,y).classList.toggle('flag');
  document.getElementById('minecount').innerHTML =
  parseInt(document.getElementById('minecount').innerHTML) +
  (getCell(x,y).classList.contains('flag') ? -1 : 1)
  if(document.getElementById('minecount').innerHTML=='0') document.getElementById('quickend').classList.add('shown');
  let idke;
  for(let i=0;i<neighbourlib.length;i++){try{if(getCell(x+neighbourlib[i].x,y+neighbourlib[i].y).getAttribute("n")!==null){
    idke = parseInt(getCell(x+neighbourlib[i].x,y+neighbourlib[i].y).getAttribute("vin"));
    getCell(x+neighbourlib[i].x,y+neighbourlib[i].y).setAttribute("vin",idke+(getCell(x,y).classList.contains('flag')?-1:1));
  }}catch(_){/*ignore error*/}};
}
const open_ = (x,y,c) => {
  if(x<0||y<0||x>width||y>height)return;
  if(c=='real click'&&rbmlock&&!quickend&&gamestate=='on'&&getCell(x,y).getAttribute('n')===null){flag_(x,y);return}
  
  if(getCell(x,y).classList.contains('flag')||gamestate=='kaboom'||gamestate=='hooray')return;
  //^ return if h
  if(getCell(x,y).getAttribute("n")!==null&&getCell(x,y).getAttribute("n")!=''){
    let flagcount = [];
    for(let i=0;i<neighbourlib.length;i++){
      try{if(getCell(x+neighbourlib[i].x,y+neighbourlib[i].y).classList.contains('flag')){flagcount.push(0)}else{flagcount.push(1)}}catch(_){flagcount.push(1)}
    }
    if(getCell(x,y)===null)return; //............vvvv just in case
    if((parseInt(getCell(x,y).getAttribute("n"))>[...flagcount].filter(x=>x==0).length)||c!='real click') return;
    //^ if this check passes, then flags around cell >= mines around cell, and it was clicked by the user, so chord
    for(let i=0;i<neighbourlib.length;i++){
      if(getCell(x+neighbourlib[i].x,y+neighbourlib[i].y)!==null){
        if(flagcount[i]&&getCell(x+neighbourlib[i].x,y+neighbourlib[i].y).getAttribute("n")===null)open_(x+neighbourlib[i].x,y+neighbourlib[i].y,'chording')
      }
    }
  }
  //^ khord if the cell has enough flags around it
  if(gamestate=='waiting') gameStart(
    ((document.getElementById('custom').checked)
      ?(parseInt(document.getElementById('minecount').innerHTML))
      :(parseInt(document.querySelector('input[name="difficulty"]:checked').getAttribute('mien'))))
  ,x,y);
  //^ start the game if its the first click
  if(isMine[y][x]){
    timeEnd = Date.now();
    document.getElementById('quickend').classList.remove('shown')
    clearInterval(timer);
    time=0;
    gamestate = 'kaboom';
    getCell(x,y).classList.add('explo');
    for(let i=0;i<minespots.length;i++)getCell(minespots[i].x,minespots[i].y).classList.add('mine');
    minespots = [];
    isMine = undefined;
    document.querySelector('input[name="difficulty"]:checked').checked = false;
    realtime = timeEnd-timeStart;
    document.getElementById('timer').innerHTML = Math.floor(realtime / 1000);
    document.getElementById('decimal').innerHTML = realtime % 1000;
    document.getElementById('decimal').classList.add('shown');
    return;
  };
  //^ blow the player's house up if they click a mine
  if(numbor(x,y)>0){
    getCell(x,y).setAttribute("n",numbor(x,y));
    getCell(x,y).setAttribute("vin",zumbor(x,y));
  } else {
    getCell(x,y).setAttribute("n",'');
    getCell(x,y).setAttribute("vin",'');
    const queue=[{x,y}];
    while(queue.length){
      const{x:cX,y:cY}=queue.shift();
      for(let i=0;i<neighbourlib.length;i++){
        const nX=cX+neighbourlib[i].x;
        const nY=cY+neighbourlib[i].y;
        if((nX>=0)&&(nY>=0)&&(nX<width)&&(nY<height))if((getCell(nX,nY).getAttribute('n')===null)){
          const nC=numbor(nX,nY);
          const zC=zumbor(nX,nY);
          if(nC>0){
            getCell(nX,nY).setAttribute("n",nC)
            getCell(nX,nY).setAttribute("vin",zC)
          }else{
            getCell(nX,nY).setAttribute("n",'');
            getCell(nX,nY).setAttribute("vin",'');
            queue.push({"x":nX,"y":nY});
          }
        }
        try{getCell(nX,nY).classList.remove('flag')}catch(_){/*ignore and opt out*/};
      }
    }
    flagReEval();
    vinReEval();
  }
  //^ display the numbor, and if it's a 0, trigger a nuclear chain reaction
  if([...document.querySelectorAll('cell:not([n])')].length == minespots.length) {
    timeEnd = Date.now();
    document.getElementById('quickend').classList.remove('shown')
    for(let i=0;i<minespots.length;i++)getCell(minespots[i].x,minespots[i].y).classList.add('hooray');
    document.querySelector('input[name="difficulty"]:checked').checked = false;
    clearInterval(timer); gamestate = 'hooray';
    realtime = timeEnd-timeStart;
    document.getElementById('timer').innerHTML = Math.floor(realtime / 1000);
    document.getElementById('decimal').innerHTML = realtime % 1000;
    document.getElementById('decimal').classList.add('shown');
  }
  //^ if amt of unopen cells = amt of mines on the board total then a winner is you
}

let minespots = [];
let timer;
let time;
let timeStart;
let timeEnd;
let realtime;
const gameStart = (minecount,firstClickX,firstClickY) => {
  time = 0;
  timer = setInterval(()=>{time++;document.getElementById('timer').innerHTML=time},1000);
  gamestate = 'on';
  //^ restart a game if one is ongoing
  let aray = []; let realtimep = [];
  for(let v=0;v<width;v++) for(let g=0;g<height;g++) aray.push({"x":v,"y":g});
  // ^ makes an array of objects with every pair of x and y in range specified
  let i;
  // ^ the i has to be accessed later, so here
  (neighbourlib.concat([{x:0,y:0}])).forEach(e=>{
    for(i=0;i<aray.length;i++) if(aray[i].x===firstClickX+e.x && aray[i].y===firstClickY+e.y) break;
    // ^ find the {x,y} object corresponding to the,
    aray.splice(i,1);
  })
  // ^ and remove it. (does nothing for invalid input.)
  for(let counter=minecount;counter>0;counter--) realtimep.push(aray.splice(Math.floor(Math.random()*aray.length),1)[0]);
  // ^ take n random elements from the array of {x,y} objects
  minespots = realtimep;
  aray = [...Array(parseInt(height))].map(_=>Array(parseInt(width)).fill(0));
  // ^ make a matrix with all zeros of specified size
  for(let l=0;l<minecount;l++) aray[realtimep[l].y][realtimep[l].x] = 1;
  // ^ on each iteration, change one number in the matrix to one according to arr of obj
  isMine = aray;
  timeStart = Date.now();
}
let width; let height;
const makeboard = (w,h,m) => {
  width = w; height = h;
  gamestate = 'waiting'; isMine = undefined; time = 0; clearInterval(timer); document.getElementById('timer').innerHTML = 0;
  document.getElementById('decimal').classList.remove('shown');
  w = parseInt(w); h = parseInt(h); m = parseInt(m);
  if((w<3)||(h<3)||((m+10)>(w*h))||(m<2)||(isNaN(w))||(isNaN(h))||(isNaN(m))){
    document.querySelector('board').innerHTML='<h1>INVALID INPUT???</h1>';return}
  document.querySelector('board').innerHTML='';
  for(let i=0;i<h;i++){
    g = document.createElement('row');
    g.setAttribute("pos",i);
    g = document.querySelector('board').appendChild(g);
    for(let j=0;j<w;j++){
      r = document.createElement('cell');
      r.setAttribute("pos",j);
      r.setAttribute("onclick",`open_(${j},${i},'real click')`);
      r.setAttribute("oncontextmenu",`flag_(${j},${i});return false`);
      g.appendChild(r);
    }
  }
}
makeboard(16,16,40) // this option is checked on website load
window.addEventListener('beforeunload',e=>{if(gamestate=='on'){e.preventDefault();e.returnValue=''}});