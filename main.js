var set_component_in = function(object, className, id, component){ 
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

var get_component_in = function(object, className, id){
	var p = object;
	var o = null;
	var result = undefined;
	for (var key in p){
		if (key == className){
			o = p[key];
			for (var num in o){
				if (num == id){
					result = o[num];
					break;
				}
			}
		}
	}
	
	return result;
};

var randomSortingForArray = function(a, b){
	return Math.round(Math.random());
};

var randomHit = function(){
	return Math.round(Math.random());
};

//-------------------------------------------------------------------------------------------------------------------------

var WeaponStats = Trait.inherit({
	__className: "WeaponStats",

	clipMax:null,
	clip:null,
	range:null,
	rateOfFire:null,
	damage:null,
	ammo:null
});

var WeaponAdditional = Trait.inherit({
	__className: "WeaponAdditional",

	equipPlace:null

});

var AmmunitionStats = Trait.inherit({
	__className: "AmmunitionStats",

	caliber:null
})

var AmmunitionAdditional = Trait.inherit({
	__className: "AmmunitionAdditional",

	canStack:true,
	maxStackSize:null,
	currentStackSize:null,

});

var PlayerInventory = Trait.inherit({
	__className: "PlayerInventory",

	initInventory: function(data){
		if(data){
			this.bagMaxSlots = data.bagMaxSlots || 10;
			this.bagCurrentSlots = this.bagMaxSlots;
			this.beltMaxSlots = data.beltMaxSlots || 5;
			this.beltCurrentSlots = this.beltMaxSlots;
		}else{ // default values
			this.bagMaxSlots = 10;
			this.bagCurrentSlots = this.bagMaxSlots;
			this.beltMaxSlots = 5;
			this.beltCurrentSlots = this.beltMaxSlots;
		}
	},

	replaceItem: function (newPos, item){
		var setter = "setTo" + newPos.charAt(0).toUpperCase() + newPos.slice(1).toLowerCase();
		var func = this[setter];
		return func.apply(this, [item]);
	},

	lootObject: function(item){
		if (this.bagCurrentSlots > 0){
			var newItem = this.getData(item);
			var dataItem = newItem[1];
			var paramsItem = newItem[2];
			var classDefinition = newItem[0];
			newItem = this.createComponent(classDefinition, dataItem, paramsItem);
			this.replaceItem("bag", newItem);
			return newItem;
		}
		console.log("error from lootObject, bagCurrentSlots <= 0");
		return false;
		
	},

});

var InventoryBag = Trait.inherit({
	__className: "InventoryBag",

	bagMaxSlots:null,
	bagCurrentSlots:null,

	setToBag:function (item){
		if (this.bagCurrentSlots > 0){
			// if collectble ... код
			this.bagCurrentSlots--;
			item.inBag = true;
			if (this.bagMaxSlots == this.bagCurrentSlots){
				this.bagSlot1 = item;
				this.onSetToBag(item.name);
				return item;
			}
			for (var i = 1; i <= this.beltMaxSlots;){
				var key = "bagSlot" + i;
				if (this[key] === undefined){
					this[key] = item;
					this.onSetToBag(item.name);
					return item;
				}
				i++;
			}
			return item;
		}
		return false;
	},

	onSetToBag: function(name){
		var time = this.timeToConsole();
		var data = time + name + " correctly obtained into the bag.";
		this.parent.updateUIfightingLog(this, data);
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
			item.inBag = false;
			if (this.beltMaxSlots == this.beltCurrentSlots){
				this.beltSlot1 = item;
				this.onSetToBelt(item.name);
				return item;
			}
			for (var i = 1; i <= this.beltMaxSlots;){
				var key = "beltSlot" + i;
				if (this[key] === undefined){
					this[key] = item;
					this.onSetToBelt(item.name);
					return item;
				}
				i++;
			}
		}
		return false;
	},

	onSetToBelt: function(name){
		var time = this.timeToConsole();
		var data = time + name + " correctly obtained on belt.";
		this.parent.updateUIfightingLog(this, data);
	}

});

