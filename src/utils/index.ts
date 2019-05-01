export function isArray(o: any) {
    return Object.prototype.toString.apply(o) === '[object Array]';
}