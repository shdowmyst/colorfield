  var xSize = 16;
  var ySize = 12; //not the actual values, see setCanvas()
  var tileSize = 50; //make sure it can be devided by 5
  var canvas = document.getElementById('gameField');
  var scoreCanvas = document.getElementById('scoreField').getContext('2d');
  var ctx = canvas.getContext('2d');
  var nextGrid = [];
  var resizeId;

  makeGrid.colors = 6; //amount of colors
  makeGrid.tilesLeft = 0; //when this reach xSize * ySize, all tiles done loading.
  nextMatrix.highestCluster = 0;
  highScore.totalScore = 0;
  writeScore.score = 0;
  difficulty.removal = { value:0,color:0 } 
  difficulty.setting = 4; // 1: every 3 tile let you remove a single one. //2 same color as last 3 tiles //3 removes limited by number of colors //4 same, but also limited by color  last 3tile //5 no removes at all.
  
 //menu stuff

  var gameoverBox, settingsBox, helpBox, helpBoxNext;
  var gameoverText, difficultyText, colorText;

//fps limiter

  var frameCount = 0;
  var fps, fpsInterval, startTime, nowTime, thenTime, elapsedTime;

  setMenu.area = {state:0};

  var gameOverSprite = new Image();
  gameOverSprite.src = 'allClear-next.png';

  var scoreBack = new Image();
  scoreBack.src = 'score.png';

  var settingsSprite = new Image();
  settingsSprite.src = 'settings-next.png';

  var helpSprite = new Image();
  helpSprite.src = 'help.png';

  var helpNextSprite = new Image();
  helpNextSprite.src = 'help-next.png';


class tile {
  
  constructor(fx,fy,nx,ny,color,state) {
    this.fx = fx * tileSize;
    this.fy = fy * tileSize;
    this.nx = nx * tileSize;
    this.ny = ny * tileSize;
    this.color = color;
    this.cluster = 0;
    this.state = state; // 0: hidden, removed, 1: needs to fade out, 2: active, 3: load in anim at start, 4: load out anim, at end.
    this.size = tileSize;
    }
     
  moveTile() {
  if (this.fx > this.nx) { this.fx -= 5;  }
  if (this.fy < this.ny) { this.fy += 5;  }
  }

  loadTiles() {
  if (this.size < tileSize && Math.random() > 0.8 ) { this.size += 5 }
  if (this.size == tileSize) {this.state = 2; makeGrid.tilesLeft++  }
  if ( makeGrid.tilesLeft == xSize * ySize) { assingEventListener("game"); }
  }
  
  unLoadTiles() {
  if (this.size > 5 && Math.random() > 0.8 ) { this.size -= 5 }
  if (this.size <= 5) {this.state = 0;  makeGrid.tilesLeft-- }
  if ( makeGrid.tilesLeft == 0) { resetTiles() }
  }

  scaleTile() {
  if (this.size > 5) {
    this.size -= 5;
    }
  if (this.size <= 10)  {this.state = 0}
  }
    
  show() {
          
          let hue;
          let offset = 0;
          if(this.size < tileSize) { offset = (tileSize - this.size) / 2 }
  
          switch (this.color) {
        case 1:
          hue = "194,100%,71%" ;
          break; //blue
        case 2:
          hue = "56,100%,72%";
          break; //yellow
        case 3:
          hue = "41,100%,67%";
          break; //orange
        case 4:
          hue = "133,58%,56%";
          break; //green
        case 5:
          hue = "354,100%,74%";
          break; //red
        case 6:
          hue = "208,40%,49%";
          break; //darkblue
        case 7:
          hue = "173,100%,74%"; 
          break; //light blue
        case 8:
          hue = "132,45%,47%";
          break; //dark green
        default: hue = "0,100%,100%"; //  return 0; // hue = "0,100%,100%";
          }
    
  ctx.fillStyle = "hsl(" + hue + ")";
  ctx.fillRect(this.fx + offset, this.fy + offset, this.size, this.size); //x,y, size x, size y 
    
 //   ctx.fillStyle = "black";
 //    ctx.font = "12px Arial";
 //    ctx.fillText(  /* yi + ':' + xi  's:' + this.state + */  ' c:' + this.cluster, this.fx, this.fy + 25)
  }
}

