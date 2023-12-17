export class Result<T> {
    public success: boolean;
    public message?: string;
    public data?: T;

    constructor() {
        this.success = false;
    }

    public toSuccess(data: T) {
        this.success = true;
        this.data = data;
        return this;
    }

    public error(message: string) {
        this.success = false;
        this.message = message;
        return this;
    }

    public toJSON() {
        const { success, message, data } = this;
        return { success, message, data };
    }
}
