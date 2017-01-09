import Tokenizer from './Tokenizer';
import Interpreter from './Interpreter';

import * as test from 'tape';

test('match keyword at the beginning', t => {
    const tokenizer = new Tokenizer('LET x = 12');
    const match = tokenizer.matchKeyword();
    t.true(match.isSuccess);
    t.equal(match.getToken().text, 'LET');
    t.end();
});

test('match keyword after spaces', t => {
    const tokenizer = new Tokenizer('  \tREM this is a comment');
    const match = tokenizer.matchKeyword();
    t.true(match.isSuccess);
    t.equal(match.getToken().text, 'REM');
    t.end();
});

test('don\'t match no keyword', t => {
    const tokenizer = new Tokenizer('"begins with quote"');
    const match = tokenizer.matchKeyword();
    t.false(match.isSuccess);
    t.end();
});

test('match string at the beginning', t => {
    const tokenizer = new Tokenizer('"here is" a string');
    const match = tokenizer.matchString();
    t.true(match.isSuccess);
    t.equal(match.getToken().text, 'here is');
    t.end();
});

test('match string after spaces', t => {
    const tokenizer = new Tokenizer('   "some say" the trout is a fish');
    const match = tokenizer.matchString();
    t.true(match.isSuccess);
    t.equal(match.getToken().text, 'some say');
    t.end();
});

test('don\'t match no string', t => {
    const tokenizer = new Tokenizer('LET x := 7');
    const match = tokenizer.matchString();
    t.false(match.isSuccess);
    t.end();
});

test('match number at the beginning', t => {
    const tokenizer = new Tokenizer('123+456');
    const match = tokenizer.matchNumber();
    t.true(match.isSuccess);
    t.equal(match.getToken().text, '123');
    t.end();
});

test('match number after spaces', t => {
    const tokenizer = new Tokenizer(' 998 bottles of beer on the wall');
    const match = tokenizer.matchNumber();
    t.true(match.isSuccess);
    t.equal(match.getToken().text, '998');
    t.end();
});

test('don\'t match no number', t => {
    const tokenizer = new Tokenizer('LET x := 7');
    const match = tokenizer.matchNumber();
    t.false(match.isSuccess);
    t.end();
});

test('match variable at the beginning', t => {
    const tokenizer = new Tokenizer('myVar1 > 12');
    const match = tokenizer.matchVariable();
    t.true(match.isSuccess);
    t.equal(match.getToken().text, 'myVar1');
    t.end();
});

test('match variable after spaces', t => {
    const tokenizer = new Tokenizer('    A1B := 21');
    const match = tokenizer.matchVariable();
    t.true(match.isSuccess);
    t.equal(match.getToken().text, 'A1B');
    t.end();
});

test('don\'t match no variable', t => {
    const tokenizer = new Tokenizer('"var1"');
    const match = tokenizer.matchVariable();
    t.false(match.isSuccess);
    t.end();
});

function stdinIsReadable(): Promise<void> {
    return new Promise<void>(resolve => {
        process.stdin.setEncoding('utf8');
        process.stdin.on('readable', () => {
            resolve();
        });
    });
}

function readLine(): Promise<string> {
    return new Promise<string>((resolve) => {
        process.stdin.once('data', (chunk: string) => {
            resolve(chunk);
        });
    });
}

function write(line: string): Promise<void> {
    return new Promise<void>(resolve => {
        process.stdout.write(line, 'utf8', resolve);
    });
}

async function repl() {
    const interpreter = new Interpreter();
    await write('BASIC v0.1 READY\n');
    await stdinIsReadable();
    while (true) {
        await write('> ');
        const line = await readLine();
        if (line.trim() === 'bye') {
            await write('bye\n');
            process.exit();
        }

        try {
            interpreter.parseStatement(line);
        } catch (e) {
            await write(`${e}\n`);
        }
    }
}

repl();
