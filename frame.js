var resizeHandle = document.getElementById('handle');

var box = document.getElementById('box');
var gameFrame = document.getElementById('gameFrame');

if (window.innerWidth >= 1400) { startResizing.xs = 1350 }
else if ( window.innerWidth < 321 ) { startResizing.xs = 320 }
else { startResizing.xs = (Math.trunc(window.innerWidth / 50) * 50) - 50 }

if (window.innerHeight >= 750) { startResizing.ys = 725 }
else if ( window.innerHeight < 506 ) { startResizing.ys = 505 }
else { startResizing.ys = (Math.trunc(window.innerHeight / 50) * 50) - 50}


gameFrame.width = startResizing.xs
gameFrame.height = startResizing.ys

box.style.width = startResizing.xs + 'px'
box.style.height = 25 + startResizing.ys + 'px'

box.style.left = (window.innerWidth / 2 - startResizing.xs / 2) + 'px' 
box.style.top = (window.innerHeight / 2 - (startResizing.ys + 25) / 2) + 'px' 

resizeHandle.addEventListener('mousedown', initialiseResize, false);

function initialiseResize(e) {
  window.addEventListener('mousemove', startResizing, false);
    window.addEventListener('mouseup', stopResizing, false);
}

function startResizing(e) {

  gameFrame.style.pointerEvents="none";

  let xs = e.clientX - box.offsetLeft;
  let ys = e.clientY - box.offsetTop;
  
   startResizing.xs = (Math.trunc(xs / 50) * 50) + 50; 
   startResizing.ys = (Math.trunc(ys / 50) * 50) + 50; 

   //max size
   if  (startResizing.xs > window.innerWidth) { startResizing.xs = window.innerWidth }
   if  (startResizing.ys > window.innerHeight) { startResizing.ys = window.innerHeight }

   //min size
   if  (startResizing.xs < 321) { startResizing.xs = 320 }
   if  (startResizing.ys < 506) { startResizing.ys = 505 }

   box.style.width = startResizing.xs + 'px'
   box.style.height = startResizing.ys + 'px'
      
   box.style.left = (window.innerWidth / 2 - startResizing.xs / 2) + 'px'
   box.style.top = (window.innerHeight / 2 - startResizing.ys / 2) + 'px' 
  
  }

function stopResizing(e) {

    window.removeEventListener('mousemove', startResizing, false);
    window.removeEventListener('mouseup', stopResizing, false);

    gameFrame.width = startResizing.xs;
    gameFrame.height = startResizing.ys - 25;

    gameFrame.style.pointerEvents="auto";
    gameFrame.contentWindow.location.reload(true);
}

window.onresize = function() {

  box.style.left = (window.innerWidth / 2 - startResizing.xs / 2) + 'px' 
  box.style.top = (window.innerHeight / 2 - (startResizing.ys + 25) / 2) + 'px' 
}
//make sure iframe only loads when html rendered.

gameFrame.src = "gameField.html";