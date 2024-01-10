function shuffle(array) {
  let copy = [];
  let n = array.length;
  while (n) copy.push(array.splice(Math.floor(Math.random() * n--), 1)[0]);
  return copy;
}
const gen = (width,height,minecount,returnObject,returnAnsi,firstClickX,firstClickY) => {
  if(width<3||height<3||minecount<=0||width*height<=minecount+1) return null;
  let aray = []; let minespots = [];
  for(let v=0;v<width;v++) for(let g=0;g<height;g++) aray.push({x:v,y:g});
  // ^ makes an array of objects with every pair of x and y in range specified
  let i=0; // The i has to be accessed later, so here.
  for(;i<aray.length;i++) if(aray[i].x===firstClickX && aray[i].y===firstClickY) break;
  // ^ Find the {x,y} object corresponding to the user's first click,
  aray.splice(i,1);
  // ^ and remove it. (does nothing for invalid input.)

  minespots = shuffle(aray).slice(-minecount);
  // ^ take n random elements from the array of {x,y} objects
  if(returnObject)return{
    "firstClick":{"x":parseInt(firstClickX)||-1,"y":parseInt(firstClickY)||-1},
    "width":width,"height":height,"minespots":minespots
  };
  aray = [...Array(height)].map(_=>Array(width).fill(0));
  // ^ make a matrix with all zeros of specified size
  for(let l=0;l<minecount;l++) aray[minespots[l].y][minespots[l].x] = 1;
  // ^ on each iteration, change one number in the matrix to one according to arr of obj
  return returnAnsi ? aray.map(x=>x.map(y=>(y==1)?"\x1b[41m  \x1b[0m":"\x1b[42m  \x1b[0m").join('')).join('\n') + '\x1b[0m' : aray;
}

