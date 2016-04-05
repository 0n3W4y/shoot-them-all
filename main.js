var set_component_in = function(object, className, id, component){ 
	var p = object,
	f = id,
	s = className;
	if (p[s] === undefined){
			p[s] = {};
		}
		p = p[s];
	}
	p[f] = component;
	return;
};

var get_component_in = function(object, className, id){
	var p = object;
	var o = null;
	for (var key in p){
		if (key == className){
			for (var a in p[key]){
				if (a == id){
					o = p[key];
					break;
				}
			}
		}
	}
	
	return o;
};

var randomSortingForArray = function(a, b){
	return Math.round(Math.random());
};

var randomHit = function(){
	return Math.round(Math.random());
};

var giveGunToAllPlayers = function(){
	var a = world.components.Gun
	for (var i in a){
		var b = a[i];
	};

	var o = world.components.Player;
	for (var key in o){
		var p = o[key];
		p.gun = Object.assign({}, b);
		console.log(p.name + " now have a " + p.gun.name);
	}
};

//-------------------------------------------------------------------------------------------------------------------------

var WeaponnStats = Trait.inherit({
	__className: "GunStats",

	clipMax:null,
	clip:null,
	range:null,
	rateOfFire:null,
	damage:null
});

/*
 попытка сделать инвентарь в виде собрания компонентов, и присвоения им свойств, таких как inBag = true; inBelt = true; inEquip = true, получилось, но 
 возникли другие сложности, например как в поиске нужного предмета или даже замене существующего предмета на новый. Сложности заключаются в том, 
 что функция слишком много времени тратит на поиск в этом огромном объекте components, решил все же создать инвентарь в виде мелких объектов 
 и коопировать туда ссылки, из главного объекта всех компонентов игрока.

var PlayerInventory = Trait.inherit({
	__className: "PlayerInventory",

	set_item_in: function(pos, item){ //Bag, belt, equip
		var place = "setTo" + pos.charAt(0).toUpperCase() + str.slice(1);
		var func = this[place];
		func(item);
	},

	get_item_in: function(pos, item){ //bag, belt, equip

	}

});

var InventoryBag = Trait.inherit({
	__className: "InventoryBag",

	bagMaxSlots:null,
	bagCurrentSlots:null,

	setToBag: function(item){
		if (this.bagCurrentSlots > 0){
			this.bagCurrentSlots--;
			item.inBag = true;
		}else{
			return false;
		}
		return item;
	}

});

var InventoryBelt = Trait.inherit({
	__className: "InventoryBelt",

	beltMaxSlots:null,
	beltCurrentSlots:null,

	setToBelt: function(item){
		if (this.beltCurrentSlots > 0){
			this.beltCurrentSlots--;
			item.inBelt = true;
		}else{
			//this.replace("belt", item);
		}
		return item;
	}

});

var InventoryEquip = Trait.inherit({
	__className: "InventoryEquip",

	setToEquip: function(item){
		if (item.place){
			for (var key in this.components.)
		}
	}

});
*/

var PlayerInventory = Trait.inherit({
	__className: "PlayerInventory",

	set_in:function (pos, item){
		var setter = "setTo" + pos.charAt(0).toUpperCase() + pos.slice(1);
		var func = this[setter];
		fucn(item);
	}

});

var InventoryBag = Trait.inherit({
	__className: "InventoryBag",

	bagMaxSlots:null,
	bagCurrentSlots:null,
	bagVault:{},

	setToBag:function (item){
		if (this.bagCurrentSlots > 0){
			// if collectble ... код
			this.bagCurrentSlots--;
			item.inBag = true;
			if (this.bagMaxSlots == this.bagCurrentSlots){
				this.bagVault.slot1 = item;
				return;
			}
			var num = 1;
			for (var key in this.bagVault){
				if (this.bagVault[key] === undefined){
					this.bagVault[key] = item;
					return;
				}
				num++;
			}
			num = "slot" + num;
			this.bagVault[num] = item;
		}
	}

});

var InventoryBelt = Trait.inherit({
	__className: "InventoryBelt",

	beltMaxSlots:null,
	beltCurrentSlots:null,
	beltVault:{},

	setToBelt: function(item){
		if (this.beltCurrentSlots > 0){
			// if collectble ... код
			this.beltCurrentSlots--;
			item.inBelt = true;
			item.inBag = false;
			this.bagCurrentSlots++;
			if (this.beltMaxSlots == this.beltCurrentSlots){
				this.beltVault.slot1 = item;
				return;
			}
			var num = 1;
			for (var key in this.beltVault){
				if (this.beltVault[key] === undefined){
					this.beltVault[key] = item;
					return;
				}
				num++;
			}
			num = "slot" + num;
			this.bagVault[num] = item;
		}
	}

});

