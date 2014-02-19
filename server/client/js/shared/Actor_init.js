//Mort
if(typeof Actor === 'undefined') Actor = {};
if(!Actor.creation) Actor.creation = {};
if(!Actor.template) Actor.template = {};	

Init.actor = function(){
	var defaultPreActor = function(type){
		var mort = {};
		
		//dont touch
		mort.change = {};
		mort.old = {};
		mort.permBoost = {};    //no timer
		mort.boost = {          //timer aka needs to be updated every frame
			'fast':{},'reg':{},'slow':{},'custom':{},
			'toUpdate':{},
			'list':Actor.template.boost(type),
		};
		mort.frameCount = 0;
		mort.viewedBy = {};     //list of actors that see this object
		mort.viewedIf = 'true'; //condition to see. check viewedIfList
		mort.activeList = {};   //actors near this object
		mort.active = 1;    	//if not active, dont move. no cpu
		mort.damagedBy = {};   //list of actors that damaged him (used for owner of the drops)
		mort.dead = 0;          //dead = invisible
		mort.killed = 0;        //killed = cant move, 0 hp but visible (aka death animation)
		mort.type = type;
		mort.target = {
			main:{list:[],period:{first:25,renew:150,stuck:250},confort:1},
			sub:{list:[],period:{first:25,renew:150}},
			path:{list:[],period:25},
		};
		
		mort.bonus = Actor.template.bonus();	//Bonus applies on top of ability attack. If effect not on ability, do nothing.
		mort.mastery = Actor.template.mastery(type);
		
		mort.status = {
			'bleed':{'active':{"time":0,"list":[]},'resist':0,},				//fixed dmg per frame
			'knock':{'active':{"time":0,"magn":0,"angle":0},'resist':0},		//push
			'drain':{'active':{"time":0,"magn":0},'resist':0},					//leech mana
			'burn':{'active':{"time":0,"magn":0},'resist':0},					//dmg pre frame depending on hp
			'chill':{'active':{"time":0,"magn":0,"atk":0},'resist':0},			//slower move
			'confuse':{'active':{"time":0,"magn":0,"input":[0,1,2,3]},'resist':0},	//change key moves binding
		}
		mort.statusClient = '000000';
		mort.pushed = {"time":0,"magn":0,"angle":0};							//same than knock but no combat related
		mort.block = 0; 						//{direction:4,distance:0};
			
		mort.angle = 1;	
		mort.moveAngle = 1;
		mort.spdX = 0;	
		mort.spdY = 0;	
		mort.mouseX = 0;	
		mort.mouseY = 0;
		mort.moveInput = [0,0,0,0];	    //right,down,left,up
		mort.bumper = [0,0,0,0];        //1 if touchs map
		mort.attackReceived = {};	//so pierce doesnt hit multiple times
		
		mort.hp = 1000;	
		mort.mana = 100;	
		mort.dodge = 100;	
		mort.fury = 100;	
		mort.heal = 100;
		
		mort.abilityList = {};
		mort.abilityChange = Actor.template.abilityChange();	
		
		mort.friction = 0.9;
		mort.move = 1;
		mort.summon = {};       //if actor is master
		mort.summoned = 0;      //if actor is child. .summoned = master id
		//}}
		
		//{Setting Affected for Db.enemy
		mort.id = Math.randomId();
		mort.publicId = Math.randomId(6);   //id shared with all players
		mort.optionList = '';   //list of option when right-clicked
		mort.modList = [];  		//list of enemy mods (ex immuneFire)
		mort.group = '';            //enemy group
		mort.x = 1050;	
		mort.y = 550;	
		mort.map = 'test@MAIN';
		//}
		
		//{Setting Used for Db.enemy
		mort.category = "slime";   //for enemy
		mort.variant = "Regular";   //for enemy
		mort.lvl = 0;
		mort.deathExp = 1;			//exp given when player kills this enemy
		mort.name = "Goblin";     //visible name
		mort.drop = {
			"mod":{
				"quantity":0,
				"quality":0,
				"rarity":0
			},
			"category":[],
			'plan':[],
		};    
		mort.minimapIcon = 'minimapIcon.enemy';     //icon used for minimap
		mort.sprite = {"name":"mace","anim":"walk","sizeMod":1}			
		mort.equip = Actor.template.equip();
		mort.weapon = Actor.template.weapon();
		mort.moveRange = {
			'ideal':100,                //distance enemy wants to be from target
			'confort':25,               
			'aggressive':400,           //attack player if within this range
			'farthest':400,             //stop follow player if above this range
		};
		mort.moveSelf = 1; 		//generate its own input
		
		mort.reflect = Cst.element.template(); //% reflected
		mort.nevercombat = 0;
		mort.boss = '';
		mort.resource = {
			'hp':{'max':1000,'regen':1},
			'mana':{'max':100,'regen':0.1},
			'dodge':{'max':100,'regen':0.1},
			'fury':{'max':100,'regen':0.1},
			'heal':{'max':100,'regen':0.1},
		};
		mort.globalDef = 1;
		mort.globalDmg = 1;   //global modifier
		mort.aim = 0;       //difference between mouse and actually bullet direction
		mort.atkSpd = {'main':1,'support':1};	
		mort.ability = [];
		mort.invisible = 0;
		mort.ghost = 0;
		mort.nevermove = 0;
		mort.maxSpd = 15;	
		mort.acc = 3;
		mort.immune = {};
		//}
		
		//{Setting for Map.load extra
		mort.dialogue = '';      //function used to trigger dialogue
		mort.chatHead = "";     //is talking?
		mort.deathAbility = [];
		mort.deathFunc = null;	//function param = id of each killer
		mort.deathFuncArray = null;	//function param = array id of killers
		mort.combat = 1;
		mort.deleteOnceDead = 0;
		mort.hitIf = 'player';
		mort.targetIf = 'player';  //condition used by monsters to find their target. check targetIfList
		mort.onclick = {};			
		mort.waypoint = null; 		//right click = setRespawn
		mort.treasure = null;		//right click = gives items;
		mort.block = null;			//change map coliision
		//}	
		

		//{Player Only
		if(type === 'player'){
			mort.skill = Actor.template.skill();
			mort.removeList = [];	//for things that got removed from activeList
			mort.type = 'player';
			mort.hitIf = 'enemy';
			mort.targetIf = 'player';
			mort.privateChange = {};
			mort.privateOld = {};
			mort.context = 'player0000';
			mort.name = 'player0000';
			
			mort.team = mort.name;
			mort.item = {"quantity":0,"quality":0,"rarity":0};  //aka magic find
			mort.pickRadius = 100;  //distance to pick items on ground
			
			mort.respawnLoc = {safe:{x:mort.x,y:mort.y,map:mort.map},recent:{x:mort.x,y:mort.y,map:mort.map}};
			
			Sprite.creation(mort,mort.sprite);
			mort.ability = Actor.template.ability(type);
			mort.abilityList = Actor.template.abilityList();
		}
		//}
		for(var i in mort.boost.list){  //init default Db.stat value
			viaArray.set({'origin':mort,'array':mort.boost.list[i].stat,'value':mort.boost.list[i].base});
		}
		return mort;
	}


	var p = defaultPreActor('player');
	var e = defaultPreActor('enemy');
	
	var temp = Actor.template;
	
	Actor.template = new Function('type', 'return type === "player" ? ' + stringify(p) + ' : ' + stringify(e));
	for(var i in temp) Actor.template[i] = temp[i];
}


