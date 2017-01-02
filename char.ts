import * as XRegExp from 'xregexp';

export function isSpace(char: string) {
    return /\s/.test(char);
}

const alphaRegexp = XRegExp('\\p{Letter}');

export function isAlpha(char: string) {
    return alphaRegexp.test(char);
}

export function isDigit(char: string) {
    return /\d/.test(char);
}
