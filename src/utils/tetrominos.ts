export type TetrominoShape = number[][];

export const TETROMINOS = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
};

export const COLORS = {
  I: '#00f0f0',
  J: '#0000f0',
  L: '#f0a000',
  O: '#f0f000',
  S: '#00f000',
  T: '#a000f0',
  Z: '#f00000',
};

export function getRandomTetromino(): { shape: TetrominoShape; type: keyof typeof TETROMINOS } {
  const types = Object.keys(TETROMINOS) as Array<keyof typeof TETROMINOS>;
  const type = types[Math.floor(Math.random() * types.length)];
  return {
    shape: TETROMINOS[type],
    type,
  };
}

export function rotateTetromino(matrix: TetrominoShape): TetrominoShape {
  const N = matrix.length;
  const rotated = matrix.map((row, i) =>
    row.map((_, j) => matrix[N - 1 - j][i])
  );
  return rotated;
}

export function checkCollision(
  board: number[][],
  piece: TetrominoShape,
  position: { x: number; y: number }
): boolean {
  for (let y = 0; y < piece.length; y++) {
    for (let x = 0; x < piece[y].length; x++) {
      if (piece[y][x]) {
        const newX = x + position.x;
        const newY = y + position.y;
        
        if (
          newX < 0 ||
          newX >= board[0].length ||
          newY >= board.length ||
          (newY >= 0 && board[newY][newX])
        ) {
          return true;
        }
      }
    }
  }
  return false;
} 