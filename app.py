from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

# Initialize board and current player
board = [["" for _ in range(3)] for _ in range(3)]
current_player = "X"

def check_winner():
    # Check rows for a winner
    for i, row in enumerate(board):
        if row[0] == row[1] == row[2] != "":
            return row[0], [(i, 0), (i, 1), (i, 2)]

    # Check columns for a winner
    for col in range(3):
        if board[0][col] == board[1][col] == board[2][col] != "":
            return board[0][col], [(0, col), (1, col), (2, col)]

    # Check diagonals for a winner
    if board[0][0] == board[1][1] == board[2][2] != "":
        return board[0][0], [(0, 0), (1, 1), (2, 2)]

    if board[0][2] == board[1][1] == board[2][0] != "":
        return board[0][2], [(0, 2), (1, 1), (2, 0)]

    return None, []

def is_board_full():
    return all(cell != "" for row in board for cell in row)

def reset_game():
    global board, current_player
    board = [["" for _ in range(3)] for _ in range(3)]
    current_player = "X"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/play', methods=['POST'])
def play():
    global current_player

    data = request.get_json()
    row = int(data['row'])
    col = int(data['col'])

    if board[row][col] == "":
        board[row][col] = current_player
        winner, winning_cells = check_winner()

        if winner:
            return jsonify({'status': 'win', 'winner': winner, 'board': board, 'winningCells': winning_cells})

        if is_board_full():
            return jsonify({'status': 'draw', 'board': board})

        current_player = "O" if current_player == "X" else "X"
        return jsonify({'status': 'continue', 'board': board, 'player': current_player})

    return jsonify({'status': 'invalid', 'message': 'Invalid move! Cell already taken.'})

@app.route('/reset', methods=['POST'])
def reset():
    reset_game()
    return jsonify({'status': 'reset'})

if __name__ == '__main__':
    app.run(debug=True)
