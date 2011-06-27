/*
---
description: Builds and displays an element containing highlighted code bits.

license: MIT-style

authors:
- Jose Prado

requires:
  core/1.3.0: '*'

provides: [Lighter]

...
*/
(function() {
	Lighter = new Class({	
		
		Implements: [Options],
		name: 'Lighter',
		
		options: {
			altLines: '', // Pseudo-selector enabled.
			clipboard: null,
			container: null,
			editable: false,
			flame: 'standard',
			fuel:  'standard',
			id: null,
			indent: -1,
			matchType: "standard",
			mode: "pre",
			path: null,
			strict: false
		},
	
		initialize: function(codeblock, options) {
			this.setOptions(options);
			this.id = this.options.id || this.name + '_' + Date.now();
			this.codeblock = $(codeblock);
			this.container = $(this.options.container);
			this.code = chop(this.codeblock.get('html')).replace(/&lt;/gim, '<').replace(/&gt;/gim, '>').replace(/&amp;/gim, '&');
			
			// Indent code if user option is set.
			if (this.options.indent > -1) { this.code = tabToSpaces(this.code, this.options.indent); }
		
			// Figure out path based on script location of Lighter.js or option passed in.
			this.getPath();
			
			// Extract fuel/flame names. Precedence: className > options > 'standard'.
			this.getClass();
			
			// Set builder options.
			this.builder = new Hash({
				'inline': this.createLighter.pass('code', this),
				'pre':    this.createLighter.pass('pre', this),
				'ol':     this.createLighterWithLines.pass([['ol'], ['li']], this),
				'div':    this.createLighterWithLines.pass([['div'], ['div', 'span'], true, 'span'], this),
				'table':  this.createLighterWithLines.pass([['table', 'tbody'], ['tr', 'td'], true, 'td'], this)
			});
		
			// Initialize caches
			Lighter.scripts     = Lighter.scripts || {};
			Lighter.stylesheets = Lighter.stylesheets || {};
		
			// Load fuel/flame to start chain of loads.
			this.loadStylesheet(this.options.flame, 'Flame.'+this.options.flame+'.css');
			this.loadFuel();
		},
		
		loadFuel: function() {
			try {
				this.fuel = new Fuel[this.options.fuel](this.code, {
					matchType: this.options.matchType,
					strict: this.options.strict
				});
				this.light();
			} catch (e) {
				this.loadScript(this.options.fuel, 'Fuel.'+this.options.fuel+'.js', {
					'load': this.loadFuel.bind(this),
					'error': function() { this.options.fuel = 'standard'; this.loadFuel(); }.bind(this)
				});
			}
		},
		
		light: function() {
			// Build highlighted code object.
			this.element = this.toElement();
		
			// Insert lighter in the right spot.
			if (this.container) {
				this.container.empty();
				this.element.inject(this.container);
			} else {
				this.codeblock.setStyle('display', 'none');
				this.element.inject(this.codeblock, 'after');
				if (this.options.clipboard) { this.loadClipboard(); }
			}
		},
		
		unlight: function() {
			$(this).setStyle('display', 'none');
			this.codeblock.setStyle('display', 'inherit');
		},
		
		loadClipboard: function() {
			try {
				var clip = new ZeroClipboard.Client();
				clip.setPath(this.options.path);
				clip.glue($(this.options.clipboard));
				clip.setText(this.code);
				clip.addEventListener('complete', function(client, text) {
		        alert("Copied text to clipboard:\n" + text);
		    });
			} catch (e) {
				this.loadScript('clipboard', 'ZeroClipboard.js', {
					'load': this.loadClipboard.bind(this),
					'error': Function.from()
				});
				return false;
			}
		},
		
		/* ----------------------------------- */
		/* ---->>> INIT HELPER METHODS <<<---- */
		/* ----------------------------------- */
		getPath: function() {
		  if (!Lighter.path) {
		      $$('head script').each(function(el) {
		          var script  = el.src.split('?', 1),
		              pattern = /Lighter(\.full|\.lite)?\.js$/gi;
		          if (script[0].match(pattern)) {
		              Lighter.path = script[0].replace(pattern, '');
		          }
		      })
		  }
		  if (!this.options.path) { this.options.path = Lighter.path; }
		},
		
		getClass: function() {
            var classNames = this.codeblock.get('class').split(' '),
                ff = [null, null];
            switch (classNames.length) {
                case 0: // No language! Simply wrap in Lighter.js standard Fuel/Flame.
					break;
				case 1: // Single class, assume this is the fuel/flame
					ff = classNames[0].split(':');
					break;
				default: // More than one class, let's give the first one priority for now.
					ff = classNames[0].split(':');
            }
            
            if (ff[0]) { this.options.fuel  = ff[0]; }
            if (ff[1]) { this.options.flame = ff[1]; }
		},
		
		loadScript: function(holder, fileName, events) {
			if (Lighter.scripts[holder] != undefined) {
				Lighter.scripts[holder].addEvents({
					load: events.load,
					error: events.error,
					readystatechange: function() {
						if (['loaded', 'complete'].contains(this.readyState)) events.load();
					}
				});
			} else {
				Lighter.scripts[holder] = new Element('script', {
					'src': this.options.path+fileName+'?' + Date.now(),
					'type': 'text/javascript',
					'events': {
						load: events.load,
						error: events.error,
						readystatechange: function() {
							if (['loaded', 'complete'].contains(this.readyState)) events.load();
						}
					}
				}).inject(document.head);
			}
		},
		
		loadStylesheet: function(holder, fileName) {
			if (!(Lighter.stylesheets[holder])) {
				Lighter.stylesheets[holder] = new Element('link', {
					rel: "stylesheet",
					type: "text/css",
					media: "screen",
					href: this.options.path+fileName+'?'+Date.now()
				}).inject(document.head);
			}
		},
		
		/* ----------------------------------- */
		/* -->>> ELEMENT CREATE METHODS <<<--- */
		/* ----------------------------------- */
		createLighter: function(parent) {
			var lighter = new Element(parent, { 'class': this.options.flame + this.name }),
			    pointer = 0;
		    
			// If no matches were found, insert code plain text.
			if (this.fuel.wicks[0] == undefined) {
				lighter.appendText(this.code);
			} else {
		
				// Step through each match and add unmatched + matched bits to lighter.
				this.fuel.wicks.each(function(match) {
					lighter.appendText(this.code.substring(pointer, match.index));
				
					this.insertAndKeepEl(lighter, match.text, match.type);
					pointer = match.index + match.text.length;
				}, this);
			
				// Add last unmatched code segment if it exists.
				if (pointer < this.code.length) {
					lighter.appendText(this.code.substring(pointer, this.code.length));
				}
			}
		
			//lighter.set('text', lighter.get('html'));
			return lighter;
		},
		
		createLighterWithLines: function(parent, child, addLines, numType) {
			var lighter = new Element(parent[0], { 'class': this.options.flame + this.name, 'id': this.id }),
			    newLine = new Element(child[0]),
			    lineNum = 1,
			    pointer = 0,
			    text = null;
		
			// Small hack to ensure tables have no ugly styles.
			if (parent[0] == "table") { lighter.set("cellpadding", 0).set("cellspacing", 0).set("border", 0); }
		
			/* If lines need to be wrapped in an inner parent, create that element
			   with this test. (E.g, tbody in a table) */
			if (parent[1]) { lighter = new Element(parent[1]).inject(lighter); }
		
			/* If code needs to be wrapped in an inner child, create that element
			   with this test. (E.g, tr to contain td) */
			if (child[1]) { newLine = new Element(child[1]).inject(newLine); }
			newLine.addClass(this.options.flame + 'line');
			if (addLines) { lineNum = this.insertLineNum(newLine, lineNum, numType); }

			// Step through each match and add matched/unmatched bits to lighter.
			this.fuel.wicks.each(function(match) {
		
				// Create and insert un-matched source code bits.
				if (pointer != match.index) {
					text = this.code.substring(pointer, match.index).split("\n");
					for (var i = 0; i < text.length; i++) {
						if (i < text.length - 1) {
							if (text[i] === '') { text[i] = ' '; }
							newLine = this.insertAndMakeEl(newLine, lighter, text[i], child);
							if (addLines) { lineNum = this.insertLineNum(newLine, lineNum, numType); }
						} else {
							this.insertAndKeepEl(newLine, text[i]);
						}
					}
				}
			
				// Create and insert matched symbol.
				text = match.text.split('\n');
				for (var i = 0; i < text.length; i++) {
					if (i < text.length - 1) {
						newLine = this.insertAndMakeEl(newLine, lighter, text[i], child, match.type);
						if (addLines) { lineNum = this.insertLineNum(newLine, lineNum, numType); }
					} else {
						this.insertAndKeepEl(newLine, text[i], match.type);
					}
				}
			
				pointer = match.end;
			}, this);
		
			// Add last unmatched code segment if it exists.
			if (pointer <= this.code.length) {
				text = this.code.substring(pointer, this.code.length).split('\n');
				for (var i = 0; i < text.length; i++) {
					newLine = this.insertAndMakeEl(newLine, lighter, text[i], child);
					if (addLines) { lineNum = this.insertLineNum(newLine, lineNum, numType); }
				}
			}
		
			// Add alternate line styles based on pseudo-selector.
			if (this.options.altLines !== '') {
				if (this.options.altLines == 'hover') {
					lighter.getElements('.'+this.options.flame+'line').addEvents({
							'mouseover': function() {this.toggleClass('alt');},
							'mouseout':  function() {this.toggleClass('alt');}
					});
				} else {
					if (child[1]) {
						lighter.getChildren(':'+this.options.altLines).getElement('.'+this.options.flame+'line').addClass('alt');
					} else {
						lighter.getChildren(':'+this.options.altLines).addClass('alt');
					}
				}
			}
		
			// Add first/last line classes to correct element based on mode.
			if (child[1]) {
				lighter.getFirst().getChildren().addClass(this.options.flame+'first');
				lighter.getLast().getChildren().addClass(this.options.flame+'last');
			} else {
				lighter.getFirst().addClass(this.options.flame+'first');
				lighter.getLast().addClass(this.options.flame+'last');
			}
		
			// Ensure we return the real parent, not just an inner element like a tbody.
			if (parent[1]) { lighter = lighter.getParent(); }
			return lighter;
		},
		
		/** Helper function to insert new code segment into existing line. */
		insertAndKeepEl: function(el, text, alias) {
			if (text.length > 0) {
				var span = new Element('span', { 'text': text });
				if (alias) {
					span.addClass(this.fuel.aliases[alias] || alias);
				}
				span.inject(el);
			}
		},
		
		/** Helper function to insert new code segment into existing line and create new line. */
		insertAndMakeEl: function(el, group, text, child, alias) {
			this.insertAndKeepEl(el, text, alias);
			if (child[1]) { el = el.getParent(); }
			el.inject(group);
		
			var newLine = new Element(child[0]);
			if (child[1]) { newLine = new Element(child[1]).inject(newLine); }
			newLine.addClass(this.options.flame+'line');
			return newLine;
		},
		
		/** Helper funciton to insert line number into line. */
		insertLineNum: function(el, lineNum, elType) {
			var newNum = new Element(elType, {
				'text':  lineNum++,
				'class': this.options.flame+ 'num'
			});
			newNum.inject(el.getParent(), 'top');
		
			return lineNum;
		},
	
		/* ----------------------------------- */
		/* ------>>> toType METHODS <<<------- */
		/* ----------------------------------- */
		toElement: function() {
			if (!this.element) {
				this.element = this.builder[this.options.mode]();
				if (this.options.editable) { this.element.set('contenteditable', 'true'); }
			}
		
			return this.element;
		},
		
		toString: function() {
			return this.code;
		}
		
	});

	/** Element Native extensions */
	Element.implement({ light: function(options){ return new Lighter(this, options); } });

	/** String functions */
	function chop(str) { return str.replace(/(^\s*\n|\n\s*$)/gi, ''); }	
	function tabToSpaces(str, spaces) {
		for (var i = 0, indent = ''; i < spaces; i++) { indent += ' '; }
		return str.replace(/\t/g, indent);
	}
	
})();


