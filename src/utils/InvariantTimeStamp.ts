export class InvariantTimeStamp {
    public readonly minYear = 2000;
    public readonly maxYear = 2050;
    public readonly minMonth = 1;
    public readonly maxMonth = 12;
    public readonly minDay = 1;
    public readonly maxHour = 23;
    public readonly maxMinute = 59;
    public readonly maxSecond = 59;

    private _year: number;
    private _month: number;
    private _day: number;
    private _hour: number;
    private _minute: number;
    private _second: number;

    /**
     * Receives an ISO formated timestamp string and parses it.
     * @param isoTimeStamp - Example: 2024-02-22T12:00:00.000Z
     */
    public constructor(isoTimeStamp: string) {
        this._year = 0;
        this._month = 0;
        this._day = 0;
        this._hour = 0;
        this._minute = 0;
        this._second = 0;

        this.parseIsoTime(isoTimeStamp);
    }

    /**
     * Parses the ISO formatted timestampt into the various class member properties
     * @param isoTimeStamp
     */
    private parseIsoTime(isoTimeStamp: string) {
        let idx = isoTimeStamp.indexOf('T');

        if (idx === -1) {
            throw new Error('Invalid ISO Time String');
        }

        const datePortion = isoTimeStamp.slice(0, idx);
        const dateArray = datePortion.split('-');

        if (dateArray.length != 3) {
            throw new Error('Invalid ISO timestamp. Invalid date.');
        }

        this.year = parseInt(dateArray[0]);
        this.month = parseInt(dateArray[1]);
        this.day = parseInt(dateArray[2]);

        if (Number.isNaN(this._year) || Number.isNaN(this._month) || Number.isNaN(this._day)) {
            throw new Error('Invalid ISO timestamp. Invalid date');
        }

        let idx2 = isoTimeStamp.indexOf('.');
        let timePortion = '';

        if (idx2 != -1) {
            timePortion = isoTimeStamp.slice(idx + 1, idx2);
        } else {
            timePortion = isoTimeStamp.slice(idx + 1);
        }

        const timeArray = timePortion.split(':');

        if (timeArray.length != 3) {
            throw new Error('Invalid ISO timestamp. Invalid time');
        }

        this.hours = parseInt(timeArray[0]);
        this.minutes = parseInt(timeArray[1]);
        this.seconds = parseInt(timeArray[2]);

        if (Number.isNaN(this._hour) || Number.isNaN(this._minute) || Number.isNaN(this._second)) {
            throw new Error('Invalid ISO timestamp. Invalid time');
        }
    }

    // -----------------------------------------------------------------------
    // -----------------------------------------------------------------------

    public getDatePortion(): string {
        return `${this._year}-${this._month}-${this._day}`;
    }

    // -----------------------------------------------------------------------
    // -----------------------------------------------------------------------

    public getTimePortion(): string {
        return `${this._hour}:${this._minute}:${this._second}`;
    }

    // -----------------------------------------------------------------------
    // -----------------------------------------------------------------------

    private set year(theYear: number) {
        if (theYear <= this.minYear || theYear >= this.maxYear) {
            throw new Error(`Year should be between ${this.minYear} and ${this.maxYear}`);
        }

        this._year = theYear;
    }

    // -----------------------------------------------------------------------
    // -----------------------------------------------------------------------

    private set month(theMonth: number) {
        if (theMonth < this.minMonth || theMonth > this.maxMonth) {
            throw new Error(`Month should be between ${this.minMonth} and ${this.maxMonth}`);
        }

        this._month = theMonth;
    }

    // -----------------------------------------------------------------------
    // -----------------------------------------------------------------------

    private set day(theDay: number) {
        let maxMonthDays: number[] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        if (this.isLeapYear(this._year) === true) {
            maxMonthDays[1] = 29;
        }

        if (theDay < this.minDay || theDay > maxMonthDays[this._month]) {
            throw new Error(`Day should be between ${this.minDay} and ${maxMonthDays[this._month]}`);
        }

        this._day = theDay;
    }

    // -----------------------------------------------------------------------
    // -----------------------------------------------------------------------

    private isLeapYear(year: number): boolean {
        return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
    }

    // -----------------------------------------------------------------------
    // -----------------------------------------------------------------------

    private set hours(theHour: number) {
        if (theHour < 0 || theHour > 23) {
            throw new Error(`Hour should be between 0 and 23`);
        }

        this._hour = theHour;
    }

    // -----------------------------------------------------------------------
    // -----------------------------------------------------------------------

    private set minutes(theMinute: number) {
        if (theMinute < 0 || theMinute > 59) {
            throw new Error(`Minute should be between 0 and 59`);
        }

        this._minute = theMinute;
    }

    // -----------------------------------------------------------------------
    // -----------------------------------------------------------------------

    private set seconds(theSecond: number) {
        if (theSecond < 0 || theSecond > 59) {
            throw new Error(`Second should be between 0 and 59`);
        }

        this._second = theSecond;
    }

    // -----------------------------------------------------------------------
    // -----------------------------------------------------------------------

    public get year() {
        return this._year;
    }

    // -----------------------------------------------------------------------
    // -----------------------------------------------------------------------

    public get month() {
        return this._month;
    }

    // -----------------------------------------------------------------------
    // -----------------------------------------------------------------------

    public get day() {
        return this._day;
    }

    // -----------------------------------------------------------------------
    // -----------------------------------------------------------------------

    public get hours() {
        return this._hour;
    }

    // -----------------------------------------------------------------------
    // -----------------------------------------------------------------------

    public get minutes() {
        return this._minute;
    }

    // -----------------------------------------------------------------------
    // -----------------------------------------------------------------------

    public get seconds() {
        return this._second;
    }
}
