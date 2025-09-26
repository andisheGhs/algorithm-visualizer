# 🎯 Algorithm Visualizer

A modern, interactive web application for visualizing and comparing various algorithms including sorting, graph traversal, and clustering algorithms. Built with React, TypeScript, and Framer Motion.

![Algorithm Visualizer Demo](https://img.shields.io/badge/Demo-Live-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![React](https://img.shields.io/badge/React-18.2-cyan)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### 🏁 Algorithm Racing Mode
- **Head-to-head comparison** of Merge Sort vs Quick Sort
- Real-time performance metrics (comparisons, swaps, array accesses)
- Different input types: random, nearly sorted, reversed arrays
- Visual feedback with color-coded operations

### 🔗 Correlation Clustering (Pivot Algorithm)
- Interactive graph builder with positive/negative edges
- Visual clustering process with animated pivot selection
- Mistake counting and cost calculation
- Support for complex signed graphs

### 📊 Additional Algorithms (Coming Soon)
- Dijkstra's shortest path
- A* pathfinding
- K-means clustering
- Bellman-Ford algorithm

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/algorithm-visualizer.git
cd algorithm-visualizer

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
algorithm-visualizer/
├── src/
│   ├── algorithms/       # Algorithm implementations
│   │   ├── sorting/      # Merge sort, Quick sort
│   │   ├── clustering/   # Pivot, K-means
│   │   └── graph/        # Dijkstra, A*
│   ├── components/       # React components
│   │   ├── Visualizers/  # Algorithm visualizers
│   │   └── Controls/     # Playback controls
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript definitions
│   └── utils/           # Helper functions
├── public/              # Static assets
└── package.json
```

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: React hooks + Zustand
- **Visualization**: D3.js (for complex graphs)

## 🎮 Usage

### Sorting Algorithm Race

1. Select "Sorting Race" from the navigation
2. Choose array type (random, nearly sorted, reversed)
3. Adjust array size and animation speed
4. Click "Start Race" to begin the comparison
5. Watch real-time statistics and see which algorithm wins!

### Correlation Clustering

1. Select "Correlation Clustering" from the navigation
2. Build your graph:
   - Click "Add Nodes" and click on canvas to place nodes
   - Click "Add Edges" and select edge type (positive/negative)
   - Click two nodes to connect them
3. Click "Start" to run the Pivot algorithm
4. Observe cluster formation and mistake calculation

## 📈 Algorithm Complexity

| Algorithm | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Merge Sort | O(n log n) | O(n) |
| Quick Sort | O(n log n) avg, O(n²) worst | O(log n) |
| Pivot Clustering | O(V + E) | O(V) |
| Dijkstra | O((V + E) log V) | O(V) |
| K-Means | O(n·k·i·d) | O(n + k) |

## 🚢 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/algorithm-visualizer)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts
# Your app will be live at https://your-app.vercel.app
```

### Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/algorithm-visualizer)

```bash
# Build the project
npm run build

# Drag and drop the 'dist' folder to Netlify
# Or use Netlify CLI:
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=your_api_url_if_needed
VITE_ANALYTICS_ID=your_analytics_id
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Future Enhancements

- [ ] Add more sorting algorithms (Heap Sort, Radix Sort)
- [ ] Implement A* pathfinding with heuristics
- [ ] Add graph algorithms (BFS, DFS, MST)
- [ ] Create algorithm complexity analyzer
- [ ] Add sound effects for operations
- [ ] Implement dark mode
- [ ] Add tutorial mode for beginners
- [ ] Export visualizations as GIFs
- [ ] Mobile responsive design improvements
- [ ] Algorithm performance benchmarking

## 📚 Learning Resources

- [Introduction to Algorithms (CLRS)](https://mitpress.mit.edu/books/introduction-algorithms)
- [Algorithm Visualizations](https://www.cs.usfca.edu/~galles/visualization/Algorithms.html)
- [Big-O Cheat Sheet](https://www.bigocheatsheet.com/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [VisuAlgo](https://visualgo.net/)
- Icons from [Heroicons](https://heroicons.com/)
- Color scheme from [Tailwind CSS](https://tailwindcss.com/)

## 📧 Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter) - email@example.com

Project Link: [https://github.com/yourusername/algorithm-visualizer](https://github.com/yourusername/algorithm-visualizer)

---

Made with ❤️ by Andisheh