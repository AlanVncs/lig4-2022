// Dimensões do tabuleiro
const LINE_NUMBER = 6
const COLUMN_NUMBER = 8

// Códigos de jogadores
const P1 = -1
const P2 = 1
const PN = 0

// Código de resultado
const DRAW_GAME = PN

// Inteligência do algoritmo (Quando maior, mais inteligente)
const MAX_DEPTH = 9

// Retorna o código do player inimigo
// const getEnemy = (player) => -player // TODO Clear
const ENEMY = []
ENEMY[P1] = P2
ENEMY[P2] = P1

// Verifica, na posição especificada, se houve vencedor vertical (Retorna o vencerdor ou false caso não haja)
function getColWinner(scenery, i, j) {
	if (j < LINE_NUMBER - 3) {
		const sum = scenery[i][j] + scenery[i][j + 1] + scenery[i][j + 2] + scenery[i][j + 3]
		return Math.abs(sum) == 4 && scenery[i][j]
	} else {
		return false
	}
}

// Verifica, na posição especificada, se houve vencedor horizontal (Retorna o vencerdor ou false caso não haja)
function getRowWinner(scenery, i, j) {
	if (i < COLUMN_NUMBER - 3) {
		const sum = scenery[i][j] + scenery[i + 1][j] + scenery[i + 2][j] + scenery[i + 3][j]
		return Math.abs(sum) == 4 && scenery[i][j]
	} else {
		return false
	}
}

// Verifica, na posição especificada, se houve vencedor diagonal / (Retorna o vencerdor ou false caso não haja)
function getDiagAWinner(scenery, i, j) {
	if (i < COLUMN_NUMBER - 3 && j < LINE_NUMBER - 3) {
		const sum = scenery[i][j] + scenery[i + 1][j + 1] + scenery[i + 2][j + 2] + scenery[i + 3][j + 3]
		return Math.abs(sum) == 4 && scenery[i][j]
	} else {
		return false
	}
}

// Verifica, na posição especificada, se houve vencedor diagonal \ (Retorna o vencerdor ou false caso não haja)
function getDiagBWinner(scenery, i, j) {
	if (i > 2 && j < LINE_NUMBER - 3) {
		const sum = scenery[i][j] + scenery[i - 1][j + 1] + scenery[i - 2][j + 2] + scenery[i - 3][j + 3]
		return Math.abs(sum) == 4 && scenery[i][j]
	} else {
		return false
	}
}

// Retorna o resultado do jogo (-1, 0 ou 1) ou retorna false se o jogo ainda não estiver acabado
function getWinner(scenery) {
	for (let i = 0; i < COLUMN_NUMBER; i++) {
		for (let j = 0; scenery[i][j]; j++) {
			if (
				getRowWinner(scenery, i, j) ||
				getColWinner(scenery, i, j) ||
				getDiagAWinner(scenery, i, j) ||
				getDiagBWinner(scenery, i, j)
			) {
				return scenery[i][j]
			}
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

// Bruxaria
function minmax(scenery, player, depth = MAX_DEPTH) {
	if (depth == 0) {
		return { column: null, winner: DRAW_GAME }
	}
	const winner = getWinner(scenery)
	if (winner) return { column: null, winner }

	const newDepth = depth - 1
	const moves = []
	for (let column = 0; column < scenery.length; column++) {
		if (availableColumn(scenery, column)) {
			play(scenery, player, column)
			const move = minmax(scenery, ENEMY[player], newDepth)
			undoPlay(scenery, column)
			move.column = column
			if (move.winner == player) return move
			moves.push(move)
		}
	}

	if (moves.length == 0) return { column: null, winner }

	if (depth == MAX_DEPTH) {
		const ties = []
		for (let k = 0; k < moves.length; k++) {
			if (moves[k].winner == 0) ties.push(moves[k])
		}

		if (ties.length > 0) {
			let index = Math.floor(Math.random() * ties.length)
			return ties[index]
		} else {
			let index = Math.floor(Math.random() * moves.length)
			return moves[index]
		}
	}

	for (let k = 0; k < moves.length; k++) {
		if (moves[k].winner == 0) return moves[k]
	}

	return moves[0]
}

// Transforma o cenário recebido num estrutura melhor parar trabalhar
function convertScenery(scenery) {
	return scenery.map((column) => {
		return column
			.filter((cell) => {
				return cell != undefined
			})
			.reverse()
			.map((cell) => {
				if (cell === 0) {
					return -1
				} else {
					return cell
				}
			})
	})
}

// Função principal
const AlanScript = async (scenery, player) => {
	console.time('Tempo de execução')
	player = player == 0 ? P1 : P2
	scenery = convertScenery(scenery)
	const move = minmax(scenery, player)
	if (move.winner == player) {
		showBot()
	}
	console.timeEnd('Tempo de execução')
	return move.column
}

function showBot() {
	if (!window.showingBotFlag) {
		window.showingBotFlag = true

		const $gifContainer = document.createElement('div')
		$gifContainer.style.position = 'absolute'
		$gifContainer.style.bottom = '30px'
		$gifContainer.style.left = '30px'

		const $gif = document.createElement('img')
		$gif.src = 'https://c.tenor.com/5LdshwUZiTYAAAAj/robot-excited.gif'

		$gifContainer.appendChild($gif)

		document.body.appendChild($gifContainer)

		setTimeout(() => {
			$gifContainer.remove()
			window.showingBotFlag = false
		}, 3500)
	}
}

export default AlanScript
