import React from 'react';
import FormLabel from './FormLabel';
import FormInput from './FormInput';

export default function FormField({
    id,
    label,
    type = "text",
    placeholder,
    required = false,
    error,
    value,
    password,
    isValid,
    disabled = false,
    className = "",
    ...props
}) {
    return (
        <div className={`mb-4 ${className}`}>
            <FormLabel htmlFor={id} required={required}>
                {label}
            </FormLabel>
            <FormInput
                id={id}
                type={type}
                placeholder={placeholder}
                error={error}
                value={value}
                password={password}
                isValid={isValid}
                disabled={disabled}
                {...props}
            />
        </div>
    );
} 