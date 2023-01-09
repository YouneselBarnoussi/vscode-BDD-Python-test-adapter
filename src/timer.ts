export function timer() {
    let timeStart = new Date().getTime();
    return {
        /** <integer>s e.g 2s etc. */
        get seconds(): number {
            return Math.ceil((new Date().getTime() - timeStart) / 1000);
        },
        /** Milliseconds e.g. 2000ms etc. */
        get ms(): number {
            return (new Date()).getTime() - timeStart;
        }
    }
}