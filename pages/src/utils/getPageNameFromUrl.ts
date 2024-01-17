/**
 * `/dashboard` -> `Dashboard`
 * @param path
 */
export const getPageNameFromPath = (path: string) => {
    console.log(path);
    if (path === '/') return 'Home';
    const removedSlash = path.slice(1);
    return removedSlash.charAt(0).toUpperCase() + removedSlash.slice(1);
};
