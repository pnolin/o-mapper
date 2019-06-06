# O-Mapper
[![Build Status](https://travis-ci.org/opedromiranda/o-mapper.svg)](https://travis-ci.org/opedromiranda/o-mapper)


## What
Validation and conversion of a given object to another.

Like this:
```json
{
    "first_name": "Toby",
    "last_name": "Flenderson",
    "birth_date": "1971-04-01",
    "job_name": "HR",
    "extra_data": {
        "orders": []
    }
}
```
to this:
```javascript
{
    "full_name": "Toby Flenderson",
    "job": "HR",
    "birth_date": new Date("1971-04-01"),
    "orders": []
}
```


## How
```javascript
const omapper = require('o-mapper');

const schema = { ... };
const input = { ... };

const result = omapper(input, schema, options);
```

## Schema
Schemas are objects that will dictate what the final object will contain and where to get the values from the source object.
Each key from the schema represents a key of the final object.

```javascript
const schema = {

    // key property specifies what key to look for in the source object
    job: {
        key: 'job_name',
    },

    // when multiple keys are selected, an handler is required to process the multiple values
    full_name: {
        key: ['fist_name', 'last_name'],
        handler: (first, last) => `${first} ${last}`,
    },

    // handlers can also be used for single values
    // the key property can be omitted if it matches the final object
    // a property can be set as required
    birth_date: {
        handler: bd => new Date(bd),
        required: true,
    },

    // dot notation can also be used
    // default values can be set in case property doesn't exist
    orders: {
        key: 'data.orders',
        default: [],
    },
};
```

## Options
Options is an optional object that you can pass to the mapper to change its behaviour.
For now only `inherit` is supported.

### Inherit
Default value: `false`
When `inherit` is set to `true`, the resulting object will contains attributes from the original object that were not mentioned in the schema.

```javascript
const schema = {

    // when multiple keys are selected, an handler is required to process the multiple values
    full_name: {
        key: ['fist_name', 'last_name'],
        handler: (first, last) => `${first} ${last}`,
    },

    // handlers can also be used for single values
    // the key property can be omitted if it matches the final object
    // a property can be set as required
    birth_date: {
        handler: bd => new Date(bd),
        required: true,
    },

    // dot notation can also be used
    // default values can be set in case property doesn't exist
    orders: {
        key: 'data.orders',
        default: [],
    },
};
```

This schema will convert

```json
{
    "first_name": "Toby",
    "last_name": "Flenderson",
    "birth_date": "1971-04-01",
    "job_name": "HR",
    "extra_data": {
        "orders": []
    }
}
```
to this:
```javascript
{
    "full_name": "Toby Flenderson",
    "job_name": "HR",
    "birth_date": new Date("1971-04-01"),
    "orders": []
}
```

License
----

MIT