class menu {

  constructor(x,y,width,height,frames,image,name) {
    this.x = x - (width / 2)  ;
    this.y = y - (height / 2) ;
    this.width = width;
    this.height = height;
    this.image = image;
    this.frames = frames - 1; //amount of frames.
    this.frameIndex = 0;
    this.fps = 3;  //update rate
    this.count = 0; //actual fps (usually 60)
    this.state = 0; //0 invisible, 1 play forward, 2 display last frame, 3. play backwards.
    this.name = name;
    }

  //play it once than pass it to show. (change state to 2)
  playForward() {

      this.count++
      if (this.count == this.fps) {

      this.count = 0; 
      this.frameIndex++;

      if (this.frameIndex == this.frames) { this.state = 2; assingEventListener(this.name); } //animation ended, assign event listener to menu function.
      } 

      ctx.drawImage(this.image, this.frameIndex * this.width , 0 , this.width , this.height , this.x , this.y , this.width , this.height )
  }

  reset() {
    this.count = 0;
    this.frameIndex = 0;
    }

  //show last frame
  show() {
        this.reset()
      ctx.drawImage(this.image, this.frames * this.width , 0 , this.width , this.height , this.x , this.y , this.width , this.height )
  }

  //play it backwards and hide (set state to 0)
  playBackward() {

      this.count++
      if (this.count == this.fps) { 

      this.count = 0; 
      this.frameIndex++;
      
      } 

      ctx.drawImage(this.image, (this.frames - this.frameIndex) * this.width , 0 , this.width , this.height , this.x , this.y , this.width , this.height)
  
      if (this.frameIndex == this.frames) { this.state = 0; this.reset(); }

    }
}

class menuText {

  constructor(text,x,y) {
  this.text = text;
  this.x = x;
  this.y = y;
  this.alpha = 0;
  }

  fadeIn() {

  if (this.alpha < 1) {this.alpha += 0.1}

  }

  fadeOut() {

  if (this.alpha > 0) {this.alpha -= 0.1}
    
  }


  show(text) {

   ctx.fillStyle = "hsla(189,100%,45%," + this.alpha + ")";

    ctx.font = "24px fixedSysEx";
    ctx.fillText(  text || this.text , this.x , this.y)

  }
}

function setCanvasSize() {

  xSize = Math.trunc ( window.innerWidth / 50 ) // window.innerWidth > 1366 ? 27 :
  ySize = Math.trunc ( (window.innerHeight-25) / 50 ) // (window.innerHeight-15) > 768 ? 15 :
  
  scoreCanvas.canvas.width  = 320 // xSize * 50;
  scoreCanvas.canvas.height = 25;
  
  ctx.canvas.width  = xSize * 50
  ctx.canvas.height = ySize * 50

  ctx.textAlign = "center";

  scoreCanvas.textAlign = "center";
  scoreCanvas.font = "16px fixedSysEx";

  ctx.imageSmoothingEnabled = false;
  scoreCanvas.imageSmoothingEnabled = false;
}

function setMenu() {

  let midX = ctx.canvas.width / 2
  let midY = ctx.canvas.height / 2

  gameoverBox = new menu( midX , midY , 300,200,10,gameOverSprite,"gameOver"); //x, y, frame width, frame height, number of frames, name of the frame sprite.

  gameoverText = new menuText("Here we go!", midX , midY - 45 ) //text, x,y
  highScoreText = new menuText("zero", midX , midY - 10 )

  
  difficultyText = new menuText( difficulty.setting, midX,midY - 10 )
  colorText = new menuText( makeGrid.colors, midX,midY -113 )
 
  settingsBox = new menu( midX , midY , 300,450,16,settingsSprite,"settings");
  settingsBox.fps = 2;

  helpBox = new menu( midX , midY , 300,450,16,helpSprite,"settings");
  helpBox.fps = 2;

  helpBoxNext = new menu( midX , midY , 300,450,16,helpNextSprite,"settings");
  helpBoxNext.fps = 2;
}

