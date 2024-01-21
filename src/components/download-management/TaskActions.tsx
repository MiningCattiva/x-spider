/* eslint-disable react/prop-types */
import clsx from 'clsx';
import React from 'react';

export interface TaskAction {
  name: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  primary?: boolean;
}

export interface TaskActionsProps {
  actions: TaskAction[];
}

export const TaskActions: React.FC<TaskActionsProps> = ({ actions }) => {
  return (
    <ul className="flex space-x-3 text-sm">
      {actions.map((action) => (
        <li key={action.name}>
          <button
            onClick={action.onClick}
            aria-label={action.name}
            title={action.name}
            className={clsx(
              'bg-transparent transition-colors space-x-1 hover:text-gray-500',
              action.primary && 'text-blue-500 hover:!text-blue-400',
              action.danger && 'text-red-500 hover:!text-red-400',
            )}
          >
            <span>{action.icon}</span>
            <span>{action.name}</span>
          </button>
        </li>
      ))}
    </ul>
  );
};
