import React from 'react';
import { view } from '@forge/bridge';
view.theme.enable();
import { createRoot } from 'react-dom/client';
import App from './App';
createRoot(document.getElementById('root')).render(<App />);
