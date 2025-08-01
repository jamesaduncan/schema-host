import schema from './schema.json' with { type: 'json' };
import { microdata } from "/js/index.mjs";

if (!window.schemaRegistry) {
    window.schemaRegistry = {};
}

const registry = window.schemaRegistry;

async function populateRegistry( aURL ) {
    const response = await fetch( aURL );
    if ( response.ok ) {
        const data = microdata( await response.text() )[0];
        const validatorURL = data.validator;
        if ( validatorURL ) {
            const { validator } = await import( validatorURL );
            registry[ aURL ] = validator;
        } else {
            throw new Error(`No validator found for ${aURL}`);
        }
    }
}

export async function validator( toValidate ) {
    console.log( `Validating ${toValidate}` );
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
            if (!window.schemaRegistry[type]) {
                await populateRegistry( type );
            }

            if( !window.schemaRegistry[type]( toValidate[ property.name ] ) ) {
                console.warn(`Validation failed for property ${property.name} of type ${type} in schema ${schema["@id"]} (Value: ${toValidate[ property.name ]})`);
                return false;
            }
        }
    }
    console.log(`Schema ${schema["@id"]} validation passed for ${JSON.stringify(toValidate, null, 2)}`);
    return true;
}

window.schemaRegistry[schema["@id"]] = validator;
