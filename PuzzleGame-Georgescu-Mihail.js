let game = {

    image: null,
    startButton: null,
    loaded: false,
    running: false,
    pieces: [],
    puzzleSize: 24,
    pieceSize: 100,
    canvas: null,
    context: null,
    selectedPiece: null,
    dropPiece: null,
    hasToBeDropped: false,
    win: false,
    mousePos: {
        x:null,
        y:null
    }

}

const hoverColor = '#1d80e2';
var canvas;
var context;
var model;
var modelctx;
var soundPiece = new Audio('media/buttonsound.mp3');
var soundDrop = new Audio('media/dropsound.mp3');
var drums = new Audio("media/drums.mp3");
var shuffleSound = new Audio("media/paper.mp3");




game.load = function(){

    //passes the selected image to the game.image variable

    game.image = document.createElement('img');


    document.getElementById("loadingButton").addEventListener('change', function(e){  

        let fileReader = new FileReader();

        fileReader.addEventListener('load', function(event){

            game.image.src = event.target.result;
            
        });

        fileReader.readAsDataURL(e.target.files[0]);    


    });

    if('serviceWorker' in navigator)
        {
            
            try {
                navigator.serviceWorker.register('/service-worker.js');
                console.log('Service worker registered');
            } catch (error) {
                console.log('Register failed');
            }
    
    
        }

    game.image.addEventListener('load', function(){



        if(game.image.width != 600 && game.image.height != 400)
        {

            var switchCanvas = document.createElement('canvas'),
            switchContext = switchCanvas.getContext('2d');

            switchCanvas.width = 600;
            switchCanvas.height = 400;

            switchContext.drawImage(game.image, 0, 0, switchCanvas.width, switchCanvas.height);

            game.image.src = switchCanvas.toDataURL();
        }

        game.draw();
    });
}

game.draw = function(){

    //draws the image unto the canvas and listens to the start button click event to run the makePuzzle() function

    console.log("Image loaded");
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    canvas.width = 600;
    canvas.height = 400;
    context.drawImage(game.image, 0, 0, game.image.width, game.image.height, 0, 0, canvas.width, canvas.height);
    
    game.loaded = true;

    game.startButton = document.getElementById('startGame');
    game.startButton.removeAttribute('hidden');
    document.getElementById('solve').removeAttribute('hidden');
    var modeltext = document.getElementById('modeltext');
    modeltext.removeAttribute('hidden');

    model = document.getElementById('model');
    modelctx = model.getContext('2d');
    model.width = 300;
    model.height = 200;
    modelctx.drawImage(game.image, 0, 0, game.image.width, game.image.height, 0, 0, model.width, model.height);

    game.startButton.addEventListener('click', function(){

        shuffleSound.play();
        game.running = true;
        game.makePuzzle();
    });
}


game.makePuzzle = function(){

    //splits the image into pieces and saves them in the pieces array, calls the shuffle function, redraws the canvas with the pieces shuffled


    //session storage with Web Storage API to store time

    let startDate = Date.now();
    var storeDate = JSON.stringify(startDate);
    sessionStorage.setItem('startdate',storeDate);

    game.pieces = [];
    let xcoord = 0;
    let ycoord = 0;
    for(let i = 0; i < game.puzzleSize; i++)
    {
        let piece = {};
        piece.x = xcoord;
        piece.y = ycoord;
        game.pieces.push(piece);
        xcoord += game.pieceSize;
        if(xcoord >= canvas.width)
        {
            xcoord = 0;
            ycoord += game.pieceSize;
        }
    }
    console.log("Pieces saved");
    game.pieces = game.shuffleArray(game.pieces);

    let xCurrent = 0;
    let yCurrent = 0; 

    for (let i = 0; i < game.pieces.length; i++)
    {
        game.pieces[i].xCurrent = xCurrent;
        game.pieces[i].yCurrent = yCurrent;
        console.log(game.pieces[i]);
        context.drawImage(game.image,
                            game.pieces[i].x,
                            game.pieces[i].y,
                            game.pieceSize,
                            game.pieceSize,
                            xCurrent,
                            yCurrent,
                            game.pieceSize,
                            game.pieceSize);
        
        context.strokeRect(xCurrent, yCurrent, game.pieceSize, game.pieceSize);
        
        xCurrent += game.pieceSize;
        
        if(xCurrent >= canvas.width){
                xCurrent = 0;
                yCurrent += game.pieceSize;
        }

    }
    document.onmousedown = canvasClick;
}

