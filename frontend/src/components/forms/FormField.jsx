import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';

export const FormField = ({ type = 'text', ...props }) => {
  if (type === 'select') {
    return <Select {...props} />;
  }
  if (type === 'textarea') {
    return <Textarea {...props} />;
  }
  return <Input type={type} {...props} />;
};
