var set_in = function(object, className, id, component){ 
	var p = object,
	f = id,
	s = className;
	if (p[s] === undefined){
		p[s] = {};
	}
	p = p[s];
	p[f] = component;
	return;
};

var get_in = function(object, ...args) {
	var p = object;
	for (var i = 0; i < args.length; i++) {
		var f = args[i]
		var n = p[f];
		if (n === undefined) {
			return n;
		} else {
			p = n;
		}
	}
	return p;
};


//-------------------------------------------------------------------------------------------------------------------------

var PlayerInventory = Trait.inherit({
	__className: "PlayerInventory",

	bagMaxSlots:null,
	bagCurrentSlots:null,
	beltMaxSlots:null,
	beltCurrentSLots:null,
	//equip:  head,  shoulders, hands, torso, pants,  boots,  ring1,  ring2,  rightHand,  leftHand;
	initInventory: function(data){
		this.bagMaxSlots = (data) ? data.bagMaxSlots || 10 : 10; //default 10
		this.bagCurrentSlots = this.bagMaxSlots;
		this.beltMaxSlots = (data) ? data.beltMaxSlots || 5 : 5; //default 5
		this.beltCurrentSLots = this.beltMaxSlots;
	},

	replaceItem: function(newPos, item, amount, slot, params){
		if (typeof newPos != "string"){
			console.log("Error from placeItem, newPos typeof = " + (typeof newPos));
			return false;
		}
//		if (item.maxAmount > 1){ // for collectable
//			var className = item.__proto__.__className;
//			var id = item.id;
//			var itemInBag = get_in(this.components, className, id);
//			if (itemInBag){
//
//			}
//			return item;
//		}
		slot = slot || item.bodySlot;
		if (!slot){
			console.log("Error from replaceItem, slot = " + slot);
			return false;
		}
		var oldItem = this.getItemOnSlot(slot, newPos);
		if (oldItem){
			var slotForOldItem = item.slot;
			var placeForOldItem = item.place;
			item.slot = oldItem.slot;
			item.place = oldItem.place;
			oldItem.slot = slotForOldItem;
			oldItem.place = placeForOldItem;
			return item; //!!!!
		}

		item.place = newPos;
		item.slot = slot;

		if (newPos != "body"){
			var position = newPos + "CurrentSlots";
			this[position]--;
		}
		this.onPlaceObject(item);
		return item;
		
	},

	lootObject: function(item){ 
		if (this.bagCurrentSlots > 0){
			var newItem = this.getData(item);
			var dataItem = newItem[1];
			var paramsItem = newItem[2];
			var classDefinition = newItem[0];
			newItem = this.createComponent(classDefinition, dataItem, paramsItem);
			var amount = (newItem.amount) ? newItem.amount : 1;
			var slot = this.countSlotInPlace("bag");
			this.replaceItem("bag", newItem, amount, slot);
			return newItem;
		}
		console.log("error from lootObject, bagCurrentSlots <= 0");
		return false;
		
	},

	countSlotInPlace: function(place){
		var arr = [];
		var components = this.getComponentList(this, "components");
		for (var key in components){
			var obj = components[key];
			for (var num in obj){
				var a = obj[num].slot;
				if (a && obj[num].place == place){
					arr.push(a);
				}
			}
		}
		arr.sort();
		var result = 1;
		for (var i = 0; i < arr.length; i++){
			if (arr[i] != i+1){
				break;				
			}else{
				result++;
			}
		}

		return result;
	},

	getItemOnSlot: function(slot, place){
		var components = this.getComponentList(this, "components");
		for (var key in components){
			var obj = components[key];
			for (var num in obj){
				var a = obj[num].slot;
				var b = obj[num].place;
				if (a == slot && b == place){
					return obj[num];
				}
			}
		}
	},

	onPlaceObject: function(item){
		var now = this.timeToConsole();
		var data = now + item.name + " placed into " + item.place + " // slot:" + item.slot;
		this.parent.updateUIfightingLog(this, data);
	}
});


