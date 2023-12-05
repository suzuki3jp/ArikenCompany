import { ofetch } from 'ofetch';

export function fetch(url: string) {
    return ofetch(url, { ignoreResponseError: true });
}
