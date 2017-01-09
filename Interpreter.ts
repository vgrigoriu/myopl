import Tokenizer from './Tokenizer';

export default class Interpreter {
    private readonly variables: Map<string, number> = new Map<string, number>();

    public parseStatement(line: string): void {
        const t = new Tokenizer(line);

        const keyword = t.matchKeyword();
        if (!keyword.isSuccess) {
            throw new Error('Statement expected');
        }

        const statement = keyword.getToken().text.toLowerCase();
        if (statement === 'let') {
            this.parseLet(t);
        } else if (statement === 'print') {
            this.parsePrint(t);
        } else {
            throw new Error(`Unknown statement: ${statement}`);
        }
    }

    private parseLet(t: Tokenizer) {
        const varMatch = t.matchVariable();
        if (!varMatch.isSuccess) {
            throw new Error('Variable expected');
        }

        // variable names are not case sensitive
        const varName = varMatch.getToken().text.toLowerCase();
        if (!t.match('=').isSuccess) {
            throw new Error('= expected');
        }

        this.variables.set(varName, this.parseExpression(t));
        if (!t.matchEol().isSuccess) {
            throw new Error('End of line expected');
        }
    }

    private parsePrint(t: Tokenizer) {
        if (t.matchEol().isSuccess) {
            console.log();
            return;
        }

        let value = this.parseValue(t).toString();
        while (t.match(',').isSuccess) {
            value += this.parseValue(t).toString();
        }

        if (!t.matchEol().isSuccess) {
            throw new Error('End of line expected');
        }

        console.log(value);
    }

    private parseValue(t: Tokenizer) {
        const stringMatch = t.matchString();
        if (stringMatch.isSuccess) {
            return stringMatch.getToken().text;
        }

        return this.parseExpression(t);
    }

    private parseExpression(t: Tokenizer): number {
        let t1 = this.parseTerm(t);
        let operator = t.matchAddOrSub();
        while (operator.isSuccess) {
            const t2 = this.parseTerm(t);
            const op = operator.getToken().text;
            if (op === '+') {
                t1 = t1 + t2;
            } else if (op === '-') {
                t1 = t1 - t2;
            } else {
                throw new Error(`Unknown operator: ${op}`);
            }

            operator = t.matchAddOrSub();
        }

        return t1;
    }

    private parseTerm(t: Tokenizer): number {
        let t1 = this.parseFactor(t);
        let operator = t.matchMulOrDiv();
        while (operator.isSuccess) {
            const t2 = this.parseFactor(t);
            const op = operator.getToken().text;
            if (op === '*') {
                t1 = t1 * t2;
            } else if (op === '/') {
                t1 = t1 / t2;
            } else {
                throw new Error(`Unknown operator: ${op}`);
            }

            operator = t.matchMulOrDiv();
        }

        return t1;
    }

    private parseFactor(t: Tokenizer): number {
        const numberMatch = t.matchNumber();
        if (numberMatch.isSuccess) {
            return parseFloat(numberMatch.getToken().text);
        }

        const varMatch = t.matchVariable();
        if (varMatch.isSuccess) {
            // variable names are case insensitive
            const varName = varMatch.getToken().text.toLowerCase();
            if (this.variables.has(varName)) {
                return this.variables.get(varName)!;
            } else {
                throw new Error(`Variable ${varName} not found`);
            }
        }

        if (t.match('(').isSuccess) {
            const value = this.parseExpression(t);
            if (t.match(')').isSuccess) {
                return value;
            } else {
                throw new Error('Missing ")"');
            }
        }

        throw new Error('Expression expected');
    }
}