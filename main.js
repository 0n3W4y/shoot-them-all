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

var randomMovePoint = function(player){
	var pointX, pointY;
	var p = player;
	var point = player.currentPoint;
	if (point === null){ //spawn;
		var worldMapX = world.gameMap.x;
		var worldMapY = world.gameMap.y;
		pointX = Math.round(Math.random()*worldMapX);
		pointY = Math.round(Math.random()*worldMapY);
	}else{
		var a = Math.round(Math.random()) ? p.velocity : -p.velocity;
		var pX = point.x;
		var pY = point.y;
		pointX = pX + a;
		pointY = pY + a;
		pointX = (pointX <= 100 && pointX >= 0) ? pointX : pX;
		pointY = (pointY <= 100 && pointY >= 0) ? pointY : pY;
	}
	return {x: pointX, y: pointY};
};

var randomShoot = function(player){

};

var randomSortingForArray = function(a, b){
	return Math.round(Math.random());
}

//-------------------------------------------------------------------------------------------------------------------------||

var GameDeath = Trait.inherit({
	__className: "CommonDeath",

	death: function(){

	}
});

var GameShoot = Trait.inherit({
	__className: "CommonShoot",


	shootSpeed: 1000, // 1 times per second
	shoot: function(target){
		this.onShoot(target);
	},

	onShoot: function(target){
		var rightNow = this.timeToConsole();
		console.log(rightNow + this.name + " shooted to " + target.name + ", and ...");// + "miss/hit"
	},

	clip: 12,
	reload: function(){

	},

	onReload: function(){

	}
});

var GameWalk = Trait.inherit({
	__className: "CommonWalk",

	velocity: 1, // 1 - step, 2 - run
	moveSpeed: 1000, // 1 times per second
	deltaVelocity: 0,
	currentPoint: null,
	move: function(delta){
		if (this.deltaVelocity >= this.moveSpeed){
			var point = randomMovePoint(this);
			var lastPoint = (this.currentPoint) ? this.currentPoint : null;
			this.currentPoint = point;
			this.onMove(lastPoint);
			this.deltaVelocity = 0;
		}
		this.deltaVelocity += delta;
	},

	onMove: function(lastPoint){ //log
		var rightNow = this.timeToConsole();
		if (!lastPoint){
			console.log(rightNow + this.name + " spawned on [x=" + this.currentPoint.x + "; y=" + this.currentPoint.y + "]");
		}else{
			console.log(rightNow + this.name + " was moved out from [x=" + lastPoint.x + "; y= " + lastPoint.y +"] -> to: [x=" + this.currentPoint.x + "; y=" + this.currentPoint.y + "]");
		}
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


	initialize: function(data){
		console.log("initialize started");
		this.commonInit(data);
	},

	commonInit: function(data){
		this.id = data.id ? data.id : this.createId();
		this.name = data.name;
		this.parent = data.parent;
		this.components = this.components ? this.components : {};
		console.log("commonInit done");
	},

	createComponent: function(classDefenition, data){
		//var classDef = window[classDefenition];
		var className = classDefenition.prototype.__className;
		if (!data.parent){
			data.parent = this;
		}
		var component = new classDefenition(data);
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
		return "[" + hh + ":" + mm + ":" + ss + ":" + ms + "]";
	}

});

var Player = CommonComponent.inherit(
	GameShoot,
	GameWalk,
	GameDeath,
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
		this.moveAllPlayers(delta);
		this.shootAllPlayers(delta);
	},

	moveAllPlayers: function(delta){
		var o = this.components.Player
		for (var key in o){
			var p = o[key];
			p.move(delta);
		}
	},

	shootAllPlayers: function(delta){ 
		if (this.shootDelta > 1500){ // one time per halfsecond;
			var arr = [];
			this.shootDelta = 0;
			var o = this.components.Player
			for (var key in o){
				var p = o[key];
				arr.push(p);
			}
			arr.sort(randomSortingForArray);
			for (var i = 0; i < arr.length; i++){
				for (var j = 0; j < 1;){
					var a = Math.round(Math.random()*(arr.length-1));
					if (a != i){
						j = 1;
					}
				}
				arr[i].shoot(arr[a]);
			}
		}
		this.shootDelta += delta;
	}
});

var world = new World({id:"main", name:"DesertHiils", parent:window});
var playerOne = world.createComponent(Player, {name:"player1"});
var playerTwo = world.createComponent(Player, {name:"player2"});
var playerThree = world.createComponent(Player, {name:"player3", velocity: 2}); //test

$(document).ready(function(){
	$("input.pause").click(function(){
		var attribute = $("input.pause").attr("value") == "unpause" ? "pause" : "unpause";
		$("input.pause").attr("value", attribute);
		return world.togglePause();});
	$("input.start").attr("onclick", "world.startLoop()");
	$("input.generateBot").attr("onclick", "addBotToWorld()");
	$("input.removeBot").attr("onclick", "removeBotFromWorld()");
})