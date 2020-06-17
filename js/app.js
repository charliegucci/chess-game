const chess = new Chess();
const currentColor = chess.turn();
const turn = 0;
const timeOut = null;
const photon = document.getElementsByClassName('photon-shader');
const sphere = document.getElementsByClassName('sphere');
const piece = document.getElementsByClassName('piece');
const square = document.getElementsByClassName('square');
const app = document.getElementById('app');
const scene = document.getElementById('scene');
const sceneX = 70;
const sceneY = 90;
const controls = false;
const animated = false;
const mouseDown = false;
const closestElement = null;
const white = 'White';
const black = 'Black';

function checkTouch() {
  let d = document.createElement('div');
  d.setAttribute('ontouchmove', 'return;');
  return typeof d.ontouchmove === 'function' ? true : false;
}

if (checkTouch()) {
  let press = 'touchstart';
  let drag = 'touchmove';
  let drop = 'touchend';
} else {
  let press = 'mousedown';
  let drag = 'mousemove';
  let drop = 'mouseup';
}

function initControls() {
  for (let i = 0; i < piece.length; i++) {
    piece[i].addEventListener(press, grabPiece, false);
  }
  app.addEventListener(drag, dragPiece, false);
  app.addEventListener(drop, dropPiece, false);
  app.addEventListener(drag, moveScene, false);
  app.onselectstart = function (event) {
    event.preventDefault();
  };
  app.ontouchmove = function (event) {
    event.preventDefault();
  };
}

function grabPiece(event) {
  if (!mouseDown && controls) {
    event.preventDefault();
    mouseDown = true;
    grabbed = this;
    grabbedID = grabbed.id.substr(-2);
    startX = event.pageX - document.body.offsetWidth / 2;
    startY = event.pageY - document.body.offsetHeight / 2;
    style = window.getComputedStyle(grabbed);
    matrix = style.getPropertyValue('-webkit-transform');
    matrixParts = matrix.split(',');
    grabbedW = parseInt(style.getPropertyValue('width')) / 2;
    grabbedX = parseInt(matrixParts[4]);
    grabbedY = parseInt(matrixParts[5]);
    grabbed.classList.add('grabbed');
    showMoves(grabbedID);
    highLight(grabbed, square);
  }
}

function dragPiece(event) {
  if (mouseDown && controls) {
    event.preventDefault();
    moveX = event.pageX - document.body.offsetWidth / 2;
    moveY = event.pageY - document.body.offsetHeight / 2;
    distX = moveX - startX;
    distY = moveY - startY;
    if (currentColor === 'w') {
      newX = grabbedX + distX;
      newY = grabbedY + distY;
    } else {
      newX = -(grabbedX + distX);
      newY = -(grabbedY + distY);
    }
    grabbed.style.webkitTransform =
      'translateX(' + newX + 'px) translateY(' + newY + 'px) translateZ(2px)';
    highLight(grabbed, square);
  }
}

function dropPiece(event) {
  if (mouseDown && controls) {
    event.preventDefault();
    let squareEndPos = closestElement.id;
    function getMove(moveType) {
      return document
        .getElementById(squareEndPos)
        .className.match(new RegExp('(\\s|^)' + moveType + '(\\s|$)'));
    }
    if (getMove('valid')) {
      if (getMove('captured')) {
        let type = chess.get(squareEndPos).type;
        let color = chess.get(squareEndPos).color;
        if (currentColor === 'w') {
          createPiece(color, type, 'w-jail');
        } else {
          createPiece(color, type, 'b-jail');
        }
      }
      hideMoves(grabbedID);
      chess.move({ from: grabbedID, to: squareEndPos, promotion: 'q' });
    } else {
      hideMoves(grabbedID);
      grabbed.style.webkitTransform =
        'translateX(0px) translateY(0px) translateZ(2px)';
    }
    updateBoard();
    grabbed.classList.remove('grabbed');
    mouseDown = false;
  }
}

function moveScene(event) {
  if (animated) {
    eventStartX = event.pageX - document.body.offsetWidth / 2;
    eventStartY = event.pageY - document.body.offsetHeight / 2;
  }
  eventStartX = 0;
  eventStartY = 0;
  if (!controls && !animated) {
    document.body.classList.remove('animated');
    event.preventDefault();
    eventMoveX = event.pageX - document.body.offsetWidth / 2;
    eventDistX = eventMoveX - eventStartX;
    eventMoveY = event.pageY - document.body.offsetHeight / 2;
    eventDistY = eventMoveY - eventStartY;
    eventX = sceneY - eventDistX * -0.03;
    eventY = sceneX - eventDistY * -0.03;
    scene.style.webkitTransform =
      'RotateX(' + eventY + 'deg) RotateZ(' + eventX + 'deg)';
    for (let i = 0; i < sphere.length; i++) {
      updateSphere(sphere[i], eventY, eventX);
    }
  }
}