var InventoryEquip = Trait.inherit({
	__className: "InventoryEquip",

	equipVault:{
		head:null,
		shoulders:null,
		hands:null,
		torso:null,
		belt:null,
		pants:null,
		boots:null,
		neck:null,
		ringOne:null,
		ringTwo:null,
		rightHand:null,
		leftHand:null
	},

	setToEquip: function(item){ // предположим класс объекта armor и weapon будут иметь схжие свойства, такие как equipPlace или что-то подобное, по нему буду искать и "одевать" предмет на игрока.
		var position = (item.equipPlace) ? item.equipPlace : return; // !!!!!!!!!!!!!!!
		var equipPos = this.equipVault.position;
		if (!equipPos){
			equipPos = item;
			item.inEquip = true;
			item.inBag = false;
		}else{
			equipPos.inEquip = false;
			equipPos.inBag = true;
			equipPos = item;
		}
		if (item.twoHanded){
			this.equipVault.leftHand = item; // or block, false, or s0m3thing else...
		}
	}
});

var PlayerStats = Trait.inherit({
	__className: "PlayerStats",

	hp:null
})
var PlayerScore = Trait.inherit({
	__className: "PlayerScore",

	kills:null,
	deaths:null,
	shoots:null,
	hits:null,
	steps:null

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
		var o = this.parent.components.Player;
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
		var shootRange = this.gun.range;
		var distance = Math.min(distanceX, distanceY);
		if (distance <= shootRange){
			return true;
		}
		return false;
	},

	needReload: function(){
		var clip = this.gun.clip;
		if (clip == 0){
			return true;
		}
		return false;
	},

	aiLogic: function(delta){
		if (this.hp <= 0){
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
				this.parent.stopLoop(); // временное окончание
				console.log("Game ended");
				return;
			}
		}

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

	spawn: function(){
		var worldMapX = this.parent.gameMap.x;
		var worldMapY = this.parent.gameMap.y;
		var pointX = Math.round(Math.random()*worldMapX);
		var pointY = Math.round(Math.random()*worldMapY);
		this.currentPoint = {x: pointX, y: pointY};
		this.currentPosition = {x: pointX, y: pointY};
		this.onSpawn();
		this.shootingDelta = this.gun.rateOfFire*1000;
		return;
	},

	onSpawn: function(){
		var rightNow = this.timeToConsole();
		console.log(rightNow + this.name + " spawned on [x=" + this.currentPoint.x + "; y=" + this.currentPoint.y + "]");
	}
})

var GameDeath = Trait.inherit({
	__className: "GameDeath",

	death: function(){

	}
});

var GameShoot = Trait.inherit({
	__className: "GameShoot",

	shootingDelta: null,
	shoot: function(delta, target){
		var shootingSpeed = this.gun.rateOfFire*1000;
		if (this.shootingDelta >= shootingSpeed){
			this.gun.clip--;
			var missOrHit = randomHit();
			if (missOrHit){
				target.hp -= gun.damage;
				this.hits++;
			}
			if (!target.hp){
				this.myEnemy = null;
				target.deaths++;
			}
			missOrHit = (missOrHit) ? "Hit" : "Miss";
			this.shootingDelta = 0;
			this.shoots++;
			this.onShoot(target, missOrHit);
		}else{
			this.shootingDelta += delta;
		}

	},

	onShoot: function(target, missOrHit){
		var rightNow = this.timeToConsole();
		console.log(rightNow + this.name + " shooted to " + target.name + ", and " + missOrHit);
	}
});

var GameReload = Trait.inherit({
	__className: "GameReload",

	reload: function(){
		this.gun.clip = this.gun.maxClip;
		this.onReload();
	},

	onReload: function(){
		var rightNow = this.timeToConsole();
		console.log(rightNow + this.name + " reloading his weapon");
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
			this.shootingDelta = this.gun.rateOfFire*1000;
		}
		
	},

	onMove: function(){ //log
		var rightNow = this.timeToConsole();
		console.log(rightNow + this.name + " was moved in to: [x=" + this.currentPosition.x + "; y=" + this.currentPosition.y + "]");
	}
});

