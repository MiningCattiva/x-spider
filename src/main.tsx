import ReactDOM from 'react-dom/client';
import { App } from './App';
import './css/preflight.css';
import './css/base.css';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />,
);
