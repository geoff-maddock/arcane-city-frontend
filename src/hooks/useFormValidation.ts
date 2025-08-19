import { useState, useCallback } from 'react';
import type { Schema, Validator } from '@/validation/schemas';
import { validate, collectFieldErrors } from '@/validation/schemas';

export interface UseFormValidationOptions<T extends Record<string, unknown>> {
    initialValues: T;
    schema: Schema;
    // Build the object actually passed to validate(); defaults to all values
    buildValidationValues?: (values: T) => Record<string, unknown>;
}

export interface UseFormValidationResult<T extends Record<string, unknown>> {
    values: T;
    setValues: React.Dispatch<React.SetStateAction<T>>;
    setFieldValue: (field: keyof T, value: unknown, opts?: { validate?: boolean }) => void;
    errors: Record<string, string[]>;
    touched: Record<string, boolean>;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    validateForm: () => boolean;
    getFieldError: (field: keyof T) => string | null;
    errorSummary: { fieldCount: number; messages: string[] } | null;
    generalError: string;
    setGeneralError: React.Dispatch<React.SetStateAction<string>>;
    applyExternalErrors: (errs: Record<string, string[]>) => void;
}

export function useFormValidation<T extends Record<string, unknown>>(options: UseFormValidationOptions<T>): UseFormValidationResult<T> {
    const { initialValues, schema, buildValidationValues } = options;
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [errorSummary, setErrorSummary] = useState<{ fieldCount: number; messages: string[] } | null>(null);
    const [generalError, setGeneralError] = useState('');

    const runFieldValidation = useCallback((field: keyof T, nextValues: T) => {
        const validators = schema[field as string];
        if (!validators) return;
        const partial: Record<string, Validator[]> = { [field as string]: validators } as Record<string, Validator[]>;
        const single = validate(nextValues as Record<string, unknown>, partial);
        const fieldErrors = (single.errors as Record<string, string[]>)[field as string] || [];
        setErrors(prev => ({ ...prev, [field as string]: fieldErrors }));
    }, [schema]);

    const setFieldValue = useCallback((field: keyof T, value: unknown, opts?: { validate?: boolean }) => {
        setValues(prev => {
            const next = { ...prev, [field]: value };
            if (opts?.validate && touched[field as string]) {
                runFieldValidation(field, next);
            }
            return next;
        });
    }, [runFieldValidation, touched]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const target = e.target as HTMLInputElement | HTMLTextAreaElement;
        const { name, value } = target;
        const isCheckbox = (target as HTMLInputElement).type === 'checkbox';
        const checked = (target as HTMLInputElement).checked;
        setValues(prev => {
            const next = { ...prev, [name]: isCheckbox ? checked : value };
            if (touched[name]) runFieldValidation(name as keyof T, next as T);
            return next as T;
        });
    }, [runFieldValidation, touched]);

    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const field = e.target.name;
        setTouched(prev => ({ ...prev, [field]: true }));
        setValues(prev => {
            runFieldValidation(field as keyof T, prev as T);
            return prev;
        });
    }, [runFieldValidation]);

    const validateForm = useCallback(() => {
        const fullValues = (buildValidationValues ? buildValidationValues(values) : values) as Record<string, unknown>;
        const result = validate(fullValues, schema);
        setErrors(result.errors as Record<string, string[]>);
        if (!result.valid) {
            const messages = Object.entries(result.errors)
                .filter(([f]) => f !== '_general')
                .map(([field, errs]) => {
                    const first = Array.isArray(errs) && errs.length > 0 ? errs[0] : 'Invalid';
                    return `${field}: ${first}`;
                });
            const general = (result.errors as Record<string, string[]>)._general as string[] | undefined;
            if (general && general.length) {
                general.forEach(msg => messages.push(msg));
            }
            setErrorSummary({ fieldCount: messages.length, messages });
        } else {
            setErrorSummary(null);
        }
        return result.valid;
    }, [values, schema, buildValidationValues]);

    const getFieldError = useCallback((field: keyof T) => {
        return collectFieldErrors(errors, field as string);
    }, [errors]);

    const applyExternalErrors = useCallback((errs: Record<string, string[]>) => {
        setErrors(prev => ({ ...prev, ...errs }));
        const messages = Object.entries(errs).map(([f, e]) => `${f}: ${e[0]}`);
        setErrorSummary({ fieldCount: messages.length, messages });
    }, []);

    return {
        values,
        setValues,
        setFieldValue,
        errors,
        touched,
        handleChange,
        handleBlur,
        validateForm,
        getFieldError,
        errorSummary,
        generalError,
        setGeneralError,
        applyExternalErrors,
    };
}