var GameAI = Trait.inherit({
	__className: "GameAI",

	myEnemy: null,
	findClosestEnemy: function(players){
		var allEnemies = players;
		var enemyPoints = [];
		var result = [];
		for (var i = 0; i < allEnemies.length; i++){
			var a = allEnemies[i];
			enemyPoints.push(a.currentPosition);
		}
		for (var j = 0; j < enemyPoints.length; j++){
			var b = enemyPoints[j];
			var distanceX = Math.abs(b.x - this.currentPosition.x);
			var distanceY = Math.abs(b.y - this.currentPosition.y);
			var distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
			result.push(distance);
		}
		var enemy = Math.min(...result);
		var enemyId = result.indexOf(enemy);
		return allEnemies[enemyId];
	},

	findAllPlayers: function(){
		var parent = this.getParent();
		var o = this.getComponentList(parent, "components", "Player");
		var enemyArr = [];
		for (var key in o){
			var a = o[key];
			if (a.name != this.name){
				enemyArr.push(a);
			}
		}
		return enemyArr;
	},

	findAlivePlayers: function(players){
		var o = players;
		var result = [];
		for (var i = 0; i < o.length; i++){
			var p = o[i];
			if (p.hp > 0){
				result.push(p);
			}
		}
		return result;
	},

	findPath: function(enemy){
		var enemyPosition = enemy.currentPosition;
		var positionX = this.currentPosition.x - enemyPosition.x;
		var positionY = this.currentPosition.y - enemyPosition.y;
		var stepX = (positionX > 0) ? -1 : 1;
		if ( positionX == 0){
			stepX = 0;
		}
		var stepY = (positionY > 0) ? -1 : 1;
		if ( positionY == 0){
			stepY = 0;
		}
		return [stepX, stepY];
	},

	canShootToEnemy: function(){
		var distanceX = Math.abs(this.currentPosition.x - this.myEnemy.currentPosition.x);
		var distanceY = Math.abs(this.currentPosition.y - this.myEnemy.currentPosition.y);
		var weapon = this.getItemOnSlot("rightHand", "body");
		var shootRange = weapon.range;
		var distance = Math.min(distanceX, distanceY);
		if (distance <= shootRange){
			return true;
		}
		return false;
	},

	needReload: function(){
		var weapon = this.getItemOnSlot("rightHand", "body");
		var clip = weapon.clip;
		if (clip == 0){
			return true;
		}
		return false;
	},

	aiLogic: function(delta){
		if (this.hp === 0 || this.hp < 0){
			if (!this.deathTime){
				this.death();
			}
			this.respawn(delta);
			return;
		}
		if (!this.currentPoint){
			this.spawn();
			return;
		};

		if (!this.myEnemy){
			var allPlayers = this.findAllPlayers();
			var alivePlayers = this.findAlivePlayers(allPlayers);
			if (alivePlayers.length > 0){
				this.myEnemy = this.findClosestEnemy(alivePlayers);
			}else{
				var now = this.timeToConsole();
				console.log(now + this.name + " have not an any enemy");
				return;
			}
		}
		if (this.myEnemy.deathTime){
			this.myEnemy = null;
			return;
		};

		var path = this.findPath(this.myEnemy);
		if (this.needReload()){
			this.reload();
			return;
		}
		if (this.canShootToEnemy()){
			this.shoot(delta, this.myEnemy);
			return;
		}
		this.move(delta ,path);
	}


});

var GameSpawn = Trait.inherit({
	__className: "GameSpawn",

	respawnDelta:0,
	respawnTime:5, // 5 seconds;

	spawn: function(){
		var worldMapX = this.parent.gameMap.x;
		var worldMapY = this.parent.gameMap.y;
		var pointX = Math.round(Math.random()*worldMapX);
		var pointY = Math.round(Math.random()*worldMapY);
		this.currentPoint = {x: pointX, y: pointY};
		this.currentPosition = {x: pointX, y: pointY};
		var weapon = this.getItemOnSlot("rightHand", "body");
		this.shootingDelta = weapon.rateOfFire*1000;
		this.deathTime = null;
		this.hp = this.maxHp;
		return 	this.onSpawn();
	},

	respawn: function(delta){
		if (this.respawnDelta >= this.respawnTime*1000){
			this.currentPoint = null;
			this.currentPosition = null;
			var weapon = this.getItemOnSlot("rightHand", "body");
			weapon.clip = weapon.clipMax;
			this.respawnDelta = 0;
			return 	this.spawn();
		}
		if (this.respawnDelta == 0){
			this.onRespawn();
		}
		this.respawnDelta += delta;

	},

	onSpawn: function(){
		var rightNow = this.timeToConsole();
		var data = rightNow + "spawned on [x=" + this.currentPoint.x + "; y=" + this.currentPoint.y + "]";
		var parent = this.getParent();
		parent.updateUIfightingLog(this, data);
	},

	onRespawn: function(){
		var now = this.timeToConsole();
		var data = now + "Respawned in " +this.respawnTime+ " seconds.";
		var parent = this.getParent();
		parent.updateUIfightingLog(data);
	}
})

