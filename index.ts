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

function matchKeyword(): boolean {
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

function matchString(): boolean {
    skipWhitespace();
    if (line.length <= cursor || line[cursor] !== '"') {
        return false;
    }

    const mark = cursor;

    // skip the opening double quote
    cursor += 1;
    while (line[cursor] !== '"') {
        cursor += 1;
        if (line.length < cursor) {
            throw new Error('Unclosed string');
        }
    }

    // skip the closing double quote
    cursor += 1;

    // save string value w/o the double quotes
    token = line.substring(mark + 1, cursor - 1);

    return true;
}

// TODO: matchNumber (123), matchVariable (var1)
function matchNumber() : boolean {
    skipWhitespace();
    if (line.length <= cursor || !isDigit(line[cursor])) {
        return false;
    }

    const mark = cursor;
    while (cursor < line.length && isDigit(line[cursor])) {
        cursor += 1;
    }

    token = line.substring(mark, cursor);
    return true;
}

function isSpace(char: string) {
    return /\s/.test(char);
}

const alphaRegexp = XRegExp('\\p{Letter}');

function isAlpha(char: string) {
    return alphaRegexp.test(char);
}

function isDigit(char: string) {
    return /\d/.test(char);
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

test('don\'t match no keyword', t => {
    cursor = 0;
    line = '"begins with quote"';
    const match = matchKeyword();
    t.false(match);
    t.end();
});

test('match string at the beginning', t => {
    cursor = 0;
    line = '"here is" a string';
    const match = matchString();
    t.true(match);
    t.equal(token, 'here is');
    t.end();
});

test('match string after spaces', t => {
    cursor = 0;
    line = '   "some say" the trout is a fish';
    const match = matchString();
    t.true(match);
    t.equal(token, 'some say');
    t.end();
});

test('don\'t match no string', t => {
    cursor = 0;
    line = 'LET x := 7';
    const match = matchString();
    t.false(match);
    t.end();
});

test('match number at the beginning', t => {
    cursor = 0;
    line = '123+456';
    const match = matchNumber();
    t.true(match);
    t.equal(token, '123');
    t.end();
});

test('match number after spaces', t => {
    cursor = 0;
    line = ' 998 bottles of beer on the wall';
    const match = matchNumber();
    t.true(match);
    t.equal(token, '998');
    t.end();
});

test('don\'t match no number', t => {
    cursor = 0;
    line = 'LET x := 7';
    const match = matchNumber();
    t.false(match);
    t.end();
});