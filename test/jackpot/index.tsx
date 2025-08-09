import React from 'react';
import ReactDOM from 'react-dom/client';
import { JackpotMachine } from './JackpotMachine';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <JackpotMachine />
  </React.StrictMode>
);