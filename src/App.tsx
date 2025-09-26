// src/App.tsx
import React, { useState } from 'react';
import { Home } from './pages/Home';
import { SortingPage } from './pages/SortingPage';
import { ClusteringPage } from './pages/ClusteringPage';
import { GraphPage } from './pages/GraphPage';
import { SearchPage } from './pages/SearchPage';
import './index.css';

export type PageType = 'home' | 'sorting' | 'clustering' | 'graph' | 'search';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px',
    }
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />;
      case 'sorting':
        return <SortingPage onBack={() => setCurrentPage('home')} />;
      case 'clustering':
        return <ClusteringPage onBack={() => setCurrentPage('home')} />;
      case 'graph':
        return <GraphPage onBack={() => setCurrentPage('home')} />;
      case 'search':
        return <SearchPage onBack={() => setCurrentPage('home')} />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div style={styles.container}>
      {renderPage()}
    </div>
  );
}

export default App;