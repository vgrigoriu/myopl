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

import * as test from 'tape';

test('match keyword at the beginning', t => {
    cursor = 0;
    line = 'LET x = 12';
    const match = matchKeyword();
    t.true(match);
    t.equal(token, 'LET');
    t.end();
});

test('match keyword after spaces', t => {
    cursor = 0;
    line = '  \tREM this is a comment';
    const match = matchKeyword();
    t.true(match);
    t.equal(token, 'REM');
    t.end();
});