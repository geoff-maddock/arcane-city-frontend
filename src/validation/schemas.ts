// Centralized form validation schemas (lightweight custom implementation to avoid new deps)
// Each schema maps field name to an array of validators. A validator returns a string (error) or undefined.

export type Validator = (value: unknown, allValues: Record<string, unknown>) => string | undefined;
export interface Schema {
    [field: string]: Validator[] | undefined;
}

export interface ValidationResult<T> {
    values: T;
    errors: { [K in keyof T]?: string[] } & { _general?: string[] };
    valid: boolean;
}

export function validate<TValues extends Record<string, unknown>>(values: TValues, schema: Schema): ValidationResult<TValues> {
    const errors: Record<string, string[]> = {};
    Object.keys(schema).forEach((key) => {
        const validators = schema[key];
        if (!validators) return;
        const val = values[key as keyof TValues];
        validators.forEach((fn) => {
            const err = fn(val, values as Record<string, unknown>);
            if (err) {
                if (!errors[key as string]) errors[key as string] = [];
                errors[key as string].push(err);
            }
        });
    });
    return { values, errors: errors as ValidationResult<TValues>["errors"], valid: Object.keys(errors).length === 0 };
}

// Common primitive validators
export const required = (message = 'This field is required'): Validator => (val) => {
    if (val === undefined || val === null) return message;
    if (typeof val === 'string' && val.trim() === '') return message;
    if (Array.isArray(val) && val.length === 0) return message;
    return undefined;
};

export const maxLength = (limit: number, message?: string): Validator => (val) => {
    if (typeof val === 'string' && val.length > limit) return message || `Must be at most ${limit} characters`;
    return undefined;
};

export const minLength = (limit: number, message?: string): Validator => (val) => {
    if (typeof val === 'string' && val.length < limit) return message || `Must be at least ${limit} characters`;
    return undefined;
};

export const isNumber = (message = 'Must be a number'): Validator => (val) => {
    if (val === '' || val === undefined || val === null) return undefined; // allow empty -> optional
    return isNaN(Number(val)) ? message : undefined;
};

export const positive = (message = 'Must be positive'): Validator => (val) => {
    if (val === '' || val === undefined || val === null) return undefined;
    return Number(val) < 0 ? message : undefined;
};

export const datetimeOrder = (startField: string, endField: string, message = 'End must be after start'): Validator => (_val, all) => {
    const start = all[startField] as string | number | Date | undefined;
    const end = all[endField] as string | number | Date | undefined;
    if (!start || !end) return undefined;
    const startInput = typeof start === 'string' || typeof start === 'number' ? start : (start instanceof Date ? start.toISOString() : undefined);
    const endInput = typeof end === 'string' || typeof end === 'number' ? end : (end instanceof Date ? end.toISOString() : undefined);
    if (startInput === undefined || endInput === undefined) return undefined;
    const startDate = new Date(startInput).getTime();
    const endDate = new Date(endInput).getTime();
    if (isNaN(startDate) || isNaN(endDate)) return undefined;
    if (endDate < startDate) return message;
    return undefined;
};

export const url = (message = 'Must be a valid URL'): Validator => (val) => {
    if (!val) return undefined;
    if (typeof val !== 'string') return message;
    try { new URL(val); return undefined; } catch { return message; }
};

// Schemas for specific forms
// Define the subset of fields we validate for each form
export interface EventCreateFields { [k: string]: unknown; name: string; slug: string; short: string; description: string; presale_price: string | number | ''; door_price: string | number | ''; start_at: string; end_at: string; primary_link: string; ticket_link: string; }
export const eventCreateSchema: Schema = {
    name: [required(), minLength(3)],
    slug: [required(), minLength(3)],
    short: [maxLength(280)],
    description: [minLength(10)],
    presale_price: [isNumber(), positive()],
    door_price: [isNumber(), positive()],
    start_at: [required()],
    end_at: [datetimeOrder('start_at', 'end_at')],
    primary_link: [url()],
    ticket_link: [url()],
};

export interface SeriesEditFields { [k: string]: unknown; name: string; slug: string; short: string; description: string; presale_price: string | number | ''; door_price: string | number | ''; start_at: string; end_at: string; primary_link: string; ticket_link: string; }
export const seriesEditSchema: Schema = {
    name: [required(), minLength(3)],
    slug: [required(), minLength(3)],
    short: [maxLength(280)],
    description: [minLength(10)],
    presale_price: [isNumber(), positive()],
    door_price: [isNumber(), positive()],
    start_at: [],
    end_at: [datetimeOrder('start_at', 'end_at')],
    primary_link: [url()],
    ticket_link: [url()],
};

// Aliases for create/edit parity (can diverge later if rules differ)
export const seriesCreateSchema = seriesEditSchema;
export const eventEditSchema = eventCreateSchema;

// Tag schemas (create/edit) - only name & slug validated currently
export const tagCreateSchema: Schema = {
    name: [required(), minLength(3), maxLength(32)],
    slug: [required(), minLength(3), maxLength(32)],
};
export const tagEditSchema = tagCreateSchema;

export function collectFieldErrors(errors: Record<string, string[]>, field: string): string | null {
    if (!errors[field] || errors[field].length === 0) return null;
    return errors[field].join(' ');
}
