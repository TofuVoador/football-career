import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import WorldCupHistoryHosts from "./Database/worldCupLastHosts.json";
import Leagues from "./Database/leagues.json";
import ExtraTeams from "./Database/extrateams.json";
import Nations from "./Database/nations.json";
import Positions from "./Database/positions.json";
import ChartComponent from "./Components/chartComponent";
import Season from "./Components/season";
import { RandomNumber, DeepClone, FormatarNumero, shuffleArray } from "./Utils";

const StarPath = [
	"Esquecido", //0
	"Ruim", //100
	"Não Foi", //200
	"Ok", //300
	"Bom", //400
	"Ótimo", //500
	"Deixou sua marca", //600
	"Estrela", //700
	"Ídolo", //800
	"Lenda", //900
	"GOAT", //1000
];

const TournamentPath = [
	"Grupos",
	"Playoffs",
	"Oitavas",
	"Quartas",
	"Semi-finais",
	"Final",
	"Vencedor",
];

function App() {
	const [worldCupHistoryHosts, setWorldCupHistoryHosts] = useState([...WorldCupHistoryHosts]);
	const [leagues, setLeagues] = useState([...Leagues]);
	const [extrateams, setExtraTeams] = useState([...ExtraTeams]);
	const [nations, setNations] = useState([...Nations]);

	const [seasons, setSeasons] = useState([]);

	const parentRef = useRef(null);
	useEffect(() => {
		const parent = parentRef.current;
		if (!parent) return;

		const target = parent.lastElementChild;
		if (target)
			target.scrollIntoView({
				alignToTop: true,
				behavior: "smooth",
				block: "start",
				inline: "center",
			});
	}, [seasons]);

	const [currentSeason, setCurrentSeason] = useState({
		year: null,
		top10: null,
		topNations: null,
		topGains: null,
		topLoss: null,
		topNationsGains: null,
		topNationsLoss: null,
		age: null,
		positionInClub: null,
		team: null,
		wage: null,
		starting: null,
		titles: null,
		goals: null,
		assists: null,
		performance: null,
		awardPoints: null,
		leagueTable: null,
		fame: null,
		marketValue: null,
	});

	const [player, setPlayer] = useState({
		potential: (RandomNumber(0, 10) + RandomNumber(0, 10)) / 2,
		age: 17,
		nation: null,
		team: null,
		contractTeam: null,
		position: null,
		positionInClub: null,
		wage: 1,
		performance: 0,
		totalGoals: 0,
		totalAssists: 0,
		leagueTitles: [],
		nationalCup: [],
		europa: [],
		champions: [],
		continentalChampionship: [],
		worldCup: [],
		awards: [],
		playerOfTheSeason: [],
		championsQualification: false,
		lastLeaguePosition: 0,
		europaQualification: false,
		fame: 0,
		marketValue: 1,
	});

	const [lastLeagueResults, setLastLeagueResults] = useState([]);

	const [history, setHistory] = useState([]);

	const [year, setYear] = useState(new Date().getFullYear());

	const [contract, setContract] = useState(0);

	const [generalPerformance, setGeneralPerformance] = useState([]);

	const [transfers, setTransfers] = useState([]);

	const initPos = shuffleArray(DeepClone(Positions));
	const [initNation, setInitNation] = useState(GetNewNation());

	const [renew, setRenew] = useState({ value: 0, duration: 0, addition: null, position: null });

	function ChooseNation() {
		const continentDropdown = document.getElementById("continent-dropdown");
		const nationDropdown = document.getElementById("nation-dropdown");

		// Find the selected continent
		const selectedContinent = nations.find(
			(continent) => continent.name === continentDropdown.value
		);

		// Find the selected nation within the chosen continent
		const selectedNation = selectedContinent
			? selectedContinent.teams.find((nation) => nation.name === nationDropdown.value)
			: null;

		// Check if both the continent and nation are selected
		if (selectedContinent && selectedNation) {
			// Change display
			document.getElementById("init-pos").style.display = "flex";
			document.getElementById("init-nation").style.display = "none";

			// Create a new player object with the selected nation
			player.nation = selectedNation;
		} else {
			alert("Selecione um País.");
		}
	}

	function updateNationDropdown() {
		const continentDropdown = document.getElementById("continent-dropdown");
		const nationDropdown = document.getElementById("nation-dropdown");
		const selectedContinent = continentDropdown.value;

		// Clear previous nations
		nationDropdown.innerHTML = '<option value="">Selecione uma Nação</option>';

		// Find nations for the selected continent
		const continentData = nations.find((cont) => cont.name === selectedContinent);
		if (continentData) {
			continentData.teams.forEach((team) => {
				const option = document.createElement("option");
				option.value = team.name;
				option.textContent = team.name;
				nationDropdown.appendChild(option);
			});
		}
	}

	function ChoosePos() {
		// Get the selected position
		const positionDropdown = document.getElementById("position-select");
		const selectedPosition = Positions.find(
			(position) => position.title === positionDropdown.value
		);

		// Change display
		document.getElementById("team-choice").style.display = "flex";
		document.getElementById("init-pos").style.display = "none";

		player.position = selectedPosition; // Assign the selected position

		let newTeams = UpdateTeamsStats(20.0).newTeams;

		let leagueResults = leagues.map((league) => {
			let leagueResult = {
				name: league.name,
				championsSpots: league.championsSpots,
				europaSpots: league.europaSpots,
				result: GetLeaguePosition(league.teams),
			};
			return leagueResult;
		});

		setLastLeagueResults(leagueResults); // Update league results
		setTransfers(GetInitTeams(selectedPosition.value, newTeams, player, player.nation)); // Use selectedPosition
	}

	function ChooseTeam(newTeam = null) {
		//change display
		document.getElementById("team-choice").style.display = "none";
		document.getElementById("continue").style.display = "flex";

		//load
		player.age++;
		let newGeneralPerformance = generalPerformance;
		let newHistory = history;
		let newContract = contract - 1;

		newHistory = newHistory.filter((item) => year - item.year <= 8);

		if (newTeam !== null) {
			// Se houver mudança de time
			newHistory.push({ team: newTeam.team.name, year: year + newTeam.contract.duration });

			// Verifica se o jogador foi emprestado para o novo time
			if (newTeam.loan) {
				// Atualiza os detalhes do contrato do jogador se ele estiver emprestado
				player.contractTeam = {
					team: player.team,
					contract: {
						value: newTeam.contract.value,
						duration: newContract - newTeam.contract.duration,
					},
					transferValue: newTeam.transferValue,
					position: player.positionInClub.abbreviation,
					loan: false,
				};
			}

			newGeneralPerformance = [];
			player.team = newTeam.team;
			newContract = newTeam.contract.duration;
			player.marketValue = newTeam.transferValue;
			player.wage = newTeam.contract.value;
			player.positionInClub = Positions.find(
				(position) => position.abbreviation === newTeam.position
			);

			let lp = 99; // Inicializa o valor padrão de "lp"

			let newLeagueResults =
				lastLeagueResults.find((league) => league.name === player.team.league) || [];
			lp = newLeagueResults.result.table.findIndex((team) => team.name === player.team.name) + 1;

			// Verifica se o jogador se classificou no ano passado
			if (lp <= newLeagueResults.championsSpots) {
				// Para os campeões
				player.championsQualification = true;
				player.europaQualification = false;
				player.lastLeaguePosition = lp;
			} else if (lp <= newLeagueResults.championsSpots + newLeagueResults.europaSpots) {
				// Para a Liga Europa
				player.championsQualification = false;
				player.europaQualification = true;
			} else {
				// Não foi classificado
				player.championsQualification = false;
				player.europaQualification = false;
			}

			setRenew({ value: 0, duration: 0, addition: null, position: null });
		} else if (newContract <= 0 || renew.addition != null) {
			// Renovação do contrato
			newContract = renew.duration + renew.addition; // Nova duração do contrato
			player.wage = renew.value; // Novo valor do contrato
			player.positionInClub = Positions.find(
				(position) => position.abbreviation === renew.position
			);

			setRenew({ value: 0, duration: 0, addition: null, position: null });
		}

		//change teams power on each season
		let updatedTeams = UpdateTeamsStats(40.0);
		let newTeams = updatedTeams.newTeams;
		let newExtraTeams = UpdateExtraTeamsStats();

		let allTeams = [];
		for (let leagueID = 0; leagueID < newTeams.length; leagueID++) {
			allTeams = allTeams.concat([...newTeams[leagueID].teams]);
		}
		allTeams = allTeams.concat([...extrateams]);
		allTeams.sort((a, b) => {
			return b.power - a.power;
		});
		//creates a list of top 10 teams
		let top10 = allTeams.slice(0, 10).map((team, index) => ({
			...team,
			rank: index + 1, // Rank starts from 1
		}));
		if (!top10.some((t) => t.name === player.team.name)) {
			const playerTeam = allTeams.find((t) => t.name === player.team.name);
			const playerRanking = allTeams.findIndex((t) => t.name === player.team.name) + 1;
			if (playerTeam) {
				top10.push({
					...playerTeam,
					rank: playerRanking,
				});
			}
		}

		//change nations power on each season
		let updatedNations = UpdateNationsStats();
		let newNat = updatedNations.allNations;
		let allNations = [];
		for (let regionID = 0; regionID < newNat.length; regionID++) {
			allNations = allNations.concat([...newNat[regionID].teams]);
		}
		allNations.sort((a, b) => {
			return b.power - a.power;
		});
		//creates a list of top 10 nations
		let topNations = allNations.slice(0, 10).map((team, index) => ({
			...team,
			rank: index + 1, // Rank starts from 1
		}));
		if (!topNations.some((t) => t.name === player.nation.name)) {
			const playerTeam = allNations.find((t) => t.name === player.nation.name);
			const playerRanking = allNations.findIndex((t) => t.name === player.nation.name) + 1;
			if (playerTeam) {
				topNations.push({
					...playerTeam,
					rank: playerRanking,
				});
			}
		}

		player.team = allTeams.find((t) => t.name === player.team.name); //find player's team by name and update
		player.nation = allNations.find((n) => n.name === player.nation.name); //find player's nation by name and update

		// Filtra os valores de transferValue que são números
		const transferValues = transfers.map((transfer) => transfer?.transferValue);
		const validTransferValues = transferValues.filter(
			(value) => typeof value === "number" && !isNaN(value)
		);

		if (validTransferValues.length > 0) {
			// Calcula o maior valor de transferValue
			player.marketValue = Math.max(...validTransferValues);
		}

		//calcule the player's performance
		player.performance = Math.round(100.0 * (Math.random() - Math.random())) / 100.0;

		//set performance over team
		newGeneralPerformance.push(player.performance);
		if (newGeneralPerformance.length > 3) newGeneralPerformance.shift();

		let med = 0;
		for (let i = 0; i < newGeneralPerformance.length; i++) {
			med += newGeneralPerformance[i];
		}
		med /= newGeneralPerformance.length;

		//giving the performance, set how many games did they were the starter player
		let r = (Math.random() - Math.random()) * 10;
		let starting =
			Math.floor(
				(100 -
					player.team.power * 5 -
					0.8 * (player.positionInClub.peak - player.age) ** 2 +
					r +
					player.performance * 5) /
					2 +
					player.potential * 5
			) * 2;
		if (starting > 100) starting = 100;
		else if (starting < 0) starting = 0;

		//set season start
		let newSeason = {
			year: year + 1,
			top10: top10,
			topNations: topNations,
			topGains: updatedTeams.topGains,
			topLoss: updatedTeams.topLosses,
			topNationsGains: updatedNations.topGains,
			topNationsLoss: updatedNations.topLosses,
			age: player.age,
			positionInClub: player.positionInClub,
			team: DeepClone(player.team),
			nation: DeepClone(player.nation),
			wage: player.wage,
			starting: starting,
			titles: [],
			goals: 0,
			assists: 0,
			performance: player.performance,
			awardPoints: 0,
			leagueTable: [],
			fame: player.fame,
			marketValue: player.marketValue,
		};

		//save
		setCurrentSeason(newSeason);
		setYear(year + 1);
		setContract(newContract);
		setGeneralPerformance(newGeneralPerformance);
		setHistory(newHistory);
	}

	function Continue() {
		//change display
		document.getElementById("team-choice").style.display = "flex";
		document.getElementById("continue").style.display = "none";

		let opportunities = 0;
		currentSeason.awardPoints = 0;

		let med = 0;
		for (let i = 0; i < generalPerformance.length; i++) {
			med += generalPerformance[i];
		}
		med /= generalPerformance.length;

		let triplice = 0;

		//national tournaments
		let leagueResults = leagues.map((league) => {
			let leagueResult = {
				name: league.name,
				championsSpots: league.championsSpots,
				europaSpots: league.europaSpots,
				result: GetLeaguePosition(league.teams),
			};
			console.log(
				league.name +
					": " +
					leagueResult.result.table[0].name +
					" (" +
					leagueResult.result.table[0].power +
					")"
			);
			return leagueResult;
		});

		let playerLeagueResult = leagueResults.find((league) => league.name === player.team.league);

		//top eight from each league
		let leaguesTopEight = [];
		for (let l = 0; l < leagueResults.length; l++) {
			let topEight = `${leagueResults[l].name}`;
			for (let p = 0; p < 8; p++) {
				topEight += `--> ${p + 1}º: ${leagueResults[l].result.table[p].name}`;
			}
			leaguesTopEight.push(topEight);
		}

		const playerPosition =
			playerLeagueResult.result.table.findIndex((team) => team.name === player.team.name) + 1;
		currentSeason.awardPoints += Math.max(
			0,
			((playerLeagueResult.championsSpots / 4.0) * (7 - playerPosition)) / 2.0
		); //max = 3.0
		currentSeason.titles.push([`Liga: ${playerPosition}º lugar`].concat(leaguesTopEight));
		player.fame += Math.floor((playerLeagueResult.championsSpots * (6 - playerPosition)) / 2.0); //max = 10

		opportunities += 16 - playerPosition;

		//if fist place, then won trophy
		if (playerPosition === 1) {
			player.leagueTitles.push(`${year} (${player.team.name})`);
			triplice++;
		}

		let nationalCupDescription = [];
		let end = false;
		let phase = 2;
		let playerPhase = 2;

		let league = leagues.find((league) => league.name === player.team.league);

		//get opponents for national cup
		let pot3 = DeepClone([...league.teams]);
		let pot1 = pot3.splice(0, pot3.length / 4);
		let pot2 = pot3.splice(0, pot3.length / 3);

		//embaralhar
		shuffleArray(pot1);
		shuffleArray(pot2);
		shuffleArray(pot3);

		let classifToNationalCup = pot1.concat(pot2, pot3);

		while (!end) {
			let newOpponentsLeft = [];
			let games = "";
			let playerOpp = "";
			// Loop pelos jogos do torneio
			for (let matchID = 0; matchID < classifToNationalCup.length / 2; matchID++) {
				// Selecionando os dois times para o jogo atual
				let team1 = classifToNationalCup[matchID];
				let team2 = classifToNationalCup[classifToNationalCup.length - (matchID + 1)];

				let isFinal = phase >= TournamentPath.length - 2 ? false : true;

				// Obtendo o resultado do jogo
				let game = GetKnockoutResult(team1, team2, isFinal);

				// Verificando se o jogador está envolvido no jogo atual
				if (team1.name === player.team.name || team2.name === player.team.name) {
					playerOpp = `: ${team1.name === player.team.name ? team2.name : team1.name}`;

					opportunities += Math.round(Math.random() * 100) / 100;
					currentSeason.awardPoints += 0.6; // Máximo 0.6 x 4 = 2.4
					player.fame += 1; // Copa Nacional Máximo 1 x 4 = 4

					// Verificando se o jogador ganhou o jogo
					if (
						(game.result && team1.name === player.team.name) ||
						(!game.result && team2.name === player.team.name)
					) {
						// Incrementando a fase do jogador e concedendo pontos e prêmios adicionais
						playerPhase++;
						if (playerPhase >= TournamentPath.length - 1) {
							// Se o jogador venceu o torneio, conceder prêmios adicionais
							player.nationalCup.push(`${year} (${player.team.name})`);
							currentSeason.awardPoints += 0.6; // Máximo 0.6 x 4 + 0.6 = 3.0
							player.fame += 6; // Copa Nacional Máximo 1 x 4 + 6 = 10
							triplice++;
						}
					}
				}

				// Adicionando o resultado do jogo ao histórico geral
				games += `--> ${game.game}`;

				// Adicionando o próximo oponente para a próxima rodada com base no resultado do jogo atual
				if (game.result) {
					newOpponentsLeft.push(team1);
				} else {
					newOpponentsLeft.push(team2);
				}
			}

			nationalCupDescription.push(`${TournamentPath[phase]}${playerOpp}${games}`);

			phase++;
			classifToNationalCup = newOpponentsLeft;

			if (phase >= TournamentPath.length - 1) {
				end = true;
			}
		}

		currentSeason.titles.push(
			[`Copa Nacional: ${TournamentPath[playerPhase]}`].concat(nationalCupDescription)
		);

		//Champions League
		phase = 0;
		playerPhase = 0;

		let championsDescription = [];
		let qualifiedToChampions = [];

		// Obter os principais times de cada liga
		for (let leagueID = 0; leagueID < leagues.length; leagueID++) {
			let league = DeepClone([...leagues[leagueID].teams]);

			let leagueTableNames = lastLeagueResults[leagueID].result.table.map((team) => team.name);
			let leagueQualifiedNames = leagueTableNames.splice(
				0,
				lastLeagueResults[leagueID].championsSpots
			);
			let leagueQualified = league.filter((team) => leagueQualifiedNames.includes(team.name));

			for (let teamID = 0; teamID < lastLeagueResults[leagueID].championsSpots; teamID++) {
				qualifiedToChampions.push(leagueQualified[teamID]);
			}
		}

		// Adicionar as equipes extras aos times qualificados
		qualifiedToChampions = qualifiedToChampions.concat(extrateams.slice(0, 12));

		// Obter a posição dos campeões em um grupo específico
		let championsGroup = GetChampionsPosition(
			qualifiedToChampions,
			player.championsQualification ? player.team : null
		);

		const playerChampionsPos =
			championsGroup.table.findIndex((team) => team.name === player.team.name) + 1;

		if (playerChampionsPos > 0) {
			opportunities += (20 - playerChampionsPos) / 5;
			currentSeason.awardPoints += Math.max(0, 11 - playerChampionsPos) / 10;
		}

		// Construir a descrição da fase do torneio
		championsDescription.push(
			`${TournamentPath[playerPhase]}${
				playerChampionsPos > 0 ? `: ${playerChampionsPos}º lugar` : ""
			}${championsGroup.desc}`
		);

		// Obter as equipes classificadas para os playoffs e limitar para 24 equipes
		let playoffsClassif = DeepClone([...championsGroup.table]).splice(0, 24);

		// Avançar para a próxima fase
		phase++;

		// Verificar se o novo jogador está entre os classificados para os playoffs
		if (playoffsClassif.some((t) => t.name === player.team.name)) {
			playerPhase++;
		}

		// Selecionar as primeiras 8 equipes classificadas para os playoffs
		let classifToKnockout = playoffsClassif.splice(0, 8);

		let games = "";
		let playerOpp = "";

		for (let matchID = 0; matchID < playoffsClassif.length / 2; matchID++) {
			let team1 = playoffsClassif[matchID];
			let team2 = playoffsClassif[playoffsClassif.length - (matchID + 1)];
			let game = GetKnockoutResult(team1, team2, true);

			if (team1.name === player.team.name || team2.name === player.team.name) {
				playerOpp = `: ${team1.name === player.team.name ? team2.name : team1.name}`;
			}

			games += `--> ${game.game}`;

			if (game.result) {
				classifToKnockout.push(team1);
			} else {
				classifToKnockout.push(team2);
			}
		}

		championsDescription.push(`${TournamentPath[phase]}${playerOpp}${games}`);

		if (classifToKnockout.some((t) => t.name === player.team.name)) {
			playerPhase++;
		}

		phase++;
		end = false;
		// Loop principal para simular os jogos do torneio até o final
		while (!end) {
			// Limpar variáveis ​​para armazenar informações dos jogos
			let games = "";
			let playerOpp = "";
			let newClassif = [];

			// Loop pelos jogos do torneio atual
			for (let matchID = 0; matchID < classifToKnockout.length / 2; matchID++) {
				// Selecionar os dois times para o jogo atual
				let team1 = classifToKnockout[matchID];
				let team2 = classifToKnockout[classifToKnockout.length - (matchID + 1)];

				// Obter o resultado do jogo
				let game = GetKnockoutResult(
					team1,
					team2,
					phase >= TournamentPath.length - 2 ? false : true
				);

				// Verificar se o jogador está envolvido no jogo atual
				if (team1.name === player.team.name || team2.name === player.team.name) {
					playerOpp = `: ${team1.name === player.team.name ? team2.name : team1.name}`;

					opportunities += Math.round(Math.random() * 100) / 100;
					currentSeason.awardPoints += 0.6; // Máximo 1.0 + 0.6 x 4 = 3.4
					player.fame += 3; // Champions Máximo 3 x 4 = 12

					// Verificar se o jogador ganhou o jogo
					if (
						(game.result && team1.name === player.team.name) ||
						(!game.result && team2.name === player.team.name)
					) {
						// Incrementar a fase do jogador e conceder pontos e prêmios adicionais
						playerPhase++;
						if (playerPhase >= TournamentPath.length - 1) {
							// Se o jogador vencer o torneio, conceder prêmios adicionais
							player.champions.push(`${year} (${player.team.name})`);
							player.fame += 8; // Máximo 3 x 4 + 8 = 20
							currentSeason.awardPoints += 0.6; // Máximo 1.0 + 0.6 x 4 + 0.6 = 4.0
							triplice++;
						}
					}
				}

				// Adicionar o resultado do jogo ao histórico geral
				games += `--> ${game.game}`;

				// Adicionar os vencedores do jogo à nova classificação
				if (game.result) {
					newClassif.push(team1);
				} else {
					newClassif.push(team2);
				}
			}

			// Construir a descrição da fase do torneio
			championsDescription.push(`${TournamentPath[phase]}${playerOpp}${games}`);

			// Avançar para a próxima fase e atualizar a classificação
			phase++;
			classifToKnockout = newClassif;

			// Verificar se o torneio chegou ao fim
			if (phase >= TournamentPath.length - 1) {
				console.log("Champions League: " + newClassif[0].name + " (" + newClassif[0].power + ")");
				end = true;
			}
		}

		let playerChampionsResult = player.championsQualification
			? `: ${TournamentPath[playerPhase]}`
			: "";
		currentSeason.titles.push(
			[`Champions League${playerChampionsResult}`].concat(championsDescription)
		);

		//europa league
		phase = 0;
		playerPhase = 0;
		let europaLeagueDescription = [];

		let qualified = [];

		for (let leagueID = 0; leagueID < leagues.length; leagueID++) {
			let league = DeepClone([...leagues[leagueID].teams]);

			let leagueTableNames = lastLeagueResults[leagueID].result.table.map((team) => team.name);
			let leagueQualifiedNames = leagueTableNames.splice(
				lastLeagueResults[leagueID].championsSpots,
				lastLeagueResults[leagueID].europaSpots
			);
			let leagueQualified = league.filter((team) => leagueQualifiedNames.includes(team.name));

			for (let teamID = 0; teamID < lastLeagueResults[leagueID].europaSpots; teamID++) {
				qualified.push(leagueQualified[teamID]);
			}
		}

		qualified = qualified.concat(extrateams.slice(12, extrateams.length));

		let group = GetEuropaPosition(qualified, player.europaQualification ? player.team : null);

		const playerEuropaPosition =
			group.table.findIndex((team) => team.name === player.team.name) + 1;

		if (playerEuropaPosition > 0) {
			opportunities += (20 - playerEuropaPosition) / 5;
		}

		europaLeagueDescription.push(
			`${TournamentPath[playerPhase]}${
				playerEuropaPosition > 0 ? `: ${playerEuropaPosition}º lugar` : ""
			}${group.desc}`
		);

		let classif = DeepClone([...group.table]).splice(0, 16);

		if (classif.some((t) => t.name === player.team.name)) {
			playerPhase += 2;
		}

		phase += 2;
		end = false;
		// Loop principal para simular os jogos do torneio até o final
		while (!end) {
			// Limpar variáveis ​​para armazenar informações dos jogos
			let games = "";
			let playerOpp = "";
			let newClassif = [];

			// Loop pelos jogos do torneio atual
			for (let matchID = 0; matchID < classif.length / 2; matchID++) {
				// Selecionar os dois times para o jogo atual
				let team1 = classif[matchID];
				let team2 = classif[classif.length - (matchID + 1)];

				// Obter o resultado do jogo
				let game = GetKnockoutResult(
					team1,
					team2,
					phase >= TournamentPath.length - 2 ? false : true
				);

				// Verificar se o jogador está envolvido no jogo atual
				if (team1.name === player.team.name || team2.name === player.team.name) {
					playerOpp = `: ${team1.name === player.team.name ? team2.name : team1.name}`;
					// Verificar se o jogador ganhou o jogo
					if (
						(game.result && team1.name === player.team.name) ||
						(!game.result && team2.name === player.team.name)
					) {
						// Incrementar a fase do jogador e, se vencer o torneio, adicionar à sua lista de realizações
						playerPhase++;
						opportunities += Math.round(Math.random() * 100) / 100;
						if (playerPhase >= TournamentPath.length - 1) {
							player.europa.push(`${year} (${player.team.name})`);
						}
					}
				}

				// Adicionar o resultado do jogo ao histórico geral
				games += `--> ${game.game}`;

				// Adicionar os vencedores do jogo à nova classificação
				if (game.result) {
					newClassif.push(team1);
				} else {
					newClassif.push(team2);
				}
			}

			// Construir a descrição da fase do torneio
			europaLeagueDescription.push(`${TournamentPath[phase]}${playerOpp}${games}`);

			// Avançar para a próxima fase e atualizar a classificação
			phase++;
			classif = newClassif;

			// Verificar se o torneio chegou ao fim
			if (phase >= TournamentPath.length - 1) {
				end = true;
				console.log("Europa League: " + newClassif[0].name + " (" + newClassif[0].power + ")");
			}
		}

		let playerEuropaResult = player.europaQualification ? `: ${TournamentPath[playerPhase]}` : "";

		currentSeason.titles.push(
			[`Europa League${playerEuropaResult}`].concat(europaLeagueDescription)
		);

		if (year % 4 === 0) {
			currentSeason.awardPoints -= 2.0;
			let playedContinental =
				currentSeason.starting >= 50 &&
				(player.team.power >= player.nation.power - 2 ||
					(med > 0 && currentSeason.performance > 0.2 && generalPerformance.length >= 2));

			// EUROCOPA
			phase = 0;
			playerPhase = 0;
			let europeanDescription = [];

			let europeanTeams = DeepClone([...nations.find((n) => n.name === "UEFA").teams]);
			europeanTeams = europeanTeams.sort((a, b) => b.power - a.power - Math.random());
			europeanTeams.splice(24);

			let nationEuroClassif = europeanTeams.some((t) => t.name === player.nation.name);

			let europeanPots = [];
			for (let i = 0; i < 4; i++) {
				europeanPots.push(shuffleArray(europeanTeams.splice(0, 6)));
			}

			let europeanGroups = [];
			for (let i = 0; i < 6; i++) {
				europeanGroups.push([]);
				for (let j = 0; j < 4; j++) {
					europeanGroups[i].push(europeanPots[j][i]);
				}
			}

			let firstPlaces = [];
			let secondPlaces = [];
			let thirdPlaces = [];
			let thirdPlacesPoints = [];

			// Loop através de todos os grupos
			for (let groupID = 0; groupID < europeanGroups.length; groupID++) {
				// Obter a posição do jogador no grupo atual
				let thisGroup = GetWorldCupPosition(
					europeanGroups[groupID],
					europeanGroups[groupID].some((t) => t.name === player.nation.name) ? player.nation : null
				);
				const playerPosition =
					thisGroup.table.findIndex((team) => team.name === player.nation.name) + 1;

				// Se o jogador estiver entre os primeiros colocados do grupo, atualizar informações
				if (playerPosition > 0) {
					europeanDescription.push(
						`${TournamentPath[phase]}: ${playerPosition}º lugar${thisGroup.desc}`
					);
				}

				// Adicionar os primeiros, segundos e terceiros colocados do grupo às listas correspondentes
				firstPlaces.push(thisGroup.table[0]);
				secondPlaces.push(thisGroup.table[1]);
				thirdPlaces.push(thisGroup.table[2]);
				thirdPlacesPoints.push(thisGroup.points[2]);
			}

			if (player.nation.continent !== "UEFA" || !nationEuroClassif)
				europeanDescription.push("Grupos-->Sem Dados");

			thirdPlaces.sort((a, b) => {
				return (
					thirdPlacesPoints[thirdPlaces.indexOf(b)] - thirdPlacesPoints[thirdPlaces.indexOf(a)]
				);
			});

			// Combinar os primeiros, segundos e terceiros colocados de todos os grupos e os oito primeiros terceiros colocados
			let classif = firstPlaces.concat(secondPlaces, thirdPlaces.slice(0, 4));
			phase += 2;

			if (classif.some((t) => t.name === player.nation.name)) {
				playerPhase += 2;
			}

			// Variável para indicar o fim do loop
			let end = false;

			// Loop principal para simular os jogos do torneio até o final
			while (!end) {
				// Limpar variáveis para armazenar informações dos jogos
				let games = "";
				let newClassif = [];
				let playerOpp = "";

				// Loop pelos jogos do torneio atual
				for (let matchID = 0; matchID < classif.length / 2; matchID++) {
					// Selecionar os dois times para o jogo atual
					let team1 = classif[matchID];
					let team2 = classif[classif.length - (matchID + 1)];

					// Obter o resultado do jogo
					let game = GetKnockoutResult(team1, team2, false);

					if (team1.name === player.nation.name || team2.name === player.nation.name) {
						playerOpp = `: ${team1.name === player.nation.name ? team2.name : team1.name}`;
					}

					// Verificar se o jogador está envolvido no jogo atual
					if (team1.name === player.nation.name || team2.name === player.nation.name) {
						if (playedContinental) {
							opportunities += Math.round(Math.random() * 100) / 100;
							currentSeason.awardPoints += 0.6; // Máximo 0.4 x 4 = 2.4
							player.fame += 3; // Copa Máximo 3 x 4 = 12
						}

						// Verificar se o jogador ganhou o jogo
						if (
							(game.result && team1.name === player.nation.name) ||
							(!game.result && team2.name === player.nation.name)
						) {
							playerPhase++;
							// Verificar se o jogador ganhou a Copa do Mundo e conceder prêmios adicionais
							if (playedContinental) {
								if (playerPhase >= TournamentPath.length - 1) {
									player.continentalChampionship.push(`${year}`);
									currentSeason.awardPoints += 0.6; // Máximo 0.6 x 4 + 0.6 = 3.0
									player.fame += 8; // Máximo 3 x 4 + 8 = 20
								}
							}
						}
					}

					// Adicionar o resultado do jogo ao histórico geral
					games += `--> ${game.game}`;

					// Adicionar os vencedores do jogo à nova classificação
					if (game.result) {
						newClassif.push(team1);
					} else {
						newClassif.push(team2);
					}
				}

				// Construir a descrição da fase do torneio
				europeanDescription.push(`${TournamentPath[phase]}${playerOpp}${games}`);

				// Avançar para a próxima fase e atualizar a classificação
				phase++;
				classif = newClassif;

				// Verificar se o torneio chegou ao fim
				if (phase >= TournamentPath.length - 1) {
					end = true;
					console.log("Eurocopa: " + newClassif[0].name + " (" + newClassif[0].power + ")");
				}
			}

			let playerEuropeanDesc = "";

			if (player.nation.continent === "UEFA" && nationEuroClassif) {
				playerEuropeanDesc = `: ${TournamentPath[playerPhase]} ${
					playedContinental ? "" : " (Não Convocado)"
				}`;
			}

			currentSeason.titles.push([`Eurocopa${playerEuropeanDesc}`].concat(europeanDescription));

			// COPA AMERICA
			phase = 0;
			playerPhase = 0;
			let americanDescription = [];

			let americanTeams = DeepClone([
				...nations.find((n) => n.name === "CONMEBOL").teams,
				...nations.find((n) => n.name === "CONCACAF").teams,
			]);

			americanTeams.sort((a, b) => b.power - a.power);

			let americanPots = [];
			for (let i = 0; i < 4; i++) {
				americanPots.push(shuffleArray(americanTeams.splice(0, 4)));
			}

			let americanGroups = [];
			for (let i = 0; i < 4; i++) {
				americanGroups.push([]);
				for (let j = 0; j < 4; j++) {
					americanGroups[i].push(americanPots[j][i]);
				}
			}

			// Listas para armazenar os primeiros, segundos e terceiros colocados de cada grupo
			firstPlaces = [];
			secondPlaces = [];

			// Loop através de todos os grupos
			for (let groupID = 0; groupID < americanGroups.length; groupID++) {
				// Obter a posição do jogador no grupo atual
				let thisGroup = GetWorldCupPosition(
					americanGroups[groupID],
					americanGroups[groupID].some((t) => t.name === player.nation.name) ? player.nation : null
				);
				const playerPosition =
					thisGroup.table.findIndex((team) => team.name === player.nation.name) + 1;

				// Se o jogador estiver entre os primeiros colocados do grupo, atualizar informações
				if (playerPosition > 0) {
					americanDescription.push(
						`${TournamentPath[phase]}: ${playerPosition}º lugar${thisGroup.desc}`
					);
				}

				// Adicionar os primeiros, segundos e terceiros colocados do grupo às listas correspondentes
				firstPlaces.push(thisGroup.table[0]);
				secondPlaces.push(thisGroup.table[1]);
			}

			if (player.nation.continent !== "CONCACAF" && player.nation.continent !== "CONMEBOL")
				americanDescription.push("Grupos-->Sem Dados");

			// Combinar os primeiros, segundos e terceiros colocados de todos os grupos e os oito primeiros terceiros colocados
			classif = firstPlaces.concat(secondPlaces);
			phase += 3;
			if (classif.some((t) => t.name === player.nation.name)) {
				playerPhase += 3;
			}

			// Variável para indicar o fim do loop
			end = false;

			// Loop principal para simular os jogos do torneio até o final
			while (!end) {
				// Limpar variáveis para armazenar informações dos jogos
				let games = "";
				let newClassif = [];
				let playerOpp = "";

				// Loop pelos jogos do torneio atual
				for (let matchID = 0; matchID < classif.length / 2; matchID++) {
					// Selecionar os dois times para o jogo atual
					let team1 = classif[matchID];
					let team2 = classif[classif.length - (matchID + 1)];

					// Obter o resultado do jogo
					let game = GetKnockoutResult(team1, team2, false);

					if (team1.name === player.nation.name || team2.name === player.nation.name) {
						playerOpp = `: ${team1.name === player.nation.name ? team2.name : team1.name}`;
					}

					// Verificar se o jogador está envolvido no jogo atual
					if (team1.name === player.nation.name || team2.name === player.nation.name) {
						if (playedContinental) {
							opportunities += Math.round(Math.random() * 100) / 100;
							currentSeason.awardPoints += 0.8; // Máximo 0.8 x 3 = 2.4
							player.fame += 4; // Copa América Máximo 4 x 3 = 12
						}

						// Verificar se o jogador ganhou o jogo
						if (
							(game.result && team1.name === player.nation.name) ||
							(!game.result && team2.name === player.nation.name)
						) {
							playerPhase++;
							// Verificar se o jogador ganhou a Copa do Mundo e conceder prêmios adicionais
							if (playedContinental) {
								if (playerPhase >= TournamentPath.length - 1) {
									player.continentalChampionship.push(`${year}`);
									currentSeason.awardPoints += 0.6; // Máximo 0.8 x 3 + 0.6 = 3.0
									player.fame += 8; // Máximo 4 x 3 + 8 = 20
								}
							}
						}
					}

					// Adicionar o resultado do jogo ao histórico geral
					games += `--> ${game.game}`;

					// Adicionar os vencedores do jogo à nova classificação
					if (game.result) {
						newClassif.push(team1);
					} else {
						newClassif.push(team2);
					}
				}

				// Construir a descrição da fase do torneio
				americanDescription.push(`${TournamentPath[phase]}${playerOpp}${games}`);

				// Avançar para a próxima fase e atualizar a classificação
				phase++;
				classif = newClassif;

				// Verificar se o torneio chegou ao fim
				if (phase >= TournamentPath.length - 1) {
					end = true;
					console.log("Copa América: " + newClassif[0].name + " (" + newClassif[0].power + ")");
				}
			}

			let playerAmericanDesc = "";

			if (player.nation.continent === "CONCACAF" || player.nation.continent === "CONMEBOL") {
				playerAmericanDesc = `: ${TournamentPath[playerPhase]} ${
					playedContinental ? "" : " (Não Convocado)"
				}`;
			}

			currentSeason.titles.push([`Copa América${playerAmericanDesc}`].concat(americanDescription));

			// COPA DA ÁFRICA
			phase = 0;
			playerPhase = 0;
			let africanDescription = [];

			let africanTeams = DeepClone([...nations.find((n) => n.name === "CAF").teams]);

			let africanPots = [];
			for (let i = 0; i < 4; i++) {
				africanPots.push(shuffleArray(africanTeams.splice(0, 3)));
			}

			let africanGroups = [];
			for (let i = 0; i < 3; i++) {
				africanGroups.push([]);
				for (let j = 0; j < 4; j++) {
					africanGroups[i].push(africanPots[j][i]);
				}
			}

			// Listas para armazenar os primeiros, segundos e terceiros colocados de cada grupo
			firstPlaces = [];
			secondPlaces = [];
			thirdPlaces = [];
			thirdPlacesPoints = [];

			// Loop através de todos os grupos
			for (let groupID = 0; groupID < africanGroups.length; groupID++) {
				// Obter a posição do jogador no grupo atual
				let thisGroup = GetWorldCupPosition(
					africanGroups[groupID],
					africanGroups[groupID].some((t) => t.name === player.nation.name) ? player.nation : null
				);
				const playerPosition =
					thisGroup.table.findIndex((team) => team.name === player.nation.name) + 1;

				// Se o jogador estiver entre os primeiros colocados do grupo, atualizar informações
				if (playerPosition > 0) {
					africanDescription.push(
						`${TournamentPath[phase]}: ${playerPosition}º lugar${thisGroup.desc}`
					);
				}

				// Adicionar os primeiros, segundos e terceiros colocados do grupo às listas correspondentes
				firstPlaces.push(thisGroup.table[0]);
				secondPlaces.push(thisGroup.table[1]);
				thirdPlaces.push(thisGroup.table[2]);
				thirdPlacesPoints.push(thisGroup.points[2]);
			}

			if (player.nation.continent !== "CAF") africanDescription.push("Grupos-->Sem Dados");

			thirdPlaces.sort((a, b) => {
				return (
					thirdPlacesPoints[thirdPlaces.indexOf(b)] - thirdPlacesPoints[thirdPlaces.indexOf(a)]
				);
			});

			// Combinar os primeiros, segundos e terceiros colocados de todos os grupos e os oito primeiros terceiros colocados
			classif = firstPlaces.concat(secondPlaces, thirdPlaces.slice(0, 2));
			phase += 3;
			if (classif.some((t) => t.name === player.nation.name)) {
				playerPhase += 3;
			}

			// Variável para indicar o fim do loop
			end = false;

			// Loop principal para simular os jogos do torneio até o final
			while (!end) {
				// Limpar variáveis para armazenar informações dos jogos
				let games = "";
				let newClassif = [];
				let playerOpp = "";

				// Loop pelos jogos do torneio atual
				for (let matchID = 0; matchID < classif.length / 2; matchID++) {
					// Selecionar os dois times para o jogo atual
					let team1 = classif[matchID];
					let team2 = classif[classif.length - (matchID + 1)];

					// Obter o resultado do jogo
					let game = GetKnockoutResult(team1, team2, false);

					if (team1.name === player.nation.name || team2.name === player.nation.name) {
						playerOpp = `: ${team1.name === player.nation.name ? team2.name : team1.name}`;
					}

					// Verificar se o jogador está envolvido no jogo atual
					if (team1.name === player.nation.name || team2.name === player.nation.name) {
						if (playedContinental) {
							opportunities += Math.round(Math.random() * 100) / 100;
							currentSeason.awardPoints += 0.8; // Máximo 0.8 x 3 = 2.4
							player.fame += 4; // Copa África Máximo 4 x 3 = 12
						}
						// Verificar se o jogador ganhou o jogo
						if (
							(game.result && team1.name === player.nation.name) ||
							(!game.result && team2.name === player.nation.name)
						) {
							playerPhase++;
							// Verificar se o jogador ganhou a Copa do Mundo e conceder prêmios adicionais
							if (playedContinental) {
								if (playerPhase >= TournamentPath.length - 1) {
									player.continentalChampionship.push(`${year}`);
									currentSeason.awardPoints += 0.6; // Máximo 0.8 x 3 + 0.6 = 3.0
									player.fame += 8; // Máximo 4 x 3 + 8 = 20
								}
							}
						}
					}

					// Adicionar o resultado do jogo ao histórico geral
					games += `--> ${game.game}`;

					// Adicionar os vencedores do jogo à nova classificação
					if (game.result) {
						newClassif.push(team1);
					} else {
						newClassif.push(team2);
					}
				}

				// Construir a descrição da fase do torneio
				africanDescription.push(`${TournamentPath[phase]}${playerOpp}${games}`);

				// Avançar para a próxima fase e atualizar a classificação
				phase++;
				classif = newClassif;

				// Verificar se o torneio chegou ao fim
				if (phase >= TournamentPath.length - 1) {
					end = true;
					console.log("Copa da África: " + newClassif[0].name + " (" + newClassif[0].power + ")");
				}
			}

			let playerAfricanDesc = "";

			if (player.nation.continent === "CAF") {
				playerAfricanDesc = `: ${TournamentPath[playerPhase]} ${
					playedContinental ? "" : " (Não Convocado)"
				}`;
			}

			currentSeason.titles.push([`Copa da África${playerAfricanDesc}`].concat(africanDescription));

			// COPA DA ÁSIA
			phase = 0;
			playerPhase = 0;
			let asianDescription = [];
			// 1. get all 12 teams
			let asianTeams = DeepClone([...nations.find((n) => n.name === "AFC").teams]);

			let asianPots = [];
			for (let i = 0; i < 4; i++) {
				asianPots.push(shuffleArray(asianTeams.splice(0, 3)));
			}

			let asianGroups = [];
			for (let i = 0; i < 3; i++) {
				asianGroups.push([]);
				for (let j = 0; j < 4; j++) {
					asianGroups[i].push(asianPots[j][i]);
				}
			}

			// Listas para armazenar os primeiros, segundos e terceiros colocados de cada grupo
			firstPlaces = [];
			secondPlaces = [];
			thirdPlaces = [];
			thirdPlacesPoints = [];

			// Loop através de todos os grupos
			for (let groupID = 0; groupID < asianGroups.length; groupID++) {
				// Obter a posição do jogador no grupo atual
				let thisGroup = GetWorldCupPosition(
					asianGroups[groupID],
					asianGroups[groupID].some((t) => t.name === player.nation.name) ? player.nation : null
				);
				const playerPosition =
					thisGroup.table.findIndex((team) => team.name === player.nation.name) + 1;

				// Se o jogador estiver entre os primeiros colocados do grupo, atualizar informações
				if (playerPosition > 0) {
					asianDescription.push(
						`${TournamentPath[phase]}: ${playerPosition}º lugar${thisGroup.desc}`
					);
				}

				// Adicionar os primeiros, segundos e terceiros colocados do grupo às listas correspondentes
				firstPlaces.push(thisGroup.table[0]);
				secondPlaces.push(thisGroup.table[1]);
				thirdPlaces.push(thisGroup.table[2]);
				thirdPlacesPoints.push(thisGroup.points[2]);
			}

			if (player.nation.continent !== "AFC") asianDescription.push("Grupos-->Sem Dados");

			thirdPlaces.sort((a, b) => {
				return (
					thirdPlacesPoints[thirdPlaces.indexOf(b)] - thirdPlacesPoints[thirdPlaces.indexOf(a)]
				);
			});

			// Combinar os primeiros, segundos e terceiros colocados de todos os grupos e os oito primeiros terceiros colocados
			classif = firstPlaces.concat(secondPlaces, thirdPlaces.slice(0, 2));
			phase += 3;
			if (classif.some((t) => t.name === player.nation.name)) {
				playerPhase += 3;
			}

			// Variável para indicar o fim do loop
			end = false;

			// Loop principal para simular os jogos do torneio até o final
			while (!end) {
				// Limpar variáveis para armazenar informações dos jogos
				let games = "";
				let newClassif = [];
				let playerOpp = "";

				// Loop pelos jogos do torneio atual
				for (let matchID = 0; matchID < classif.length / 2; matchID++) {
					// Selecionar os dois times para o jogo atual
					let team1 = classif[matchID];
					let team2 = classif[classif.length - (matchID + 1)];

					// Obter o resultado do jogo
					let game = GetKnockoutResult(team1, team2, false);

					if (team1.name === player.nation.name || team2.name === player.nation.name) {
						playerOpp = `: ${team1.name === player.nation.name ? team2.name : team1.name}`;
					}

					// Verificar se o jogador está envolvido no jogo atual
					if (team1.name === player.nation.name || team2.name === player.nation.name) {
						if (playedContinental) {
							opportunities += Math.round(Math.random() * 100) / 100;
							currentSeason.awardPoints += 0.8; // Máximo 0.8 x 3 = 2.4
							player.fame += 4; // Copa Ásia Máximo 4 x 3 = 12
						}

						// Verificar se o jogador ganhou o jogo
						if (
							(game.result && team1.name === player.nation.name) ||
							(!game.result && team2.name === player.nation.name)
						) {
							playerPhase++;
							// Verificar se o jogador ganhou a Copa do Mundo e conceder prêmios adicionais
							if (playedContinental) {
								if (playerPhase >= TournamentPath.length - 1) {
									player.continentalChampionship.push(`${year}`);
									currentSeason.awardPoints += 0.6; // Máximo 0.8 x 3 + 0.6 = 3.0
									player.fame += 8; // Máximo 4 x 3 + 8 = 20
								}
							}
						}
					}

					// Adicionar o resultado do jogo ao histórico geral
					games += `--> ${game.game}`;

					// Adicionar os vencedores do jogo à nova classificação
					if (game.result) {
						newClassif.push(team1);
					} else {
						newClassif.push(team2);
					}
				}

				// Construir a descrição da fase do torneio
				asianDescription.push(`${TournamentPath[phase]}${playerOpp}${games}`);

				// Avançar para a próxima fase e atualizar a classificação
				phase++;
				classif = newClassif;

				// Verificar se o torneio chegou ao fim
				if (phase >= TournamentPath.length - 1) {
					end = true;
					console.log("Copa da Ásia: " + newClassif[0].name + " (" + newClassif[0].power + ")");
				}
			}

			let playerAsianDesc = "";

			if (player.nation.continent === "AFC") {
				playerAsianDesc = `: ${TournamentPath[playerPhase]} ${
					playedContinental ? "" : " (Não Convocado)"
				}`;
			}

			currentSeason.titles.push([`Copa da Ásia${playerAsianDesc}`].concat(asianDescription));
		}

		//World Cup
		if (year % 4 === 2) {
			currentSeason.awardPoints -= 2.0;
			phase = 0;
			playerPhase = 0;
			let worldCupDescription = [];
			let newWorldCupHistoryHosts = worldCupHistoryHosts;
			let currentHosts = newWorldCupHistoryHosts.find((h) => h.year === year).hosts;

			let worldCupHostDescription = "Hosts";
			for (let hostID = 0; hostID < currentHosts.length; hostID++) {
				worldCupHostDescription += `-->${currentHosts[hostID]}`;
			}
			worldCupDescription.push(worldCupHostDescription);

			// Lista para armazenar todas as nações qualificadas para a Copa do Mundo
			let allClassifNations = [];

			// Lista para armazenar as nações para os playoffs
			let playoffClassif = [];

			// Loop através de todas as regiões/nacionalidades
			for (let regionID = 0; regionID < nations.length; regionID++) {
				// Clonar profundamente a região/nacionalidade atual
				let region = DeepClone(nations[regionID]);

				let autoClassifHost = [];
				autoClassifHost = region.teams.filter((n) => currentHosts.includes(n.name));
				region.teams = region.teams.filter((n) => !currentHosts.includes(n.name));

				// Ordenar as equipes da região/nacionalidade atual por poder, com uma pequena variação aleatória
				region.teams.sort((a, b) => {
					return b.power - a.power - Math.random();
				});

				region.teams = autoClassifHost.concat(region.teams);

				// Selecionar as equipes qualificadas diretamente para a Copa do Mundo
				let classif = region.teams.splice(0, region.worldCupSpots);

				// Adicionar as equipes qualificadas para a Copa do Mundo à lista de todas as nações
				allClassifNations = allClassifNations.concat(classif);

				// Adicionar as equipes restantes à lista de equipes para os playoffs
				playoffClassif = playoffClassif.concat(region.teams);
			}

			// Embaralhar as equipes para os playoffs
			playoffClassif = shuffleArray(playoffClassif);

			// Selecionar as equipes adicionais para a Copa do Mundo dos playoffs
			allClassifNations = allClassifNations.concat(playoffClassif.splice(0, 4));

			const hostsAreFirst = [];
			allClassifNations = allClassifNations.filter((obj) => {
				if (currentHosts.includes(obj.name)) {
					hostsAreFirst.push(obj);
					return false;
				}
				return true;
			});

			// Ordenar todas as nações qualificadas para a Copa do Mundo por poder
			allClassifNations.sort((a, b) => {
				return b.power - a.power;
			});

			allClassifNations = hostsAreFirst.concat(allClassifNations);

			// Verificar se a nação do novo jogador está entre as nações qualificadas para a Copa do Mundo
			let classifToWorldCup = allClassifNations.some((t) => t.name === player.nation.name);

			if (!classifToWorldCup) worldCupDescription.push("Grupos-->Sem Dados");

			//was called by the manager
			let playedWorldCup =
				currentSeason.starting >= 50 &&
				(player.team.power >= player.nation.power - 2 ||
					(med > 0 && currentSeason.performance > 0.2 && generalPerformance.length >= 2));

			//create four pots to the group draw
			let pots = Array.from({ length: 4 }, (_, potID) =>
				allClassifNations.slice(potID * 12, (potID + 1) * 12)
			);

			let groups = [[], [], [], [], [], [], [], [], [], [], [], []];

			for (let potID = 0; potID < pots.length; potID++) {
				for (let GroupID = 0; GroupID < 12; GroupID++) {
					let validNations = pots[potID].filter(
						(n) => !groups[GroupID].some((opp) => opp.continent === n.continent)
					);

					if (validNations.length > 0) {
						let randomIndex = RandomNumber(0, validNations.length - 1);
						groups[GroupID].push(validNations[randomIndex]);

						pots[potID] = pots[potID].filter((n) => validNations[randomIndex] !== n);
					} else {
						//if there is no other nation available, try repeating Europe
						validNations = pots[potID].filter((n) => n.continent === "UEFA");
						if (validNations.length > 0) {
							let randomIndex = RandomNumber(0, validNations.length - 1);
							groups[GroupID].push(validNations[randomIndex]);
							pots[potID] = pots[potID].filter((n) => validNations[randomIndex] !== n);
						} else {
							validNations = pots[potID];
							if (validNations.length > 0) {
								let randomIndex = RandomNumber(0, validNations.length - 1);
								groups[GroupID].push(validNations[randomIndex]);
								pots[potID] = pots[potID].filter((n) => validNations[randomIndex] !== n);
							} else {
								//if can't make a group
								throw new Error("Não foi possível gerar o grupo para a copa", groups);
							}
						}
					}
				}
			}

			// Listas para armazenar os primeiros, segundos e terceiros colocados de cada grupo
			let firstPlaces = [];
			let secondPlaces = [];
			let thirdPlaces = [];
			let thirdPlacesPoints = [];

			// Loop através de todos os grupos
			for (let groupID = 0; groupID < groups.length; groupID++) {
				// Obter a posição do jogador no grupo atual
				let thisGroup = GetWorldCupPosition(
					groups[groupID],
					groups[groupID].some((t) => t.name === player.nation.name) ? player.nation : null
				);
				const playerPosition =
					thisGroup.table.findIndex((team) => team.name === player.nation.name) + 1;

				// Se o jogador estiver entre os primeiros colocados do grupo, atualizar informações
				if (playerPosition > 0) {
					worldCupDescription.push(
						`${TournamentPath[phase]}: ${playerPosition}º lugar${thisGroup.desc}`
					);
				}

				// Adicionar os primeiros, segundos e terceiros colocados do grupo às listas correspondentes
				firstPlaces.push(thisGroup.table[0]);
				secondPlaces.push(thisGroup.table[1]);
				thirdPlaces.push(thisGroup.table[2]);
				thirdPlacesPoints.push(thisGroup.points[2]);
			}

			thirdPlaces.sort((a, b) => {
				return (
					thirdPlacesPoints[thirdPlaces.indexOf(b)] - thirdPlacesPoints[thirdPlaces.indexOf(a)]
				);
			});

			// Combinar os primeiros, segundos e terceiros colocados de todos os grupos e os oito primeiros terceiros colocados
			let classif = firstPlaces.concat(secondPlaces, thirdPlaces.slice(0, 8));
			phase++;

			// Verificar se o jogador avançou para a próxima fase
			if (classif.some((t) => t.name === player.nation.name)) {
				playerPhase++;
			}

			// Variável para indicar o fim do loop
			let end = false;

			// Loop principal para simular os jogos do torneio até o final
			while (!end) {
				// Limpar variáveis para armazenar informações dos jogos
				let games = "";
				let newClassif = [];
				let playerOpp = "";

				// Loop pelos jogos do torneio atual
				for (let matchID = 0; matchID < classif.length / 2; matchID++) {
					// Selecionar os dois times para o jogo atual
					let team1 = classif[matchID];
					let team2 = classif[classif.length - (matchID + 1)];

					// Obter o resultado do jogo
					let game = GetKnockoutResult(team1, team2, false);

					if (team1.name === player.nation.name || team2.name === player.nation.name) {
						playerOpp = `: ${team1.name === player.nation.name ? team2.name : team1.name}`;
					}

					// Verificar se o jogador está envolvido no jogo atual
					if (team1.name === player.nation.name || team2.name === player.nation.name) {
						if (playedWorldCup) {
							opportunities += Math.round(Math.random() * 100) / 100;
							currentSeason.awardPoints += 0.5; // Máximo 0.5 x 5 = 2.5
							player.fame += 3; // Máximo 3 x 5 = 15
						}

						// Verificar se o jogador ganhou o jogo
						if (
							(game.result && team1.name === player.nation.name) ||
							(!game.result && team2.name === player.nation.name)
						) {
							playerPhase++;
							// Verificar se o jogador ganhou a Copa do Mundo e conceder prêmios adicionais
							if (playedWorldCup) {
								if (playerPhase >= TournamentPath.length - 1) {
									player.worldCup.push(`${year}`);
									currentSeason.awardPoints += 0.5; // Máximo 0.5 x 5 + 0.5 = 3.0
									player.fame += 15; // Máximo 4 x 5 + 20 = 30
								}
							}
						}
					}

					// Adicionar o resultado do jogo ao histórico geral
					games += `--> ${game.game}`;

					// Adicionar os vencedores do jogo à nova classificação
					if (game.result) {
						newClassif.push(team1);
					} else {
						newClassif.push(team2);
					}
				}

				// Construir a descrição da fase do torneio
				worldCupDescription.push(`${TournamentPath[phase]}${playerOpp}${games}`);

				// Avançar para a próxima fase e atualizar a classificação
				phase++;
				classif = newClassif;

				// Verificar se o torneio chegou ao fim
				if (phase >= TournamentPath.length - 1) {
					end = true;
					console.log("Copa do Mundo: " + newClassif[0].name + " (" + newClassif[0].power + ")");
				}
			}

			let playerWorldCupDesc = "";

			if (classifToWorldCup) {
				playerWorldCupDesc = `: ${TournamentPath[playerPhase]} ${
					playedWorldCup ? "" : " (Não Convocado)"
				}`;
			}

			currentSeason.titles.push([`Copa do Mundo${playerWorldCupDesc}`].concat(worldCupDescription));

			//select the next host
			let allNations = [];
			for (let regionID = 0; regionID < nations.length; regionID++) {
				allNations = allNations.concat([...nations[regionID].teams]);
			}

			let countriesHosts = newWorldCupHistoryHosts.flatMap((wc) => wc.hosts);
			let furthestYear = Math.max(...newWorldCupHistoryHosts.map((wc) => wc.year));

			let currentWorldCup = newWorldCupHistoryHosts.find((wc) => wc.year === furthestYear);
			let lastWorldCup = newWorldCupHistoryHosts.find((wc) => wc.year === furthestYear - 4);

			let currentMainHost = allNations.find((n) => n.name === (currentWorldCup?.hosts[0] || ""));
			let lastMainHost = allNations.find((n) => n.name === (lastWorldCup?.hosts[0] || ""));

			let validTeams = allNations.filter((team) => {
				const distance = calculateDistance(
					currentMainHost?.latitude || 0,
					currentMainHost?.longitude || 0,
					team.latitude,
					team.longitude
				);
				const distance2 = calculateDistance(
					lastMainHost?.latitude || 0,
					lastMainHost?.longitude || 0,
					team.latitude,
					team.longitude
				);

				return !countriesHosts.includes(team.name) && distance >= 5000 && distance2 >= 2500;
			});

			let chosenHosts = [];

			let chosenID = RandomNumber(0, validTeams.length - 1);
			let mainHost = validTeams[chosenID];
			chosenHosts.push(mainHost);

			// Verifica quais estão próximos
			validTeams = allNations.filter((team) => {
				return (
					mainHost.borders.includes(team.name) &&
					!countriesHosts.includes(team.name) &&
					team.name !== mainHost.name
				);
			});

			let numberOfAdditionalHosts = RandomNumber(
				!!validTeams.length,
				Math.min(validTeams.length - 1, 3)
			);
			for (let count = 0; count < numberOfAdditionalHosts; count++) {
				//seleciona
				let chosenHost = validTeams[count];
				chosenHosts.push(chosenHost);
			}

			newWorldCupHistoryHosts.push({
				year: furthestYear + 4,
				hosts: chosenHosts.map((t) => t.name),
			});
			newWorldCupHistoryHosts.shift();

			setWorldCupHistoryHosts(newWorldCupHistoryHosts);
		}

		let performanceMultiplier = (20 + currentSeason.starting) / 100.0;
		performanceMultiplier *=
			1.0 +
			Math.sign(currentSeason.performance) *
				(currentSeason.performance * currentSeason.performance);

		currentSeason.goals = Math.floor(
			player.positionInClub.goalsMultiplier *
				performanceMultiplier *
				opportunities *
				(0.5 + player.potential * 0.1)
		);

		currentSeason.assists = Math.floor(
			player.positionInClub.assistsMultiplier * performanceMultiplier * opportunities
		);

		if (currentSeason.goals < 0) currentSeason.goals = 0;
		if (currentSeason.assists < 0) currentSeason.assists = 0;

		//add goals to the carrer summary
		player.totalGoals += currentSeason.goals;
		player.totalAssists += currentSeason.assists;

		//post season results
		if (RandomNumber(1, 1000) <= currentSeason.goals / 4 - 1) {
			//Puskás
			player.awards.push(`Puskás ${year} (${player.team.name})`);
			currentSeason.titles.push(["Puskás"]);
		}

		if (triplice >= 3) {
			player.awards.push(`Tríplice Coroa ${year} (${player.team.name})`);
			currentSeason.titles.push(["Tríplice Coroa"]);
		}

		let awardScore =
			Math.round(
				(currentSeason.awardPoints +
					currentSeason.performance * 2 +
					Math.min(currentSeason.starting / 10, 8) +
					player.potential / 5) *
					100
			) / 100;

		console.log("Award Points: " + Math.round(awardScore * 10) / 10 + "/20.0");
		if (
			player.position.title === "Goleiro" &&
			awardScore >= 15 + Math.random() * 3 &&
			currentSeason.performance >= 0.0
		) {
			//Golden Gloves
			player.awards.push(`Luvas de Ouro ${year} (${player.team.name})`);
			player.fame += 30;
			currentSeason.titles.push(["Luva de Ouro"]);
		}

		let goldenBootsGoals = 35 + RandomNumber(0, 5);
		goldenBootsGoals += year % 4 === 2 ? 5 : 0;

		if (goldenBootsGoals <= currentSeason.goals) {
			//Golden Shoes
			player.awards.push(`Chuteiras de Ouro ${year} (${player.team.name})`);
			player.fame += 30;
			currentSeason.titles.push(["Chuteira de Ouro"]);
		}

		let position = -1;
		if (awardScore >= 19) {
			//POTS D'or
			player.playerOfTheSeason.push(`${year} (${player.team.name})`);
			player.fame += 50;
			position = 1;
			currentSeason.titles.push([`Jogador da Temporada: 1º lugar`]);
		} else if (awardScore >= 10) {
			let pts = Math.floor(awardScore - 10);
			player.fame += pts * 2;
			position = 10 - pts;
			currentSeason.titles.push([`Jogador da Temporada: ${position}º lugar`]);
		}

		player.fame += currentSeason.performance * 20;

		player.fame += currentSeason.goals / 5.0;
		player.fame += currentSeason.assists / 5.0;

		//setup next season
		if (playerPosition <= league.championsSpots) {
			player.championsQualification = true;
			player.europaQualification = false;
			player.lastLeaguePosition = playerPosition;
		} else if (playerPosition <= league.championsSpots + league.europaSpots) {
			player.championsQualification = false;
			player.europaQualification = true;
		} else {
			player.championsQualification = false;
			player.europaQualification = false;
		}

		if (player.fame < 0) player.fame = 0;

		currentSeason.fame = player.fame;

		//trasnfer window
		let newTransfers = GetNewTeams(player);
		let newRenew = { value: 0, duration: 0, addition: null, position: null };

		if (
			//if ended loan
			player.contractTeam !== null &&
			contract <= 1
		) {
			newTransfers = [player.contractTeam];

			if (med > 0) {
				let newPosition;
				if (player.position.abbreviation !== "GO" && Math.random() < 0.2) {
					let relatedPositions = player.position.related;
					newPosition = relatedPositions[RandomNumber(0, relatedPositions.length - 1)];
				} else {
					newPosition = player.position.abbreviation;
				}

				newRenew = {
					value: player.contractTeam.contract.value,
					duration: player.contractTeam.contract.duration,
					addition: null,
					position: newPosition,
				};
				document.getElementById("decision-stay").style.display = "flex";
			} else {
				document.getElementById("decision-stay").style.display = "none";
			}

			player.contractTeam = null;

			document.getElementById("decision-transfer1").style.display = "flex";
			document.getElementById("decision-transfer2").style.display = "none";
			document.getElementById("decision-transfer3").style.display = "none";
			document.getElementById("retire").style.display = "none";
		} else if (
			//if played good middle contract
			player.performance > 0.5 &&
			med > 0 &&
			generalPerformance.length >= 2 &&
			contract > 1 &&
			player.age < 35
		) {
			document.getElementById("decision-transfer1").style.display = "flex";
			if (newTransfers[0].contract.value < player.wage)
				newTransfers[0].contract.value = player.wage;

			document.getElementById("decision-transfer2").style.display = "flex";
			if (newTransfers[1].contract.value < player.wage)
				newTransfers[1].contract.value = player.wage;

			document.getElementById("decision-transfer3").style.display = "flex";
			if (newTransfers[2].contract.value < player.wage)
				newTransfers[2].contract.value = player.wage;

			let contractAddition = 0;
			if (contract <= 3) contractAddition = RandomNumber(1, 3);

			let newWage = GetWage(
				player.performance,
				player.positionInClub.value,
				player.age,
				player.team.power,
				player.fame
			);
			if (newWage < player.wage) newWage = player.wage;

			newRenew = {
				value: newWage,
				duration: contract - 1,
				addition: contractAddition,
				position: player.positionInClub.abbreviation,
			};

			document.getElementById("decision-stay").style.display = "flex";
			//cant retire because of the contract
			document.getElementById("retire").style.display = "none";
		} else if (
			//loan
			player.performance < -0.5 &&
			med < 0 &&
			(generalPerformance.length >= 2 || player.age < 24) &&
			newTransfers.some((t) => t !== null && t.team.power < player.team.power) &&
			contract > 3 &&
			player.age < 35
		) {
			if (newTransfers[0].team.power > player.team.power) {
				document.getElementById("decision-transfer1").style.display = "none";
			} else {
				//proposal 1
				document.getElementById("decision-transfer1").style.display = "flex";
				newTransfers[0].loan = true;
				newTransfers[0].contract.duration = RandomNumber(1, 2);
				newTransfers[0].contract.value = player.wage;
			}

			if (newTransfers[1].team.power > player.team.power) {
				document.getElementById("decision-transfer2").style.display = "none";
			} else {
				//proposal 2
				document.getElementById("decision-transfer2").style.display = "flex";
				newTransfers[1].loan = true;
				newTransfers[1].contract.duration = RandomNumber(1, 2);
				newTransfers[1].contract.value = player.wage;
			}

			if (newTransfers[2].team.power > player.team.power) {
				document.getElementById("decision-transfer3").style.display = "none";
			} else {
				//proposal 3
				document.getElementById("decision-transfer3").style.display = "flex";
				newTransfers[2].loan = true;
				newTransfers[2].contract.duration = RandomNumber(1, 2);
				newTransfers[2].contract.value = player.wage;
			}

			//cant stay
			document.getElementById("decision-stay").style.display = "none";

			//cant retire because of the contract
			document.getElementById("retire").style.display = "none";
		} else if (
			//if contract expired
			contract <= 1
		) {
			if (player.age >= player.positionInClub.peak + 8) {
				//must retire
				document.getElementById("retire").style.display = "flex";
				document.getElementById("decision-stay").style.display = "none";
				document.getElementById("decision-transfer1").style.display = "none";
				document.getElementById("decision-transfer2").style.display = "none";
				document.getElementById("decision-transfer3").style.display = "none";
			} else {
				if (med < 0) {
					//cant stay
					document.getElementById("decision-stay").style.display = "none";
				} else {
					//can stay
					document.getElementById("decision-stay").style.display = "flex";
					let contractDuration = RandomNumber(1, 2);

					let contractValue = GetWage(
						player.performance,
						player.positionInClub.value,
						player.age,
						player.team.power,
						player.fame
					);

					// 20% chance to switch position
					let newPosition;
					if (player.position.abbreviation !== "GO" && Math.random() < 0.2) {
						let relatedPositions = player.position.related;
						newPosition = relatedPositions[RandomNumber(0, relatedPositions.length - 1)];
					} else {
						newPosition = player.position.abbreviation;
					}

					newRenew = {
						value: contractValue,
						duration: contractDuration,
						addition: null,
						position: newPosition,
					};
				}

				document.getElementById("decision-transfer1").style.display = "flex";
				document.getElementById("decision-transfer2").style.display = "flex";
				document.getElementById("decision-transfer3").style.display = "flex";

				if (player.age >= player.positionInClub.peak + 6) {
					//can retire
					document.getElementById("retire").style.display = "flex";
				}
			}
		} else {
			ChooseTeam();
		}

		setLastLeagueResults(leagueResults);
		setTransfers(newTransfers);
		setRenew(newRenew);

		//set Seasons
		const newSeasons = [...seasons, currentSeason];
		setSeasons(newSeasons);
	}

	function calculateDistance(lat1, lon1, lat2, lon2) {
		const R = 6371; // Raio da Terra em quilômetros
		const dLat = ((lat2 - lat1) * Math.PI) / 180;
		const dLon = ((lon2 - lon1) * Math.PI) / 180;
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos((lat1 * Math.PI) / 180) *
				Math.cos((lat2 * Math.PI) / 180) *
				Math.sin(dLon / 2) *
				Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		const distance = R * c; // Distância em quilômetros
		return distance;
	}

	function GetEuropaPosition(teams, playerTeam = null) {
		let desc = "";
		let newTeams = DeepClone(teams);
		//sort by power
		newTeams.sort((a, b) => {
			return b.power - a.power - Math.random();
		});

		let points = new Array(newTeams.length).fill(0);

		for (let round = 1; round <= 6; round++) {
			let newOrderTeams = [];
			let newOrderPoints = [];
			for (let i = 0; i < newTeams.length / 2; i++) {
				let home = i;
				let away = i + newTeams.length / 2;

				let game = GetMatch(newTeams[home], newTeams[away]);

				if (game[0] > game[1]) {
					points[home] += 300;
				} else if (game[1] > game[0]) {
					points[away] += 300;
				} else {
					points[away] += 100;
					points[home] += 100;
				}

				points[home] += game[0];
				points[away] += game[1];

				if (
					playerTeam &&
					(playerTeam.name === newTeams[home].name || playerTeam.name === newTeams[away].name)
				) {
					desc += `-->${newTeams[home].name} ${game[0]} x ${game[1]} ${newTeams[away].name}`;
				}

				newOrderTeams.push(newTeams[home]);
				newOrderTeams.push(newTeams[away]);
				newOrderPoints.push(points[home]);
				newOrderPoints.push(points[away]);
			}

			newTeams = newOrderTeams;
			points = newOrderPoints;
		}

		let table = [...newTeams];

		table.sort((a, b) => {
			return points[table.indexOf(b)] - points[table.indexOf(a)];
		});

		desc += `--> Tabela`;
		for (let count = 0; count < 8; count++) {
			desc += `-> ${count + 1}º: ${table[count].name}`;
		}

		return {
			table: table,
			desc: desc,
		};
	}

	function GetChampionsPosition(teams, playerTeam = null) {
		let desc = "";
		let newTeams = DeepClone(teams);
		//sort by power
		newTeams.sort((a, b) => {
			return b.power - a.power;
		});

		let pot1 = newTeams.splice(0, 9);
		let pot2 = newTeams.splice(0, 9);
		let pot3 = newTeams.splice(0, 9);
		let pot4 = newTeams.splice(0, 9);

		pot1 = shuffleArray(pot1);
		pot2 = shuffleArray(pot2);
		pot3 = shuffleArray(pot3);
		pot4 = shuffleArray(pot4);

		newTeams = pot1.concat(pot2, pot3, pot4);

		let points = new Array(newTeams.length).fill(0);

		for (let round = 1; round <= 8; round++) {
			let newOrderTeams = Array(newTeams.length).fill(null);
			let newOrderPoints = Array(newTeams.length).fill(0);
			for (let i = 0; i < newTeams.length - 1; i += 2) {
				let home = i;
				let away = i + 1;

				let game = GetMatch(newTeams[home], newTeams[away]);

				if (game[0] > game[1]) {
					points[home] += 3000;
				} else if (game[1] > game[0]) {
					points[away] += 3000;
				} else {
					points[away] += 1000;
					points[home] += 1000;
				}

				if (
					playerTeam &&
					(playerTeam.name === newTeams[home].name || playerTeam.name === newTeams[away].name)
				) {
					desc += `-->${newTeams[home].name} ${game[0]} x ${game[1]} ${newTeams[away].name}`;
				}

				points[home] += game[0];
				points[away] += game[1];

				newOrderTeams[((i * 2) % newTeams.length) + Math.floor((2 * i) / newTeams.length)] =
					newTeams[home];
				newOrderTeams[(((i + 1) * 2) % newTeams.length) + Math.floor((2 * i) / newTeams.length)] =
					newTeams[away];
				newOrderPoints[((i * 2) % newTeams.length) + Math.floor((2 * i) / newTeams.length)] =
					points[home];
				newOrderPoints[(((i + 1) * 2) % newTeams.length) + Math.floor((2 * i) / newTeams.length)] =
					points[away];
			}

			newTeams = newOrderTeams;
			points = newOrderPoints;
		}

		let table = [...newTeams];

		table.sort((a, b) => {
			return points[table.indexOf(b)] - points[table.indexOf(a)];
		});

		desc += `--> Tabela`;
		for (let count = 0; count < 8; count++) {
			desc += `-> ${count + 1}º: ${table[count].name}`;
		}

		return {
			table: table,
			desc: desc,
		};
	}

	function GetLeaguePosition(teams, playerTeam = null) {
		let desc = "";
		let newTeams = DeepClone(teams);
		let points = new Array(newTeams.length).fill(0);

		for (let home = 0; home < newTeams.length; home++) {
			for (let away = 0; away < newTeams.length; away++) {
				if (newTeams[home] !== newTeams[away]) {
					let game = GetMatch(newTeams[home], newTeams[away]);

					if (game[0] > game[1]) {
						points[home] += 3000;
					} else if (game[1] > game[0]) {
						points[away] += 3000;
					} else {
						points[away] += 1000;
						points[home] += 1000;
					}

					if (
						playerTeam &&
						(playerTeam.name === newTeams[home].name || playerTeam.name === newTeams[away].name)
					) {
						desc += `-->${newTeams[home].name} ${game[0]} x ${game[1]} ${newTeams[away].name}`;
					}

					points[home] += game[0];
					points[away] += game[1];
				}
			}
		}

		let table = [...newTeams];

		table.sort((a, b) => {
			return points[table.indexOf(b)] - points[table.indexOf(a)];
		});

		desc += `--> Tabela`;
		for (let count = 0; count < table.length; count++) {
			desc += `-> ${count + 1}º: ${table[count].name}`;
		}

		return {
			table: table,
			desc: desc,
		};
	}

	function GetWorldCupPosition(teams, playerTeam = null) {
		let desc = "";
		let newTeams = DeepClone([...teams]);
		let points = new Array(teams.length).fill(0);

		// Iterate over each team
		for (let round = 1; round < newTeams.length; round++) {
			let newOrder = [];
			let newPointsOrder = [];
			for (let matchID = 0; matchID < newTeams.length / 2; matchID++) {
				// Start from home + 1 to avoid playing against itself and avoid duplicated matches
				let home = matchID;
				let away = newTeams.length - (matchID + 1);

				let game = GetMatch(newTeams[home], newTeams[away]);

				if (
					playerTeam &&
					(playerTeam.name === newTeams[home].name || playerTeam.name === newTeams[away].name)
				) {
					desc += `-->${newTeams[home].name} ${game[0]} x ${game[1]} ${newTeams[away].name}`;
				}

				if (game[0] > game[1]) {
					points[home] += 3000;
				} else if (game[1] > game[0]) {
					points[away] += 3000;
				} else {
					points[away] += 1000;
					points[home] += 1000;
				}

				points[home] += game[0];
				points[away] += game[1];

				newOrder.push(newTeams[home]);
				newOrder.push(newTeams[away]);
				newPointsOrder.push(points[home]);
				newPointsOrder.push(points[away]);
			}

			newTeams = newOrder;
			points = newPointsOrder;
		}

		let table = [...newTeams];

		table.sort((a, b) => {
			return points[table.indexOf(b)] - points[table.indexOf(a)];
		});
		points.sort((a, b) => {
			return points[b] - points[a];
		});

		desc += `--> Tabela`;
		for (let count = 0; count < table.length; count++) {
			desc += `-> ${count + 1}º: ${table[count].name}`;
		}

		return {
			table: table,
			desc: desc,
			points: points,
		};
	}

	function GetMatch(team1, team2) {
		let base = Math.pow(team1.power, 2) + Math.pow(team2.power, 2);
		let team1Power = Math.pow(team1.power, 2) / base;
		let team2Power = Math.pow(team2.power, 2) / base;

		let team1Luck = 3 * (Math.random() + Math.random()) * (Math.random() + Math.random());
		let team2Luck = 3 * (Math.random() + Math.random()) * (Math.random() + Math.random());

		let team1Score = Math.floor(team1Luck * team1Power);
		let team2Score = Math.floor(team2Luck * team2Power);

		if (team1Score < 0) team1Score = 0;
		if (team2Score < 0) team2Score = 0;

		return [team1Score, team2Score];
	}

	function GetExtraTime(team1, team2) {
		let base = Math.pow(team1.power, 2) + Math.pow(team2.power, 2);
		let team1Power = Math.pow(team1.power, 2) / base;
		let team2Power = Math.pow(team2.power, 2) / base;

		let team1Luck = 3 * (Math.random() + Math.random());
		let team2Luck = 3 * (Math.random() + Math.random());

		let team1Score = Math.floor(team1Luck * team1Power);
		let team2Score = Math.floor(team2Luck * team2Power);

		if (team1Score < 0) team1Score = 0;
		if (team2Score < 0) team2Score = 0;

		return [team1Score, team2Score];
	}

	function GetPenalties(team1, team2) {
		let base = Math.pow(team1.power, 2) + Math.pow(team2.power, 2);
		let team1Power = Math.pow(team1.power, 2) / base;
		let team2Power = Math.pow(team2.power, 2) / base;

		let winner = false;
		let team1goals = 0;
		let team2goals = 0;
		let count = 0;
		while (!winner) {
			count++;
			let team1shooter = Math.random() * team1Power * 10;
			let team2keeper = Math.random() * team2Power * 6;

			if (team1shooter > team2keeper) team1goals++;

			if (count <= 5 && Math.abs(team1goals - team2goals) > 6 - count) {
				winner = true;
				break;
			}

			let team2shooter = RandomNumber(0, team2Power * 100);
			let team1keeper = RandomNumber(0, team1Power * 80);

			if (team2shooter > team1keeper) team2goals++;

			if (
				(count > 5 && team1goals !== team2goals) ||
				(count <= 5 && Math.abs(team1goals - team2goals) > 5 - count)
			) {
				winner = true;
			}
		}

		return [team1goals, team2goals];
	}

	function GetKnockoutResult(team1, team2, ida_e_volta) {
		let gameDesc = "";

		let game = GetMatch(team1, team2);
		let teamGoals1 = game[0];
		let teamGoals2 = game[1];

		if (ida_e_volta) {
			gameDesc = `->${team1.name} ${teamGoals1} x ${teamGoals2} ${team2.name}`;

			let game2 = GetMatch(team2, team1);
			teamGoals1 += game2[1];
			teamGoals2 += game2[0];

			if (teamGoals1 === teamGoals2) {
				let extra = GetExtraTime(team2, team1);
				teamGoals1 += extra[1];
				teamGoals2 += extra[0];

				if (teamGoals1 === teamGoals2) {
					let penalties = GetPenalties(team2, team1);
					gameDesc += `->${team2.name} ${game2[0] + extra[0]} (${penalties[0]}) x (${
						penalties[1]
					}) ${game2[1] + extra[1]} ${team1.name}`;
					gameDesc = `${team1.name} ${teamGoals1} (${penalties[1]}) x (${penalties[0]}) ${teamGoals2} ${team2.name}${gameDesc}`;
					teamGoals1 += penalties[1];
					teamGoals2 += penalties[0];
				} else {
					gameDesc += `->${team2.name} ${game2[0] + extra[0]} x ${game2[1] + extra[1]} ${
						team1.name
					} (Pr)`;
					gameDesc = `${team1.name} ${game[0] + game2[1] + extra[1]} x ${
						game[1] + game2[0] + extra[0]
					} ${team2.name} (Pr)${gameDesc}`;
				}
			} else {
				gameDesc += `->${team2.name} ${game2[0]} x ${game2[1]} ${team1.name}`;
				gameDesc = `${team1.name} ${game[0] + game2[1]} x ${game[1] + game2[0]} ${
					team2.name
				}${gameDesc}`;
			}
		} else if (teamGoals1 === teamGoals2) {
			let extra = GetExtraTime(team1, team2);
			teamGoals1 += extra[0];
			teamGoals2 += extra[1];

			if (teamGoals1 === teamGoals2) {
				let penalties = GetPenalties(team1, team2);
				gameDesc = `${team1.name} ${teamGoals1} (${penalties[0]}) x (${penalties[1]}) ${teamGoals2} ${team2.name}`;
				teamGoals1 += penalties[0];
				teamGoals2 += penalties[1];
			} else {
				gameDesc = `${team1.name} ${teamGoals1} x ${teamGoals2} ${team2.name} (Pr)`;
			}
		} else {
			gameDesc = `${team1.name} ${teamGoals1} x ${teamGoals2} ${team2.name}`;
		}

		let result = teamGoals1 > teamGoals2;

		return { result: result, game: gameDesc };
	}

	function GetNewTeams(currentPlayer) {
		let allTeams = leagues.reduce((acumulador, liga) => {
			return acumulador.concat(liga.teams);
		}, []);

		allTeams.sort((a, b) => {
			return b.power - a.power - Math.random();
		});

		allTeams = allTeams.slice(
			Math.floor(Math.abs(28 - currentPlayer.age)),
			allTeams.length / (4 + currentPlayer.performance)
		);

		let interestedTeams = [];

		for (let i = 0; i < 3; i++) {
			let teamID = RandomNumber(0, allTeams.length - 1);

			while (history.some((t) => t.team === allTeams[teamID].name)) {
				teamID = RandomNumber(0, allTeams.length - 1);
			}

			let team = allTeams[teamID];

			interestedTeams.push(team);
			allTeams = allTeams.filter((t) => t.name !== team.name);
		}

		let contracts = [];

		for (let index = 0; index < 3; index++) {
			let team = interestedTeams[index];
			if (team) {
				// 20% chance to switch position
				let newPosition;
				if (currentPlayer.position.abbreviation !== "GO" && Math.random() < 0.2) {
					let relatedPositions = currentPlayer.position.related;
					newPosition = relatedPositions[RandomNumber(0, relatedPositions.length - 1)];
				} else {
					newPosition = currentPlayer.position.abbreviation;
				}

				let contractDuration = RandomNumber(1, 4);
				contractDuration += currentPlayer.age <= 32 ? RandomNumber(1, 2) : 0;
				contractDuration += currentPlayer.age <= 24 ? RandomNumber(1, 2) : 0;

				let contractValue = GetWage(
					currentPlayer.performance,
					Positions.find((pos) => pos.abbreviation == newPosition).value,
					currentPlayer.age,
					team.power,
					currentPlayer.fame
				);
				let contract = {
					value: contractValue,
					duration: contractDuration,
				};
				let transferValue = GetTransferValue(
					currentPlayer.performance,
					currentPlayer.position.value,
					currentPlayer.age,
					team.power,
					currentPlayer.fame,
					currentPlayer.potential
				);

				contracts.push({
					team: team,
					contract: contract,
					transferValue: transferValue,
					loan: false,
					position: newPosition,
				});
			} else {
				contracts.push(null);
			}
		}

		return contracts;
	}

	function GetInitTeams(posValue, newTeams, currentPlayer, country) {
		// Step 1: Aggregate all teams
		let allTeams = newTeams.reduce((acumulador, liga) => {
			return acumulador.concat(liga.teams);
		}, []);

		// Step 2: Sort teams
		allTeams.sort((a, b) => b.power - a.power - Math.random());

		// Step 3: Slice top half of teams
		allTeams = allTeams.slice(0, allTeams.length / 2);

		// Step 4: Select 3 unique random teams
		const selectedTeams = [];

		if (country) {
			let countryLeague = newTeams.find((league) => league.country == country.name);
			if (countryLeague) {
				let availableTeams = allTeams.filter((team) => countryLeague.teams.includes(team));
				if (availableTeams.length > 0) {
					let selectedHome = availableTeams[Math.floor(Math.random() * availableTeams.length)];
					selectedTeams.push(selectedHome);
					allTeams = allTeams.filter((team) => team.name != selectedHome.name);
				}
			}
		}

		const usedIndices = new Set();
		while (selectedTeams.length < 3) {
			const randomIndex = Math.floor(Math.random() * allTeams.length);
			if (!usedIndices.has(randomIndex)) {
				usedIndices.add(randomIndex);
				selectedTeams.push(allTeams[randomIndex]);
			}
		}

		// Step 5: Generate contracts and related values
		const updatedContracts = selectedTeams.map((team) => {
			// Determine position (20% chance of switch)
			let newPosition;
			if (currentPlayer.position.abbreviation !== "GO" && Math.random() < 0.2) {
				const relatedPositions = currentPlayer.position.related;
				newPosition = relatedPositions[RandomNumber(0, relatedPositions.length - 1)];
			} else {
				newPosition = currentPlayer.position.abbreviation;
			}

			// Contract duration
			const contractDuration = RandomNumber(2, 8);

			// Contract wage
			const contractValue = GetWage(
				currentPlayer.performance,
				posValue,
				currentPlayer.age,
				team.power,
				currentPlayer.fame
			);

			// Transfer value
			const transferValue = Math.round(
				posValue *
					GetTransferValue(
						currentPlayer.performance,
						currentPlayer.position.value,
						currentPlayer.age,
						team.power,
						currentPlayer.fame,
						currentPlayer.potential
					)
			);

			// Return structured contract
			return {
				team: team,
				contract: {
					value: contractValue,
					duration: contractDuration,
				},
				transferValue: transferValue,
				loan: false,
				position: newPosition,
			};
		});

		return updatedContracts;
	}

	function GetNewNation() {
		let newNat = DeepClone(Nations);
		let allNat = [];
		for (let i = 0; i < newNat.length; i++) {
			allNat = allNat.concat(newNat[i].teams);
		}
		allNat = shuffleArray(allNat);

		return allNat;
	}

	function GetWage(performance, positionMultiplier, age, teamPower, fame) {
		// Base wage (adjust based on currency/league standards)
		const baseWage = 100000; // Example: €10,000/week

		// Performance multiplier (0.5x to 1.5x)
		const performanceMultiplier = 1.0 + performance * 0.2;

		// Age curve: Peaks at age 27 (1.0x), declines after 30
		const ageFactor = 20.0 - Math.abs(age - 28);

		// Club power multiplier (1.0x to 2.0x)
		const clubMultiplier = teamPower / 5; // ClubPower=10 → 2.0x

		// Fame multiplier (2x to 22x)
		const fameMultiplier = (100 + fame) / 50; // Fame=1000 → 20x

		// Final wage calculation
		const wage =
			baseWage *
			performanceMultiplier *
			positionMultiplier *
			ageFactor *
			clubMultiplier *
			fameMultiplier;

		return Math.round(wage);
	}

	function GetTransferValue(performance, positionMultiplier, age, clubPower, fame, potential) {
		// Base value (adjust based on league standards)
		const baseValue = 1000000; // Example: €1,000,000

		// Performance multiplier (0.5x to 1.5x)
		const performanceMultiplier = 1.0 + performance * 0.1;

		// Age curve: Younger players have higher value (peaks at 22)
		const ageFactor = Math.max(0.5, 20.0 - 1.5 * (age - 24));

		// Club power multiplier (1.0x to 2.0x)
		const clubMultiplier = clubPower / 5; // ClubPower=10 → 2.0x

		// Fame multiplier (0.5x to 5x)
		const fameMultiplier = (100 + fame) / 200; // Fame=1000 → 5x

		const potentialMultiplier = (potential * potential) / 10;

		// Final transfer value calculation
		const transferValue =
			baseValue *
			performanceMultiplier *
			positionMultiplier *
			ageFactor *
			clubMultiplier *
			fameMultiplier *
			potentialMultiplier;

		return Math.round(transferValue);
	}

	function Retire() {
		document.getElementById("team-choice").style.display = "none";
		document.getElementById("continue").style.display = "none";
		document.getElementById("chart").style.display = "flex";
	}

	function UpdateTeamsStats(limit) {
		let newTeams = DeepClone([...leagues]);
		let gains = [];
		let losses = [];

		for (let leagueID = 0; leagueID < newTeams.length; leagueID++) {
			let last = Math.random();
			let teamIndices = Array.from(
				{ length: newTeams[leagueID].teams.length },
				(_, index) => index
			);
			teamIndices = shuffleArray(teamIndices);

			for (let i = 0; i < newTeams[leagueID].teams.length; i++) {
				let teamID = teamIndices[i];
				let team = newTeams[leagueID].teams[teamID];

				let current = Math.random();
				let change = Math.round(limit * (last - current)) / 100.0;
				last = current;

				let newPower = team.power + change;
				let originalPower = team.power;
				team.power = Math.round(100.0 * newPower) / 100;

				if (team.power > 10) team.power = 10;
				else if (team.power < 2) team.power = 2;

				let powerChange = team.power - originalPower;
				if (powerChange > 0) {
					gains.push({ team: team.name, change: powerChange });
				} else if (powerChange < 0) {
					losses.push({ team: team.name, change: powerChange });
				}
			}

			newTeams[leagueID].teams.sort((a, b) => {
				return b.power - a.power;
			});
		}

		gains.sort((a, b) => b.change - a.change);
		losses.sort((a, b) => a.change - b.change);

		let topGains = gains.slice(0, 10);
		let topLosses = losses.slice(0, 10);

		setLeagues(newTeams);
		return { newTeams, topGains, topLosses };
	}

	function UpdateExtraTeamsStats() {
		let newTeams = DeepClone([...extrateams]);
		let last = Math.random();
		let teamIndices = Array.from({ length: newTeams.length }, (_, index) => index);
		teamIndices = shuffleArray(teamIndices);

		for (let i = 0; i < newTeams.length; i++) {
			let teamID = teamIndices[i];

			let current = Math.random();
			let change = Math.round(20.0 * (last - current)) / 100.0;
			last = current;

			let newPower = newTeams[teamID].power + change;
			newTeams[teamID].power = Math.round(100.0 * newPower) / 100.0;

			if (newTeams[teamID].power > 10) newTeams[teamID].power = 10;
			else if (newTeams[teamID].power < 2) newTeams[teamID].power = 2;
		}

		newTeams.sort((a, b) => {
			return b.power - a.power;
		});
		setExtraTeams(newTeams);
		return newTeams;
	}

	function UpdateNationsStats() {
		let allNations = DeepClone([...nations]);
		let gains = [];
		let losses = [];

		for (let leagueID = 0; leagueID < allNations.length; leagueID++) {
			let last = Math.random();
			let nationIndices = Array.from(
				{ length: allNations[leagueID].teams.length },
				(_, index) => index
			);
			nationIndices = shuffleArray(nationIndices);

			for (let i = 0; i < allNations[leagueID].teams.length; i++) {
				let nationID = nationIndices[i];
				let nation = allNations[leagueID].teams[nationID];

				let current = Math.random();
				let change = Math.round(40.0 * (last - current)) / 100.0;
				last = current;

				let newPower = nation.power + change;

				nation.power = Math.round(100.0 * newPower) / 100.0;

				if (nation.power > 10) nation.power = 10;
				else if (nation.power < 2) nation.power = 2;

				let powerChange = nation.power - (newPower - change);
				if (powerChange > 0) {
					gains.push({ nation: nation.name, change: powerChange });
				} else if (powerChange < 0) {
					losses.push({ nation: nation.name, change: powerChange });
				}
			}

			allNations[leagueID].teams.sort((a, b) => {
				return b.power - a.power;
			});
		}

		gains.sort((a, b) => b.change - a.change);
		losses.sort((a, b) => a.change - b.change);

		let topGains = gains.slice(0, 10);
		let topLosses = losses.slice(0, 10);

		setNations(allNations);
		return { allNations, topGains, topLosses };
	}

	return (
		<>
			<header>
				<h1>Football Career Simulator</h1>
				<h3 style={{ marginTop: "1rem" }}>Como Jogar</h3>
				<ol style={{ marginLeft: "2rem" }}>
					<li>Escolha seus dados iniciais.</li>
					<li>Escolha qual proposta você aceitará.</li>
					<li>O jogo simulará a partir do que você escolheu</li>
					<li>Boa sorte e divirta-se</li>
				</ol>
			</header>
			<main>
				<section
					className="career"
					ref={parentRef}>
					{seasons.map((s, index) => (
						<div
							key={index}
							className="season-container">
							<Season
								season={s}
								open={index >= seasons.length - 1}
							/>
						</div>
					))}
				</section>
				<section
					className="choices"
					id="init-nation">
					<select
						id="continent-dropdown"
						onChange={() => updateNationDropdown()}>
						<option value="">Selecione uma Confederação</option>
						<option value="AFC">Ásia e Oceania</option>
						<option value="CAF">África</option>
						<option value="CONCACAF">América do Norte</option>
						<option value="CONMEBOL">América do Sul</option>
						<option value="UEFA">Europa</option>
					</select>
					<select id="nation-dropdown">
						<option value="">Selecione uma Nação</option>
					</select>
					<a
						className="confirm-button"
						onClick={() => ChooseNation()}>
						Confirmar
					</a>
				</section>
				<section
					className="choices"
					id="init-pos"
					style={{ display: "none" }}>
					<h3 style={{ marginBottom: "1rem" }}>Escolha a posição do jogador:</h3>
					<select id="position-select">
						{Positions.map((position, index) => (
							<option
								key={index}
								value={position.title}>
								{position.title}
							</option>
						))}
					</select>
					<a
						className="confirm-button"
						onClick={() => ChoosePos()}>
						Confirmar
					</a>
				</section>
				<section
					className="choices"
					id="team-choice"
					style={{ display: "none" }}>
					<a
						className="d-stay contract"
						id="decision-stay"
						style={{ display: "none" }}
						onClick={() => ChooseTeam()}>
						<p>
							{player.team === null ? "null" : player.team.name} (
							{player.team === null ? "null" : (player.team.power / 2).toFixed(2)})
						</p>
						<div className="contract-info">
							<div>${FormatarNumero(renew.value)} 💰</div>
							<div>
								{renew.duration}
								{renew.addition != null && renew.addition > 0 ? ` + ${renew.addition}` : ""} 🕗
							</div>
							<div>{renew.position} 👕</div>
						</div>
					</a>
					<a
						className="d-alert contract"
						id="decision-transfer1"
						onClick={() => ChooseTeam(transfers[0])}>
						{transfers[0] ? (
							<>
								{transfers[0].loan ? <div>Empréstimo</div> : ""}
								<p>
									{transfers[0].team.name} ({(transfers[0].team.power / 2).toFixed(2)})
								</p>
								<div className="contract-info">
									<div>${FormatarNumero(transfers[0].contract.value)} 💰</div>
									<div>{transfers[0].contract.duration} 🕗</div>
									<div>{transfers[0].position} 👕</div>
								</div>
							</>
						) : (
							<p>null</p>
						)}
					</a>
					<a
						className="d-alert contract"
						id="decision-transfer2"
						onClick={() => ChooseTeam(transfers[1])}>
						{transfers[1] ? (
							<>
								{transfers[1].loan ? <div>Empréstimo</div> : ""}
								<p>
									{transfers[1].team.name} ({(transfers[1].team.power / 2).toFixed(2)})
								</p>
								<div className="contract-info">
									<div>${FormatarNumero(transfers[1].contract.value)} 💰</div>
									<div>{transfers[1].contract.duration} 🕗</div>
									<div>{transfers[1].position} 👕</div>
								</div>
							</>
						) : (
							<p>null</p>
						)}
					</a>
					<a
						className="d-alert contract"
						id="decision-transfer3"
						onClick={() => ChooseTeam(transfers[2])}>
						{transfers[2] ? (
							<>
								{transfers[2].loan ? <div>Empréstimo</div> : ""}
								<p>
									{transfers[2].team.name} ({(transfers[2].team.power / 2).toFixed(2)})
								</p>
								<div className="contract-info">
									<div>${FormatarNumero(transfers[2].contract.value)} 💰</div>
									<div>{transfers[2].contract.duration} 🕗</div>
									<div>{transfers[2].position} 👕</div>
								</div>
							</>
						) : (
							<p>null</p>
						)}
					</a>
					<a
						className="d-alert"
						id="retire"
						style={{ display: "none" }}
						onClick={() => Retire()}>
						Aposentar-se
					</a>
				</section>
				<section
					className="choices"
					id="continue"
					style={{ display: "none" }}>
					<a
						className="d-stay"
						onClick={() => Continue()}>
						Simular ({contract} {contract > 1 ? "anos restantes" : "ano restante"})
					</a>
				</section>
				<section
					className="chart"
					id="chart"
					style={{ display: "none" }}>
					<ChartComponent data={seasons} />
				</section>
				<section className="stats">
					<h1>Carreira</h1>
					<div className="stats-div">
						Fama: {StarPath[Math.min(Math.floor(player.fame / 100), StarPath.length - 1)]}
						<div
							style={{
								position: "relative", // This ensures absolute positioning works inside it
								width: "100%",
								height: "1rem",
								backgroundColor: "var(--color-medium)",
							}}>
							<div
								style={{
									width: `${player.fame < 1000 ? Math.floor(player.fame) % 100 : 100}%`,
									minHeight: "1rem",
									backgroundColor: `${player.fame < 1000 ? "var(--color-contrast)" : "gold"}`,
									margin: "0",
								}}
							/>

							<span
								style={{
									position: "absolute", // Use absolute for easier centering
									top: "50%", // Center vertically
									left: "50%", // Center horizontally
									transform: "translate(-50%, -50%)", // This will center perfectly
									color: "var(--color-dark)",
								}}>
								{Math.floor(player.fame)}
							</span>
						</div>
						<p>Posição: {player.position === null ? "A definir" : player.position.title}</p>
						<p>Seleção: {player.nation === null ? "A definir" : player.nation.name}</p>
					</div>
					<div className="stats-div">
						<div className="stats-div-div">
							<details>
								<summary>Continental: {player.continentalChampionship.length}</summary>
								<div>
									{player.continentalChampionship.map((wc) => (
										<p key={wc}>{wc}</p>
									))}
								</div>
							</details>
							<details>
								<summary>Copa do Mundo: {player.worldCup.length}</summary>
								<div>
									{player.worldCup.map((wc) => (
										<p key={wc}>{wc}</p>
									))}
								</div>
							</details>
						</div>
					</div>
					<div className="stats-div">
						<p>Gols: {player.totalGoals}</p>
						<p>Assistências: {player.totalAssists}</p>
					</div>
					<div className="stats-div">
						<div className="stats-div-div">
							<details>
								<summary className="titles-title">Ligas: {player.leagueTitles.length}</summary>
								<div>
									{player.leagueTitles.map((l) => (
										<p key={l}>{l}</p>
									))}
								</div>
							</details>
							<details>
								<summary>Copas Nacionais: {player.nationalCup.length}</summary>
								<div>
									{player.nationalCup.map((nc) => (
										<p key={nc}>{nc}</p>
									))}
								</div>
							</details>
							<details>
								<summary>Champions League: {player.champions.length}</summary>
								<div>
									{player.champions.map((ch) => (
										<p key={ch}>{ch}</p>
									))}
								</div>
							</details>
							<details>
								<summary>Europa League: {player.europa.length}</summary>
								<div>
									{player.europa.map((el) => (
										<p key={el}>{el}</p>
									))}
								</div>
							</details>
							<details>
								<summary>Premiações: {player.awards.length}</summary>
								<div>
									{player.awards.map((a) => (
										<p key={a}>{a}</p>
									))}
								</div>
							</details>
							<details>
								<summary>Jogador da Temporada: {player.playerOfTheSeason.length}</summary>
								<div>
									{player.playerOfTheSeason.map((b) => (
										<p key={b}>{b}</p>
									))}
								</div>
							</details>
						</div>
					</div>
				</section>
			</main>
			<footer>
				<p>Por Gustavo Amamia Kumagai</p>
			</footer>
		</>
	);
}

export default App;
