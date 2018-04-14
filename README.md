# Cronner #

## Version ##

0.0.2

## Usage ##

```
#!javascript

// Create cronner object: "(seconds) (minutes) (hours) (day of month) (month) (day of week) (year)".
// Seconds and year are optional. Year can not be specified without seconds.
var cronner = new Cronner("* * * * * * *");
// Get next run time from current datetime.
var next = cronner.nextDate();
// Get next run time from specified datetime.
var nextFrom = cronner.nextDate(new Date());
```

## Possible rule values ##

* seconds: 0-59
* minutes: 0-59
* hours: 0-23
* day of month: 1-31
* month: 1-12
* day of week: 0-7 (0 or 7 is Sunday)
* year: four digit year

## Supported features ##
* Rule groups: 1,2,3,4
* Ranges: 1-4 (includes 1,2,3,4)
* Steps: *\2 (every two hours)
* Steps combined with ranges: 0-9\2 (includes 0,2,4,6,8)

### Examples ###
* 1-10   = 1,2,3,4,5,6,7,8,9,10
* 1-10/2 = 1,3,5,7,9
* 2-12   = 2,3,4,5,6,7,8,9,10,11,12
* 2-12/3 = 2,3,5,6,8,9,11,12

## License ##

MIT
