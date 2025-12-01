import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StringMultiInput } from '../../components/StringMultiInput';

describe('StringMultiInput', () => {
  it('renders with label', () => {
    const onChange = vi.fn();
    render(
      <StringMultiInput
        label="Test Label"
        value={[]}
        onChange={onChange}
      />
    );

    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('displays placeholder when empty', () => {
    const onChange = vi.fn();
    render(
      <StringMultiInput
        label="Test"
        value={[]}
        onChange={onChange}
        placeholder="Type something..."
      />
    );

    const input = screen.getByPlaceholderText('Type something...');
    expect(input).toBeInTheDocument();
  });

  it('displays existing values as tags', () => {
    const onChange = vi.fn();
    const values = ['Alias 1', 'Alias 2', 'Alias 3'];
    
    render(
      <StringMultiInput
        label="Aliases"
        value={values}
        onChange={onChange}
      />
    );

    values.forEach(value => {
      expect(screen.getByText(value)).toBeInTheDocument();
    });
  });

  it('adds a new value when Enter is pressed', () => {
    const onChange = vi.fn();
    render(
      <StringMultiInput
        label="Test"
        value={['Existing']}
        onChange={onChange}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'New Value' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(['Existing', 'New Value']);
  });

  it('does not add duplicate values', () => {
    const onChange = vi.fn();
    render(
      <StringMultiInput
        label="Test"
        value={['Existing']}
        onChange={onChange}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Existing' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('trims whitespace when adding values', () => {
    const onChange = vi.fn();
    render(
      <StringMultiInput
        label="Test"
        value={[]}
        onChange={onChange}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '  Trimmed Value  ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(['Trimmed Value']);
  });

  it('does not add empty values', () => {
    const onChange = vi.fn();
    render(
      <StringMultiInput
        label="Test"
        value={[]}
        onChange={onChange}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('removes value when X button is clicked', () => {
    const onChange = vi.fn();
    render(
      <StringMultiInput
        label="Test"
        value={['Value 1', 'Value 2', 'Value 3']}
        onChange={onChange}
      />
    );

    const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
    fireEvent.click(removeButtons[1]); // Remove "Value 2"

    expect(onChange).toHaveBeenCalledWith(['Value 1', 'Value 3']);
  });

  it('removes last value when Backspace is pressed with empty input', () => {
    const onChange = vi.fn();
    render(
      <StringMultiInput
        label="Test"
        value={['Value 1', 'Value 2']}
        onChange={onChange}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Backspace' });

    expect(onChange).toHaveBeenCalledWith(['Value 1']);
  });

  it('does not remove value when Backspace is pressed with text in input', () => {
    const onChange = vi.fn();
    render(
      <StringMultiInput
        label="Test"
        value={['Value 1', 'Value 2']}
        onChange={onChange}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'some text' } });
    fireEvent.keyDown(input, { key: 'Backspace' });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('respects disabled prop', () => {
    const onChange = vi.fn();
    render(
      <StringMultiInput
        label="Test"
        value={['Value 1']}
        onChange={onChange}
        disabled={true}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();

    fireEvent.change(input, { target: { value: 'New Value' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('clears input after adding a value', () => {
    const onChange = vi.fn();
    render(
      <StringMultiInput
        label="Test"
        value={[]}
        onChange={onChange}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'New Value' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(input.value).toBe('');
  });
});