var GameDeath = Trait.inherit({
	__className: "GameDeath",

	deathTime:null,

	death: function(){
		this.deathTime = $.now();
		this.onDeath();
	},

	onDeath: function(){
		var rightNow = this.timeToConsole();
		var data = rightNow + "was killed by " + this.killer.name;
		this.parent.updateUIfightingLog(this, data);
	}
});

var GameShoot = Trait.inherit({
	__className: "GameShoot",

	shootingDelta: null,
	shoot: function(delta, target){
		var weapon = this.getItemOnSlot("rightHand", "body");
		var shootingSpeed = weapon.rateOfFire*1000;
		if (this.shootingDelta >= shootingSpeed){
			weapon.clip--;
			this.shoots++;
			var missOrHit = Math.round(Math.random());
			if (missOrHit){
				target.hp -= weapon.damage;
				this.hits++;
			}
			if (!target.hp){
				this.myEnemy = null;
				target.deaths++;
				this.kills++;
				target.killer = this;
			}
			missOrHit = (missOrHit) ? "Hit" : "Miss";
			this.shootingDelta = 0;
			this.onShoot(target, missOrHit);
		}else{
			this.shootingDelta += delta;
		}

	},

	onShoot: function(target, missOrHit){
		var rightNow = this.timeToConsole();
		var data = rightNow + "shooted to " + target.name + ", and " + missOrHit;
		this.parent.updateUIfightingLog(this, data);
	}
});

var GameReload = Trait.inherit({
	__className: "GameReload",

	reload: function(){
		var weapon = this.getItemOnSlot("rightHand", "body");
		weapon.clip = weapon.clipMax;
		this.onReload();
	},

	onReload: function(){
		var rightNow = this.timeToConsole();
		var data = rightNow + "reloading his weapon";
		this.parent.updateUIfightingLog(this, data);
	}
})

var GameWalk = Trait.inherit({
	__className: "GameWalk",

	velocity: 1, // 1 - step, 2 - run
	currentPoint: null,
	currentPosition: null,

	move: function(delta, path){
		var dirX = path[0];
		var dirY = path[1];
		var pX = this.currentPoint.x;
		var pY = this.currentPoint.y;
		var a = this.velocity/delta;
		var pointX = pX + dirX*a;
		var pointY = pY + dirY*a;
		this.currentPoint = {x: pointX, y: pointY};
		var difX = Math.abs(this.currentPosition.x - pointX);
		var difY = Math.abs(this.currentPosition.y - pointY);
		var positionX = positionY = null;
		var dif = a*2;
		if (difX > 1 - dif && difX < 1 + dif){
			positionX = Math.round(pointX);
			this.currentPosition.x = positionX;
		}
		if (difY > 1 - dif && difY < 1 + dif){
			positionY = Math.round(pointY);
			this.currentPosition.y = positionY;
		}

		if (positionX || positionY){
			this.onMove();
			this.steps++;
			var weapon = this.getItemOnSlot("rightHand", "body");
			this.shootingDelta = weapon.rateOfFire*1000;
		}
		
	},

	onMove: function(){ //log
		var rightNow = this.timeToConsole();
		var data = rightNow + " was moved in to: [x=" + this.currentPosition.x + "; y=" + this.currentPosition.y + "]";
		this.parent.updateUIfightingLog(this, data);
	}
});

var CommonTick = Trait.inherit({
	__className: 'CommonTick',

	fps: 30,
	loopId: null,
	loopStarted:null,

	startLoop : function() {
		if (this.loopId) {
			clearInterval(this.loopId);
		}
		this.loopId = window.setInterval(this.tick.bind(this), 1000/this.fps);
		this.loopStarted = $.now();	
		return this;
	},

	stopLoop : function() {
		if (this.loopId) {
			clearInterval(this.loopId);
			this.loopId = null;
			console.log("Game stopped");
		}
	},

	paused: undefined,
	togglePause : function() {
		this.paused = !this.isPaused();
	},

	isPaused : function() {
		return this.paused;
	},

	now: function() {
		return $.now();
	},

	lastTick: 0,
	tick: function() {
		if (this.paused){
			return;
		}
		var time = this.now();
		var delta = time - this.lastTick;
		if (delta > 66) { // ~2*1000/this.fps;
			delta = 33; // ~1000/this.fps;
		}
		this.update(delta);
		this.lastTick = time;
	}
});

