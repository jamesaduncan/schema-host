import schema from './schema.json' with { type: 'json' };
import { microdata } from "/js/index.mjs";

if (!window.schemaRegistry) {
    window.schemaRegistry = {};
}

const registry = window.schemaRegistry;

async function populateRegistry( aURL ) {
    console.log(`going to get schema at ${aURL}`);
    const response = await fetch( aURL );
    if ( response.ok ) {
        const text = await response.text();
        console.log( text );
        const data = microdata( text )[0];
        window.schemaRegistry[ aURL ] = data;
        const validatorURL = data.validator;
        if ( validatorURL ) {
            const { validator } = await import( validatorURL );
            registry[ aURL ].validator = validator;
        } else {
            throw new Error(`No validator found for ${aURL}`);
        }
    }
}

export async function validator( toValidate ) {
    if ( toValidate instanceof Node ) { // if this is an HTML element, then we want to process it for microdata first.
        toValidate = microdata( toValidate )[0];        
    }
    for ( const property of schema.property ) {
        if ( property.cardinality == "1" || property.cardinality == "1..n" ) {
            if (!toValidate[ property.name ]) {
                console.warn(`Property ${property.name} is missing in schema ${schema["@id"]}`);
                return false;
            } else {
                //console.log("Property " + property.name + " is present");
            }
        } else {
            //console.log(`Property ${property.name} is optional in schema ${schema["@id"]}`);
        }

        if ( toValidate[ property.name ] ) {
            const type = property.type;
            console.log(`Need to validate type ${type}`);
            if (!window.schemaRegistry[type]) {
                console.log(`Don't have a ${type} in the schema registry, going to get it...`);
                await populateRegistry( type );
            }
            console.log(`Got the schema: ${JSON.stringify(window.schemaRegistry[ type ])}`);
            window.schemaRegistry[ type ].validate( toValidate[ property.name ] );


            if (!window.schemaRegistry[type]) {
                console.warn(`Type ${type} is not registered in schema registry for property ${property.name} in schema ${schema["@id"]}`);
            } else if( !window.schemaRegistry[type].validate( toValidate[ property.name ] ) ) {
                console.warn(`Validation failed for property ${property.name} of type ${type} in schema ${schema["@id"]} (Value: ${toValidate[ property.name ]})`);
                return false;
            }
        }
    }
    console.log(`Schema ${schema["@id"]} validation passed for ${JSON.stringify(toValidate, null, 2)}`);
    return true;
}

schema.validator = validator;
window.schemaRegistry[schema["@id"]] = schema;

