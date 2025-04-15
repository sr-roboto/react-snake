import { useState } from 'react';
import SnakeGame from './components/SnakeGame';

function App() {
  return (
    <div className="min-h-screen bg-black flex justify-center items-center">
      <SnakeGame />
    </div>
  );
}

export default App;
