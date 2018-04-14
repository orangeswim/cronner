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
     * 
     * Changes: removed UTC from date functions. all work is now in local time
     *          
     *          if(a === 5 && match[d] === 7)match[v] = 0; from CRONNER.prototype.inspect = function(string){ 
     *          changed match[v] to match[d], v is undefined
	 */ 
    var CRONNER = function (rule) {

        function wildHelper(arg) {
            return (arg == -1) ? "*" : arg;

        }

        if (arguments.length == 1) {
            this.rule = this.inspect(rule);
        } else if (arguments.length == 5) {
            //construct string
            var minutes = wildHelper(arguments[0]);
            var hours = wildHelper(arguments[1]);
            var dayofmonth = wildHelper(arguments[2]);
            var month = wildHelper(arguments[3]);
            var dayofweek = wildHelper(arguments[4]);
            constructed_rule = `0 ${minutes} ${hours} ${dayofmonth} ${month} ${dayofweek} *`;
            this.rule = this.inspect(constructed_rule);
        } else {
            throw "bad parameters"
        }
	};

	/**
	 * Parse date object as string in DMY format.
	 * @param {Date} date Date object.
	 * @return {String} Formatted date.
	 */
	CRONNER.parse = function(date){
		return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + " " + date.getDate() + "." + (date.getMonth() + 1 ) + "." + date.getFullYear();
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
        /^(\d+)-(\d+)\/(\d+)$/,
        /^(\d+)\/(\d+)$/        
	];

	/**
	 * Collection of functions for time manipulation.
	 * Each time section has 4 functions: set, get, increment by one and reset.
	 * @type {Object}
	 */
	CRONNER.fns = {
		// Seconds (from 0-59)
		0 : [
			Date.prototype.setSeconds,
			Date.prototype.getSeconds,
			function(){return this.setSeconds(i = this.getSeconds() + 1) && i > 59 ? true : false;},
            function () { this.setSeconds(0) },
            1000
		],

		// Minutes (from 0-59)
		1 : [
			Date.prototype.setMinutes,
			Date.prototype.getMinutes,
			function(){return this.setMinutes(i = this.getMinutes() + 1) && i > 59 ? true : false;},
            function () { this.setMinutes(0); },
            1000*60
		],

		// Hours (from 0-23)
		2 : [
			Date.prototype.setHours,
			Date.prototype.getHours,
			function(){return this.setHours(i = this.getHours() + 1) && i > 23 ? true : false;},
            function () { this.setHours(0); },
            1000*60*60
		],

		// Day of the month (from 1-31)
		3 : [
			Date.prototype.setDate,
			Date.prototype.getDate,
			function(){return this.setDate(i = this.getDate() + 1) && i > CRONNER.days(this.getMonth(),this.getFullYear()) ? true : false;},
            function () { this.setDate(1); },
            1000*60*60*24
		],

		// Month (from 0-11)
		4 : [
			Date.prototype.setMonth,
			Date.prototype.getMonth,
			function(){return this.setMonth(i = this.getMonth() + 1) && i > 11 ? true : false;},
			function(){this.setMonth(0,1);}
		],

		// Day of week (from 0-6)
		5 : [
			Date.prototype.setDate,
			Date.prototype.getDay,
			function(){return CRONNER.fns[3][2].call(this);},
			function(){return CRONNER.fns[3][3].call(this);}
		],

		// Year (four digits)
		6 : [
			Date.prototype.setFullYear,
			Date.prototype.getFullYear,
			function(){return this.setFullYear(this.getFullYear() + 1) ? true : false;},
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
							if(a === 5 && match[d] === 7)match[d] = 0; //dayofweek rollover on 7
							if(a === 4 && typeof match[d] === "number")match[d] = match[d] - 1; //month offset for date
                        }
                        if ( c === 4 && ((a === 5) || (a === 4) || (a === 6)) )  {
                            match = 0;
                            break;
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
                ) ||
                //(r[j][x].type === 4 && (CRONNER.fns[j][1].call(date) - r[j][x].values[0] ) % r[j][x].values[1] === 0)
                (r[j][x].type === 4 && (date.getTime() - r[j][x].values[0] ) % (r[j][x].values[1] * CRONNER.fns[j][4]) === 0)
			){
				return true;
			}
		}
		return false;
	};

    /**
     *  Original code from https://gist.github.com/flangofas/714f401b63a1c3d84aaa
     * @param {any} miliseconds
     * @param {any} format
     */
    function convertMiliseconds(miliseconds, format) {
        var days, hours, minutes, seconds, total_hours, total_minutes, total_seconds;

        total_seconds = parseInt(Math.floor(miliseconds / 1000));
        total_minutes = parseInt(Math.floor(total_seconds / 60));
        total_hours = parseInt(Math.floor(total_minutes / 60));
        days = parseInt(Math.floor(total_hours / 24));

        seconds = parseInt(total_seconds % 60);
        minutes = parseInt(total_minutes % 60);
        hours = parseInt(total_hours % 24);

        switch (format) {
            case 's':
                return total_seconds;
                break;
            case 'm':
                return total_minutes;
                break;
            case 'h':
                return total_hours;
                break;
            case 'd':
                return days;
                break;
            default:
                return { d: days, h: hours, m: minutes, s: seconds };
        }
    };

	/**
	 * Get next run time from given time.
	 * @param {Date} from Date from which to find next matching time.
	 * @return {Date|Boolean} Returns false, if no matching time found or Date object for the next run time.
	 */
	CRONNER.prototype.nextDate = function(from){
        var nextDate = (from)? new Date(from) : new Date();
        nextDate.setSeconds(nextDate.getSeconds() + 1); //next date should always be different!
		var rule = this.rule;
		var i = 0;
		var segmentIndex = 6;
		var s;
		var reset;

		/**
		 * The day of a command's execution can be specified by
		 * two  fields - day of month, and day of week. If both
		 * fields are restricted (ie, aren't *), the command will be
		 * run when either field matches the current time.
		 */
		var either = rule[3][0].values[0] !== false && rule[5][0].values[0] !== false ? true : false;
		while(true && i++ < 512){
			if(
				(!either && !this.match(nextDate , segmentIndex)) ||
				(either && 
					(
						(segmentIndex === 3 && !this.match(nextDate , segmentIndex) && !this.match(nextDate , 5)) ||
						(segmentIndex !== 3 && !this.match(nextDate , segmentIndex))
					)
				)
            ) {
                // There is no match
				reset = CRONNER.fns[segmentIndex][2].call(nextDate);
				for(s = segmentIndex - 1 ; s >= 0 ; s--)CRONNER.fns[s][3].call(nextDate);
				if(reset)segmentIndex = 6; //if there is a segment roll-over, restart matching from beginning
				continue;
            } else {
                // There is a match and move to the next segment
				segmentIndex--;
				if(either && segmentIndex === 5)segmentIndex--; // Skip day of week as we going to check it in day of month section.
				if(segmentIndex < 0)return nextDate;
			}
		}
		return false;
	};
	return CRONNER;
});