var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
chai.use(require('chai-datetime'));

var Cronner = require('../lib/cronner/src/cronner');

describe('Cronner', function () {

    
    it('all blank', function () {

        var cronner = new Cronner("* * * * * * *");
        var x = new Date(2020, 1, 1, 1, 1, 1,0);
        var next = cronner.nextDate(x);
        var y = new Date(2020, 1, 1, 1, 1, 2,0);        
        expect(next).to.equalTime(y);
    });

    it('seconds', function () {

        var cronner = new Cronner("30 * * * * * *");
        var x = new Date(2020, 1, 1, 1, 1, 1, 0);
        var next = cronner.nextDate(x);
        var y = new Date(2020, 1, 1, 1, 1, 30, 0);
        expect(next).to.equalTime(y);

        var x = new Date(2020, 1, 1, 1, 1, 30, 0);
        var next = cronner.nextDate(x);
        var y = new Date(2020, 1, 1, 1, 2, 30, 0);
        expect(next).to.equalTime(y);

        var x = new Date(2020, 1, 1, 1, 1, 31, 0);
        var next = cronner.nextDate(x);
        var y = new Date(2020, 1, 1, 1, 2, 30, 0);
        expect(next).to.equalTime(y);
    });

    it('minutes', function () {

        var cronner = new Cronner("* 30 * * * * *");
        var x = new Date(2020, 1, 1, 1, 1, 1, 0);
        var next = cronner.nextDate(x);
        var y = new Date(2020, 1, 1, 1, 30, 0, 0);
        expect(next).to.equalTime(y);
        
        var x = new Date(2020, 1, 1, 1, 30, 0, 0);
        var next = cronner.nextDate(x);
        var y = new Date(2020, 1, 1, 1, 30, 1, 0);
        expect(next).to.equalTime(y);

        var x = new Date(2020, 1, 1, 1, 31, 0, 0);
        var next = cronner.nextDate(x);
        var y = new Date(2020, 1, 1, 2, 30, 0, 0);
        expect(next).to.equalTime(y);
        
    });

    it('hours', function () {

        var cronner = new Cronner("* * 12 * * * *");
        var x = new Date(2020, 1, 1, 1, 1, 1, 0);
        var next = cronner.nextDate(x);
        var y = new Date(2020, 1, 1, 12, 0, 0, 0);
        expect(next).to.equalTime(y);
        
        var x = new Date(2020, 1, 1, 12, 0, 0, 0);
        var next = cronner.nextDate(x);
        var y = new Date(2020, 1, 1, 12, 0, 1, 0);
        expect(next).to.equalTime(y);

        
        var x = new Date(2020, 1, 1, 13, 0, 0, 0);
        var next = cronner.nextDate(x);
        var y = new Date(2020, 1, 2, 12, 0, 0, 0);
        expect(next).to.equalTime(y);
        
    });

    it('dayofmonth', function () {

        var cronner = new Cronner("* * * 15 * * *");
        var x = new Date(2020, 1, 1, 1, 1, 1, 0);
        var next = cronner.nextDate(x);
        var y = new Date(2020, 1, 15, 0, 0, 0, 0);
        expect(next).to.equalTime(y);

        var x = new Date(2020, 1, 15, 1, 0, 0, 0);
        var next = cronner.nextDate(x);
        var y = new Date(2020, 1, 15, 1, 0, 1, 0);
        expect(next).to.equalTime(y);


        var x = new Date(2020, 1, 16, 1, 0, 0, 0);
        var next = cronner.nextDate(x);
        var y = new Date(2020, 2, 15, 0, 0, 0, 0);
        expect(next).to.equalTime(y);

    });

    it('month', function () {

        var cronner = new Cronner("* * * * 6 * *");
        var x = new Date(2020, 1, 1, 1, 1, 1, 0);
        var next = cronner.nextDate(x);
        var y = new Date(2020, 5, 1, 0, 0, 0, 0);
        expect(next).to.equalTime(y);

        var x = new Date(2020, 5, 15, 1, 0, 0, 0);
        var next = cronner.nextDate(x);
        var y = new Date(2020, 5, 15, 1, 0, 1, 0);
        expect(next).to.equalTime(y);


        var x = new Date(2020, 6, 16, 1, 0, 0, 0);
        var next = cronner.nextDate(x);
        var y = new Date(2021, 5, 1, 0, 0, 0, 0);
        expect(next).to.equalTime(y);

    });

    it('dayofweek', function () {

        var cronner = new Cronner("* * * 0 * 3 *"); //every second on wednesday 
        var x = new Date(2018, 3, 10, 1, 1, 1, 0);
        var next = cronner.nextDate(x);
        var y = new Date(2018, 3, 11, 0, 0, 0, 0);
        expect(next).to.equalTime(y);
        
        var x = new Date(2018, 3, 11, 1, 1, 1, 0);
        var next = cronner.nextDate(x);
        var y = new Date(2018, 3, 11, 1, 1, 2, 0);
        expect(next).to.equalTime(y);


        var x = new Date(2018, 3, 12, 1, 1, 1, 0);
        var next = cronner.nextDate(x);
        var y = new Date(2018, 3, 18, 0, 0, 0, 0);
        expect(next).to.equalTime(y);
        
    });

    it('year', function () {

        var cronner = new Cronner("* * * * * * 2018"); //every second on wednesday 
        var x = new Date(2017, 3, 10, 1, 1, 1, 0);
        var next = cronner.nextDate(x);
        var y = new Date(2018, 0, 1, 0, 0, 0, 0);
        expect(next).to.equalTime(y);
        
        var x = new Date(2018, 3, 11, 1, 1, 1, 0);
        var next = cronner.nextDate(x);
        var y = new Date(2018, 3, 11, 1, 1, 2, 0);
        expect(next).to.equalTime(y);


        var x = new Date(2019, 3, 12, 1, 1, 1, 0);
        var next = cronner.nextDate(x);

        expect(next).to.be.false;
        
    });

    
    it('cronner constructor test', function () {
        cronner = new Cronner("0 5 * * * * *");
        cronner2 = new Cronner(5, -1, -1, -1, -1);

        expect(JSON.stringify(cronner)).to.equal(JSON.stringify(cronner2));

    });

    it('x/y pattern every other y starting at x', () => {
        var y = new Date(2018, 0, 1);
        var y1 = new Date(2018, 0, 10);
        var y2 = new Date(2018, 0, 19);
        var y3 = new Date(2018, 0, 28);
        var y4 = new Date(2018, 1, 6);
        cronner = new Cronner(`0 0 0 ${y.getTime()}/9 * * *`);
        expect(cronner.nextDate(y)).to.equalTime(y1);
        expect(cronner.nextDate(y1)).to.equalTime(y2);
        expect(cronner.nextDate(y2)).to.equalTime(y3);
        expect(cronner.nextDate(y3)).to.equalTime(y4);
   

        // x/y pattern doesn't work on dayofweek month or year
        expect(() => { new Cronner("* * * * * 1/3 *") }).to.throw("Invalid pattern '1/3'.")
        expect(() => { new Cronner("* * * * 1/3 * *") }).to.throw("Invalid pattern '1/3'.")
        expect(() => { new Cronner("* * * * * * 1/3") }).to.throw("Invalid pattern '1/3'.")
    });
    



});
