import ReactDOM from 'react-dom/client';
import { App } from './App';
import './css/preflight.css';
import './css/base.css';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import 'dayjs/locale/zh-cn';
import './utils/log';
import { Logger } from './utils/log';

dayjs.extend(duration);
dayjs.locale('zh-cn');

function bootstrapLogger() {
  window.log = new Logger();

  window.addEventListener('error', (ev) => {
    log.error('Window error', {
      error: ev.error,
      message: ev.message,
      filename: ev.filename,
    });
  });

  window.addEventListener('unhandledrejection', (ev) => {
    log.error('Unhandled rejection', {
      promise: ev.promise,
      reason: ev.reason,
    });
  });
}

function bootstrapView() {
  log.info('Bootstrap view');
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <App />,
  );
}

async function bootstrap() {
  bootstrapLogger();
  log.info(`App bootstrap, version=${PACKAGE_JSON_VERSION}`);
  bootstrapView();
}

bootstrap();
