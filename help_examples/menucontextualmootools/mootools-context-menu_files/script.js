/*
	TODO:
		- Merge .htaccess from live site with html5boilerplate
		- Minify erything
		- Use localStore for footer and follow content
		
		
	AFTER LIVE:
		
		- Content pages: general rewrites
		- "Single" page -- two adds, side by side, before comments
*/


/* MooTools More */
MooTools.More={version:"1.3.1.1",build:"0292a3af1eea242b817fecf9daa127417d10d4ce"};Events.Pseudos=function(g,c,e){var b="monitorEvents:";var a=function(h){return{store:h.store?function(i,j){h.store(b+i,j);
}:function(i,j){(h.$monitorEvents||(h.$monitorEvents={}))[i]=j;},retrieve:h.retrieve?function(i,j){return h.retrieve(b+i,j);}:function(i,j){if(!h.$monitorEvents){return j;
}return h.$monitorEvents[i]||j;}};};var f=function(j){if(j.indexOf(":")==-1||!g){return null;}var i=Slick.parse(j).expressions[0][0],m=i.pseudos,h=m.length,k=[];
while(h--){if(g[m[h].key]){k.push({event:i.tag,value:m[h].value,pseudo:m[h].key,original:j});}}return k.length?k:null;};var d=function(h){return Object.merge.apply(this,h.map(function(i){return g[i.pseudo].options||{};
}));};return{addEvent:function(m,p,j){var n=f(m);if(!n){return c.call(this,m,p,j);}var k=a(this),s=k.retrieve(m,[]),h=n[0].event,t=d(n),o=p,i=t[h]||{},l=Array.slice(arguments,2),r=this,q;
if(i.args){l.append(Array.from(i.args));}if(i.base){h=i.base;}if(i.onAdd){i.onAdd(this);}n.each(function(u){var v=o;o=function(){(i.listener||g[u.pseudo].listener).call(r,u,v,arguments,q,t);
};});q=o.bind(this);s.include({event:p,monitor:q});k.store(m,s);c.apply(this,[m,p].concat(l));return c.apply(this,[h,q].concat(l));},removeEvent:function(l,n){var m=f(l);
if(!m){return e.call(this,l,n);}var j=a(this),o=j.retrieve(l);if(!o){return this;}var h=m[0].event,p=d(m),i=p[h]||{},k=Array.slice(arguments,2);if(i.args){k.append(Array.from(i.args));
}if(i.base){h=i.base;}if(i.onRemove){i.onRemove(this);}e.apply(this,[l,n].concat(k));o.each(function(q,r){if(!n||q.event==n){e.apply(this,[h,q.monitor].concat(k));
}delete o[r];},this);j.store(l,o);return this;}};};(function(){var b={once:{listener:function(e,f,d,c){f.apply(this,d);this.removeEvent(e.event,c).removeEvent(e.original,f);
}},throttle:{listener:function(d,e,c){if(!e._throttled){e.apply(this,c);e._throttled=setTimeout(function(){e._throttled=false;},d.value||250);}}},pause:{listener:function(d,e,c){clearTimeout(e._pause);
e._pause=e.delay(d.value||250,this,c);}}};Events.definePseudo=function(c,d){b[c]=Type.isFunction(d)?{listener:d}:d;return this;};Events.lookupPseudo=function(c){return b[c];
};var a=Events.prototype;Events.implement(Events.Pseudos(b,a.addEvent,a.removeEvent));["Request","Fx"].each(function(c){if(this[c]){this[c].implement(Events.prototype);
}});}).call(this);(function(){var d={},c=["once","throttle","pause"],b=c.length;while(b--){d[c[b]]=Events.lookupPseudo(c[b]);}Event.definePseudo=function(e,f){d[e]=Type.isFunction(f)?{listener:f}:f;
return this;};var a=Element.prototype;[Element,Window,Document].invoke("implement",Events.Pseudos(d,a.addEvent,a.removeEvent));}).call(this);(function(){var b=!(window.attachEvent&&!window.addEventListener),e=Element.NativeEvents;
e.focusin=2;e.focusout=2;var c=function(g,j,h){var i=Element.Events[g.event],k;if(i){k=i.condition;}return Slick.match(j,g.value)&&(!k||k.call(j,h));};
var f=function(g){var h="$delegation:";return{base:"focusin",onRemove:function(i){i.retrieve(h+"forms",[]).each(function(j){j.retrieve(h+"listeners",[]).each(function(k){j.removeEvent(g,k);
});j.eliminate(h+g+"listeners").eliminate(h+g+"originalFn");});},listener:function(q,r,p,s,t){var j=p[0],i=this.retrieve(h+"forms",[]),o=j.target,l=(o.get("tag")=="form")?o:j.target.getParent("form"),n=l.retrieve(h+"originalFn",[]),k=l.retrieve(h+"listeners",[]);
i.include(l);this.store(h+"forms",i);if(!n.contains(r)){var m=function(u){if(c(q,this,u)){r.call(this,u);}};l.addEvent(g,m);n.push(r);k.push(m);l.store(h+g+"originalFn",n).store(h+g+"listeners",k);
}}};};var a=function(g){return{base:"focusin",listener:function(j,k,h){var i={blur:function(){this.removeEvents(i);}};i[g]=function(l){if(c(j,this,l)){k.call(this,l);
}};h[0].target.addEvents(i);}};};var d={mouseenter:{base:"mouseover"},mouseleave:{base:"mouseout"},focus:{base:"focus"+(b?"":"in"),args:[true]},blur:{base:b?"blur":"focusout",args:[true]}};
if(!b){Object.append(d,{submit:f("submit"),reset:f("reset"),change:a("change"),select:a("select")});}Event.definePseudo("relay",{listener:function(j,k,i,g,h){var l=i[0];
for(var n=l.target;n&&n!=this;n=n.parentNode){var m=document.id(n);if(c(j,m,l)){if(m){k.call(m,l,m);}return;}}},options:d});}).call(this);Fx.Slide=new Class({Extends:Fx,options:{mode:"vertical",wrapper:false,hideOverflow:true,resetHeight:false},initialize:function(b,a){b=this.element=this.subject=document.id(b);
this.parent(a);a=this.options;var d=b.retrieve("wrapper"),c=b.getStyles("margin","position","overflow");if(a.hideOverflow){c=Object.append(c,{overflow:"hidden"});
}if(a.wrapper){d=document.id(a.wrapper).setStyles(c);}if(!d){d=new Element("div",{styles:c}).wraps(b);}b.store("wrapper",d).setStyle("margin",0);if(b.getStyle("overflow")=="visible"){b.setStyle("overflow","hidden");
}this.now=[];this.open=true;this.wrapper=d;this.addEvent("complete",function(){this.open=(d["offset"+this.layout.capitalize()]!=0);if(this.open&&a.resetHeight){d.setStyle("height","");
}},true);},vertical:function(){this.margin="margin-top";this.layout="height";this.offset=this.element.offsetHeight;},horizontal:function(){this.margin="margin-left";
this.layout="width";this.offset=this.element.offsetWidth;},set:function(a){this.element.setStyle(this.margin,a[0]);this.wrapper.setStyle(this.layout,a[1]);
return this;},compute:function(c,b,a){return[0,1].map(function(d){return Fx.compute(c[d],b[d],a);});},start:function(b,e){if(!this.check(b,e)){return this;
}this[e||this.options.mode]();var d=this.element.getStyle(this.margin).toInt(),c=this.wrapper.getStyle(this.layout).toInt(),a=[[d,c],[0,this.offset]],g=[[d,c],[-this.offset,0]],f;
switch(b){case"in":f=a;break;case"out":f=g;break;case"toggle":f=(c==0)?a:g;}return this.parent(f[0],f[1]);},slideIn:function(a){return this.start("in",a);
},slideOut:function(a){return this.start("out",a);},hide:function(a){this[a||this.options.mode]();this.open=false;return this.set([-this.offset,0]);},show:function(a){this[a||this.options.mode]();
this.open=true;return this.set([0,this.offset]);},toggle:function(a){return this.start("toggle",a);}});Element.Properties.slide={set:function(a){this.get("slide").cancel().setOptions(a);
return this;},get:function(){var a=this.retrieve("slide");if(!a){a=new Fx.Slide(this,{link:"cancel"});this.store("slide",a);}return a;}};Element.implement({slide:function(d,e){d=d||"toggle";
var b=this.get("slide"),a;switch(d){case"hide":b.hide(e);break;case"show":b.show(e);break;case"toggle":var c=this.retrieve("slide:flag",b.open);b[c?"slideOut":"slideIn"](e);
this.store("slide:flag",!c);a=true;break;default:b.start(d,e);}if(!a){this.eliminate("slide:flag");}return this;}});(function(){Fx.Scroll=new Class({Extends:Fx,options:{offset:{x:0,y:0},wheelStops:true},initialize:function(c,b){this.element=this.subject=document.id(c);
this.parent(b);if(typeOf(this.element)!="element"){this.element=document.id(this.element.getDocument().body);}if(this.options.wheelStops){var d=this.element,e=this.cancel.pass(false,this);
this.addEvent("start",function(){d.addEvent("mousewheel",e);},true);this.addEvent("complete",function(){d.removeEvent("mousewheel",e);},true);}},set:function(){var b=Array.flatten(arguments);
if(Browser.firefox){b=[Math.round(b[0]),Math.round(b[1])];}this.element.scrollTo(b[0],b[1]);},compute:function(d,c,b){return[0,1].map(function(e){return Fx.compute(d[e],c[e],b);
});},start:function(c,d){if(!this.check(c,d)){return this;}var b=this.element.getScroll();return this.parent([b.x,b.y],[c,d]);},calculateScroll:function(g,f){var d=this.element,b=d.getScrollSize(),h=d.getScroll(),j=d.getSize(),c=this.options.offset,i={x:g,y:f};
for(var e in i){if(!i[e]&&i[e]!==0){i[e]=h[e];}if(typeOf(i[e])!="number"){i[e]=b[e]-j[e];}i[e]+=c[e];}return[i.x,i.y];},toTop:function(){return this.start.apply(this,this.calculateScroll(false,0));
},toLeft:function(){return this.start.apply(this,this.calculateScroll(0,false));},toRight:function(){return this.start.apply(this,this.calculateScroll("right",false));
},toBottom:function(){return this.start.apply(this,this.calculateScroll(false,"bottom"));},toElement:function(d,e){e=e?Array.from(e):["x","y"];var c=a(this.element)?{x:0,y:0}:this.element.getScroll();
var b=Object.map(document.id(d).getPosition(this.element),function(g,f){return e.contains(f)?g+c[f]:false;});return this.start.apply(this,this.calculateScroll(b.x,b.y));
},toElementEdge:function(d,g,e){g=g?Array.from(g):["x","y"];d=document.id(d);var i={},f=d.getPosition(this.element),j=d.getSize(),h=this.element.getScroll(),b=this.element.getSize(),c={x:f.x+j.x,y:f.y+j.y};
["x","y"].each(function(k){if(g.contains(k)){if(c[k]>h[k]+b[k]){i[k]=c[k]-b[k];}if(f[k]<h[k]){i[k]=f[k];}}if(i[k]==null){i[k]=h[k];}if(e&&e[k]){i[k]=i[k]+e[k];
}},this);if(i.x!=h.x||i.y!=h.y){this.start(i.x,i.y);}return this;},toElementCenter:function(e,f,h){f=f?Array.from(f):["x","y"];e=document.id(e);var i={},c=e.getPosition(this.element),d=e.getSize(),b=this.element.getScroll(),g=this.element.getSize();
["x","y"].each(function(j){if(f.contains(j)){i[j]=c[j]-(g[j]-d[j])/2;}if(i[j]==null){i[j]=b[j];}if(h&&h[j]){i[j]=i[j]+h[j];}},this);if(i.x!=b.x||i.y!=b.y){this.start(i.x,i.y);
}return this;}});function a(b){return(/^(?:body|html)$/i).test(b.tagName);}}).call(this);Fx.SmoothScroll=new Class({Extends:Fx.Scroll,options:{axes:["x","y"]},initialize:function(c,d){d=d||document;
this.doc=d.getDocument();this.parent(this.doc,c);var e=d.getWindow(),a=e.location.href.match(/^[^#]*/)[0]+"#",b=$$(this.options.links||this.doc.links);
b.each(function(g){if(g.href.indexOf(a)!=0){return;}var f=g.href.substr(a.length);if(f){this.useLink(g,f);}},this);this.addEvent("complete",function(){e.location.hash=this.anchor;
this.element.scrollTo(this.to[0],this.to[1]);},true);},useLink:function(b,a){b.addEvent("click",function(d){var c=document.id(a)||this.doc.getElement("a[name="+a+"]");
if(!c){return;}d.preventDefault();this.toElement(c,this.options.axes).chain(function(){this.fireEvent("scrolledTo",[b,c]);}.bind(this));this.anchor=a;}.bind(this));
return this;}});Request.JSONP=new Class({Implements:[Chain,Events,Options],options:{onRequest:function(a){if(this.options.log&&window.console&&console.log){console.log("JSONP retrieving script with url:"+a);
}},onError:function(a){if(this.options.log&&window.console&&console.warn){console.warn("JSONP "+a+" will fail in Internet Explorer, which enforces a 2083 bytes length limit on URIs");
}},url:"",callbackKey:"callback",injectScript:document.head,data:"",link:"ignore",timeout:0,log:false},initialize:function(a){this.setOptions(a);},send:function(c){if(!Request.prototype.check.call(this,c)){return this;
}this.running=true;var d=typeOf(c);if(d=="string"||d=="element"){c={data:c};}c=Object.merge(this.options,c||{});var e=c.data;switch(typeOf(e)){case"element":e=document.id(e).toQueryString();
break;case"object":case"hash":e=Object.toQueryString(e);}var b=this.index=Request.JSONP.counter++;var f=c.url+(c.url.test("\\?")?"&":"?")+(c.callbackKey)+"=Request.JSONP.request_map.request_"+b+(e?"&"+e:"");
if(f.length>2083){this.fireEvent("error",f);}Request.JSONP.request_map["request_"+b]=function(){this.success(arguments,b);}.bind(this);var a=this.getScript(f).inject(c.injectScript);
this.fireEvent("request",[f,a]);if(c.timeout){this.timeout.delay(c.timeout,this);}return this;},getScript:function(a){if(!this.script){this.script=new Element("script[type=text/javascript]",{async:true,src:a});
}return this.script;},success:function(b,a){if(!this.running){return false;}this.clear().fireEvent("complete",b).fireEvent("success",b).callChain();},cancel:function(){if(this.running){this.clear().fireEvent("cancel");
}return this;},isRunning:function(){return !!this.running;},clear:function(){this.running=false;if(this.script){this.script.destroy();this.script=null;
}return this;},timeout:function(){if(this.running){this.running=false;this.fireEvent("timeout",[this.script.get("src"),this.script]).fireEvent("failure").cancel();
}return this;}});Request.JSONP.counter=0;Request.JSONP.request_map={};

/* Local Storage */
(function(d,c,b){var a=this.LocalStorage=new Class({Implements:[Options],options:{path:"*",name:c.location.hostname,duration:60*60*24*30,debug:false},storage:null,initialize:function(e){var f=this;this.setOptions(e);if(c.localStorage){if(this.options.debug){console.log("using localStorage")}this.storage=c.localStorage}else{if(Browser.Engine.trident){if(this.options.debug){console.log("using behavior Storage")}this.storage=(function(){var g=document.createElement("span");g.style.behavior="url(#default#userData)";d(document.body).adopt(g);g.load(f.options.name);return{setItem:function(h,i){g.setAttribute(h,i);g.save(f.options.name)},getItem:function(h){return g.getAttribute(h)},removeItem:function(h){g.removeAttribute(h);g.save(f.options.name)}}})()}else{if(c.globalStorage){if(this.options.debug){console.log("using globalStorage")}this.storage=(function(){storage=globalStorage[f.options.name];return{setItem:function(g,h){storage[g]=h},getItem:function(g){return("value" in storage[g])?storage[g].value:null},removeItem:function(g){delete (storage[g])}}})()}else{if(this.options.debug){console.log("using cookies")}this.storage=(function(){var g={path:f.options.path,duration:f.options.duration};return{setItem:function(h,i){Cookie.write(h,i,g)},getItem:function(h){return Cookie.read(h)},removeItem:function(h){Cookie.dispose(h)}}})()}}}},set:function(e,f){this.storage.setItem(e,JSON.encode(f));return this},get:function(e){return JSON.decode(this.storage.getItem(e))},remove:function(e){this.storage.removeItem(e);return this}})})(document.id,this);

;(function() {

// Global settings
var themePath = "/wp-content/themes/klass/";

// Global fns
function injectStylesheet(url){
	// Get the CSS
	new Element("link",{
		href: url,
		rel: "stylesheet",
		type: "text/css"
	}).inject(document.getElementsByTagName("head")[0]);
}

// Uses Moo to load and place content
function loadAndPlace(url,where,then) {
	new Request({
		url: url,
		onSuccess: function(content) {
			document.id(where).set("html",content);
			if(then) then();
		}
	}).send();
}



// When the DOM is ready...
window.addEvent("domready",function() {
	
	// Moo-needed vars
	var cannons = $$("link[rel=canonical]"), shareUrl;
	if(cannons.length) {
		shareUrl = cannons[0].get("href");
	}
	
	// Add conditional CSS classes
	var htmlTag = document.id(document.documentElement).addClass(Browser.name + " " + Browser.name + Browser.version);
	
	// Register widgets to load upon scroll or type
	var onAwaken = [];
	onAwaken.push(function() { loadAndPlace(themePath + "footer.html","footer"); });
	onAwaken.push(function() { loadAndPlace(themePath + "follow-trends.html","contentRightColumn",function(){ $$(".contentRightColumn").fade(1); }); });
	onAwaken.push(function() { 
		setTimeout(function() {
			document.id("rightAds").fade(1);
			document.id("mtlink").fade(1);
		},400);
		var bsa = document.createElement('script');
		bsa.type = 'text/javascript';
		bsa.async = true;
		bsa.src = '//s3.buysellads.com/ac/bsa.js';
		(document.getElementsByTagName('head')[0]||document.getElementsByTagName('body')[0]).appendChild(bsa);
	});
	onAwaken.push(function() {
		$$(".commentAvatar").each(function(img) {
			img.set("src",img.get("realSrc"));
		});
	});
	
	// Syntax highlight
	var pres = $$("pre,#comment-list code");
	if(pres.length) {
		// Get Lighter and all Fuel's
		require([themePath + "js/lighterjs/Source/All.js",themePath + "js/lighterjs/assets/ZeroClipboard.js"],function() {
			// A few useful vars
			var originalText = "copy";
			var timeout;
			// For every PRE
			pres.forEach(function(pre) {
				// Code classname
				if(pre.get("tag") == "code") {
					// Add class hack
					pre.addClass("js");
					// "Fix" content
					pre.set("html",pre.get("html").replace(/</,"&lt;").replace(/>/,"&gt;"));
				}
				// Class check
				if(!Fuel[pre.className]) {
					pre.className = "js";
				}
				
				// Light it!
				var lighter = new Lighter(pre,{
					altLines: "hover", 
					path: themePath + "js/lighterjs/Styles/",
					indent: 2
				});
				setTimeout(function() {
					// Create copier
					var copier = new Element("a",{
						href: "javascript:;",
						text: originalText,
						"class": "codeCopy"
					}).inject(lighter.element,"top");
					// Clipboard
					var clip = new ZeroClipboard.Client();
					clip.setPath(themePath + "js/lighterjs/assets/");
					clip.glue(copier);
					clip.setText(pre.innerHTML);
					clip.addEventListener('complete',function(client, text) {
						copier.set("html","copied!");
						if(timeout) clearTimeout(timeout);
						timeout = setTimeout(function() {
							copier.set("html",originalText);
						},1000);
					});
				},300);
			});
			// Styles
			setTimeout(function() {
				$$("pre.standardLighter").addClass("twilightLighter");
			},500);
		});
		// Create stylesheet
		injectStylesheet(themePath + "js/lighterjs/Styles/Flame.twilight.css");
	}
	
	// Star ratings
	var ratingForm = document.id("ratingForm");
	if(ratingForm) {
		// Get the post id
		var postId = document.id("postId").get("value");
		
		// Get star ratings
		require([themePath + "js/ratings/Source/moostarrating.js"],function() {
			// Set image vars
			MooStarRatingImages = {
				defaultImageFolder: themePath + 'js/ratings/Graphics/',
				defaultImageEmpty:  'star_boxed_empty.png',
				defaultImageFull:   'star_boxed_full.png',
				defaultImageHover:  'star_boxed_hover.png'
			};
			// Create star ratings
			var voted = false;
			var rater = new MooStarRating({
				form: ratingForm,
				radios: "rating",
				half: true,
				width: 16
			}).addEvent("click",function(value) {
				if(!voted){
					// Send request
					new Request({
						url: themePath + "rating.php",
						method: "post",
						data: {
							rating: value,
							id: postId
						}
					}).send();
					// Mark as voted
					voted = true;
				}
			});
			// Fix the value...wtf?!
			// Adding 0.5 because it's always showing up short 0.5 short.  WTF.
			rater.setValue((rater.currentIndex * 0.5) + 0.5);
			// Showtime
			ratingForm.setStyle("display","block");
		});
	}
	
	// Add Promo
	var promoDiv = document.id("promo");
	if(promoDiv && shareUrl) {
		onAwaken.push(function(){
			var span1 = new Element("span",{ style:"display:inline-block;float:left;" }).inject(promoDiv);
			new Element("a",{
				href: "http://twitter.com/share",
				"class": "twitter-share-button",
				"data-count": "horizontal"
			}).inject(span1);
			new Element("script",{
				src: "http://platform.twitter.com/widgets.js",
				async: true
			}).inject(span1);
			new Element("iframe",{
				src: "http://www.facebook.com/plugins/like.php?href=" + shareUrl,
				scrolling: "no",
				frameborder: 0,
				allowTransparency: true,
				style: "border:none; overflow:hidden; width:500px; height:"
			}).inject(new Element("span",{style:"display:inline-block;float:left;"}).inject(promoDiv));
			new Element("br",{ "class":"clear" }).inject(promoDiv);
			promoDiv.fade(1);
		});
	}
	
	// Tweets
	var tweetsList = document.id("tweetsList");
	if(tweetsList) {
		onAwaken.push(function() {
			// Function to format tweets
			function handleTweets(tweets) {
				// Start HTML var
				var html = "";
				// For every tweet....
				tweets.each(function(tweet) {
					// Append string...
					html += "<li>" + tweet.text.replace(/(https?:\/\/\S+)/gi,'<a href="$1">$1</a>').replace(/(^|\s)@(\w+)/g,'$1<a href="http://twitter.com/$2">@$2</a>').replace(/(^|\s)#(\w+)/g,'$1#<a href="http://search.twitter.com/search?q=%23$2">$2</a>') + "</li>";
				});
				// Add tweets to pane
				tweetsList.set("html",html);
				// Fade in
				document.id("tweetsContainer").fade(1);
			}
			// Create an array for tweets
			var tweets = [];
			// If LocalStorage is available
			var storage;
			if(htmlTag.hasClass("localstorage")) {
				// Create storage
				storage = new LocalStorage({
					duration: 60 * 30	// 30 mins
				});
				// If tweets are available....
				tweets = storage.get("tweets") || [];
			}
			// If there are no tweets, get them
			if(!tweets.length) {
				//JSONP to the rescue
				new Request.JSONP({
					url: "http://twitter.com/statuses/user_timeline/davidwalshblog.json?count=5",
					timeout: 3000,
					callbackKey: "callback",
					onComplete:function(data) {
						// If tweets
						if(data.length) {
							// Save 'em!
							if(storage){
								storage.set("tweets",data);
								handleTweets(data);
							}
						}
					}
				}).send();
			}
			else {
				handleTweets(tweets);
			}
		});
	}
	
	// Add reply to comments
	var commentList = document.id("comment-list");
	// Get holders
	var commentFormHolder = document.id("commentFormHolder"), commentFormMobileHolder = document.id("commentFormMobileHolder");
	var commentParentNode = document.id("comment_parent");
	var commentResponseNode, commentFormMobileHolderArrow, commentFormMobileHolderArrowOutline;
	// Get post content node
	var postContentNode = document.id("postContent");
	if(commentList) {
		onAwaken.push(function() {
			// Get comments
			var comments = commentList.getElements("li");
			// For every comment, add a Reply link
			comments.each(function(comment) {
				new Element("a",{
					href: "",
					"class": "commentReply",
					text: "Reply",
					userName: comment.getElements(".commentName")[0].get("text"),
					commentId: comment.get("id").replace("comment-","")
				}).inject(comment);
			});
			// Add event delegation to move comment form
			commentList.addEvent("click:relay(a.commentReply)",function(e) {
				// Stop event!
				if(e) e.stop();
				// Update the parent
				commentParentNode.set("value",e.target.get("commentId"));
				// Create response node
				if(!commentResponseNode) {
					commentResponseNode = new Element("div",{
						"class": "commentResponseNode"
					}).inject(commentFormMobileHolder,"top");
					commentFormMobileHolderArrowOutline = new Element("div",{
						"class": "commentFormMobileHolderArrowOutline"
					}).inject(commentFormMobileHolder,"top");
					commentFormMobileHolderArrow = new Element("div",{
						"class": "commentFormMobileHolderArrow"
					}).inject(commentFormMobileHolderArrowOutline,"top");
				}
				commentResponseNode.set("text","In response to " + e.target.get("userName"));
				// Move the form
				commentFormMobileHolder.inject(e.target.getParent("li"));
				commentFormMobileHolder.addClass("commentFormMobileHolderHover");
			});
			// Get comment voting script
			require(["/wp-content/plugins/comment-rating/ck-karma.js"]);
		});
	}
	
	// Comment submissions
	var commentForm = document.id("commentForm");
	if(commentForm) {
		onAwaken.push(function() {
			// When submitted
			var submissionRunning = false;
			// Get fields author, email, url
			var authorField = document.id("author"), emailField = document.id("email"), urlField = document.id("url"), commentField = document.id("comment"), submitButton = document.id("submit");
			// Comment Template
			var commentTemplate = ' \
			<!-- name -->\
			<span class="commentName">{name}</span>\
			<!-- time -->\
			<span class="commentTime">just now</span>\
			<!-- comment content -->\
			<div class="commentContent">\
				{comment}\
			</div>\
			';
			
			// Puts the comment form back
			var restoreForm = function() {
				// Clear out the comment
				commentField.set("value","");
				// Put the form back
				commentFormMobileHolder.inject(commentFormHolder,"top");
				commentFormMobileHolder.removeClass("commentFormMobileHolderHover");
				// Clear the parent
				commentParentNode.set("value","");
			};
			
			
			// When submitted...
			commentForm.addEvent("submit",function(e) {
				// Stop!
				if(e) e.stop();
				// No concurrentness
				if(submissionRunning) return;
				// Validate
				var errors = 0;
				var formError = "formError";
				
				if(authorField) { // If not me...
					if(authorField.value.trim()) { authorField.removeClass(formError); } else { errors++; authorField.addClass(formError); }
					if(emailField.value.test(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/)) { emailField.removeClass(formError); } else { errors++; emailField.addClass(formError); }
					if(urlField.value.trim() == "" || urlField.value.test(/http:\/\/[A-Za-z0-9\.-]{3,}\.[A-Za-z]{2}/)) { urlField.removeClass(formError); } else { errors++; urlField.addClass(formError); }
				}
				
				// Always validate comment
				if(commentField.value.trim()) { commentField.removeClass(formError); } else { errors++; commentField.addClass(formError); }
				
				// If no errors, 
				if(!errors) {
					// Ajax time!
					new Request({
						url: commentForm.action,
						method: commentForm.method,
						onRequest: function() {
							// Running!
							submissionRunning = true;
							// Disable form submit button
							submitButton.disabled = true;
							// Add the new comment to the bottom, eventhough it could go elsewhere
							var comment = new Element("li",{
								html: commentTemplate.substitute({
									name: authorField ? authorField.value.trim() : "You",
									comment: commentField.get("value").replace(/\n\n/,"<br /><br />")
								})
							}).inject(commentList,"bottom");
							// Put the form back
							restoreForm();
							// Scroll down to the comment
							new Fx.Scroll(window).toElement(comment);
						},
						onComplete: function() {
							// No longer running
							submissionRunning = false;
							// Enable form submission
							submitButton.disabled = false;
						}
					}).send(commentForm.toQueryString());
				}
			});
			
			// Dock link
			new Element("a",{
				href: "javascript:;",
				text: "Dock Bottom",
				id: "commentDock",
				events: {
					click: restoreForm
				}
			}).inject(submitButton,"before");
			
		});
	}
	
	
	// Search stuff
	var searchBox = document.id("searchBox").setStyle("display","block");
	var searchTimeout;
	var createSearch = function() {
		// Create the search holder
		var searchHolder = new Element("div",{
			"class": "popin",
			id: "searchHolder",
			styles: {
				opacity: 0,
				display: "block"
			}
		}).inject(document.id("headerSearch"));
		// Arrows
		new Element("div",{ "class": "searchHolderArrowOutline" }).inject(searchHolder);
		new Element("div",{ "class": "searchHolderArrow" }).inject(searchHolder);
		// Now create the results div
		var resultsDiv = new Element("div",{
			id: "searchResults"
		}).inject(searchHolder);
		// Close link
		new Element("div",{
			id: "searchResultsClose",
			text: "Close",
			href: "",
			events: {
				click: function(e) {
					if(e) e.stop();
					searchHolder.fade(0);
				}
			}
		}).inject(searchHolder);
		// Set up the search
		var search = new google.search.WebSearch(),
		control = new google.search.SearchControl(),
		options = new google.search.DrawOptions();
		//set google options
		options.setDrawMode(google.search.SearchControl.DRAW_MODE_TABBED);
		options.setInput(searchBox);
		//set search options
		search.setUserDefinedClassSuffix('siteSearch');
		search.setSiteRestriction('davidwalsh.name');
		search.setLinkTarget(google.search.Search.LINK_TARGET_SELF);
		//set search controls
		control.addSearcher(search);
		control.draw(resultsDiv,options);
		control.setNoResultsString('No results were found.');
		//add listeners to search box
		var searchEv = function() {
			if(searchTimeout) clearTimeout(searchTimeout);
			if(searchBox.value && searchBox.value != searchBox.get('placeholder')) {
				searchTimeout = setTimeout(function() {
					searchHolder.fade(0.9);
					control.execute(searchBox.value);
				},300);
			}
			else {
				searchHolder.fade(0);
			}
		};
		searchBox.addEvents({
			keyup: searchEv,
			mouseup: searchEv
		});
		// Remove the event
		searchBox.removeEvent("focus",createSearch);
	};
	searchBox.addEvent("focus",createSearch);
	
	
	// Set up main register handler
	var runEvents = ["keydown","mousemove","scroll"];
	var runAwaken = function() {
		onAwaken.each(function(evt,index) {
			evt();
		});
		runEvents.each(function(evtType){
			window.removeEvent(evtType,runAwaken);
		});
	};
	// Set registers in motion
	runEvents.each(function(evtType){
		window.addEvent(evtType,runAwaken);
	});
	
	// Smooth scrolling!
	new Fx.SmoothScroll();
	
});

})();