function showMoves(Target) {
  let validMoves = chess.moves({ target: Target, verbose: true });
  for (let i = 0; i < validMoves.length; i++) {
    let validMove = validMoves[i];
    let from = validMove.from;
    let to = validMove.to;
    let captured = validMove.captured;
    document.getElementById(from).classList.add('current');
    document.getElementById(to).classList.add('valid');
    if (captured) {
      document.getElementById(to).classList.add('captured');
    }
  }
}

function hideMoves(Target) {
  let validMoves = chess.moves({ target: Target, verbose: true });
  for (let i = 0; i < validMoves.length; i++) {
    let validMove = validMoves[i];
    let from = validMove.from;
    let to = validMove.to;
    document.getElementById(from).classList.remove('current');
    document.getElementById(to).classList.remove('valid');
    document.getElementById(to).classList.remove('captured');
  }
}

function createPiece(color, piece, position) {
  let clone = document.getElementById(piece).cloneNode(true);
  clone.addEventListener(press, grabPiece, false);
  clone.setAttribute('id', color + piece + position);
  if (color === 'w') {
    clone.classList.add('white');
  } else {
    clone.classList.add('black');
  }
  document.getElementById(position).appendChild(clone);
}

function updateBoard() {
  let updateTiles = {};
  let inCheck = chess.in_check();
  let inCheckmate = chess.in_checkmate();
  let inDraw = chess.in_draw();
  let inStalemate = chess.in_stalemate();
  let inThreefold = chess.in_threefold_repetition();
  chess.SQUARES.forEach(function (tile) {
    let boardS = board[tile];
    let chessS = chess.get(tile);
    if (boardS && chessS) {
      if (boardS.type !== chessS.type || boardS.color !== chessS.color) {
        updateTiles[tile] = chessS;
      }
    } else if (boardS || chessS) {
      updateTiles[tile] = chessS;
    }
    board[tile] = chessS;
  });
  for (let id in updateTiles) {
    let titleID = document.getElementById([id]);
    if (updateTiles[id] === null) {
      titleID.innerHTML = '';
    } else {
      let color = updateTiles[id].color;
      let piece = updateTiles[id].type;
      let symbol = color + piece;
      if (currentColor === color && !titleID.hasChildNodes()) {
        createPiece(color, piece, [id]);
      } else {
        titleID.innerHTML = '';
        createPiece(color, piece, [id]);
      }
    }
  }
  let fen = chess.fen();
  currentColor = chess.turn();
  function Log(message) {
    document.getElementById('log').innerHTML = message;
  }
  if (fen !== 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') {
    document.getElementById('undo').dataset.state = 'active';
  } else {
    document.getElementById('undo').dataset.state = 'inactive';
  }
  if (currentColor === 'w') {
    updateView(0, 0);
    Log(white + "'s turn");
    if (inCheck) {
      Log(white + "'s king is in check !");
    }
    if (inCheckmate) {
      Log(white + "'s king is in checkmate ! " + black + ' wins !');
    }
  } else {
    updateView(0, 180);
    Log(black + "'s turn");
    if (inCheck) {
      Log(black + "'s king is in check !");
    }
    if (inCheckmate) {
      Log(black + "'s king is in checkmate ! " + white + ' wins');
    }
  }
}

function updateCaptured() {
  let wbPiece = document
    .getElementById('board')
    .getElementsByClassName('white');
  let bbPiece = document
    .getElementById('board')
    .getElementsByClassName('black');
  let wjPiece = document
    .getElementById('w-jail')
    .getElementsByClassName('black');
  let bjPiece = document
    .getElementById('b-jail')
    .getElementsByClassName('white');
  if (wbPiece.length + bjPiece.length !== 16) {
    let child = document.getElementById('b-jail').lastChild;
    document.getElementById('b-jail').removeChild(child);
  }
  if (bbPiece.length + wjPiece.length !== 16) {
    let child = document.getElementById('w-jail').lastChild;
    document.getElementById('w-jail').removeChild(child);
  }
}

function undoMove() {
  chess.undo();
  updateBoard();
  updateCaptured();
}

