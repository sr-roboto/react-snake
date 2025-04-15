import { useState } from 'react';
import SnakeGame from './components/SnakeGame';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <SnakeGame />
    </div>
  );
}

export default App;
