const { z } = require('zod');
const schemaConfig = require('../../data/schema.json');

const createValidator = () => {
    const shape = {};

    schemaConfig.fields.forEach((field) => {
        let v;

        switch (field.type) {
            case "number": {
                let baseNumber = z.number({ invalid_type_error: "Must be a number" });
                if (field.validation?.min !== undefined) baseNumber = baseNumber.min(field.validation.min, `Min value is ${field.validation.min}`);
                if (field.validation?.max !== undefined) baseNumber = baseNumber.max(field.validation.max, `Max value is ${field.validation.max}`);

                v = z.preprocess((val) => {
                    if (val === "" || val === null || val === undefined) return undefined;
                    if (typeof val === "number") return val;
                    const n = Number(val);
                    return isNaN(n) ? val : n;
                }, baseNumber);

                if (!field.required) v = v.optional();
                break;
            }

            case "multi-select": {
                let baseArray = z.array(z.string());
                if (field.validation?.minSelected !== undefined) baseArray = baseArray.min(field.validation.minSelected, `Select at least ${field.validation.minSelected}`);
                if (field.validation?.maxSelected !== undefined) baseArray = baseArray.max(field.validation.maxSelected, `Select at most ${field.validation.maxSelected}`);
                v = baseArray.default([]);
                if (field.required && !field.validation?.minSelected) v = v.min(1, "Selection is required");
                break;
            }

            case "switch": {
                v = z.boolean().default(false);
                break;
            }

            case "date": {
                // 1. Create the base date schema first.
                let baseDate = z.date({ invalid_type_error: "Invalid date" });

                // 2. Apply validations like .min() to the base schema.
                if (field.validation?.minDate) {
                    const min = new Date(field.validation.minDate);
                    baseDate = baseDate.min(min, `Date must be on or after ${field.validation.minDate}`);
                }

                // 3. Now, wrap the validated schema in preprocess.
                v = z.preprocess((val) => {
                    if (!val) return undefined;
                    if (val instanceof Date) return val;
                    const d = new Date(val);
                    return isNaN(d.getTime()) ? val : d;
                }, baseDate);

                if (!field.required) v = v.optional();
                else v = v.refine(val => val !== undefined, "Required");
                break;
            }

            default: { // text, textarea, select
                let baseString = z.string();
                if (typeof field.validation?.minLength === "number") {
                    baseString = baseString.min(field.validation.minLength, `Min ${field.validation.minLength} chars`);
                }
                if (typeof field.validation?.maxLength === "number") {
                    baseString = baseString.max(field.validation.maxLength, `Max ${field.validation.maxLength} chars`);
                }
                if (field.validation?.regex) {
                    baseString = baseString.regex(new RegExp(field.validation.regex), "Invalid format");
                }

                if (field.required) v = baseString.min(1, "Required");
                else v = baseString.optional();
                break;
            }
        }

        shape[field.id] = v;
    });

    return z.object(shape);
};

module.exports = { createValidator };
