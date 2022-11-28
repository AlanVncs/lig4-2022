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

// Retorna o código do player inimigo
const ENEMY = []
ENEMY[P1] = P2
ENEMY[P2] = P1

// Transforma o cenário recebido num estrutura melhor parar trabalhar
function convertScenery(scenery) {
	return scenery.map((column) => {
		return column
			.filter((cell) => {
				return cell !== undefined
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

function copyScenery(scenery) {
	// return [...scenery]

	return scenery.map((column) => {
		return column.map((item) => item)
	})
}

function showScenery(scenery, message = 'Scenery log: ') {
	console.log(message)
	let str = ''
	for (let line = 0; line < LINE_NUMBER; line++) {
		let strLine = ''
		for (let column = 0; column < COLUMN_NUMBER; column++) {
			const play = scenery[column][line]
			if (play === P1) {
				strLine = `${strLine}x `
			} else if (play === P2) {
				strLine = `${strLine}o `
			} else {
				strLine = `${strLine}- `
			}
		}
		str = `${strLine}\n${str}`
	}
	console.log(str)
}

async function minmaxCaller(scenery, player) {
	return new Promise((resolve) => {
		const workers = []
		const moves = []

		for (let column = 0; column < COLUMN_NUMBER; column++) {
			const sceneryCopy = copyScenery(scenery)

			if (!sceneryCopy[column][LINE_NUMBER - 1]) {
				sceneryCopy[column].push(player)
				const worker = new Worker('/src/players/myScript/minmaxWorker.js')
				workers.push(worker)
				worker.postMessage({ scenery: sceneryCopy, player: ENEMY[player], column })
				worker.onmessage = (event) => {
					const { move } = event.data
					moves.push(move)
					console.log(`Done: ${moves.length}/${workers.length}`)

					if (move.winner === player || moves.length === workers.length) {
						workers.forEach((worker) => worker.terminate())
						moves.sort((ma, mb) => ma.column - mb.column)
						console.log(
							moves.reduce((acc, el) => {
								return `${acc}COLUMN: ${el.column} | WINNER: ${el.winner}\n`
							}, '')
						)
						showScenery(scenery, 'Scenery before')
						console.log('PLAYER: ', { player })

						const winMoves = []
						const drawMoves = []
						for (let k = 0; k < moves.length; k++) {
							if (moves[k].winner === player) {
								winMoves.push(moves[k])
							} else if (moves[k].winner === DRAW_GAME) {
								drawMoves.push(moves[k])
							}
						}

						let resultMove = null
						if (winMoves.length > 0) {
							resultMove = winMoves[0]
						} else if (drawMoves.length > 0) {
							// Ao menos um dos movimentos possíveis é empate
							drawMoves.sort((moveA, moveB) => {
								const columnA = moveA.column
								const columnB = moveB.column

								return scenery[columnB] - scenery[columnA].length
							})

							// let index = Math.floor(Math.random() * drawMoves.length)
							resultMove = drawMoves[0]
						} else {
							// Nenhum dos movimentos possíveis é empate
							let index = Math.floor(Math.random() * moves.length)
							resultMove = moves[index]
						}

						resolve(resultMove)
					}
				}
			}
		}
	})
}

// Função principal
const AlanScript = async (scenery, player) => {
	console.time('Tempo de execução')
	player = player == 0 ? P1 : P2
	scenery = convertScenery(scenery)

	const move = await minmaxCaller(scenery, player)

	console.log('Move: ', move)

	if (move.winner == player) showBot()

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

// function getWinner(scenery) {
// 	return new Promise((resolve) => {
// 		const workers = []
// 		let finishedWorkers = 0
// 		let stopFor = false

// 		for (let column = 0; column < COLUMN_NUMBER && !stopFor; column++) {
// 			workers[column] = new Worker('/src/players/myScript/getWinnerWorker.js')
// 			workers[column].postMessage({ scenery, column })
// 			workers[column].onmessage = (event) => {
// 				const { winner } = event.data
// 				finishedWorkers++
// 				if (winner !== DRAW_GAME || finishedWorkers === COLUMN_NUMBER) {
// 					stopFor = true
// 					workers.forEach((worker) => worker.terminate())
// 					resolve(winner)
// 				}
// 			}
// 		}
// 	})
// }
