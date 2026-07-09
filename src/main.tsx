import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupFetchInterceptor } from './lib/apiMock.ts';

// Initialize full client-side simulated DB fallback if backend server is unreachable (e.g. static hosts like Vercel)
setupFetchInterceptor();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
