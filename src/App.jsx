import React from "react";
import Routes from "./Routes";
import { CurrencyProvider } from './contexts/CurrencyContext';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <Routes />
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;
