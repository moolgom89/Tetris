import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { TetrominoShape, getRandomTetromino, checkCollision, rotateTetromino } from '../utils/tetrominos';
import { sounds } from '../utils/sounds';

type GameState = {
  board: Array<{ value: number; color: string | null }[]>;
  currentPiece: {
    shape: TetrominoShape;
    position: { x: number; y: number };
    type: string;
  } | null;
  score: number;
  level: number;
  gameOver: boolean;
  isPaused: boolean;
  isStarted: boolean;
};

type GameAction =
  | { type: 'MOVE_LEFT' }
  | { type: 'MOVE_RIGHT' }
  | { type: 'MOVE_DOWN' }
  | { type: 'ROTATE' }
  | { type: 'NEW_PIECE' }
  | { type: 'GAME_OVER' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'START_GAME' }
  | { type: 'RESET_GAME' };

const createEmptyBoard = () => 
  Array(20).fill(null).map(() => 
    Array(10).fill(null).map(() => ({ value: 0, color: null }))
  );

const initialState: GameState = {
  board: createEmptyBoard(),
  currentPiece: null,
  score: 0,
  level: 1,
  gameOver: false,
  isPaused: false,
  isStarted: false,
};

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

function mergePieceToBoard(board: GameState['board'], piece: GameState['currentPiece']): GameState['board'] {
  if (!piece) return board;
  
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        const newY = y + piece.position.y;
        const newX = x + piece.position.x;
        if (newY >= 0 && newY < board.length && newX >= 0 && newX < board[0].length) {
          newBoard[newY][newX] = { 
            value: 1, 
            color: piece.type 
          };
        }
      }
    });
  });
  return newBoard;
}

function clearLines(board: GameState['board']): { newBoard: GameState['board'], linesCleared: number } {
  const newBoard = board.filter(row => !row.every(cell => cell.value === 1));
  const linesCleared = board.length - newBoard.length;
  const emptyLines = Array(linesCleared).fill(null).map(() => 
    Array(board[0].length).fill(null).map(() => ({ value: 0, color: null }))
  );
  return {
    newBoard: [...emptyLines, ...newBoard],
    linesCleared
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  if ((state.gameOver || state.isPaused) && 
      !['START_GAME', 'RESET_GAME', 'TOGGLE_PAUSE'].includes(action.type)) {
    return state;
  }

  switch (action.type) {
    case 'START_GAME':
      sounds.startMusic();
      return {
        ...initialState,
        isStarted: true,
      };

    case 'RESET_GAME':
      sounds.stopMusic();
      return {
        ...initialState,
        isStarted: false,
      };

    case 'TOGGLE_PAUSE':
      if (!state.isPaused) {
        sounds.stopMusic();
      } else {
        sounds.startMusic();
      }
      return {
        ...state,
        isPaused: !state.isPaused,
      };

    case 'MOVE_LEFT': {
      if (!state.currentPiece) return state;
      const newPosition = {
        ...state.currentPiece.position,
        x: state.currentPiece.position.x - 1
      };
      if (!checkCollision(state.board.map(row => row.map(cell => cell.value)), state.currentPiece.shape, newPosition)) {
        return {
          ...state,
          currentPiece: {
            ...state.currentPiece,
            position: newPosition
          }
        };
      }
      return state;
    }

    case 'MOVE_RIGHT': {
      if (!state.currentPiece) return state;
      const newPosition = {
        ...state.currentPiece.position,
        x: state.currentPiece.position.x + 1
      };
      if (!checkCollision(state.board.map(row => row.map(cell => cell.value)), state.currentPiece.shape, newPosition)) {
        return {
          ...state,
          currentPiece: {
            ...state.currentPiece,
            position: newPosition
          }
        };
      }
      return state;
    }

    case 'MOVE_DOWN': {
      if (!state.currentPiece) return state;
      const newPosition = {
        ...state.currentPiece.position,
        y: state.currentPiece.position.y + 1
      };
      
      if (!checkCollision(state.board.map(row => row.map(cell => cell.value)), state.currentPiece.shape, newPosition)) {
        return {
          ...state,
          currentPiece: {
            ...state.currentPiece,
            position: newPosition
          }
        };
      } else {
        // Piece has landed
        const newBoard = mergePieceToBoard(state.board, state.currentPiece);
        const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
        
        // Play clear sound if lines were cleared
        if (linesCleared > 0) {
          sounds.clear();
        }
        
        return {
          ...state,
          board: clearedBoard,
          currentPiece: null,
          score: state.score + (linesCleared * 100 * state.level),
          level: Math.floor(state.score / 1000) + 1
        };
      }
    }

    case 'ROTATE': {
      if (!state.currentPiece) return state;
      const newShape = rotateTetromino(state.currentPiece.shape);
      if (!checkCollision(state.board.map(row => row.map(cell => cell.value)), newShape, state.currentPiece.position)) {
        return {
          ...state,
          currentPiece: {
            ...state.currentPiece,
            shape: newShape
          }
        };
      }
      return state;
    }

    case 'NEW_PIECE': {
      if (!state.isStarted) {
        return state;
      }
      const { shape, type } = getRandomTetromino();
      const newPiece = {
        shape,
        position: { x: Math.floor(state.board[0].length / 2) - Math.floor(shape[0].length / 2), y: 0 },
        type
      };
      
      if (checkCollision(state.board.map(row => row.map(cell => cell.value)), shape, newPiece.position)) {
        sounds.gameOver();
        return { ...state, gameOver: true };
      }
      
      return {
        ...state,
        currentPiece: newPiece,
      };
    }

    case 'GAME_OVER':
      sounds.gameOver();
      return { ...state, gameOver: true };

    default:
      return state;
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
} 