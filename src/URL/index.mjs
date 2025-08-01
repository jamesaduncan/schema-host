export function validator(input) {
    try {
        const url = new URL(input);
        return true;
    } catch (e) {
        return false;
    }
}
