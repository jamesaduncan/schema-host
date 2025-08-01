export default async function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy("src/styles.css");
    eleventyConfig.addPassthroughCopy("src/js/*");
    eleventyConfig.addPassthroughCopy("src/Validators/*.mjs");

    console.log(`Adding a filter for sorting`);
    eleventyConfig.addFilter("sortByProperty", ( values, property ) => {
        console.log(`Sorting by property: ${property}`);
        let vals = [...values];
        return vals.sort((a, b) => { return a.data[property].toLowerCase().localeCompare(b.data[property].toLowerCase()) });
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