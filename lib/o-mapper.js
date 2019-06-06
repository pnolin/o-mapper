function getOptions(options) {
    if (!options) {
        return {
            inherit: false
        }
    } else {
        return {
            inherit: options.inherit !== null && options.inherit !== undefined ? options.inherit : false
        }
    }
}

function getProperty(src, propertyPath) {
    let result;
    let originalPropertyPath = propertyPath;
    if (Array.isArray(originalPropertyPath) === false) {
        // property path is converted to array to extract next key and value
        originalPropertyPath = originalPropertyPath.split('.');
    }

    // get next property to be evaluated and remove it from path
    const nextPropertyKey = originalPropertyPath.shift();

    const nextValue = src ? src[nextPropertyKey] : src;

    if (originalPropertyPath.length > 0 && nextValue !== undefined) {
        // keep recursing until end of path is reached
        result = getProperty(nextValue, originalPropertyPath);
    } else {
        // end of propertyPath or undefined value was reached, set result as value of property
        result = nextValue;
    }

    return result;
}

function mapProperty(src, key, options) {
    let result;

    // either get the value from specified key
    // or get the value belonging in the same key as the schema key
    const k = options.key || key;

    if (Array.isArray(k)) {
        // multiple keys selected

        const values = k.map(srcKey => getProperty(src, srcKey));

        // handler is required to process multiple inputs
        if (!options.handler) {
            throw new Error('handler is required for multiple keys');
        }

        result = options.handler.apply(null, values);
    } else {
        result = getProperty(src, k);

        if (typeof result === 'undefined') {
            // throw error if nonexistant property is required
            if (options.required) {
                throw new Error(`field ${k} is required and missing`);
            }

            // set default value if existing
            if (Object.prototype.hasOwnProperty.call(options, 'default')) {
                result = options.default;
            }
        }

        // call handler function if existing
        if (Object.prototype.hasOwnProperty.call(options, 'handler')) {
            result = options.handler(result);
        }
    }

    return result;
}

function inheritRemainingPropertites(src, schema, dest) {
    Object.keys(src).forEach((key) => {
        const wasMapped = Object.keys(schema).some((schemaKey) => {
            if (schema[key] !== undefined) {
                return true;
            } else if (schema[schemaKey].key !== undefined) {
                const isArray = Array.isArray(schema[schemaKey].key);

                if (isArray) {
                    return schema[schemaKey].key.indexOf(key) !== -1;
                } else {
                    const splitted = schema[schemaKey].key.split('.');
                    return splitted.indexOf(key) !== -1;
                }
            }

            return false;
        });
        console.log(wasMapped);
        if (!wasMapped) {
            dest[key] = src[key];
        }
    });
}

function omapper(src, schema, options) {
    options = getOptions(options);
    const dest = {};
    if (!src) {
        return src;
    }
    Object.keys(schema).forEach((key) => {
        dest[key] = mapProperty(src, key, schema[key]);
    });

    if (options.inherit) {
        inheritRemainingPropertites(src, schema, dest);
    }

    return dest;
}

module.exports = omapper;
