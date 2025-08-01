export function validator( input ) {
    try {
        JSON.parse( input )
    } catch(e) {
        return false;
    }
    return true;
}