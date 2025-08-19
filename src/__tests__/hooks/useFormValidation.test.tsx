import { render, fireEvent } from '../test-render';
import { describe, it, expect } from 'vitest';
import { useFormValidation } from '@/hooks/useFormValidation';
import { required, minLength, Schema } from '@/validation/schemas';

const schema: Schema = {
    name: [required(), minLength(3)],
    description: [minLength(5)]
};

function TestComponent() {
    const { values, handleChange, handleBlur, getFieldError, validateForm, errorSummary } = useFormValidation({
        initialValues: { name: '', description: '' },
        schema
    });
    return (
        <div>
            <input name="name" value={values.name} onChange={handleChange} onBlur={handleBlur} data-testid="name" />
            <textarea name="description" value={values.description} onChange={handleChange} onBlur={handleBlur} data-testid="description" />
            <button onClick={() => validateForm()} data-testid="submit">Submit</button>
            <div data-testid="name-error">{getFieldError('name')}</div>
            <div data-testid="summary">{errorSummary ? errorSummary.messages.join('|') : ''}</div>
        </div>
    );
}

describe('useFormValidation', () => {
    it('validates on blur and shows field error', () => {
        const { getByTestId } = render(<TestComponent />);
        const nameInput = getByTestId('name') as HTMLInputElement;
        fireEvent.blur(nameInput);
        expect(getByTestId('name-error').textContent).toContain('This field is required');
    });

    it('shows summary after submit', () => {
        const { getByTestId } = render(<TestComponent />);
        fireEvent.click(getByTestId('submit'));
        expect(getByTestId('summary').textContent).toContain('name: This field is required');
    });

    it('clears error when valid', () => {
        const { getByTestId } = render(<TestComponent />);
        const nameInput = getByTestId('name') as HTMLInputElement;
        fireEvent.change(nameInput, { target: { value: 'Valid Name' } });
        fireEvent.blur(nameInput);
        expect(getByTestId('name-error').textContent).toBe('');
    });
});
