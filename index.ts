import * as XRegExp from 'xregexp';

let line: string;
let cursor = 0;
let token: string | undefined;

function skipWhitespace() {
    const x = line[cursor];
    while (cursor < line.length && isSpace(line[cursor])) {
        cursor += 1;
    }
}

function matchKeyword() {
    skipWhitespace();

    if (line.length <= cursor || !(isAlpha(line[cursor]))) {
        return false;
    }

    const mark = cursor;
    while (cursor < line.length && isAlpha(line[cursor])) {
        cursor += 1;
    }

    token = line.substring(mark, cursor);
    return true;
}

function isSpace(letter: string) {
    return /\s/.test(letter);
}

const alphaRegexp = XRegExp('\\p{Letter}');

function isAlpha(letter: string) {
    return alphaRegexp.test(letter);
}
console.log(isAlpha('本'));