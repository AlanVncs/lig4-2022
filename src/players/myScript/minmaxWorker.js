// Dimensões do tabuleiro
const LINE_NUMBER = 6
const COLUMN_NUMBER = 8

const I1 = COLUMN_NUMBER - 1
const I2 = COLUMN_NUMBER - 2

const J1 = LINE_NUMBER - 1
const J2 = LINE_NUMBER - 2

// Códigos de jogadores
const P1 = -1
const P2 = 1
const PN = 0

// Código de resultado
const DRAW_GAME = PN

// Inteligência do algoritmo (Quando maior, mais inteligente)
const MAX_DEPTH = 10

// Retorna o código do player inimigo
const ENEMY = []
ENEMY[P1] = P2
ENEMY[P2] = P1

// Debug
let execID = 0

// NML_RIGHT:  i < I1 // j < J2
const NML_RIGHT = (scenery, i, j) => {
	if (i === I1 || j >= J2) return DRAW_GAME

	const condition =
		scenery[i][j] === scenery[i][j + 2] &&
		scenery[i][j] === scenery[i][j + 1] &&
		scenery[i][j] === scenery[i + 1][j]

	return condition ? scenery[i][j] : DRAW_GAME
}

// NML_DOWN:  i < I2 // j >  0
const NML_DOWN = (scenery, i, j) => {
	if (i >= I2 || j === 0) return DRAW_GAME

	const condition =
		scenery[i][j] === scenery[i + 2][j] &&
		scenery[i][j] === scenery[i + 1][j] &&
		scenery[i][j] === scenery[i][j - 1]

	return condition ? scenery[i][j] : DRAW_GAME
}

// NML_LEFT:  i > 0 // j >  1
const NML_LEFT = (scenery, i, j) => {
	if (i === 0 || j <= 1) return DRAW_GAME

	const condition =
		scenery[i][j] === scenery[i][j - 2] &&
		scenery[i][j] === scenery[i][j - 1] &&
		scenery[i][j] === scenery[i - 1][j]

	return condition ? scenery[i][j] : DRAW_GAME
}

// NML_UP:    i > 1 // j < J1
const NML_UP = (scenery, i, j) => {
	if (i <= 1 || j === J1) return DRAW_GAME

	const condition =
		scenery[i][j] === scenery[i - 2][j] &&
		scenery[i][j] === scenery[i - 1][j] &&
		scenery[i][j] === scenery[i][j + 1]

	return condition ? scenery[i][j] : DRAW_GAME
}

// FLP_RIGHT: i < I1 // j >  1
const FLP_RIGHT = (scenery, i, j) => {
	if (i === I1 || j <= 1) return DRAW_GAME

	const condition =
		scenery[i][j] === scenery[i][j - 2] &&
		scenery[i][j] === scenery[i][j - 1] &&
		scenery[i][j] === scenery[i + 1][j]

	return condition ? scenery[i][j] : DRAW_GAME
}

// FLP_DOWN:  i > 1 // j >  0
const FLP_DOWN = (scenery, i, j) => {
	if (i <= 1 || j === 0) return DRAW_GAME

	const condition =
		scenery[i][j] === scenery[i - 2][j] &&
		scenery[i][j] === scenery[i - 1][j] &&
		scenery[i][j] === scenery[i][j - 1]

	return condition ? scenery[i][j] : DRAW_GAME
}

// FLP_LEFT:  i > 0 // j < J2
const FLP_LEFT = (scenery, i, j) => {
	if (i === 0 || j >= J2) return DRAW_GAME

	const condition =
		scenery[i][j] === scenery[i][j + 2] &&
		scenery[i][j] === scenery[i][j + 1] &&
		scenery[i][j] === scenery[i - 1][j]

	return condition ? scenery[i][j] : DRAW_GAME
}

// FLP_UP:    i < I2 // j < J1
const FLP_UP = (scenery, i, j) => {
	if (i >= I2 || j === J1) return DRAW_GAME

	const condition =
		scenery[i][j] === scenery[i + 2][j] &&
		scenery[i + 1][j] === scenery[i][j] &&
		scenery[i][j] === scenery[i][j + 1]

	return condition ? scenery[i][j] : DRAW_GAME
}

function getWinner(scenery) {
	for (let column = 0; column < COLUMN_NUMBER; column++) {
		for (let line = 0; scenery[column][line]; line++) {
			const winner =
				NML_RIGHT(scenery, column, line) ||
				NML_DOWN(scenery, column, line) ||
				NML_LEFT(scenery, column, line) ||
				NML_UP(scenery, column, line) ||
				FLP_RIGHT(scenery, column, line) ||
				FLP_DOWN(scenery, column, line) ||
				FLP_LEFT(scenery, column, line) ||
				FLP_UP(scenery, column, line)

			if (winner !== DRAW_GAME) return winner
		}
	}

	return DRAW_GAME
}

// Realiza uma jogada na coluna especificada
function play(scenery, myMove, column) {
	scenery[column].push(myMove)
}

// Defaz a jogada na coluna especificada
function undoPlay(scenery, column) {
	scenery[column].pop()
}

// Teste se uma coluna não está cheia
function availableColumn(scenery, column) {
	return !scenery[column][LINE_NUMBER - 1]
}

// 13751

// Bruxaria
function minmax(scenery, player, depth = MAX_DEPTH) {
	// execID++

	if (depth === 0) {
		return { column: null, winner: DRAW_GAME }
	}
	const winner = getWinner(scenery)

	if (winner) return { column: null, winner }

	const newDepth = depth - 1
	const moves = []
	let hasDraw = false
	for (let column = 0; column < COLUMN_NUMBER; column++) {
		if (availableColumn(scenery, column)) {
			play(scenery, player, column)
			const move = minmax(scenery, ENEMY[player], newDepth)
			undoPlay(scenery, column)
			move.column = column
			if (move.winner === player) return move
			hasDraw = hasDraw || move.winner === DRAW_GAME
			moves.push(move)
		}
	}

	if (moves.length === 0) return { column: null, winner: DRAW_GAME }

	// No último level é necessário escolher uma coluna (Melhor que seja próxima do meio)
	if (depth === MAX_DEPTH) {
		console.log('POSIBLE MOVES', JSON.stringify(moves, null, 2))
		const drawMoves = []
		for (let k = 0; k < moves.length; k++) {
			if (moves[k].winner === DRAW_GAME) drawMoves.push(moves[k])
		}

		if (drawMoves.length > 0) {
			// Ao menos um dos movimentos possíveis é empate
			let index = Math.floor(Math.random() * drawMoves.length)
			return drawMoves[index]
		} else {
			// Nenhum dos movimentos possíveis é empate
			let index = Math.floor(Math.random() * moves.length)
			return moves[index]
		}
	}

	// Se existe um possibilidade de empate, devolve sem se preocupar com a coluna
	if (hasDraw) return { column: null, winner: DRAW_GAME }

	// Derrota garantida se o oponente fizer a jogada ótima
	// Joga em um local aleatório na esperança do oponente não fazer a jogada ótima
	let randomMoveIndex = Math.floor(Math.random() * moves.length)
	return moves[randomMoveIndex]
}

onmessage = (event) => {
	const { scenery, player, column } = event.data
	const move = minmax(scenery, player, MAX_DEPTH - 1)
	move.column = column

	postMessage({ move })
}
