import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './services/theme';
import { LanguageProvider } from './services/i18n';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </ThemeProvider>
);
