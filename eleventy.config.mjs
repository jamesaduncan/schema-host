export default async function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy("src/styles.css");
    eleventyConfig.addPassthroughCopy("src/js/*");
    eleventyConfig.addPassthroughCopy("src/Validators/*.mjs");
    eleventyConfig.addPassthroughCopy("src/*/*.mjs")
    eleventyConfig.addPassthroughCopy("src/CNAME");

    console.log(`Adding a filter for sorting`);
    eleventyConfig.addFilter("sortByProperty", ( values, property ) => {
        console.log(`Sorting by property: ${property}`);
        let vals = [...values];
        return vals.sort((a, b) => { return a.data[property].toLowerCase().localeCompare(b.data[property].toLowerCase()) });
    });

    eleventyConfig.addFilter("striptype", ( original ) => {
        const object = {};
        Object.assign(object, original);
        ['@type','@context', 'name', 'description', 'validator'].forEach( i => delete object[i] );
        return object;
    });

    eleventyConfig.addFilter("stripkeys", ( original, ...keys ) => {
        const object = {};
        Object.assign(object, original);
        keys.forEach( i => delete object[i] );
        return object;
    });

    eleventyConfig.setServerOptions({
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
    });

    // Date filter for sitemap
    eleventyConfig.addFilter("date", (date, format) => {
        const d = new Date(date);
        if (format === '%Y-%m-%d') {
            return d.toISOString().split('T')[0];
        }
        return d.toISOString();
    });
};

export const config = {
    dir: {
        input: "src",
        output: "docs"
    }
}