var GameBotControl = Trait.inherit({
	__className: "CommonBotControl",

	bots:null,
	botsInGame:null,

	addBotToWorld: function(data){
		if (!this.botsInGame){
			this.botsInGame = 1;
			data.userInterfaceId = "robot1"
			return; 
		}
		var newId = "robot" + this.botsInGame;
		$("div#infoBlock").clone().attr("id", newId).appendTo("div#mainStatBlock");
		this.botsInGame++;
		data.userInterfaceId = newid;
		return;
	}

});

var CommonComponent = Object.inherit(

{
	__className: "CommonComponent",


	initialize: function(data, params){
		this.commonInit(data, params);
	},

	commonInit: function(data, params){
		this.id = data.id ? data.id : this.createId();
		this.name = data.name;
		this.parent = data.parent;
		this.components = this.components ? this.components : {};
		if (params){
			for (var key in params){
				if (typeof params[key] != "Object"){
					this[key] = params[key];
				}
			}
		}
	},

	createComponent: function(classDefinition, data, params){
		var className = classDefinition.prototype.__className;
		if (!data.parent){
			data.parent = this;
		}
		var component = new classDefinition(data, params);
		set_in(this.components, className, component.id, component);
		if (className == "Player"){
			component.initInventory(params.inventory);
		}
		return component;
	},

	removeComponent: function(data){
		var className = data.__proto__.constructor.__className;
		var id = data.id;
		delete this.copmonents[className][id]; //test
		return;
	},

	createId: function(classDefinition){ // спизжено, нужно разобраться)
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});
	},

	timeToConsole: function(){
		var time = $.now();
		var date = new Date(time);
		var hh = date.getHours();
		hh = (hh <= 9)? "0" + hh : hh;
		var mm = date.getMinutes();
		mm = (mm <= 9)? "0" + mm : mm;
		var ss = date.getSeconds();
		ss = (ss <= 9)? "0" + ss : ss;
		return "[" + hh + ":" + mm + ":" + ss + "] ";
	},

	getData: function(item){
		var classDefinition = item.__proto__.constructor;
		var newItemData = {};		
		newItemData.id = item.id;
		newItemData.name = item.name;
		newItemData.components = $.extend(true, {}, item.components);
		var newItemParams = $.extend({}, item);
		delete newItemParams.components;
		delete newItemParams.id;
		delete newItemParams.name;
		delete newItemParams.parent;
		delete newItemParams.__className;
		return [classDefinition, newItemData, newItemParams];
	},

	getComponentList: function(object, ...args){
		var result = get_in(object, ...args);
		return result;
	},

	getParent: function(){
		return this.parent;
	}
});

var Ammo = CommonComponent.inherit(

{
	__className: "Ammo",

	name:null,
//additional
	caliber:null,
	maxAmount:null,
	amount:null
})

var Weapon = CommonComponent.inherit(

{
	__className: "Weapon",

	name:null,
//stats
	clipMax:null,
	clip:null,
	range:null,
	rateOfFire:null,
	damage:null,
	ammo:null,
//additional
	slot:null,
	place:null,
	bodySlot:"rightHand", 
	twoHanded:false
});

var Player = CommonComponent.inherit(
	GameShoot,
	GameReload,
	GameWalk,
	GameDeath,
	GameAI,
	GameSpawn,
	PlayerInventory,

{
	__className: "Player",

	name: "NickName",
	userInterfaceId:null,
//stats
	hp:null,
	maxHp:null,
//score
	kills:null,
	deaths:null,
	shoots:null,
	hits:null,
	steps:null

});