function highLight(element, square) {
  function winPos(obj) {
    let box = obj.getBoundingClientRect();
    return {
      x: box.left,
      y: box.top
    };
  }

  let elementLeft = winPos(element).x + grabbedW;
  (elementRight = elementLeft + element.offsetWidth - grabbedW),
    (elementTop = winPos(element).y + grabbedW),
    (elementBottom = elementTop + element.offsetHeight - grabbedW),
    (smallestDistance = null);

  for (let i = 0; i < square.length; i++) {
    if (currentColor === 'w') {
      let squareLeft = winPos(square[i]).x,
        squareRight = squareLeft + square[i].offsetWidth,
        squareTop = winPos(square[i]).y,
        squareBottom = squareTop + square[i].offsetHeight;
    } else {
      let squareLeft = winPos(square[i]).x + grabbedW,
        squareRight = squareLeft + square[i].offsetWidth,
        squareTop = winPos(square[i]).y + grabbedW,
        squareBottom = squareTop + square[i].offsetHeight;
    }

    let xPosition = 0,
      yPosition = 0;

    if (squareRight < elementLeft) {
      xPosition = elementLeft - squareRight;
    } else if (squareLeft > elementRight) {
      xPosition = squareLeft - elementRight;
    }
    if (squareBottom < elementTop) {
      yPosition = elementTop - squareBottom;
    } else if (squareTop > elementBottom) {
      yPosition = squareTop - elementBottom;
    }
    let valueForComparison = 0;
    if (xPosition > yPosition) {
      valueForComparison = xPosition;
    } else {
      valueForComparison = yPosition;
    }
    if (smallestDistance === null) {
      smallestDistance = valueForComparison;
      closestElement = square[i];
    } else if (valueForComparison < smallestDistance) {
      smallestDistance = valueForComparison;
      closestElement = square[i];
    }
  }

  for (let i = 0; i < square.length; i++) {
    square[i].classList.remove('highlight');
  }

  closestElement.classList.add('highlight');
  targetX = closestElement.offsetLeft;
  targetY = closestElement.offsetTop;
}

function updateView(sceneXAngle, sceneZAngle) {
  scene.style.webkitTransform =
    'rotateX( ' + sceneXAngle + 'deg) rotateZ( ' + sceneZAngle + 'deg)';
  for (let i = 0; i < sphere.length; i++) {
    updateSphere(sphere[i], sceneXAngle, sceneZAngle);
  }
}

function updateSphere(sphere, sceneXAngle, sceneZAngle) {
  sphere.style.WebkitTransform =
    'rotateZ( ' + -sceneZAngle + 'deg ) rotateX( ' + -sceneXAngle + 'deg )';
}

function renderPoly() {
  let light = new Photon.Light((x = 50), (y = 150), (z = 250));
  let shadeAmount = 1;
  let tintAmount = 1;
  let pieces = new Photon.FaceGroup(
    $('#container')[0],
    $('#container .face'),
    1.6,
    0.48,
    true
  );
  pieces.render(light, true);
}

function resetPoly() {
  for (let i = 0; i < photon.length; i++) {
    photon[i].setAttribute('style', '');
  }
  if (timeOut != null) clearTimeout(timeOut);
  timeOut = setTimeout(renderPoly, 250);
}

function Continue() {
  updateBoard();
  controls = true;
  animated = true;
  document.getElementById('app').dataset.state = 'game';
  document.body.classList.add('animated');
}

function optionScreen() {
  updateView(sceneX, sceneY);
  controls = false;
  document.getElementById('app').dataset.state = 'menu';
  function setAnimated() {
    animated = false;
  }
  setTimeout(setAnimated, 2500);
}

function toggleFrame(event) {
  if (event.checked) {
    document.getElementById('app').dataset.frame = 'on';
  } else {
    document.getElementById('app').dataset.frame = 'off';
  }
  resetPoly();
}

function setState(event) {
  event.preventDefault();
  let data = this.dataset.menu;
  document.getElementById('app').dataset.menu = data;
}

function setTheme(event) {
  event.preventDefault();
  let data = this.dataset.theme;
  document.getElementById('app').dataset.theme = data;
  if (data === 'classic' || data === 'marble') {
    (white = 'White'), (black = 'Black');
  } else if (data === 'flat' || data === 'wireframe') {
    (white = 'Blue'), (black = 'Red');
  }
}

function UI() {
  let menuBtns = document.getElementsByClassName('menu-nav');
  let themeBtns = document.getElementsByClassName('set-theme');
  for (let i = 0; i < menuBtns.length; i++) {
    menuBtns[i].addEventListener(press, setState, false);
  }
  for (let i = 0; i < themeBtns.length; i++) {
    themeBtns[i].addEventListener(press, setTheme, false);
  }
  document.getElementById('continue').addEventListener(press, Continue, false);
  document
    .getElementById('open-menu')
    .addEventListener(press, optionScreen, false);
  document.getElementById('undo').addEventListener(press, undoMove, false);
}

function init() {
  app.classList.remove('loading');
  document.body.classList.add('animated');
  animated = true;
  updateBoard();
  optionScreen();
  initControls();
  UI();
  function anime() {
    document.getElementById('logo').innerHTML = '';
  }
  setTimeout(anime, 2000);
}

window.addEventListener('resize', resetPoly, false);

let readyStateCheckInterval = setInterval(function () {
  if (document.readyState === 'complete') {
    renderPoly();
    init();
    clearInterval(readyStateCheckInterval);
  }
}, 3250);
