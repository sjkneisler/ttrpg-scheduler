import { Example } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { getExampleData, seed } from './api/client';

function App() {
  const [data, setData] = useState<Example[]>([]);
  useEffect(() => {
    getExampleData().then(setData);
  }, []);
  return (
    <div className="App">
      {data.map((datum) => (
        <div>
          {datum.foo}
          {' '}
          -
          {' '}
          {datum.bar}
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          seed();
        }}
      >
        Seed
      </button>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit
          {' '}
          <code>src/App.tsx</code>
          {' '}
          and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
