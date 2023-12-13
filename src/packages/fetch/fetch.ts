import axios, { AxiosRequestConfig, AxiosError } from 'axios';

export async function fetch(url: string, config?: AxiosRequestConfig) {
    try {
        const res = await axios.get(url, config);
        return res.data;
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const { status, data } = error.response;
            return { status, data };
        } else {
            throw new Error('Request failed.');
        }
    }
}