function makeGrid() {

  for (let y = 0; y < ySize; y++) {
    nextGrid[y] = [];
    for (let x = 0; x < xSize; x++) {
     
     let color = Math.floor(Math.random() * makeGrid.colors) + 1;
     nextGrid[y][x] = new tile(x,y,x,y,color,3) //fx,fy,nx,ny,c,state
     nextGrid[y][x].size = 0;
}}}

//yeeah, no. or yes.
function nextMatrix() {

  function goBack(leftCluster,upCluster) {

    for (let y = 0; y < ySize; y++) {
      for (let x = 0; x < xSize; x++) {

      if (nextGrid[y][x].cluster == leftCluster && nextGrid[y][x].state >= 2) {
      nextGrid[y][x].cluster = upCluster;
      }
      }}
  }
  
  let cluster = 0;

   for (let y = 0; y < ySize; y++) {
     for (let x = 0; x < xSize; x++) {
     
      let up = {}
      let down = {}
      let left = {}

     let thisTile = nextGrid[y][x]
     if(thisTile.state >= 2) {  

      if (y && nextGrid[y-1][x].state >= 2) { up = nextGrid[y-1][x] } //up 
      if (x && nextGrid[y][x-1].state >= 2) { left = nextGrid[y][x-1] } //left 


           if ( thisTile.color == up.color && thisTile.color == left.color) { thisTile.cluster = up.cluster; goBack(left.cluster,up.cluster) }
      else if ( thisTile.color == left.color ) { thisTile.cluster = left.cluster }
      else if ( thisTile.color == up.color ) { thisTile.cluster = up.cluster }  
      else {  thisTile.cluster = ++cluster }
      }
    } 
  }
  nextMatrix.highestCluster = cluster;
}

function renderTiles() {

  ctx.clearRect(0, 0, xSize * 50, ySize * 50);

    for (let y = 0; y < ySize; y++) {
     for (let x = 0; x < xSize; x++) {
      
      let ThisTile = nextGrid[y][x];
   
      switch (ThisTile.state) {
      case 4: ThisTile.unLoadTiles(); ThisTile.show(); break;
      case 3: ThisTile.loadTiles(); ThisTile.show(); break;
      case 2: ThisTile.moveTile();ThisTile.show(); break;
      case 1: ThisTile.scaleTile();ThisTile.show(); break;
      // case 0: endless(x,y); break; //endless mode
      }
      }}

        switch (gameoverBox.state) {
        case 1: gameoverBox.playForward(); 
                gameoverText.fadeIn(); 
                gameoverText.show(); 
                break;
        
        case 2: gameoverBox.show(); 
                gameoverText.show(); 
                highScoreText.fadeIn(); 
                highScoreText.show("score:" + writeScore.score ); 
                break;
        
        case 3: gameoverBox.playBackward(); 
                gameoverText.fadeOut(); 
                highScoreText.fadeOut(); 
                gameoverText.show(); 
                break;
        }

        switch (settingsBox.state) {
          case 1: settingsBox.playForward();

                  colorText.fadeIn( makeGrid.colors );
                  colorText.show( makeGrid.colors ); 

                  difficultyText.fadeIn( difficulty.setting );
                  difficultyText.show( difficulty.setting ); 
                  break;

          case 2: settingsBox.show(); 
                  colorText.show( makeGrid.colors ); 
                  difficultyText.show( difficulty.setting ); 
                  break;

          case 3: settingsBox.playBackward();

                  colorText.fadeOut( makeGrid.colors );
                  colorText.show( makeGrid.colors ); 

                  difficultyText.fadeOut( difficulty.setting );
                  difficultyText.show( difficulty.setting ); 
                  break;
          }
          
        switch (helpBoxNext.state) {
        case 1: helpBoxNext.playForward(); 
                break;
        
        case 2: helpBoxNext.show(); 
                break;
        
        case 3: helpBoxNext.playBackward(); 
                break;
        }

        switch (helpBox.state) {
        case 1: helpBox.playForward(); 
                break;
        
        case 2: helpBox.show(); 
                break;
        
        case 3: helpBox.playBackward(); 
                break;
        }
      
    //  clickBoxHelper()

      clickConfirm();

     writeScore();
     
//  requestAnimationFrame(renderTiles) 
}

function endless(x,y) {

     makeGrid.tilesLeft++
     let color = Math.floor(Math.random() * makeGrid.colors) + 1;
     nextGrid[y][x] = new tile(x,y-1,x,y,color,2) //fx,fy,nx,ny,c,state
}

