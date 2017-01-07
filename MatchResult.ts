interface Token {
    readonly start: number;
    readonly text: string;
    readonly type: 'variable'
                 | 'number'
                 | 'keyword'
                 | 'string'
                 | 'literal'
                 | 'eol'
                 | 'operator';
}

export default class MatchResult {
    public static fail() {
        return new MatchResult(false);
    }

    public static from(token: Token) {
        return new MatchResult(true, token);
    }

    private constructor(isSuccess: true, token: Token);
    private constructor(isSuccess: false);
    private constructor(public isSuccess: boolean, private token?: Token) {
    }

    public getToken(): Token {
        if (this.token === undefined) {
            throw new Error('Cannot get token from unsuccessful match result');
        }

        return this.token;
    }
}