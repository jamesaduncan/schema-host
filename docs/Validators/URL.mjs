export default function(input) {
    try {
        const url = new URL(input);
        return true;
    } catch (e) {
        return false;
    }
}