var InventoryEquip = Trait.inherit({
	__className: "InventoryEquip",

	equipHead:null,
	equipShoulders:null,
	equipHands:null,
	equipTorso:null,
	equipBelt:null,
	equipPants:null,
	equipBoots:null,
	equipNeck:null,
	equipRingOne:null,
	equipRingTwo:null,
	equipRightHand:null,
	equipLeftHand:null,

	setToEquip: function(item){ // предположим класс объекта armor и weapon будут иметь схжие свойства, такие как equipPlace или что-то подобное, по нему буду искать и "одевать" предмет на игрока.
		var position = (item.equipPlace) ? item.equipPlace : null;
		if (!position){
			console.log("error, "+ item.name + " can't wear, because item.equipPlace is " + item.equipPlace);
			return false;
		}
		if (item.twoHanded){
			if (equipLeftHand && equipRightHand && (equipLeftHand.id != equipRightHand.id)){
				if (this.bagCurrentSlots >= 1){
					this.equipLeftHand.inEquip = false;
					this.equipLeftHand.inBag = true;
					this.equipRightHand.inEquip = false;
					this.equipRightHand.inBag = true;
					this.bagCurrentSlots++;
					this.equipRightHand = item;
					item.inBag = false;
					item.inEquip = true;
					this.onSetToEquip(item.name, item.equipPlace);
					return item;
				}else{
					console.log("error, "+ item.name + " can't wear, because bag current slots " + this.bagCurrentSlots);
					return false;
				}
			}
		}

		if (!this[position]){
			this[position] = item;
			item.inEquip = true;
			item.inBag = false;
			this.bagCurrentSlots++;
		}else{
			this[position].inEquip = false;
			this[position].inBag = true;
			this[position] = item;
			item.inBag = false;
			item.inEquip = true;
		}
		if (item.twoHanded){ //либо блокируем либо дублируем дуручное оружие в левую руку, я задублировал
			this.equipLeftHand = item; // or block, false, or s0m3thing else...
		}
		this.onSetToEquip(item.name, item.equipPlace);
		return item;
	},

	onSetToEquip: function(name, place){
		var time = this.timeToConsole();
		var data = time + name + " correctly weared into " + place;
		this.parent.updateUIfightingLog(this, data);
	}
});

var PlayerStats = Trait.inherit({
	__className: "PlayerStats",

	hp:null,
	maxHp:null,
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
		var shootRange = this.equipRightHand.range;
		var distance = Math.min(distanceX, distanceY);
		if (distance <= shootRange){
			return true;
		}
		return false;
	},

	needReload: function(){
		var clip = this.equipRightHand.clip;
		if (clip == 0){
			return true;
		}
		return false;
	},

	aiLogic: function(delta){
		if (this.hp === 0 || this.hp < 0){
			if (this.status == "alive"){
				this.death();
				this.parent.updateUIplayerStats(this);
			}
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
		if (this.myEnemy.status == "dead"){
			this.myEnemy = null;
			return;
		};
		this.parent.updateUIplayerStats(this);

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
		this.shootingDelta = this.equipRightHand.rateOfFire*1000;
		this.status = "alive";
		this.hp = this.maxHp;
		return;
	},

	reSpawn: function(){
		this.currentPoint = [null, null];
		this.currentPosition = [null, null];
		this.equipRightHand.clip = this.equipRightHand.maxClip;
		return 	this.spawn();
	},

	onSpawn: function(){
		var rightNow = this.timeToConsole();
		var data = rightNow + "spawned on [x=" + this.currentPoint.x + "; y=" + this.currentPoint.y + "]";
		this.parent.updateUIfightingLog(this, data);
	}
})