class MsGame {
  #minespots;
  static #o = [
    {x:-1,y:-1},
    {x:-1,y: 0},
    {x:-1,y: 1},
    {x: 0,y: 1},
    {x: 1,y: 1},
    {x: 1,y: 0},
    {x: 1,y:-1},
    {x: 0,y:-1},
  ]
  /**
   * Generates the board.
   * @param {int} width How much elements per array (3 minimum).
   * @param {int} height How much arrays total (3 minimum).
   * @param {int} minecount How much ones in the array ((width*height)-2 maximum).
   * @param {boolean} returnObject (optional) Whether to instead return on object of form { firstClick: {x,y} || {-1,-1}, width, height, minespots: [ {}, {} ]} (takes priority over c).
   * @param {boolean} returnAnsi (optional) Whether to instead return an ANSI escape color representation of the board ("\x1b[41m  \x1b[0m", "\x1b[42m  \x1b[0m").
   * @param {int} firstClickX (optional) The x coordinate of the user's first click.
   * @param {int} firstClickY (optional) The y coordinate of the user's first click.
   * @returns null, if invalid input, an object of form {"firstClick": {"x":parseInt(firstClickX)||-1,"y":parseInt(firstClickY)||-1},"width": width,"height": height,"minespots": minespots}, else a 2D array of specified size, mostly filled with zeros, but with a specified amount of ones in random spots.
  **/
  constructor(width,height,minecount,firstClickX,firstClickY){
    if(width<3||height<3||minecount<=0||width*height<=minecount+1) return "Invalid Input";
    let aray = []; let msp = [];
    for(let v=0;v<width;v++) for(let g=0;g<height;g++) aray.push({x:v,y:g});
    // ^ makes an array of objects with every pair of x and y in range specified
    let i=0; // The i has to be accessed later, so here.
    for(;i<aray.length;i++) if(aray[i].x===firstClickX && aray[i].y===firstClickY) break;
    // ^ Find the {x,y} object corresponding to the user's first click,
    aray.splice(i,1);
    // ^ and remove it. (does nothing for invalid input.)
    for(let counter=minecount; counter>0; counter--) msp.push(aray.splice(Math.floor(Math.random()*aray.length),1)[0]);
    // ^ take n random elements from the array of {x,y} objects
    this.stats = {
      "firstClick":{"x":parseInt(firstClickX)||-1,"y":parseInt(firstClickY)||-1},
      "width":width,"height":height,
    }
    aray = [...Array(height)].map(_=>Array(width).fill(0));
    // ^ make a matrix with all zeros of specified size
    for(let l=0;l<minecount;l++) aray[msp[l].y][msp[l].x] = 1;
    // ^ on each iteration, change one number in the matrix to one according to arr of obj
    this.#minespots = aray;
    this.readable = aray;
    this.gamestate = 'on';
    this.isOpen = [...Array(height)].map(_=>Array(width).fill(0));
    if(!isNaN(firstClickX)&&!isNaN(firstClickY))this.open(firstClickX,firstClickY);
  }
  /**
   * @param {int} x The x of the cell to read.
   * @param {int} y The y of the cell to read.
   * @param {string} safemode Input a truthy value to prevent setting the gamestate to "kaboom" upon a mine.
   * @returns An integer, -1 if the cell is a mine, else the number of neighbouring cells that are mines.
   */
  info(x,y,safemode){
    if(this.#minespots[y][x]==1){if(!safemode){this.gamestate='kaboom'}return -1}
    let count = 0;
    for(let i=0;i<MsGame.#o.length;i++) try{
      if(this.#minespots[y+MsGame.#o[i].y][x+MsGame.#o[i].x]) count++;
    }catch(e){/*ignore error*/}
    return count;
  }
  /** Logs a readable map of the mines on the board.*/
  read(){console.log(this.#minespots.map(x=>x.map(y=>(y==1)?"\x1b[41m  \x1b[0m":"\x1b[42m  \x1b[0m").join('')).join('\n')+'\x1b[0m')}
  open(x,y){
    if(x<0||y<0||x>=this.stats.width||y>=this.stats.height)return;
    const queue=[{"x":x,"y":y}];
    const the = setTimeout(()=>{console.log("Don't worry, there's a 15 second timeout in case things go wrong.")},3e3);
    const an = setTimeout(() => {
      console.error("Timeout error: Flood fill didn't finish in 15 seconds..");
      console.trace("flood fill timeout trace:");
      queue.length = 0;
      this.gamestate = 'timeout';
    }, 15e3);
    while(queue.length){
      const cc=queue.shift();
      const cX=cc.x;
      const cY=cc.y;
      if (this.isOpen[cY][cX]) continue;
      this.isOpen[cY][cX]=1;
      if (this.info(cX,cY)===0){
        // Add neighboring cells to the queue
        for (let i = 0; i < MsGame.#o.length; i++) {
          const nX = cX + MsGame.#o[i].x;
          const nY = cY + MsGame.#o[i].y;
          // Check if the neighboring cell is within bounds
          if(nX>=0&&nY>=0&&nX<this.stats.width&&nY<this.stats.height)queue.push({"x":nX,"y":nY});
        }
      }
    }
    clearTimeout(the); clearTimeout(an);
  }
}

/* GAME CODE ^   v HTML CODE */

let width;
let height;
let minec;
let gameOn = false;
let game;
const resize=h=>{document.getElementById(h).style.width=document.getElementById(h).value.length+'ch';if(document.getElementById(h).style.width=='0ch')document.getElementById(h).style.width=document.getElementById(h).getAttribute('placeholder').length+'ch'};
document.addEventListener('click',()=>{
  let idek = !(document.querySelector('#custom:checked'));
  document.querySelector('input#width').disabled = idek;
  document.querySelector('input#height').disabled = idek;
  document.querySelector('input#mines').disabled = idek;
});
const createBoard = (w,h) => {
  let g;
  document.querySelector('board').innerHTML='';
  document.querySelectorAll('.temp').forEach(e=>{e.classList.remove('temp')})
  for(let i=0;i<h;i++){
    g = document.createElement('row');
    g = document.querySelector('board').appendChild(g);
    for(let j=0;j<w;j++){
      g.appendChild(document.createElement('cell'));
    }
  }
  document.querySelectorAll('row').forEach((h,i)=>{
    console.log(i);
    h.querySelectorAll('cell').forEach((e,j)=>{
    console.log(j);
  e.addEventListener('click',()=>{
    
    console.log(j,i)
    if(!document.querySelector('.temp')){
      // if(gameOn){
      // }else{
        game = new MsGame(width,height,minec,j,i);
        console.log(j,i)
        switch(game.info(j,i)){
          case -1: gameOn = false; e.style.background='red'; break;
          case 0: e.setAttribute('n',''); break;
          default: e.setAttribute('n',game.info(j,i));
        }
      // }
    }
    
  })})});
}