var World = CommonComponent.inherit(
	CommonTick,
	GameBotControl,
{
	__className: "World",

	gameMap: {x: 100, y: 100},
	deltaToStop:0, //temporary
	stopIn:120000, //120 seconds

	update: function(delta){
		this.runAI(delta);
		this.updateUI(); //update all UI 
		this.gameResult(delta);
		this.gameAutoStop(delta);
	},

	runAI: function(delta){
		var o = this.getComponentList(this, "components", "Player");
		for (var key in o){
			var p = o[key];
			p.aiLogic(delta);
		}
	},

	gameResult: function(delta){

	},

	updateUI: function(){
		var dif = Math.round((this.stopIn - this.deltaToStop)/1000) + " seconds.";
		$("#timeremaning span").text(dif);
		var allPlayers = this.getComponentList(this, "components", "Player");
		for (var key in allPlayers){
			this.updateUIplayerStats(allPlayers[key]);
		}
	},

	gameAutoStop: function(delta){ //temporary function for stopping the game
		if (this.deltaToStop >= this.stopIn){
			this.stopLoop();
		}
		this.deltaToStop += delta;
	},

	updateUIfightingLog: function(player, data){
		var playerId = "div#" + player.userInterfaceId;
		data = "<li>" + data + "</li>";
		$(playerId).find("ul#fighting-log").prepend(data);
	},

	updateUIplayerStats: function(player){
		var weapon = player.getItemOnSlot("rightHand", "body");
		var hp = player.hp || 0,
		gun = weapon.name,
		clip = weapon.clip || 0,
		kills = player.kills || 0,
		steps = player.steps || 0,
		death = player.deaths || 0,
		shoots = player.shoots || 0,
		hits = player.hits || 0,
		nickName = player.name,
		status = (player.deathTime) ? "Dead" : "Alive",
		enemy = (player.myEnemy) ? player.myEnemy.name : "No target",
		acc = (hits/shoots) ? Math.round(hits/shoots*100) + "%" : "0%",
		playerId = "div#" + player.userInterfaceId;

		$(playerId).find("div#nickname").text(nickName);
		var stats = "Health: " +hp+ " | Status: " +status+ "<br> Enemy: " +enemy+ "<br> Gun: " +gun+ " | Clip: " +clip+ "<br> Kills: " +kills+ " | Death: " +death+ "<br> Shoots: " +shoots+ " | Hits: " +hits+ " | Acc: " +acc+ "<br> Steps: " +steps;
		$(playerId).find("div.statstext").html(stats);
	}

});

var world = new World({id:"main", name:"DesertHiils", parent:window});
var playerOne = world.createComponent(Player, {name:"NormalWalkingBot"}, {maxHp: 2, inventory:{bagMaxSlots:15}, userInterfaceId:"robot1"});
var playerTwo = world.createComponent(Player, {name:"SlowWalkingBot"}, {velocity: 0.75, maxHp: 2, userInterfaceId:"robot2"});
var playerThree = world.createComponent(Player, {name:"FastWalkingBot"}, {velocity: 1.25, maxHp: 2, userInterfaceId:"robot3"});
var playerFour = world.createComponent(Player, {name:"VerySlowWalkingBot"}, {velocity: 0.5, maxHp: 2, userInterfaceId:"robot4"});
var gun = new Weapon({name: "Magnum 44"}, {clip: 6, clipMax: 6, rateOfFire: 1, range: 4, damage: 1, equipPlace:"rightHand", ammo:"0,44"});
var ammoForGun = new Ammo({name:"Ammo 0,44"}, {caliber:"0,44", maxAmount:24});


$(document).ready(function(){
	$("input#pause").click(function(){
		var attribute = $(this).attr("value") == "unpause" ? "pause" : "unpause";
		$(this).attr("value", attribute);
		return world.togglePause();});
	$("input#start").attr("onclick", "world.startLoop()");
	$("input#add_bot").attr("onclick", "world.addBotToWorld()");
	$("input#del_bot").attr("onclick", "removeBotFromWorld()");
	var player1Gun = playerOne.lootObject(gun);
	playerOne.lootObject(ammoForGun);
	var player2Gun = playerTwo.lootObject(gun);
	playerTwo.lootObject(ammoForGun);
	var player3Gun = playerThree.lootObject(gun);
	playerThree.lootObject(ammoForGun);
	var player4Gun = playerFour.lootObject(gun);
	playerFour.lootObject(ammoForGun);
	playerOne.replaceItem("body", player1Gun);
	playerTwo.replaceItem("body", player2Gun);
	playerThree.replaceItem("body", player3Gun);
	playerFour.replaceItem("body", player4Gun);

})