function sortColors() { // color sorting.

    let ncolors = [0,0,0,0,0,0,0,0,0]; 

    for (let y = 0; y < ySize; y++) {
        for (let x = 0; x < xSize; x++) {

        ncolors[nextGrid[y][x].color]++ // calculate the amount of colors
       }}

    let z = 1;

    for (let y = 0; y < ySize; y++) {
        for (let x = 0; x < xSize; x++) {

            if (ncolors[z] > 0) {

                nextGrid[y][x].color = z;
                ncolors[z]--;
            } else {
                nextGrid[y][x].color = z;
                z++                
            }}}

nextMatrix();
console.log("sorted!");
}

function highScore(x) {

  let score = Math.pow((x-1),2) * makeGrid.colors
  //let score = Math.pow((x-1),(makeGrid.colors / 4)) * makeGrid.colors
  highScore.totalScore += score;
}

function writeScore() {
  
    if (highScore.totalScore - writeScore.score > 1000) {writeScore.score += 1000 }
      else if (highScore.totalScore - writeScore.score > 100) {writeScore.score += 100 }
      else if (highScore.totalScore - writeScore.score > 10) {writeScore.score += 10 }
      else if ( writeScore.score < highScore.totalScore ) { writeScore.score++ }

      scoreCanvas.clearRect(0, 5, 320, 20);
      scoreCanvas.drawImage(scoreBack,0,5)

     if (difficulty.setting == 2 || difficulty.setting == 4) {
          
          let hue;
          
          switch (difficulty.removal.color) {
        case 1:
          hue = "194,100%,71%" ;
          break; //blue
        case 2:
          hue = "56,100%,72%";
          break; //yellow
        case 3:
          hue = "41,100%,67%";
          break; //orange
        case 4:
          hue = "133,58%,56%";
          break; //green
        case 5:
          hue = "354,100%,74%";
          break; //red
        case 6:
          hue = "208,40%,49%";
          break; //darkblue
        case 7:
          hue = "173,100%,74%"; 
          break; //light blue
        case 8:
          hue = "132,45%,47%";
          break; //dark green
         default: hue = "201,49%,52%"; break;
          }

            if (!difficulty.removal.value) { hue = "201,49%,52%"; }

            scoreCanvas.fillStyle = "hsl(" + hue + ")";
            scoreCanvas.fillRect(112,5,96,15); //x,y, size x, size y 
            scoreCanvas.fillRect(111,6,98,13);
    }   
    scoreCanvas.fillStyle = "#244b6e";
    scoreCanvas.fillText(writeScore.score,60,17)
    scoreCanvas.fillText(makeGrid.tilesLeft,235,17)
    scoreCanvas.fillText(difficulty.removal.value,160,17) //text,x,y
}
     
function assingEventListener(call) {

      if (settingsBox.state == 2 && call === "game") { return } 
  
      canvas.addEventListener('contextmenu', rightClick);
      document.getElementById('scoreField').addEventListener('click', rightClick) ;
  
      canvas.removeEventListener('click', settingsClick)
      canvas.removeEventListener('click', gameOverClick)
      canvas.removeEventListener('click', gameClick)
      canvas.removeEventListener('click', gameClick)
  
      switch (call) { //tiles done loading, play ball!
      case "game":
      canvas.addEventListener('click', gameClick)
      break;
      case "gameOver": //menu is open
      canvas.addEventListener('click', gameOverClick)
      break;
      case "settings":
      canvas.addEventListener('click', settingsClick)
      }
}

