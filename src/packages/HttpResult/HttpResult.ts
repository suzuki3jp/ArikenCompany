export class HttpResult<T> {
    public status: keyof HttpStatusT | null;
    public message: string | null;
    public data: T | null;

    constructor() {
        this.status = null;
        this.message = null;
        this.data = null;
    }

    public setStatus(status: keyof HttpStatusT): HttpResult<T> {
        this.status = status;
        return this;
    }

    public setMessage(message?: string): HttpResult<T> {
        this.message = message ?? null;
        return this;
    }

    public setData(data?: T): HttpResult<T> {
        this.data = data || null;
        return this;
    }

    public toJSON(): HttpResultData<T> {
        const { status, message, data } = this;
        const r: HttpResultData<T> = {
            status: status || 500,
        };

        if (message) r.message = `${HttpStatus[r.status]}: ${message}`;
        if (data) r.data = data;
        return r;
    }
}

interface HttpResultData<T> {
    status: keyof HttpStatusT;
    message?: string;
    data?: T;
}

const HttpStatus = {
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    204: 'No Content',
    205: 'Reset Content',
    206: 'Partial Content',
    300: 'Multiple Choice',
    301: 'Moved Permanently',
    302: 'Found',
    304: 'Not Modified',
    307: 'Temporary Redirect',
    308: 'Permanent Redirect',
    400: 'Bad Request',
    401: 'Unauthrized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    408: 'Request Timeout',
    409: 'Conflict',
    410: 'Gone',
    413: 'Payload Too Large',
    414: 'URI Too Long',
    415: 'Unsupported Media Type',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Server Unavailable',
    504: 'Gateway Timeout',
};

type HttpStatusT = typeof HttpStatus;
