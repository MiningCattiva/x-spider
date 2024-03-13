/* eslint-disable react/prop-types */
import React from 'react';
import { resolveVariables } from '../../utils/file-name-template';
import { EXAMPLE_FILE_NAME_TEMPLATE_DATA } from '../../constants/file-name-template';

export const TemplateExample: React.FC<{
  value?: string;
}> = ({ value }) => {
  return (
    <section className="text-gray-600 text-xs mt-4">
      <strong>输出示例：</strong>
      <span>
        {resolveVariables(value || '', EXAMPLE_FILE_NAME_TEMPLATE_DATA)}
      </span>
    </section>
  );
};
