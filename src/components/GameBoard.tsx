import React, { useEffect, useCallback } from 'react';
import { useGame } from '../contexts/GameContext';
import { COLORS } from '../utils/tetrominos';
import { sounds } from '../utils/sounds';
import './GameBoard.css';

const GameBoard: React.FC = () => {
  const { state, dispatch } = useGame();

  // 키보드 이벤트 핸들러
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!state.isStarted || state.gameOver) return;
    
    if (event.key.startsWith('Arrow')) {
      event.preventDefault();
    }

    switch (event.key) {
      case 'ArrowLeft':
        dispatch({ type: 'MOVE_LEFT' });
        sounds.move();
        break;
      case 'ArrowRight':
        dispatch({ type: 'MOVE_RIGHT' });
        sounds.move();
        break;
      case 'ArrowDown':
        dispatch({ type: 'MOVE_DOWN' });
        sounds.drop();
        break;
      case 'ArrowUp':
        dispatch({ type: 'ROTATE' });
        sounds.rotate();
        break;
      case ' ': // Space bar
        event.preventDefault();
        dispatch({ type: 'NEW_PIECE' });
        break;
      case 'p': // Pause
      case 'P':
        dispatch({ type: 'TOGGLE_PAUSE' });
        break;
    }
  }, [dispatch, state.isStarted, state.gameOver]);

  // 키보드 이벤트 리스너 설정
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // 자동 하강 타이머 설정
  useEffect(() => {
    if (state.isStarted && !state.gameOver && !state.isPaused) {
      const speed = Math.max(100, 1000 - (state.level - 1) * 100);
      const timer = setInterval(() => {
        dispatch({ type: 'MOVE_DOWN' });
      }, speed);

      return () => {
        clearInterval(timer);
      };
    }
  }, [state.level, state.gameOver, state.isPaused, state.isStarted, dispatch]);

  // 새 게임 시작시 자동으로 첫 조각 생성
  useEffect(() => {
    if (state.isStarted && !state.currentPiece && !state.gameOver && !state.isPaused) {
      dispatch({ type: 'NEW_PIECE' });
    }
  }, [state.currentPiece, state.gameOver, state.isPaused, state.isStarted, dispatch]);

  // 게임 보드 표시 로직
  const displayBoard = state.board.map(row => row.map(cell => ({ ...cell })));
  if (state.currentPiece) {
    const { shape, position, type } = state.currentPiece;
    shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          const boardY = y + position.y;
          const boardX = x + position.x;
          if (boardY >= 0 && boardY < displayBoard.length && boardX >= 0 && boardX < displayBoard[0].length) {
            displayBoard[boardY][boardX] = { value: 2, color: type };
          }
        }
      });
    });
  }

  return (
    <div className="game-container">
      <div className="game-board">
        {displayBoard.map((row, i) => (
          <div key={i} className="row">
            {row.map((cell, j) => (
              <div
                key={`${i}-${j}`}
                className={`cell ${cell.value ? 'filled' : ''} ${cell.value === 2 ? 'current' : ''}`}
                style={{
                  backgroundColor: cell.color ? COLORS[cell.color as keyof typeof COLORS] : undefined
                }}
              />
            ))}
          </div>
        ))}
        {!state.isStarted && (
          <div className="overlay">
            <button onClick={() => dispatch({ type: 'START_GAME' })} className="start-button">
              Start Game
            </button>
          </div>
        )}
        {state.isPaused && (
          <div className="overlay">
            <div className="pause-text">PAUSED</div>
          </div>
        )}
      </div>
      <div className="game-info">
        <div>Score: {state.score}</div>
        <div>Level: {state.level}</div>
        <div className="controls">
          {state.isStarted && !state.gameOver && (
            <button
              onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })}
              className="control-button"
            >
              {state.isPaused ? 'Resume' : 'Pause'}
            </button>
          )}
        </div>
        {state.gameOver && (
          <div className="game-over">
            Game Over!
            <button
              onClick={() => dispatch({ type: 'RESET_GAME' })}
              className="restart-button"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard; 