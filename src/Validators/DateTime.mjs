export default function ( input ) {
    // Check if input is a string
    if (typeof input !== "string") {
      return false;
    }
  
    // Check if string is empty
    if (input.trim() === "") {
      return false;
    }
  
    try {
      // Create a Date object from the input string
      const d = new Date( input );
  
      // Check if the date is valid and if the ISO string matches the original
      return !Number.isNaN(d.valueOf()) && d.toISOString() === input;
    } catch (error) {
      // If any error occurs during validation, return false
      return false;
    }
  };