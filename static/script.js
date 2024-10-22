let currentPlayer = "X";
const boardElement = document.getElementById('board');
const messageElement = document.getElementById('message');
const resetButton = document.getElementById('reset');

function createBoard() {
    boardElement.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', handleCellClick);
            boardElement.appendChild(cell);
        }
    }
}

function updateBoard(board) {
    const cells = boardElement.getElementsByClassName('cell');
    for (let i = 0; i < 9; i++) {
        const row = Math.floor(i / 3);
        const col = i % 3;
        cells[i].textContent = board[row][col];
    }
}

function highlightWinningCells(winningCells) {
    winningCells.forEach(([row, col]) => {
        const cell = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
        cell.classList.add('winning');
    });
}

function handleCellClick(e) {
    const row = e.target.dataset.row;
    const col = e.target.dataset.col;

    fetch('/play', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ row, col }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'continue') {
            updateBoard(data.board);
            currentPlayer = data.player;
            messageElement.textContent = `Player ${currentPlayer}'s Turn`;
        } else if (data.status === 'win') {
            updateBoard(data.board);
            messageElement.textContent = `Player ${data.winner} Wins!`;
            highlightWinningCells(data.winningCells); // Highlight winning cells
            setTimeout(() => {
                resetGame();
            }, 3000); // Wait for 3 seconds before resetting
        } else if (data.status === 'draw') {
            updateBoard(data.board);
            messageElement.textContent = "It's a draw!";
            setTimeout(() => {
                resetGame();
            }, 3000); // Wait for 3 seconds before resetting
        } else if (data.status === 'invalid') {
            messageElement.textContent = data.message;
        }
    });
}

// Function to reset the game
function resetGame() {
    fetch('/reset', {
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'reset') {
            createBoard();
            messageElement.textContent = "Player X's Turn";
            currentPlayer = "X";
        }
    });
}

// Reset game on button click
resetButton.addEventListener('click', resetGame);

// Initialize the board when the page loads
createBoard();
