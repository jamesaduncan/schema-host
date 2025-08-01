export function validator( input ) {
    // Check if input is a number
    if (typeof input === 'number') {
        return true;
    }

    // Check if input is a string that can be converted to a number
    if (typeof input === 'string' && !isNaN(input) && !isNaN(parseFloat(input))) {
        return true;
    }

    // If none of the above, return false
    return false;
}