var GameDeath = Trait.inherit({
	__className: "GameDeath",

	death: function(){
		this.status = "dead";
		setTimeout(this.reSpawn.bind(this), 5000);
		this.onDeath();
		var now = this.timeToConsole();
		var data = now + this.name + " have been respawned in 5 seconds";
		this.parent.updateUIfightingLog(this, data);
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
		var weapon = this.equipRightHand;
		var shootingSpeed = weapon.rateOfFire*1000;
		if (this.shootingDelta >= shootingSpeed){
			weapon.clip--;
			this.shoots++;
			var missOrHit = randomHit();
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
		var weapon = this.equipRightHand;
		weapon.clip = weapon.maxClip;
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
			this.shootingDelta = this.equipRightHand.rateOfFire*1000;
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

	startLoop : function() {
		if (this.loopId) {
			clearInterval(this.loopId);
		}
		this.loopId = window.setInterval(this.tick.bind(this), 1000/this.fps);
		setTimeout(world.stopLoop.bind(this), 120000); //timer to stop the game;
		
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
		$("#bechmarking").text(delta); //bechmarking can be removed
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
		set_component_in(this.components, className, component.id, component);
		if (className == "Player"){
			component.initInventory(params.inventory);
		}
		return component;
	},

	removeComponent: function(data){
		var className = data.__proto__.constructor.__className;
		var id = data.id;
		var componentId = get_component_in(this.components, className, id);
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
		var mm = date.getMinutes();
		var ss = date.getSeconds();
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
		return [classDefinition, newItemData, newItemParams];
	}

});

var Ammo = CommonComponent.inherit(
	AmmunitionStats,
	AmmunitionAdditional,
{
	name:null
})

var Gun = CommonComponent.inherit(
	WeaponStats,
	WeaponAdditional,
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
	PlayerInventory,
	InventoryEquip,
	InventoryBelt,
	InventoryBag,
{
	__className: "Player",

	name: "NickName",
	userInterfaceId:null,
	status:null

});

var World = CommonComponent.inherit(
	CommonTick,
	GameBotControl,
{
	__className: "World",

	gameMap: {x: 100, y: 100},

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

	},

	updateUIfightingLog: function(player, data){
		var playerId = "div#" + player.userInterfaceId;
		data = "<li>" + data + "</li>";
		$(playerId).find("ul#fighting-log").prepend(data);
	},

	updateUIplayerStats: function(player){
		var hp = player.hp || 0,
		gun = player.equipRightHand.name,
		clip = player.equipRightHand.clip || 0,
		kills = player.kills || 0,
		steps = player.steps || 0,
		death = player.deaths || 0,
		shoots = player.shoots || 0,
		hits = player.hits || 0,
		nickName = player.name,
		status = player.status,
		playerId = "div#" + player.userInterfaceId;
		var enemy = (player.myEnemy) ? player.myEnemy.name : "No target";	
		$(playerId).find("div#nickname").text(nickName);
		var stats = "Health: " +hp+ "<br> Gun: " +gun+ "<br> Clip: " +clip+ "<br> Enemy: " +enemy+ "<br> Kills: " +kills+ "<br> Steps: " +steps+ "<br> Death: " +death+ "<br> Shoots: " +shoots+ "<br> Hits: " +hits+ "<br> Status: " +status;
		$(playerId).find("div.statstext").html(stats);
	}

});

var world = new World({id:"main", name:"DesertHiils", parent:window});
var playerOne = world.createComponent(Player, {name:"NormalWalkingBot"}, {maxHp: 2, inventory:{bagMaxSlots:15}, userInterfaceId:"robot1"});
var playerTwo = world.createComponent(Player, {name:"SlowWalkingBot"}, {velocity: 0.75, maxHp: 2, userInterfaceId:"robot2"});
var playerThree = world.createComponent(Player, {name:"FastWalkingBot"}, {velocity: 1.25, maxHp: 2, userInterfaceId:"robot3"});
var playerFour = world.createComponent(Player, {name:"VerySlowWalkingBot"}, {velocity: 0.5, maxHp: 2, userInterfaceId:"robot4"});
var gun = new Gun({name: "Magnum 44"}, {clip: 6, maxClip: 6, rateOfFire: 1, range: 4, damage: 1, equipPlace:"equipRightHand", ammo:"0,44"});
var ammoForGun = new Ammo({name:"Ammo 0,44"}, {caliber:"0,44"});


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
	playerOne.setToEquip(player1Gun);
	playerTwo.setToEquip(player2Gun);
	playerThree.setToEquip(player3Gun);
	playerFour.setToEquip(player4Gun);

})