//Template
Actor.template.skill = function(){
	var value = Cst.exp.list[0];
	return {
		'exp':{'melee':value,'range':value,'magic':value,'metalwork':value,'woodwork':value,'leatherwork':value,'geology':value,'metallurgy':value,'trapping':value},
		'lvl':{'melee':0,'range':0,'magic':0,'metalwork':0,'woodwork':0,'leatherwork':0,'geology':0,'metallurgy':0,'trapping':0},
	}; 
};


Actor.template.weapon = function(){
	return 'unarmed';
};

Actor.template.equip = function(type){
	if(type === 'enemy')
		return {"def":Cst.element.template(1),"dmg":Cst.element.template(1)};	

	return {
		//"piece":{							"bracelet":{"id":"bracelet"},			"helm":{"id":"metalhelm"},			"amulet":{"id":"amulet"},			"gloves":{"id":"gloves"},			"body":{"id":"metalbody"},			"shield":{"id":"metalshield"},			"boots":{"id":"boots"},			"pants":{"id":"pants"},				"ring":{"id":"ring"},			"melee":{'id':"mace"},			"range":{'id':"boomerang"},			"magic":{'id':"wand"},		},
		"piece":{"bracelet":'',"helm":'',"amulet":'',"gloves":'',"body":'',"shield":'',"boots":'',"pants":'',"ring":'',"melee":'',"range":'',"magic":'',},
		"def":Cst.element.template(1),
		"dmg":Cst.element.template(1),
	};
};




Actor.template.abilityChange = function(){
	return {'press':'00000000000000','charge':{},'chargeClient':[0,0,0,0,0,0],'globalCooldown':0};
}

Actor.template.mastery = function(type){
	if(type === 'enemy'){
		return {	
			'def':{'melee':{'sum':1,'mod':1},'range':{'sum':1,'mod':1},'magic':{'sum':1,'mod':1},'fire':{'sum':1,'mod':1},'cold':{'sum':1,'mod':1},'lightning':{'sum':1,'mod':1}},
			'dmg':{'melee':{'sum':1,'mod':1},'range':{'sum':1,'mod':1},'magic':{'sum':1,'mod':1},'fire':{'sum':1,'mod':1},'cold':{'sum':1,'mod':1},'lightning':{'sum':1,'mod':1}},
		};
	}
	return {	
		'def':{'melee':{'+':0,'*':0,'x':0,'^':0,'sum':1,'mod':1},'range':{'+':0,'*':0,'x':0,'^':0,'sum':1,'mod':1},'magic':{'+':0,'*':0,'x':0,'^':0,'sum':1,'mod':1},'fire':{'+':0,'*':0,'x':0,'^':0,'sum':1,'mod':1},'cold':{'+':0,'*':0,'x':0,'^':0,'sum':1,'mod':1},'lightning':{'+':0,'*':0,'x':0,'^':0,'sum':1,'mod':1}},
		'dmg':{'melee':{'+':0,'*':0,'x':0,'^':0,'sum':1,'mod':1},'range':{'+':0,'*':0,'x':0,'^':0,'sum':1,'mod':1},'magic':{'+':0,'*':0,'x':0,'^':0,'sum':1,'mod':1},'fire':{'+':0,'*':0,'x':0,'^':0,'sum':1,'mod':1},'cold':{'+':0,'*':0,'x':0,'^':0,'sum':1,'mod':1},'lightning':{'+':0,'*':0,'x':0,'^':0,'sum':1,'mod':1}},
	};
};

Actor.template.abilityList = function(){
	return {};	//check Test
}
Actor.template.ability = function(){
	return [0,0,0,0,0,0];
}



Actor.template.dialogue = function(){
	return {
		'talkIf':true,	//can be function
		'location':{},
		'tag':[],
		'option':{},
		'func':function(){},
	}
}





