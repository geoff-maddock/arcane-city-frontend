import { describe, it, expect } from 'vitest';
import { validate, tagCreateSchema } from '@/validation/schemas';

function build(values: Partial<Record<string, unknown>>) {
    const base = { name: '', slug: '' };
    return { ...base, ...values } as Record<string, unknown>;
}

describe('tagCreateSchema', () => {
    it('fails when name and slug missing', () => {
        const res = validate(build({}), tagCreateSchema);
        expect(res.valid).toBe(false);
        expect(res.errors.name?.[0]).toMatch(/required/);
        expect(res.errors.slug?.[0]).toMatch(/required/);
    });
    it('fails when too short', () => {
        const res = validate(build({ name: 'ab', slug: 'cd' }), tagCreateSchema);
        expect(res.valid).toBe(false);
        expect(res.errors.name?.[0]).toMatch(/at least 3/);
        expect(res.errors.slug?.[0]).toMatch(/at least 3/);
    });
    it('fails when too long', () => {
        const long = 'x'.repeat(33);
        const res = validate(build({ name: long, slug: long }), tagCreateSchema);
        expect(res.valid).toBe(false);
        expect(res.errors.name?.[0]).toMatch(/at most 32/);
        expect(res.errors.slug?.[0]).toMatch(/at most 32/);
    });
    it('passes with valid length', () => {
        const res = validate(build({ name: 'music', slug: 'music' }), tagCreateSchema);
        expect(res.valid).toBe(true);
    });
});
