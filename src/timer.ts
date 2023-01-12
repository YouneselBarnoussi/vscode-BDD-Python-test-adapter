export class Timer {
    timeStart: number = 0;

    public start() {
        this.timeStart = new Date().getTime();
    }

    get seconds(): number {
        return Math.ceil((new Date().getTime() - this.timeStart) / 1000);
    }
    
    /** Milliseconds e.g. 2000ms etc. */
    get ms(): number {
        return (new Date()).getTime() - this.timeStart;
    }
}