var set_component_in = function(object, className, id, component){ 
	var p = object;
	var f = id;
	for (var i = 1; i < arguments.length - 2; i++){
		var a = arguments[i];
		if (p[a] === undefined){
			p[a] = {};
		}
		p = p[a];
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
}

//-------------------------------------------------------------------------------------------------------------------------

var GameAI = Trait.inherit({
	__className: "GameAI",

	findClosestEnemy: function(players){
		var allEnemies = players;
		var enemyPoints = [];
		var result = [];
		for (var i = 0; i < allEnemies.length; i++){
			var a = allEnemies[i];
			enemyPoints.push(a.currentPoint);
		}
		for (var j = 0; j < enemyPoints.length; j++){
			var b = enemyPoints[j];
			var distanceX = b.x - this.currentPoint.x;
			var distanceY = b.y - this.currentPoint.y;
			distanceX = (distanceX > 0) ? distanceX : -distanceX;
			distanceY = (distanceY > 0) ? distanceY : -distanceY;
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

	findPath: function(enemy){
		var enemyPoint = enemy.currentPoint;
		var positionX = Math.round(this.currentPoint.x) - Math.round(enemyPoint.x);
		var positionY = this.currentPoint.y - enemyPoint.y;
		var stepX = (positionX > 0) ? -1 : 1;
		if ( Math.round(positionX) == 0){
			stepX = 0;
		}
		var stepY = (positionY > 0) ? -1 : 1;
		if ( Math.round(positionY) == 0){
			stepY = 0;
		}
		return [stepX, stepY];
	},

	aiLogic: function(delta){
		if (!this.currentPoint){
			this.spawn();
			return;
		};

		var allPlayers = this.findAllPlayers();
		if (allPlayers){
			var enemy = this.findClosestEnemy(allPlayers);
			var path = this.findPath(enemy);
		}else{
			return;
		};

		this.move(delta, path);
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
		this.onSpawn();
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


	shootSpeed: 1000, // 1 times per second
	shoot: function(target){
		this.onShoot(target);
	},

	onShoot: function(target){
		var rightNow = this.timeToConsole();
		console.log(rightNow + this.name + " shooted to " + target.name + ", and miss/hit* ");
	},

	clip: 12,
	reload: function(){

	},

	onReload: function(){

	}
});

var GameWalk = Trait.inherit({
	__className: "GameWalk",

	velocity: 1, // 1 - step, 2 - run
	moveSpeedLog: 2000, 
	deltaVelocity: 0,
	currentPoint: null,
	move: function(delta, path){
		var dirX = path[0];
		var dirY = path[1];
		var pX = this.currentPoint.x;
		var pY = this.currentPoint.y;
		var a = this.velocity/delta;
		var pointX = pX + dirX*a;
		var pointY = pY + dirY*a;
		this.currentPoint = {x: pointX, y: pointY};
		if (this.deltaVelocity >= this.moveSpeedLog){
			this.onMove();
			this.deltaVelocity = 0;
		}
		this.deltaVelocity += delta;
	},

	onMove: function(){ //log
		var rightNow = this.timeToConsole();
		console.log(rightNow + this.name + " was moved out to: [x=" + Math.round(this.currentPoint.x) + "; y=" + Math.round(this.currentPoint.y) + "]");
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
		if (delta > 64) { // ~2*1000/this.fps;
			delta = 32; // ~1000/this.fps;
		}
		this.update(delta);
		this.lastTick = time;
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
		console.log("create component done, created: " + className + ", with name:" + data.name);
		return component;
	},

	removeComponent: function(classDefenition, id){
		var componentId = get_component_in(classDefenition, id);
	},

	createId: function(classDefenition){ // спизжено, нужно разобраться)
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			console.log("id created");
			return v.toString(16);
		});
	},

	timeToConsole: function(){
		var time = $.now();
		var date = new Date(time);
		var hh = date.getHours();
		var mm = date.getMinutes();
		var ss = date.getSeconds();
		var ms = date.getMilliseconds();
		return "[" + hh + ":" + mm + ":" + ss + ":" + ms + "] ";
	}

});

var Player = CommonComponent.inherit(
	GameShoot,
	GameWalk,
	GameDeath,
	GameAI,
	GameSpawn,
{
	__className: "Player",

	name: "NickName"

});

var World = CommonComponent.inherit(
	CommonTick,
{
	__className: "World",

	gameMap: {x: 100, y: 100},
	update: function(delta){
		this.runAI(delta);
	},

	runAI: function(delta){
		var o = this.components.Player
		for (var key in o){
			var p = o[key];
			p.aiLogic(delta);
		}
	}

});

var world = new World({id:"main", name:"DesertHiils", parent:window});
var playerOne = world.createComponent(Player, {name:"player1"});
var playerTwo = world.createComponent(Player, {name:"player2"});
var playerThree = world.createComponent(Player, {name:"SpeedRunningBot"}, {velocity: 2}); //test

$(document).ready(function(){
	$("input#pause").click(function(){
		var attribute = $(this).attr("value") == "unpause" ? "pause" : "unpause";
		$(this).attr("value", attribute);
		return world.togglePause();});
	$("input#start").attr("onclick", "world.startLoop()");
	$("input#add_bot").attr("onclick", "addBotToWorld()");
	$("input#del_bot").attr("onclick", "removeBotFromWorld()");
})