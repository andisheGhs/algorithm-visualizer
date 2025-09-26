// src/components/Visualizers/SortingVisualizer.tsx
import React, { useState } from 'react';

type SortingAlgorithm = 'merge' | 'quick' | 'tim' | 'heap' | 'bubble' | 'power';
type InputType = 'random' | 'nearly-sorted' | 'reversed' | 'few-unique' | 'custom';

export const SortingVisualizer: React.FC = () => {
  const [arraySize, setArraySize] = useState(30);
  const [inputType, setInputType] = useState<InputType>('random');
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<SortingAlgorithm[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [speed, setSpeed] = useState(500);
  const [isRunning, setIsRunning] = useState(false);
  const [array, setArray] = useState<number[]>([]);

  const algorithms = [
    { id: 'merge', name: 'Merge Sort', color: '#10b981' },
    { id: 'quick', name: 'Quick Sort', color: '#3b82f6' },
    { id: 'tim', name: 'Tim Sort', color: '#8b5cf6' },
    { id: 'heap', name: 'Heap Sort', color: '#f59e0b' },
    { id: 'bubble', name: 'Bubble Sort', color: '#ef4444' },
    { id: 'power', name: 'Power Sort', color: '#ec4899' },
  ];

  const styles = {
    container: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '32px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
    section: {
      marginBottom: '24px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '12px',
      color: '#374151',
    },
    inputGroup: {
      display: 'flex',
      gap: '16px',
      alignItems: 'center',
      flexWrap: 'wrap' as const,
    },
    label: {
      fontSize: '14px',
      color: '#6b7280',
      minWidth: '80px',
    },
    input: {
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #d1d5db',
      fontSize: '14px',
      width: '100px',
    },
    select: {
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #d1d5db',
      fontSize: '14px',
      backgroundColor: 'white',
      cursor: 'pointer',
    },
    algorithmGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '12px',
    },
    algorithmCard: (isSelected: boolean, color: string) => ({
      padding: '12px',
      borderRadius: '8px',
      border: `2px solid ${isSelected ? color : '#e5e7eb'}`,
      backgroundColor: isSelected ? `${color}10` : 'white',
      cursor: 'pointer',
      textAlign: 'center' as const,
      transition: 'all 0.2s',
      fontWeight: isSelected ? 'bold' : 'normal',
      color: isSelected ? color : '#374151',
    }),
    visualizationArea: {
      display: 'grid',
      gridTemplateColumns: selectedAlgorithms.length === 1 ? '1fr' : '1fr 1fr',
      gap: '20px',
      marginTop: '20px',
    },
    algorithmBox: {
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      padding: '20px',
    },
    barsContainer: {
      height: '300px',
      display: 'flex',
      alignItems: 'flex-end',
      gap: '2px',
      padding: '10px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
    },
    bar: (height: number, color: string) => ({
      flex: 1,
      height: `${height}%`,
      backgroundColor: color,
      borderRadius: '4px 4px 0 0',
      transition: 'all 0.3s ease',
    }),
    controls: {
      display: 'flex',
      justifyContent: 'center',
      gap: '16px',
      marginTop: '24px',
    },
    button: (variant: 'primary' | 'secondary') => ({
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '16px',
      transition: 'all 0.2s',
      backgroundColor: variant === 'primary' ? '#10b981' : '#6b7280',
      color: 'white',
    }),
    speedControl: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    slider: {
      width: '200px',
    },
    customInputArea: {
      width: '100%',
      padding: '8px',
      borderRadius: '6px',
      border: '1px solid #d1d5db',
      fontSize: '14px',
      marginTop: '8px',
    }
  };

  const generateArray = () => {
    let newArray: number[] = [];
    
    switch (inputType) {
      case 'random':
        newArray = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 100) + 1);
        break;
      case 'nearly-sorted':
        newArray = Array.from({ length: arraySize }, (_, i) => i + 1);
        // Swap a few elements
        for (let i = 0; i < arraySize / 10; i++) {
          const idx1 = Math.floor(Math.random() * arraySize);
          const idx2 = Math.floor(Math.random() * arraySize);
          [newArray[idx1], newArray[idx2]] = [newArray[idx2], newArray[idx1]];
        }
        break;
      case 'reversed':
        newArray = Array.from({ length: arraySize }, (_, i) => arraySize - i);
        break;
      case 'few-unique':
        const uniqueValues = [10, 30, 50, 70, 90];
        newArray = Array.from({ length: arraySize }, () => 
          uniqueValues[Math.floor(Math.random() * uniqueValues.length)]
        );
        break;
      case 'custom':
        const numbers = customInput.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        newArray = numbers.slice(0, 50); // Limit to 50 elements
        break;
    }
    
    setArray(newArray);
  };

  const toggleAlgorithm = (algo: SortingAlgorithm) => {
    setSelectedAlgorithms(prev => {
      if (prev.includes(algo)) {
        return prev.filter(a => a !== algo);
      } else if (prev.length < 2) {
        return [...prev, algo];
      } else {
        // Replace the oldest selection
        return [prev[1], algo];
      }
    });
  };

  React.useEffect(() => {
    generateArray();
  }, [arraySize, inputType]);

  return (
    <div style={styles.container}>
      {/* Input Configuration */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📝 Input Configuration</h3>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Size (n):</label>
          <input
            type="number"
            min="5"
            max="100"
            value={arraySize}
            onChange={(e) => setArraySize(Number(e.target.value))}
            style={styles.input}
            disabled={isRunning}
          />
          
          <label style={styles.label}>Input Type:</label>
          <select
            value={inputType}
            onChange={(e) => setInputType(e.target.value as InputType)}
            style={styles.select}
            disabled={isRunning}
          >
            <option value="random">Random</option>
            <option value="nearly-sorted">Nearly Sorted</option>
            <option value="reversed">Reversed</option>
            <option value="few-unique">Few Unique Values</option>
            <option value="custom">Custom Input</option>
          </select>

          <button
            style={{ ...styles.button('secondary'), padding: '8px 16px' }}
            onClick={generateArray}
            disabled={isRunning}
          >
            Regenerate
          </button>
        </div>

        {inputType === 'custom' && (
          <div>
            <textarea
              style={styles.customInputArea}
              placeholder="Enter numbers separated by commas (max 50 numbers). Example: 5, 2, 8, 1, 9"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              rows={2}
            />
          </div>
        )}
      </div>

      {/* Algorithm Selection */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🎯 Select Algorithms (Max 2)</h3>
        <div style={styles.algorithmGrid}>
          {algorithms.map((algo) => (
            <div
              key={algo.id}
              style={styles.algorithmCard(
                selectedAlgorithms.includes(algo.id as SortingAlgorithm),
                algo.color
              )}
              onClick={() => toggleAlgorithm(algo.id as SortingAlgorithm)}
            >
              {algo.name}
            </div>
          ))}
        </div>
      </div>

      {/* Visualization Area */}
      {selectedAlgorithms.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📊 Visualization</h3>
          <div style={styles.visualizationArea}>
            {selectedAlgorithms.map((algoId) => {
              const algo = algorithms.find(a => a.id === algoId)!;
              return (
                <div key={algoId} style={styles.algorithmBox}>
                  <h4 style={{ color: algo.color, marginBottom: '12px', fontSize: '18px', fontWeight: 'bold' }}>
                    {algo.name}
                  </h4>
                  <div style={styles.barsContainer}>
                    {array.map((value, index) => (
                      <div
                        key={index}
                        style={styles.bar((value / 100) * 100, algo.color)}
                      />
                    ))}
                  </div>
                  <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
                    <div>Comparisons: 0</div>
                    <div>Swaps: 0</div>
                    <div>Time: 0ms</div>
                    <div>Status: Ready</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Speed Control and Playback */}
      <div style={styles.section}>
        <div style={styles.speedControl}>
          <label style={styles.label}>Speed:</label>
          <input
            type="range"
            min="50"
            max="2000"
            step="50"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={styles.slider}
          />
          <span>{speed}ms</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div style={styles.controls}>
        <button
          style={styles.button('primary')}
          onClick={() => setIsRunning(true)}
          disabled={isRunning || selectedAlgorithms.length === 0}
        >
          ▶ {selectedAlgorithms.length === 2 ? 'Start Race' : 'Start'}
        </button>
        <button
          style={styles.button('secondary')}
          onClick={() => setIsRunning(false)}
          disabled={!isRunning}
        >
          ⏸ Pause
        </button>
        <button
          style={styles.button('secondary')}
          onClick={() => {
            setIsRunning(false);
            generateArray();
          }}
        >
          ⏹ Reset
        </button>
      </div>
    </div>
  );
};