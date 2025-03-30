import React from 'react';
import './App.css';
import GameBoard from './components/GameBoard';
import { GameProvider } from './contexts/GameContext';

function App() {
  return (
    <div className="App">
      <h1>Tetris Game</h1>
      <GameProvider>
        <GameBoard />
      </GameProvider>
    </div>
  );
}

export default App; 