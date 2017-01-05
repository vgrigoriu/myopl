import Tokenizer from './Tokenizer';

let t: Tokenizer;

const variables: Map<string, number> = new Map<string, number>();

function parse_statement() {
    const keyword = t.matchKeyword();
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
    const varMatch = t.matchVariable();
    if (!varMatch.isSuccess) {
        throw new Error('Variable expected');
    }

    // variable names are not case sensitive
    const varName = varMatch.getToken().text.toLowerCase();
    if (!t.match('=').isSuccess) {
        throw new Error('= expected');
    }

    const numberMatch = t.matchNumber();
    if (!numberMatch.isSuccess) {
        throw new Error('Number expected');
    }

    const varValue = parseInt(numberMatch.getToken().text, 10);
    if (!t.matchEol().isSuccess) {
        throw new Error('End of line expected');
    }

    variables.set(varName, varValue);
}

function parsePrint() {
    if (t.matchEol().isSuccess) {
        console.log();
        return;
    }

    let value = parseValue().toString();
    while (t.match(',').isSuccess) {
        value += parseValue().toString();
    }

    if (!t.matchEol().isSuccess) {
        throw new Error('End of line expected');
    }

    console.log(value);
}

function parseValue() {
    const stringMatch = t.matchString();
    if (stringMatch.isSuccess) {
        return stringMatch.getToken().text;
    }

    const numberMatch = t.matchNumber();
    if (numberMatch.isSuccess) {
        return parseInt(numberMatch.getToken().text, 10);
    }

    const varMatch = t.matchVariable();
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

// import * as test from 'tape';

// test('match keyword at the beginning', t => {
//     cursor = 0;
//     line = 'LET x = 12';
//     const match = matchKeyword();
//     t.true(match.isSuccess);
//     t.equal(match.getToken().text, 'LET');
//     t.end();
// });

// test('match keyword after spaces', t => {
//     cursor = 0;
//     line = '  \tREM this is a comment';
//     const match = matchKeyword();
//     t.true(match.isSuccess);
//     t.equal(match.getToken().text, 'REM');
//     t.end();
// });

// test('don\'t match no keyword', t => {
//     cursor = 0;
//     line = '"begins with quote"';
//     const match = matchKeyword();
//     t.false(match.isSuccess);
//     t.end();
// });

// test('match string at the beginning', t => {
//     cursor = 0;
//     line = '"here is" a string';
//     const match = matchString();
//     t.true(match.isSuccess);
//     t.equal(match.getToken().text, 'here is');
//     t.end();
// });

// test('match string after spaces', t => {
//     cursor = 0;
//     line = '   "some say" the trout is a fish';
//     const match = matchString();
//     t.true(match.isSuccess);
//     t.equal(match.getToken().text, 'some say');
//     t.end();
// });

// test('don\'t match no string', t => {
//     cursor = 0;
//     line = 'LET x := 7';
//     const match = matchString();
//     t.false(match.isSuccess);
//     t.end();
// });

// test('match number at the beginning', t => {
//     cursor = 0;
//     line = '123+456';
//     const match = matchNumber();
//     t.true(match.isSuccess);
//     t.equal(match.getToken().text, '123');
//     t.end();
// });

// test('match number after spaces', t => {
//     cursor = 0;
//     line = ' 998 bottles of beer on the wall';
//     const match = matchNumber();
//     t.true(match.isSuccess);
//     t.equal(match.getToken().text, '998');
//     t.end();
// });

// test('don\'t match no number', t => {
//     cursor = 0;
//     line = 'LET x := 7';
//     const match = matchNumber();
//     t.false(match.isSuccess);
//     t.end();
// });

// test('match variable at the beginning', t => {
//     cursor = 0;
//     line = 'myVar1 > 12';
//     const match = matchVariable();
//     t.true(match.isSuccess);
//     t.equal(match.getToken().text, 'myVar1');
//     t.end();
// });

// test('match variable after spaces', t => {
//     cursor = 3;
//     line = 'LET    A1B := 21';
//     const match = matchVariable();
//     t.true(match.isSuccess);
//     t.equal(match.getToken().text, 'A1B');
//     t.end();
// });

// test('don\'t match no variable', t => {
//     cursor = 0;
//     line = '"var1"';
//     const match = matchVariable();
//     t.false(match.isSuccess);
//     t.end();
// });

// main
t = new Tokenizer('LET a = 42');
parse_statement();
t = new Tokenizer('PRINT "a = ", a');
parse_statement();