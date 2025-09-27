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
    keyword: {
      color: '#c084fc',
      fontWeight: 'bold',
    },
    string: {
      color: '#86efac',
    },
    comment: {
      color: '#64748b',
      fontStyle: 'italic',
    },
    function: {
      color: '#fbbf24',
    },
  };

  const syntaxHighlight = (line: string) => {
    // Basic syntax highlighting
    let highlighted = line;

    // Keywords
    const keywords = ['function', 'let', 'const', 'var', 'for', 'while', 'if', 'else', 'return', 'new', 'true', 'false', 'break', 'continue'];
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlighted = highlighted.replace(regex, `<span style="color: #c084fc; font-weight: bold">${keyword}</span>`);
    });

    // Comments
    highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span style="color: #64748b; font-style: italic">$1</span>');

    // Strings
    highlighted = highlighted.replace(/(['"])((?:\\.|(?!\1).)*?)\1/g, '<span style="color: #86efac">$1$2$1</span>');

    // Functions
    highlighted = highlighted.replace(/(\w+)(\s*\()/g, '<span style="color: #fbbf24">$1</span>$2');

    // Numbers
    highlighted = highlighted.replace(/\b(\d+)\b/g, '<span style="color: #67e8f9">$1</span>');

    return { __html: highlighted };
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
            <span dangerouslySetInnerHTML={syntaxHighlight(line)} />
          </div>
        ))}
      </div>
    </div>
  );
};