/**
 * Logs a warning message
 * but dont warn a same message twice
 */
declare function warnOnce(message: string): void;
declare namespace warnOnce {
    var _resetWarned: () => void;
}
export default warnOnce;
