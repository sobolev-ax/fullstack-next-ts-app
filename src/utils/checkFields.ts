export const checkFields = <T>(obj: T, keys: Array<keyof T>): boolean => {
    for (const key of keys) {
        if (!obj[key]) return false;
    }

    return true;
}