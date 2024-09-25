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
    overall: null,
    performance: null,
    awardPoints: null,
    leagueTable: null,
    fame: null,
    marketValue: null,
  });

  const [player, setPlayer] = useState({
    potential: RandomNumber(0, 10) + RandomNumber(0, 10),
    age: 17,
    nation: null,
    team: null,
    contractTeam: null,
    position: null,
    positionInClub: null,
    wage: 1,
    overall: 70,
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
    ballonDor: [],
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

  const [renew, setRenew] = useState({ value: 0, duration: 0, salaryAdjustment: 0 });

  function ChooseNation() {
    const continentDropdown = document.getElementById("continent-dropdown");
    const nationDropdown = document.getElementById("nation-dropdown");

    // Find the selected continent
    const selectedContinent = nations.find((continent) => continent.name === continentDropdown.value);
    
    // Find the selected nation within the chosen continent
    const selectedNation = selectedContinent ? selectedContinent.teams.find((nation) => nation.name === nationDropdown.value) : null;

    // Check if both the continent and nation are selected
    if (selectedContinent && selectedNation) {
        // Change display
        document.getElementById("init-pos").style.display = "flex";
        document.getElementById("init-nation").style.display = "none";

        // Create a new player object with the selected nation
        let newPlayer = { ...player };  // Assuming 'player' is defined in your scope
        newPlayer.nation = selectedNation;

        // Set the player with the new nation
        setPlayer(newPlayer);
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
    const continentData = nations.find(cont => cont.name === selectedContinent);
    if (continentData) {
      continentData.teams.forEach(team => {
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
    const selectedPosition = Positions.find((position) => position.title == positionDropdown.value)

    // Change display
    document.getElementById("team-choice").style.display = "flex";
    document.getElementById("init-pos").style.display = "none";
  
    let newPlayer = { ...player }; // Clone the player object
    newPlayer.position = selectedPosition; // Assign the selected position
  
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
    setPlayer(newPlayer); // Update the player state
    setTransfers(GetInitTeams(selectedPosition.value, newTeams, newPlayer)); // Use selectedPosition
  }  

  function ChooseTeam(newTeam = null) {
    //change display
    document.getElementById("team-choice").style.display = "none";
    document.getElementById("continue").style.display = "flex";

    //load
    let newPlayer = player;
    newPlayer.age++;
    let newGeneralPerformance = generalPerformance;
    let newHistory = history;
    let newContract = contract - 1;

    newHistory = newHistory.filter((item) => year - item.year <= 8);

    if (newTeam != null) {
      // Se houver mudança de time
      newHistory.push({ team: newTeam.team.name, year: year + newTeam.contract.duration });

      // Verifica se o jogador foi emprestado para o novo time
      if (newTeam.loan) {
        // Atualiza os detalhes do contrato do jogador se ele estiver emprestado
        newPlayer.contractTeam = {
          team: newPlayer.team,
          contract: {
            value: newTeam.contract.value,
            duration: newContract - newTeam.contract.duration,
          },
          transferValue: newTeam.transferValue,
          position: newPlayer.positionInClub.abbreviation,
          loan: false,
        };
      }

      newGeneralPerformance = [];
      newPlayer.team = newTeam.team;
      newContract = newTeam.contract.duration;
      newPlayer.marketValue = newTeam.transferValue;
      newPlayer.wage = newTeam.contract.value;
      newPlayer.positionInClub = Positions.find(position => position.abbreviation === newTeam.position);

      let lp = 99; // Inicializa o valor padrão de "lp"

      let newLeagueResults =
        lastLeagueResults.find((league) => league.name === newPlayer.team.league) || [];
      lp = newLeagueResults.result.table.findIndex((team) => team.name == newPlayer.team.name) + 1;

      // Verifica se o jogador se classificou no ano passado
      if (lp <= newLeagueResults.championsSpots) {
        // Para os campeões
        newPlayer.championsQualification = true;
        newPlayer.europaQualification = false;
        newPlayer.lastLeaguePosition = lp;
      } else if (lp <= newLeagueResults.championsSpots + newLeagueResults.europaSpots) {
        // Para a Liga Europa
        newPlayer.championsQualification = false;
        newPlayer.europaQualification = true;
      } else {
        // Não foi classificado
        newPlayer.championsQualification = false;
        newPlayer.europaQualification = false;
      }
    } else if (newContract <= 0) {
      // Renovação do contrato
      newContract = renew.duration; // Nova duração do contrato
      newPlayer.wage = renew.value; // Novo valor do contrato
      newHistory.push({ team: newPlayer.team.name, year: year + renew.duration });
      newPlayer.positionInClub = Positions.find(position => position.abbreviation === renew.position);
    } else {
      newPlayer.wage = newPlayer.wage * (1.1 + newPlayer.performance / 10); // Reajuste
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
    if (!top10.some((t) => t.name === newPlayer.team.name)) {
      const playerTeam = allTeams.find((t) => t.name === newPlayer.team.name);
      const playerRanking = allTeams.findIndex((t) => t.name === newPlayer.team.name) + 1;
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
    if (!topNations.some((t) => t.name === newPlayer.nation.name)) {
      const playerTeam = allNations.find((t) => t.name === newPlayer.nation.name);
      const playerRanking = allNations.findIndex((t) => t.name === newPlayer.nation.name) + 1;
      if (playerTeam) {
        topNations.push({
          ...playerTeam,
          rank: playerRanking,
        });
      }
    }

    newPlayer.team = allTeams.find((t) => t.name == newPlayer.team.name); //find player's team by name and update
    newPlayer.nation = allNations.find((n) => n.name == newPlayer.nation.name); //find player's nation by name and update

    // Filtra os valores de transferValue que são números
    const transferValues = transfers.map((transfer) => transfer?.transferValue);
    const validTransferValues = transferValues.filter(
      (value) => typeof value === "number" && !isNaN(value)
    );

    if (validTransferValues.length > 0) {
      // Calcula o maior valor de transferValue
      newPlayer.marketValue = Math.max(...validTransferValues);
    }

    //calcule the player's performance
    newPlayer.performance = Math.round(100.0 * (Math.random() - Math.random())) / 100.0;

    newPlayer.overall =
      GetOverall(newPlayer.potential, newPlayer.age, newPlayer.team.power) +
      newPlayer.performance * 2;

    //set performance over team
    newGeneralPerformance.push(newPlayer.performance);
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
        ((newPlayer.overall - (70 + newPlayer.team.power)) * 8 + r + newPlayer.performance * 10) / 2
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
      age: newPlayer.age,
      positionInClub: newPlayer.positionInClub,
      team: DeepClone(newPlayer.team),
      nation: DeepClone(newPlayer.nation),
      wage: newPlayer.wage,
      starting: starting,
      titles: [],
      goals: 0,
      assists: 0,
      overall: newPlayer.overall,
      performance: newPlayer.performance,
      awardPoints: 0,
      leagueTable: [],
      fame: newPlayer.fame,
      marketValue: newPlayer.marketValue,
    };

    //save
    setCurrentSeason(newSeason);
    setYear(year + 1);
    setContract(newContract);
    setPlayer(newPlayer);
    setGeneralPerformance(newGeneralPerformance);
    setHistory(newHistory);
  }

  function Continue() {
    //change display
    document.getElementById("team-choice").style.display = "flex";
    document.getElementById("continue").style.display = "none";

    //load
    let newPlayer = player;
    let newSeason = currentSeason;

    //randomize how many goals/assists did they score

    let goalsOpportunities = 0;
    let assistsOpportunities = 0;
    newSeason.awardPoints = newSeason.performance * 2; //min = -2.0 | max = 2.0

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
      return leagueResult;
    });

    let playerLeagueResult = leagueResults.find((league) => league.name === newPlayer.team.league);

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
      playerLeagueResult.result.table.findIndex((team) => team.name == newPlayer.team.name) + 1;
    newSeason.awardPoints +=
      ((playerLeagueResult.championsSpots / 4.0) * (5 - playerPosition)) / 2.0; //max = 2.0
    newSeason.titles.push([`Liga: ${playerPosition}º lugar`].concat(leaguesTopEight));
    newPlayer.fame += Math.floor((playerLeagueResult.championsSpots * (6 - playerPosition)) / 2.0);

    goalsOpportunities += (21 - playerPosition);
    assistsOpportunities += (21 - playerPosition);

    //if fist place, then won trophy
    if (playerPosition == 1) {
      newPlayer.leagueTitles.push(`${year} (${newPlayer.team.name})`);
      triplice++;
    }

    let nationalCupDescription = [];
    let end = false;
    let phase = 2;
    let playerPhase = 2;

    let league = leagues.find((league) => league.name === newPlayer.team.league);

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
        if (team1.name == newPlayer.team.name || team2.name == newPlayer.team.name) {
          playerOpp = `: ${team1.name == newPlayer.team.name ? team2.name : team1.name}`;
          // Verificando se o jogador ganhou o jogo
          if (
            (game.result && team1.name == newPlayer.team.name) ||
            (!game.result && team2.name == newPlayer.team.name)
          ) {
            // Incrementando a fase do jogador e concedendo pontos e prêmios adicionais
            playerPhase++;
            goalsOpportunities += Math.random();
            assistsOpportunities += Math.random();
            newSeason.awardPoints += 0.4; // Máximo 0.4 x 5 = 2.0
            newPlayer.fame += 2; // Copa Nacional Máximo 2 x 5 = 10
            if (playerPhase >= TournamentPath.length - 1) {
              // Se o jogador venceu o torneio, conceder prêmios adicionais
              newPlayer.nationalCup.push(`${year} (${newPlayer.team.name})`);
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

    newSeason.titles.push(
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
      newPlayer.championsQualification ? newPlayer.team : null
    );

    const playerChampionsPos =
      championsGroup.table.findIndex((team) => team.name == newPlayer.team.name) + 1;

    if(playerChampionsPos > 0) {
      goalsOpportunities += (36 - playerChampionsPos) / 10;
      assistsOpportunities += (36 - playerChampionsPos) / 10;
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
    if (playoffsClassif.some((t) => t.name == newPlayer.team.name)) {
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

      if (team1.name == newPlayer.team.name || team2.name == newPlayer.team.name) {
        playerOpp = `: ${team1.name == newPlayer.team.name ? team2.name : team1.name}`;
      }

      games += `--> ${game.game}`;

      if (game.result) {
        classifToKnockout.push(team1);
      } else {
        classifToKnockout.push(team2);
      }
    }

    championsDescription.push(`${TournamentPath[phase]}${playerOpp}${games}`);

    if (classifToKnockout.some((t) => t.name == newPlayer.team.name)) {
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
        if (team1.name == newPlayer.team.name || team2.name == newPlayer.team.name) {
          playerOpp = `: ${team1.name == newPlayer.team.name ? team2.name : team1.name}`;
          // Verificar se o jogador ganhou o jogo
          if (
            (game.result && team1.name == newPlayer.team.name) ||
            (!game.result && team2.name == newPlayer.team.name)
          ) {
            // Incrementar a fase do jogador e conceder pontos e prêmios adicionais
            playerPhase++;
            goalsOpportunities += Math.random();
            assistsOpportunities += Math.random();
            newSeason.awardPoints += 0.6; // Máximo 0.6 x 5 = 3.0
            newPlayer.fame += 4; // Champions Máximo 4 x 5 = 20
            if (playerPhase >= TournamentPath.length - 1) {
              // Se o jogador vencer o torneio, conceder prêmios adicionais
              newPlayer.champions.push(`${year} (${newPlayer.team.name})`);
              newPlayer.fame += 20; // Máximo 4 x 5 + 20 = 40
              if (year % 4 != 2) newSeason.awardPoints += 1.0; // Máximo 0.6 x 5 + 1.0 = 4.0
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
        end = true;
      }
    }

    let playerChampionsResult = newPlayer.championsQualification
      ? `: ${TournamentPath[playerPhase]}`
      : "";
    newSeason.titles.push(
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

    let group = GetEuropaPosition(qualified, newPlayer.europaQualification ? newPlayer.team : null);

    const playerEuropaPosition =
      group.table.findIndex((team) => team.name == newPlayer.team.name) + 1;

      if(playerEuropaPosition > 0) {
        goalsOpportunities += (32 - playerChampionsPos) / 10;
        assistsOpportunities += (32 - playerChampionsPos) / 10;
      }

    europaLeagueDescription.push(
      `${TournamentPath[playerPhase]}${
        playerEuropaPosition > 0 ? `: ${playerEuropaPosition}º lugar` : ""
      }${group.desc}`
    );

    let classif = DeepClone([...group.table]).splice(0, 16);

    if (classif.some((t) => t.name == newPlayer.team.name)) {
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
        if (team1.name == newPlayer.team.name || team2.name == newPlayer.team.name) {
          playerOpp = `: ${team1.name == newPlayer.team.name ? team2.name : team1.name}`;
          // Verificar se o jogador ganhou o jogo
          if (
            (game.result && team1.name == newPlayer.team.name) ||
            (!game.result && team2.name == newPlayer.team.name)
          ) {
            // Incrementar a fase do jogador e, se vencer o torneio, adicionar à sua lista de realizações
            playerPhase++;
            goalsOpportunities += Math.random();
            assistsOpportunities += Math.random();
            newPlayer.fame += 4; // Europa League Máximo 4 x 4 = 16
            if (playerPhase >= TournamentPath.length - 1) {
              newPlayer.europa.push(`${year} (${newPlayer.team.name})`);
            }
            newPlayer.fame += 4; // Europa League Máximo 4 x 4 + 4 = 20
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
      }
    }

    let playerEuropaResult = newPlayer.europaQualification
      ? `: ${TournamentPath[playerPhase]}`
      : "";

    newSeason.titles.push([`Europa League${playerEuropaResult}`].concat(europaLeagueDescription));

    if (year % 4 == 0) {
      newSeason.awardPoints -= 2.0;
      let playedContinental =
        newPlayer.overall > 75 + newPlayer.nation.power || (med > 0 && newSeason.performance > 0.5);

      // EUROCOPA
      phase = 0;
      playerPhase = 0;
      let europeanDescription = [];

      let europeanTeams = DeepClone([...nations.find((n) => n.name === "UEFA").teams]);
      europeanTeams.splice(24);

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
          europeanGroups[groupID].some((t) => t.name == newPlayer.nation.name)
            ? newPlayer.nation
            : null
        );
        const playerPosition =
          thisGroup.table.findIndex((team) => team.name == newPlayer.nation.name) + 1;

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

      if (player.nation.continent != "UEFA") europeanDescription.push("Grupos-->Sem Dados");

      thirdPlaces.sort((a, b) => {
        return (
          thirdPlacesPoints[thirdPlaces.indexOf(b)] - thirdPlacesPoints[thirdPlaces.indexOf(a)]
        );
      });

      // Combinar os primeiros, segundos e terceiros colocados de todos os grupos e os oito primeiros terceiros colocados
      let classif = firstPlaces.concat(secondPlaces, thirdPlaces.slice(0, 4));
      phase += 2;

      if (classif.some((t) => t.name == newPlayer.nation.name)) {
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

          if (team1.name == player.nation.name || team2.name == player.nation.name) {
            playerOpp = `: ${team1.name == player.nation.name ? team2.name : team1.name}`;
          }

          // Verificar se o jogador está envolvido no jogo atual
          if (team1.name == player.nation.name || team2.name == player.nation.name) {
            // Verificar se o jogador ganhou o jogo
            if (
              (game.result && team1.name == player.nation.name) ||
              (!game.result && team2.name == player.nation.name)
            ) {
              playerPhase++;
              goalsOpportunities += Math.random();
              assistsOpportunities += Math.random();
              // Verificar se o jogador ganhou a Copa do Mundo e conceder prêmios adicionais
              if (playedContinental) {
                newSeason.awardPoints += 0.4; // Máximo 0.4 x 4 = 1.6
                newPlayer.fame += 4; // Copa Máximo 4 x 4 = 16
                if (playerPhase >= TournamentPath.length - 1) {
                  newPlayer.continentalChampionship.push(`${year}`);
                  newSeason.awardPoints += 0.4; // Máximo 0.4 x 4 + 0.4 = 2.0
                  newPlayer.fame += 4; // Máximo 4 x 4 + 4 = 20
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
        }
      }

      let playerEuropeanDesc = "";

      if (player.nation.continent == "UEFA") {
        playerEuropeanDesc = `: ${TournamentPath[playerPhase]} ${
          playedContinental ? "" : " (Não Convocado)"
        }`;
      }

      newSeason.titles.push([`Eurocopa${playerEuropeanDesc}`].concat(europeanDescription));

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
          americanGroups[groupID].some((t) => t.name == newPlayer.nation.name)
            ? newPlayer.nation
            : null
        );
        const playerPosition =
          thisGroup.table.findIndex((team) => team.name == newPlayer.nation.name) + 1;

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

      if (player.nation.continent != "CONCACAF" && player.nation.continent != "CONMEBOL")
        americanDescription.push("Grupos-->Sem Dados");

      // Combinar os primeiros, segundos e terceiros colocados de todos os grupos e os oito primeiros terceiros colocados
      classif = firstPlaces.concat(secondPlaces);
      phase += 3;
      if (classif.some((t) => t.name == newPlayer.nation.name)) {
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

          if (team1.name == player.nation.name || team2.name == player.nation.name) {
            playerOpp = `: ${team1.name == player.nation.name ? team2.name : team1.name}`;
          }

          // Verificar se o jogador está envolvido no jogo atual
          if (team1.name == player.nation.name || team2.name == player.nation.name) {
            // Verificar se o jogador ganhou o jogo
            if (
              (game.result && team1.name == player.nation.name) ||
              (!game.result && team2.name == player.nation.name)
            ) {
              playerPhase++;
              goalsOpportunities += Math.random();
              assistsOpportunities += Math.random();
              // Verificar se o jogador ganhou a Copa do Mundo e conceder prêmios adicionais
              if (playedContinental) {
                newSeason.awardPoints += 0.5; // Máximo 0.5 x 3 = 1.5
                newPlayer.fame += 5; // Copa América Máximo 5 x 3 = 15
                if (playerPhase >= TournamentPath.length - 1) {
                  newPlayer.continentalChampionship.push(`${year}`);
                  newSeason.awardPoints += 0.5; // Máximo 0.5 x 3 + 0.5 = 2.0
                  newPlayer.fame += 5; // Máximo 5 x 3 + 5 = 20
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
        }
      }

      let playerAmericanDesc = "";

      if (player.nation.continent == "CONCACAF" || player.nation.continent == "CONMEBOL") {
        playerAmericanDesc = `: ${TournamentPath[playerPhase]} ${
          playedContinental ? "" : " (Não Convocado)"
        }`;
      }

      newSeason.titles.push([`Copa América${playerAmericanDesc}`].concat(americanDescription));

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
          africanGroups[groupID].some((t) => t.name == newPlayer.nation.name)
            ? newPlayer.nation
            : null
        );
        const playerPosition =
          thisGroup.table.findIndex((team) => team.name == newPlayer.nation.name) + 1;

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

      if (player.nation.continent != "CAF") africanDescription.push("Grupos-->Sem Dados");

      thirdPlaces.sort((a, b) => {
        return (
          thirdPlacesPoints[thirdPlaces.indexOf(b)] - thirdPlacesPoints[thirdPlaces.indexOf(a)]
        );
      });

      // Combinar os primeiros, segundos e terceiros colocados de todos os grupos e os oito primeiros terceiros colocados
      classif = firstPlaces.concat(secondPlaces, thirdPlaces.slice(0, 2));
      phase += 3;
      if (classif.some((t) => t.name == newPlayer.nation.name)) {
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

          if (team1.name == player.nation.name || team2.name == player.nation.name) {
            playerOpp = `: ${team1.name == player.nation.name ? team2.name : team1.name}`;
          }

          // Verificar se o jogador está envolvido no jogo atual
          if (team1.name == player.nation.name || team2.name == player.nation.name) {
            // Verificar se o jogador ganhou o jogo
            if (
              (game.result && team1.name == player.nation.name) ||
              (!game.result && team2.name == player.nation.name)
            ) {
              playerPhase++;
              goalsOpportunities += Math.random();
              assistsOpportunities += Math.random();
              // Verificar se o jogador ganhou a Copa do Mundo e conceder prêmios adicionais
              if (playedContinental) {
                newSeason.awardPoints += 0.5; // Máximo 0.5 x 3 = 1.5
                newPlayer.fame += 5; // Copa África Máximo 5 x 3 = 15
                if (playerPhase >= TournamentPath.length - 1) {
                  newPlayer.continentalChampionship.push(`${year}`);
                  newSeason.awardPoints += 0.5; // Máximo 0.5 x 3 + 0.5 = 2.0
                  newPlayer.fame += 5; // Máximo 5 x 3 + 5 = 20
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
        }
      }

      let playerAfricanDesc = "";

      if (player.nation.continent == "CAF") {
        playerAfricanDesc = `: ${TournamentPath[playerPhase]} ${
          playedContinental ? "" : " (Não Convocado)"
        }`;
      }

      newSeason.titles.push([`Copa da África${playerAfricanDesc}`].concat(africanDescription));

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
          asianGroups[groupID].some((t) => t.name == newPlayer.nation.name)
            ? newPlayer.nation
            : null
        );
        const playerPosition =
          thisGroup.table.findIndex((team) => team.name == newPlayer.nation.name) + 1;

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

      if (player.nation.continent != "AFC") asianDescription.push("Grupos-->Sem Dados");

      thirdPlaces.sort((a, b) => {
        return (
          thirdPlacesPoints[thirdPlaces.indexOf(b)] - thirdPlacesPoints[thirdPlaces.indexOf(a)]
        );
      });

      // Combinar os primeiros, segundos e terceiros colocados de todos os grupos e os oito primeiros terceiros colocados
      classif = firstPlaces.concat(secondPlaces, thirdPlaces.slice(0, 2));
      phase += 3;
      if (classif.some((t) => t.name == newPlayer.nation.name)) {
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

          if (team1.name == player.nation.name || team2.name == player.nation.name) {
            playerOpp = `: ${team1.name == player.nation.name ? team2.name : team1.name}`;
          }

          // Verificar se o jogador está envolvido no jogo atual
          if (team1.name == player.nation.name || team2.name == player.nation.name) {
            // Verificar se o jogador ganhou o jogo
            if (
              (game.result && team1.name == player.nation.name) ||
              (!game.result && team2.name == player.nation.name)
            ) {
              playerPhase++;
              goalsOpportunities += Math.random();
              assistsOpportunities += Math.random();
              // Verificar se o jogador ganhou a Copa do Mundo e conceder prêmios adicionais
              if (playedContinental) {
                newSeason.awardPoints += 0.5; // Máximo 0.5 x 3 = 1.5
                newPlayer.fame += 5; // Copa Ásia Máximo 5 x 3 = 15
                if (playerPhase >= TournamentPath.length - 1) {
                  newPlayer.continentalChampionship.push(`${year}`);
                  newSeason.awardPoints += 0.5; // Máximo 0.5 x 3 + 0.5 = 2.0
                  newPlayer.fame += 5; // Máximo 5 x 3 + 5 = 20
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
        }
      }

      let playerAsianDesc = "";

      if (player.nation.continent == "AFC") {
        playerAsianDesc = `: ${TournamentPath[playerPhase]} ${
          playedContinental ? "" : " (Não Convocado)"
        }`;
      }

      newSeason.titles.push([`Copa da Ásia${playerAsianDesc}`].concat(asianDescription));
    }

    //World Cup
    if (year % 4 == 2) {
      newSeason.awardPoints -= 3.0;
      phase = 0;
      playerPhase = 0;
      let worldCupDescription = [];
      let newWorldCupHistoryHosts = worldCupHistoryHosts;
      let currentHosts = newWorldCupHistoryHosts[newWorldCupHistoryHosts.length - 2];

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
      let classifToWorldCup = allClassifNations.some((t) => t.name == newPlayer.nation.name);

      if (!classifToWorldCup) worldCupDescription.push("Grupos-->Sem Dados");

      //was called by the manager
      let playedWorldCup =
        newPlayer.overall > 75 + newPlayer.nation.power ||
        (med > 0 && newPlayer.age <= 36 && newPlayer.age >= 24);

      //create four pots to the group draw
      let pots = Array.from({ length: 4 }, (_, potID) =>
        allClassifNations.slice(potID * 12, (potID + 1) * 12)
      );

      let groups = [[], [], [], [], [], [], [], [], [], [], [], []];

      for (let potID = 0; potID < pots.length; potID++) {
        for (let GroupID = 0; GroupID < 12; GroupID++) {
          let validNations = pots[potID].filter(
            (n) => !groups[GroupID].some((opp) => opp.continent == n.continent)
          );

          if (validNations.length > 0) {
            let randomIndex = RandomNumber(0, validNations.length - 1);
            groups[GroupID].push(validNations[randomIndex]);

            pots[potID] = pots[potID].filter((n) => validNations[randomIndex] != n);
          } else {
            //if there is no other nation available, try repeating Europe
            validNations = pots[potID].filter((n) => n.continent == "UEFA");
            if (validNations.length > 0) {
              let randomIndex = RandomNumber(0, validNations.length - 1);
              groups[GroupID].push(validNations[randomIndex]);
              pots[potID] = pots[potID].filter((n) => validNations[randomIndex] != n);
            } else {
              validNations = pots[potID];
              if (validNations.length > 0) {
                let randomIndex = RandomNumber(0, validNations.length - 1);
                groups[GroupID].push(validNations[randomIndex]);
                pots[potID] = pots[potID].filter((n) => validNations[randomIndex] != n);
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
          groups[groupID].some((t) => t.name == newPlayer.nation.name) ? newPlayer.nation : null
        );
        const playerPosition =
          thisGroup.table.findIndex((team) => team.name == newPlayer.nation.name) + 1;

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
      if (classif.some((t) => t.name == newPlayer.nation.name)) {
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

          if (team1.name == player.nation.name || team2.name == player.nation.name) {
            playerOpp = `: ${team1.name == player.nation.name ? team2.name : team1.name}`;
          }

          // Verificar se o jogador está envolvido no jogo atual
          if (team1.name == player.nation.name || team2.name == player.nation.name) {
            // Verificar se o jogador ganhou o jogo
            if (
              (game.result && team1.name == player.nation.name) ||
              (!game.result && team2.name == player.nation.name)
            ) {
              playerPhase++;
              goalsOpportunities += Math.random();
              assistsOpportunities += Math.random();
              // Verificar se o jogador ganhou a Copa do Mundo e conceder prêmios adicionais
              if (playedWorldCup) {
                newSeason.awardPoints += 0.8; // Máximo 0.8 x 5 = 4.0
                newPlayer.fame += 6; // Máximo 6 x 5 = 30
                if (playerPhase >= TournamentPath.length - 1) {
                  newPlayer.worldCup.push(`${year}`);
                  newPlayer.fame += 30; // Máximo 6 x 5 + 30 = 60
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
        }
      }

      let playerWorldCupDesc = "";

      if (classifToWorldCup) {
        playerWorldCupDesc = `: ${TournamentPath[playerPhase]} ${
          playedWorldCup ? "" : " (Não Convocado)"
        }`;
      }

      newSeason.titles.push([`Copa do Mundo${playerWorldCupDesc}`].concat(worldCupDescription));

      //select the next host
      let allNations = [];
      for (let regionID = 0; regionID < nations.length; regionID++) {
        allNations = allNations.concat([...nations[regionID].teams]);
      }

      let countriesHosts = newWorldCupHistoryHosts.flatMap((wc) => wc);
      let currentMainHost = allNations.filter((n) => n.name == currentHosts[0])[0];
      let lastMainHost = allNations.filter(
        (n) => n.name == newWorldCupHistoryHosts[newWorldCupHistoryHosts.length - 1][0]
      )[0];

      let validTeams = allNations
        .filter((team) => !countriesHosts.includes(team.name))
        .filter((team) => {
          const distance = calculateDistance(
            currentMainHost.latitude,
            currentMainHost.longitude,
            team.latitude,
            team.longitude
          );
          const distance2 = calculateDistance(
            lastMainHost.latitude,
            lastMainHost.longitude,
            team.latitude,
            team.longitude
          );

          return distance >= 5000 && distance2 >= 2500;
        });

      let chosenHosts = [];

      let chosenID = RandomNumber(0, validTeams.length - 1);
      let mainHost = validTeams[chosenID];
      chosenHosts.push(mainHost);

      // Verifica quais estão próximos
      validTeams = allNations
        .filter((team) => {
          const distance = calculateDistance(
            mainHost.latitude,
            mainHost.longitude,
            team.latitude,
            team.longitude
          );
          let maxDist = 200 + (mainHost.distance + team.distance) / 2;
          return distance <= maxDist;
        })
        .filter((n) => !countriesHosts.includes(n.name) && n.name != mainHost.name)
        .sort((a, b) => {
          let bDist = calculateDistance(
            mainHost.latitude,
            mainHost.longitude,
            b.latitude,
            b.longitude
          );
          let aDist = calculateDistance(
            mainHost.latitude,
            mainHost.longitude,
            a.latitude,
            a.longitude
          );
          return aDist - bDist;
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

      newWorldCupHistoryHosts.push(chosenHosts.map((t) => t.name));
      newWorldCupHistoryHosts.shift();

      setWorldCupHistoryHosts(newWorldCupHistoryHosts);
    }

    let performanceMultiplier = Math.pow(newPlayer.overall, 2) / 8000.0; //adds from 0 to 1.0
    performanceMultiplier *= (25 + newSeason.starting) / 125.0; //multiply from 0.2 to 1.00
    performanceMultiplier *= 1.0 + newSeason.performance / 2; //multiply from 0.5 to 1.5

    newSeason.goals = Math.floor(
      newPlayer.positionInClub.goalsMultiplier * performanceMultiplier * goalsOpportunities
    );

    newSeason.assists = Math.floor(
      newPlayer.positionInClub.assistsMultiplier * performanceMultiplier * assistsOpportunities
    );

    if(newSeason.goals < 0) newSeason.goals = 0;
    if(newSeason.assists < 0) newSeason.assists = 0;

    //add goals to the carrer summary
    newPlayer.totalGoals += newSeason.goals;
    newPlayer.totalAssists += newSeason.assists;

    //post season results
    if (RandomNumber(1, 1000) <= newSeason.goals / 4 - 1) {
      //Puskás
      newPlayer.awards.push(`Puskás ${year} (${newPlayer.team.name})`);
      newSeason.titles.push(["Puskás"]);
    }

    if (triplice >= 3) {
      newPlayer.awards.push(`Tríplice Coroa ${year} (${newPlayer.team.name})`);
      newSeason.titles.push(["Tríplice Coroa"]);
    }

    let awardScore = newSeason.awardPoints + newPlayer.overall;
    if (
      player.position.title == "Goleiro" &&
      awardScore >= 90 + (Math.random() + Math.random()) * 5 &&
      newSeason.performance >= 0.0
    ) {
      //Golden Gloves
      newPlayer.awards.push(`Luvas de Ouro ${year} (${newPlayer.team.name})`);
      newPlayer.fame += 40;
      newSeason.titles.push(["Luva de Ouro"]);
    }

    let goldenBootsGoals = 35 + RandomNumber(0, 5);
    goldenBootsGoals += (year % 4 == 2) ? 5 : 0;

    if (goldenBootsGoals <= newSeason.goals) {
      //Golden Shoes
      newPlayer.awards.push(`Chuteiras de Ouro ${year} (${newPlayer.team.name})`);
      newPlayer.fame += 40;
      newSeason.titles.push(["Chuteira de Ouro"]);
    }

    let position = -1;
    if (awardScore >= 99) {
      //Ballon D'or
      newPlayer.ballonDor.push(`Ballon D'or ${year} (${newPlayer.team.name})`);
      newPlayer.fame += 80;
      position = 1;
      newSeason.titles.push([`Ballon D'Or: 1º lugar`]);
    } else if (awardScore >= 90) {
      let pts = Math.floor(awardScore - 90);
      newPlayer.fame += pts * 2;
      position = 10 - pts;
      newSeason.titles.push([`Ballon D'Or: ${position}º lugar`]);
    }
    
    newPlayer.fame += newSeason.performance * 20;

    newPlayer.fame += newSeason.goals / 5.0;
    newPlayer.fame += newSeason.assists / 5.0;

    //setup next season
    if (playerPosition <= league.championsSpots) {
      newPlayer.championsQualification = true;
      newPlayer.europaQualification = false;
      newPlayer.lastLeaguePosition = playerPosition;
    } else if (playerPosition <= league.championsSpots + league.europaSpots) {
      newPlayer.championsQualification = false;
      newPlayer.europaQualification = true;
    } else {
      newPlayer.championsQualification = false;
      newPlayer.europaQualification = false;
    }

    if (newPlayer.fame < 0) newPlayer.fame = 0;

    newSeason.fame = newPlayer.fame;

    //trasnfer window
    let newTransfers = GetNewTeams(newPlayer);

    if (
      //if ended loan
      newPlayer.contractTeam != null &&
      contract <= 1
    ) {
      newTransfers = [newPlayer.contractTeam];

      if (med > 0) {
        let newPosition;
        if (newPlayer.position.abbreviation !== "GO" && Math.random() < 0.2) {
            let relatedPositions = newPlayer.position.related;
            newPosition = relatedPositions[RandomNumber(0, relatedPositions.length - 1)];
        } else {
            newPosition = newPlayer.position.abbreviation;
        }

        setRenew({
          value: newPlayer.contractTeam.contract.value,
          duration: newPlayer.contractTeam.contract.duration,
          position: newPosition
        });
        document.getElementById("decision-stay").style.display = "flex";
      } else {
        document.getElementById("decision-stay").style.display = "none";
      }

      newPlayer.contractTeam = null;

      document.getElementById("decision-transfer1").style.display = "flex";
      document.getElementById("decision-transfer2").style.display = "none";
      document.getElementById("decision-transfer3").style.display = "none";
      document.getElementById("retire").style.display = "none";
    } else if (
      //if played good middle contract
      newPlayer.performance > 0.5 && med > 0 &&
      generalPerformance.length >= 2 &&
      contract > 1 &&
      newPlayer.age < 35
    ) {
      document.getElementById("decision-transfer1").style.display = "flex";
      if (newTransfers[0].contract.value < newPlayer.wage)
        newTransfers[0].contract.value = newPlayer.wage;

      document.getElementById("decision-transfer2").style.display = "flex";
      if (newTransfers[1].contract.value < newPlayer.wage)
        newTransfers[1].contract.value = newPlayer.wage;

      document.getElementById("decision-transfer3").style.display = "flex";
      if (newTransfers[2].contract.value < newPlayer.wage)
        newTransfers[1].contract.value = newPlayer.wage;

      let newPosition;
      if (newPlayer.position.abbreviation !== "GO" && Math.random() < 0.2) {
          let relatedPositions = newPlayer.position.related;
          newPosition = relatedPositions[RandomNumber(0, relatedPositions.length - 1)];
      } else {
          newPosition = newPlayer.position.abbreviation;
      }

      setRenew({
        value: newPlayer.wage * 1.1,
        duration: contract - 1,
        position: newPosition
      });

      document.getElementById("decision-stay").style.display = "flex";
      //cant retire because of the contract
      document.getElementById("retire").style.display = "none";
    } else if (
      //loan
      newPlayer.performance < -0.5 &&
      med < 0 &&
      (generalPerformance.length >= 2 || newPlayer.age < 24) &&
      newTransfers.some((t) => t != null && t.team.power < newPlayer.team.power) &&
      contract > 3 &&
      newPlayer.age < 35
    ) {
      if (newTransfers[0].team.power > newPlayer.team.power) {
        document.getElementById("decision-transfer1").style.display = "none";
      } else {
        //proposal 1
        document.getElementById("decision-transfer1").style.display = "flex";
        newTransfers[0].loan = true;
        newTransfers[0].contract.duration = RandomNumber(1, 2);
        newTransfers[0].contract.value = newPlayer.wage;
      }

      if (newTransfers[1].team.power > newPlayer.team.power) {
        document.getElementById("decision-transfer2").style.display = "none";
      } else {
        //proposal 2
        document.getElementById("decision-transfer2").style.display = "flex";
        newTransfers[1].loan = true;
        newTransfers[1].contract.duration = RandomNumber(1, 2);
        newTransfers[1].contract.value = newPlayer.wage;
      }

      if (newTransfers[2].team.power > newPlayer.team.power) {
        document.getElementById("decision-transfer3").style.display = "none";
      } else {
        //proposal 3
        document.getElementById("decision-transfer3").style.display = "flex";
        newTransfers[2].loan = true;
        newTransfers[2].contract.duration = RandomNumber(1, 2);
        newTransfers[2].contract.value = newPlayer.wage;
      }

      //cant stay
      document.getElementById("decision-stay").style.display = "none";

      //cant retire because of the contract
      document.getElementById("retire").style.display = "none";
    } else if (
      //if contract expired
      contract <= 1
    ) {
      if (newPlayer.age >= 36 && newPlayer.overall <= 85) {
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

          let contractValue = Math.round(
            newPlayer.position.value *
              GetWage(newPlayer.overall, newPlayer.team.power, newPlayer.fame)
          );

          // 20% chance to switch position
          let newPosition;
          if (newPlayer.position.abbreviation !== "GO" && Math.random() < 0.2) {
              let relatedPositions = newPlayer.position.related;
              newPosition = relatedPositions[RandomNumber(0, relatedPositions.length - 1)];
          } else {
              newPosition = newPlayer.position.abbreviation;
          }

          setRenew({
            value: contractValue,
            duration: contractDuration,
            position: newPosition
          });
        }

        document.getElementById("decision-transfer1").style.display = "flex";
        document.getElementById("decision-transfer2").style.display = "flex";
        document.getElementById("decision-transfer3").style.display = "flex";

        if (newPlayer.age >= 32) {
          //can retire
          document.getElementById("retire").style.display = "flex";
        }
      }
    } else {
      ChooseTeam();
    }

    setLastLeagueResults(leagueResults);
    setPlayer(newPlayer);
    setTransfers(newTransfers);

    //set Seasons
    const newSeasons = [...seasons, newSeason];
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
      return a.power - b.power + Math.random();
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
          (playerTeam.name == newTeams[home].name || playerTeam.name == newTeams[away].name)
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
          (playerTeam.name == newTeams[home].name || playerTeam.name == newTeams[away].name)
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
            (playerTeam.name == newTeams[home].name || playerTeam.name == newTeams[away].name)
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
          (playerTeam.name == newTeams[home].name || playerTeam.name == newTeams[away].name)
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

    let team1Score = Math.round(team1Luck * team1Power);
    let team2Score = Math.round(team2Luck * team2Power);

    if (team1Score < 0) team1Score = 0;
    if (team2Score < 0) team2Score = 0;

    return [team1Score, team2Score];
  }

  function GetExtraTime(team1, team2) {
    let base = Math.pow(team1.power, 2) + Math.pow(team2.power, 2);
    let team1Power = Math.pow(team1.power, 2) / base;
    let team2Power = Math.pow(team2.power, 2) / base;

    let team1Luck = 1.5 * (Math.random() + Math.random()) * (Math.random() + Math.random());
    let team2Luck = 1.5 * (Math.random() + Math.random()) * (Math.random() + Math.random());

    let team1Score = Math.round(team1Luck * team1Power);
    let team2Score = Math.round(team2Luck * team2Power);

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
      let team2keeper = Math.random() * team2Power * 7;

      if (team1shooter > team2keeper) team1goals++;

      if (count <= 5 && Math.abs(team1goals - team2goals) > 6 - count) {
        winner = true;
        break;
      }

      let team2shooter = RandomNumber(0, team2Power * 100);
      let team1keeper = RandomNumber(0, team1Power * 80);

      if (team2shooter > team1keeper) team2goals++;

      if (
        (count > 5 && team1goals != team2goals) ||
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

      if (teamGoals1 == teamGoals2) {
        let extra = GetExtraTime(team2, team1);
        teamGoals1 += extra[1];
        teamGoals2 += extra[0];

        if (teamGoals1 == teamGoals2) {
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
    } else if (teamGoals1 == teamGoals2) {
      let extra = GetExtraTime(team1, team2);
      teamGoals1 += extra[0];
      teamGoals2 += extra[1];

      if (teamGoals1 == teamGoals2) {
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
        return b.power - a.power + Math.random();
    });

    allTeams = allTeams.slice(
        Math.floor(Math.abs(28 - currentPlayer.age)),
        allTeams.length / (4 + currentPlayer.performance)
    );

    let interestedTeams = [];

    for (let i = 0; i < 3; i++) {
        let teamID = RandomNumber(0, allTeams.length - 1);

        while (history.some((t) => t.team == allTeams[teamID].name)) {
            teamID = RandomNumber(0, allTeams.length - 1);
        }

        let team = allTeams[teamID];

        interestedTeams.push(team);
        allTeams = allTeams.filter((t) => t.name != team.name);
    }

    let contracts = [];

    for (let index = 0; index < 3; index++) {
        let team = interestedTeams[index];
        if (team) {
            let contractDuration = RandomNumber(1, 4);
            contractDuration += currentPlayer.age <= 32 ? RandomNumber(1, 2) : 0;
            contractDuration += currentPlayer.age <= 24 ? RandomNumber(1, 2) : 0;
            let expectedOverall = GetOverall(
                currentPlayer.potential,
                currentPlayer.age + Math.round(contractDuration / 2),
                team.power
            ) + currentPlayer.performance;
            let contractValue = Math.round(
                currentPlayer.position.value *
                GetWage(currentPlayer.overall, team.power, currentPlayer.fame)
            );
            let contract = {
                value: contractValue,
                duration: contractDuration,
            };
            let transferValue = Math.round(
                currentPlayer.position.value * GetTransferValue(expectedOverall, team.power)
            );

            // 20% chance to switch position
            let newPosition;
            if (currentPlayer.position.abbreviation !== "GO" && Math.random() < 0.2) {
                let relatedPositions = currentPlayer.position.related;
                newPosition = relatedPositions[RandomNumber(0, relatedPositions.length - 1)];
            } else {
                newPosition = currentPlayer.position.abbreviation;
            }

            contracts.push({
                team: team,
                contract: contract,
                transferValue: transferValue,
                loan: false,
                position: newPosition
            });
        } else {
            contracts.push(null);
        }
    }

    return contracts;
  }

  function GetInitTeams(posValue, newTeams, currentPlayer) {
    let allTeams = newTeams.reduce((acumulador, liga) => {
        return acumulador.concat(liga.teams);
    }, []);

    allTeams.sort((a, b) => {
        return b.power - a.power + Math.random();
    });

    allTeams = allTeams.slice(0, allTeams.length / 2);

    const randomIndices = [];
    while (randomIndices.length < 3) {
        const randomIndex = Math.floor(Math.random() * allTeams.length);
        if (!randomIndices.includes(randomIndex)) {
            randomIndices.push(randomIndex);
        }
    }

    // Randomize a play
    let teams = [
        allTeams[randomIndices[0]],
        allTeams[randomIndices[1]],
        allTeams[randomIndices[2]],
    ];

    let contractDurations = [RandomNumber(2, 8), RandomNumber(2, 8), RandomNumber(2, 8)];

    let contractWages = [
        Math.round(posValue * GetWage(GetOverall(0, 18, teams[0].power), teams[0].power, 0)),
        Math.round(posValue * GetWage(GetOverall(0, 18, teams[1].power), teams[1].power, 0)),
        Math.round(posValue * GetWage(GetOverall(0, 18, teams[2].power), teams[2].power, 0)),
    ];

    let contracts = [
        {
            value: contractWages[0],
            duration: contractDurations[0],
        },
        {
            value: contractWages[1],
            duration: contractDurations[1],
        },
        {
            value: contractWages[2],
            duration: contractDurations[2],
        },
    ];

    let expectedOveralls = [
        GetOverall(0, 18 + contractDurations[0] / 2, teams[0].power),
        GetOverall(0, 18 + contractDurations[1] / 2, teams[1].power),
        GetOverall(0, 18 + contractDurations[2] / 2, teams[2].power),
    ];

    let transferValues = [
        Math.round(posValue * GetTransferValue(expectedOveralls[0], teams[0].power)),
        Math.round(posValue * GetTransferValue(expectedOveralls[1], teams[1].power)),
        Math.round(posValue * GetTransferValue(expectedOveralls[2], teams[2].power)),
    ];

    // 20% chance to switch position
    let updatedContracts = contracts.map((contract, index) => {
        let newPosition;
        if (currentPlayer.position.abbreviation !== "GO" && Math.random() < 0.2) {
            let relatedPositions = currentPlayer.position.related;
            newPosition = relatedPositions[RandomNumber(0, relatedPositions.length - 1)];
        } else {
            newPosition = currentPlayer.position.abbreviation;
        }

        return {
            team: teams[index],
            contract: contract,
            transferValue: transferValues[index],
            loan: false,
            position: newPosition
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

  function GetOverall(potential, age, teamPower) {
    return 90 + (potential + teamPower - (28 - age) ** 2) / 10;
  }

  function GetWage(currentOverall, teamPower, fame) {
    return (
      (fame + 200) *
      (currentOverall - 50) ** 3 *
      (1 + (Math.random() - Math.random()) / 10.0) *
      (1 + teamPower / 50.0)
    );
  }

  function GetTransferValue(expectedOverall, teamPower) {
    return (
      ((expectedOverall - 50) ** 10 / 100000000) *
      (1 + (Math.random() - Math.random()) / 10.0) *
      (1 + teamPower / 50.0)
    );
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
        <section className="career" ref={parentRef}>
          {seasons.map((s, index) => (
            <div key={index} className="season-container">
              <Season season={s} open={index >= seasons.length - 1} />
            </div>
          ))}
        </section>
        <section className="choices" id="init-nation">
          <select id="continent-dropdown" onChange={() => updateNationDropdown()}>
            <option value="">Selecione uma Confederação</option>
            <option value="AFC">AFC</option>
            <option value="CAF">CAF</option>
            <option value="CONCACAF">CONCACAF</option>
            <option value="CONMEBOL">CONMEBOL</option>
            <option value="UEFA">UEFA</option>
          </select>
          <select id="nation-dropdown">
            <option value="">Selecione uma Nação</option>
          </select>
          <a
            className="confirm-button"
            onClick={() => ChooseNation()}
          >
            Confirmar
          </a>
        </section>
        <section className="choices" id="init-pos" style={{ display: "none" }}>
          <h3 style={{ marginBottom: "1rem" }}>Escolha a posição do jogador:</h3>
          <select id="position-select">
            {Positions.map((position, index) => (
              <option key={index} value={position.title}>
                {position.title}
              </option>
            ))}
          </select>
          <a
            className="confirm-button"
            onClick={() => ChoosePos()}
          >
            Confirmar
          </a>
        </section>
        <section className="choices" id="team-choice" style={{ display: "none" }}>
          <a
            className="d-stay"
            id="decision-stay"
            style={{ display: "none" }}
            onClick={() => ChooseTeam()}
          >
            <p>Continuar em {player.team == null ? "null" : player.team.name}</p>
            <p>
              {player.team == null ? "null" : (player.team.power / 2).toFixed(2)}⭐ | $
              {FormatarNumero(renew.value)} |{" "}
              {renew.duration} 🕗 |{" "}
              {renew.position}
            </p>
          </a>
          <a className="d-alert" id="decision-transfer1" onClick={() => ChooseTeam(transfers[0])}>
            {transfers[0] ? (
              <>
                <p>
                  {transfers[0].loan ? "Empréstimo" : "Transferir"} para {transfers[0].team.name}
                </p>
                <p>
                  {(transfers[0].team.power / 2).toFixed(2)}⭐ | $
                  {FormatarNumero(transfers[0].contract.value)} |{" "}
                  {transfers[0].contract.duration} 🕗 |{" "}
                  {transfers[0].position}
                </p>
              </>
            ) : (
              <p>null</p>
            )}
          </a>
          <a className="d-alert" id="decision-transfer2" onClick={() => ChooseTeam(transfers[1])}>
            {transfers[1] ? (
              <>
                <p>
                  {transfers[1].loan ? "Empréstimo" : "Transferir"} para {transfers[1].team.name}
                </p>
                <p>
                  {(transfers[1].team.power / 2).toFixed(2)}⭐ | $
                  {FormatarNumero(transfers[1].contract.value)} |{" "}
                  {transfers[1].contract.duration} 🕗 |{" "}
                  {transfers[1].position}
                </p>
              </>
            ) : (
              <p>null</p>
            )}
          </a>
          <a className="d-alert" id="decision-transfer3" onClick={() => ChooseTeam(transfers[2])}>
            {transfers[2] ? (
              <>
                <p>
                  {transfers[2].loan ? "Empréstimo" : "Transferir"} para {transfers[2].team.name}
                </p>
                <p>
                  {(transfers[2].team.power / 2).toFixed(2)}⭐ | $
                  {FormatarNumero(transfers[2].contract.value)} |{" "}
                  {transfers[2].contract.duration} 🕗 |{" "}
                  {transfers[2].position}
                </p>
              </>
            ) : (
              <p>null</p>
            )}
          </a>
          <a className="d-alert" id="retire" style={{ display: "none" }} onClick={() => Retire()}>
            Aposentar-se
          </a>
        </section>
        <section className="choices" id="continue" style={{ display: "none" }}>
          <a className="d-stay" onClick={() => Continue()}>
            Simular ({contract} {contract > 1 ? "anos restantes" : "ano restante"})
          </a>
        </section>
        <section className="chart" id="chart" style={{ display: "none" }}>
          <ChartComponent data={seasons} />
        </section>
        <section className="stats">
          <h1>Carreira</h1>
          <div className="stats-div">
            Fama: {StarPath[Math.min(Math.floor(player.fame / 100), StarPath.length - 1)]}
            <div
              style={{
                position: "relative",  // This ensures absolute positioning works inside it
                width: "100%",
                height: "1rem",
                backgroundColor: "var(--color-medium)",
              }}
            >
              <div
                style={{
                  width: `${Math.floor(Math.min(player.fame, 1000) % 100)}%`,
                  minHeight: "1rem",
                  backgroundColor: `${player.fame < 1000 ? "var(--color-contrast)" : "gold"}`,
                  margin: "0",
                }}
              />
              
              <span
                style={{
                  position: "absolute",  // Use absolute for easier centering
                  top: "50%",            // Center vertically
                  left: "50%",           // Center horizontally
                  transform: "translate(-50%, -50%)",  // This will center perfectly
                  color: "var(--color-dark)",
                }}
              >
                {Math.floor(player.fame)}
              </span>
            </div>
            <p>Posição: {player.position == null ? "A definir" : player.position.title}</p>
            <p>Seleção: {player.nation == null ? "A definir" : player.nation.name}</p>
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
                <summary>Bola de Ouro: {player.ballonDor.length}</summary>
                <div>
                  {player.ballonDor.map((b) => (
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
