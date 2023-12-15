export class HttpResult<T> {
    public status: number | null;
    public message: string | null;
    public data: T | null;

    constructor() {
        this.status = null;
        this.message = null;
        this.data = null;
    }

    public setStatus(status: number): HttpResult<T> {
        this.status = status;
        return this;
    }

    public setMessage(message: string): HttpResult<T> {
        this.message = message;
        return this;
    }

    public setData(data: T): HttpResult<T> {
        this.data = data;
        return this;
    }

    public toJSON(): HttpResultData<T> {
        const { status, message, data } = this;
        const r: HttpResultData<T> = {
            status: status || 500,
        };

        if (message) r.message = message;
        if (data) r.data = data;
        return r;
    }
}

interface HttpResultData<T> {
    status: number;
    message?: string;
    data?: T;
}
