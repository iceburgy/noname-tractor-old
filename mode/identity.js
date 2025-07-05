'use strict';
game.import('mode',function(lib,game,ui,get,ai,_status){
	return {
		name:'identity',
		card:{
			group_wei:{
				fullskin:true,
			},
			group_shu:{
				fullskin:true,
			},
			group_wu:{
				fullskin:true,
			},
			group_qun:{
				fullskin:true,
			},
			group_key:{
				fullskin:true,
			},
		},
		start:function(){
			"step 0"
			if(!lib.config.new_tutorial){
				ui.arena.classList.add('only_dialog');
			}
			// force double_character to true
			lib.config.mode_config['identity']['double_character']=true;
			lib.config.mode_config['identity']['connect_double_character']=true;
			_status.mode=get.config('identity_mode');
			if(_status.brawl&&_status.brawl.submode){
				_status.mode=_status.brawl.submode;
			}
			event.replacePile=function(){
				var list=['shengdong','qijia','caomu','jinchan','zengbin','fulei','qibaodao','zhungangshuo','lanyinjia'];
				var map={
					shunshou:'shengdong',
					jiedao:'qijia',
					bingliang:'caomu',
					wuxie:'jinchan',
					wuzhong:'zengbin',
					wugu:'zengbin',
					shandian:'fulei',
					qinggang:'qibaodao',
					qinglong:'zhungangshuo',
					bagua:'lanyinjia'
				};
				for(var i=0;i<lib.card.list.length;i++){
					var name=lib.card.list[i][2];
					if(list.contains(name)){
						lib.card.list.splice(i--,1);
					}
					else if(map[name]){
						lib.card.list[i][2]=map[name];
						lib.card.list[i]._replaced=true;
					}
				}
			}
			"step 1"
			var playback=localStorage.getItem(lib.configprefix+'playback');
			if(playback){
				ui.create.me();
				ui.arena.style.display='none';
				ui.system.style.display='none';
				_status.playback=playback;
				localStorage.removeItem(lib.configprefix+'playback');
				var store=lib.db.transaction(['video'],'readwrite').objectStore('video');
				store.get(parseInt(playback)).onsuccess=function(e){
					if(e.target.result){
						game.playVideoContent(e.target.result.video);
					}
					else{
						alert('播放失败：找不到录像');
						game.reload();
					}
				}
				event.finish();
			}
			else if(!_status.connectMode){
				if(_status.mode=='zhong'){
					if(get.config('zhong_card')){
						event.replacePile();
					}
					game.prepareArena(8);
				}
				else if(_status.mode=='purple'){
					game.prepareArena(8);
				}
				else{
					game.prepareArena();
				}
				if(!lib.config.new_tutorial){
					game.delay();
				}
			}
			"step 2"
			if(!lib.config.new_tutorial){
				_status.new_tutorial=true;
				lib.init.onfree();
				game.saveConfig('version',lib.version);
				var clear=function(){
					ui.dialog.close();
					while(ui.controls.length) ui.controls[0].close();
				};
				var clear2=function(){
					ui.auto.show();
					ui.arena.classList.remove('only_dialog');
				};
				var step1=function(){
					ui.create.dialog('欢迎来到无名杀，是否进入新手向导？');
					game.saveConfig('new_tutorial',true);
					ui.dialog.add('<div class="text center">跳过后，你可以在选项-其它中重置新手向导');
					ui.auto.hide();
					ui.create.control('跳过向导',function(){
						clear();
						clear2();
						game.resume();
						// lib.cheat.cfg(); // owidgets
					});
					ui.create.control('继续',step2);
				}
				var step2=function(){
					if(!lib.config.phonelayout){
						clear();
						ui.create.dialog('如果你在使用手机，可能会觉得按钮有点小'+
						'，将布局改成移动可以使按钮变大');
						ui.dialog.add('<div class="text center">你可以在选项-外观-布局中更改此设置');
						var lcontrol=ui.create.control('使用移动布局',function(){
							if(lib.config.phonelayout){
								ui.control.firstChild.firstChild.innerHTML='使用移动布局';
								game.saveConfig('phonelayout',false);
								lib.init.layout('mobile');
							}
							else{
								ui.control.firstChild.firstChild.innerHTML='使用默认布局';
								game.saveConfig('phonelayout',true);
								lib.init.layout('mobile');
							}
						});
						ui.create.control('继续',step3);
					}
					else{
						step3();
					}
				};
				var step3=function(){
					if(lib.config.touchscreen){
						clear();
						ui.create.dialog('触屏模式中，下划可以显示菜单，上划可以切换托管，双指单击可以暂停');
						ui.dialog.add('<div class="text center">你可以在选项-通用-中更改手势设置');
						ui.create.control('继续',step4);
					}
					else{
						step4();
					}
				};
				var step4=function(){
					clear();
					ui.window.classList.add('noclick_important');
					ui.click.configMenu();
					ui.control.classList.add('noclick_click_important');
					ui.control.style.top='calc(100% - 105px)';
					ui.create.control('在菜单中，可以进行各项设置',function(){
						ui.click.menuTab('选项');
						ui.controls[0].replace('如果你感到游戏较卡，可以开启流畅模式',function(){
							ui.controls[0].replace('在技能一栏中，可以设置自动发动或双将禁配的技能',function(){
								ui.click.menuTab('武将');
								ui.controls[0].replace('在武将或卡牌一栏中，单击武将/卡牌可以将其禁用',function(){
									ui.click.menuTab('战局');
									ui.controls[0].replace('在战局中可以输入游戏命令，或者管理录像',function(){
										ui.click.menuTab('帮助');
										ui.controls[0].replace('在帮助中，可以检查更新和下载素材',function(){
											ui.click.configMenu();
											ui.window.classList.remove('noclick_important');
											ui.control.classList.remove('noclick_click_important');
											ui.control.style.top='';
											step5();
										});
									});
								});
							});
						});
					})
				};
				var step5=function(){
					clear();
					ui.create.dialog('如果还有其它问题，欢迎来到百度无名杀吧进行交流');
					ui.create.control('完成',function(){
						clear();
						clear2();
						game.resume();
					})
				};
				game.pause();
				step1();
			}
			else{
				game.showChangeLog();
			}
			"step 3"
			if(typeof _status.new_tutorial=='function'){
				_status.new_tutorial();
			}
			delete _status.new_tutorial;
			if(_status.connectMode){
				game.waitForPlayer(function(){
					if(lib.configOL.identity_mode=='zhong'||lib.configOL.identity_mode=='purple'){
						lib.configOL.number=8;
					}
				});
			}
			"step 4"
			if(_status.connectMode){
				_status.mode=lib.configOL.identity_mode;
				if(_status.mode=='zhong'){
					lib.configOL.number=8;
					if(lib.configOL.zhong_card){
						event.replacePile();
					}
				}
				else if(_status.mode=='purple'){
					lib.configOL.number=8;
				}
				if(lib.configOL.number<2){
					lib.configOL.number=2;
				}
				game.randomMapOL();
			}
			else{
				for(var i=0;i<game.players.length;i++){
					game.players[i].getId();
				}
				if(_status.brawl&&_status.brawl.chooseCharacterBefore){
					_status.brawl.chooseCharacterBefore();
				}
				game.chooseCharacter();
			}
			"step 5"
			if(ui.coin){
				_status.coinCoeff=get.coinCoeff([game.me.name]);
			}
			if(game.players.length==2){
				game.showIdentity(true);
				var map={};
				for(var i in lib.playerOL){
					map[i]=lib.playerOL[i].identity;
				}
				game.broadcast(function(map){
					for(var i in map){
						lib.playerOL[i].identity=map[i];
						lib.playerOL[i].setIdentity();
						lib.playerOL[i].ai.shown=1;
					}
				},map);
			}
			else{
				for(var i=0;i<game.players.length;i++){
					game.players[i].ai.shown=0;
				}
			}
			if(game.zhu==game.me&&game.zhu.identity!='zhu'&&_status.brawl&&_status.brawl.identityShown){
				delete game.zhu;
			}
			else{
				game.zhu.ai.shown=1;
				if(game.zhu2){
					game.zhong=game.zhu;
					game.zhu=game.zhu2;
					delete game.zhu2;
					if(game.zhong.sex=='male'&&game.zhong.maxHp<=4){
						game.zhong.addSkill('dongcha');
					}
					else{
						game.zhong.addSkill('sheshen');
					}
				}
				var enhance_zhu=false;
				if(_status.connectMode){
					enhance_zhu=(_status.mode!='zhong'&&_status.mode!='purple'&&lib.configOL.enhance_zhu&&get.population('fan')>=3);
				}
				else{
					enhance_zhu=(_status.mode!='zhong'&&_status.mode!='purple'&&get.config('enhance_zhu')&&get.population('fan')>=3);
				}
				if(enhance_zhu){
					var skill;
					switch(game.zhu.name){
						case 'key_yuri':skill='buqu';break;
						case 'liubei':skill='jizhen';break;
						case 'dongzhuo':skill='hengzheng';break;
						case 'sunquan':skill='batu';break;
						case 'sp_zhangjiao':skill='tiangong';break;
						case 'liushan':skill='shengxi';break;
						case 'sunce':skill='ciqiu';break;
						case 're_sunben':skill='ciqiu';break;
						case 'yuanshao':skill='geju';break;
						case 're_caocao':skill='dangping';break;
						case 'caopi':skill='junxing';break;
						case 'liuxie':skill='moukui';break;
						default:skill='tianming';break;
					}
					game.broadcastAll(function(player,skill){
						player.addSkill(skill);
						player.storage.enhance_zhu=skill;
					},game.zhu,skill);
				}
			}
			game.syncState();
			event.trigger('gameStart');

			var players=get.players(lib.sort.position);

			// name hidden players with position
			game.broadcastAll(function(player){
				for(var i=0;i<game.players.length;i++){
					if(game.players[i].name=='unknown') game.players[i].name='unknown'+get.distance(player,game.players[i],'absolute');
					game.players[i].node.name_seat=ui.create.div('.name.name_seat',get.verticalStr(lib.translate[game.players[i].name]),game.players[i]);
					if(game.players[i].node.zoneCamp){
						game.players[i].node.zoneCamp.node.avatarDefaultName.innerHTML = get.verticalStr(lib.translate[game.players[i].name]);
					}
				}
			},game.zhu);

			var info=[];
			for(var i=0;i<players.length;i++){
				info.push({
					name:players[i].name,
					translate:lib.translate[game.players[i].name],
					name1:players[i].name1,
					name2:players[i].name2,
					identity:players[i].identity
				});
				if(players[i].identity=='nei'){
					if(game.isARealGame()){
						game.broadcastAll(function(player){
							player.hiddenSkills.add('xiaoneikongchang');
							player.hiddenSkills.add('xiaoneidantiao');
							player.hiddenSkills.add('xiaoneihuosheng');
						},players[i]);
						players[i].addSkillTrigger('xiaoneikongchang',true);
						players[i].addSkillTrigger('xiaoneidantiao',true);
						players[i].addSkillTrigger('xiaoneihuosheng',true);
					}
					if(players.length>=6){
						game.broadcastAll(function(player){
							player.hiddenSkills.add('woshixiaonei');
							player.addSkillTrigger('woshixiaonei',true);
							player.showRevealXiaonei();
						},players[i]);
					}
				}
				if(players[i].identity=='zhu'&&players.length>=6&&players.length%2==0){
					game.broadcastAll(function(player){
						player.addSkill('kejizhugong');
						player.addSkill('xiuluozhugong');
						player.addSkill('anlezhugong');
					},players[i]);
				}
			}

			if(!_status.connectMode&&get.config('auto_add_qianxun')){
				game.me.addSkill('qianxun');
				game.me.addSkill('reguicai');
			}
			_status.videoInited=true;
			game.addVideo('init',null,info);
			"step 6"
			game.gameDraw(_status.firstAct2||game.zhong||game.zhu||_status.firstAct||game.me,function(player){
				if(_status.mode=='purple'&&player.seatNum>5) return 5;
				return 4;
			});
			event.changeCardCount=parseInt(lib.configOL.change_card);

			"step 7"
			// only jiangyouwei has free shouqika
			if(_status.connectMode&&lib.configOL.change_card) {
				var numberOfPlayers=game.players.length;
				var numberOfEligiblePlayers=0;
				switch(numberOfPlayers){
					case 6:
					case 7:
						numberOfEligiblePlayers=1;
						break;
					case 8:
					case 9:
						numberOfEligiblePlayers=2;
						break;
					case 10:
						numberOfEligiblePlayers=3;
						break;
					default:
						break;
				}
				var lastSeatIndex=0;
				game.eligiblePlayers=[];
				for(var i=0;i<numberOfPlayers;i++){
					if(game.players[i].nickname&&game.players[i].nickname!='无名玩家'){
						var fulibiBalance=game.getBonusBalanceWithBuffer(game.players[i],lib.bonusKeyFulibi);
						if(fulibiBalance>=lib.bonusKeyChangeCardsCost){
							game.players[i].replaceHandcardsBalance=fulibiBalance;
							game.eligiblePlayers.push(game.players[i]);
						}
					}
					var playerSeatNumber=get.distance(game.zhu, game.players[i], 'absolute') + 1;
					if(playerSeatNumber==numberOfPlayers){
						lastSeatIndex=i;
					}
				}

				while(numberOfEligiblePlayers>0){
					if(game.players[lastSeatIndex].nickname&&game.players[lastSeatIndex].nickname!='无名玩家'){
						game.players[lastSeatIndex].replaceHandcardsFree=1;
						if(!game.eligiblePlayers.includes(game.players[lastSeatIndex])){
							game.eligiblePlayers.push(game.players[lastSeatIndex]);
						}
					}
					lastSeatIndex--;
					if(lastSeatIndex<0) lastSeatIndex+=numberOfPlayers;

					numberOfEligiblePlayers--;
				}
			}
			if(!game.eligiblePlayers||game.eligiblePlayers.length==0) event.goto(11);
			"step 8"
			var useChangeCards=[];
			for(var i=0;i<game.eligiblePlayers.length;i++){
				var list=['否','是'];
				for(var j=0;j<list.length;j++){
					list[j]=['','',list[j]];
				}
				var balance=game.eligiblePlayers[i].replaceHandcardsBalance;
				var free=game.eligiblePlayers[i].replaceHandcardsFree;
				var prompt='是否置换手牌？';
				if(free&&free>0){
					prompt+='（免费手气卡）';
				}
				else if(balance&&balance>0){
					prompt+='（手气卡余额：x'+balance+'）';
				}
				useChangeCards.push([game.eligiblePlayers[i],[prompt,[list,'vcard']],1,true]);
			}
			game.me.chooseButtonOL(useChangeCards,function(player,result){});
			"step 9"
			for(var i in result){
				if(result[i]&&result[i].bool&&result[i].links) {
					var player=lib.playerOL[i];
					if(result[i].links[0][2]=='是'){
						var hs=player.getCards('h')
						game.broadcastAll(function(player,hs){
							game.addVideo('lose',player,[get.cardsInfo(hs),[],[]]);
							for(var i=0;i<hs.length;i++){
								hs[i].discard(false);
							}
						},player,hs);
						player.directgain(get.cards(hs.length));
						player.trySkillAnimate('手气卡','手气卡',false);
						if(player.replaceHandcardsFree&&player.replaceHandcardsFree>0){
							player.replaceHandcardsFree--;
						}
						else{
							player.replaceHandcardsBalance--;
							game.updateBonusBalanceBuffer(player,-lib.bonusKeyChangeCardsCost);
						}
						if(!game.getBonusBalanceWithBuffer(player,lib.bonusKeyFulibi)){
							game.eligiblePlayers.remove(player);
						}
					}
					else{
						game.eligiblePlayers.remove(player);
					}
				}
			}
			"step 10"
			if(!isNaN(event.changeCardCount)) event.changeCardCount--;
			if((isNaN(event.changeCardCount)||event.changeCardCount>0)&&game.eligiblePlayers.length>0) event.goto(8);
			"step 11"
			game.phaseLoop(_status.firstAct2||game.zhong||game.zhu||_status.firstAct||game.me);
		},
		game:{
			getState:function(){
				var state={};
				for(var i in lib.playerOL){
					var player=lib.playerOL[i];
					state[i]={identity:player.identity};
					if(player==game.zhu){
						state[i].zhu=true;
					}
					if(player==game.zhong){
						state[i].zhong=true;
					}
					if(player.isZhu){
						state[i].isZhu=true;
					}
					if(player.special_identity){
						state[i].special_identity=player.special_identity;
					}
					state[i].shown=player.ai.shown;
					//state[i].group=player.group;
				}
				return state;
			},
			getNextValidCharacters:function(mainChars,numOfChars,charPool){
				var nextValidCharacters=[];
				if(typeof mainChars=='string') mainChars=[mainChars];
				if(mainChars&&Array.isArray(mainChars)&&mainChars.length){
					var forbidCharsSet=new Set();
					for(var mainChar of mainChars){
						if(lib.config['forbid_double']&&lib.config['forbid_double'][mainChar]){
							forbidCharsSet=new Set([...forbidCharsSet,...lib.config['forbid_double'][mainChar]]);
						}
					}
					var forbidChars=[...forbidCharsSet];
					for(var i=0;i<numOfChars;i++){
						var candiChar=undefined;
						do{
							candiChar=charPool.randomRemove(1)[0];
						}while(!lib.config.enable_liftcomboban&&charPool.length&&forbidChars.includes(candiChar));
						if(lib.config.enable_liftcomboban||!forbidChars.includes(candiChar)){
							nextValidCharacters.push(candiChar);
						}else{
							console.log('===exhausted all characters without avoiding forbid, pool length: '+nextValidCharacters.length);
							return nextValidCharacters;
						}
					}
				}else{
					nextValidCharacters=charPool.randomRemove(numOfChars);
				}
				return nextValidCharacters;
			},
			updateState:function(state){
				for(var i in state){
					var player=lib.playerOL[i];
					if(player){
						player.identity=state[i].identity;
						if(state[i].identity=='rZhu'||state[i].identity=='bZhu') game[state[i].identity]=player;
						if(state[i].special_identity){
							player.special_identity=state[i].special_identity;
							if(player.node.dieidentity){
								player.node.dieidentity.innerHTML=get.translation(state[i].special_identity);
								player.node.identity.firstChild.innerHTML=get.translation(state[i].special_identity+'_bg');
							}
						}
						if(state[i].zhu){
							game.zhu=player;
						}
						if(state[i].isZhu){
							player.isZhu=true;
						}
						if(state[i].zhong){
							game.zhong=player;
						}
						player.ai.shown=state[i].shown;
						//player.group=state[i].group;
						//player.node.name.dataset.nature=get.groupnature(player.group);
					}
				}
			},
			getRoomInfo:function(uiintro){
				uiintro.add('<div class="text chat">游戏模式：'+(lib.configOL.identity_mode=='zhong'?'明忠':'标准'));
				uiintro.add('<div class="text chat">双将模式：'+(lib.configOL.double_character?'开启':'关闭'));
				if(lib.configOL.identity_mode!='zhong'){
					uiintro.add('<div class="text chat">双内奸：'+(lib.configOL.double_nei?'开启':'关闭'));
					uiintro.add('<div class="text chat">加强主公：'+(lib.configOL.enhance_zhu?'开启':'关闭'));
				}
				else{
					uiintro.add('<div class="text chat">卡牌替换：'+(lib.configOL.zhong_card?'开启':'关闭'));
				}
				var last=uiintro.add('<div class="text chat">出牌时限：'+lib.configOL.choose_timeout+'秒');
				// uiintro.add('<div class="text chat">屏蔽弱将：'+(lib.configOL.ban_weak?'开启':'关闭'));
				// var last=uiintro.add('<div class="text chat">屏蔽强将：'+(lib.configOL.ban_strong?'开启':'关闭'));
				if(lib.configOL.banned.length){
					last=uiintro.add('<div class="text chat">禁用武将：'+get.translation(lib.configOL.banned));
				}
				if(lib.configOL.bannedcards.length){
					last=uiintro.add('<div class="text chat">禁用卡牌：'+get.translation(lib.configOL.bannedcards));
				}
				last.style.paddingBottom='8px';
			},
			getIdentityList:function(player){
				if(player.identityShown) return;
				if(player==game.me) return;
				if(_status.mode=='purple'){
					if(_status.yeconfirm&&['rNei','bNei'].contains(game.me.identity)&&['rNei','bNei'].contains(player.identity)) return;
					if(player.identity.slice(0,1)=='r') return {
						cai2:'猜',
						rZhong:'忠',
						rNei:'内',
						rYe:'野',
					}
					return {
						cai:'猜',
						bZhong:'忠',
						bNei:'内',
						bYe:'野',
					}
				}
				else if(_status.mode=='zhong'){
					if(player.fanfixed) return;
					if(game.zhu&&game.zhu.isZhu){
						return {
							fan:'反',
							zhong:'忠',
							nei:'内',
							cai:'猜',
						}
					}
					else{
						return {
							fan:'反',
							zhong:'忠',
							nei:'内',
							zhu:'主',
							cai:'猜',
						}
					}
				}
				else{
					return {
						fan:'反',
						zhong:'忠',
						nei:'内',
						cai:'猜',
					}
				}
			},
			getVideoName:function(){
				var str=get.translation(game.me.name);
				if(game.me.name2){
					str+='/'+get.translation(game.me.name2);
				}
				var str2;
				if(game.identityVideoName) str2=game.identityVideoName;
				else{
					switch(_status.mode){
						case 'purple':str2='3v3v2 - '+(game.me.identity.indexOf('r')==0?'暖色':'冷色')+lib.translate[game.me.identity+'2'];break;
						case 'zhong':str2='忠胆英杰 - '+lib.translate[game.me.identity+'2'];break;
						default:str2=get.cnNumber(get.playerNumber())+'人'+
						get.translation(lib.config.mode)+' - '+lib.translate[game.me.identity+'2']
					}
				}
				var name=[
					str,
					str2,
				];
				return name;
			},
			addRecord:function(bool){
				if(typeof bool=='boolean'){
					var data=lib.config.gameRecord.identity.data;
					var identity=game.me.identity;
					if(identity=='mingzhong'){
						identity='zhong';
					}
					if(!data[identity]){
						data[identity]=[0,0];
					}
					if(bool){
						data[identity][0]++;
					}
					else{
						data[identity][1]++;
					}
					var list=['zhu','zhong','nei','fan'];
					var str='';
					for(var i=0;i<list.length;i++){
						if(data[list[i]]){
							str+=lib.translate[list[i]+'2']+'：'+data[list[i]][0]+'胜'+' '+data[list[i]][1]+'负<br>';
						}
					}
					lib.config.gameRecord.identity.str=str;
					game.saveConfig('gameRecord',lib.config.gameRecord);
				}
			},
			showIdentity:function(me){
				for(var i=0;i<game.players.length;i++){
					// if(me===false&&game.players[i]==game.me) continue;
					game.players[i].node.identity.classList.remove('guessing');
					game.players[i].identityShown=true;
					game.players[i].ai.shown=1;
					game.players[i].setIdentity(game.players[i].identity);
					if(game.players[i].special_identity){
						game.players[i].node.identity.firstChild.innerHTML=get.translation(game.players[i].special_identity+'_bg');
					}
					if(game.players[i].identity=='zhu'){
						game.players[i].isZhu=true;
					}
					game.players[i].showCharacter(2,false);
				}
				if(_status.clickingidentity){
					for(var i=0;i<_status.clickingidentity[1].length;i++){
						_status.clickingidentity[1][i].delete();
						_status.clickingidentity[1][i].style.transform='';
					}
					delete _status.clickingidentity;
				}
			},
			checkResult:function(){
				var me=game.me._trueMe||game.me;
				if(_status.brawl&&_status.brawl.checkResult){
					_status.brawl.checkResult();
					return;
				}
				else if(_status.mode=='purple'){
					var winner=[];
					var loser=[];
					var ye=game.filterPlayer(function(current){
						return ['rYe','bYe'].contains(current.identity);
					});
					var red=game.filterPlayer(function(current){
						return ['rZhu','rZhong','bNei'].contains(current.identity);
					});
					var blue=game.filterPlayer(function(current){
						return ['bZhu','bZhong','rNei'].contains(current.identity);
					})
					game.countPlayer2(function(current){
						switch(current.identity){
							case 'rZhu':
								if(blue.length+ye.length==0) winner.push(current);
								if(current.isDead()) loser.push(current);
								break;
							case 'rZhong': case 'bNei':
								if(blue.length+ye.length==0) winner.push(current);
								if(game.rZhu.isDead()) loser.push(current);
								break;
							case 'bZhu':
								if(red.length+ye.length==0) winner.push(current);
								if(current.isDead()) loser.push(current);
								break;
							case 'bZhong': case 'rNei':
								if(red.length+ye.length==0) winner.push(current);
								if(game.bZhu.isDead()) loser.push(current);
								break;
							default:
								if(red.length+blue.length==0) winner.push(current);
								else if(game.rZhu.isDead()&&game.bZhu.isDead()) loser.push(current);
								break;
						}
					});
					var winner2=winner.slice(0);
					var loser2=loser.slice(0);
					for(var i=0;i<winner.length;i++){
						if(winner[i].isDead()) winner.splice(i--,1);
					}
					for(var i=0;i<loser.length;i++){
						if(loser[i].isDead()) loser.splice(i--,1);
					}
					if(winner.length>0||loser.length==game.players.length){
						game.broadcastAll(function(winner,loser){
							_status.winner=winner;
							_status.loser=loser;
						},winner,loser);
						if(loser.length==game.players.length){
							game.showIdentity();
							game.over('游戏平局');
						}
						else if(winner2.contains(me)){
							game.showIdentity();
							if(loser2.contains(me)) game.over(false);
							else game.over(true);
						}
						else{
							game.showIdentity();
							game.over(false);
						}
					}
					return;
				}
				if(!game.zhu){
					if(get.population('fan')==0){
						switch(me.identity){
							case 'fan':game.over(false);break;
							case 'zhong':game.over(true);break;
							default:game.over();break;
						}
					}
					else if(get.population('zhong')==0){
						switch(me.identity){
							case 'fan':game.over(true);break;
							case 'zhong':game.over(false);break;
							default:game.over();break;
						}
					}
					return;
				}
				// xiaoneiaozhan
				//if(!game.zhu.isAlive()&&get.population('fan')==0&&get.population('zhong')==1&&get.population('nei')==1) return;
				if(game.zhu.isAlive()&&get.population('fan')+get.population('nei')>0) return;
				if(game.zhong){
					game.zhong.identity='zhong';
				}
				game.showIdentity();
				if(me.identity=='zhu'||me.identity=='zhong'||me.identity=='mingzhong'){
					if(game.zhu.classList.contains('dead')&&(!_status._xiaoneiaozhan||game.players[0].identity=='nei')){
						game.over(false);
					}
					else{
						game.over(true);
					}
				}
				else if(me.identity=='nei'){
					if(game.players.length==1&&me.isAlive()){
						game.over(true);
					}
					else{
						game.over(false);
					}
				}
				else{
					if((get.population('fan')+get.population('zhong')>0||get.population('nei')>1)&&
						game.zhu.classList.contains('dead')&&
						!_status._xiaoneiaozhan){
						game.over(true);
					}
					else{
						game.over(false);
					}
				}
			},
			checkOnlineResult:function(player){
				if(_status.winner&&_status.loser){
					if(_status.loser.length==game.players.length) return null;
					if(_status.loser.contains(player)) return false;
					if(_status.winner.contains(player)) return true;
				}
				if(_status.overtie) return null;
				if(game.zhu.isAlive()||_status._xiaoneiaozhan&&game.players[0].identity=="zhong"){
					return (player.identity=='zhu'||player.identity=='zhong'||player.identity=='mingzhong');
				}
				else if(game.players.length==1&&game.players[0].identity=='nei'){
					return player.isAlive();
				}
				else{
					return player.identity=='fan';
				}
			},
			chooseCharacterPurpleOL:function(){
				var next=game.createEvent('chooseCharacter',false);
				next.setContent(function(){
					"step 0"
					ui.arena.classList.add('choose-character');
					"step 1"
					var list=['rZhu','rZhong','rNei','rYe'];
					var list2=['bZhu','bZhong','bNei','bYe'];
					list.randomSort();
					list2.randomSort();
					var identityList=list.concat(list2);
					var num=get.rand(0,7);
					var players=game.players.slice(0);
					for(var i=0;i<num;i++){
						players.push(players.shift());
					}
					game.broadcastAll(function(players,identityList,list){
					_status.mode='purple';
					if(game.online) ui.arena.classList.add('choose-character');
					for(var i=0;i<players.length;i++){
						players[i].node.identity.classList.add('guessing');
						players[i].identity=identityList[i];
						players[i].setIdentity(list.contains(identityList[i])?'cai2':'cai');
						if(['rZhu','bZhu'].contains(identityList[i])){
							game[identityList[i]]=players[i];
							players[i].setIdentity(identityList[i]);
							players[i].identityShown=true;
							players[i].node.identity.classList.remove('guessing');
						}
					}
					game.zhu=game.rZhu;
					game.rZhu.isZhu=true;
					game.bZhu.isZhu=true;
					game.me.setIdentity();
					game.me.node.identity.classList.remove('guessing');
					},players,identityList,list);
					players.sortBySeat(game.zhu);
					for(var i=0;i<players.length;i++){
						players[i].seatNum=i;
					}
					"step 2"
					var map={};
					var map_zhu={};
					event.mapNum={};
					var list=[];
					var libCharacter={};
					for(var i=0;i<lib.configOL.characterPack.length;i++){
						var pack=lib.characterPack[lib.configOL.characterPack[i]];
						for(var j in pack){
							if(j=='zuoci') continue;
							if(lib.character[j]) libCharacter[j]=pack[j];
						}
					}
					for(var i in libCharacter){
						if(lib.filter.characterDisabled(i,libCharacter)) continue;
						if(i.indexOf('lingju')!=-1) continue;
						var group=lib.character[i][1];
						if(group=='shen') continue;
						if(!map[group]){
							map[group]=[];
							list.push(group);
						}
						map[group].push(i);
						if(lib.character[i][4]&&lib.character[i][4].contains('zhu')){
							if(!map_zhu[group]){
								map_zhu[group]=[];
							}
							map_zhu[group].push(i);
						}
					}
					for(var i in map){
						if(map[i].length<12){
							delete map[i];
							list.remove(i);
						}
						else event.mapNum[i]=map[i].length>15?5:3;
					}
					list.sort(function(a,b){
						return lib.group.indexOf(a)-lib.group.indexOf(b);
					});
					event.list=list;
					event.map=map;
					event.map_zhu=map_zhu;
					game.bZhu.chooseControl(list).set('prompt','请选择冷方武将势力').set('ai',function(){
						return _status.event.choice;
					}).set('choice',event.list.randomGet());
					"step 3"
					event.bZhu=result.control;
					event.list.remove(event.bZhu);
					game.rZhu.chooseControl(event.list).set('prompt','请选择暖方武将的势力').set('ai',function(){
						return _status.event.choice;
					}).set('choice',event.list.randomGet());
					"step 4"
					event.rZhu=result.control;
					var players=[game.rZhu,game.bZhu];
					var list=[];
					for(var i=0;i<players.length;i++){
						if(true){
							var group=event[players[i].identity];
							var str='选择角色';
							var list2=event.map[group].randomGets(4);
							if(event.map_zhu[group]) list2.addArray(event.map_zhu[group].randomGets(2));
							event.map[players[i].playerid]=list2;
							list.push([players[i],[str,[list2,'character']],true]);
						}
					}
					game.me.chooseButtonOL(list,function(player,result){
						if(game.online||player==game.me){
							player.init(result.links[0]);
							player.hp++;
							player.maxHp++;
							player.update();
						}
					});
					"step 5"
					for(var i in result){
						if(result[i]=='ai'||!result[i]||!result[i].links){
							result[i]=event.map[i].randomGet();
						}
						else{
							result[i]=result[i].links
						}
						var group=lib.character[result[i][0]][1];
						event.map[group].remove(result[i][0]);
						if(!lib.playerOL[i].name){
							lib.playerOL[i].init(result[i][0]);
						}
					}
					game.broadcast(function(result){
						for(var i in result){
							if(!lib.playerOL[i].name){
								lib.playerOL[i].init(result[i][0],result[i][1]);
								lib.playerOL[i].hp++;
								lib.playerOL[i].maxHp++;
								lib.playerOL[i].update();
							}
						}
					},result);
					
					var list=[];
					var players=game.players.slice(0);
					players.removeArray([game.rZhu,game.bZhu]);
					for(var i=0;i<players.length;i++){
						if(true){
							var group=event[players[i].identity.slice(0,1)+'Zhu'];
							var str='选择角色';
							var list2=event.map[group].randomRemove(event.mapNum[group]);
							event.map[players[i].playerid]=list2;
							list.push([players[i],[str,[list2,'character']],true]);
						}
					}
					game.me.chooseButtonOL(list,function(player,result){
						if(game.online||player==game.me){
							player.init(result.links[0]);
						}
					});
					"step 6"
					for(var i in result){
						if(result[i]=='ai'||!result[i]||!result[i].links){
							result[i]=event.map[i].randomGet();
						}
						else{
							result[i]=result[i].links
						}
						var group=lib.character[result[i][0]][1];
						event.map[group].remove(result[i][0]);
						if(!lib.playerOL[i].name){
							lib.playerOL[i].init(result[i][0]);
						}
					}
					game.broadcast(function(result){
						for(var i in result){
							if(!lib.playerOL[i].name){
								lib.playerOL[i].init(result[i][0],result[i][1]);
							}
						}
						setTimeout(function(){
							ui.arena.classList.remove('choose-character');
						},500);
					},result);
					setTimeout(function(){
						ui.arena.classList.remove('choose-character');
					},500);
				});
			},
			chooseCharacterPurple:function(){
				var next=game.createEvent('chooseCharacter',false);
				next.setContent(function(){
					"step 0"
					ui.arena.classList.add('choose-character');
					lib.init.onfree();
					"step 1"
					var list=['rZhu','rZhong','rNei','rYe'];
					var list2=['bZhu','bZhong','bNei','bYe'];
					list.randomSort();
					list2.randomSort();
					var identityList=list.concat(list2);
					var num=get.rand(0,7);
					var players=game.players.slice(0);
					for(var i=0;i<num;i++){
						players.push(players.shift());
					}
					for(var i=0;i<players.length;i++){
						players[i].node.identity.classList.add('guessing');
						players[i].identity=identityList[i];
						players[i].setIdentity(list.contains(identityList[i])?'cai2':'cai');
						if(['rZhu','bZhu'].contains(identityList[i])){
							game[identityList[i]]=players[i];
							players[i].setIdentity(identityList[i]);
							players[i].identityShown=true;
							players[i].node.identity.classList.remove('guessing');
						}
					}
					game.zhu=game.rZhu;
					game.rZhu.isZhu=true;
					game.bZhu.isZhu=true;
					game.me.setIdentity();
					game.me.node.identity.classList.remove('guessing');
					players.sortBySeat(game.zhu);
					for(var i=0;i<players.length;i++){
						players[i].seatNum=i;
					}
					"step 2"
					var map={};
					var map_zhu={};
					var list=[];
					for(var i in lib.character){
						if(lib.filter.characterDisabled(i)) continue;
						if(i.indexOf('lingju')!=-1) continue;
						var group=lib.character[i][1];
						if(group=='shen') continue;
						if(!map[group]){
							map[group]=[];
							list.push(group);
						}
						map[group].push(i);
						if(lib.character[i][4]&&lib.character[i][4].contains('zhu')){
							if(!map_zhu[group]){
								map_zhu[group]=[];
							}
							map_zhu[group].push(i);
						}
					}
					for(var i in map){
						if(map[i].length<12){
							delete map[i];
							list.remove(i);
						}
					}
					list.sort(function(a,b){
						return lib.group.indexOf(a)-lib.group.indexOf(b);
					});
					event.list=list;
					event.map=map;
					event.map_zhu=map_zhu;
					game.bZhu.chooseControl(list).set('prompt','请选择冷方武将势力').set('ai',function(){
						return _status.event.choice;
					}).set('choice',event.list.randomGet());
					"step 3"
					event.bZhu=result.control;
					event.list.remove(event.bZhu);
					game.rZhu.chooseControl(event.list).set('prompt','请选择暖方武将的势力').set('ai',function(){
						return _status.event.choice;
					}).set('choice',event.list.randomGet());
					"step 4"
					event.rZhu=result.control;
					if(game.me==game.rZhu||game.me==game.bZhu){
						event.isZhu=true;
						var list=event.map[event[game.me.identity]].randomGets(4);
						if(event.map_zhu[event[game.me.identity]]) list.addArray(event.map_zhu[event[game.me.identity]].randomGets(2));
						game.me.chooseButton(true,['请选择您的武将牌',[list,'character']]);
					}
					"step 5"
					if(event.isZhu){
						event.map[event[game.me.identity]].remove(result.links[0]);
						game.me.init(result.links[0]);
					}
					if(!game.rZhu.name){
						var list=event.map[event.rZhu].randomGets(3);
						if(event.map_zhu[event.rZhu]) list.addArray(event.map_zhu[event.rZhu]);
						var character=list.randomGet();
						event.map[event.rZhu].remove(character);
						game.rZhu.init(character);
					}
					if(!game.bZhu.name){
						var list=event.map[event.bZhu].randomGets(4);
						if(event.map_zhu[event.bZhu]) list.addArray(event.map_zhu[event.bZhu].randomGets(2));
						var character=list.randomGet();
						event.map[event.bZhu].remove(character);
						game.bZhu.init(character);
					}
					game.rZhu.maxHp++;
					game.rZhu.hp++;
					game.rZhu.update();
					game.bZhu.maxHp++;
					game.bZhu.hp++;
					game.bZhu.update();
					if(!event.isZhu){
						var group=game.me.identity.indexOf('r')==0?event.rZhu:event.bZhu;
						game.me.chooseButton(true,['请选择您的武将牌',[event.map[group].randomRemove(5),'character']]);
					}
					"step 6"
					if(!event.isZhu){
						game.me.init(result.links[0]);
					}
					game.countPlayer(function(current){
						if(!current.name){
							var group=current.identity.indexOf('r')==0?event.rZhu:event.bZhu;
							current.init(event.map[group].randomRemove(1)[0]);
						}
					});
					"step 7"
					setTimeout(function(){
						ui.arena.classList.remove('choose-character');
					},500);
				});
			},
			chooseCharacter:function(){
				if(_status.mode=='purple'){
					game.chooseCharacterPurple();
					return;
				}
				var next=game.createEvent('chooseCharacter',false);
				next.showConfig=true;
				next.addPlayer=function(player){
					var list=lib.config.mode_config.identity.identity[game.players.length-3].slice(0);
					var list2=lib.config.mode_config.identity.identity[game.players.length-2].slice(0);
					for(var i=0;i<list.length;i++) list2.remove(list[i]);
					player.identity=list2[0];
					player.setIdentity('cai');
				};
				next.removePlayer=function(){
					return game.players.randomGet(game.me,game.zhu);
				};
				next.ai=function(player,list,list2,back){
					if(_status.brawl&&_status.brawl.chooseCharacterAi){
						if(_status.brawl.chooseCharacterAi(player,list,list2,back)!==false){
							return;
						}
					}
					if(_status.event.zhongmode){
						if(get.config('double_character')){
							player.init(list[0],list[1],false);
						}
						else{
							player.init(list[0]);
						}
						if(player.identity=='mingzhong'){
							player.hp++;
							player.maxHp++;
							player.update();
						}
					}
					else if(player.identity=='zhu'){
						list2.randomSort();
						var choice,choice2;
						if(!_status.event.zhongmode&&Math.random()-0.8<0&&list2.length){
							choice=list2[0];
							choice2=list[0];
							if(choice2==choice){
								choice2=list[1];
							}
						}
						else{
							choice=list[0];
							choice2=list[1];
						}
						if(get.config('double_character')){
							player.init(choice,choice2,false);
						}
						else{
							player.init(choice);
						}
						if(game.players.length>4){
							player.hp++;
							player.maxHp++;
							player.update();
						}
					}
					else if(player.identity=='zhong'&&(Math.random()<0.5||['sunliang','key_akane'].contains(game.zhu.name))){
						var choice=0;
						for(var i=0;i<list.length;i++){
							if(lib.character[list[i]][1]==game.zhu.group){
								choice=i;break;
							}
						}
						if(get.config('double_character')){
							player.init(list[choice],list[choice==0?choice+1:choice-1],false);
						}
						else{
							player.init(list[choice]);
						}
					}
					else{
						if(get.config('double_character')){
							player.init(list[0],list[1],false);
						}
						else{
							player.init(list[0]);
						}
					}
					if(back){
						list.remove(player.name);
						list.remove(player.name2);
						for(var i=0;i<list.length;i++){
							back.push(list[i]);
						}
					}
					if(typeof lib.config.test_game=='string'&&player==game.me.next){
						player.init(lib.config.test_game);
					}
					if(get.config('choose_group')&&player.group=='shen'){
							var list=lib.group.slice(0);
							list.remove('shen');
							if(list.length) player.group=function(){
							 if(_status.mode!='zhong'&&game.zhu&&game.zhu.group){
							  if(['re_zhangjiao','liubei','re_liubei','caocao','re_caocao','sunquan','re_sunquan','zhangjiao','sp_zhangjiao','caopi','re_caopi','liuchen','caorui','sunliang','sunxiu','sunce','re_sunben','ol_liushan','re_liushan','key_akane','dongzhuo','re_dongzhuo','ol_dongzhuo'].contains(game.zhu.name)) return game.zhu.group;
							  if(game.zhu.name=='sunhao'&&player.identity=='zhong') return 'wu';
							  if(game.zhu.name=='yl_yuanshu'){
							   if(player.identity=='zhong') list.remove('qun');
							   else return 'qun';
							  }
							  if(['sunhao','xin_yuanshao','re_yuanshao','re_sunce','ol_yuanshao','yuanshu'].contains(game.zhu.name)){
							   if(player.identity!='zhong') list.remove(game.zhu.group);
							   else return game.zhu.group;
							  }
							 }
							 return list.randomGet();
							}();
						}
						player.node.name.dataset.nature=get.groupnature(player.group);
				}
				next.setContent(function(){
					"step 0"
					ui.arena.classList.add('choose-character');
					var i;
					var list;
					var list2=[];
					var list3=[];
					var identityList;
					var chosen=lib.config.continue_name||[];
					game.saveConfig('continue_name');
					event.chosen=chosen;
					if(_status.mode=='zhong'){
						event.zhongmode=true;
						identityList=['zhu','zhong','mingzhong','nei','fan','fan','fan','fan'];
					}
					else{
						identityList=lib.config.mode_config.identity.identity[game.players.length-2].slice(0);
						if(get.config('double_nei')){
							switch(get.playerNumber()){
								case 8:
								identityList.remove('fan');
								identityList.push('nei');
								break;
								case 7:
								identityList.remove('zhong');
								identityList.push('nei');
								break;
								case 6:
								identityList.remove('fan');
								identityList.push('nei');
								break;
								case 5:
								identityList.remove('fan');
								identityList.push('nei');
								break;
								case 4:
								identityList.remove('zhong');
								identityList.push('nei');
								break;
								case 3:
								identityList.remove('fan');
								identityList.push('nei');
								break;
							}
						}
					}

					var addSetting=function(dialog){
						dialog.add('选择身份').classList.add('add-setting');
						var table=document.createElement('div');
						table.classList.add('add-setting');
						table.style.margin='0';
						table.style.width='100%';
						table.style.position='relative';
						var listi;
						if(event.zhongmode){
							listi=['random','zhu','mingzhong','zhong','nei','fan'];
						}
						else{
							listi=['random','zhu','zhong','nei','fan'];
						}

						for(var i=0;i<listi.length;i++){
							var td=ui.create.div('.shadowed.reduce_radius.pointerdiv.tdnode');
							td.link=listi[i];
							if(td.link===game.me.identity){
								td.classList.add('bluebg');
							}
							table.appendChild(td);
							td.innerHTML='<span>'+get.translation(listi[i]+'2')+'</span>';
							td.addEventListener(lib.config.touchscreen?'touchend':'click',function(){
								if(_status.dragged) return;
								if(_status.justdragged) return;
								_status.tempNoButton=true;
								setTimeout(function(){
									_status.tempNoButton=false;
								},500);
								var link=this.link;
								if(game.zhu.name){
									if(link!='random'){
										_status.event.parent.fixedseat=get.distance(game.me,game.zhu,'absolute');
									}
									game.zhu.uninit();
									delete game.zhu.isZhu;
									delete game.zhu.identityShown;
								}
								var current=this.parentNode.querySelector('.bluebg');
								if(current){
									current.classList.remove('bluebg');
								}
								current=seats.querySelector('.bluebg');
								if(current){
									current.classList.remove('bluebg');
								}
								if(link=='random'){
									if(event.zhongmode){
										link=['zhu','zhong','nei','fan','mingzhong'].randomGet();
									}
									else{
										link=['zhu','zhong','nei','fan'].randomGet();
									}
									for(var i=0;i<this.parentNode.childElementCount;i++){
										if(this.parentNode.childNodes[i].link==link){
											this.parentNode.childNodes[i].classList.add('bluebg');
										}
									}
								}
								else{
									this.classList.add('bluebg');
								}
								num=get.config('choice_'+link);
								if(event.zhongmode){
									num=6;
									if(link=='zhu'||link=='nei'||link=='mingzhong'){
										num=8;
									}
								}
								_status.event.parent.swapnodialog=function(dialog,list){
									var buttons=ui.create.div('.buttons');
									var node=dialog.buttons[0].parentNode;
									dialog.buttons=ui.create.buttons(list,'character',buttons);
									dialog.content.insertBefore(buttons,node);
									buttons.animate('start');
									node.remove();
									game.uncheck();
									game.check();
									for(var i=0;i<seats.childElementCount;i++){
										if(get.distance(game.zhu,game.me,'absolute')===seats.childNodes[i].link){
											seats.childNodes[i].classList.add('bluebg');
										}
									}
								}
								_status.event=_status.event.parent;
								_status.event.step=0;
								_status.event.identity=link;
								if(link!=(event.zhongmode?'mingzhong':'zhu')){
									seats.previousSibling.style.display='';
									seats.style.display='';
								}
								else{
									seats.previousSibling.style.display='none';
									seats.style.display='none';
								}
								game.resume();
							});
						}
						dialog.content.appendChild(table);

						dialog.add('选择座位').classList.add('add-setting');
						var seats=document.createElement('div');
						seats.classList.add('add-setting');
						seats.style.margin='0';
						seats.style.width='100%';
						seats.style.position='relative';
						for(var i=2;i<=game.players.length;i++){
							var td=ui.create.div('.shadowed.reduce_radius.pointerdiv.tdnode');
							td.innerHTML=get.cnNumber(i,true);
							td.link=i-1;
							seats.appendChild(td);
							if(get.distance(game.zhu,game.me,'absolute')===i-1){
								td.classList.add('bluebg');
							}
							td.addEventListener(lib.config.touchscreen?'touchend':'click',function(){
								if(_status.dragged) return;
								if(_status.justdragged) return;
								if(get.distance(game.zhu,game.me,'absolute')==this.link) return;
								var current=this.parentNode.querySelector('.bluebg');
								if(current){
									current.classList.remove('bluebg');
								}
								this.classList.add('bluebg');
								for(var i=0;i<game.players.length;i++){
									if(get.distance(game.players[i],game.me,'absolute')==this.link){
										game.swapSeat(game.zhu,game.players[i],false);return;
									}
								}
							});
						}
						dialog.content.appendChild(seats);
						if(game.me==game.zhu){
							seats.previousSibling.style.display='none';
							seats.style.display='none';
						}

						dialog.add(ui.create.div('.placeholder.add-setting'));
						dialog.add(ui.create.div('.placeholder.add-setting'));
						if(get.is.phoneLayout()) dialog.add(ui.create.div('.placeholder.add-setting'));
					};
					var removeSetting=function(){
						var dialog=_status.event.dialog;
						if(dialog){
							dialog.style.height='';
							delete dialog._scrollset;
							var list=Array.from(dialog.querySelectorAll('.add-setting'));
							while(list.length){
								list.shift().remove();
							}
							ui.update();
						}
					};
					event.addSetting=addSetting;
					event.removeSetting=removeSetting;
					event.list=[];
					identityList.randomSort();
					if(event.identity){
						identityList.remove(event.identity);
						identityList.unshift(event.identity);
						if(event.fixedseat){
							var zhuIdentity=(_status.mode=='zhong')?'mingzhong':'zhu';
							if(zhuIdentity!=event.identity){
								identityList.remove(zhuIdentity);
								identityList.splice(event.fixedseat,0,zhuIdentity);
							}
							delete event.fixedseat;
						}
						delete event.identity;
					}
					else if(_status.mode!='zhong'&&(!_status.brawl||!_status.brawl.identityShown)){
						var ban_identity=[];
						ban_identity.push(get.config('ban_identity')||'off');
						if(ban_identity[0]!='off'){
							ban_identity.push(get.config('ban_identity2')||'off');
							if(ban_identity[1]!='off'){
								ban_identity.push(get.config('ban_identity3')||'off');
							}
						}
						ban_identity.remove('off');
						if(ban_identity.length){
							var identityList2=identityList.slice(0);
							for(var i=0;i<ban_identity.length;i++){
								while(identityList2.remove(ban_identity[i]));
							}
							ban_identity=identityList2.randomGet();
							identityList.remove(ban_identity);
							identityList.splice(game.players.indexOf(game.me),0,ban_identity);
						}
					}
					for(i=0;i<game.players.length;i++){
						if(_status.brawl&&_status.brawl.identityShown){
							if(game.players[i].identity=='zhu') game.zhu=game.players[i];
							game.players[i].identityShown=true;
						}
						else{
							game.players[i].node.identity.classList.add('guessing');
							game.players[i].identity=identityList[i];
							game.players[i].setIdentity('cai');
							if(event.zhongmode){
								if(identityList[i]=='mingzhong'){
									game.zhu=game.players[i];
								}
								else if(identityList[i]=='zhu'){
									game.zhu2=game.players[i];
								}
							}
							else{
								if(identityList[i]=='zhu'){
									game.zhu=game.players[i];
								}
							}
							game.players[i].identityShown=false;
						}
					}

					if(get.config('special_identity')&&!event.zhongmode&&game.players.length==8){
						for(var i=0;i<game.players.length;i++){
							delete game.players[i].special_identity;
						}
						event.special_identity=[];
						var zhongs=game.filterPlayer(function(current){
							return current.identity=='zhong';
						});
						var fans=game.filterPlayer(function(current){
							return current.identity=='fan';
						});
						if(fans.length>=1){
							fans.randomRemove().special_identity='identity_zeishou';
							event.special_identity.push('identity_zeishou');
						}
						if(zhongs.length>1){
							zhongs.randomRemove().special_identity='identity_dajiang';
							zhongs.randomRemove().special_identity='identity_junshi';
							event.special_identity.push('identity_dajiang');
							event.special_identity.push('identity_junshi');
						}
						else if(zhongs.length==1){
							if(Math.random()<0.5){
								zhongs.randomRemove().special_identity='identity_dajiang';
								event.special_identity.push('identity_dajiang');
							}
							else{
								zhongs.randomRemove().special_identity='identity_junshi';
								event.special_identity.push('identity_junshi');
							}
						}
					}

					if(!game.zhu)	game.zhu=game.me;
					else{
						game.zhu.setIdentity();
						game.zhu.identityShown=true;
						game.zhu.isZhu=(game.zhu.identity=='zhu');
						game.zhu.node.identity.classList.remove('guessing');
						game.me.setIdentity();
						game.me.node.identity.classList.remove('guessing');
					}
					for(i in lib.character){
						if(chosen.contains(i)) continue;
						if(lib.filter.characterDisabled(i)) continue;
						event.list.push(i);
						if(lib.character[i][4]&&lib.character[i][4].contains('zhu')){
							list2.push(i);
						}
						else{
							list3.push(i);
						}
					}
					list2.sort(lib.sort.character);
					event.list.randomSort();
					_status.characterlist=event.list.slice(0);
					list3.randomSort();
					if(_status.brawl&&_status.brawl.chooseCharacterFilter){
						_status.brawl.chooseCharacterFilter(event.list,list2,list3);
					}
					var num=get.config('choice_'+game.me.identity);
					if(event.zhongmode){
						num=6;
						if(game.me.identity=='zhu'||game.me.identity=='nei'||game.me.identity=='mingzhong'){
							num=8;
						}
					}
					if(game.zhu!=game.me){
						event.ai(game.zhu,event.list,list2)
						event.list.remove(game.zhu.name);
						event.list.remove(game.zhu.name2);
						if(_status.brawl&&_status.brawl.chooseCharacter){
							list=_status.brawl.chooseCharacter(event.list,num);
							if(list===false||list==='nozhu'){
								list=event.list.slice(0,num);
							}
						}
						else{
							list=event.list.slice(0,num);
						}
					}
					else{
						if(_status.brawl&&_status.brawl.chooseCharacter){
							list=_status.brawl.chooseCharacter(list2,list3,num);
							if(list===false){
								if(event.zhongmode){
									list=list3.slice(0,6);
								}
								else{
									list=list2.concat(list3.slice(0,num));
								}
							}
							else if(list==='nozhu'){
								list=event.list.slice(0,num);
							}
						}
						else{
							if(event.zhongmode){
								list=list3.slice(0,8);
							}
							else{
								list=list2.concat(list3.slice(0,num));
							}
						}
					}
					delete event.swapnochoose;
					var dialog;
					if(event.swapnodialog){
						dialog=ui.dialog;
						event.swapnodialog(dialog,list);
						delete event.swapnodialog;
					}
					else{
						var str='选择角色';
						if(_status.brawl&&_status.brawl.chooseCharacterStr){
							str=_status.brawl.chooseCharacterStr;
						}
						dialog=ui.create.dialog(str,'hidden',[list,'character']);
						if(!_status.brawl||!_status.brawl.noAddSetting){
							if(get.config('change_identity')){
								addSetting(dialog);
							}
						}
					}
					if(game.me.special_identity){
						dialog.setCaption('选择角色（'+get.translation(game.me.special_identity)+'）');
						game.me.node.identity.firstChild.innerHTML=get.translation(game.me.special_identity+'_bg');
					}
					else{
						dialog.setCaption('选择角色');
						game.me.setIdentity();
					}
					if(!event.chosen.length){
						game.me.chooseButton(dialog,true).set('onfree',true).selectButton=function(){
							if(_status.brawl&&_status.brawl.doubleCharacter) return 2;
							return get.config('double_character')?2:1
						};
					}
					else{
						lib.init.onfree();
					}
					ui.create.cheat=function(){
						_status.createControl=ui.cheat2;
						ui.cheat=ui.create.control('更换',function(){
							if(ui.cheat2&&ui.cheat2.dialog==_status.event.dialog){
								return;
							}
							if(game.changeCoin){
								game.changeCoin(-3);
							}
							if(game.zhu!=game.me){
								event.list.randomSort();
								if(_status.brawl&&_status.brawl.chooseCharacter){
									list=_status.brawl.chooseCharacter(event.list,num);
									if(list===false||list==='nozhu'){
										list=event.list.slice(0,num);
									}
								}
								else{
									list=event.list.slice(0,num);
								}
							}
							else{
								list3.randomSort();
								if(_status.brawl&&_status.brawl.chooseCharacter){
									list=_status.brawl.chooseCharacter(list2,list3,num);
									if(list===false){
										if(event.zhongmode){
											list=list3.slice(0,6);
										}
										else{
											list=list2.concat(list3.slice(0,num));
										}
									}
									else if(list==='nozhu'){
										event.list.randomSort();
										list=event.list.slice(0,num);
									}
								}
								else{
									if(event.zhongmode){
										list=list3.slice(0,6);
									}
									else{
										list=list2.concat(list3.slice(0,num));
									}
								}
							}
							var buttons=ui.create.div('.buttons');
							var node=_status.event.dialog.buttons[0].parentNode;
							_status.event.dialog.buttons=ui.create.buttons(list,'character',buttons);
							_status.event.dialog.content.insertBefore(buttons,node);
							buttons.animate('start');
							node.remove();
							game.uncheck();
							game.check();
						});
						delete _status.createControl;
					};
					if(lib.onfree){
						lib.onfree.push(function(){
							event.dialogxx=ui.create.characterDialog('heightset');
							if(ui.cheat2){
								ui.cheat2.animate('controlpressdownx',500);
								ui.cheat2.classList.remove('disabled');
							}
						});
					}
					else{
						event.dialogxx=ui.create.characterDialog('heightset');
					}

					ui.create.cheat2=function(){
						ui.cheat2=ui.create.control('自由选将',function(){
							if(this.dialog==_status.event.dialog){
								if(game.changeCoin){
									game.changeCoin(50);
								}
								this.dialog.close();
								_status.event.dialog=this.backup;
								this.backup.open();
								delete this.backup;
								game.uncheck();
								game.check();
								if(ui.cheat){
									ui.cheat.animate('controlpressdownx',500);
									ui.cheat.classList.remove('disabled');
								}
							}
							else{
								if(game.changeCoin){
									game.changeCoin(-10);
								}
								this.backup=_status.event.dialog;
								_status.event.dialog.close();
								_status.event.dialog=_status.event.parent.dialogxx;
								this.dialog=_status.event.dialog;
								this.dialog.open();
								game.uncheck();
								game.check();
								if(ui.cheat){
									ui.cheat.classList.add('disabled');
								}
							}
						});
						if(lib.onfree){
							ui.cheat2.classList.add('disabled');
						}
					}
					if(!_status.brawl||!_status.brawl.chooseCharacterFixed){
						if(!ui.cheat&&get.config('change_choice'))
						ui.create.cheat();
						if(!ui.cheat2&&get.config('free_choose'))
						ui.create.cheat2();
					}
					// hide zhu character
					if(!game.zhu.isUnseen()&&game.zhu.name){
						game.zhu.classList.add('unseen');
						game.zhu.classList.add('unseen2');
						if(_status.characterlist){
							_status.characterlist.remove(game.zhu.name);
							_status.characterlist.remove(game.zhu.name2);
						}
						game.zhu.hiddenSkills=lib.character[game.zhu.name][3].slice(0);
						var hiddenSkills2=lib.character[game.zhu.name2][3];
						for(var j=0;j<hiddenSkills2.length;j++){
							game.zhu.hiddenSkills.add(hiddenSkills2[j]);
							game.zhu.skills.remove(hiddenSkills2[j]);
						}
						for(var j=0;j<game.zhu.hiddenSkills.length;j++){
							game.zhu.skills.remove(game.zhu.hiddenSkills);
							if(!lib.skill[game.zhu.hiddenSkills[j]]){
								game.zhu.hiddenSkills.splice(j--,1);
							}
						}
						game.zhu.group='unknown';
						game.zhu.sex='unknown';
						game.zhu.name1=game.zhu.name;
						game.zhu.name='unknown';
						game.zhu.node.name.show();
						game.zhu.node.name2.show();
						game.zhu._group=lib.character[game.zhu.name1][1];
						for(var j=0;j<game.zhu.hiddenSkills.length;j++){
							game.zhu.addSkillTrigger(game.zhu.hiddenSkills[j],true);
						}
					}
					"step 1"
					if(ui.cheat){
						ui.cheat.close();
						delete ui.cheat;
					}
					if(ui.cheat2){
						ui.cheat2.close();
						delete ui.cheat2;
					}
					var chooseGroup=false;
					if(event.chosen.length){
						if(lib.character[event.chosen[0]][1]=='shen'){
							chooseGroup=true;
						}
					}
					else if(event.modchosen){
						if(event.modchosen[0]=='random') event.modchosen[0]=result.buttons[0].link;
						else event.modchosen[1]=result.buttons[0].link;
					}
					else if(result.buttons.length==2){
						event.choosed=[result.buttons[0].link,result.buttons[1].link];
						game.addRecentCharacter(result.buttons[0].link,result.buttons[1].link);
						if(lib.character[event.choosed[0]][1]=='shen'){
							chooseGroup=true;
						}
					}
					else{
						event.choosed=[result.buttons[0].link];
						if(lib.character[event.choosed[0]][1]=='shen'){
							chooseGroup=true;
						}
						game.addRecentCharacter(result.buttons[0].link);
					}
					if(get.config('choose_group')&&chooseGroup){
						 var list=lib.group.slice(0);
							list.remove('shen');
							game.me.chooseControl(list).prompt='请选择神武将的势力';
					}
					"step 2"
					event.group=result.control||false;
					if(event.chosen.length){
						game.me.init(event.chosen[0],event.chosen[1],false);
					}
					else if(event.modchosen){
						game.me.init(event.modchosen[0],event.modchosen[1],false);
					}
					else if(event.choosed.length==2){
						game.me.init(event.choosed[0],event.choosed[1],false);
					}
					else{
						game.me.init(event.choosed[0]);
					}
					event.list.remove(game.me.name);
					event.list.remove(game.me.name2);
					if(game.me==game.zhu&&game.players.length>4){
						game.me.hp++;
						game.me.maxHp++;
						game.me.update();
					}
					for(var i=0;i<game.players.length;i++){
						if(game.players[i]!=game.zhu&&game.players[i]!=game.me){
							event.list.randomSort();
							event.ai(game.players[i],event.list.splice(0,get.config('choice_'+game.players[i].identity)),null,event.list)
						}
					}
					"step 3"
					if(event.group){
						game.me.groupshen=event.group;
						game.me.node.name.dataset.nature=get.groupnature(game.me.group);
						game.me.update();
					}
					// hide zhu character
					if(!game.zhu.isUnseen()&&game.zhu.name){
						game.zhu.classList.add('unseen');
						game.zhu.classList.add('unseen2');
						if(_status.characterlist){
							_status.characterlist.remove(game.zhu.name);
							_status.characterlist.remove(game.zhu.name2);
						}
						game.zhu.hiddenSkills=lib.character[game.zhu.name][3].slice(0);
						var hiddenSkills2=lib.character[game.zhu.name2][3];
						for(var j=0;j<hiddenSkills2.length;j++){
							game.zhu.hiddenSkills.add(hiddenSkills2[j]);
							game.zhu.skills.remove(hiddenSkills2[j]);
						}
						for(var j=0;j<game.zhu.hiddenSkills.length;j++){
							game.zhu.skills.remove(game.zhu.hiddenSkills);
							if(!lib.skill[game.zhu.hiddenSkills[j]]){
								game.zhu.hiddenSkills.splice(j--,1);
							}
						}
						game.zhu.group='unknown';
						game.zhu.sex='unknown';
						game.zhu.name1=game.zhu.name;
						game.zhu.name='unknown';
						game.zhu.node.name.show();
						game.zhu.node.name2.show();
						game.zhu._group=lib.character[game.zhu.name1][1];
						for(var j=0;j<game.zhu.hiddenSkills.length;j++){
							game.zhu.addSkillTrigger(game.zhu.hiddenSkills[j],true);
						}
					}
					for(var i=0;i<game.players.length;i++){
						_status.characterlist.remove(game.players[i].name);
						_status.characterlist.remove(game.players[i].name1);
						_status.characterlist.remove(game.players[i].name2);
					}
					"step 4"
					for(var i=0;i<game.players.length;i++){
						// game.zhu has been set at above and it should be skipped here
						if(game.players[i]==game.zhu) continue;

						game.players[i].classList.add('unseen');
						game.players[i].classList.add('unseen2');
						if(_status.characterlist){
							_status.characterlist.remove(game.players[i].name);
							_status.characterlist.remove(game.players[i].name2);
						}
						if(game.players[i]!=game.me){
							game.players[i].node.identity.firstChild.innerHTML='猜';
							game.players[i].node.identity.dataset.color='unknown';
							game.players[i].node.identity.classList.add('guessing');
						}
						game.players[i].hiddenSkills=lib.character[game.players[i].name][3].slice(0);
						var hiddenSkills2=lib.character[game.players[i].name2][3];
						for(var j=0;j<hiddenSkills2.length;j++){
							game.players[i].hiddenSkills.add(hiddenSkills2[j]);
							game.players[i].skills.remove(hiddenSkills2[j]);
						}
						for(var j=0;j<game.players[i].hiddenSkills.length;j++){
							game.players[i].skills.remove(game.players[i].hiddenSkills);
							if(!lib.skill[game.players[i].hiddenSkills[j]]){
								game.players[i].hiddenSkills.splice(j--,1);
							}
						}
						game.players[i].group='unknown';
						game.players[i].sex='unknown';
						game.players[i].name1=game.players[i].name;
						game.players[i].name='unknown';
						game.players[i].node.name.show();
						game.players[i].node.name2.show();
						game.players[i]._group=lib.character[game.players[i].name1][1];
						for(var j=0;j<game.players[i].hiddenSkills.length;j++){
							game.players[i].addSkillTrigger(game.players[i].hiddenSkills[j],true);
						}
					}
					for(var i=0;i<game.players.length;i++){
						game.players[i].showRevealCharacter();
					}
					setTimeout(function(){
						ui.arena.classList.remove('choose-character');
					},500);

					if(event.special_identity){
						for(var i=0;i<event.special_identity.length;i++){
							game.zhu.addSkill(event.special_identity[i]);
						}
					}
				});
			},
			chooseCharacterOL:function(){
				if(_status.mode=='purple'){
					game.chooseCharacterPurpleOL();
					return;
				}
				var next=game.createEvent('chooseCharacter',false);
				next.setContent(function(){
					"step 0"
					ui.arena.classList.add('choose-character');
					var i;
					var identityList;
					if(_status.mode=='zhong'){
						event.zhongmode=true;
						identityList=['zhu','zhong','mingzhong','nei','fan','fan','fan','fan'];
					}
					else{
						identityList=lib.config.mode_config.identity.identity[game.players.length-2].slice(0);
						if(lib.configOL.double_nei){
							switch(lib.configOL.number){
								case 8:
								identityList.remove('fan');
								identityList.push('nei');
								break;
								case 7:
								identityList.remove('zhong');
								identityList.push('nei');
								break;
								case 6:
								identityList.remove('fan');
								identityList.push('nei');
								break;
								case 5:
								identityList.remove('fan');
								identityList.push('nei');
								break;
								case 4:
								identityList.remove('zhong');
								identityList.push('nei');
								break;
								case 3:
								identityList.remove('fan');
								identityList.push('nei');
								break;
							}
						}
					}
					// avoid zhu/nei repeatedly being assigned to the same player
					// 1. game statistics
					var playersStatistics;
					if(lib.config[lib.statsKeyGame]&&lib.config[lib.statsKeyGame][lib.statsKeyStatsByZones]&&lib.config[lib.statsKeyGame][lib.statsKeyStatsByZones][lib.statsKeyLocal]&&lib.config[lib.statsKeyGame][lib.statsKeyStatsByZones][lib.statsKeyLocal][lib.statsKeyPlayer]){
						playersStatistics=lib.config[lib.statsKeyGame][lib.statsKeyStatsByZones][lib.statsKeyLocal][lib.statsKeyPlayer];
					}
					// 2. assign without repetition with max of 10 times
					var assignAttempts=1;
					var assignAttemptsMax=10;
					var isAssignRepeated;
					var zhuNeiIDs=['zhu','nei'];
					do{
						identityList.randomSort();
						isAssignRepeated=false;
						for(i=0;i<game.players.length;i++){
							var nameol=game.players[i].nickname;
							if(nameol&&nameol!='无名玩家'&&playersStatistics&&playersStatistics[nameol]&&playersStatistics[nameol]['lastID']){
								var lastID=playersStatistics[nameol]['lastID'];
								if(zhuNeiIDs.contains(lastID)&&zhuNeiIDs.contains(identityList[i])){
									isAssignRepeated=true;
									break;
								}
							}
						}
						assignAttempts++;
					}while(isAssignRepeated&&assignAttempts<=assignAttemptsMax);
					if(isAssignRepeated){
						console.log('info: still end up with repeated identity assignment after '+assignAttemptsMax+' attempts!');
					}

					var moonlightTime=parseInt(lib.configOL.moonlight_time);
					for(i=0;i<game.players.length;i++){
						game.players[i].identity=identityList[i];
						game.players[i].setIdentity('cai');
						game.players[i].node.identity.classList.add('guessing');
						if(event.zhongmode){
							if(identityList[i]=='mingzhong'){
								game.zhu=game.players[i];
							}
							else if(identityList[i]=='zhu'){
								game.zhu2=game.players[i];
							}
						}
						else{
							if(identityList[i]=='zhu'){
								game.zhu=game.players[i];
							}
						}
						game.players[i].identityShown=false;
						game.broadcastAll(function(player,moonlightTime){
							if(!game.online||game.me==player){
								player.mlBalance=moonlightTime;
								if(game.me==player) {
									ui.create.moonlight(moonlightTime);
								}
							}
						},game.players[i],moonlightTime);
					}
					if(lib.configOL.special_identity&&!event.zhongmode&&game.players.length==8){
						var map={};
						var zhongs=game.filterPlayer(function(current){
							return current.identity=='zhong';
						});
						var fans=game.filterPlayer(function(current){
							return current.identity=='fan';
						});
						if(fans.length>=1){
							map.identity_zeishou=fans.randomRemove();
						}
						if(zhongs.length>1){
							map.identity_dajiang=zhongs.randomRemove();
							map.identity_junshi=zhongs.randomRemove();
						}
						else if(zhongs.length==1){
							if(Math.random()<0.5){
								map.identity_dajiang=zhongs.randomRemove();
							}
							else{
								map.identity_junshi=zhongs.randomRemove();
							}
						}
						game.broadcastAll(function(zhu,map){
							for(var i in map){
								map[i].special_identity=i;
							}
						},game.zhu,map);
						event.special_identity=map;
					}

					game.zhu.setIdentity();
					game.zhu.identityShown=true;
					game.zhu.isZhu=(game.zhu.identity=='zhu');
					game.zhu.node.identity.classList.remove('guessing');
					game.me.setIdentity();
					game.me.node.identity.classList.remove('guessing');
					if(game.me.special_identity){
						game.me.node.identity.firstChild.innerHTML=get.translation(game.me.special_identity+'_bg');
					}

					for(var i=0;i<game.players.length;i++){
						game.players[i].send(function(zhu,zhuid,me,identity){
							for(var i in lib.playerOL){
								lib.playerOL[i].setIdentity('cai');
								lib.playerOL[i].node.identity.classList.add('guessing');
							}
							zhu.identityShown=true;
							zhu.identity=zhuid;
							zhu.setIdentity();
							zhu.node.identity.classList.remove('guessing');
							me.setIdentity(identity);
							me.node.identity.classList.remove('guessing');
							if(me.special_identity){
								me.node.identity.firstChild.innerHTML=get.translation(me.special_identity+'_bg');
							}
							ui.arena.classList.add('choose-character');
						},game.zhu,game.zhu.identity,game.players[i],game.players[i].identity);
					}

					"step 1"
					event.allList=[];
					event.zhuList=[];
					get.charactersAndZhuOLWithBanAttendTopN(event.allList,event.zhuList)
					event.list=event.allList.slice(0);
					var testAllByGroup=lib.config['test_all_by_group'];
					if(testAllByGroup>=0){
						var totalCount=event.allList.length;
						var startIndex=testAllByGroup*20;
						var endIndex=testAllByGroup*20+20;
						if(startIndex<totalCount){
							event.testAllByGroupList=event.allList.slice(testAllByGroup*20,testAllByGroup*20+20);
							if(endIndex>totalCount){
								var extraCount=endIndex-totalCount;
								event.testAllByGroupList=event.testAllByGroupList.concat(event.allList.slice(0,extraCount));
							}
							console.log('===testing group from: '+startIndex+' to: '+endIndex);
							console.log(event.testAllByGroupList);
							console.log('===event.allList length: '+event.allList.length);
							console.log(event.allList);
						}
					}
					_status.characterlist=event.allList.slice(0);
					event.usingFuli=new Array(game.players.length);
					for(var i=0;i<game.players.length;i++){
						event.usingFuli[i]=[];
					}
					event.pickedChars=new Array(game.players.length);
					for(var i=0;i<game.players.length;i++){
						event.pickedChars[i]="";
					}
					event.choiceNum=new Array(game.players.length);
					event.choiceNumSuperChangeRole=new Array(game.players.length);
					for(var i=0;i<game.players.length;i++){
						event.choiceNum[i]=0;
						event.choiceNumSuperChangeRole[i]=0;
					}
					event.choiceNumChangeRole=new Array(game.players.length);
					for(var i=0;i<game.players.length;i++){
						var distanceFromZhu=get.distance(game.zhu, game.players[i], 'absolute');
						switch(game.players[i].identity){
							case 'zhu':
							case 'nei':
								event.choiceNumChangeRole[distanceFromZhu]=2;
								break;
							default:
								event.choiceNumChangeRole[distanceFromZhu]=1;
								break;
						}
					}

					// everyone choose to use bonus, if any
					var found=false;
					var usefuli=[];
					game.dianjiangusers=[];
					for(var i=0;i<game.players.length;i++){
						if(!game.players[i].isOnline2&&game.players[i]!=game.me) continue;
						var list=[];
						var fulibiBalance=game.getBonusBalanceWithBuffer(game.players[i],lib.bonusKeyFulibi);
						if(!game.getBonusBirthdaybonus(game.players[i].nickname)){
							if(fulibiBalance>=lib.bonusKeyAddRoleCost){
								found=true;
								list.push('addRole');
							}
						}
						if(fulibiBalance>=lib.bonusKeyPickRoleCost){
							found=true;
							list.push('pickRole');
						}
						if(list.length>0){
							for(var j=0;j<list.length;j++){
								list[j]=['','',list[j]];
							}
							usefuli.push([game.players[i],['是否使用道具',[list,'vcard']],1,false]);
						}
					}
					if(found){
						game.me.chooseButtonOL(usefuli,function(player,result){})
						.set('switchToAuto',function(){
							_status.event.result='ai';
						}).set('processAI',function(){
							return {
								bool:false,
							};
						});
					}
					else event.goto(3);

					"step 2"
					for(var i in result){
						if(result[i]&&result[i].bool&&result[i].links) {
							var distanceFromZhu=get.distance(game.zhu, lib.playerOL[i], 'absolute');
							for(var link of result[i].links){
								event.usingFuli[distanceFromZhu].push(link[2]);
								if(link[2]=='pickRole'){
									game.dianjiangusers.push(lib.playerOL[i]);
								}
							}
						}
					}

					"step 3"
					if(game.dianjiangusers.length==0){
						delete game.dianjiangusers;
						delete game.dianjiangmissedusers;
						event.goto(7);
					}
					else{
						var dianjianglist=[];
						for(var djuser of game.dianjiangusers){
							dianjianglist.push([djuser,{'createGivenCharacterDialog':event.allList.slice(0)},1,true]);
							djuser.trySkillAnimate('点将卡','点将卡',false);
						}
						lib.config.isConnectMode=true;
						game.me.chooseButtonOL(dianjianglist,function(player,result){});
					}

					"step 4"
					var pickedCharsMap={};
					var pickedCharsList=[];
					game.dianjiangmissedusers=[];

					for(var i in result){
						if(result[i]&&result[i].links) {
							var curPickedChar=result[i].links[0];
							if(curPickedChar in pickedCharsMap){
								game.dianjiangmissedusers.push(lib.playerOL[i]);
							}
							else{
								if(lib.playerOL[i]==game.me){
									game.addRecentCharacter(curPickedChar);
								}
								else if(lib.playerOL[i].isOnline2()){
									lib.playerOL[i].send(function(curPickedChar){
										game.addRecentCharacter(curPickedChar);
									},curPickedChar);
								}
								pickedCharsMap[curPickedChar]=lib.playerOL[i].nickname;
								var distanceFromZhu=get.distance(game.zhu, lib.playerOL[i], 'absolute');
								event.pickedChars[distanceFromZhu]=curPickedChar;
								game.dianjiangusers.remove(lib.playerOL[i]);
							}
						}
					}
					var pickedCharsList=Object.keys(pickedCharsMap);
					event.allList.remove(pickedCharsList);
					event.zhuList.remove(pickedCharsList);
					event.list.remove(pickedCharsList);
					delete lib.config.isConnectMode;

					"step 5"
					if(game.dianjiangmissedusers.length>0){
						game.rePickRoleOL();
					}

					"step 6"
					event.goto(3);

					"step 7"
					// chosenChars for each player: [[zhu1, zhu2], [p1_1, p1_2], ...]
					// index is based on distance from zhu
					event.chosenChars=new Array(game.players.length);
					for(var i=0;i<game.players.length;i++){
						event.chosenChars[i]=[];
					}

					// choose char 1, no use of change char
					var list=[];
					var selectButton=1;

					for(var i=0;i<game.players.length;i++){
						if(game.players[i]==game.zhu){
							var choiceZhu=5;
							if(lib.configOL.choice_zhu){
								choiceZhu=parseInt(lib.configOL.choice_zhu);
							}
							if(game.getBonusBirthdaybonus(game.players[i].nickname)){
								choiceZhu++;
								game.players[i].trySkillAnimate('生日福利','生日福利',false);
							}
							else if(event.usingFuli[0]&&event.usingFuli[0].length){
								for(var fuliname of event.usingFuli[0]){
									switch(fuliname){
										case 'addRole':
											choiceZhu++;
											game.updateBonusBalanceBuffer(game.players[i],-lib.bonusKeyAddRoleCost);
											break;
										default:break;
									}
								}
							}
							event.choiceNum[0]=choiceZhu;
							event.choiceNumSuperChangeRole[0]=choiceZhu;
							var str='选择角色1';
							if(game.players[i].special_identity){
								str+='（'+get.translation(game.players[i].special_identity)+'）';
							}
							var tempChars=event.allList.randomRemove(choiceZhu);
							event.zhuList.remove(tempChars);
							if(event.pickedChars[0].length>0){
								tempChars.unshift(event.pickedChars[0]);
								game.updateBonusBalanceBuffer(game.players[i],-lib.bonusKeyPickRoleCost);
							}
							var fulibiBalance=game.getBonusBalanceWithBuffer(game.players[i],lib.bonusKeyFulibi);
							if(fulibiBalance>=lib.bonusKeySuperChangeRoleCost){
								tempChars.push(lib.bonusKeySuperChangeRole);
							}
							list.push([game.players[i],[str,[tempChars,'character']],selectButton,false]);
						}
					}
					game.me.chooseButtonOL(list,function(player,result){
						var isSelectionMade=false;
						var isUsingSuperChangeRole=result.bool&&Array.isArray(result.links[0])&&result.links[0].length>=3&&result.links[0][2]==lib.bonusKeySuperChangeRole
						isSelectionMade=result.bool&&!isUsingSuperChangeRole;
						if(isSelectionMade&&(game.online||player==game.me)) {
							player.init(result.links[0],false);
							player.chosenChar1=result.links[0];
							var info=lib.character[result.links[0]];
							var skills=info[3];
							for(var i=0;i<skills.length;i++){
								player.hiddenSkills.add(skills[i]);
							}
						}
					});
					"step 8"
					var isSelectionMade=false;
					for(var i in result){
						var isUsingSuperChangeRole=result[i].bool&&Array.isArray(result[i].links[0])&&result[i].links[0].length>=3&&result[i].links[0][2]==lib.bonusKeySuperChangeRole
						isSelectionMade=result[i].bool&&!isUsingSuperChangeRole;
					}

					if(!isSelectionMade){
						event.goto(9);
					}
					else{
						event.goto(10);
					}

					"step 9"
					// choose char 1, again with use of change char
					var list=[];
					var selectButton=1;
					var isUsingSuperChangeRole=false;
					for(var i in result){
						isUsingSuperChangeRole=result[i].bool&&Array.isArray(result[i].links[0])&&result[i].links[0].length>=3&&result[i].links[0][2]==lib.bonusKeySuperChangeRole
					}

					for(var i=0;i<game.players.length;i++){
						if(game.players[i]==game.zhu){
							var strAnimation=get.translation('changeRole');
							if(isUsingSuperChangeRole){
								strAnimation=get.translation(lib.bonusKeySuperChangeRole);
								game.updateBonusBalanceBuffer(game.players[i],-lib.bonusKeySuperChangeRoleCost);
							}
							game.players[i].trySkillAnimate(strAnimation,strAnimation,false);
							var choiceZhu=isUsingSuperChangeRole?event.choiceNumSuperChangeRole[0]:event.choiceNumChangeRole[0];
							var str=strAnimation+'：'+event.choiceNum[0]+'换'+choiceZhu;
							var tempChars=event.allList.randomRemove(choiceZhu);
							event.zhuList.remove(tempChars);
							list.push([game.players[i],[str,[tempChars,'character']],selectButton,true]);
						}
					}
					game.me.chooseButtonOL(list,function(player,result){
						if(game.online||player==game.me) {
							player.init(result.links[0],false);
							player.chosenChar1=result.links[0];
							var info=lib.character[result.links[0]];
							var skills=info[3];
							for(var i=0;i<skills.length;i++){
								player.hiddenSkills.add(skills[i]);
							}
						}
					});

					"step 10"
					for(var i in result){
						var chosenChar1=result[i].links[0];
						event.chosenChars[0].push(chosenChar1);
					}
					// choose char 2, no use of change char
					var list=[];
					var selectButton=1;

					for(var i=0;i<game.players.length;i++){
						if(game.players[i]==game.zhu){
							var choiceZhu=event.choiceNum[0];
							if(game.getBonusBirthdaybonus(game.players[i].nickname)){
								game.players[i].trySkillAnimate('生日福利','生日福利',false);
							}
							var str='选择角色2';
							if(game.players[i].special_identity){
								str+='（'+get.translation(game.players[i].special_identity)+'）';
							}
							var nextValidZhu=game.getNextValidCharacters(event.chosenChars[0],1,event.zhuList);
							if(nextValidZhu.length>0){
								choiceZhu--;
								event.allList.remove(nextValidZhu);
							}
							var nextValidRest=game.getNextValidCharacters([...event.chosenChars[0],...nextValidZhu],choiceZhu,event.allList);
							var fulibiBalance=game.getBonusBalanceWithBuffer(game.players[i],lib.bonusKeyFulibi);
							if(fulibiBalance>=lib.bonusKeySuperChangeRoleCost){
								nextValidRest.push(lib.bonusKeySuperChangeRole);
							}
							list.push([game.players[i],[str,[[...nextValidZhu,...nextValidRest],'character']],selectButton,false]);
						}
					}
					game.me.chooseButtonOL(list,function(player,result){
						var isSelectionMade=false;
						var isUsingSuperChangeRole=result.bool&&Array.isArray(result.links[0])&&result.links[0].length>=3&&result.links[0][2]==lib.bonusKeySuperChangeRole
						isSelectionMade=result.bool&&!isUsingSuperChangeRole;
						if(isSelectionMade&&(game.online||player==game.me)) {
							player.chosenChar2=result.links[0];
							player.init(player.chosenChar1,player.chosenChar2,false);
							var info=lib.character[player.chosenChar2];
							var skills=info[3];
							for(var i=0;i<skills.length;i++){
								player.hiddenSkills.add(skills[i]);
							}
						}
					});

					"step 11"
					var isSelectionMade=false;
					for(var i in result){
						var isUsingSuperChangeRole=result[i].bool&&Array.isArray(result[i].links[0])&&result[i].links[0].length>=3&&result[i].links[0][2]==lib.bonusKeySuperChangeRole
						isSelectionMade=result[i].bool&&!isUsingSuperChangeRole;
					}

					if(!isSelectionMade){
						event.goto(12);
					}
					else{
						event.goto(13);
					}

					"step 12"
					// choose char 2 again with use of change char
					var list=[];
					var selectButton=1;
					var isUsingSuperChangeRole=false;
					for(var i in result){
						isUsingSuperChangeRole=result[i].bool&&Array.isArray(result[i].links[0])&&result[i].links[0].length>=3&&result[i].links[0][2]==lib.bonusKeySuperChangeRole
					}

					for(var i=0;i<game.players.length;i++){
						if(game.players[i]==game.zhu){
							var strAnimation=get.translation('changeRole');
							if(isUsingSuperChangeRole){
								strAnimation=get.translation(lib.bonusKeySuperChangeRole);
								game.updateBonusBalanceBuffer(game.players[i],-lib.bonusKeySuperChangeRoleCost);
							}
							game.players[i].trySkillAnimate(strAnimation,strAnimation,false);
							var choiceZhu=isUsingSuperChangeRole?event.choiceNumSuperChangeRole[0]:event.choiceNumChangeRole[0];
							var str=strAnimation+'：'+event.choiceNum[0]+'换'+choiceZhu;
							var nextValidCharacters=game.getNextValidCharacters(event.chosenChars[0],choiceZhu,event.allList);
							list.push([game.players[i],[str,[nextValidCharacters,'character']],selectButton,true]);
						}
					}
					game.me.chooseButtonOL(list,function(player,result){
						if(game.online||player==game.me){
							player.chosenChar2=result.links[0];
							player.init(player.chosenChar1,player.chosenChar2,false);
							var info=lib.character[player.chosenChar2];
							var skills=info[3];
							for(var i=0;i<skills.length;i++){
								player.hiddenSkills.add(skills[i]);
							}
						}
					});

					"step 13"
					for(var i in result){
						var chosenChar2=result[i].links[0];
						event.chosenChars[0].push(chosenChar2);
					}
					// determine main and vice character
					var list=[];
					var selectButton=1;

					for(var i=0;i<game.players.length;i++){
						if(game.players[i]==game.zhu){
							var str='选择主副将';
							if(game.players[i].special_identity){
								str+='（'+get.translation(game.players[i].special_identity)+'）';
							}
							if(event.testAllByGroupList){
								event.chosenChars[0]=event.testAllByGroupList.slice(0,2);
								game.players[i].chosenChar1=event.chosenChars[0][0];
								game.players[i].chosenChar2=event.chosenChars[0][1];
							}
							list.push([game.players[i],[str,[event.chosenChars[0],'character']],selectButton,true]);
						}
					}
					game.me.chooseButtonOL(list,function(player,result){
						if(game.online||player==game.me) {
							// this determines the current user will see full character and group info or not
							var mainChar=result.links[0];
							var viceChar=mainChar==player.chosenChar1?player.chosenChar2:player.chosenChar1;
							player.init(mainChar,viceChar,false);
						}
					});
					"step 14"
					if(game.me!=game.zhu){
						for(var i in result){
							// this determines the other online users will see full character and group info or not
							var mainChar=result[i].links[0];
							var viceChar=mainChar==event.chosenChars[0][0]?event.chosenChars[0][1]:event.chosenChars[0][0];
							game.zhu.init(mainChar,viceChar,false)
							// game.zhu.init will be called from host and is broadcasting
							// avoid exposing zhu character and group after making selection
							game.zhu.group='unknown';
							game.zhu.classList.add('unseen');
							game.zhu.classList.add('unseen2');
						}
					}

					if(game.players.length>4){
						game.zhu.maxHp++;
						game.zhu.hp++;
						game.zhu.update();
					}

					event.zhuHasShen=false;
					var zhuNames=[game.zhu.name, game.zhu.name2];
					for(var i in zhuNames){
						if(lib.character[zhuNames[i]]&&lib.character[zhuNames[i]][1]=='shen') {
							event.zhuHasShen=true;
							break;
						}
					}

					if(event.zhuHasShen){
						var list=lib.group.slice(0);
						list.remove('shen');
						for(var i=0;i<list.length;i++){
							list[i]=['','','group_'+list[i]];
						}
						// prevent exposing shen wujiang by showing timer for everyone
						var choose_shen_time=lib.configOL.choose_timeout
						if(lib.configOL.choose_timeout_shen_group){
							choose_shen_time=lib.configOL.choose_timeout_shen_group;
						}
						for(var i=0;i<game.players.length;i++){
							game.players[i].showTimer(parseInt(choose_shen_time)*1000);
						}
						game.me._hide_all_timer=true;
						game.zhu.chooseButton(['请选择神武将的势力',[list,'vcard']],true);
					}
					"step 15"
					if(event.zhuHasShen&&!game.zhu.groupshen){
						game.zhu.groupshen=result.links[0][2].slice(6);
					}
					"step 16"
					// broadcast will exclude sender itself
					// hence zhu.maxHp++ won't happened repeatedly
					game.broadcast(function(zhu,name,name2,addMaxHp){
						if(game.zhu!=game.me){
							zhu.init(name,name2,false);
							zhu.group='unknown';
							zhu.classList.add('unseen');
							zhu.classList.add('unseen2');
						}
						if(addMaxHp){
							zhu.maxHp++;
							zhu.hp++;
							zhu.update();
						}
					},game.zhu,game.zhu.name,game.zhu.name2,game.players.length>4);

					// remove zhu two characters from pool
					event.list.remove(event.chosenChars[0]);

					// hide zhu character
					game.broadcastAll(function(player){
						player.classList.add('unseen');
						player.classList.add('unseen2');
						if(_status.characterlist){
							_status.characterlist.remove(player.name);
							_status.characterlist.remove(player.name2);
						}
						player.hiddenSkills=lib.character[player.name][3].slice(0);
						var hiddenSkills2=lib.character[player.name2][3];
						for(var j=0;j<hiddenSkills2.length;j++){
							player.hiddenSkills.add(hiddenSkills2[j]);
							player.skills.remove(hiddenSkills2[j]);
						}
						for(var j=0;j<player.hiddenSkills.length;j++){
							player.skills.remove(player.hiddenSkills);
							if(!lib.skill[player.hiddenSkills[j]]){
								player.hiddenSkills.splice(j--,1);
							}
						}
						player.group='unknown';
						player.sex='unknown';
						player.name1=player.name;
						player.name='unknown';
						player.node.name.show();
						player.node.name2.show();
						player._group=lib.character[player.name1][1];
						for(var j=0;j<player.hiddenSkills.length;j++){
							player.addSkillTrigger(player.hiddenSkills[j],true);
						}
					},game.zhu);
					game.zhu.showGiveup();
					game.zhu.showRevealCharacter();
					if(game.zhu!=game.me&&!game.zhu.isOnline2()){
						game.zhu.showCharacter(1);
					}
					"step 17"
					// zhu choose to show character
					var liangjiang=[];
					var list=['bumingzhi','mingzhizhujiang','mingzhifujiang','tongshimingzhi',];
					for(var i=0;i<list.length;i++){
						list[i]=['','',list[i]];
					}
					game.zhu.chooseButton(['是否亮将',[list,'vcard']],true);
					"step 18"
					var choice=result.links[0][2];
					switch(choice){
						case 'mingzhizhujiang':game.zhu.showCharacter(0,true,true);event.goto(21);break;
						case 'mingzhifujiang':game.zhu.showCharacter(1,true,true);event.goto(21);break;
						case 'tongshimingzhi':game.zhu.showCharacter(2,true,true);event.goto(21);break;
						default:game.zhu.trySkillAnimate('不亮将','不亮将',false);break;
					}
					"step 19"
					// zhu choose to show group
					var list=lib.group.slice(0);
					list.remove('shen');
					for(var i=0;i<list.length;i++){
						list[i]=['','','group_'+list[i]];
					}
					game.zhu.chooseButton(['是否声明势力',[list,'vcard']]).set('ai',function(button){
						return 0;
					});
					"step 20"
					if(result.bool){
						var shili=result.links[0][2].slice(6);
						game.zhu.hiddenSkills.add('shengmingshili'+shili);
						game.zhu.addSkillTrigger('shengmingshili'+shili,true);
						_status.event.trigger('declareGroup');
						game.zhu.group=shili;
						game.broadcast(function(player,group){
							player.group=group;
						},game.zhu,game.zhu.group);
					}
					else{
						game.zhu.trySkillAnimate('不声明势力','不声明势力',false);
					}
					"step 21"
					// other players to choose character1, no use of change char
					var list=[];
					var selectButton=1;

					var num,num2=0;
					if(event.zhongmode){
						num=6;
					}
					else{
						num=Math.floor(event.list.length/(game.players.length-1));
						if(num>5){
							num=5;
						}
						num2=event.list.length-num*(game.players.length-1);
						if(lib.configOL.double_nei){
							num2=Math.floor(num2/2);
						}
						if(num2>2){
							num2=2;
						}
					}
					for(var i=0;i<game.players.length;i++){
						if(game.players[i]!=game.zhu){
							var distanceFromZhu=get.distance(game.zhu, game.players[i], 'absolute');
							var num3=0;
							if(event.zhongmode){
								if(game.players[i].identity=='nei'||game.players[i].identity=='zhu'){
									num3=2;
								}
							}
							else{
								switch(game.players[i].identity){
									case 'zhong':
										if(lib.configOL.choice_zhong){
											num3=parseInt(lib.configOL.choice_zhong)-num;
										}
										break;
									case 'fan':
										if(lib.configOL.choice_fan){
											num3=parseInt(lib.configOL.choice_fan)-num;
										}
										break;
									case 'nei':
										if(lib.configOL.choice_nei){
											num3=parseInt(lib.configOL.choice_nei)-num;
										}else{
											num3=num2;
										}
										break;
									default:
										break;
								}
							}
							if(game.getBonusBirthdaybonus(game.players[i].nickname)){
								num3++;
								game.players[i].trySkillAnimate('生日福利','生日福利',false);
							}
							else if(event.usingFuli[distanceFromZhu]&&event.usingFuli[distanceFromZhu].length){
								for(var fuliname of event.usingFuli[distanceFromZhu]){
									switch(fuliname){
										case 'addRole':
											num3++;
											game.updateBonusBalanceBuffer(game.players[i],-lib.bonusKeyAddRoleCost);
											break;
										default:break;
									}
								}
							}
							event.choiceNum[distanceFromZhu]=num+num3;
							event.choiceNumSuperChangeRole[distanceFromZhu]=num+num3;
							var str='选择角色1';
							if(game.players[i].special_identity){
								str+='（'+get.translation(game.players[i].special_identity)+'）';
							}
							var tempChars=event.list.randomRemove(num+num3);
							if(event.pickedChars[distanceFromZhu].length>0){
								tempChars.unshift(event.pickedChars[distanceFromZhu]);
								game.updateBonusBalanceBuffer(game.players[i],-lib.bonusKeyPickRoleCost);
							}
							var fulibiBalance=game.getBonusBalanceWithBuffer(game.players[i],lib.bonusKeyFulibi);
							if(fulibiBalance>=lib.bonusKeySuperChangeRoleCost){
								tempChars.push(lib.bonusKeySuperChangeRole);
							}
							list.push([game.players[i],[str,[tempChars,'character']],selectButton,false]);
						}
					}
					game.me.chooseButtonOL(list,function(player,result){
						var isSelectionMade=false;
						var isUsingSuperChangeRole=result.bool&&Array.isArray(result.links[0])&&result.links[0].length>=3&&result.links[0][2]==lib.bonusKeySuperChangeRole
						isSelectionMade=result.bool&&!isUsingSuperChangeRole;
						if(isSelectionMade&&(game.online||player==game.me)) {
							player.init(result.links[0],false);
							player.chosenChar1=result.links[0];
							var info=lib.character[result.links[0]];
							var skills=info[3];
							for(var i=0;i<skills.length;i++){
								player.hiddenSkills.add(skills[i]);
							}
						}
					});
					"step 22"
					var isChar1SelectionMadeFully=true;
					for(var i in result){
						if(lib.playerOL[i].identity=='zhu'){
							continue;
						}
						var distanceFromZhu=get.distance(game.zhu, lib.playerOL[i], 'absolute');
						var isUsingSuperChangeRole=result[i].bool&&Array.isArray(result[i].links[0])&&result[i].links[0].length>=3&&result[i].links[0][2]==lib.bonusKeySuperChangeRole
						isSelectionMade=result[i].bool&&!isUsingSuperChangeRole;
						if(!isSelectionMade){
							isChar1SelectionMadeFully=false;
						}
						else{
							var chosenChar1=result[i].links[0];
							event.chosenChars[distanceFromZhu].push(chosenChar1);
						}
					}

					if(!isChar1SelectionMadeFully){
						event.goto(23);
					}
					else{
						event.goto(24);
					}

					"step 23"
					// other players to choose character1, again with use of change char
					var list=[];
					var selectButton=1;

					for(var i in result){
						var player=lib.playerOL[i]
						var isUsingSuperChangeRole=result[i].bool&&Array.isArray(result[i].links[0])&&result[i].links[0].length>=3&&result[i].links[0][2]==lib.bonusKeySuperChangeRole
						var distanceFromZhu=get.distance(game.zhu, player, 'absolute');
						if(event.chosenChars[distanceFromZhu].length==0){
							var strAnimation=get.translation('changeRole');
							if(isUsingSuperChangeRole){
								strAnimation=get.translation(lib.bonusKeySuperChangeRole);
								game.updateBonusBalanceBuffer(player,-lib.bonusKeySuperChangeRoleCost);
							}
							player.trySkillAnimate(strAnimation,strAnimation,false);
							var totalChoice=isUsingSuperChangeRole?event.choiceNumSuperChangeRole[distanceFromZhu]:event.choiceNumChangeRole[distanceFromZhu];
							var str=strAnimation+'：'+event.choiceNum[distanceFromZhu]+'换'+totalChoice;
							list.push([player,[str,[event.list.randomRemove(totalChoice),'character']],selectButton,true]);
						}
					}
					game.me.chooseButtonOL(list,function(player,result){
						if(game.online||player==game.me){
							player.init(result.links[0],false);
							player.chosenChar1=result.links[0];
							var info=lib.character[result.links[0]];
							var skills=info[3];
							for(var i=0;i<skills.length;i++){
								player.hiddenSkills.add(skills[i]);
							}
						}
					});

					"step 24"
					for(var i in result){
						var distanceFromZhu=get.distance(game.zhu, lib.playerOL[i], 'absolute');
						if(distanceFromZhu>0&&result[i].bool&&event.chosenChars[distanceFromZhu].length==0){
							var chosenChar1=result[i].links[0];
							event.chosenChars[distanceFromZhu].push(chosenChar1);
						}
					}

					// other players to choose character2, no use of change char
					var list=[];
					var selectButton=1;

					var num,num2=0;
					if(event.zhongmode){
						num=6;
					}
					else{
						num=Math.floor(event.list.length/(game.players.length-1));
						if(num>5){
							num=5;
						}
						num2=event.list.length-num*(game.players.length-1);
						if(lib.configOL.double_nei){
							num2=Math.floor(num2/2);
						}
						if(num2>2){
							num2=2;
						}
					}
					for(var i=0;i<game.players.length;i++){
						if(game.players[i]!=game.zhu){
							var distanceFromZhu=get.distance(game.zhu, game.players[i], 'absolute');
							if(game.getBonusBirthdaybonus(game.players[i].nickname)){
								game.players[i].trySkillAnimate('生日福利','生日福利',false);
							}
							var str='选择角色2';
							if(game.players[i].special_identity){
								str+='（'+get.translation(game.players[i].special_identity)+'）';
							}
							var nextValidCharacters=game.getNextValidCharacters(event.chosenChars[distanceFromZhu][0],event.choiceNum[distanceFromZhu],event.list);
							var fulibiBalance=game.getBonusBalanceWithBuffer(game.players[i],lib.bonusKeyFulibi);
							if(fulibiBalance>=lib.bonusKeySuperChangeRoleCost){
								nextValidCharacters.push(lib.bonusKeySuperChangeRole);
							}
							list.push([game.players[i],[str,[nextValidCharacters,'character']],selectButton,false]);
						}
					}
					game.me.chooseButtonOL(list,function(player,result){
						var isSelectionMade=false;
						var isUsingSuperChangeRole=result.bool&&Array.isArray(result.links[0])&&result.links[0].length>=3&&result.links[0][2]==lib.bonusKeySuperChangeRole
						isSelectionMade=result.bool&&!isUsingSuperChangeRole;
						if(isSelectionMade&&(game.online||player==game.me)) {
							player.chosenChar2=result.links[0];
							player.init(player.chosenChar1,player.chosenChar2,false);
							var info=lib.character[player.chosenChar2];
							var skills=info[3];
							for(var i=0;i<skills.length;i++){
								player.hiddenSkills.add(skills[i]);
							}
						}
					});

					"step 25"
					var isChar2SelectionMadeFully=true;
					for(var i in result){
						if(lib.playerOL[i].identity=='zhu'){
							continue;
						}
						var distanceFromZhu=get.distance(game.zhu, lib.playerOL[i], 'absolute');
						var isUsingSuperChangeRole=result[i].bool&&Array.isArray(result[i].links[0])&&result[i].links[0].length>=3&&result[i].links[0][2]==lib.bonusKeySuperChangeRole
						isSelectionMade=result[i].bool&&!isUsingSuperChangeRole;
						if(!isSelectionMade){
							isChar2SelectionMadeFully=false;
						}
						else{
							var chosenChar2=result[i].links[0];
							event.chosenChars[distanceFromZhu].push(chosenChar2);
						}
					}

					if(!isChar2SelectionMadeFully){
						event.goto(26);
					}
					else{
						event.goto(27);
					}

					"step 26"
					// other players to choose character2, again with use of change char
					var list=[];
					var selectButton=1;

					for(var i in result){
						var player=lib.playerOL[i]
						var isUsingSuperChangeRole=result[i].bool&&Array.isArray(result[i].links[0])&&result[i].links[0].length>=3&&result[i].links[0][2]==lib.bonusKeySuperChangeRole
						var distanceFromZhu=get.distance(game.zhu, player, 'absolute');
						if(event.chosenChars[distanceFromZhu].length==1){
							var strAnimation=get.translation('changeRole');
							if(isUsingSuperChangeRole){
								strAnimation=get.translation(lib.bonusKeySuperChangeRole);
								game.updateBonusBalanceBuffer(player,-lib.bonusKeySuperChangeRoleCost);
							}
							player.trySkillAnimate(strAnimation,strAnimation,false);
							var totalChoice=isUsingSuperChangeRole?event.choiceNumSuperChangeRole[distanceFromZhu]:event.choiceNumChangeRole[distanceFromZhu];
							var str=strAnimation+'：'+event.choiceNum[distanceFromZhu]+'换'+totalChoice;
							var nextValidCharacters=game.getNextValidCharacters(event.chosenChars[distanceFromZhu][0],totalChoice,event.list);
							list.push([player,[str,[nextValidCharacters,'character']],selectButton,true]);
						}
					}
					game.me.chooseButtonOL(list,function(player,result){
						if(game.online||player==game.me){
							player.chosenChar2=result.links[0];
							player.init(player.chosenChar1,player.chosenChar2,false);
							var info=lib.character[player.chosenChar2];
							var skills=info[3];
							for(var i=0;i<skills.length;i++){
								player.hiddenSkills.add(skills[i]);
							}
						}
					});

					"step 27"
					for(var i in result){
						var distanceFromZhu=get.distance(game.zhu, lib.playerOL[i], 'absolute');
						if(distanceFromZhu>0&&result[i].bool&&event.chosenChars[distanceFromZhu].length==1){
							var chosenChar2=result[i].links[0];
							event.chosenChars[distanceFromZhu].push(chosenChar2);
						}
					}
					// other players to determine main and vice character
					var list=[];
					var selectButton=1;
					for(var i=0;i<game.players.length;i++){
						if(game.players[i]!=game.zhu){
							var distanceFromZhu=get.distance(game.zhu, game.players[i], 'absolute');

							var str='选择主副将';
							if(game.players[i].special_identity){
								str+='（'+get.translation(game.players[i].special_identity)+'）';
							}
							if(event.testAllByGroupList){
								event.chosenChars[distanceFromZhu]=event.testAllByGroupList.slice(distanceFromZhu*2,distanceFromZhu*2+2);
								game.players[i].chosenChar1=event.chosenChars[distanceFromZhu][0];
								game.players[i].chosenChar2=event.chosenChars[distanceFromZhu][1];
							}
							list.push([game.players[i],[str,[event.chosenChars[distanceFromZhu],'character']],selectButton,true]);
						}
					}
					game.me.chooseButtonOL(list,function(player,result){
						if(game.online||player==game.me) {
							var mainChar=result.links[0];
							var viceChar=mainChar==player.chosenChar1?player.chosenChar2:player.chosenChar1;
							player.init(mainChar,viceChar,false);
						}
					});
					"step 28"
					var shen=[];
					for(var i in result){
						var distanceFromZhu=get.distance(game.zhu, lib.playerOL[i], 'absolute');
						var mainChar=result[i].links[0];
						var viceChar=mainChar==event.chosenChars[distanceFromZhu][0]?event.chosenChars[distanceFromZhu][1]:event.chosenChars[distanceFromZhu][0];
						result[i]=[mainChar,viceChar];
						if(lib.character[result[i][0]]&&lib.character[result[i][0]][1]=='shen'||
							lib.character[result[i][1]]&&lib.character[result[i][1]][1]=='shen') shen.push(lib.playerOL[i]);
					}
					event.result2=result;
					if(shen.length){
						var list=lib.group.slice(0);
						list.remove('shen');
						for(var i=0;i<list.length;i++){
							list[i]=['','','group_'+list[i]];
						}
						for(var i=0;i<shen.length;i++){
							shen[i]=[shen[i],['请选择神武将的势力',[list,'vcard']],1,true];
						}
						var choose_shen_time=lib.configOL.choose_timeout
						if(lib.configOL.choose_timeout_shen_group){
							choose_shen_time=lib.configOL.choose_timeout_shen_group;
						}
						for(var i=0;i<game.players.length;i++){
							game.players[i].showTimer(parseInt(choose_shen_time)*1000);
						}
						game.me._hide_all_timer=true;
						game.me.chooseButtonOL(shen,function(player,result){
							if(player==game.me) {
								player.groupshen=result.links[0][2].slice(6);
							}
						});
					}
					"step 29"
					if(!result) result={};
					var result2=event.result2;
					game.broadcast(function(result,result2){
						for(var i in result){
							lib.playerOL[i].init(result[i][0],result[i][1],false);
							lib.playerOL[i].group='unknown';
							lib.playerOL[i].classList.add('unseen');
							lib.playerOL[i].classList.add('unseen2');
							if(result2[i]&&result2[i].links) {
							    lib.playerOL[i].groupshen=result2[i].links[0][2].slice(6);
							}
						}
					},result2,result);
					
					for(var i in result2){
						if(!lib.playerOL[i].name){
							lib.playerOL[i].init(result2[i][0],result2[i][1],false);
						}
						if(result[i]&&result[i].links) {
							lib.playerOL[i].groupshen=result[i].links[0][2].slice(6);
						}
					}
					
					if(event.special_identity){
						for(var i in event.special_identity){
							game.zhu.addSkill(i);
						}
					}

					for(var i=0;i<game.players.length;i++){
						// game.zhu has been set at above and it should be skipped here
						// but we need to revert group from previous fake declaration
						if(game.players[i]==game.zhu){
							if(game.zhu.isUnseen()){
								game.zhu.group='unknown';
								game.broadcast(function(player,group){
									player.group='unknown';
								},game.zhu);
							}
							continue;
						}

						game.broadcastAll(function(player){
							player.classList.add('unseen');
							player.classList.add('unseen2');
							if(_status.characterlist){
								_status.characterlist.remove(player.name);
								_status.characterlist.remove(player.name2);
							}
							if(player!=game.me){
								player.node.identity.firstChild.innerHTML='猜';
								player.node.identity.dataset.color='unknown';
								player.node.identity.classList.add('guessing');
							}
							player.hiddenSkills=lib.character[player.name][3].slice(0);
							var hiddenSkills2=lib.character[player.name2][3];
							for(var j=0;j<hiddenSkills2.length;j++){
								player.hiddenSkills.add(hiddenSkills2[j]);
								player.skills.remove(hiddenSkills2[j]);
							}
							for(var j=0;j<player.hiddenSkills.length;j++){
								player.skills.remove(player.hiddenSkills);
								if(!lib.skill[player.hiddenSkills[j]]){
									player.hiddenSkills.splice(j--,1);
								}
							}
							player.group='unknown';
							player.sex='unknown';
							player.name1=player.name;
							player.name='unknown';
							player.node.name.show();
							player.node.name2.show();
							player._group=lib.character[player.name1][1];
							for(var j=0;j<player.hiddenSkills.length;j++){
								player.addSkillTrigger(player.hiddenSkills[j],true);
							}
						},game.players[i]);
					}
					for(var i=0;i<game.players.length;i++){
						if(game.players[i]!=game.zhu){
							game.players[i].showGiveup();
							game.players[i].showRevealCharacter();
						}
					}
					"step 30"
					var liangjiang=[];
					var list=['bumingzhi','mingzhizhujiang','mingzhifujiang','tongshimingzhi',];
					for(var i=0;i<list.length;i++){
						list[i]=['','',list[i]];
					}
					for(var i=0;i<game.players.length;i++){
						if(game.players[i]!=game.zhu){
							liangjiang.push([game.players[i],['是否亮将',[list,'vcard']],1,true]);
						}
					}
					game.me.chooseButtonOL(liangjiang,function(player,result){});
					"step 31"
					for(var i in result){
						if(result[i]&&result[i].links) {
							var choice=result[i].links[0][2];
							switch(choice){
								case 'mingzhizhujiang':lib.playerOL[i].showCharacter(0,true,true);break;
								case 'mingzhifujiang':lib.playerOL[i].showCharacter(1,true,true);break;
								case 'tongshimingzhi':lib.playerOL[i].showCharacter(2,true,true);break;
								default:break;
							}
						}
					}
					"step 32"
					for(var i=0;i<game.players.length;i++){
						if(game.players[i]==game.me){
							game.players[i].showOvertie();
						}
					}
					setTimeout(function(){
						game.broadcastAll(function(){
							ui.arena.classList.remove('choose-character');
						});
					},500);
				});
			},
		},
		translate:{
			group_wei:"魏势力",
			group_shu:"蜀势力",
			group_wu:"吴势力",
			group_qun:"群势力",
			group_key:"键势力",
			group_wei_bg:"魏",
			group_shu_bg:"蜀",
			group_wu_bg:"吴",
			group_qun_bg:"群",
			group_key_bg:"键",
			zhu:"主",
			zhong:"忠",
			mingzhong:"忠",
			nei:"内",
			fan:"反",
			cai:"猜",
			cai2:"猜",
			rZhu:"主",
			rZhong:"忠",
			rNei:"内",
			rYe:"野",
			rZhu2:"主帅",
			rZhong2:"前锋",
			rNei2:"细作",
			rYe2:"野心家",
			bZhu:"主",
			bZhong:"忠",
			bNei:"内",
			bYe:"野",
			bZhu2:"主帅",
			bZhong2:"前锋",
			bNei2:"细作",
			bYe2:"野心家",
			zhu2:"主公",
			zhong2:"忠臣",
			mingzhong2:"明忠",
			nei2:"内奸",
			fan2:"反贼",
			random2:"随机",
			identity_junshi_bg:'师',
			identity_dajiang_bg:'将',
			identity_zeishou_bg:'首',
			identity_junshi:'军师',
			identity_dajiang:'大将',
			identity_zeishou:'贼首',
			ai_strategy_1:'均衡',
			ai_strategy_2:'偏反',
			ai_strategy_3:'偏主',
			ai_strategy_4:'酱油',
			ai_strategy_5:'天使',
			ai_strategy_6:'仇主',
			dongcha:'洞察',
			dongcha_info:'游戏开始时，随机一名反贼的身份对你可见；准备阶段，你可以弃置场上的一张牌',
			sheshen:'舍身',
			sheshen_info:'锁定技，主公处于濒死状态即将死亡时，令主公+1体力上限，回复体力至X点（X为你的体力值数），获得你的所有牌，然后你死亡',
			yexinbilu:'野心毕露',
			woshixiaonei:'我是小内',
			woshixiaonei_info:'村规小内限定技，2选1：1）增加一点体力上限，然后回复一点体力并且摸2张牌；2）获得限定技‘知己知彼’，然后回复一点体力并且摸3张牌。（知己知彼：村规小内限定技，出牌阶段对一名其他角色使用，观看其暗置武将牌。如场上无其它暗将则作废）',
			xiaoneizhibi:'知己知彼',
			xiaoneizhibi_info:'村规小内限定技，出牌阶段对一名其他角色使用，观看其暗置武将牌。如场上无其它暗将则作废',
			xiaoneikongchang:'小内控场',
			xiaoneidantiao:'小内单挑',
			xiaoneihuosheng:'小内获胜',
			kejizhugong:'克己主公',
			kejizhugong_info:'村规主公限定技：主公在第一回合内如果没有对其他角色使用牌，可以跳过弃牌阶段。',
			xiuluozhugong:'修罗主公',
			xiuluozhugong_info:'村规主公限定技：主公第二轮准备阶段，若判定区有牌，可以弃置两张牌，然后弃置判定区内一张与之前弃置的两张牌中任意一张同花色的判定牌。你可以重复此流程。',
			anlezhugong:'安乐主公',
			anlezhugong_info:'村规主公限定技：主公如果在第一轮被乐而且中乐，则手牌上限为体力上限',
			anlezhugong2:'安乐主公',
			shengmingshiliwei:'魏势力',
			shengmingshilishu:'蜀势力',
			shengmingshiliwu:'吴势力',
			shengmingshiliqun:'群势力',
			bumingzhi:'不明置',
			bumingzhi_bg:'否',
			mingzhizhujiang:'明置主将',
			mingzhizhujiang_bg:'主',
			mingzhifujiang:'明置副将',
			mingzhifujiang_bg:'副',
			tongshimingzhi:'全部明置',
			tongshimingzhi_bg:'全',
			_revealCharacterMainDo:'明置主将',
			_revealCharacterViceDo:'明置副将',
			changeCards:'手气卡',
			pickRole:'点将卡',
			pickRole_bg:'将',
			addRole:'选将框',
			addRole_bg:'框',
			changeRole:'换将卡',
			superChangeRole:'超级换将卡',
			superChangeRole_bg:'换',
			superChangeRole_info:'N换N，获取方式：小内获胜',
			fulibi:'杀币',
			birthdaybonus:'生日福利',
		},
		element:{
			content:{
				showCharacter:function(){
					'step 0'
					event.trigger('showCharacterEnd');
					'step 1'
					event.trigger('showCharacterAfter');
				},
			},
			player:{
				getModeState:function(){
					return {
						unseen:this.isUnseen(0),
						unseen2:this.isUnseen(1),
					}
				},
				setModeState:function(info){
					if(info.mode.unseen) this.classList.add('unseen');
					if(info.mode.unseen2) this.classList.add('unseen2');
					if(!info.name) return;
					this.init(info.name1,info.name2,false);
					this.name1=info.name1;
					this.name=info.name;
					this.node.name_seat=ui.create.div('.name.name_seat',get.verticalStr(lib.translate[this.name].slice(0,3)),this);
					if(info.identityShown||(!game.observe&&this==game.me)){
						this.setIdentity(info.identity);
						this.node.identity.classList.remove('guessing');
					}
					else if(game.observe||this!=game.me){
						this.node.identity.firstChild.innerHTML='猜';
						this.node.identity.dataset.color='unknown';
						this.node.identity.classList.add('guessing');
						if(window.decadeUI){
							if(decadeUI.config.campIdentityImageMode){
								this.setIdentity('cai');
							}
						}
					}
					if (window.decadeUI&&info&&info.seat) {
						if (!this.node.seat) this.node.seat = decadeUI.dialog.create('seat', this);
						this.node.seat.innerHTML = get.cnNumber(info.seat, true);
					}
				},
				$dieAfter:function(){
					if(_status.video) return;
					if(!this.node.dieidentity){
						var str;
						if(this.special_identity){
							str=get.translation(this.special_identity);
						}
						else{
							str=get.translation(this.identity+'2');
						}
						var node=ui.create.div('.damage.dieidentity',str,this);
						if(str=='野心家'){
							node.style.fontSize='40px';
						}
						ui.refresh(node);
						node.style.opacity=1;
						this.node.dieidentity=node;
					}
					var trans=this.style.transform;
					if(trans){
						if(trans.indexOf('rotateY')!=-1){
							this.node.dieidentity.style.transform='rotateY(180deg)';
						}
						else if(trans.indexOf('rotateX')!=-1){
							this.node.dieidentity.style.transform='rotateX(180deg)';
						}
						else{
							this.node.dieidentity.style.transform='';
						}
					}
					else{
						this.node.dieidentity.style.transform='';
					}
				},
				dieAfter2:function(source){
					if(_status.mode=='purple'){
						if(source){
							if(this.identity=='rZhu'||this.identity=='bZhu'){
								if(this.identity.slice(0,1)!=source.identity.slice(0,1)) source.recover();
							}
							else if(this.identity=='rZhong'||this.identity=='bZhong'){
								if(this.identity.slice(0,1)!=source.identity.slice(0,1)) source.draw(2);
								else if(this.identity.indexOf('Zhu')==1) this.discard(this.getCards('h'));
							}
							else if(this.identity=='rNei'||this.identity=='bNei'){
								if(this.identity.slice(0,1)==source.identity.slice(0,1)) source.draw(3);
							}
						}
						if(!_status.yeconfirm){
							_status.yeconfirm=true;
							game.addGlobalSkill('yexinbilu');
							game.broadcastAll(function(){
								if(game.me.identity=='rYe'||game.me.identity=='bYe'){
									var player=game.findPlayer(function(current){
										return current!=game.me&&(current.identity=='bYe'||current.identity=='rYe');
									});
									if(player){
										player.showIdentity();
									};
								}
							});
						}
					}
					if(this.identity=='fan'&&source) source.draw(3);
					else if(this.identity=='mingzhong'&&source){
						if(source.identity=='zhu'){
							source.discard(source.getCards('he'));
						}
						else{
							source.draw(3);
						}
					}
					else if(this.identity=='zhong'&&source&&source.identity=='zhu'&&source.isZhu){
						source.discard(source.getCards('he'));
					}
				},
				dieAfter:function(source){
					this.showCharacter(2);
					game.broadcastAll(function(player,identity,identity2){
						player.setIdentity(player.identity);
						player.identityShown=true;
						player.node.identity.classList.remove('guessing');
						if(identity){
							player.node.identity.firstChild.innerHTML=get.translation(identity+'_bg');
							game.log(player,'的身份是','#g'+get.translation(identity));
						}
						else{
							game.log(player,'的身份是','#g'+get.translation(identity2+'2'));
						}
					},this,this.special_identity,this.identity);
					if(this.special_identity){
						game.broadcastAll(function(zhu,identity){
							zhu.removeSkill(identity);
						},game.zhu,this.special_identity);
					}
					game.checkResult();
					if(_status.mode=='purple'){
						var red=[];
						var blue=[];
						game.countPlayer(function(current){
							var identity=current.identity.slice(1);
							if(identity!='Zhu'){
								if(current.identity.indexOf('r')==0)	red.push(current);
								else blue.push(current);
							}
						});
						if(red.length<=1&&blue.length<=1) game.broadcastAll(game.showIdentity);
						return;
					};
					if(game.zhu&&game.zhu.storage.enhance_zhu&&get.population('fan')<3){
						game.zhu.removeSkill(game.zhu.storage.enhance_zhu);
						delete game.zhu.storage.enhance_zhu;
					}
					if(this==game.zhong){
						game.broadcastAll(function(player){
							game.zhu=player;
							game.zhu.identityShown=true;
							game.zhu.ai.shown=1;
							game.zhu.setIdentity();
							game.zhu.isZhu=true;
							game.zhu.node.identity.classList.remove('guessing');
							if(lib.config.animation&&!lib.config.low_performance) game.zhu.$legend();
							delete game.zhong;
							if(_status.clickingidentity&&_status.clickingidentity[0]==game.zhu){
								for(var i=0;i<_status.clickingidentity[1].length;i++){
									_status.clickingidentity[1][i].delete();
									_status.clickingidentity[1][i].style.transform='';
								}
								delete _status.clickingidentity;
							}
						},game.zhu);
						game.delay(2);
						game.zhu.playerfocus(1000);
						_status.event.trigger('zhuUpdate');
					}

					if(!_status.over){
						var giveup;
						if(get.population('fan')+get.population('nei')==1){
							for(var i=0;i<game.players.length;i++){
								if(game.players[i].identity=='fan'||game.players[i].identity=='nei'){
									giveup=game.players[i];break;
								}
							}
						}
						else if(get.population('zhong')+get.population('mingzhong')+get.population('nei')==0){
							giveup=game.zhu;
						}
						if(giveup){
							giveup.showGiveup();
						}
					}

				},
				logAi:function(targets,card){
					if(this.ai.shown==1||this.isMad()) return;
					if(typeof targets=='number'){
						this.ai.shown+=targets;
					}
					else{
						var effect=0,c,shown;
						var info=get.info(card);
						if(info.ai&&info.ai.expose){
							if(_status.event.name=='_wuxie'){
								if(_status.event.source&&_status.event.source.ai.shown){
									this.ai.shown+=0.2;
								}
							}
							else{
								this.ai.shown+=info.ai.expose;
							}
						}
						if(targets.length>0){
							for(var i=0;i<targets.length;i++){
								shown=Math.abs(targets[i].ai.shown);
								if(shown<0.2||targets[i].identity=='nei') c=0;
								else if(shown<0.4) c=0.5;
								else if(shown<0.6) c=0.8;
								else c=1;
								var eff=get.effect(targets[i],card,this);
								effect+=eff*c;
								if(eff==0&&shown==0&&['zhong','rZhong','bZhong'].contains(this.identity)&&targets[i]!=this){
									effect+=0.1;
								}
							}
						}
						if(effect>0){
							if(effect<1) c=0.5;
							else c=1;
							if(targets.length==1&&targets[0]==this);
							else if(targets.length==1) this.ai.shown+=0.2*c;
							else this.ai.shown+=0.1*c;
						}
						else if(effect<0&&this==game.me&&['nei','rYe','bYe'].contains(game.me.identity)){
							if(targets.length==1&&targets[0]==this);
							else if(targets.length==1) this.ai.shown-=0.2;
							else this.ai.shown-=0.1;
						}
					}
					if(this!=game.me) this.ai.shown*=2;
					if(this.ai.shown>0.95) this.ai.shown=0.95;
					if(this.ai.shown<-0.5) this.ai.shown=-0.5;
					if(_status.mode=='purple') return;

					var marknow=(!_status.connectMode&&this!=game.me&&get.config('auto_mark_identity')&&this.ai.identity_mark!='finished');
					// if(true){
						if(marknow&&_status.clickingidentity&&_status.clickingidentity[0]==this){
							for(var i=0;i<_status.clickingidentity[1].length;i++){
								_status.clickingidentity[1][i].delete();
								_status.clickingidentity[1][i].style.transform='';
							}
							delete _status.clickingidentity;
						}
						if(!Array.isArray(targets)){
							targets=[];
						}
						var effect=0,c,shown;
						var zhu=game.zhu;
						if(_status.mode=='zhong'&&!game.zhu.isZhu){
							zhu=game.zhong;
						}
						if(targets.length==1&&targets[0]==this){
							effect=0;
						}
						else if(this.identity!='nei'){
							if(this.ai.shown>0){
								if(this.identity=='fan'){
									effect=-1;
								}
								else{
									effect=1;
								}
							}
						}
						else if(targets.length>0){
							for(var i=0;i<targets.length;i++){
								shown=Math.abs(targets[i].ai.shown);
								if(shown<0.2||targets[i].identity=='nei') c=0;
								else if(shown<0.4) c=0.5;
								else if(shown<0.6) c=0.8;
								else c=1;
								effect+=get.effect(targets[i],card,this,zhu)*c;
							}
						}
						if(this.identity=='nei'){
							if(effect>0){
								if(this.ai.identity_mark=='fan'){
									if(marknow) this.setIdentity();
									this.ai.identity_mark='finished';
								}
								else{
									if(marknow) this.setIdentity('zhong');
									this.ai.identity_mark='zhong';
								}
							}
							else if(effect<0&&get.population('fan')>0){
								if(this.ai.identity_mark=='zhong'){
									if(marknow) this.setIdentity();
									this.ai.identity_mark='finished';
								}
								else{
									if(marknow) this.setIdentity('fan');
									this.ai.identity_mark='fan';
								}
							}
						}
						else if(marknow){
							if(effect>0&&this.identity!='fan'){
								this.setIdentity('zhong');
								this.ai.identity_mark='finished';
							}
							else if(effect<0&&this.identity=='fan'){
								this.setIdentity('fan');
								this.ai.identity_mark='finished';
							}
						}
					// }

				},
				showIdentity:function(){
					this.node.identity.classList.remove('guessing');
					this.identityShown=true;
					this.ai.shown=1;
					this.setIdentity();
					if(this.special_identity){
						this.node.identity.firstChild.innerHTML=get.translation(game.players[i].special_identity+'_bg');
					}
					if(this.identity=='zhu'){
						this.isZhu=true;
					}
					else{
						delete this.isZhu;
					}
					if(_status.clickingidentity){
						for(var i=0;i<_status.clickingidentity[1].length;i++){
							_status.clickingidentity[1][i].delete();
							_status.clickingidentity[1][i].style.transform='';
						}
						delete _status.clickingidentity;
					}
				},
				hideCharacter:function(num,log){
					if(this.isUnseen(2)){
						return;
					}
					game.addVideo('hideCharacter',this,num);
					var skills;
					switch(num){
						case 0:
						if(log!==false) game.log(this,'暗置了主将'+get.translation(this.name1));
						skills=lib.character[this.name][3];
						this.name=this.name2;
						this.sex=lib.character[this.name2][0];
						this.classList.add('unseen');
						break;
						case 1:
						if(log!==false) game.log(this,'暗置了副将'+get.translation(this.name2));
						skills=lib.character[this.name2][3];
						this.classList.add('unseen2');
						break;
					}
					game.broadcast(function(player,name,sex,num,skills){
						player.name=name;
						player.sex=sex;
						switch(num){
							case 0:player.classList.add('unseen');break;
							case 1:player.classList.add('unseen2');break;
						}
						for(var i=0;i<skills.length;i++){
							if(!player.skills.contains(skills[i])) continue;
							player.hiddenSkills.add(skills[i]);
							player.skills.remove(skills[i]);
						}
					},this,this.name,this.sex,num,skills);
					for(var i=0;i<skills.length;i++){
						if(!this.skills.contains(skills[i])) continue;
						this.hiddenSkills.add(skills[i]);
						var info=get.info(skills[i]);
						if(info.ondisable&&info.onremove){
							info.onremove(this);
						}
						this.skills.remove(skills[i]);
					}
					this.checkConflict();
				},
				showCharacter:function(num,log,playAudio){
					var toShow=[];
					if((num==0||num==2)&&this.isUnseen(0)) toShow.add(this.name1);
					if((num==1||num==2)&&this.isUnseen(1)) toShow.add(this.name2);
					if(!toShow.length) return;
					lib.element.player.$showCharacter.apply(this,arguments);
					var next=game.createEvent('showCharacter',false);
					next.player=this;
					next.num=num;
					next.toShow=toShow;
					next._args=arguments;
					next.setContent('showCharacter');
					return next;
				},
				$showCharacter:function(num,log,playAudio){
					if(!this.isUnseen(2)){
						return;
					}
					if(num==0&&!this.isUnseen(0)){
						return;
					}
					if(num==1&&!this.isUnseen(1)){
						return;
					}
					if(num==2){
						if(!this.isUnseen(0)){
							num=1;
						}
						if(!this.isUnseen(1)){
							num=0;
						}
					}
					game.addVideo('showCharacter',this,num);
					var getCharacterSkillWithAudio=function(characters){
						var retSkill='';
						for(var character of characters){
							var info=lib.character[character];
							if(info&&info.length){
								var skills=info[3];
								if(skills&&skills.length){
									for(var skill of skills){
										var skillinfo=lib.skill[skill];
										if(skillinfo&&('audio' in skillinfo)){
											if(skillinfo['zhuSkill']||skillinfo['juexingji']||skillinfo['limited']) return skill;
											if(!retSkill.length) retSkill=skill;
										}
									}
								}
							}
						}
						return retSkill;
					}
					var audioSkill;
					if(playAudio){
						var characters;
						if(num==0) characters=[this.name1];
						else if(num==1) characters=[this.name2];
						else characters=[this.name1,this.name2];
						audioSkill=getCharacterSkillWithAudio(characters);
						game.trySkillAudio(audioSkill,this,true);
					}
					if(this.identity=='unknown'){
						this.group=lib.character[this.name1][1];
						if(get.is.jun(this.name1)&&this.isAlive()){
							this.identity=this.group;
						}
						else{
							this.identity='ye';
						}
						this.setIdentity(this.identity);
						this.ai.shown=1;
						this.node.identity.classList.remove('guessing');

						if(_status.clickingidentity&&_status.clickingidentity[0]==this){
							for(var i=0;i<_status.clickingidentity[1].length;i++){
								_status.clickingidentity[1][i].delete();
								_status.clickingidentity[1][i].style.transform='';
							}
							delete _status.clickingidentity;
						}
						game.addVideo('setIdentity',this,this.identity);
					}
					var skills;

					// adjust maxHp and hp if necessary
					var info1=lib.character[this.name1];
					var infoHp1=get.infoHp(info1[2]);
					var maxHp1=get.infoMaxHp(info1[2]);

					var info2=lib.character[this.name2];
					var infoHp2=get.infoHp(info2[2]);
					var maxHp2=get.infoMaxHp(info2[2]);

					var infoHpToGain=0;
					var maxHpToGain=0;

					var updateRevealCharacterButtons=function(player,updateMain,updateVice){
						if(updateMain){
							if(player==game.me){
								if(ui.revealCharacterMain){
									ui.revealCharacterMain.classList.remove('glow');
									ui.revealCharacterMain.hide();
								}
							}
							else if(player.isOnline2()){
								player.send(function(){
									if(ui.revealCharacterMain){
										ui.revealCharacterMain.classList.remove('glow');
										ui.revealCharacterMain.hide();
									}
								});
							}
						}
						if(updateVice){
							if(player==game.me){
								if(ui.revealCharacterVice){
									ui.revealCharacterVice.classList.remove('glow');
									ui.revealCharacterVice.hide();
								}
							}
							else if(player.isOnline2()){
								player.send(function(){
									if(ui.revealCharacterVice){
										ui.revealCharacterVice.classList.remove('glow');
										ui.revealCharacterVice.hide();
									}
								});
							}
						}
					}

					switch(num){
						case 0:
							if(log!==false) game.log(this,'展示了主将','#b'+this.name1);
							this.name=this.name1;
							skills=lib.character[this.name][3];
							this.sex=lib.character[this.name][0];
							this.smoothAvatar(false,true,true);
							this.classList.remove('unseen');
							infoHpToGain=game.getMaxHpToGain(infoHp1,infoHp2,this.isUnseen(1));
							maxHpToGain=game.getMaxHpToGain(maxHp1,maxHp2,this.isUnseen(1));
							updateRevealCharacterButtons(this,true,false);
							break;
						case 1:
							if(log!==false) game.log(this,'展示了副将','#b'+this.name2);
							skills=lib.character[this.name2][3];
							if(this.sex=='unknown') this.sex=lib.character[this.name2][0];
							if(this.name.indexOf('unknown')==0) this.name=this.name2;
							this.smoothAvatar(true,true,true);
							this.classList.remove('unseen2');
							infoHpToGain=game.getMaxHpToGain(infoHp2,infoHp1,this.isUnseen(0));
							maxHpToGain=game.getMaxHpToGain(maxHp2,maxHp1,this.isUnseen(0));
							updateRevealCharacterButtons(this,false,true);
							break;
						case 2:
							if(log!==false) game.log(this,'展示了主将','#b'+this.name1,'、副将','#b'+this.name2);
							this.name=this.name1;
							skills=lib.character[this.name][3].concat(lib.character[this.name2][3]);
							this.sex=lib.character[this.name][0];
							this.smoothAvatar(false,true,true);
							this.smoothAvatar(true,true,true);
							this.classList.remove('unseen');
							this.classList.remove('unseen2');
							infoHpToGain=Math.max(infoHp1,infoHp2)-4;
							maxHpToGain=Math.max(maxHp1,maxHp2)-4;
							updateRevealCharacterButtons(this,true,true);
							break;
					}
					this.group=lib.character[this.name][1];
					if(this.group=='shen') this.group=this.groupshen;
					game.broadcast(function(player,name,sex,num,group,audioSkill){
						player.group=group;
						player.name=name;
						player.sex=sex;
						switch(num){
							case 0:
								player.smoothAvatar(false,true,true);
								player.classList.remove('unseen');
								break;
							case 1:
								player.smoothAvatar(true,true,true);
								player.classList.remove('unseen2');
								break;
							case 2:
								player.smoothAvatar(false,true,true);
								player.smoothAvatar(true,true,true);
								player.classList.remove('unseen');
								player.classList.remove('unseen2');
								break;
						}
						player.ai.shown=1;
					},this,this.name,this.sex,num,this.group,audioSkill);
					for(var i=0;i<skills.length;i++){
						this.hiddenSkills.remove(skills[i]);
						this.addSkill(skills[i]);
					}

					// adjust maxHp and hp if necessary
					if(maxHpToGain>0){
						this.gainMaxHp(maxHpToGain);
					}
					if(infoHpToGain>0){
						this.recover(infoHpToGain);
					}

					this.checkConflict();
				},
			}
		},
		get:{
			rawAttitude:function(from,to){
				var x=0,num=0,temp,i;
				if(_status.ai.customAttitude){
					for(i=0;i<_status.ai.customAttitude.length;i++){
						temp=_status.ai.customAttitude[i](from,to);
						if(temp!=undefined){
							x+=temp;
							num++;
						}
					}
				}
				if(num){
					return x/num;
				}
				if(_status.mode=='purple'){
					var real=get.realAttitude(from,to);
					if(from==to||to.identityShown||from.storage.zhibi&&from.storage.zhibi.contains(to)||(_status.yeconfirm&&['rYe','bYe'].contains(to.identity)&&['rYe','bYe'].contains(to.identity))) return real*1.1;
					return ((to.ai.shown+0.1)*real+(from.identity.slice(0,1)==to.identity.slice(0,1)?3:-3)*(1-to.ai.shown))
				}
				var difficulty=0;
				if(to==game.me) difficulty=2-get.difficulty();
				if(from==to||to.identityShown||(from.storage.dongcha==to)||to.identityShown||from.storage.zhibi&&from.storage.zhibi.contains(to)){
					return get.realAttitude(from,to)+difficulty*1.5;
				}
				else{
					if(from.identity=='zhong'&&to.ai.shown==0&&from.ai.tempIgnore&&
						!from.ai.tempIgnore.contains(to)){
						for(var i=0;i<game.players.length;i++){
							if(game.players[i].ai.shown==0&&game.players[i].identity=='fan'){
								return -0.1+difficulty*1.5;
							}
						}
					}
					var aishown=to.ai.shown;
					if(to.identity=='nei'&&to.ai.shown<1&&(to.ai.identity_mark=='fan'||to.ai.identity_mark=='zhong')){
						aishown=0.5;
					}
					else if(aishown==0&&to.identity!='fan'&&to.identity!='zhu'){
						var fanshown=true;
						for(var i=0;i<game.players.length;i++){
							if(game.players[i].identity=='fan'&&game.players[i].ai.shown==0&&game.players[i]!=from){
								fanshown=false;break;
							}
						}
						if(fanshown) aishown=0.3;
					}
					return get.realAttitude(from,to)*aishown+difficulty*1.5;
				}
			},
			realAttitude:function(from,to){
				if(_status.mode=='purple'){
					if(['rZhu','rZhong','bNei'].contains(from.identity)){
						if(to.identity=='rZhu') return 8;
						if(['rZhong','bNei'].contains(to.identity)) return 7;
						return -7;
					}
					else if(['bZhu','bZhong','rNei'].contains(from.identity)){
						if(to.identity=='bZhu') return 8;
						if(['bZhong','rNei'].contains(to.identity)) return 7;
						return -7;
					}
					else{
						if(['rYe','bYe'].contains(to.identity)) return 7;
						if(['rZhu','bZhu'].contains(to.identity)&&game.hasPlayer(function(current){
							return ['rZhong','bZhong','rNei','bNei'].contains(current.identity);
						})) return 6.5;
						return -7;
					}
				}
				if(!game.zhu){
					if(from.identity=='nei'||to.identity=='nei') return -1;
					if(from.identity==to.identity) return 6;
					return -6;
				}
				var situation=get.situation();
				var identity=from.identity;
				var identity2=to.identity;
				if(identity2=='zhu'&&!to.isZhu){
					identity2='zhong';
					if(from==to) return 10;
				}
				if(from!=to&&to.identity=='nei'&&to.ai.shown<1&&(to.ai.identity_mark=='fan'||to.ai.identity_mark=='zhong')){
					identity2=to.ai.identity_mark;
				}
				if(from.identity!='nei'&&from!=to&&get.population('fan')==0&&identity2=='zhong'){
					for(var i=0;i<game.players.length;i++){
						if(game.players[i].identity=='nei'&&
						game.players[i].ai.identity_mark=='zhong'&&
						game.players[i].ai.shown<1){
							identity2='nei';break;
						}
					}
				}
				var zhongmode=false;
				if(!game.zhu.isZhu){
					zhongmode=true;
				}
				switch(identity){
					case 'zhu':
						switch(identity2){
							case 'zhu': return 10;
							case 'zhong':case 'mingzhong': return 6;
							case 'nei':
								if(game.players.length==2) return -10;
								if(to.identity=='zhong') return 0;
								if(get.population('fan')==0){
									if(to.ai.identity_mark=='zhong'&&to.ai.shown<1) return 0;
									return -0.5;
								}
								if(zhongmode&&to.ai.sizhong&&to.ai.shown<1) return 6;
								if(get.population('fan')==1&&get.population('nei')==1&&game.players.length==3){
									var fan;
									for(var i=0;i<game.players.length;i++){
										if(game.players[i].identity=='fan'){
											fan=game.players[i];break;
										}
									}
									if(fan){
										if(to.hp>1&&to.hp>fan.hp&&to.countCards('he')>fan.countCards('he')){
											return -3;
										}
									}
									return 0;
								}
								if(situation>1) return 0;
								return Math.min(3,get.population('fan'));
							case 'fan':
								if(get.population('fan')==1&&get.population('nei')==1&&game.players.length==3){
									var nei;
									for(var i=0;i<game.players.length;i++){
										if(game.players[i].identity=='nei'){
											nei=game.players[i];break;
										}
									}
									if(nei){
										if(nei.hp>1&&nei.hp>to.hp&&nei.countCards('he')>to.countCards('he')){
											return 0;
										}
									}
									return -3;
								}
								return -4;
						}
						break;
					case 'zhong':case 'mingzhong':
						switch(identity2){
							case 'zhu': return 10;
							case 'zhong':case 'mingzhong': return 4;
							case 'nei':
								if(get.population('fan')==0) return -2;
								if(zhongmode&&to.ai.sizhong&&to.ai.shown<1) return 6;
								return Math.min(3,-situation);
							case 'fan': return -8;
						}
						break;
					case 'nei':
						if(identity2=='zhu'&&game.players.length==2) return -10;
						if(from!=to&&identity2!='zhu'&&game.players.length==3) return -8;
						var strategy=get.aiStrategy();
						if(strategy==4){
							if(from==to) return 10;
							return 0;
						}
						var num;
						switch(identity2){
							case 'zhu':
								if(strategy==6) return -1;
								if(strategy==5) return 10;
								if(to.hp<=0) return 10;
								if(get.population('fan')==1){
									var fan;
									for(var i=0;i<game.players.length;i++){
										if(game.players[i].identity=='fan'){
											fan=game.players[i];break;
										}
									}
									if(fan){
										if(to.hp>1&&to.hp>fan.hp&&to.countCards('he')>fan.countCards('he')){
											return -3;
										}
									}
									return 0;
								}
								else{
									if(situation>1||get.population('fan')==0) num=0;
									else num=get.population('fan')+Math.max(0,3-game.zhu.hp);
								}
								if(strategy==2) num--;
								if(strategy==3) num++;
								return num;
							case 'zhong':
								if(strategy==5) return Math.min(0,-situation);
								if(strategy==6) return Math.max(-1,-situation);
								if(get.population('fan')==0) num=-5;
								else if(situation<=0) num=0;
								else if(game.zhu&&game.zhu.hp<2) num=0;
								else if(game.zhu&&game.zhu.hp==2) num=-1;
								else if(game.zhu&&game.zhu.hp<=2&&situation>1) num=-1;
								else num=-2;
								if(zhongmode&&situation<2){
									num=4;
								}
								if(strategy==2) num--;
								if(strategy==3) num++;
								return num;
							case 'mingzhong':
								if(zhongmode){
									if(from.ai.sizhong==undefined){
										from.ai.sizhong=(Math.random()<0.5);
									}
									if(from.ai.sizhong) return 6;
								}
								if(strategy==5) return Math.min(0,-situation);
								if(strategy==6) return Math.max(-1,-situation);
								if(get.population('fan')==0) num=-5;
								else if(situation<=0) num=0;
								else num=-3;
								if(strategy==2) num--;
								if(strategy==3) num++;
								return num;
							case 'nei':
								if(from==to) return 10;
								if(from.ai.friend.contains(to)) return 5;
								if(get.population('fan')+get.population('zhong')>0) return 0;
								return -5;
							case 'fan':
								if(strategy==5) return Math.max(-1,situation);
								if(strategy==6) return Math.min(0,situation);
								if((game.zhu&&game.zhu.hp<=2&&situation<0)||situation<-1) num=-3;
								else if(situation<0||get.population('zhong')+get.population('mingzhong')==0) num=-2;
								else if((game.zhu&&game.zhu.hp>=4&&situation>0)||situation>1) num=1;
								else num=0;
								if(strategy==2) num++;
								if(strategy==3) num--;
								return num;
						}
						break;
					case 'fan':
						switch(identity2){
							case 'zhu':
								if(get.population('nei')>0){
									if(situation==1) return -6;
									if(situation>1) return -5;
								}
								return -8;
							case 'zhong':
								if(!zhongmode&&game.zhu.hp>=3&&to.hp==1){
									return -10;
								}
								return -7;
							case 'mingzhong':return -5;
							case 'nei':
								if(zhongmode&&to.ai.sizhong) return -7;
								if(get.population('fan')==1) return 0;
								if(get.population('zhong')+get.population('mingzhong')==0) return -7;
								if(game.zhu&&game.zhu.hp<=2) return -1;
								return Math.min(3,situation);
							case 'fan': return 5;
						}
				}
			},
			situation:function(absolute){
				var i,j,player;
				var zhuzhong=0,total=0,zhu,fan=0;
				for(i=0;i<game.players.length;i++){
					player=game.players[i];
					var php=player.hp;
					if(player.hasSkill('benghuai')&&php>4){
						php=4;
					}
					else if(php>6){
						php=6;
					}
					j=player.countCards('h')+player.countCards('e')*1.5+php*2;
					if(player.identity=='zhu'){
						zhuzhong+=j*1.2+5;
						total+=j*1.2+5;
						zhu=j;
					}
					else if(player.identity=='zhong'||player.identity=='mingzhong'){
						zhuzhong+=j*0.8+3;
						total+=j*0.8+3;
					}
					else if(player.identity=='fan'){
						zhuzhong-=j+4;
						total+=j+4;
						fan+=j+4;
					}
				}
				if(absolute) return zhuzhong;
				var result=parseInt(10*Math.abs(zhuzhong/total));
				if(zhuzhong<0) result=-result;
				if(!game.zhong){
					if(zhu<12&&fan>30) result--;
					if(zhu<6&&fan>15) result--;
					if(zhu<4) result--;
				}
				return result;
			},
		},
		skill:{
			yexinbilu:{
				enable:'phaseUse',
				filter:function(event,player){
					return player.identity=='rYe'||player.identity=='bYe';
				},
				skillAnimation:'legend',
				animationColor:'thunder',
				content:function(){
					game.removeGlobalSkill('yexinbilu');
					player.yexinbilu();
				},
				ai:{
					order:10,
					result:{
						player:function(player){
							return 1-game.countPlayer(function(current){
								return current!=player&&(current.identity=='rYe'||current.identity=='bYe')&&(current==game.me||current.isOnline());
							})
						},
					},
				},
			},
			woshixiaonei:{
				audio:['jianxiong',2],
				trigger:{global:'revealXiaonei',player:['phaseBeginStart','chooseToUseBefore']},
				skillAnimation:'legend',
				animationColor:'thunder',
				filter:function(event,player){
					if(!player.hiddenSkills.contains('woshixiaonei')) return false;
					if(event.name=='revealXiaonei'||event.name=='chooseToUse'&&event.type=='dying') return true;
					// only for AI to trigger
					return !player.isOnline2()&&player!=game.me&&(event.name=='phasing'||event.type=='dying');
				},
				content:function(){
					'step 0'
					if(!player.hiddenSkills.contains('woshixiaonei')) {
						event.finish();
						return;
					}
					if(player==game.me){
						ui.revealXiaonei.classList.remove('glow');
						ui.revealXiaonei.hide();
					}
					else if(player.isOnline2()){
						player.send(function(){
							ui.revealXiaonei.classList.remove('glow');
							ui.revealXiaonei.hide();
						});
					}
					player.chooseControlList(true,function(event,player){
						return 0;
					},
					['增加一点体力上限，然后回复一点体力并且摸2张牌','获得限定技‘知己知彼’，然后回复一点体力并且摸3张牌。（知己知彼：村规小内限定技，出牌阶段对一名其他角色使用，观看其暗置武将牌。如场上无其它暗将则作废）']);

					'step 1'
					var toDraw;
					if(result.index==0){
						toDraw=2;
						player.gainMaxHp();
					}
					else{
						toDraw=3;
						game.broadcastAll(function(player){
							player.addSkill('xiaoneizhibi');
						},player);
					}
					player.recover();
					player.draw(toDraw);
					game.broadcastAll(function(player){
						player.showIdentity();
					},player);
					player.removeSkill('woshixiaonei');
				},
				ai:{
					order:10,
					result:{
						player:function(player){
							return 1;
						},
					},
				},
				oncancel:function(event,player){
					var isButtonTriggered=event&&event.name=='revealXiaonei';
					if(!isButtonTriggered||player.storage.buttonAttempted) return;
					player.storage.buttonAttempted=true;
					if(player.isOnline2()){
						player.send(function(){
							ui.revealXiaonei.classList.add('glow');
							ui.revealXiaonei.show();
						})
					}
					else if(player==game.me){
						ui.revealXiaonei.classList.add('glow');
						ui.revealXiaonei.show();
					}
				},
			},
			xiaoneizhibi:{
				limited:true,
				audio:'shangyi',
				enable:'phaseUse',
				filter:function(event,player){
					var useful=game.hasPlayer(function(current){
						return current!=player&&current.isUnseen(2);
					});
					if(!useful) {
						game.broadcastAll(function(player){
							player.removeSkill('xiaoneizhibi');
						},player);
					}
					return useful;
				},
				filterTarget:function(card,player,target){
					if(player==target) return false;
					return (target.isUnseen(2));
				},
				content:function(){
					"step 0"
					var content;
					var str=get.translation(target)+'的';
					var nameToView=[];
					if(target.isUnseen(0)) nameToView.push(target.name1);
					if(target.isUnseen(1)) nameToView.push(target.name2);
					content=[str+'武将',[nameToView,'character']];
					game.log(player,'观看了',target,'的武将');
					player.chooseControl('ok').set('dialog',content);
					game.broadcastAll(function(player){
						player.removeSkill('xiaoneizhibi');
					},player);
				},
				ai:{
					order:10,
					result:{
						player:function(player,target){
							return 1;
						}
					}
				}
			},
			xiaoneikongchang:{
				trigger:{global:['die','awardXiaoneikongchang']},
				forced:true,
				skillAnimation:'legend',
				animationColor:'thunder',
				filter:function (event,player){
					if(!game.isARealGame()) return false;
					if(player.storage.xiaoneikongchangUsed) return false;
					var shouldDo=event.name=='awardXiaoneikongchang'||(game.players.length==4&&game.zhu.isAlive()&&get.population('nei')>0&&get.population('zhong')<2);
					if(shouldDo&&!player.identityShown){
						var info=lib.skill['xiaoneikongchang'];
						info.popup=false;
						delete info.skillAnimation;
						delete info.animationColor;
					}
					return shouldDo;
				},
				content:function(){
					'step 0'
					player.storage.xiaoneikongchangUsed=true;
					if(!player.identityShown){
						player.$fullscreenpop('小内控场','thunder');
					}
					if(player.nickname&&player.nickname!='无名玩家'){
						setTimeout(function(){
							game.updateBonusBalance(player,lib.bonusKeyFulibi,lib.config.fulibibonus_unit/2);
						},2000);
					}
				},
				ai:{
					order:10,
					result:{
						player:function(player){
							return 1;
						},
					},
				},
			},
			xiaoneidantiao:{
				unique:true,
				mark:false,
				frequent:true,
				limited:true,
				audio:false,
				trigger:{global:'die'},
				skillAnimation:'legend',
				animationColor:'thunder',
				filter:function (event,player){
					// activate xiaonei bonus if nei is in 1v1
					return game.players.length==2&&player.identity=='nei';
				},
				content:function(){
					'step 0'
					player.awakenSkill('xiaoneidantiao');
					if(player.nickname&&player.nickname!='无名玩家'){
						game.updateBonusBalance(player,lib.bonusKeyFulibi,lib.config.fulibibonus_unit);
					}
				},
				ai:{
					order:10,
					result:{
						player:function(player){
							return 1;
						},
					},
				},
			},
			xiaoneihuosheng:{
				unique:true,
				mark:false,
				frequent:true,
				limited:true,
				audio:false,
				trigger:{global:'dieBefore'},
				skillAnimation:'legend',
				animationColor:'thunder',
				filter:function (event,player){
					// activate xiaonei dianjiang bonus if nei wins
					return game.players.length==2&&event.player.identity!='nei';
				},
				content:function(){
					'step 0'
					player.awakenSkill('xiaoneihuosheng');
					if(player.nickname&&player.nickname!='无名玩家'){
						setTimeout(function(){
							game.updateBonusBalance(player,lib.bonusKeyFulibi,lib.config.fulibibonus_unit*2);
						},2000);
					}
				},
				ai:{
					order:10,
					result:{
						player:function(player){
							return 1;
						},
					},
				},
			},
			/*
			_xiaoneiaozhan:{
				trigger:{global:'die'},
				forced:true,
				priority:22,
				filter:function (event,player){
					if(game.zhu.isAlive()&&get.population('fan')==0&&get.population('zhong')==1&&get.population('nei')==1){
						return true;
					}
					return false;
				},
				content:function (){
					_status._xiaoneiaozhan=true;
					player.$fullscreenpop('小内鏖战','fire');
					if(player==game.zhu){
						game.broadcastAll(function(){
							ui.xiaoneiaozhanInfo=ui.create.system('小内鏖战',null);
							lib.setPopped(ui.xiaoneiaozhanInfo,function(){
								var uiintro=ui.create.dialog('hidden');
								uiintro.add('小内鏖战');
								var list=[
									'当游戏只剩主忠内三名角色时，如果主公首先阵亡，游戏继续且最后存活的角色获胜。'
								];
								var intro='<ul style="text-align:left;margin-top:0;width:450px">';
								for(var i=0;i<list.length;i++){
									intro+='<li>'+list[i];
								}
								intro+='</ul>'
								uiintro.add('<div class="text center">'+intro+'</div>');
								var ul=uiintro.querySelector('ul');
								if(ul){
									ul.style.width='180px';
								}
								uiintro.add(ui.create.div('.placeholder'));
								return uiintro;
							},250);
						});
					}
				},
			},
			*/
			kejizhugong:{
				audio:'keji',
				unique:true,
				limited:true,
				skillAnimation:'legend',
				animationColor:'thunder',
				trigger:{player:['phaseDiscardBefore','phaseAfter']},
				frequent:function(event,player){
					return player.needsToDiscard();
				},
				filter:function(event,player){
					if(event.name=='phaseDiscard'&&game.roundNumber==1&&player==game.zhu){
						var usedCards=player.getHistory('useCard',function(evt){
							if(evt.targets&&evt.targets.length&&evt.isPhaseUsing()){
								var targets=evt.targets.slice(0);
								while(targets.contains(player)) targets.remove(player);
								return targets.length>0;
							}
							return false;
						});
						if(usedCards.length==0) {
							return true;
						}
					}
					game.broadcastAll(function(player){
						player.removeSkill('kejizhugong');
					},player);
					return false;
				},
				content:function(){
					player.awakenSkill('kejizhugong');
					game.broadcastAll(function(player){
						player.removeSkill('kejizhugong');
					},player);
					trigger.cancel();
				},
				oncancel:function(event,player){
					game.broadcastAll(function(player){
						player.removeSkill('kejizhugong');
					},player);
				},
				ai:{
					order:10,
					result:{
						player:function(player){
							return 1;
						},
					},
				},
			},
			xiuluozhugong:{
				audio:['xiuluo',2],
				limited:true,
				skillAnimation:'legend',
				animationColor:'thunder',
				trigger:{player:['phaseZhunbeiBegin','phaseAfter']},
				filter:function(event,player){
					if(event.name=='phaseZhunbei'&&game.roundNumber==2){
						return player.countCards('j')>0&&player.countCards('he')>=2;
					}
					if(event.name=='phase'&&game.roundNumber>=2){
						game.broadcastAll(function(player){
							player.removeSkill('xiuluozhugong');
						},player);
					}
					return false;
				},
				ai:{
					order:10,
					result:{
						player:function(player){
							return 1;
						},
					}
				},
				content:function(){
					"step 0"
					var next=player.discardPlayerCard(player,3,'hej','是否发动【修罗主公】来弃置判定牌？').set('filterButton',function(button){
						var player=_status.event.player;
						var card=button.link;
						if(!lib.filter.cardDiscardable(card,player)) return false;
						var suitj='';
						var suithe=[];
						for(var selected of ui.selected.buttons){
							var selectedSuit=get.suit(selected.link,player);
							switch(get.position(selected.link)){
								case 'j':
									suitj=selectedSuit;
									break;
								default:
									suithe.push(selectedSuit);
									break;
							}
						}
						if(suithe.length==2){
							if(get.position(card)!='j') return false;
						}
						if(suitj){
							if(!'he'.includes(get.position(card))) return false;
						}
						if(ui.selected.buttons.length==2){
							var nextSuit=get.suit(card,player);
							if(get.position(card)=='j') suitj=nextSuit;
							else suithe.push(nextSuit);
							return suithe.includes(suitj);
						}
						return true;
					}).set('ai',function(button){
						var card=button.link;
						var lebuSuit='';
						var bingliangSuit='';
						game.needDiscardLebu=game.needDiscardLebu||false;
						if(arguments&&arguments.length>1){
							for(var b of arguments[1]){
								var c=b.link;
								if(get.position(c)=='j'){
									var s=get.suit(c);
									var judgeType=c.viewAs||c.name;
									if(judgeType=='lebu') lebuSuit=s;
									else if(judgeType=='bingliang') bingliangSuit=s;
								}
							}
							for(var b of arguments[1]){
								var c=b.link;
								if('he'.includes(get.position(c))&&get.suit(c)==lebuSuit){
									game.needDiscardLebu=true;
									break;
								}
							}
						}
						if('he'.includes(get.position(card))){
							if(game.needDiscardLebu){
								if(get.suit(card)==lebuSuit) return 100-get.value(card);
								else return 70-get.value(card);
							}
							else if(bingliangSuit){
								if(get.suit(card)==bingliangSuit) return 50-get.value(card);
							}
							return 11-get.value(card);
						}
						var curJudgeType=card.viewAs||card.name;
						if(curJudgeType=='lebu') return game.needDiscardLebu?100:-1;
						if(curJudgeType=='bingliang') return 50;
						return -1;
					});
					next.logSkill='xiuluo';
					"step 1"
					if(result.bool&&player.countCards('j')) event.goto(0);
					"step 2"
					game.broadcastAll(function(player){
						player.removeSkill('xiuluozhugong');
					},player);
				},
				oncancel:function(event,player){
					game.broadcastAll(function(player){
						player.removeSkill('xiuluozhugong');
					},player);
				},
			},
			anlezhugong:{
				audio:'guose',
				limited:true,
				skillAnimation:'legend',
				animationColor:'thunder',
				trigger:{player:['judgeEnd','phaseAfter']},
				filter:function(event,player){
					if(event.name=='phase'){
						if(game.roundNumber>=2){
							game.broadcastAll(function(player){
								player.removeSkill('anlezhugong');
							},player);
						}
					}else if(event.name=='judge'){
						if(game.roundNumber==2&&player==game.zhu&&event.judgestr=='乐不思蜀'){
							if(event.result.bool==false){
								return true;
							}
							game.broadcastAll(function(player){
								player.removeSkill('anlezhugong');
							},player);
						}
					}
					return false;
				},
				ai:{
					order:10,
					result:{
						player:function(player){
							return 1;
						},
					}
				},
				content:function(){
					game.broadcastAll(function(player){
						player.removeSkill('anlezhugong');
					},player);
					player.addTempSkill('anlezhugong2');
				},
				oncancel:function(event,player){
					game.broadcastAll(function(player){
						player.removeSkill('anlezhugong');
					},player);
				},
			},
			anlezhugong2:{
				audio:'guose',
				forced:true,
				trigger:{player:'phaseDiscardBefore'},
				content:function(){},
				ai:{
					order:10,
					result:{
						player:function(player){
							return 1;
						},
					}
				},
				mod:{
					maxHandcardBase:function(player,num){
						return player.maxHp;
					}
				}
			},
			shengmingshiliwei:{
				unique:true,
				mark:false,
				frequent:true,
				limited:true,
				audio:false,
				trigger:{global:'declareGroup'},
				skillAnimation:'legend',
				animationColor:'water',
				content:function(){
					'step 0'
					player.awakenSkill('shengmingshiliwei');
					game.broadcastAll(function(player){
						player.removeSkill('shengmingshiliwei');
					},player);
				},
			},
			shengmingshilishu:{
				unique:true,
				mark:false,
				frequent:true,
				limited:true,
				audio:false,
				trigger:{global:'declareGroup'},
				skillAnimation:'legend',
				animationColor:'soil',
				content:function(){
					'step 0'
					player.awakenSkill('shengmingshilishu');
					game.broadcastAll(function(player){
						player.removeSkill('shengmingshilishu');
					},player);
				},
			},
			shengmingshiliwu:{
				unique:true,
				mark:false,
				frequent:true,
				limited:true,
				audio:false,
				trigger:{global:'declareGroup'},
				skillAnimation:'legend',
				animationColor:'wood',
				content:function(){
					'step 0'
					player.awakenSkill('shengmingshiliwu');
					game.broadcastAll(function(player){
						player.removeSkill('shengmingshiliwu');
					},player);
				},
			},
			shengmingshiliqun:{
				unique:true,
				mark:false,
				frequent:true,
				limited:true,
				audio:false,
				trigger:{global:'declareGroup'},
				skillAnimation:'legend',
				animationColor:'metal',
				content:function(){
					'step 0'
					player.awakenSkill('shengmingshiliqun');
					game.broadcastAll(function(player){
						player.removeSkill('shengmingshiliqun');
					},player);
				},
			},
			identity_junshi:{
				name:'军师',
				mark:true,
				intro:{
					content:'准备阶段开始时，可以观看牌堆顶的三张牌，然后将这些牌以任意顺序置于牌堆顶或牌堆底'
				},
				trigger:{player:'phaseZhunbeiBegin'},
				silent:true,
				content:function(){
					"step 0"
					if(player.isUnderControl()){
						game.swapPlayerAuto(player);
					}
					var num=3;
					var cards=get.cards(num);
					event.cards=cards;
					var switchToAuto=function(){
						_status.imchoosing=false;
						if(event.dialog) event.dialog.close();
						if(event.control) event.control.close();
						var top=[];
						var judges=player.getCards('j');
						var stopped=false;
						if(!player.countCards('h','wuxie')){
							for(var i=0;i<judges.length;i++){
								var judge=get.judge(judges[i]);
								cards.sort(function(a,b){
									return judge(b)-judge(a);
								});
								if(judge(cards[0])<0){
									stopped=true;break;
								}
								else{
									top.unshift(cards.shift());
								}
							}
						}
						var bottom;
						if(!stopped){
							cards.sort(function(a,b){
								return get.value(b,player)-get.value(a,player);
							});
							while(cards.length){
								if(get.value(cards[0],player)<=5) break;
								top.unshift(cards.shift());
							}
						}
						bottom=cards;
						for(var i=0;i<top.length;i++){
							ui.cardPile.insertBefore(top[i],ui.cardPile.firstChild);
						}
						for(i=0;i<bottom.length;i++){
							ui.cardPile.appendChild(bottom[i]);
						}
						player.popup(get.cnNumber(top.length)+'上'+get.cnNumber(bottom.length)+'下');
						game.log(player,'将'+get.cnNumber(top.length)+'张牌置于牌堆顶');
						game.delay(2);
					};
					var chooseButton=function(online,player,cards){
						var event=_status.event;
						player=player||event.player;
						cards=cards||event.cards;
						event.top=[];
						event.bottom=[];
						event.status=true;
						event.dialog=ui.create.dialog('按顺序选择置于牌堆顶的牌（先选择的在上）',cards);
						for(var i=0;i<event.dialog.buttons.length;i++){
							event.dialog.buttons[i].classList.add('pointerdiv');
						}
						event.switchToAuto=function(){
							event._result='ai';
							event.dialog.close();
							event.control.close();
							_status.imchoosing=false;
						},
						event.control=ui.create.control('ok','pileTop','pileBottom',function(link){
							var event=_status.event;
							if(link=='ok'){
								if(online){
									event._result={
										top:[],
										bottom:[]
									}
									for(var i=0;i<event.top.length;i++){
										event._result.top.push(event.top[i].link);
									}
									for(var i=0;i<event.bottom.length;i++){
										event._result.bottom.push(event.bottom[i].link);
									}
								}
								else{
									var i;
									for(i=0;i<event.top.length;i++){
										ui.cardPile.insertBefore(event.top[i].link,ui.cardPile.firstChild);
									}
									for(i=0;i<event.bottom.length;i++){
										ui.cardPile.appendChild(event.bottom[i].link);
									}
									for(i=0;i<event.dialog.buttons.length;i++){
										if(event.dialog.buttons[i].classList.contains('glow')==false&&
											event.dialog.buttons[i].classList.contains('target')==false)
										ui.cardPile.appendChild(event.dialog.buttons[i].link);
									}
									player.popup(get.cnNumber(event.top.length)+'上'+get.cnNumber(event.cards.length-event.top.length)+'下');
									game.log(player,'将'+get.cnNumber(event.top.length)+'张牌置于牌堆顶');
								}
								event.dialog.close();
								event.control.close();
								game.resume();
								_status.imchoosing=false;
							}
							else if(link=='pileTop'){
								event.status=true;
								event.dialog.content.childNodes[0].innerHTML='按顺序选择置于牌堆顶的牌';
							}
							else{
								event.status=false;
								event.dialog.content.childNodes[0].innerHTML='按顺序选择置于牌堆底的牌';
							}
						})
						for(var i=0;i<event.dialog.buttons.length;i++){
							event.dialog.buttons[i].classList.add('selectable');
						}
						event.custom.replace.button=function(link){
							var event=_status.event;
							if(link.classList.contains('target')){
								link.classList.remove('target');
								event.top.remove(link);
							}
							else if(link.classList.contains('glow')){
								link.classList.remove('glow');
								event.bottom.remove(link);
							}
							else if(event.status){
								link.classList.add('target');
								event.top.unshift(link);
							}
							else{
								link.classList.add('glow');
								event.bottom.push(link);
							}
						}
						event.custom.replace.window=function(){
							for(var i=0;i<_status.event.dialog.buttons.length;i++){
								_status.event.dialog.buttons[i].classList.remove('target');
								_status.event.dialog.buttons[i].classList.remove('glow');
								_status.event.top.length=0;
								_status.event.bottom.length=0;
							}
						}
						game.pause();
						game.countChoose();
					};
					event.switchToAuto=switchToAuto;

					if(event.isMine()){
						chooseButton();
						event.finish();
					}
					else if(event.isOnline()){
						event.player.send(chooseButton,true,event.player,event.cards);
						event.player.wait();
						game.pause();
					}
					else{
						event.switchToAuto();
						event.finish();
					}
					"step 1"
					if(event.result=='ai'||!event.result){
						event.switchToAuto();
					}
					else{
						var top=event.result.top||[];
						var bottom=event.result.bottom||[];
						for(var i=0;i<top.length;i++){
							ui.cardPile.insertBefore(top[i],ui.cardPile.firstChild);
						}
						for(i=0;i<bottom.length;i++){
							ui.cardPile.appendChild(bottom[i]);
						}
						for(i=0;i<event.cards.length;i++){
							if(!top.contains(event.cards[i])&&!bottom.contains(event.cards[i])){
								ui.cardPile.appendChild(event.cards[i]);
							}
						}
						player.popup(get.cnNumber(top.length)+'上'+get.cnNumber(event.cards.length-top.length)+'下');
						game.log(player,'将'+get.cnNumber(top.length)+'张牌置于牌堆顶');
						game.delay(2);
					}
				}
			},
			identity_dajiang:{
				name:'大将',
				mark:true,
				intro:{
					content:'手牌上限+1'
				},
				mod:{
					maxHandcard:function(player,num){
						return num+1;
					}
				}
			},
			identity_zeishou:{
				name:'贼首',
				mark:true,
				intro:{
					content:'手牌上限-1'
				},
				mod:{
					maxHandcard:function(player,num){
						return num-1;
					}
				}
			},
			dongcha:{
				trigger:{player:'phaseBegin'},
				direct:true,
				unique:true,
				filter:function(event,player){
					return game.hasPlayer(function(current){
						return current.countCards('ej');
					});
				},
				forceunique:true,
				content:function(){
					'step 0'
					player.chooseTarget(get.prompt('dongcha'),function(card,player,target){
						return target.countCards('ej')>0;
					}).set('ai',function(target){
						var player=_status.event.player;
						var att=get.attitude(player,target);

						if(att>0){
							var js=target.getCards('j');
							if(js.length){
								var jj=js[0].viewAs?{name:js[0].viewAs}:js[0];
								if(jj.name=='guohe'||js.length>1||get.effect(target,jj,target,player)<0){
									return 2*att;
								}
							}
							if(target.getEquip('baiyin')&&target.isDamaged()&&
								get.recoverEffect(target,player,player)>0){
								if(target.hp==1&&!target.hujia) return 1.6*att;
								if(target.hp==2) return 0.01*att;
								return 0;
							}
						}
						var es=target.getCards('e');
						var noe=target.hasSkillTag('noe');
						var noe2=(es.length==1&&es[0].name=='baiyin'&&target.isDamaged());
						if(noe||noe2) return 0;
						if(att<=0&&!es.length) return 1.5*att;
						return -1.5*att;
					});
					'step 1'
					if(result.bool){
						event.target=result.targets[0];
						event.target.addExpose(0.1);
						player.logSkill('dongcha',event.target);
						game.delayx();
					}
					else{
						event.finish();
					}
					'step 2'
					if(event.target){
						player.discardPlayerCard('ej',true,event.target);
					}
				},
				group:['dongcha_begin','dongcha_log'],
				subSkill:{
					begin:{
						trigger:{global:'gameStart'},
						forced:true,
						popup:false,
						content:function(){
							var list=[];
							for(var i=0;i<game.players.length;i++){
								if(game.players[i].identity=='fan'){
									list.push(game.players[i]);
								}
							}
							var target=list.randomGet();
							player.storage.dongcha=target;
							if(!_status.connectMode){
								if(player==game.me){
									target.setIdentity('fan');
									target.node.identity.classList.remove('guessing');
									target.fanfixed=true;
									player.line(target,'green');
									player.popup('dongcha');
								}
							}
							else{
								player.chooseControl('ok').set('dialog',[get.translation(target)+'是反贼',[[target.name],'character']]);
							}
						}
					},
					log:{
						trigger:{player:'useCard'},
						forced:true,
						popup:false,
						filter:function(event,player){
							return event.targets.length==1&&event.targets[0]==player.storage.dongcha&&event.targets[0].ai.shown<0.95;
						},
						content:function(){
							trigger.targets[0].addExpose(0.2);
						}
					}
				}
			},
			sheshen:{
				trigger:{global:'dieBefore'},
				forced:true,
				unique:true,
				forceunique:true,
				filter:function(event,player){
					return event.player==game.zhu&&player.hp>0;
				},
				logTarget:'player',
				content:function(){
					'step 0'
					trigger.player.gainMaxHp();
					'step 1'
					var dh=player.hp-trigger.player.hp;
					if(dh>0){
						trigger.player.recover(dh);
					}
					'step 2'
					var cards=player.getCards('he');
					if(cards.length){
						trigger.player.gain(cards,player);
						player.$giveAuto(cards,trigger.player);
					}
					'step 3'
					trigger.cancel();
					player.die();
				}
			},
			_mingzhi1:{
				trigger:{player:['phaseBeginStart','dyingBefore']},
				priority:19,
				forced:true,
				popup:false,
				content:function(){
					"step 0"
					var choice=1;
					for(var i=0;i<player.hiddenSkills.length;i++){
						if(lib.skill[player.hiddenSkills[i]].ai){
							var mingzhi=lib.skill[player.hiddenSkills[i]].ai.mingzhi;
							if(mingzhi==false){
								choice=0;break;
							}
							if(typeof mingzhi=='function'&&mingzhi(trigger,player)==false){
								choice=0;break;
							}
						}
					}
					if(player.isUnseen()){
						var group=lib.character[player.name1][1];
						player.chooseControl('bumingzhi','明置'+get.translation(player.name1),
							'明置'+get.translation(player.name2),'tongshimingzhi',true).ai=function(event,player){
							if(event.triggername=='dyingBefore') return 3;
							var popu=get.population(lib.character[player.name1][1])
							if(popu>=2||(popu==1&&game.players.length<=4)){
								return Math.random()<0.5?3:(Math.random()<0.5?2:1);
							}
							if(choice==0) return 0;
							if(get.population(group)>0&&player.wontYe()){
								return Math.random()<0.2?(Math.random()<0.5?3:(Math.random()<0.5?2:1)):0;
							}
							var nming=0;
							for(var i=0;i<game.players.length;i++){
								if(game.players[i]!=player&&game.players[i].identity!='unknown'){
									nming++;
								}
							}
							if(nming==game.players.length-1) return Math.random()<0.5?(Math.random()<0.5?3:(Math.random()<0.5?2:1)):0;
							return (Math.random()<0.1*nming/game.players.length)?(Math.random()<0.5?3:(Math.random()<0.5?2:1)):0;
						};
					}
					else{
						if(event.triggername=='dyingBefore') choice=1;
						else if(Math.random()<0.5) choice=0;
						if(player.isUnseen(0)){
							player.chooseControl('bumingzhi','明置'+get.translation(player.name1),true).choice=choice;
						}
						else if(player.isUnseen(1)){
							player.chooseControl('bumingzhi','明置'+get.translation(player.name2),true).choice=choice;
						}
						else{
							event.finish();
						}
					}
					"step 1"
					switch(result.control){
						case '明置'+get.translation(player.name1):player.showCharacter(0,true,true);break;
						case '明置'+get.translation(player.name2):player.showCharacter(1,true,true);break;
						case 'tongshimingzhi':player.showCharacter(2,true,true);break;
					}
				}
			},
			_mingzhi2:{
				trigger:{player:'triggerHidden'},
				forced:true,
				forceDie:true,
				popup:false,
				priority:10,
				content:function(){
					"step 0"
					if(get.info(trigger.skill).silent||trigger.skill=='woshixiaonei'||trigger.skill=='xiaoneikongchang'||trigger.skill=='xiaoneidantiao'||trigger.skill=='xiaoneihuosheng'||trigger.skill.startsWith('shengmingshili')){
						event.finish();
					}
					else{
						event.skillHidden=true;
						var bool1=(game.expandSkills(lib.character[player.name1][3]).contains(trigger.skill));
						var bool2=(game.expandSkills(lib.character[player.name2][3]).contains(trigger.skill));
						var nai=function(){
							var player=_status.event.player;
							if(!_status.event.yes) return false;
							if(player.identity!='unknown') return true;
							if(Math.random()<0.5) return true;
							var info=get.info(_status.event.hsskill);
							if(info&&info.ai&&info.ai.mingzhi==true) return true;
							if(info&&info.ai&&info.ai.maixie) return true;
							var group=lib.character[player.name1][1];
							var popu=get.population(lib.character[player.name1][1])
							if(popu>=2||(popu==1&&game.players.length<=4)){
								return true;
							}
							if(get.population(group)>0&&player.wontYe()){
								return Math.random()<0.2?true:false;
							}
							var nming=0;
							for(var i=0;i<game.players.length;i++){
								if(game.players[i]!=player&&game.players[i].identity!='unknown'){
									nming++;
								}
							}
							if(nming==game.players.length-1) return Math.random()<0.5?true:false;
							return (Math.random()<0.1*nming/game.players.length)?true:false;
						}
						if(bool1&&bool2){
							event.name=player.name1;
							event.name2=player.name2;
						}
						else{
							event.name=bool1?player.name1:player.name2;
						}
						if(_status.connectMode){
							var choose_time=lib.configOL.choose_timeout
							for(var i=0;i<game.players.length;i++){
								game.players[i].showTimer(parseInt(choose_time)*1000);
							}
							game.me._hide_all_timer=true;
						}
						var info=get.info(trigger.skill);
						var next=player.chooseBool('是否明置'+get.translation(event.name)+'以发动【'+get.translation(trigger.skill)+'】？');
						next.set('yes',!info.check||info.check(trigger._trigger,player));
						next.set('hsskill',trigger.skill);
						next.set('ai',nai);
					}
					"step 1"
					if(result.bool){
						if(event.name==player.name1) player.showCharacter(0);
						else player.showCharacter(1);
						trigger.revealed=true;
						event.finish();
					}
					else if(event.name2){
						var info=get.info(trigger.skill);
						var next=player.chooseBool('是否明置'+get.translation(event.name2)+'以发动【'+get.translation(trigger.skill)+'】？');
						next.set('yes',!info.check||info.check(trigger._trigger,player));
						next.set('ai',function(){
							return _status.event.yes;
						});
					}
					else{
						event.finish();
						trigger.untrigger();
						trigger.cancelled=true;
					}
					"step 2"
					if(event.name2){
						if(result.bool){
							player.showCharacter(1);
							trigger.revealed=true;
						}
						else{
							trigger.untrigger();
							trigger.cancelled=true;
						}
					}
				}
			},
			_revealCharacterMainDo:{
				popup:false,
				content:function(){
					"step 0"
					player.showCharacter(0,true,true)
				}
			},
			_revealCharacterViceDo:{
				popup:false,
				content:function(){
					"step 0"
					player.showCharacter(1,true,true)
				}
			},
		},
		help:{
			'身份模式':'<div style="margin:10px">选项</div><ul style="margin-top:0"><li>加强主公<br>反贼人数多于2时主公会额外增加一个技能（每个主公的额外技能固定，非常备主公增加天命）<li>特殊身份<br><ul style="padding-left:20px;padding-top:5px"><li>军师：忠臣身份。只要军师存活，主公在准备阶段开始时，可以观看牌堆顶的三张牌，然后将这些牌以任意顺序置于牌堆顶或牌堆底<li>大将：忠臣身份。只要大将存活，主公手牌上限+1<li>贼首：反贼身份，只要贼首存活，主公手牌上限-1</ul></ul>',
			'明忠模式':'<div style="margin:10px">明忠模式（忠胆英杰）</div><ul style="margin-top:0"><li>本模式需要8名玩家进行游戏，使用的身份牌为：1主公、2忠臣、4反贼和1内奸。游戏开始时，每名玩家随机获得一个身份，由系统随机选择一名忠臣身份的玩家亮出身份（将忠臣牌正面朝上放在面前），其他身份（包括主公）的玩家不亮出身份。<li>'+
			'首先由亮出身份的忠臣玩家随机获得六张武将牌，挑选一名角色，并将选好的武将牌展示给其他玩家。之后其余每名玩家随机获得三张武将牌，各自从其中挑选一张同时亮出<li>'+
			'亮出身份牌的忠臣增加1点体力上限。角色濒死和死亡的结算及胜利条件与普通身份局相同。',
			'3v3v2':'<div style="margin:10px">3v3v2模式</div><ul style="margin-top:0"><li>游戏准备<br>本模式需要8名玩家进行游戏。游戏开始前，所有玩家随机分成两组，每组四人，分别称为「冷色阵营」和「暖色阵营」，然后分发身份牌，抽取到「主帅」身份的玩家亮出身份牌。'+
			'<li>身份牌<br>每组的身份分为四种。<br>主帅（主）和前锋（忠）：联合对方阵营的细作，击杀己方细作，对方阵营的主帅和前锋以及所有的野心家。<br>细作（内）：帮助对方阵营的主帅和前锋，击杀对方细作，己方阵营的主帅和前锋以及所有的野心家。<br>野心家（野）：联合对方阵营中的野心家，击杀所有其他角色，成为最后的生还者。<br>'+
			'<li>胜负判定<br>冷色主帅，先锋和暖色细作在所有其他角色全部阵亡后视为胜利，在冷色主帅阵亡后视为游戏失败。<br>暖色主帅，先锋和冷色细作在所有其他角色阵亡后视为胜利，在暖色主帅阵亡后视为失败。<br>野心家在所有不为野心家的角色阵亡后视为胜利，在双方主帅全部阵亡而有非野心家角色存活时失败。<br>当有角色阵亡后，若有角色满足胜利条件，游戏结束。若所有角色均满足失败条件，则游戏平局。若一名角色满足失败条件，即使其满足胜利条件，也视为游戏失败。<br>'+
			'<li>游戏流程<br>在「游戏准备」中的工作完成后，冷色主帅选择一个势力，然后暖色主帅选择一个其他势力，作为双方各自的势力将池。<br>双方主帅从各自的势力将池中获得两张常备主公武将牌和四张非常备主公武将牌，然后选择一张作为武将牌，将其他的武将牌放回势力将池并洗混。然后双方的其他玩家从各自的势力将池中随机获得五张武将牌，选择一张作为自己的武将牌。<br>暖色主帅成为游戏的一号位，双方主帅各加1点体力和体力上限。七号位和八号位的起始手牌+1。<br>当场上第一次有玩家死亡时，野心家确认彼此的身份牌，然后获得技能〖野心毕露〗：出牌阶段，你可以明置身份牌，加1点体力上限和体力值。若如此做，所有的野心家失去技能〖野心毕露〗<br>'+'<li>击杀奖惩<br>杀死颜色不同的主帅的角色回复1点体力，杀死颜色不同的先锋的角色摸两张牌，杀死颜色相同的细作的角色摸三张牌，杀死颜色相同的先锋的主帅弃置所有手牌。<br>'+
			'<li>制作团队<br>游戏出品：紫星居<br>游戏设计：食茸貳拾肆<br>游戏开发：食茸貳拾肆、紫髯的小乔、聆星Mine、空城琴音依旧弥漫、丽景原同志、雪之彩翼、拉普拉斯、明月照沟渠<br>程序化：无名杀<br>鸣谢：荆哲、魔风、萨巴鲁酱、这就是秋夜</ul></ul>',
		}
	};
});
