import { ReactElement } from 'react';

export interface Route {
  id: string;
  name: string;
  icon: ReactElement;
  element: ReactElement;
}
