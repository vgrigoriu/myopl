import * as char from './char';
import { MatchResult } from './tokenizer'

let line: string;
let cursor = 0;
let token: string | undefined;

const variables: Map<string, number> = new Map<string, number>();

function parse_statement() {
    const keyword = matchKeyword();
    if (!keyword.isSuccess) {
        throw new Error('Statement expected');
    }

    const statement = keyword.getToken().text.toLowerCase();
    if (statement === 'let') {
        parseLet();
    } else if (statement === 'print') {
        parsePrint();
    } else {
        throw new Error(`Unknown statement: ${statement}`);
    }
}

function parseLet() {
    const varMatch = matchVariable();
    if (!varMatch.isSuccess) {
        throw new Error('Variable expected');
    }

    // variable names are not case sensitive
    const varName = varMatch.getToken().text.toLowerCase();
    if (!match('=').isSuccess) {
        throw new Error('= expected');
    }

    const numberMatch = matchNumber();
    if (!numberMatch.isSuccess) {
        throw new Error('Number expected');
    }

    const varValue = parseInt(numberMatch.getToken().text, 10);
    if (!matchEol().isSuccess) {
        throw new Error('End of line expected');
    }

    variables.set(varName, varValue);
}

function parsePrint() {
    if (matchEol().isSuccess) {
        console.log();
        return;
    }

    let value = parseValue().toString();
    while (match(',').isSuccess) {
        value += parseValue().toString();
    }

    if (!matchEol().isSuccess) {
        throw new Error('End of line expected');
    }

    console.log(value);
}

function parseValue() {
    const stringMatch = matchString();
    if (stringMatch.isSuccess) {
        return stringMatch.getToken().text;
    }

    const numberMatch = matchNumber();
    if (numberMatch.isSuccess) {
        return parseInt(numberMatch.getToken().text, 10);
    }

    const varMatch = matchVariable();
    if (varMatch.isSuccess) {
        // variable names are case insensitive
        const varName = varMatch.getToken().text.toLowerCase();
        if (variables.has(varName)) {
            return variables.get(varName)!;
        } else {
            throw new Error(`Variable ${varName} not found`);
        }
    }

    throw new Error('Value expected');
}

function skipWhitespace() {
    const x = line[cursor];
    while (cursor < line.length && char.isSpace(line[cursor])) {
        cursor += 1;
    }
}

function matchKeyword(): MatchResult {
    skipWhitespace();

    if (line.length <= cursor || !(char.isAlpha(line[cursor]))) {
        return MatchResult.fail();
    }

    const mark = cursor;
    while (cursor < line.length && char.isAlpha(line[cursor])) {
        cursor += 1;
    }

    return MatchResult.from({
        type: 'keyword',
        text: line.substring(mark, cursor),
        start: mark
    });
}

function matchString(): MatchResult {
    skipWhitespace();
    if (line.length <= cursor || line[cursor] !== '"') {
        return MatchResult.fail();
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

    return MatchResult.from({
        type: 'string',
        // save string value w/o the double quotes
        text: line.substring(mark + 1, cursor - 1),
        start: mark + 1
    });
}

function matchNumber(): MatchResult {
    skipWhitespace();
    if (line.length <= cursor || !char.isDigit(line[cursor])) {
        return MatchResult.fail();
    }

    const mark = cursor;
    while (cursor < line.length && char.isDigit(line[cursor])) {
        cursor += 1;
    }

    return MatchResult.from({
        type: 'number',
        text: line.substring(mark, cursor),
        start: mark
    });
}

function matchVariable(): MatchResult {
    skipWhitespace();
    if (line.length <= cursor || !char.isAlpha(line[cursor])) {
        return MatchResult.fail();
    }

    const mark = cursor;
    // we already checked the first non-space character,
    // we know it's a letter so we look for letters or digits
    cursor += 1;
    while (cursor < line.length && (char.isDigit(line[cursor]) || char.isAlpha(line[cursor]))) {
        cursor += 1;
    }

    return MatchResult.from({
        type: 'variable',
        text: line.substring(mark, cursor),
        start: mark
    });
}

function match(text: string): MatchResult {
    skipWhitespace();

    if (line.startsWith(text, cursor)) {
        const mark = cursor;
        cursor += text.length;
        return MatchResult.from({
            type: 'literal',
            text,
            start: mark
        });
    }

    return MatchResult.fail();
}

function matchEol(): MatchResult {
    skipWhitespace();
    return line.length <= cursor
        ? MatchResult.from({
            type: 'eol',
            text: '',
            start: cursor
            
        })
        : MatchResult.fail();
}

import * as test from 'tape';

test('match keyword at the beginning', t => {
    cursor = 0;
    line = 'LET x = 12';
    const match = matchKeyword();
    t.true(match.isSuccess);
    t.equal(match.getToken().text, 'LET');
    t.end();
});

test('match keyword after spaces', t => {
    cursor = 0;
    line = '  \tREM this is a comment';
    const match = matchKeyword();
    t.true(match.isSuccess);
    t.equal(match.getToken().text, 'REM');
    t.end();
});

test('don\'t match no keyword', t => {
    cursor = 0;
    line = '"begins with quote"';
    const match = matchKeyword();
    t.false(match.isSuccess);
    t.end();
});

test('match string at the beginning', t => {
    cursor = 0;
    line = '"here is" a string';
    const match = matchString();
    t.true(match.isSuccess);
    t.equal(match.getToken().text, 'here is');
    t.end();
});

test('match string after spaces', t => {
    cursor = 0;
    line = '   "some say" the trout is a fish';
    const match = matchString();
    t.true(match.isSuccess);
    t.equal(match.getToken().text, 'some say');
    t.end();
});

test('don\'t match no string', t => {
    cursor = 0;
    line = 'LET x := 7';
    const match = matchString();
    t.false(match.isSuccess);
    t.end();
});

test('match number at the beginning', t => {
    cursor = 0;
    line = '123+456';
    const match = matchNumber();
    t.true(match.isSuccess);
    t.equal(match.getToken().text, '123');
    t.end();
});

test('match number after spaces', t => {
    cursor = 0;
    line = ' 998 bottles of beer on the wall';
    const match = matchNumber();
    t.true(match.isSuccess);
    t.equal(match.getToken().text, '998');
    t.end();
});

test('don\'t match no number', t => {
    cursor = 0;
    line = 'LET x := 7';
    const match = matchNumber();
    t.false(match.isSuccess);
    t.end();
});

test('match variable at the beginning', t => {
    cursor = 0;
    line = 'myVar1 > 12';
    const match = matchVariable();
    t.true(match.isSuccess);
    t.equal(match.getToken().text, 'myVar1');
    t.end();
});

test('match variable after spaces', t => {
    cursor = 3;
    line = 'LET    A1B := 21';
    const match = matchVariable();
    t.true(match.isSuccess);
    t.equal(match.getToken().text, 'A1B');
    t.end();
});

test('don\'t match no variable', t => {
    cursor = 0;
    line = '"var1"';
    const match = matchVariable();
    t.false(match.isSuccess);
    t.end();
});

// main
line = 'LET a = 42';
cursor = 0;
parse_statement();
line = 'PRINT "a = ", a';
cursor = 0;
parse_statement();