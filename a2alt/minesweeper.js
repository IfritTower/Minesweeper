	
$('document').ready(function () {
	console.log('in javascript!');
	
	var godGameBoardObj = null;
	var highScoreArray = new Array();
	
	var newGame = function() {
		
		console.log('New Game!');
		
		if(godGameBoardObj!=null) {
			clearGame();
		}
		
		var gameWidth = $('#gameWidth')[0].value;
		var gameHeight = $('#gameHeight')[0].value;
		console.log(gameWidth + " " + gameHeight);
		console.log(validatedDimensionInputs(gameWidth, gameHeight));
		
		if(!validatedDimensionInputs(gameWidth, gameHeight)) {
			alert('Inputs are not valid! Width must be between 8 and 40, and Height must be between 8 and 30.');
			return null;
		}
		
		var gameBoard = createGameBoard(gameWidth, gameHeight);
		var markGameBoard = createMarkGameBoard(gameWidth, gameHeight);

		var gameBoardBombObj = setBombs(gameWidth, gameHeight, gameWidth*gameHeight, gameBoard);

		if(gameBoardBombObj.invalidInput) {
			alert('Inputs are not valid! Number of bombs should be between 1 and '+(gameWidth*gameHeight-1)+'.');
			return null;
		}

		gameBoard = gameBoardBombObj.genGameBoard;
		var numBombs = gameBoardBombObj.genNumBombs;
		var markGameBoard = createMarkGameBoard(gameWidth, gameHeight);
		
		var timerIntervalObj = startTimer();
		
		createGameBoardView(gameBoard, gameWidth, gameHeight);
		
		return {genGameBoard:gameBoard, genMarkGameBoard:markGameBoard, genGameWidth:gameWidth, 
					 genGameHeight:gameHeight, genNumBombs:numBombs, numCorrectMarks: 0, numIncorrectMarks: 0,
					 genTimerInterval:timerIntervalObj.genzTimerInterval, genTimerVal: timerIntervalObj.genzTimerVal};
	}
	
	var clearGame =  function() {
		clearInterval(godGameBoardObj.genTimerInterval);
		$('#timer').empty();
		$('#bombsRemaining').empty();
		godGameBoardObj = null;
		$('#gameBoardView').empty();
		$('body').removeClass('failure');
		$('body').removeClass('success');
		$('main  p').remove();
	}
	
	var validatedDimensionInputs = function(gameWidth, gameHeight) {
		return ((gameWidth>=8)&&(gameHeight>=8)&&(gameWidth<=40)&&(gameHeight<=30));
	}

	var createGameBoard = function(gameWidth, gameHeight) {
		var gameBoardArray = new Array(gameWidth);
		for(var i = 0; i < gameWidth; i++){
			gameBoardArray[i] = new Array(gameHeight);
			for(var j = 0; j < gameHeight; j++){
				gameBoardArray[i][j] = 0;
			}
		}

		console.log(gameBoardArray);
	
		return gameBoardArray;
	}
	
	var createMarkGameBoard = function(gameWidth, gameHeight) {
		var markGameBoard = new Array(gameWidth);
		for(var i = 0; i < gameWidth; i++){
			markGameBoard[i] = new Array(gameHeight);
			for(var j = 0; j < gameHeight; j++){
				markGameBoard[i][j] = 0;
			}
		}
		
		return markGameBoard;
	}

	var setBombs = function(gameWidth, gameHeight, gameBoardSize, gameBoard) {
		var numBombs = $('#numStartBombs')[0].value;
		if(numBombs<1||numBombs>gameBoardSize-1){
			return {genGameBoard:null, genNumBombs:null, invalidInput:true};
		}
		console.log('numBombs: ' + numBombs);
		
		var currentXPos = 9999;
		var currentYPos = 9999;
		var i = numBombs;
		
		while(i > 0){
			currentXPos = randomInt(gameWidth);
			currentYPos = randomInt(gameHeight);
			
			if(gameBoard[currentXPos][currentYPos]===1){continue;}
			gameBoard[currentXPos][currentYPos]=1;
			i--;
		}
		
		$('#bombsRemaining').append(numBombs);
		
		console.log(gameBoard);
		
		return {genGameBoard:gameBoard, genNumBombs:numBombs, invalidInput:false};
	}

	var startTimer = function() {
		var timerVal = 1;
		var timerInterval = null;
		var timerDiv = $('#timer');
		
		timerDiv.append(timerVal);
		timerInterval = setInterval(function() {
			timerDiv.empty();
			console.log(godGameBoardObj.genTimerVal);
			if(godGameBoardObj==null){
				timerVal++;
				timerDiv.append(timerVal);
			}
			else {
				godGameBoardObj.genTimerVal++;
				timerDiv.append(godGameBoardObj.genTimerVal);
			}
		}, 1000);
		
		return {genzTimerInterval:timerInterval, genzTimerVal:timerVal};
	}

	var createGameBoardView = function(gameBoard, gameWidth, gameHeight) {
		var gameBoardDiv = $('#gameBoardView');
		for(var i = 0; i < gameHeight; i++){
			for(var j=0; j<gameWidth;j++){
				if(gameBoard[j][i]===1){
					//console.log('A bomb!');
					gameBoardDiv.append('<button class="hidden bomb gameButton notMarked" data-x="'+j+'" data-y="'+i+'" type="button">\
														&#9830;</button>');
				}
				else{
					//console.log('Not a bomb!');
					gameBoardDiv.append('<button class="hidden nonbomb gameButton notMarked" data-x="'+j+'" data-y="'+i+'" type="button">\
														&#9830;</button>');
				}
			}
			
			gameBoardDiv.append("<br>");
		}
		
		$('.gameButton').click(function(e) {
			console.log('Hello!');
			
			var currGameButton = $(this);
			
			var xPos = currGameButton.data("x");
			var yPos = currGameButton.data("y");
			
			console.log(' ' +xPos+' '+yPos);
			
			if(e.shiftKey) {
				markSpace(xPos, yPos, currGameButton);
			}
			else {
				if(godGameBoardObj.genMarkGameBoard[xPos][yPos]===1){return;}
				if(currGameButton.hasClass('notHidden')){
					labelExplosion(xPos, yPos, currGameButton);
				}
				checkSpace(xPos, yPos, currGameButton, new Array());
			}
		});
		
	}

	var labelExplosion = function(xPos, yPos, currGameButton) {
		var numSurroundingMarks = 0;
		for(var i=xPos-1; i<=xPos+1; i++) {
			for(var j=yPos-1; j<=yPos+1; j++) {
				if((i<0)||(i>=godGameBoardObj.genGameWidth)||(j<0)||(j>=godGameBoardObj.genGameHeight)) {
					continue;
				}
				
				if(godGameBoardObj.genMarkGameBoard[i][j]===1) {
					numSurroundingMarks++;
				}
			}
		}
		
		if(currGameButton.attr('data-proxes')==numSurroundingMarks){
			for(var i=xPos-1; i<=xPos+1; i++) {
				for(var j=yPos-1; j<=yPos+1; j++) {
					if((i<0)||(i>=godGameBoardObj.genGameWidth)||(j<0)||(j>=godGameBoardObj.genGameHeight)) {
						continue;
					}
					currGameButton = $( 'button[data-x="'+i+'"][data-y="'+j+'"]');
					checkSpace(i,  j, currGameButton,new Array, true);
				}
			}
		}
	}

	var checkSpace = function(xPos, yPos, currGameButton, skipCheckArray, labelExplosionBool) {
		console.log('Check Space! ' + xPos+' '+yPos+' '+godGameBoardObj);
		
		if(godGameBoardObj.genMarkGameBoard[xPos][yPos]===1){return;}
		
		var bombProxCounter = null;		
		if(godGameBoardObj.genGameBoard[xPos][yPos]===1){
			gameOver();
			currGameButton.removeClass('hidden');
			currGameButton.addClass('notHidden');
		}
		else {	
			bombProxCounter = checkSurrounding(xPos, yPos, skipCheckArray);
			revealButton(bombProxCounter, currGameButton);
			checkGameWin();
		}
	}
	
	var checkSurrounding = function(xPos, yPos, skipCheckArray, labelExplosionBool) {
		var bombProxCounter = 0;
		
		for(var i=xPos-1; i<=xPos+1; i++) {
			for(var j=yPos-1; j<=yPos+1; j++) {
				if((i<0)||(i>=godGameBoardObj.genGameWidth)||(j<0)||(j>=godGameBoardObj.genGameHeight)) {
					continue;
				}
				
				if(godGameBoardObj.genGameBoard[i][j]===1) {
					bombProxCounter++;
				}
			}
		}
		
		if(bombProxCounter===0) {
			skipCheckArray.push({x:xPos, y:yPos});
			if(!labelExplosionBool){
				massReveal(xPos, yPos, skipCheckArray);
			}
		}
		
		return bombProxCounter;
	}
	
	var massReveal = function(xPos, yPos, skipCheckArray) {
		for(var i=xPos-1; i<=xPos+1; i++) {
			for(var j=yPos-1; j<=yPos+1; j++) {
				var foundSkip = 0;
				if( (i<0) ||
					 (i>=godGameBoardObj.genGameWidth) ||
					 (j<0) ||
					 (j>=godGameBoardObj.genGameHeight) ||
					 ( (i===xPos)&&(j===yPos) )) {
					continue;
				}
				for (var k=0; k<skipCheckArray.length;k++) {
					if(i===skipCheckArray[k].x&&j===skipCheckArray[k].y) {
						foundSkip =1;
					}
				}
				if(foundSkip) {continue;}
				var currGameButton = $( 'button[data-x="'+i+'"][data-y="'+j+'"]');
				if(currGameButton.hasClass('marked')){continue;}
				console.log(' i:' +i+ ' j:' +j+ ' currGameButton' +currGameButton);
				checkSpace(i, j, currGameButton, skipCheckArray);
			}
		}
	}

	var revealButton = function(bombProxCounter, currGameButton) {
		currGameButton.empty();
		currGameButton.append(bombProxCounter + ' ');
		currGameButton.removeClass('hidden');
		switch(bombProxCounter) {
			case 0:
				currGameButton.addClass('zeroProx');
				currGameButton.attr("data-proxes",0);
				break;
			case 1:
				currGameButton.addClass('oneProx');
				currGameButton.attr("data-proxes",1);
				break;
			case 2:
				currGameButton.addClass('twoProx');
				currGameButton.attr("data-proxes",2);				
				break;
			case 3:
				currGameButton.addClass('threeProx');
				currGameButton.attr("data-proxes",3);
				break;
			case 4:
				currGameButton.addClass('fourProx');
				currGameButton.attr("data-proxes",4);
				break;
			case 5:
				currGameButton.addClass('fiveProx');
				currGameButton.attr("data-proxes",5);
				break;
			case 6:
				currGameButton.addClass('sixProx');
				currGameButton.attr("data-proxes",6);
				break;
			case 7:
				currGameButton.addClass('sevenProx');
				currGameButton.attr("data-proxes",7);
				break;
			case 8:
				currGameButton.addClass('eightProx');
				currGameButton.attr("data-proxes",8);
				break;
			default:
				break;
		}
		currGameButton.addClass('notHidden');
		//currGameButton.prop('disabled', function(i, v){return true;});
	}
	
	var markSpace = function(xPos, yPos, currGameButton) {
		console.log(godGameBoardObj.genMarkGameBoard);
		if(godGameBoardObj.genMarkGameBoard[xPos][yPos]===0) {
			godGameBoardObj.genMarkGameBoard[xPos][yPos]=1;
			currGameButton.removeClass('notMarked');
			currGameButton.addClass("marked");
			if(godGameBoardObj.genGameBoard[xPos][yPos]===1) {
				godGameBoardObj.numCorrectMarks++;
			}
			else {
				godGameBoardObj.numIncorrectMarks++;
			}
		}
		else {
			godGameBoardObj.genMarkGameBoard[xPos][yPos]=0;
			currGameButton.removeClass("marked");
			if(godGameBoardObj.genGameBoard[xPos][yPos]===1) {
				godGameBoardObj.numCorrectMarks--;
			}
			else {
				godGameBoardObj.numIncorrectMarks--;
			}
			
		}
		
		console.log(godGameBoardObj);
		checkGameWin();
		updateBombCounter();
	}

	var checkGameWin= function() {
		console.log(godGameBoardObj);
		if(godGameBoardObj.numCorrectMarks==godGameBoardObj.genNumBombs&&godGameBoardObj.numIncorrectMarks==0) {
			var numHiddenButtons= $('button.hidden.notMarked').length;
			console.log('numHiddenButtons: '+numHiddenButtons);
			if(numHiddenButtons==0){
				gameWon();
			}
		}
	}

	var gameWon = function() {
		clearInterval(godGameBoardObj.genTimerInterval);
		body = $('#gameResultDiv');
		body.addClass("success");
		$('button.gameButton').prop('disabled', function(i, v){return true;});
		body.append('<p id="gameWonText">Congratulations</p>');
		addHighScore();
	}
	
	var addHighScore = function() {
		var highScoreDiv = $('#highScoreBoard')
		highScoreDiv.empty();
		highScoreArray.push(godGameBoardObj.genTimerVal);
		highScoreArray.sort(function(a, b){return a - b});
		highScoreArray.forEach(function(item, index){
			highScoreDiv.append('<div class="highScoreUnit"><div id="placement">'+(index+1)+
											   '</div><div id="endtime">00:'+item+
											   '.00</div><div id="dimensions"> '+godGameBoardObj.genGameWidth+
												'X'+godGameBoardObj.genGameHeight+'</div><br></div>');
		});
	}

	var randomInt = function(max) {
		return Math.floor(Math.random() * max);
	}
	
	var gameOver = function() {
		clearInterval(godGameBoardObj.genTimerInterval);
		var body = $('#gameResultDiv');
		body.addClass("failure");
		$('button.gameButton').prop('disabled', function(i, v){return true;});
		$('button.bomb.hidden').removeClass('hidden');
		$('button.bomb').addClass('notHidden');
		body.append('<p id="gameOverText">Game Over</p>');
		
	}
	
	var updateBombCounter = function() {
		var bombsRemainingSpan = $('#bombsRemaining');
		bombsRemainingSpan.empty();
		console.log(godGameBoardObj.genNumBombs, +' '+ godGameBoardObj.numCorrectMarks +' '+ godGameBoardObj.numIncorrectMarks);
		var currBombsRemaining = godGameBoardObj.genNumBombs-(godGameBoardObj.numCorrectMarks+godGameBoardObj.numIncorrectMarks);
		bombsRemainingSpan.append(' ' + currBombsRemaining);
	}
	
	$('form > button').click(function() {
		godGameBoardObj = newGame();
		console.log(godGameBoardObj);
	});
	
});