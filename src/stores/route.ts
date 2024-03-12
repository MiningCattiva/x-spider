import { create } from 'zustand';
import { ROUTES } from '../constants/routes';
import { Route } from '../interfaces/Route';

function getRouteFromHash(): Route | null {
  if (!location.hash) return null;

  return ROUTES.find((route) => route.id === location.hash.slice(1)) || null;
}

function setRouteToHash(route: Route) {
  location.hash = route.id;
}

export interface RouteStore {
  route: Route | null;
  setRoute: (route: Route) => void;
}

export const useRouteStore = create<RouteStore>((set) => ({
  route: null,
  setRoute: (route: Route) => {
    set({
      route,
    });
    setRouteToHash(route);
  },
}));

// 推迟设置 route，避免因循环引用导致报错
setTimeout(() => {
  useRouteStore.setState({
    route: getRouteFromHash() || ROUTES[0],
  });
}, 10);
