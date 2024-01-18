/* eslint-disable react/prop-types */
import clsx from 'clsx';
import React from 'react';
import { ROUTES } from '../constants/routes';
import { Route } from '../interfaces/Route';
import { useRouteStore } from '../stores/route-store';
import { Account } from './Account';

interface SideBarItemProps {
  route: Route;
  active: boolean;
}

const Item: React.FC<SideBarItemProps> = ({ route, active }) => {
  const setRoute = useRouteStore((state) => state.setRoute);
  return (
    <li className="text-ant-color-white pr-2">
      <button
        aria-label={`切换到${route.name}${active ? '（当前）' : ''}`}
        className={clsx(
          'block w-full py-3 px-4 rounded-r-md transition-all',
          active
            ? 'bg-ant-color-white text-ant-color-primary'
            : 'bg-transparent hover:bg-[rgba(255,255,255,0.2)] ',
        )}
        onClick={() => {
          setRoute(route);
        }}
      >
        <span className="float-left">{route.icon}</span>
        <span>{route.name}</span>
      </button>
    </li>
  );
};

export const SideBar: React.FC = () => {
  const current = useRouteStore((state) => state.route);

  if (!current) return null;

  return (
    <aside
      aria-label="侧边栏"
      className="fixed top-0 left-0 h-full w-52 bg-black z-40 transition-transform"
    >
      <Account />
      <nav aria-label="页面导航">
        <ul className="pt-6 space-y-2">
          {ROUTES.map((route) => (
            <Item
              key={route.id}
              route={route}
              active={current.id === route.id}
            />
          ))}
        </ul>
      </nav>
    </aside>
  );
};