game.shuffleArray = function(arr){

    //shuffles the pieces from the pieces array
    for(let j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
    return arr;
}


function pieceClicked(){

    let piece;

    for(let i = 0; i < game.pieces.length; i++){

        piece = game.pieces[i];

        if((game.mousePos.x > piece.xCurrent) 
             && (game.mousePos.x < (piece.xCurrent + game.pieceSize)) 
             && (game.mousePos.y > piece.yCurrent)
             && (game.mousePos.y < (piece.yCurrent + game.pieceSize)))
             
            {
             return piece;
        }   
    }
    return null;
}






function canvasClick(e){

    //fired when the canvas is clicked, the piece that is below the mouse cursor is selected and sticks to the cursor
    soundPiece.play();
    game.hasToBeDropped = null;
    game.mousePos.x = e.clientX - canvas.offsetLeft;
    game.mousePos.y = e.clientY - canvas.offsetTop + window.pageYOffset;
    
    game.selectedPiece = pieceClicked();
    if(game.selectedPiece != null){
        context.clearRect(game.selectedPiece.xCurrent,game.selectedPiece.yCurrent, game.pieceSize,game.pieceSize);
        context.save();
        context.globalAlpha = .8;
        context.drawImage(game.image, game.selectedPiece.x, game.selectedPiece.y, game.pieceSize, game.pieceSize, game.mousePos.x - (game.pieceSize / 2), game.mousePos.y - (game.pieceSize / 2), game.pieceSize, game.pieceSize);
        context.restore();
        //calls the update function at each move of the mouse, and the drop function when the mouse button is released
        document.onmousemove = update;
        document.onmouseup = drop;
        
    }
}


function update(e){

    //updates mouse position and draws the piece following the movement of the mouse and refreshes the canvas continuously while the mousee is moving
    game.dropPiece = null;

    game.mousePos.x = e.clientX - canvas.offsetLeft;
    game.mousePos.y = e.clientY - canvas.offsetTop + window.pageYOffset;

    context.clearRect(0,0,600,400);
    
    let piece;

    for(let i = 0; i < game.pieces.length; i++)
    {
        piece = game.pieces[i];
        if(piece == game.selectedPiece){ continue; }

        context.drawImage(game.image,
            game.pieces[i].x,
            game.pieces[i].y,
            game.pieceSize,
            game.pieceSize,
            game.pieces[i].xCurrent,
            game.pieces[i].yCurrent,
            game.pieceSize,
            game.pieceSize);

        context.strokeRect(game.pieces[i].xCurrent, game.pieces[i].yCurrent, game.pieceSize, game.pieceSize);

        if(game.dropPiece == null)
        {
            if((game.mousePos.x > piece.xCurrent) 
             && (game.mousePos.x < (piece.xCurrent + game.pieceSize)) 
             && (game.mousePos.y > piece.yCurrent)
             && (game.mousePos.y < (piece.yCurrent + game.pieceSize)))
             {
                game.dropPiece = piece;
                context.save();
                context.globalAlpha = .4;
                context.fillStyle = hoverColor;
                context.fillRect(game.dropPiece.xCurrent, game.dropPiece.yCurrent, game.pieceSize, game.pieceSize);
                context.restore();
             }
             
        }
        
    }
    context.save();
    context.globalAlpha = .6;
    context.drawImage(game.image, game.selectedPiece.x, game.selectedPiece.y, game.pieceSize, game.pieceSize, game.mousePos.x - (game.pieceSize / 2), game.mousePos.y - (game.pieceSize / 2), game.pieceSize, game.pieceSize);
    context.restore();
    context.strokeRect( game.mousePos.x - (game.pieceSize / 2), game.mousePos.y - (game.pieceSize / 2), game.pieceSize, game.pieceSize);

    game.hasToBeDropped = true;
}


function drop(){

    //refreshes the listeners and swaps the coordinates of the two pieces, then calls reset to refresh the canvas visually
    //and checks every time if the game is done
    soundDrop.play();
    console.log('drop fired');
    document.onmousemove = null;
    document.onmouseup = null;

    if(game.dropPiece != null)
    {
        let xAux = game.selectedPiece.xCurrent;
        let yAux = game.selectedPiece.yCurrent;

        game.selectedPiece.xCurrent = game.dropPiece.xCurrent;
        game.selectedPiece.yCurrent = game.dropPiece.yCurrent;
        game.dropPiece.xCurrent = xAux;
        game.dropPiece.yCurrent = yAux;
    }
    
    reset();
    checkWin();
}


function solve(){

    //automatically returns the pieces to the original coordinates stored in the objects from the pieces array
    let piece;
    for(let i = 0; i < game.pieces.length; i++)
    {
        piece = game.pieces[i];
        piece.xCurrent = piece.x;
        piece.yCurrent = piece.y;
    }
    
    for (let i = 0; i < game.pieces.length; i++)
    {
        context.drawImage(game.image,
                            game.pieces[i].x,
                            game.pieces[i].y,
                            game.pieceSize,
                            game.pieceSize,
                            game.pieces[i].xCurrent,
                            game.pieces[i].yCurrent,
                            game.pieceSize,
                            game.pieceSize);
        
        context.strokeRect(game.pieces[i].xCurrent, game.pieces[i].yCurrent, game.pieceSize, game.pieceSize);
        
    }

    checkWin();
}

function reset(){
    //refreshes the canvas
    for (let i = 0; i < game.pieces.length; i++)
    {
        context.drawImage(game.image,
                            game.pieces[i].x,
                            game.pieces[i].y,
                            game.pieceSize,
                            game.pieceSize,
                            game.pieces[i].xCurrent,
                            game.pieces[i].yCurrent,
                            game.pieceSize,
                            game.pieceSize);
        
        context.strokeRect(game.pieces[i].xCurrent, game.pieces[i].yCurrent, game.pieceSize, game.pieceSize);
        
    }

}

function checkWin(){

    reset();
    let piece;
    game.win = true;
    for(let i = 0; i < game.pieces.length; i++)
    {
        piece = game.pieces[i];
        if(piece.x != piece.xCurrent || piece.y != piece.yCurrent) //if pieces are still not in order
        {
            game.win = false;
        }
    }

    if(game.win == true)
    {
        //calculates the play time in seconds and displays the win message
        let startTime = sessionStorage.getItem('startdate');
        let finishTime = Date.now();
        let completionTime = Math.round((finishTime - startTime) / 1000);
        drums.play();
        alert('PUZZLE COMPLETED!!! Time: ' + completionTime + " seconds.");
    }
}