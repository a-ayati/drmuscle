import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { applyTheme, getThemeChoice, watchSystemTheme } from './lib/theme';

applyTheme(getThemeChoice());
watchSystemTheme();

createRoot(document.getElementById('root')!).render(<App />);
