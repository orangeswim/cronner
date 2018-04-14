/* jshint -W030 */
!function(root, factory) {
	if (typeof define === "function" && define.amd) {
		define("cronner" , function(){
			return factory(root);
		});
	}else if(module && module.exports){
		module.exports = factory(root);
	}else{
		root.CRONNER = factory(root);
	}
}(this, function(root){
	/**
	 * Constructor for CRONNER object.
	 * @param {string} rule Cron rule in the form of: "(seconds) (minutes) (hours) (day of month) (month) (day of week) (year)".
	 * 
	 * RULE SEGEMENT EXPLANATION
	 * 0 seconds: 0-59
	 * 1 minutes: 0-59
	 * 2 hours: 0-23
	 * 3 day of month: 1-31
	 * 4 month: 1-12
	 * 5 day of week: 0-7 (0 or 7 is Sunday)
	 * 6 year: four digit year
	 * 
	 * SUPPORTED RULE FEATURES
	 * Rule groups: 1,2,3,4
	 * Ranges: 1-4 (includes 1,2,3,4)
	 * Steps: *\2 (every two hours)
	 * Steps combined with ranges: 0-9\2 (includes 0,2,4,6,8)
	 *
	 * EXAMPLES
	 * 1-10   = 1,2,3,4,5,6,7,8,9,10
	 * 1-10/2 = 1,3,5,7,9
	 * 2-12   = 2,3,4,5,6,7,8,9,10,11,12
	 * 2-12/3 = 2,3,5,6,8,9,11,12
	 */
	var CRONNER = function(rule){
		this.rule = this.inspect(rule);
	};

	/**
	 * Parse date object as string in DMY format.
	 * @param {Date} date Date object.
	 * @return {String} Formatted date.
	 */
	CRONNER.parse = function(date){
		return date.getUTCHours() + ":" + date.getUTCMinutes() + ":" + date.getUTCSeconds() + " " + date.getUTCDate() + "." + (date.getUTCMonth() + 1 ) + "." + date.getUTCFullYear();
	};

	/**
	 * Get number of days in month.
	 * @param {Number} m Month.
	 * @param {Number} y Year.
	 * @return {Number} Returns number of days in requested day.
	 * Solution from user James at http://stackoverflow.com/questions/1810984/number-of-days-in-any-month
	 */
	CRONNER.days = function(m , y){
		 return /8|3|5|10/.test(--m)?30:m==1?(!y%4&&y%100)||!y%400?29:28:31;
	};

	/**
	 * Collection of regular expressions for rules.
	 * @type {Array}
	 */
	CRONNER.reg = [
		/^(\d+|\*)$/,
		/^(\d+)-(\d+)$/,
		/^\*\/(\d+)$/,
		/^(\d+)-(\d+)\/(\d+)$/
	];

	/**
	 * Collection of functions for time manipulation.
	 * Each time section has 4 functions: set, get, increment by one and reset.
	 * @type {Object}
	 */
	CRONNER.fns = {
		// Seconds (from 0-59)
		0 : [
			Date.prototype.setUTCSeconds,
			Date.prototype.getUTCSeconds,
			function(){return this.setUTCSeconds(i = this.getUTCSeconds() + 1) && i > 59 ? true : false;},
			function(){this.setUTCSeconds(0);}
		],

		// Minutes (from 0-59)
		1 : [
			Date.prototype.setUTCMinutes,
			Date.prototype.getUTCMinutes,
			function(){return this.setUTCMinutes(i = this.getUTCMinutes() + 1) && i > 59 ? true : false;},
			function(){this.setUTCMinutes(0);}
		],

		// Hours (from 0-23)
		2 : [
			Date.prototype.setUTCHours,
			Date.prototype.getUTCHours,
			function(){return this.setUTCHours(i = this.getUTCHours() + 1) && i > 23 ? true : false;},
			function(){this.setUTCHours(0);}
		],

		// Day of the month (from 1-31)
		3 : [
			Date.prototype.setUTCDate,
			Date.prototype.getUTCDate,
			function(){return this.setUTCDate(i = this.getUTCDate() + 1) && i > CRONNER.days(this.getUTCMonth(),this.getUTCFullYear()) ? true : false;},
			function(){this.setUTCDate(1);}
		],

		// Month (from 0-11)
		4 : [
			Date.prototype.setUTCMonth,
			Date.prototype.getUTCMonth,
			function(){return this.setUTCMonth(i = this.getUTCMonth() + 1) && i > 11 ? true : false;},
			function(){this.setUTCMonth(0,1);}
		],

		// Day of week (from 0-6)
		5 : [
			Date.prototype.setUTCDate,
			Date.prototype.getUTCDay,
			function(){return CRONNER.fns[3][2].call(this);},
			function(){return CRONNER.fns[3][3].call(this);}
		],

		// Year (four digits)
		6 : [
			Date.prototype.setUTCFullYear,
			Date.prototype.getUTCFullYear,
			function(){return this.setUTCFullYear(this.getUTCFullYear() + 1) ? true : false;},
			function(){}
		]
	};

	/**
	 * Checks if cron rule pattern is correct and converts it to object.
	 * @param {String} string Cron rule.
	 * @return {Boolean|Object} Returns false if rule pattern is invalid. Otherwise returns rule object for CRONNER application use.
	 */
	CRONNER.prototype.inspect = function(string){
		var segments = string.split(" ");
		if(segments.length === 5)// Add seconds if omitted by user.
			segments.unshift("0");
		if(segments.length === 6)// Add years if omitted by user.
			segments.push("*");
		if(segments.length !== 7)// Check total length.
			throw("Invalid number of segments in '" + string + "'.");

		var l3 = CRONNER.reg.length;

		for(var a = 0 , l1 = segments.length ; a < l1 ; a++){
			segments[a] = segments[a].split(",");
			for(var b = 0 , l2 = segments[a].length ; b < l2 ; b++){
				for(var c = 0 ; c < l3 ; c++){
					if( (match = CRONNER.reg[c].exec(segments[a][b])) ){
						match.shift();
						delete match.index;
						delete match.input;
						for(var d in match){
							match[d] = match[d] == "*" ? false : parseInt(match[d]);
							if(a === 5 && match[d] === 7)match[v] = 0;
							if(a === 4 && typeof match[d] === "number")match[d] = match[d] - 1;
						}
						segments[a][b] = {
							type : c,
							values : match
						};
						break;
					}
				}
				if(!match)throw("Invalid pattern '" + segments[a][b] + "'.");
			}
		}
		return segments;
	};

	/**
	 * Check if all the patters match the date.
	 * @param {Date} date Date to check.
	 * @param {Number} j Cron rule segment index.
	 * @return {Boolean} Returns true/false wether match was made or not.
	 */
	CRONNER.prototype.match = function(date , j){
		var r = this.rule;
		for(var x in r[j]){
			if(
				(r[j][x].type === 0 && (r[j][x].values[0] === false || CRONNER.fns[j][1].call(date) == r[j][x].values[0] )) ||
				(r[j][x].type === 1 && (CRONNER.fns[j][1].call(date) >= r[j][x].values[0] && CRONNER.fns[j][1].call(date) <= r[j][x].values[1] )) ||
				(r[j][x].type === 2 && CRONNER.fns[j][1].call(date) % r[j][x].values[0] === 0) ||
				(
					r[j][x].type === 3 &&
					(CRONNER.fns[j][1].call(date) >= r[j][x].values[0] && CRONNER.fns[j][1].call(date) <= r[j][x].values[1] ) &&
					(((CRONNER.fns[j][1].call(date) - r[j][x].values[0]) + 1) % r[j][x].values[2] !== 0)
				)
			){
				return true;
			}
		}
		return false;
	};

	/**
	 * Get next run time from given time.
	 * @param {Date} from Date from which to find next matching time.
	 * @return {Date|Boolean} Returns false, if no matching time found or Date object for the next run time.
	 */
	CRONNER.prototype.nextDate = function(from){
		var nextDate = from || new Date();
		var r = this.rule;
		var i = 0;
		var j = 6;
		var s;
		var reset;

		/**
		 * The day of a command's execution can be specified by
		 * two  fields - day of month, and day of week. If both
		 * fields are restricted (ie, aren't *), the command will be
		 * run when either field matches the current time.
		 */
		var either = r[3][0].values[0] !== false && r[5][0].values[0] !== false ? true : false;
		while(true && i++ < 512){
			if(
				(!either && !this.match(nextDate , j)) ||
				(either && 
					(
						(j === 3 && !this.match(nextDate , j) && !this.match(nextDate , 5)) ||
						(j !== 3 && !this.match(nextDate , j))
					)
				)
			){
				reset = CRONNER.fns[j][2].call(nextDate);
				for(s = j - 1 ; s >= 0 ; s--)CRONNER.fns[s][3].call(nextDate);
				if(reset)j = 6;
				continue;
			}else{
				j--;
				if(either && j === 5)j--; // Skip day of week as we going to check it in day of month section.
				if(j < 0)return nextDate;
			}
		}
		return false;
	};
	return CRONNER;
});