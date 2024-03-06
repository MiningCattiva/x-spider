/* eslint-disable react/prop-types */
import React from 'react';
import { buildFileName } from '../../utils/file-name-template';
import { EXAMPLE_FILE_NAME_TEMPLATE_DATA } from '../../constants/file-name-template';

export const TemplateExample: React.FC<{
  value?: string;
  autoEscape?: boolean;
}> = ({ value, autoEscape }) => {
  return (
    <section className="text-gray-600 text-xs mt-4">
      <strong>输出示例：</strong>
      <span>
        {buildFileName(
          value || '',
          EXAMPLE_FILE_NAME_TEMPLATE_DATA,
          autoEscape,
        )}
      </span>
    </section>
  );
};
