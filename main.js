var set_component_in = function(object, className, id, component){ 
	var p = object,
		k = className,
		v = id,
		c = component,
		x = p[k];
	x[v] = c;
	return;
};

var get_component_in = function(object, className, id){
	var o = object;
	var result = (o[className][id]) ? o[className][id] : undefined;
	return result;
};


//-------------------------------------------------------------------------------------------------------------------------||


var CommonShoot = Trait.inherit({
	__className: "CommonShoot",

	shoot: function(){

	}
});

var CommonWalk = Trait.inherit({
	__className: "CommonWalk",

	velocity: "1", // 1 step

	move: function(){

	}
});

var CommonTick = Trait.inherit({
	__className: 'CommonTick',

	fps: 60,
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

	paused: null,
	togglePause : function() {
		this.paused = !this.isPaused();
	},

	isPaused : function() {
		return this.paused;
	},

	now: function() {
		return $.now();
	},

	lastTick: null,
	time: function() {
		return this.lastTick;
	},


	tick: function() {

	},
});

var CommonComponent = Object.inherit(

{
	__className: "CommonComponent",


	initialize: function(data){
		this.commonInit(data);
	},

	commonInit: function(data){
		this.id = data.id ? data.id : this.createId();
		this.name = data.name;
		this.parent = data.parent || this;
		this.components = this.components ? this.components : {};
	},

	createComponent: function(classDefenition, data){
		var classDef = window[classDefenition];
		var className = classDef.prototype.__className;
		var component = new classDef(data);
		set_component_in(this.components, classDef, component.id, component);
		return component;
	},

	removeComponent: function(){

	},

	createId: function(classDefenition){ // спизжено, нужно разобраться)
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});
	}

});

var Player = CommonComponent.inherit(
	CommonShoot,
	CommonWalk,
{
	__className: "Player",

	name: "NickName",

});

var World = CommonComponent.inherit(
	CommonTick,
{
	__className: "World"

})