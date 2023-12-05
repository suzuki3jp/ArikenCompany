import { ofetch } from 'ofetch';

export function fetch<T = any>(url: string) {
    return ofetch<T>(url, { ignoreResponseError: true });
}