function gameClick(e) {
    
  var cord = {
    x: Math.trunc((e.clientX - canvas.offsetLeft + window.pageXOffset) / tileSize),
    y: Math.trunc((e.clientY - canvas.offsetTop + window.pageYOffset) / tileSize) }

  var sigh = []; //very poor method to fix a animation error when there is same color left in a single column.
  var thisTile = nextGrid[cord.y][cord.x];
  var score = 0;

  if (thisTile.state == 2) {
     
   var thisCluster = thisTile.cluster;
   
  switch ( difficulty.setting ) {
    case 1:   
    case 3: if (difficulty.removal.value) { break; };
    case 2:
    case 4: if (difficulty.removal.value && difficulty.removal.color == thisTile.color ) { break; }
    case 5: if ( cord.y && nextGrid[cord.y-1][cord.x].cluster == thisTile.cluster || 
                 cord.x && nextGrid[cord.y][cord.x-1].cluster == thisTile.cluster || 
                 cord.y < ySize-1 && nextGrid[cord.y+1][cord.x].cluster == thisTile.cluster || 
                 cord.x < xSize-1 && nextGrid[cord.y][cord.x+1].cluster == thisTile.cluster ) { break; }
    case 6: return;
  }
    
    //recalculate array starts here.

    for (let y = 0; y < ySize; y++) {
      for (let x = 0; x < xSize; x++) {
              
        if (nextGrid[y][x].cluster == thisCluster) {
       
        score++

          if (y && nextGrid[y-1][x].state == 2 ) { //if its not the first row, shift every X tile down and color the one above 0.
           let yUp = y;
           
           while (yUp) {
              let yUpm = yUp - 1;
              nextGrid[yUp][x] = nextGrid[yUpm][x];  // f*^˘ you cross referenc, and everything you represent
              nextGrid[yUp][x].ny = yUp * tileSize;
              nextGrid[yUpm][x] = new tile(x,y,x,y,thisTile.color,1); //fx,fy,nx,ny,color,exist

              yUp-- 
              }
          }  
          else if ( nextGrid[y][x].state == 2 ) { //if its first row, simply color it 0
             nextGrid[y][x].state = 1; 
             nextGrid[y][x].cluster = 0;
          }
        }
    }}
  } else { return }

        for (var xLastLine = xSize - 2, GridYsize = ySize - 1 ; xLastLine >= 0; xLastLine--) {
      
          if (nextGrid[GridYsize][xLastLine].state == 1) {
      
            for (let y = 0; y < ySize; y++) {
              for (let x = xLastLine, lastX = xLastLine - x ; x < xSize; x++) {
      
                if( x == xLastLine ) { sigh[y] = nextGrid[y][xLastLine].state; }
      
                  if (x+1 < xSize) {
                  nextGrid[y][x] = nextGrid[y][x+1];
                  nextGrid[y][x].nx = x * tileSize;
                  }
                  else { 
                  nextGrid[y][x] = new tile(xLastLine,y,xLastLine,y,thisTile.color,sigh[y]);
                  }
            }}
          }
    } 

  makeGrid.tilesLeft -= score;
  difficulty(score,thisTile.color); //calcualte removes
  nextMatrix(); //redo cluster matrix.
  gameOver(); //check  if its end of the game.
  
  if (score > 1) { highScore(score) } //calculate score
}

function gameOver() {

  function setOver() {
  gameoverBox.state = 1; 
  gameoverText.text = makeGrid.tilesLeft ? "No more moves." : "All clear!"; 
 
 }

  if (makeGrid.tilesLeft == 0 || (difficulty.removal.value == 0 && nextMatrix.highestCluster == makeGrid.tilesLeft) ) { setOver(); return; }

    switch (difficulty.setting) {
    case 2:
    case 4: if ( nextMatrix.highestCluster == makeGrid.tilesLeft ) {

          for (let y = ySize - 1; y >= 0; y--) {
            for (let x = xSize - 1; x >= 0; x--) {
              
            if (nextGrid[y][x].state == 2 && nextGrid[y][x].color == difficulty.removal.color ) { return }
            }} setOver(); break;
          } 
    }
}

function difficulty(score,color) {

  if (difficulty.setting < 5) {
      if (score == 1) { difficulty.removal.value-- }
      if (score > 2) { difficulty.removal.value += Math.trunc(score/3); difficulty.removal.color = color; }
      if (difficulty.setting >= 3) { difficulty.removal.value = Math.min(difficulty.removal.value,makeGrid.colors) }  
      }
  else { difficulty.removal.value = 0; }
}

