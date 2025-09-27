// src/components/common/CodeDisplay.tsx
import React from 'react';

interface CodeDisplayProps {
  code: string[];
  currentLine: number;
  title?: string;
  language?: string;
}

export const CodeDisplay: React.FC<CodeDisplayProps> = ({
  code,
  currentLine,
  title = 'Algorithm',
  language = 'javascript'
}) => {
  const styles = {
    container: {
      background: '#1e1e1e',
      borderRadius: '8px',
      padding: '16px',
      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      fontSize: '13px',
      overflow: 'auto',
      maxHeight: '500px',
    },
    header: {
      color: '#fff',
      fontWeight: 'bold',
      marginBottom: '12px',
      fontSize: '14px',
      borderBottom: '1px solid #333',
      paddingBottom: '8px',
    },
    lineNumber: {
      display: 'inline-block',
      width: '30px',
      color: '#858585',
      textAlign: 'right' as const,
      paddingRight: '12px',
      userSelect: 'none' as const,
    },
    codeLine: (isActive: boolean) => ({
      display: 'block',
      backgroundColor: isActive ? 'rgba(255, 235, 59, 0.2)' : 'transparent',
      borderLeft: isActive ? '3px solid #ffeb3b' : '3px solid transparent',
      paddingLeft: '8px',
      transition: 'all 0.3s ease',
      minHeight: '20px',
      lineHeight: '20px',
    }),
    codeText: {
      color: '#d4d4d4',
      whiteSpace: 'pre' as const,
    }
  };

  const getHighlightedLine = (line: string) => {
    // Parse the line and return React elements instead of HTML strings
    const keywords = ['function', 'let', 'const', 'var', 'if', 'else', 'for', 'while', 'return', 'new', 'delete', 'of', 'in', 'true', 'false'];
    
    // Check if it's a comment line
    if (line.trim().startsWith('//')) {
      return <span style={{ color: '#6a9955' }}>{line}</span>;
    }
    
    // Create a more robust tokenizer
    const parts: React.ReactNode[] = [];
    let currentPos = 0;
    
    // Regular expression to match keywords, numbers, strings, and function names
    const regex = /\b(function|let|const|var|if|else|for|while|return|new|delete|of|in|true|false)\b|\b\d+\b|'[^']*'|"[^"]*"|\w+(?=\()/g;
    
    let match;
    while ((match = regex.exec(line)) !== null) {
      // Add text before the match
      if (match.index > currentPos) {
        parts.push(line.substring(currentPos, match.index));
      }
      
      const matchedText = match[0];
      
      if (keywords.includes(matchedText)) {
        // Keywords
        parts.push(<span key={match.index} style={{ color: '#569cd6' }}>{matchedText}</span>);
      } else if (/^\d+$/.test(matchedText)) {
        // Numbers
        parts.push(<span key={match.index} style={{ color: '#b5cea8' }}>{matchedText}</span>);
      } else if (matchedText.startsWith("'") || matchedText.startsWith('"')) {
        // Strings
        parts.push(<span key={match.index} style={{ color: '#ce9178' }}>{matchedText}</span>);
      } else if (line[match.index + matchedText.length] === '(') {
        // Function names (word followed by parenthesis)
        parts.push(<span key={match.index} style={{ color: '#dcdcaa' }}>{matchedText}</span>);
      } else {
        parts.push(matchedText);
      }
      
      currentPos = match.index + matchedText.length;
    }
    
    // Add remaining text
    if (currentPos < line.length) {
      parts.push(line.substring(currentPos));
    }
    
    return <>{parts}</>;
  };

  return (
    <div style={styles.container}>
      {title && <div style={styles.header}>{title}</div>}
      <div>
        {code.map((line, index) => (
          <div key={index} style={styles.codeLine(index === currentLine)}>
            <span style={styles.lineNumber}>{index + 1}</span>
            <span style={styles.codeText}>
              {getHighlightedLine(line)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};