var CommonTick = Trait.inherit({
	__className: 'CommonTick',

	fps: 30,
	loopId: null,

	startLoop : function() {
		if (this.loopId) {
			clearInterval(this.loopId);
		}
		this.loopId = window.setInterval(this.tick.bind(this), 1000/this.fps);
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

var CommonBotControl = Trait.inherit({
	__className: "CommonbotControl",

	bots:null,

	addBotToWorld: function(data){
		if (!this.botsInGame){
			this.botsInGame = 1;
			data.userInterfaceId = "robot1"
			return; 
		}
		var newid = "robot" + this.botsInGame;
		$("div#infoBlock").clone().attr("id", newid).appendTo("div#mainStatBlock");
		this.botsInGame++;
		data.userInterfaceId = newid;
		return;
	}

});

var CommonComponent = Object.inherit(

{
	__className: "CommonComponent",


	initialize: function(data, params){
		console.log("initialize started...");
		this.commonInit(data, params);
	},

	commonInit: function(data, params){
		this.id = data.id ? data.id : this.createId();
		this.name = data.name;
		this.parent = data.parent;
		this.components = this.components ? this.components : {};
		if (params){
			for (var key in params){
				this[key] = params[key];
			}
		}

		console.log("commonInit done.");
	},

	createComponent: function(classDefenition, data, params){
		var className = classDefenition.prototype.__className;
		if (!data.parent){
			data.parent = this;
		}
		var component = new classDefenition(data, params);
		set_component_in(this.components, className, component.id, component);
		if (className == "Player"){
			this.fillUserIface(component);
		}
		console.log("create component done, created: " + className + ", with name:" + data.name);
		return component;
	},

	removeComponent: function(classDefenition, id){
		var componentId = get_component_in(classDefenition, id);
	},

	createId: function(classDefenition){ // спизжено, нужно разобраться)
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});
	},

	timeToConsole: function(){
		var time = $.now();
		var date = new Date(time);
		var hh = date.getHours();
		var mm = date.getMinutes();
		var ss = date.getSeconds();
		return "[" + hh + ":" + mm + ":" + ss + "] ";
	},

	fillUserIface: function(data){

	}

});

var Gun = CommonComponent.inherit(
	WeaponStats,
{
	__className: "Gun",

	name: "gun"
});

var Player = CommonComponent.inherit(
	GameShoot,
	GameReload,
	GameWalk,
	GameDeath,
	GameAI,
	GameSpawn,
	PlayerScore,
	PlayerStats,
{
	__className: "Player",

	name: "NickName"

});

var World = CommonComponent.inherit(
	CommonTick,
	CommonBotControl,
{
	__className: "World",

	gameMap: {x: 100, y: 100},
	botsInGame: 0,
	update: function(delta){
		this.runAI(delta);
		this.gameResult();
	},

	runAI: function(delta){
		var o = this.components.Player;
		for (var key in o){
			var p = o[key];
			p.aiLogic(delta);
		}
	},

	gameResult: function(){

	}

});

var world = new World({id:"main", name:"DesertHiils", parent:window});
var playerOne = world.createComponent(Player, {name:"NormalWalkingBot"}, {hp: 2});
var playerTwo = world.createComponent(Player, {name:"SlowWalkingBot"}, {velocity: 0.75, hp: 2});
var playerThree = world.createComponent(Player, {name:"FastWalkingBot"}, {velocity: 1.25, hp: 2});
var playerFour = world.createComponent(Player, {name:"VerySlowWalkingBot"}, {velocity: 0.5, hp: 2});
playerOne.createComponent(Gun, {name: "Small Gun"}, {clip: 6, maxClip: 6, rateOfFire: 1, range: 4, damage: 1});
playerTwo.createComponent(Gun, {name: "Small Gun"}, {clip: 6, maxClip: 6, rateOfFire: 1, range: 4, damage: 1});
playerThree.createComponent(Gun, {name: "Small Gun"}, {clip: 6, maxClip: 6, rateOfFire: 1, range: 4, damage: 1});
playerFour.createComponent(Gun, {name: "Small Gun"}, {clip: 6, maxClip: 6, rateOfFire: 1, range: 4, damage: 1});

$(document).ready(function(){
	$("input#pause").click(function(){
		var attribute = $(this).attr("value") == "unpause" ? "pause" : "unpause";
		$(this).attr("value", attribute);
		return world.togglePause();});
	$("input#start").attr("onclick", "world.startLoop()");
	$("input#add_bot").attr("onclick", "world.addBotToWorld()");
	$("input#del_bot").attr("onclick", "removeBotFromWorld()");
})