function rightClick(e) {
  
  e.preventDefault();
  assingEventListener("none");

  if (settingsBox.state == 0) { 
      
      settingsBox.state = 1; 
        if (gameoverBox.state == 2) {gameoverBox.state = 3;}
        
  } else { 

        if (helpBox.state == 2) {settingsBox.state = 0; helpBox.state = 3;}
        else if (helpBoxNext.state == 2) {settingsBox.state = 0; helpBoxNext.state = 3;}
        else { settingsBox.state = 3; }
    assingEventListener("game"); 
    gameOver();
    }
}

function clickBoxHelper() {

  let x = ctx.canvas.width / 2
  let y = ctx.canvas.height / 2

  //offsett
  let xo = -104
  let yo = 52

  // size of the button
  let sx = 115;
  let sy = 41;

  ctx.fillStyle = "hsla(181,100%,48%,0.5)";
  ctx.fillRect( x+xo,  y+yo,  sx ,  sy ) // reset button

  // console.log( "setMenu.area = { x:x+" + xo + ",y:y+" + yo + ",sx:" + sx + ",sy:" + sy + ", )" );
  //  console.log( "coords.x > x+" + xo + "&& coords.y > y+" + yo + "&& coords.x < x+" + (xo+sx) + "&& coords.y < y+" + (yo+sy)  )
}

function gameOverClick(e) {

  let x = ctx.canvas.width / 2
  let y = ctx.canvas.height / 2

  let coords = {
    x: e.clientX - canvas.offsetLeft,
    y: e.clientY - canvas.offsetTop }

    if (gameoverBox.state == 2 && coords.x > x+38 && coords.y > y+16  && coords.x < x+118 && coords.y < y+57) {  //reset button on game over box

      setMenu.area = { x:x+38,y:y+16,sx:80,sy:41, state:1 } //reset button area
      
      gameoverBox.state = 3;
      resetTiles();
    
    }
    else if ( gameoverBox.state == 2 && coords.x > x-118 && coords.y > y+16  && coords.x < x-38 && coords.y < y+57  )  { //menu botton on game over box

      setMenu.area = { x:x-118,y:y+16,sx:80,sy:41, state:1 }

      settingsBox.state = 1; // 1 intro, 2 stay, 3 outro
      gameoverBox.state = 3; //gameover outro
    }
}

function settingsClick(e) {

  let x = ctx.canvas.width / 2
  let y = ctx.canvas.height / 2

  let coords = {
    x: e.clientX - canvas.offsetLeft,
    y: e.clientY - canvas.offsetTop }

    if (helpBox.state == 2)  {

      if ( coords.x > x-40 && coords.y > y+141  && coords.x < x+40 && coords.y < y+182  ) { //help box first page next button
      
      setMenu.area = { x:x-40,y:y+141,sx:80,sy:41, state:1 }
      helpBoxNext.state = 1;
      helpBox.state = 3;
      
      }
    }
    else if(helpBoxNext.state == 2) {

      if ( coords.x > x-40 && coords.y > y+141  && coords.x < x+40 && coords.y < y+182  ) { //help box first page next button
      
      setMenu.area = { x:x-40,y:y+141,sx:80,sy:41, state:1 }
      helpBoxNext.state = 3;
      }
    }

    else if(settingsBox.state == 2)  {

        if (coords.x > x-118 && coords.y > y+141  && coords.x < x-38 && coords.y < y+182  )  { //back button on settings box.

          setMenu.area = { x:x-118,y:y+141,sx:80,sy:41, state:1 }
          settingsBox.state = 3;
          assingEventListener("game");
          gameOver();
        }
        else if (coords.x > x+38 && coords.y > y+141  && coords.x < x+118 && coords.y < y+182  )  { //reset button on settings box.

          setMenu.area = { x:x+38,y:y+141,sx:80,sy:41, state:1 }

          settingsBox.state = 3;
          resetTiles();
        }
        else if (coords.x > x-98 && coords.y > y-38  && coords.x < x-57 && coords.y < y+3 )  { //difficulty setting down.

          if (difficulty.setting > 1) {
          setMenu.area = { x:x-98,y:y-38,sx:41,sy:41, state:1 }
          settings("difficulty",-1)
          }

        }
        else if (coords.x > x+57 && coords.y > y-38  && coords.x < x+98 && coords.y < y+3 )  { //difficulty setting up.

          if (difficulty.setting < 5) {
          setMenu.area = { x:x+57,y:y-38,sx:41,sy:41, state:1 }
          settings("difficulty",+1)
          }
        
        }
        else if (coords.x > x-98 && coords.y > y-140  && coords.x < x-57 && coords.y < y-99 )  { //color setting down.

          if (makeGrid.colors > 2) {
          setMenu.area = { x:x-98,y:y-140,sx:41,sy:41, state:1 }
          settings("colors",-1)
          }

        }
        else if (coords.x > x+57 && coords.y > y-140  && coords.x < x+98 && coords.y < y-99 )  { //color setting up.

          if (makeGrid.colors < 8) {
          setMenu.area = { x:x+57,y:y-140,sx:41,sy:41, state:1 }
          settings("colors",+1)
          }
        
        }
        else if (coords.x > x+24 && coords.y > y+52  && coords.x < x+104 && coords.y < y+93 )  {
          setMenu.area = { x:x+24,y:y+52,sx:80,sy:41, state:1 }  
          helpBox.state = 1;
        }
        else if (coords.x > x-104 && coords.y > y+52  && coords.x < x+11 && coords.y < y+107 )  { //default button

          setMenu.area = { x:x-104,y:y+52,sx:115,sy:41, state:1 }  
          sessionStorage.clear();
          difficulty.setting = 4;
          makeGrid.colors = 6;
          difficulty.removal = { value:0,color:0 } 
          highScore.totalScore = 0;
          writeScore.score = 0;
          makeGrid.tilesLeft = 0;
          makeGrid();
          nextMatrix(); 
          }
    }
}

