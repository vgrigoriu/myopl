import * as char from './char';
import MatchResult from './MatchResult';

export default class Tokenizer {
    private cursor: number;

    constructor (private readonly line: string) {
        this.cursor = 0;
    }

    public matchKeyword(): MatchResult {
        this.skipWhitespace();

        if (this.line.length <= this.cursor || !(char.isAlpha(this.line[this.cursor]))) {
            return MatchResult.fail();
        }

        const mark = this.cursor;
        while (this.cursor < this.line.length && char.isAlpha(this.line[this.cursor])) {
            this.cursor += 1;
        }

        return MatchResult.from({
            type: 'keyword',
            text: this.line.substring(mark, this.cursor),
            start: mark
        });
    }

    public matchString(): MatchResult {
        this.skipWhitespace();
        if (this.line.length <= this.cursor || this.line[this.cursor] !== '"') {
            return MatchResult.fail();
        }

        const mark = this.cursor;

        // skip the opening double quote
        this.cursor += 1;
        while (this.line[this.cursor] !== '"') {
            this.cursor += 1;
            if (this.line.length < this.cursor) {
                throw new Error('Unclosed string');
            }
        }

        // skip the closing double quote
        this.cursor += 1;

        return MatchResult.from({
            type: 'string',
            // save string value w/o the double quotes
            text: this.line.substring(mark + 1, this.cursor - 1),
            start: mark + 1
        });
    }

    public matchNumber(): MatchResult {
        this.skipWhitespace();
        if (this.line.length <= this.cursor || !char.isDigit(this.line[this.cursor])) {
            return MatchResult.fail();
        }

        const mark = this.cursor;
        while (this.cursor < this.line.length && char.isDigit(this.line[this.cursor])) {
            this.cursor += 1;
        }

        return MatchResult.from({
            type: 'number',
            text: this.line.substring(mark, this.cursor),
            start: mark
        });
    }

    public matchVariable(): MatchResult {
        this.skipWhitespace();
        if (this.line.length <= this.cursor || !char.isAlpha(this.line[this.cursor])) {
            return MatchResult.fail();
        }

        const mark = this.cursor;
        // we already checked the first non-space character,
        // we know it's a letter so we look for letters or digits
        this.cursor += 1;
        while (this.cursor < this.line.length && (char.isDigit(this.line[this.cursor]) || char.isAlpha(this.line[this.cursor]))) {
            this.cursor += 1;
        }

        return MatchResult.from({
            type: 'variable',
            text: this.line.substring(mark, this.cursor),
            start: mark
        });
    }

    public matchAddOrSub(): MatchResult {
        const plus = this.match('+');
        if (plus.isSuccess) {
            return MatchResult.from({
                ...plus.getToken(),
                type: 'operator'
            });
        }

        const minus = this.match('-');
        if (minus.isSuccess) {
            return MatchResult.from({
                ...minus.getToken(),
                type: 'operator'
            });
        }

        return MatchResult.fail();
    }

    public matchMulOrDiv(): MatchResult {
        const mul = this.match('*');
        if (mul.isSuccess) {
            return MatchResult.from({
                ...mul.getToken(),
                type: 'operator'
            });
        }

        const div = this.match('/');
        if (div.isSuccess) {
            return MatchResult.from({
                ...div.getToken(),
                type: 'operator'
            });
        }

        return MatchResult.fail();
    }

    public match(text: string): MatchResult {
        this.skipWhitespace();

        if (this.line.startsWith(text, this.cursor)) {
            const mark = this.cursor;
            this.cursor += text.length;
            return MatchResult.from({
                type: 'literal',
                text,
                start: mark
            });
        }

        return MatchResult.fail();
    }

    public matchEol(): MatchResult {
        this.skipWhitespace();
        return this.line.length <= this.cursor
            ? MatchResult.from({
                type: 'eol',
                text: '',
                start: this.cursor
                
            })
            : MatchResult.fail();
    }

    private skipWhitespace() {
        while (this.cursor < this.line.length && char.isSpace(this.line[this.cursor])) {
            this.cursor += 1;
        }
    }
}
