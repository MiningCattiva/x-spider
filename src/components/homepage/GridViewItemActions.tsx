/* eslint-disable react/prop-types */
import React, { HTMLAttributes } from 'react';

export interface GridViewItemActionsProps {
  actions: {
    href?: string;
    onClick?: () => void;
    name: string;
  }[];
}

export const GridViewItemActions: React.FC<GridViewItemActionsProps> = ({
  actions,
}) => {
  return (
    <ul
      className="w-full h-full flex flex-col items-center justify-center px-6 space-y-2"
      aria-label="推文资源操作"
    >
      {actions.map((action) => {
        const commonProps: HTMLAttributes<
          HTMLAnchorElement | HTMLButtonElement
        > = {
          className:
            'block w-full bg-transparent border-[1px] rounded-full text-white py-1 text-center transition-colors hover:bg-white hover:text-black focus:bg-white focus:text-black',
          onClick: action.onClick,
        };

        return (
          <li className="w-full" key={action.name}>
            {action.href ? (
              <a
                href={action.href}
                target="_blank"
                rel="noreferrer"
                {...commonProps}
              >
                {action.name}
              </a>
            ) : (
              <button {...commonProps}>{action.name}</button>
            )}
          </li>
        );
      })}
    </ul>
  );
};