function clickConfirm() {

        if (setMenu.area.state) {

        setMenu.area.state++

        ctx.fillStyle = "hsla(181,100%,48%,0.5)";
        ctx.fillRect( setMenu.area.x,  setMenu.area.y,  setMenu.area.sx ,  setMenu.area.sy ) // reset button
        
        if (setMenu.area.state > 5) { setMenu.area.state = 0; }
        
        }
}

function settings(id,value) {
  
    if (id === "difficulty") { difficulty.setting += value; difficulty(0,difficulty.removal.color); }
    if (id === "colors") {  

      makeGrid.colors += value;  
      difficulty.removal = { value:0,color:0 } 
      highScore.totalScore = 0;
      writeScore.score = 0;
      makeGrid.tilesLeft = 0;
      makeGrid();
      nextMatrix();
      }

    sessionStorage.setItem("difficulty", difficulty.setting);
    sessionStorage.setItem("colors", makeGrid.colors);
}

function checkSession() {

  if (sessionStorage.length) {

    difficulty.setting = parseInt(sessionStorage.getItem("difficulty"),10);
    makeGrid.colors = parseInt(sessionStorage.getItem("colors"),10);

    }
}

function resetTiles() {

    assingEventListener("none");
    difficulty.removal = { value:0,color:0 } 
    highScore.totalScore = 0;
    writeScore.score = 0;
    
    if (makeGrid.tilesLeft > 0) {
    
    for (let y = 0; y < ySize; y++) {
      for (let x = 0; x < xSize; x++) {
      
      if (nextGrid[y][x].state) { nextGrid[y][x].state = 4;}
      }}
      }
     else if (makeGrid.tilesLeft <= 0 ) { 
     makeGrid.tilesLeft = 0;
     makeGrid();
     nextMatrix();
     }
}

//Fps limiter function liberated from Stackoverflow
function startLimiter(fps) {
    fpsInterval = 1000 / fps;
    thenTime = window.performance.now();
    startTime = thenTime;
    playTile();
}

//Actually calls the render fuction
function playTile(newtime) {
    requestAnimationFrame(playTile);
    nowTime = newtime;
    elapsedTime = nowTime - thenTime;
    if (elapsedTime > fpsInterval) { 
        thenTime = nowTime - (elapsedTime % fpsInterval);
        //call render function
        renderTiles();
    }
}

/*
window.onresize = function() {
    clearTimeout(resizeId);
    resizeId = setTimeout(doneResizing, 500);
}

function doneResizing(){
  location.reload();
}
*/
sessionStorage.clear();
setCanvasSize();
setMenu();
checkSession();
makeGrid();
nextMatrix();
startLimiter(60);
//renderTiles();