/*
---
description: Code parsing engine for Lighter.

license: MIT-style

authors:
- Jose Prado

requires:
  core/1.3.0: '*'

provides: [Fuel]

...
*/
var Fuel = new Class({
	
	Implements: [Options],
	options: {
		matchType: "standard",
		strict: false
	},
	language: '',
	
	patterns: new Hash(),
	keywords: new Hash(),
	delimiters: new Hash({
		start: null,
		end: null
	}),

	/************************
	 * Common Regex Rules
	 ***********************/
	common: {	
		slashComments: /(?:^|[^\\])\/\/.*$/gm, // Matches a C style single-line comment.
		poundComments: /#.*$/gm,               // Matches a Perl style single-line comment.
		multiComments: /\/\*[\s\S]*?\*\//gm,   // Matches a C style multi-line comment.
		aposStrings:   /'[^'\\]*(?:\\.[^'\\]*)*'/gm, // Matches a string enclosed by single quotes. Legacy.
		quotedStrings: /"[^"\\]*(?:\\.[^"\\]*)*"/gm, // Matches a string enclosed by double quotes. Legacy.
		multiLineSingleQuotedStrings: /'[^'\\]*(?:\\.[^'\\]*)*'/gm, // Matches a string enclosed by single quotes across multiple lines.
		multiLineDoubleQuotedStrings: /"[^"\\]*(?:\\.[^"\\]*)*"/gm, // Matches a string enclosed by double quotes across multiple lines.
		multiLineStrings:   /'[^'\\]*(?:\\.[^'\\]*)*'|"[^"\\]*(?:\\.[^"\\]*)*"/gm, // Matches both.
		singleQuotedString: /'[^'\\\r\n]*(?:\\.[^'\\\r\n]*)*'/gm, // Matches a string enclosed by single quotes.
		doubleQuotedString: /"[^"\\\r\n]*(?:\\.[^"\\\r\n]*)*"/gm, // Matches a string enclosed by double quotes.
		strings: /'[^'\\\r\n]*(?:\\.[^'\\\r\n]*)*'|"[^"\\\r\n]*(?:\\.[^"\\\r\n]*)*"/gm, // Matches both.
		properties:    /\.([\w]+)\s*/gi,     // Matches a property: .property style.
		methodCalls:   /\.([\w]+)\s*\(/gm,   // Matches a method call: .methodName() style.
		functionCalls: /\b([\w]+)\s*\(/gm,   // Matches a function call: functionName() style.
		brackets:      /\{|\}|\(|\)|\[|\]/g, // Matches any of the common brackets.
		numbers:       /\b((?:(\d+)?\.)?[0-9]+|0x[0-9A-F]+)\b/gi // Matches integers, decimals, hexadecimals.
	},
	
	/************************
	 * Fuel Constructor
	 ***********************/
	initialize: function(code, options, wicks) {
		this.setOptions(options);
		this.wicks = wicks || [];
		this.code = code;
		this.aliases = $H();
		this.rules = $H();
		
		// Set builder object for matchType.
		this.builder = new Hash({
			'standard': this.findMatches,
			'lazy':     this.findMatchesLazy
		});
		
		// Add delimiter rules if not in strict mode
		if (!options.strict) {
			if (this.delimiters.start) this.addFuel('delimBeg', this.delimiters.start, 'de1');
			if (this.delimiters.end)   this.addFuel('delimEnd', this.delimiters.end,   'de2');
		}
		
		// Set Keyword Rules from this.keywords object.
		this.keywords.each(function(keywordSet, ruleName) {
			if (keywordSet.csv != '') {
				this.addFuel(ruleName, this.csvToRegExp(keywordSet.csv, keywordSet.mod || "g"), keywordSet.alias);
			}
		}, this);
		
		// Set Rules from this.patterns object.
		this.patterns.each(function(regex, ruleName) {
			this.addFuel(ruleName, regex.pattern, regex.alias);
		}, this);
		
		/** Process source code based on match type. */
		var codeBeg = 0,
		    codeEnd = this.code.length,
		    codeSeg = '',
		    delim   = this.delimiters,
		    matches = [],
		    match   = null,
		    endMatch = null;
		
		if (!options.strict) {
			// Find matches through the complete source code.
			// matches.extend(this.builder[options.matchType].pass(this.code, this)()); // UPGRADE
			Object.append(matches, this.builder[options.matchType].pass(this.code, this)()); // NEW
		} else if (delim.start && delim.end) {
			// Find areas between language delimiters and find matches there.
			while ((match = delim.start.exec(this.code)) != null ) {
				delim.end.lastIndex = delim.start.lastIndex;
				if ((endMatch = delim.end.exec(this.code)) != null ) {
					matches.push(new Wick(match[0], 'de1', match.index));
					codeBeg = delim.start.lastIndex;
					codeEnd = endMatch.index-1;
					codeSeg = this.code.substring(codeBeg, codeEnd);
					matches.extend(this.builder[options.matchType].pass([codeSeg, codeBeg], this)());
					matches.push(new Wick(endMatch[0], 'de2', endMatch.index));
				}
			}
		}
		this.wicks = matches;
	},
	
	/************************
	 * Regex Helper methods.
	 ***********************/
	addFuel: function(fuelName, RegEx, className) {
		this.rules[fuelName] = RegEx;
		this.addAlias(fuelName, className);
	},
	addAlias: function(key, alias) { this.aliases[key] = alias || key; },
	csvToRegExp: function(csv, mod) {return new RegExp('\\b(' + csv.replace(/,\s*/g, '|') + ')\\b', mod);},
	delimToRegExp: function(beg, esc, end, mod, suffix) {
		beg = beg.escapeRegExp();
		if (esc) esc = esc.escapeRegExp();
		end = (end) ? end.escapeRegExp() : beg;
		var pat = (esc) ? beg+"[^"+end+esc+'\\n]*(?:'+esc+'.[^'+end+esc+'\\n]*)*'+end : beg+"[^"+end+'\\n]*'+end;
		return new RegExp(pat+(suffix || ''), mod || '');
	},
	strictRegExp: function() {
		var regex = '(';
		for (var i = 0; i < arguments.length; i++) {
			regex += arguments[i].escapeRegExp();
			regex += (i < arguments.length - 1) ? '|' : '';
		}
		regex += ')';
		return new RegExp(regex, "gim");
	},
	
	/************************
	 * Match finding Methods
	 ***********************/
	findMatches: function(code, offset) {
		var wicks       = [],
		    startIndex  = 0,
		    matchIndex  = code.length
		    insertIndex = 0,
		    match      = null,
		    type       = null,
		    newWick    = null,
		    rule       = null,
		    rules      = {},
		    currentMatch = null,
		    futureMatch  = null;
		
		offset = offset || 0;
		
		// Create assosciative array of rules for faster access via for...in loop instead of .each().
		this.rules.each(function(regex, rule) {
			rules[rule] = {pattern: regex, nextIndex: 0};
		}, this);
			
		/**
		 * Step through the source code sequentially finding the left-most/earliest matches and then
		 * continuing beyond the end of that match to prevent parser from adding inner matches.
		 */
		while(startIndex < code.length) {
			matchIndex = code.length;
			match      = null;
			
			// Apply each rule at the current startIndex.
			for (rule in rules) {
				rules[rule].pattern.lastIndex = startIndex;
				currentMatch = rules[rule].pattern.exec(code);
				if (currentMatch === null) {
					// Delete rule if there's no matches.
					delete rules[rule];
				} else {
					// Find earliest and longest match, then store relevant info.
					if (currentMatch.index < matchIndex || (currentMatch.index == matchIndex && match[0].length < currentMatch[0].length)) {
						match      = currentMatch;
						type       = rule;
						matchIndex = currentMatch.index;
					}
					// Store index of rules' next match in nextIndex property.
					rules[rule].nextIndex = rules[rule].pattern.lastIndex - currentMatch[0].length;
				}
			}
			/* Create a new Wick out of found match. Otherwise break out of loop since no
			   matches are left. */
			if (match != null) {
			
				// If $1 capture group exists, use $1 instead of full match.
				index = (match[1] && match[0].contains(match[1])) ? match.index + match[0].indexOf(match[1]) : match.index;
				newWick = new Wick(match[1] || match[0], type, index+offset);
				wicks.push(newWick);
				
				/* Find the next match of current rule and store its index. If not done, the nextIndex
				   would be at the start of current match, thus creating an infinite loop*/
				futureMatch = rules[type].pattern.exec(code);
				if (!futureMatch) {
					rules[type].nextIndex = code.length;
				} else {
					rules[type].nextIndex = rules[type].pattern.lastIndex - futureMatch[0].length;
				}
				
				// Cycle through "nextIndex" properties and store earliest position in min variable.
				var min = code.length;
				for (rule in rules) {
					if (rules[rule].nextIndex < min) {
						min = rules[rule].nextIndex;
					}
				}
				/* Set startIndex to the end of current match if min is located behind it. Normally this
				   would signal an inner match. Future upgrades should do this test in the min loop
				   in order to find the actual earliest match. */
				startIndex = Math.max(min, newWick.end - offset);
			} else {
				break;
			}
		}
		return wicks;
	},
	/* Brute force the matches by finding all possible matches from all rules. Then we sort them
	   and cycle through the matches finding and eliminating inner matches. Faster than findMatches,
	   but less robust and prone to erroneous matches. */
	findMatchesLazy: function(code, offset) {
		var wicks = this.wicks,
		    match = null
		    index = 0;
		
		offset = offset || 0;
		
		this.rules.each(function(regex, rule) {
			while ((match = regex.exec(code)) != null) {
				index = (match[1] && match[0].contains(match[1])) ? match.index + match[0].indexOf(match[1]) : match.index;
				wicks.push(new Wick(match[1] || match[0], rule, index + offset));
			}
		}, this);
		return this.purgeWicks(wicks);
	},
	purgeWicks: function(wicks) {
		wicks = wicks.sort(this.compareWicks);
		for (var i = 0, j = 0; i < wicks.length; i++) {
			if (wicks[i] == null) continue;
			for (j = i+1; j < wicks.length && wicks[i] != null; j++) {
				if      (wicks[j] == null)            {continue;}
				else if (wicks[j].isBeyond(wicks[i])) {break;}
				else if (wicks[j].overlaps(wicks[i])) {wicks[i] = null;}
				else if (wicks[i].contains(wicks[j])) {wicks[j] = null;}
			}
		}
		return wicks.clean();
	},
	compareWicks: function(wick1, wick2) {return wick1.index - wick2.index;}
});

Fuel.standard = new Class({ Extends: Fuel, initialize: function(code, options, wicks) { this.parent(code, options, wicks); } });

var Wick = new Class({

	initialize: function(match, type, index) {
		this.text   = match;
		this.type   = type;
		this.index  = index;
		this.length = this.text.length;
		this.end    = this.index + this.length;
	},
	contains: function(wick) { return (wick.index >= this.index && wick.index < this.end); },
	isBeyond: function(wick) { return (this.index >= wick.end); },
	overlaps: function(wick) { return (this.index == wick.index && this.length > wick.length); },
	toString: function() { return this.index+' - '+this.text+' - '+this.end; }
});


/*
---
description: CSS language fuel.

license: MIT-style

authors:
- Jose Prado

requires:
  core/1.3.0: '*'

provides: [Fuel.css]

...
*/
Fuel.css = new Class({
	
	Extends: Fuel,
	language: 'css',
		
	initialize: function(code, options) {
		/** CSS Properties up to CSS3 spec from http://meiert.com/en/indices/css-properties/ */
		this.keywords = new Hash({
			css1: {
				csv: "background-attachment, background-color, background-image, background-position, background-repeat, background, border-bottom, border-bottom-width, border-color, border-left, border-left-width, border-right, border-right-width, border-style, border-top, border-top-width, border-width, border, clear, color, display, float, font-family, font-size, font-style, font-variant, font-weight, font, height, letter-spacing, line-height, list-style-image, list-style-position, list-style-type, list-style, margin-bottom, margin-left, margin-right, margin-top, margin, padding-bottom, padding-left, padding-right, padding-top, padding, text-align, text-decoration, text-indent, text-transform, vertical-align, white-space, width, word-spacing",
				alias: 'kw1'
			},
			css2: {
				csv: "azimuth, border-bottom-color, border-bottom-style, border-collapse, border-left-color, border-left-style, border-right-color, border-right-style, border-spacing, border-top-color, border-top-style, bottom, caption-side, clip, content, counter-increment, counter-reset, cue, cue-after, cue-before, cursor, direction, elevation, empty-cells, left, max-height, max-width, min-height, min-width, orphans, outline, outline-color, outline-style, outline-width, overflow, page-break-after, page-break-before, page-break-inside, pause, pause-after, pause-before, pitch, pitch-range, play-during, position, quotes, richness, right, speak, speak-header, speak-numeral, speak-punctuation, speech-rate, stress, table-layout, top, unicode-bidi, visibility, voice-family, volume, widows, z-index",
				alias: 'kw1'
			},
			css3: {
				csv: "alignment-adjust, alignment-baseline, appearance, background-break, background-clip, background-origin, background-size, baseline-shift, binding, bookmark-label, bookmark-level, bookmark-target, border-bottom-left-radius, border-bottom-right-radius, border-break, border-image, border-length, border-radius, border-top-left-radius, border-top-right-radius, box-align, box-direction, box-flex, box-flex-group, box-lines, box-orient, box-pack, box-shadow, box-sizing, color-profile, column-break-after, column-break-before, column-count, column-fill, column-gap, column-rule, column-rule-color, column-rule-style, column-rule-width, column-span, column-width, columns, crop, display-model, display-role, dominant-baseline, drop-initial-after-adjust, drop-initial-after-align, drop-initial-before-adjust, drop-initial-before-align, drop-initial-size, drop-initial-value, fit, fit-position, float-offset, font-effect, font-emphasize, font-emphasize-position, font-emphasize-style, font-size-adjust, font-smooth, font-stretch, grid-columns, grid-rows, hanging-punctuation, hyphenate-after, hyphenate-before, hyphenate-character, hyphenate-lines, hyphenate-resource, hyphens, icon, image-orientation, image-resolution, inline-box-align, line-stacking, line-stacking-ruby, line-stacking-shift, line-stacking-strategy, mark, mark-after, mark-before, marker-offset, marks, marquee-direction, marquee-play-count, marquee-speed, marquee-style, move-to, nav-down, nav-index, nav-left, nav-right, nav-up, opacity, outline-offset, overflow-style, overflow-x, overflow-y, page, page-policy, phonemes, presentation-level, punctuation-trim, rendering-intent, resize, rest, rest-after, rest-before, rotation, rotation-point, ruby-align, ruby-overhang, ruby-position, ruby-span, size, string-set, tab-side, target, target-name, target-new, target-position, text-align-last, text-emphasis, text-height, text-justify, text-outline, text-replace, text-shadow, text-wrap, voice-balance, voice-duration, voice-pitch, voice-pitch-range, voice-rate, voice-stress, voice-volume, white-space-collapse, word-break, word-wrap",
				alias: 'kw2'
			},
			values: {
				csv: "100, 200, 300, 400, 500, 600, 700, 800, 900, above, absolute, always, aqua, armenian, auto, avoid, baseline, below, bidi-override, black, blink, block, blue, bold, bolder, both, bottom, break-all, break-strict, break-word, break, capitalize, caption, center, circle, cjk-ideographic, close-quote, collapse, compact, condensed, crop, cross, crosshair, dashed, decimal-leading-zero, decimal, default, disc, dotted, double, e-resize, embed, expanded, extra-condensed, extra-expanded, fixed, fuchsia, georgian, gray, green, groove, hand, hebrew, help, hidden, hide, higher, hiragana-iroha, hiragana, icon, inherit, inline-table, inline, inset, inside, invert, italic, justify, katakana-iroha, katakana, keep-all, konq-center, landscape, large, larger, left, level, light, lighter, lime, line-through, list-item, loose, loud, lower-alpha, lower-greek, lower-latin, lower-roman, lowercase, lower, ltr, marker, maroon, medium, menu, message-box, middle, mix, move, n-resize, narrower, navy, ne-resize, never, no-close-quote, no-open-quote, no-repeat, none, normal, nowrap, nw-resize, oblique, olive, open-quote, outset, outside, overline, pointer, portrait, pre-wrap, pre, purple, red, relative, repeat, repeat-x, repeat-y, ridge, right, rtl, run-in, s-resize, scroll, se-resize, semi-condensed, semi-expanded, separate, show, silver, small-caps, small-caption, smaller, small, solid, square, static-position, static, status-bar, sub, super, sw-resize, table-caption, table-cell, table-column-group, table-column, table-footer-group, table-header-group, table-row, table-row-group, table, teal, text-bottom, text-top, text, thick, thin, top, transparent, ultra-condensed, ultra-expanded, underline, upper-alpha, upper-latin, upper-roman, uppercase, visible, w-resize, wait, white, wider, x-large, x-small, xx-large, xx-small, yellow",
				alias: 'kw3'
			}
		});
		this.patterns = new Hash({
			'multiComments': {pattern: this.common.multiComments, alias: 'co1'},
			'strings':       {pattern: this.common.strings,       alias: 'st0'},
			'selectors': {pattern: /([^\}\n]+)\{/gi,              alias: 'se0'},
			'uri':       {pattern: /url\s*\([^\)]*\)/gi,          alias: 'kw4'},
			'units':     {pattern: /\b(\d+[\.\d+]?\s*(px|pt|em|ex|cm|in|mm|pc|%)?)/gi, alias: 'nu0'},
			'hexColors': {pattern: /(#[A-F0-9]{3}([A-F0-9]{3})?)\b/gi,                 alias: 'kw3'},
			'rgbColors': {pattern: /(rgb\s*\(([1-2]?[0-9]{2}(\,\s*)?){3}\))/g,         alias: 'kw3'}
		});
		this.delimiters = new Hash({
			start: this.strictRegExp('<style type="text/css">'),
			end:   this.strictRegExp('</style>')
		})
		this.parent(code, options);
	}
	
});


/*
---
description: HTML language fuel.

license: MIT-style

authors:
- Jose Prado

requires:
  core/1.3.0: '*'

provides: [Fuel.html]

...
*/
Fuel.html = new Class ({
	
	Extends: Fuel,
	language: 'html',
	
	initialize: function(code, options) {
	
		// Ensure Fuel uses lazy match.
		options.matchType = "lazy";
		
		// Common HTML patterns
		this.patterns = new Hash({
			'comments':    {pattern: /(?:\&lt;|<)!--[\s\S]*?--(?:\&gt;|>)/gim,          alias: 'co1'},
			'cdata':       {pattern: /(?:\&lt;|<)!\[CDATA\[[\s\S]*?\]\](?:\&gt;|>)/gim, alias: 'st1'},
			'closingTags': {pattern: /(?:\&lt;|<)\/[A-Z][A-Z0-9]*?(?:\&gt;|>)/gi,       alias: 'kw1'},
			'doctype':     {pattern: /(?:\&lt;|<)!DOCTYPE[\s\S]+?(?:\&gt;|>)/gim,       alias: 'st2'}
		});
		
		// Tags + attributes matching and preprocessing.
		var tagPattern = /((?:\&lt;|<)[A-Z][A-Z0-9]*)(.*?)(\/?(?:\&gt;|>))/gi,
		    attPattern = /\b([\w-]+)([ \t]*)(=)([ \t]*)(['"][^'"]+['"]|[^'" \t]+)/gi,
		    matches    = [],
		    match      = null,
		    attMatch   = null,
		    index      = 0;
		    
		// Create array of matches containing opening tags, attributes, values, and separators.
		while ((match = tagPattern.exec(code)) != null) {
			matches.push(new Wick(match[1], 'kw1', match.index));
			while((attMatch = attPattern.exec(match[2])) != null) {
				index = match.index + match[1].length + attMatch.index;
				matches.push(new Wick(attMatch[1], 'kw2', index)); // Attributes
				index += attMatch[1].length + attMatch[2].length;
				matches.push(new Wick(attMatch[3], 'kw1', index)); // Separators (=)
				index += attMatch[3].length + attMatch[4].length;
				matches.push(new Wick(attMatch[5], 'kw3', index)); // Values
			}
			matches.push(new Wick(match[3], 'kw1', match.index + match[1].length + match[2].length));
		}
		
		this.parent(code, options, matches);
	}
	
});


/*
---
description: JavaScript language fuel.

license: MIT-style

authors:
- Jose Prado

requires:
  core/1.3.0: '*'

provides: [Fuel.js]

...
*/
Fuel.js = new Class({
	
	Extends: Fuel,
	language: 'js',
	
	initialize: function(code, options) {
	
		// Keywords Rule Set
		this.keywords = new Hash({
			commonKeywords: {
				csv: "as, break, case, catch, continue, delete, do, else, eval, finally, for, if, in, is, item, instanceof, return, switch, this, throw, try, typeof, void, while, write, with",
				alias: 'kw1'
			},
			langKeywords: {
				csv: "class, const, default, debugger, export, extends, false, function, import, namespace, new, null, package, private, protected, public, super, true, use, var",
				alias: 'kw2'
			},
			windowKeywords: {
				csv: "alert, back, blur, close, confirm, focus, forward, home, navigate, onblur, onerror, onfocus, onload, onmove, onresize, onunload, open, print, prompt, scroll, status, stop",
				alias: 'kw3'
			}
		});
		
		// RegEx Rule Set
		this.patterns = new Hash({
			'slashComments': {pattern: this.common.slashComments, alias: 'co1'},
			'multiComments': {pattern: this.common.multiComments, alias: 'co2'},
			'strings':       {pattern: this.common.strings,       alias: 'st0'},
			'methodCalls':   {pattern: this.common.properties,    alias: 'me0'},
			'brackets':      {pattern: this.common.brackets,      alias: 'br0'},
			'numbers':       {pattern: /\b((([0-9]+)?\.)?[0-9_]+([e][-+]?[0-9]+)?|0x[A-F0-9]+)\b/gi, alias: 'nu0'},
			'regex':         {pattern: this.delimToRegExp("/", "\\", "/", "g", "[gimy]*"), alias: 're0'},
			'symbols':       {pattern: /\+|-|\*|\/|%|!|@|&|\||\^|\<|\>|=|,|\.|;|\?|:/g,     alias: 'sy0'}
		});
		
		// Delimiters
		this.delimiters = new Hash({
			start: this.strictRegExp('<script type="text/javascript">', '<script language="javascript">'),
			end:   this.strictRegExp('</script>')
		});
		
		this.parent(code, options);
	}
});


/*
---
description: PHP language fuel.

license: MIT-style

authors:
- Jose Prado

requires:
  core/1.3.0: '*'

provides: [Fuel.php]

...
*/
Fuel.php = new Class({
	
	Extends: Fuel,
	language: 'php',
	
	initialize: function(code, options, wicks) {
	
		this.keywords = new Hash({
			keywords: {
				csv: "abstract, and, as, break, case, catch, cfunction, class, clone, const, continue, declare, default, do, else, elseif, enddeclare, endfor, endforeach, endif, endswitch, endwhile, extends, final, for, foreach, function, global, goto, if, implements, interface, instanceof, namespace, new, old_function, or, private, protected, public, static, switch, throw, try, use, var, while, xor",
				alias: 'kw1'
			},
			langConstants: {
				csv: "__CLASS__, __DIR__, __FILE__, __FUNCTION__, __METHOD__, __NAMESPACE__, DEFAULT_INCLUDE_PATH, E_ALL, E_COMPILE_ERROR, E_COMPILE_WARNING, E_CORE_ERROR, E_CORE_WARNING, E_ERROR, E_NOTICE, E_PARSE, E_STRICT, E_USER_ERROR, E_USER_NOTICE, E_USER_WARNING, E_WARNING, PEAR_EXTENSION_DIR, PEAR_INSTALL_DIR, PHP_BINDIR, PHP_CONFIG_FILE_PATH, PHP_DATADIR, PHP_EXTENSION_DIR, PHP_LIBDIR, PHP_LOCALSTATEDIR, PHP_OS, PHP_OUTPUT_HANDLER_CONT, PHP_OUTPUT_HANDLER_END, PHP_OUTPUT_HANDLER_START, PHP_SYSCONFDIR, PHP_VERSION",
				alias: 'kw1'
			},
			constructs: {
				csv: "array, die, echo, empty, exit, eval, include, include_once, isset, list, require, require_once, return, print, unset",
				alias: 'kw1'
			},
			commonFuncs: {
				csv: "abs, addcslashes, addslashes, aggregate, apache_child_terminate, apache_get_version, apache_lookup_uri, apache_note, apache_request_headers, apache_response_headers, apache_setenv, array_change_key_case, array_chunk, array_count_values, array_diff, array_diff_assoc, array_fill, array_filter, array_flip, array_intersect, array_intersect_assoc, array_key_exists, array_keys, array_map, array_merge, array_merge_recursive, array_multisort, array_pad, array_pop, array_push, array_rand, array_reduce, array_reverse, array_search, array_shift, array_slice, array_splice, array_sum, array_unique, array_unshift, array_values, array_walk, arsort, asort, assert, assert_options, base64_decode, base64_encode, base_convert, basename, bin2hex, bindec, ceil, chdir, checkdate, chop, chown, chunk_split, clearstatcache, closedir, compact, connection_aborted, connection_status, constant, copy, count, count_chars, crc32, crypt, ctype_alnum, ctype_alpha, ctype_cntrl, ctype_digit, ctype_graph, ctype_lower, ctype_print, ctype_punct, ctype_space, ctype_upper, ctype_xdigit, current, date, debug_backtrace, debug_zval_dump, decbin, dechex, decoct, define, defined, dir, dirname, dl, doubleval, each, end, ereg, ereg_replace, eregi, eregi_replace, error_log, error_reporting, escapeshellarg, escapeshellcmd, exec, explode, extension_loaded, extract, fclose, feof, fflush, fgetc, fgetcsv, fgets, fgetss, file, file_exists, file_get_contents, fileatime, filectime, filegroup, fileinode, filemtime, fileowner, fileperms, filesize, filetype, floatval, flock, floor, flush, fmod, fnmatch, fopen, fpassthru, fputs, fread, fscanf, fseek, fsockopen, fstat, ftell, ftok, ftruncate, func_get_arg, func_get_args, func_num_args, fwrite, get_browser, get_cfg_var, get_declared_classes, get_extension_funcs, get_include_path, get_loaded_extensions, get_magic_quotes_gpc, get_magic_quotes_runtime, get_meta_tags, getallheaders, getcwd, getdate, getenv, getimagesize, getopt, getrandmax, getrusage, gettimeofday, gettype, glob, global, gmdate, gmmktime, gmstrftime, header, headers_sent, hebrev, hebrevc, hexdec, highlight_file, highlight_string, html_entity_decode, htmlentities, htmlspecialchars, ignore_user_abort, image_type_to_mime_type, implode, import_request_variables, in_array, ini_alter, ini_get, ini_get_all, ini_restore, ini_set, intval, ip2long, is_array, is_bool, is_dir, is_double, is_executable, is_file, is_finite, is_float, is_infinite, is_int, is_integer, is_link, is_long, is_nan, is_null, is_numeric, is_object, is_readable, is_real, is_resource, is_scalar, is_string, is_uploaded_file, is_writable, is_writeable, join, key, key_exists, krsort, ksort, link, linkinfo, localeconv, localtime, long2ip, lstat, ltrim, magic_quotes_runtime, mail, max, md5, md5_file, memory_get_usage, microtime, min, mkdir, mktime, move_uploaded_file, mt_getrandmax, mt_rand, mt_srand, natcasesort, natsort, next, nl2br, number_format, ob_clean, ob_end_clean, ob_end_flush, ob_flush, ob_get_clean, ob_get_contents, ob_get_flush, ob_get_length, ob_get_level, ob_get_status, ob_implicit_flush, ob_list_handlers, ob_start, octdec, opendir, overload, pack, parse_ini_file, parse_str, parse_url, passthru, pathinfo, pclose, pfsockopen, pg_affected_rows, pg_cancel_query, pg_client_encoding, pg_close, pg_cmdtuples, pg_connect, pg_connection_busy, pg_connection_reset, pg_connection_status, pg_convert, pg_copy_from, pg_copy_to, pg_dbname, pg_delete, pg_end_copy, pg_errormessage, pg_escape_bytea, pg_escape_string, pg_exec, pg_fetch_all, pg_fetch_array, pg_fetch_assoc, pg_fetch_object, pg_fetch_result, pg_fetch_row, pg_field_is_null, pg_field_name, pg_field_num, pg_field_prtlen, pg_field_size, pg_field_type, pg_fieldisnull, pg_fieldname, pg_fieldnum, pg_fieldprtlen, pg_fieldsize, pg_fieldtype, pg_free_result, pg_freeresult, pg_get_notify, pg_get_pid, pg_get_result, pg_getlastoid, pg_host, pg_insert, pg_last_error, pg_last_notice, pg_last_oid, pg_lo_close, pg_lo_create, pg_lo_export, pg_lo_import, pg_lo_open, pg_lo_read, pg_lo_read_all, pg_lo_seek, pg_lo_tell, pg_lo_unlink, pg_lo_write, pg_loclose, pg_locreate, pg_loexport, pg_loimport, pg_loopen, pg_loread, pg_loreadall, pg_lounlink, pg_lowrite, pg_meta_data, pg_num_fields, pg_num_rows, pg_numfields, pg_numrows, pg_options, pg_pconnect, pg_ping, pg_port, pg_put_line, pg_query, pg_result, pg_result_error, pg_result_seek, pg_result_status, pg_select, pg_send_query, pg_set_client_encoding, pg_trace, pg_tty, pg_unescape_bytea, pg_untrace, pg_update, phpcredits, phpinfo, phpversion, popen, pos, preg_grep, preg_match, preg_match_all, preg_quote, preg_replace, preg_replace_callback, preg_split, prev, print_r, printf, proc_close, proc_open, putenv, quoted_printable_decode, quotemeta, rand, range, rawurldecode, rawurlencode, readdir, readfile, readlink, realpath, rename, reset, restore_error_handler, restore_include_path, rewind, rewinddir, rmdir, round, rsort, rtrim, serialize, session_cache_expire, session_cache_limiter, session_decode, session_destroy, session_encode, session_get_cookie_params, session_id, session_is_registered, session_module_name, session_name, session_regenerate_id, session_register, session_save_path, session_set_cookie_params, session_set_save_handler, session_start, session_unregister, session_unset, session_write_close, set_error_handler, set_file_buffer, set_include_path, set_magic_quotes_runtime, set_socket_blocking, set_time_limit, setcookie, setlocale, settype, shell_exec, show_source, shuffle, similar_text, sizeof, sleep, socket_get_status, socket_set_blocking, socket_set_timeout, sort, split, spliti, sprintf, sql_regcase, srand, sscanf, stat, static, str_pad, str_repeat, str_replace, str_rot13, str_shuffle, str_word_count, strcasecmp, strchr, strcmp, strcoll, strcspn, stream_context_create, stream_context_get_options, stream_context_set_option, stream_context_set_params, stream_filter_append, stream_filter_prepend, stream_get_meta_data, stream_register_wrapper, stream_select, stream_set_blocking, stream_set_timeout, stream_set_write_buffer, stream_wrapper_register, strftime, strip_tags, stripcslashes, stripslashes, stristr, strlen, strnatcasecmp, strnatcmp, strncasecmp, strncmp, strpos, strrchr, strrev, strrpos, strspn, strstr, strtok, strtolower, strtotime, strtoupper, strtr, strval, substr, substr_count, substr_replace, system, tempnam, time, tmpfile, touch, trigger_error, trim, uasort, ucfirst, ucwords, uksort, umask, uniqid, unlink, unpack, unserialize, urldecode, urlencode, user_error, usleep, usort, var_dump, var_export, version_compare, virtual, vprintf, vsprintf, wordwrap",
				alias: 'kw2'
			},
			database: {
				csv: "mysql, mysql_affected_rows, mysql_client_encoding, mysql_close, mysql_connect, mysql_create_db, mysql_createdb, mysql_data_seek, mysql_db_name, mysql_db_query, mysql_dbname, mysql_drop_db, mysql_dropdb, mysql_errno, mysql_error, mysql_escape_string, mysql_fetch_array, mysql_fetch_assoc, mysql_fetch_field, mysql_fetch_lengths, mysql_fetch_object, mysql_fetch_row, mysql_field_flags, mysql_field_len, mysql_field_name, mysql_field_seek, mysql_field_table, mysql_field_type, mysql_fieldflags, mysql_fieldlen, mysql_fieldname, mysql_fieldtable, mysql_fieldtype, mysql_free_result, mysql_freeresult, mysql_get_client_info, mysql_get_host_info, mysql_get_proto_info, mysql_get_server_info, mysql_info, mysql_insert_id, mysql_list_dbs, mysql_list_fields, mysql_list_processes, mysql_list_tables, mysql_listdbs, mysql_listfields, mysql_listtables, mysql_num_fields, mysql_num_rows, mysql_numfields, mysql_numrows, mysql_pconnect, mysql_query, mysql_real_escape_string, mysql_result, mysql_select_db, mysql_selectdb, mysql_stat, mysql_table_name, mysql_tablename, mysql_thread_id, mysql_unbuffered_query, mysqli, mysqli_affected_rows, mysqli_autocommit, mysqli_bind_param, mysqli_bind_result, mysqli_change_user, mysqli_character_set_name, mysqli_client_encoding, mysqli_close, mysqli_commit, mysqli_connect, mysqli_data_seek, mysqli_debug, mysqli_disable_reads_from_master, mysqli_disable_rpl_parse, mysqli_dump_debug_info, mysqli_enable_reads_from_master, mysqli_enable_rpl_parse, mysqli_errno, mysqli_error, mysqli_escape_string, mysqli_execute, mysqli_fetch, mysqli_fetch_array, mysqli_fetch_assoc, mysqli_fetch_field, mysqli_fetch_field_direct, mysqli_fetch_fields, mysqli_fetch_lengths, mysqli_fetch_object, mysqli_fetch_row, mysqli_field_count, mysqli_field_seek, mysqli_field_tell, mysqli_free_result, mysqli_get_client_info, mysqli_get_host_info, mysqli_get_proto_info, mysqli_get_server_info, mysqli_get_server_version, mysqli_info, mysqli_init, mysqli_insert_id, mysqli_kill, mysqli_master_query, mysqli_num_fields, mysqli_num_rows, mysqli_options, mysqli_param_count, mysqli_ping, mysqli_prepare, mysqli_prepare_result, mysqli_profiler, mysqli_query, mysqli_read_query_result, mysqli_real_connect, mysqli_real_escape_string, mysqli_real_query, mysqli_reload, mysqli_rollback, mysqli_rpl_parse_enabled, mysqli_rpl_probe, mysqli_rpl_query_type, mysqli_select_db, mysqli_send_long_data, mysqli_send_query, mysqli_set_opt, mysqli_slave_query, mysqli_ssl_set, mysqli_stat, mysqli_stmt_affected_rows, mysqli_stmt_close, mysqli_stmt_errno, mysqli_stmt_error, mysqli_stmt_store_result, mysqli_store_result, mysqli_thread_id, mysqli_thread_safe, mysqli_use_result, mysqli_warning_count",
				alias: 'kw2'
			}
		});
		
		this.patterns = new Hash({
			'slashComments': {pattern: this.common.slashComments, alias: 'co1'},
			'multiComments': {pattern: this.common.multiComments, alias: 'co2'},
			'strings':       {pattern: this.common.strings,       alias: 'st0'},
			'heredocs':      {pattern: /(<<<\s*?(\'?)([A-Z0-9]+)\2[^\n]*?\n[\s\S]*?\n\3(?![A-Z0-9\s]))/gim, alias: 'st1'},
			'numbers':       {pattern: /\b((([0-9]+)?\.)?[0-9_]+([e][\-+]?[0-9]+)?|0x[A-F0-9]+)\b/gi,       alias: 'nu0'},
			'variables':     {pattern: /[\$]{1,2}[A-Z_][\w]*/gim, alias: 'kw3'},
			'functions':     {pattern: this.common.functionCalls, alias: 'me1'},
			'constants':     {pattern: /\b[A-Za-z_][\w]*\b/g,     alias: 'kw4'},
			'methods':       {pattern: /->([\w]+)/gim,            alias: 'kw3'},
			'brackets':      {pattern: this.common.brackets,      alias: 'br0'}
			//'symbols':     {pattern: /!|@|%|&|\||\/|<|>|=|-|\+|\*|\.|:|,|;/g, alias: 'sy0'}
		});
		
		// Delimiters
		this.delimiters = new Hash({
			start: this.strictRegExp('<?php', '<?=', '<%', '<script language="php">'),
			end:   this.strictRegExp('?>', '%>', '</script>')
		});
		
		this.parent(code, options, wicks);
	}
});



/*
---
description: Shell language fuel.

license: MIT-style

authors:
- Jose Prado

requires:
  core/1.3.0: '*'

provides: [Fuel.shell]

...
*/
Fuel.shell = new Class ({
	
	Extends: Fuel,
	language: 'shell',
	
	initialize: function(lighter, options) {
		
		/** Set of keywords in CSV form. Add multiple keyword hashes for differentiate keyword sets. */
		this.keywords = new Hash({
			keywords: {
				csv: 'if, fi, then, elif, else, for, do, done, until, while, break, continue, case, function, return, in, eq, ne, gt, lt, ge, le',
				alias: 'kw0'
			},
			commands: {
				csv: 'alias, apropos, awk, bash, bc, bg, builtin, bzip2, cal, cat, cd, cfdisk, chgrp, chmod, chown, chrootcksum, clear, cmp, comm, command, cp, cron, crontab, csplit, cut, date, dc, dd, ddrescue, declare, df, diff, diff3, dig, dir, dircolors, dirname, dirs, du, echo, egrep, eject, enable, env, ethtool, eval, exec, exit, expand, export, expr, false, fdformat, fdisk, fg, fgrep, file, find, fmt, fold, format, free, fsck, ftp, gawk, getopts, grep, groups, gzip, hash, head, history, hostname, id, ifconfig, import, install, join, kill, less, let, ln, local, locate, logname, logout, look, lpc, lpr, lprint, lprintd, lprintq, lprm, ls, lsof, make, man, mkdir, mkfifo, mkisofs, mknod, more, mount, mtools, mv, netstat, nice, nl, nohup, nslookup, open, op, passwd, paste, pathchk, ping, popd, pr, printcap, printenv, printf, ps, pushd, pwd, quota, quotacheck, quotactl, ram, rcp, read, readonly, renice, remsync, rm, rmdir, rsync, screen, scp, sdiff, sed, select, seq, set, sftp, shift, shopt, shutdown, sleep, sort, source, split, ssh, strace, su, sudo, sum, symlink, sync, tail, tar, tee, test, time, times, touch, top, traceroute, trap, tr, true, tsort, tty, type, ulimit, umask, umount, unalias, uname, unexpand, uniq, units, unset, unshar, useradd, usermod, users, uuencode, uudecode, v, vdir, vi, watch, wc, whereis, which, who, whoami, wget, xargs, yes',
				alias: 'kw1'
			}
		}),
		
		/** Set of RegEx patterns to match */
		this.patterns = new Hash({
			'poundComments': {pattern: this.common.poundComments, alias: 'co0'},
			'strings':       {pattern: this.common.strings, alias: 'st0'}
		});
		
		// Call parent constructor AFTER instance variables are set.
		this.parent(lighter, options);
	}
	
});


/*
---
description: SQL language fuel.

license: MIT-style

authors:
- Jose Prado

requires:
  core/1.3.0: '*'

provides: [Fuel.sql]

...
*/
Fuel.sql = new Class ({
	
	Extends: Fuel,
	language: 'sql',
	
	initialize: function(lighter, options) {
		
		/** Set of keywords in CSV form. Add multiple keyword hashes for differentiate keyword sets. */
		this.keywords = new Hash({
			keywords: {
				csv: 'absolute, action, add, after, alter, as, asc, at, authorization, begin, bigint, binary, bit, by, cascade, char, character, check, checkpoint, close, collate, column, commit, committed, connect, connection, constraint, contains, continue, create, cube, current, current_date, current_time, cursor, database, date, deallocate, dec, decimal, declare, default, delete, desc, distinct, double, drop, dynamic, else, end, end-exec, escape, except, exec, execute, false, fetch, first, float, for, force, foreign, forward, free, from, full, function, global, goto, grant, group, grouping, having, hour, ignore, index, inner, insensitive, insert, instead, int, integer, intersect, into, is, isolation, key, last, level, load, local, max, min, minute, modify, move, name, national, nchar, next, no, numeric, of, off, on, only, open, option, order, out, output, partial, password, precision, prepare, primary, prior, privileges, procedure, public, read, real, references, relative, repeatable, restrict, return, returns, revoke, rollback, rollup, rows, rule, schema, scroll, second, section, select, sequence, serializable, set, size, smallint, static, statistics, table, temp, temporary, then, time, timestamp, to, top, transaction, translation, trigger, true, truncate, uncommitted, union, unique, update, values, varchar, varying, view, when, where, with, work',
				alias: 'kw1',
				mod: 'gi'
			},
			functions: {
				csv: 'abs, avg, case, cast, coalesce, convert, count, current_timestamp, current_user, day, isnull, left, lower, month, nullif, replace, right, session_user, space, substring, sum, system_user, upper, user, year',
				alias: 'kw2',
				mod: 'gi'
			},
			operators: {
				csv: 'all, and, any, between, cross, in, join, like, not, null, or, outer, some',
				alias: 'kw3',
				mod: 'gi'
			}
		}),
		
		/** Set of RegEx patterns to match */
		this.patterns = new Hash({
			'singleLineComments': {pattern: /--(.*)$/gm, alias: 'co0'},
			'multiLineComments':  {pattern: this.common.multiComments, alias: 'co1'},
			'multiLineStrings':   {pattern: this.common.multiLineStrings, alias: 'st0'}
		});
		
		// Call parent constructor AFTER instance variables are set.
		this.parent(lighter, options);
	}
	
});
