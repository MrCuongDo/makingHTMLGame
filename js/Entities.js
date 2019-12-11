
	let player;
	let enemyList = {};
	let upgradeList = {};
	let bulletList = {};

	Entity = function(type,id, x, y,width,height, img) {
		let self = {
			type:type,
			id: id,
			x: x,
			y: y, 
			width: width,
			height: height,
			img: img
		};

		self.update = function (){
			self.updatePosition();
			self.draw();
		}

		self.updatePosition = function () {};

		self.draw = function (){
			ctx.save();

			// var x = self.x-self.width/2;
			// var y = self.y-self.height/2;

			// calculate distance between objects and player (can be player itself)
			let x = self.x - player.x;
			let y = self.y - player.y;

			// offset to middle of canvas 
			x += WIDTH/2; 
			y += HEIGHT/2;			

			// offset to center of object 
			x -= self.width/2;
			y -= self.height/2;

			// ctx.drawImage(img,x,y);
			ctx.drawImage(self.img,
				0, 0, self.img.width, self.img.height,//cropStartX, cropStartY, cropWidth, cropHeight
				x, y, self.width, self.height//drawX, drawY, drawWidth, drawHeight
			);

			ctx.restore();
		}
		self.getDistance= function ( entity2) { // return distance (number)
			let vx=self.x -entity2.x;
			let vy = self.y - entity2.y;
			return Math.sqrt(vx*vx + vy*vy);
		}

		self.testCollision = function (entity2){ // return if colliding (true/false)
			let rect1 = {
				x: self.x - self.width / 2,
				y:  self.y - self.height / 2,
				width: self.width,
				height : self.height
			}

			let rect2 = {
				x: entity2.x - entity2.width / 2,
				y: entity2.y - entity2.height / 2,
				width: entity2.width,
				height : entity2.height
			}
			return testCollisionRectRect(rect1,rect2);
		}

		return self;
	}

	Player = function() {
		let self = Actor('player','myId',50,30,50,70,Img.player,20,1);
		//
		self.updatePosition = function () {
			if(self.pressingRight)
            	self.x += 10;
	        if(self.pressingLeft)
	            self.x -= 10;
	        if(self.pressingDown)
	            self.y += 10;
	        if(self.pressingUp)
	            self.y -= 10;
	       
	        //ispositionvalid
	        if(self.x < self.width/2)
	            self.x = self.width/2; 
	        if(self.x > currentMap.width-self.width/2)
	            self.x = currentMap.width - self.width/2;
	        if(self.y < self.height/2)
	            self.y = self.height/2;
	        if(self.y > currentMap.height - self.height/2)
	            self.y = currentMap.height - self.height/2;
		}

		let super_update = self.update;
		self.update = function() {
			super_update();
			if(self.hp <= 0) {
				let timeSurvived = Date.now() - timeWhenGameStarted;
				console.log(`you lost! You servived for ${timeSurvived} ms with score: ${score}!`);
				startNewGame();
			}
		}
		//
		self.pressingUp= false;
		self.pressingDown= false;
		self.pressingLeft= false;
		self.presssingRight= false;
		
		return self;
	}

	Actor = function(type,id, x, y,width,height,img,hp,atkSpd){
		let self = Entity(type,id,x,y,width,height,img); 
		//
		self.hp= hp;
		self.atkSpd= atkSpd;
		self.aimAngle= 0;
		self.attackCounter= 0;

		let super_update = self.update;
		self.update = function() {
			super_update();
			self.attackCounter += self.atkSpd;
		}

		self.performAttack = function (){
			if(self.attackCounter > 25) {
				self.attackCounter = 0;
				generateBullet(self);
			}
		}

		self.performSpecialAttack = function () {
			//for(var angle = 0; angle < 360; angle++){
			// 		generateBullet(actor,angle);
			// 	}
			if(self.attackCounter > 75) {
				self.attackCounter = 0;
				generateBullet(self,self.aimAngle -5);
				generateBullet(self);
				generateBullet(self,self.aimAngle +5);
			}
		}
		return self;
	}

	Enemy = function (id, x, y,width,height) {
		let self = Actor('enemy',id,x,y,width,height,Img.enemy,10,1); 

		let super_update = self.update;
		self.update = function() {
			super_update();
			self.updateAim();
			self.performAttack();

			// var colliding = player.testCollision(self);
			// if(colliding){
			// 	player.hp -= 1;
			// }
		}	

		self.updateAim = function() {
			let diffX = player.x - self.x;
			let diffY = player.y - self.y;

			self.aimAngle = Math.atan2(diffY,diffX) / Math.PI * 180; 
		}

		self.updatePosition = function () {
			let diffX = player.x - self.x;
			let diffY = player.y - self.y;

			if(diffX > 0) self.x += 3;
			else self.x -= 3; 

			if(diffY > 0) self.y += 3;
			else self.y -= 3;

		}
		enemyList[id] = self;
	}

	randomlyGenerateEnemy = function(){
        //Math.random() returns a number between 0 and 1
        var x = Math.random()*currentMap.width;
        var y = Math.random()*currentMap.height;
        var height = 64;
        var width = 64;
        var id = Math.random();
        Enemy(id,x,y,width,height);  
	}

	Upgrade = function (id, x, y,width,height,category, img) {
		let self = Entity('upgrade',id,x,y,width,height,img); 
		self.category= category

		let super_update = self.update;
		self.update = function() {
			super_update();
			var isColliding = player.testCollision(self);
            if(isColliding){
            	if(self.category === 'score'){
            		score += 1000;
            	}

            	if(self.category === 'atkSpd'){
					player.atkSpd += 1;
            	}
                
                delete upgradeList[self.id];
            }
			
		}	
		upgradeList[self.id] = self;
	}

	randomlyGenerateUpgrade = function(){
        //Math.random() returns a number between 0 and 1
        var x = Math.random()*currentMap.width;
        var y = Math.random()*currentMap.height;
        var height = 32;
        var width = 32;
        var id = Math.random();
        if (Math.random() < 0.5) {
        	var category = 'score';
        	var img = Img.upgrade1;	
        }else{
			var category = 'atkSpd';
        	var img = Img.upgrade2;	
        }
        Upgrade(id,x,y,width,height,category,img);  
	}

	Bullet = function (id,x,y,spdX,spdY,width,height,combatType){
		let self = Entity('bullet',id,x,y,width,height,Img.bullet); 
        self.timer=0;
        self.combatType = combatType;
        self.spdX = spdX;
        self.spdY = spdY;

        let super_update = self.update;
        self.update = function (){
        	super_update();
        	self.timer++;

        	let toRemove = false;
            if(self.timer % 75 === 0){
            	toRemove = true;
            }

            if(self.combatType === 'player') {// bullet was shoot by player
            	for(let enemyIndex in enemyList) {
				/*var colliding = bulletList[key].testCollision(enemyList[enemyIndex]);
				if(colliding){
					delete bulletList[key];
					delete enemyList[enemyIndex];
					break;
				}*/
					if(self.testCollision(enemyList[enemyIndex])){
						toRemove = true;
						delete enemyList[enemyIndex];
						break;
					}
					
	            }
            }else if (self.combatType === 'enemy') {
            	if(self.testCollision(player)) {
            		toRemove = true;
            		player.hp -= 1;
            	}
            }

            if(toRemove) {
            	delete bulletList[self.id];
        	}
            
        }

		self.updatePosition = function(){
			self.x += self.spdX;
			self.y += self.spdY;

			if(self.x < 0 || self.x > currentMap.width) {
				self.spdX = -self.spdX;
			}

			if(self.y < 0 || self.y > currentMap.height) {
				self.spdY = -self.spdY
			}
		}

        bulletList[id] = self;
	}
	 
	generateBullet = function(actor,overwriteAngle){
        //Math.random() returns a number between 0 and 1
        var x = actor.x;
        var y = actor.y;
        var height = 32;
        var width = 32;
        var id = Math.random();
       
        var angle = actor.aimAngle;
        if(overwriteAngle !== undefined){
        	angle = overwriteAngle;
        }
        var spdX = Math.cos(angle/180*Math.PI)*5;
        var spdY = Math.sin(angle/180*Math.PI)*5;
        Bullet(id,x,y,spdX,spdY,width,height,actor.type);
	}

	testCollisionRectRect =  function (rect1, rect2){
		return rect1.x <= rect2.x + rect2.width
			&& rect2.x <= rect1.x + rect1.width
			&& rect1.y <= rect2.y + rect2.width
			&& rect2.y <= rect1.y + rect1.width
	}