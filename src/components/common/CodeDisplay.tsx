// src/components/common/CodeDisplay.tsx
import React from 'react';

interface CodeDisplayProps {
  code: string[];
  currentLine: number;
  title?: string;
}

export const CodeDisplay: React.FC<CodeDisplayProps> = ({ 
  code, 
  currentLine, 
  title = "Algorithm Code" 
}) => {
  const styles = {
    container: {
      background: '#1e293b',
      borderRadius: '8px',
      padding: '16px',
      overflow: 'auto',
      maxHeight: '400px',
    },
    title: {
      color: '#94a3b8',
      fontSize: '14px',
      fontWeight: 'bold',
      marginBottom: '12px',
    },
    codeContainer: {
      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      fontSize: '13px',
      lineHeight: '1.5',
    },
    line: (isActive: boolean) => ({
      display: 'block',
      padding: '2px 8px',
      backgroundColor: isActive ? '#3b82f6' : 'transparent',
      color: isActive ? '#ffffff' : '#cbd5e1',
      borderRadius: '4px',
      transition: 'all 0.3s ease',
    }),
    lineNumber: {
      display: 'inline-block',
      width: '30px',
      color: '#64748b',
      textAlign: 'right' as const,
      marginRight: '16px',
      userSelect: 'none' as const,
    },
    codeText: {
      color: '#d4d4d4',
      whiteSpace: 'pre' as const,
    }
  };

  const syntaxHighlight = (line: string) => {
    // Handle empty lines
    if (!line || line.length === 0) {
      return <span>&nbsp;</span>;
    }
    
    // Check if it's a comment line
    if (line.trim().startsWith('//')) {
      return <span style={{ color: '#64748b', fontStyle: 'italic' }}>{line}</span>;
    }
    
    // Create a tokenizer that returns React elements
    const parts: React.ReactNode[] = [];
    const keywords = ['function', 'let', 'const', 'var', 'for', 'while', 'if', 'else', 'return', 'new', 'true', 'false', 'break', 'continue', 'of', 'in'];
    
    // Split line into tokens while preserving whitespace
    const tokens = line.split(/(\s+|[(){}[\],;.=<>!&|+\-*/])/);
    
    tokens.forEach((token, index) => {
      if (token === null || token === undefined || token === '') {
        return;
      }
      
      // Check if token is a keyword
      if (keywords.includes(token)) {
        parts.push(<span key={`${index}-kw`} style={{ color: '#c084fc', fontWeight: 'bold' }}>{token}</span>);
      }
      // Check if token is a number
      else if (/^\d+$/.test(token)) {
        parts.push(<span key={`${index}-num`} style={{ color: '#67e8f9' }}>{token}</span>);
      }
      // Check if token is a string
      else if (/^['"].*['"]$/.test(token)) {
        parts.push(<span key={`${index}-str`} style={{ color: '#86efac' }}>{token}</span>);
      }
      // Check if it's a function name (followed by parenthesis)
      else if (index < tokens.length - 1 && tokens[index + 1] === '(' && !/^[(){}[\],;.=<>!&|+\-*/\s]$/.test(token)) {
        parts.push(<span key={`${index}-fn`} style={{ color: '#fbbf24' }}>{token}</span>);
      }
      // Default text - wrapped in span with key
      else {
        parts.push(<span key={`${index}-txt`}>{token}</span>);
      }
    });
    
    return <span>{parts}</span>;
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>{title}</div>
      <div style={styles.codeContainer}>
        {code.map((line, index) => (
          <div
            key={index}
            style={styles.line(index === currentLine)}
          >
            <span style={styles.lineNumber}>{index + 1}</span>
            <span style={styles.codeText}>
              {syntaxHighlight(line)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};