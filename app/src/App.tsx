import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { ExampleType } from "../../common/types/example";
import { getExampleData, getTestDbConnection } from "./api/client";

function App() {
  const [data, setData] = useState<ExampleType[]>([]);
  const [dbConnection, setDbConnection] = useState<string | null>(null);
  useEffect(() => {
    getExampleData()
      .then((data) => setData(data));
    getTestDbConnection()
      .then((data) => setDbConnection(data));
  }, []);
  return (
    <div className="App">
      {data.map((data) => <div>{data.foo} - {data.bar}</div>)}
      {dbConnection}
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
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
