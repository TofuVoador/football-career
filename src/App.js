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
    age: null,
    team: null,
    wage: null,
    starting: null,
    titles: null,
    goals: null,
    assists: null,
    overall: null,
    performance: null,
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
    wage: 1,
    overall: 70,
    performance: 0,
    totalGoals: 0,
    totalAssists: 0,
    leagueTitles: [],
    nationalCup: [],
    europa: [],
    champions: [],
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

  const [renew, setRenew] = useState({ value: 0, duration: 0 });

  function ChooseNation(initNation) {
    //change display
    document.getElementById("init-pos").style.display = "flex";
    document.getElementById("init-nation").style.display = "none";

    let newPlayer = player;
    newPlayer.nation = initNation;

    setPlayer(newPlayer);
  }

  function ChoosePos(initPos) {
    //change display
    document.getElementById("team-choice").style.display = "flex";
    document.getElementById("init-pos").style.display = "none";

    let newPlayer = player;
    newPlayer.position = initPos;

    let newTeams = UpdateTeamsStats(20.0);

    let leagueResults = leagues.map((league) => {
      let leagueResult = {
        name: league.name,
        championsSpots: league.championsSpots,
        europaSpots: league.europaSpots,
        table: GetLeaguePosition(league.teams),
      };
      return leagueResult;
    });

    setLastLeagueResults(leagueResults);
    setPlayer(newPlayer);
    setTransfers(GetInitTeams(initPos.value, newTeams));
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

    if (newTeam != null) {
      // Se houver mudança de time
      newHistory.push(newTeam.team.name);

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
          loan: false,
        };
      }

      newGeneralPerformance = [];
      newPlayer.team = newTeam.team;
      newContract = newTeam.contract.duration;
      newPlayer.marketValue = newTeam.transferValue;
      newPlayer.wage = newTeam.contract.value;

      let lp = 99; // Inicializa o valor padrão de "lp"

      let newLeagueResults =
        lastLeagueResults.find((league) => league.name === newPlayer.team.league) || [];
      lp = newLeagueResults.table.findIndex((team) => team.name == newPlayer.team.name) + 1;

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
    }

    //change teams power on each season
    let newTeams = UpdateTeamsStats(40.0);
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
    let top10 = allTeams.slice(0, 10);

    //change nations power on each season
    let newNat = UpdateNationsStats();
    let allNations = [];
    for (let regionID = 0; regionID < newNat.length; regionID++) {
      allNations = allNations.concat([...newNat[regionID].teams]);
    }
    allNations.sort((a, b) => {
      return b.power - a.power;
    });
    //creates a list of top 12 nations
    let topNations = allNations.slice(0, 12);

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

    //giving the performance, set how many games did they were the starter player
    let starting = Math.floor(
      (newPlayer.overall - (75 + newPlayer.team.power / 2)) / 0.1 +
        (Math.random() - Math.random()) * 10
    );
    if (starting > 100) starting = 100;
    else if (starting < 0) starting = 0;

    //set season start
    let newSeason = {
      year: year + 1,
      top10: top10,
      topNations: topNations,
      age: newPlayer.age,
      team: newPlayer.team,
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
    let goalsOppostunities =
      (newPlayer.position.goalsBonus *
        (Math.pow(newPlayer.team.power, 2) +
          newSeason.starting / 2 +
          (newSeason.performance + 1) * 25.0)) /
      200.0;
    let assistsOppostunities =
      (newPlayer.position.assistsBonus *
        (Math.pow(newPlayer.team.power, 2) +
          newSeason.starting / 2 +
          (newSeason.performance + 1) * 25.0)) /
      200.0;

    newSeason.goals = Math.floor(
      goalsOppostunities *
        (Math.pow(newPlayer.overall, 4) / 65000000.0) *
        (1.0 + newSeason.performance / 4.0) *
        (1.0 + (Math.random() - Math.random()) / 4.0)
    );
    newSeason.assists = Math.floor(
      assistsOppostunities *
        (Math.pow(newPlayer.overall, 4) / 65000000.0) *
        (1.0 + newSeason.performance / 4.0) *
        (1.0 + (Math.random() - Math.random()) / 4.0)
    );

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
        table: GetLeaguePosition(league.teams),
      };
      return leagueResult;
    });

    let playerLeagueResult = leagueResults.find((league) => league.name === newPlayer.team.league);

    //top eight from each league
    let leaguesTopEight = [];
    for (let l = 0; l < leagueResults.length; l++) {
      let topEight = `${leagueResults[l].name}`;
      for (let p = 0; p < 8; p++) {
        topEight += `--> ${p + 1}º: ${leagueResults[l].table[p].name}`;
      }
      leaguesTopEight.push(topEight);
    }

    const playerPosition =
      playerLeagueResult.table.findIndex((team) => team.name == newPlayer.team.name) + 1;
    newSeason.awardPoints +=
      ((playerLeagueResult.championsSpots / 4.0) * (5 - playerPosition)) / 2.0; //max = 2.0
    newSeason.titles.push([`Liga: ${playerPosition}º lugar`].concat(leaguesTopEight));
    newPlayer.fame += Math.floor((playerLeagueResult.championsSpots * (6 - playerPosition)) / 2.0);

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
            newSeason.awardPoints += 0.2; // Máximo 0.2 x 5 = 1.0
            newPlayer.fame += 2;
            if (playerPhase >= TournamentPath.length - 1) {
              // Se o jogador venceu o torneio, conceder prêmios adicionais
              newPlayer.nationalCup.push(`${year} (${newPlayer.team.name})`);
              newSeason.awardPoints += 1.0; // Máximo 0.2 x 5 + 1.0 = 2.0
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
    let qualifiedToChamptions = [];

    // Obter os principais times de cada liga
    for (let leagueID = 0; leagueID < leagues.length; leagueID++) {
      let league = DeepClone([...leagues[leagueID].teams]);

      let leagueTableNames = lastLeagueResults[leagueID].table.map((team) => team.name);
      let leagueQualifiedNames = leagueTableNames.splice(
        0,
        lastLeagueResults[leagueID].championsSpots
      );
      let leagueQualified = league.filter((team) => leagueQualifiedNames.includes(team.name));

      for (let teamID = 0; teamID < lastLeagueResults[leagueID].championsSpots; teamID++) {
        qualifiedToChamptions.push(leagueQualified[teamID]);
      }
    }

    // Adicionar as equipes extras aos times qualificados
    qualifiedToChamptions = qualifiedToChamptions.concat(extrateams.slice(0, 12));

    // Obter a posição dos campeões em um grupo específico
    let championsGroup = GetChampionsPosition(
      qualifiedToChamptions,
      newPlayer.championsQualification ? newPlayer.team : null
    );

    const playerChampionsPos =
      championsGroup.table.findIndex((team) => team.name == newPlayer.team.name) + 1;

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
            newSeason.awardPoints += 0.6; // Máximo 0.6 x 5 = 3.0
            newPlayer.fame += 4; // Máximo 4 x 5 = 20
            if (playerPhase >= TournamentPath.length - 1) {
              // Se o jogador vencer o torneio, conceder prêmios adicionais
              newPlayer.champions.push(`${year} (${newPlayer.team.name})`);
              newPlayer.fame += 20; // Máximo 4 x 5 + 20 = 40
              if (year % 4 != 2) newSeason.awardPoints += 3.0; // Máximo 0.6 x 5 + 3.0 = 6.0
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

      let leagueTableNames = lastLeagueResults[leagueID].table.map((team) => team.name);
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
            newPlayer.fame += 2; // Máximo 2 x 5 = 10
            if (playerPhase >= TournamentPath.length - 1) {
              newPlayer.europa.push(`${year} (${newPlayer.team.name})`);
              newPlayer.fame += 10; // Máximo 2 x 5 + 10 = 20
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
      }
    }

    let playerEuropaResult = newPlayer.europaQualification
      ? `: ${TournamentPath[playerPhase]}`
      : "";

    newSeason.titles.push([`Europa League${playerEuropaResult}`].concat(europaLeagueDescription));

    //World Cup
    if (year % 4 == 2) {
      newSeason.awardPoints -= 3.0;
      phase = 0;
      playerPhase = 0;
      let worldCupDescription = [];
      let newWorldCupHistoryHosts = worldCupHistoryHosts;
      let currentHosts = newWorldCupHistoryHosts[newWorldCupHistoryHosts.length - 1];

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

      console.log(JSON.parse(JSON.stringify(pots)));

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

      console.log(JSON.parse(JSON.stringify(groups)));

      // Listas para armazenar os primeiros, segundos e terceiros colocados de cada grupo
      let firstPlaces = [];
      let secondPlaces = [];
      let thirdPlaces = [];

      // Loop através de todos os grupos
      for (let groupID = 0; groupID < groups.length; groupID++) {
        // Obter a posição do jogador no grupo atual
        let thisGroup = GetWorldCupPosition(groups[groupID]);
        const playerPosition =
          thisGroup.table.findIndex((team) => team.name == newPlayer.nation.name) + 1;

        // Se o jogador estiver entre os primeiros colocados do grupo, atualizar informações
        if (playerPosition > 0) {
          worldCupDescription.push(
            `${TournamentPath[phase]}: ${playerPosition}º lugar${thisGroup.desc}`
          );
        }

        console.log(thisGroup.table);

        // Adicionar os primeiros, segundos e terceiros colocados do grupo às listas correspondentes
        firstPlaces.push(thisGroup.table[0]);
        secondPlaces.push(thisGroup.table[1]);
        thirdPlaces.push(thisGroup.table[2]);
      }

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
              // Verificar se o jogador ganhou a Copa do Mundo e conceder prêmios adicionais
              if (playedWorldCup) {
                newSeason.awardPoints += 0.6; // Máximo 0.6 x 5 = 3.0
                newPlayer.fame += 6; // Máximo 6 x 5 = 30
                if (playerPhase >= TournamentPath.length - 1) {
                  newPlayer.worldCup.push(`${year}`);
                  newSeason.awardPoints += 3.0; // Máximo 0.6 x 5 + 3.0 = 6.0
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
        (n) => n.name == newWorldCupHistoryHosts[newWorldCupHistoryHosts.length - 2][0]
      )[0];

      let validTeams = allNations
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
        })
        .filter((team) => !countriesHosts.includes(team.name));

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
          return distance <= 2000;
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
      newSeason.awardPoints += 1.0;
    }

    if (45 + RandomNumber(0, 5) < newSeason.goals) {
      //Golden Shoes
      newPlayer.awards.push(`Chuteiras de Ouro ${year} (${newPlayer.team.name})`);
      newSeason.awardPoints += 1.0;
      newPlayer.fame += 40;
      newSeason.titles.push(["Chuteira de Ouro"]);
    } else if (
      player.position.title == "GK" &&
      newSeason.performance * 5 + (newPlayer.overall - 75) / 2 > 10
    ) {
      //Golden Gloves
      newPlayer.awards.push(`Luvas de Ouro ${year} (${newPlayer.team.name})`);
      newSeason.awardPoints += 1.0;
      newPlayer.fame += 40;
      newSeason.titles.push(["Luva de Ouro"]);
    }

    newPlayer.fame += newSeason.performance * 20;

    newPlayer.fame += newSeason.goals / 5.0;
    newPlayer.fame += newSeason.assists / 5.0;

    let position = -1;

    if (newSeason.awardPoints + newPlayer.overall >= 100) {
      //Ballon D'or
      newPlayer.ballonDor.push(`Ballon D'or ${year} (${newPlayer.team.name})`);
      newPlayer.fame += 80;
      position = 1;
      newSeason.titles.push([`Ballon D'Or: 1º lugar`]);
    } else if (newSeason.awardPoints + newPlayer.overall >= 91) {
      let pts = Math.floor(newSeason.awardPoints + newPlayer.overall - 91);
      newPlayer.fame += pts * 4;
      position = 10 - pts;
      newSeason.titles.push([`Ballon D'Or: ${position}º lugar`]);
    }

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
        setRenew({
          value: newPlayer.contractTeam.contract.value,
          duration: newPlayer.contractTeam.contract.duration,
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
      //if played good midde contract
      newPlayer.performance > 0.5 &&
      med > 0 &&
      generalPerformance.length >= 2 &&
      newTransfers[0] != null &&
      contract > 2
    ) {
      document.getElementById("decision-transfer1").style.display = "flex";
      if (newTransfers[0].contract.value < newPlayer.wage)
        newTransfers[0].contract.value = newPlayer.wage;

      if (newTransfers[1] == null) {
        document.getElementById("decision-transfer2").style.display = "none";
      } else {
        document.getElementById("decision-transfer2").style.display = "flex";
        if (newTransfers[1].contract.value < newPlayer.wage)
          newTransfers[1].contract.value = newPlayer.wage;
      }

      if (newTransfers[2] == null) {
        document.getElementById("decision-transfer3").style.display = "none";
      } else {
        document.getElementById("decision-transfer3").style.display = "flex";
        if (newTransfers[2].contract.value < newPlayer.wage)
          newTransfers[1].contract.value = newPlayer.wage;
      }

      setRenew({
        value: newPlayer.wage,
        duration: contract - 1,
      });

      document.getElementById("decision-stay").style.display = "flex";
      //cant retire because of the contract
      document.getElementById("retire").style.display = "none";
    } else if (
      //played bad midde contract
      newPlayer.performance < -0.5 &&
      med < 0 &&
      generalPerformance.length >= 2 &&
      newTransfers[0] != null &&
      contract > 3
    ) {
      //proposal 1
      document.getElementById("decision-transfer1").style.display = "flex";
      newTransfers[0].loan = true;
      newTransfers[0].contract.duration = RandomNumber(1, 2);
      newTransfers[0].contract.value = newPlayer.wage;

      if (newTransfers[1] == null) {
        document.getElementById("decision-transfer2").style.display = "none";
      } else {
        //proposal 2
        document.getElementById("decision-transfer2").style.display = "flex";
        newTransfers[1].loan = true;
        newTransfers[1].contract.duration = RandomNumber(1, 2);
        newTransfers[1].contract.value = newPlayer.wage;
      }

      if (newTransfers[2] == null) {
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
      if (med < 0 && newTransfers[0] != null) {
        //cant stay
        document.getElementById("decision-stay").style.display = "none";
      } else {
        //can stay
        document.getElementById("decision-stay").style.display = "flex";
        let contractDuration = RandomNumber(1, 4);

        let contractValue = Math.round(
          newPlayer.position.value *
            GetWage(newPlayer.overall, newPlayer.team.power, newPlayer.fame)
        );

        setRenew({
          value: contractValue,
          duration: contractDuration,
        });
      }

      document.getElementById("decision-transfer1").style.display =
        newTransfers[0] == null ? "none" : "flex";
      document.getElementById("decision-transfer2").style.display =
        newTransfers[1] == null ? "none" : "flex";
      document.getElementById("decision-transfer3").style.display =
        newTransfers[2] == null ? "none" : "flex";

      if (newPlayer.age >= 32) {
        //can retire
        document.getElementById("retire").style.display = "flex";
      }

      if (newPlayer.age >= 36 && newPlayer.overall <= 84) {
        //must retire
        document.getElementById("decision-stay").style.display = "none";
        document.getElementById("decision-transfer1").style.display = "none";
        document.getElementById("decision-transfer2").style.display = "none";
        document.getElementById("decision-transfer3").style.display = "none";
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
          points[home] += 3;
        } else if (game[1] > game[0]) {
          points[away] += 3;
        } else {
          points[away] += 1;
          points[home] += 1;
        }

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

  function GetLeaguePosition(teams, playerTeam) {
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

          points[home] += game[0];
          points[away] += game[1];
        }
      }
    }

    let table = [...newTeams];

    table.sort((a, b) => {
      return points[table.indexOf(b)] - points[table.indexOf(a)];
    });

    return table;
  }

  function GetWorldCupPosition(teams) {
    let desc = "";
    let newTeams = DeepClone([...teams]);
    let points = new Array(teams.length).fill(0);

    // Iterate over each team
    for (let round = 1; round < newTeams.length; round++) {
      let newOrder = [];
      let newPointsOrder = [];
      desc += `--> Rodada ${round}`;
      for (let matchID = 0; matchID < newTeams.length / 2; matchID++) {
        // Start from home + 1 to avoid playing against itself and avoid duplicated matches
        let home = matchID;
        let away = newTeams.length - (matchID + 1);

        let game = GetMatch(newTeams[home], newTeams[away]);

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

        desc += `-> ${newTeams[home].name} ${game[0]} x ${game[1]} ${newTeams[away].name}\n`;
      }

      newTeams = newOrder;
      points = newPointsOrder;
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

  function GetMatch(team1, team2) {
    let base = Math.pow(team1.power, Math.log(500)) + Math.pow(team2.power, Math.log(500));
    let team1Power = Math.pow(team1.power, Math.log(500)) / base;
    let team2Power = Math.pow(team2.power, Math.log(500)) / base;

    let goals = Math.random() + Math.random();

    let team1Luck = (Math.random() + Math.random()) * 3 - 1;
    let team2Luck = (Math.random() + Math.random()) * 3 - 1;

    let team1Score = Math.round(goals * team1Luck * team1Power);
    let team2Score = Math.round(goals * team2Luck * team2Power);

    if (team1Score < 0) team1Score = 0;
    if (team2Score < 0) team2Score = 0;

    return [team1Score, team2Score];
  }

  function GetExtraTime(team1, team2) {
    let base = Math.pow(team1.power, Math.log(500)) + Math.pow(team2.power, Math.log(500));
    let team1Power = Math.pow(team1.power, Math.log(500)) / base;
    let team2Power = Math.pow(team2.power, Math.log(500)) / base;

    let team1Luck = Math.random() * 3;
    let team2Luck = Math.random() * 3;

    let team1Score = Math.round(team1Luck * team1Power);
    let team2Score = Math.round(team2Luck * team2Power);

    if (team1Score < 0) team1Score = 0;
    if (team2Score < 0) team2Score = 0;

    return [team1Score, team2Score];
  }

  function GetPenalties(team1, team2) {
    let base = Math.pow(team1.power, Math.log(500)) + Math.pow(team2.power, Math.log(500));
    let team1Power = Math.pow(team1.power, Math.log(500)) / base;
    let team2Power = Math.pow(team2.power, Math.log(500)) / base;

    let winner = false;
    let team1goals = 0;
    let team2goals = 0;
    let count = 0;
    while (!winner) {
      count++;
      let team1shooter = RandomNumber(0, team1Power * 100);
      let team2keeper = RandomNumber(0, team2Power * 80);

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

    allTeams = allTeams.slice(0, allTeams.length / 2);

    let interestedTeams = [];

    for (let i = 0; i < allTeams.length; i++) {
      let chance = currentPlayer.overall / allTeams[i].power;

      let r = RandomNumber(0, 100);
      if (r < chance && !history.some((t) => t == allTeams[i].name)) {
        interestedTeams.push(allTeams[i]);
        if (interestedTeams.length > 3) break;
      }
    }

    let contracts = [];

    for (let index = 0; index < 3; index++) {
      let team = interestedTeams[index];
      if (team) {
        let contractDuration = RandomNumber(1, 4);
        contractDuration += currentPlayer.age <= 32 ? RandomNumber(1, 2) : 0;
        contractDuration += currentPlayer.age <= 24 ? RandomNumber(1, 2) : 0;
        let expectedOverall =
          GetOverall(
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

        contracts.push({
          team: team,
          contract: contract,
          transferValue: transferValue,
          loan: false,
        });
      } else {
        contracts.push(null);
      }
    }

    return contracts;
  }

  function GetInitTeams(posValue, newTeams) {
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

    //randomize a play
    let teams = [
      allTeams[randomIndices[0]],
      allTeams[randomIndices[1]],
      allTeams[randomIndices[2]],
    ];

    let contractDurations = [RandomNumber(2, 6), RandomNumber(2, 6), RandomNumber(2, 6)];

    let contractWages = [
      Math.round(posValue * GetWage(GetOverall(0, 18, teams[0].power), teams[0].power, 0)),
      Math.round(posValue * GetWage(GetOverall(0, 18, teams[1].power), teams[1].power, 0)),
      Math.round(posValue * GetWage(GetOverall(0, 18, teams[2].power), teams[2].power, 0)),
    ];

    let contracts = [
      { value: contractWages[0], duration: contractDurations[0] },
      { value: contractWages[1], duration: contractDurations[1] },
      { value: contractWages[2], duration: contractDurations[2] },
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

    return [
      {
        team: teams[0],
        contract: contracts[0],
        transferValue: transferValues[0],
        loan: false,
      },
      {
        team: teams[1],
        contract: contracts[1],
        transferValue: transferValues[1],
        loan: false,
      },
      {
        team: teams[2],
        contract: contracts[2],
        transferValue: transferValues[2],
        loan: false,
      },
    ];
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
    return 90 + potential / 10 + Math.round(10.0 * teamPower) / 100 - (28 - age) ** 2 / 10;
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

    for (let leagueID = 0; leagueID < newTeams.length; leagueID++) {
      let last = Math.random();
      let teamIndices = Array.from(
        { length: newTeams[leagueID].teams.length },
        (_, index) => index
      );
      teamIndices = shuffleArray(teamIndices);

      for (let i = 0; i < newTeams[leagueID].teams.length; i++) {
        let teamID = teamIndices[i];

        let current = Math.random();
        let change = Math.round(limit * (last - current)) / 100.0;
        last = current;

        let newPower = newTeams[leagueID].teams[teamID].power + change;
        newTeams[leagueID].teams[teamID].power = Math.round(100.0 * newPower) / 100;

        if (newTeams[leagueID].teams[teamID].power > 10)
          newTeams[leagueID].teams[teamID].power = 10;
        else if (newTeams[leagueID].teams[teamID].power < 2)
          newTeams[leagueID].teams[teamID].power = 2;
      }

      newTeams[leagueID].teams.sort((a, b) => {
        return b.power - a.power;
      });
    }
    setLeagues(newTeams);
    return newTeams;
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

    for (let leagueID = 0; leagueID < allNations.length; leagueID++) {
      let last = Math.random();
      let nationIndices = Array.from(
        { length: allNations[leagueID].teams.length },
        (_, index) => index
      );
      nationIndices = shuffleArray(nationIndices);

      for (let i = 0; i < allNations[leagueID].teams.length; i++) {
        let nationID = nationIndices[i];

        let current = Math.random();
        let change = Math.round(40.0 * (last - current)) / 100.0;
        last = current;

        let newPower = allNations[leagueID].teams[nationID].power + change;

        allNations[leagueID].teams[nationID].power = Math.round(100.0 * newPower) / 100.0;

        if (allNations[leagueID].teams[nationID].power > 10)
          allNations[leagueID].teams[nationID].power = 10;
        else if (allNations[leagueID].teams[nationID].power < 2)
          allNations[leagueID].teams[nationID].power = 2;
      }

      allNations[leagueID].teams.sort((a, b) => {
        return b.power - a.power;
      });
    }

    setNations(allNations);
    return allNations;
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
          <li>Você pode recarregar a página até aparecer os atributos iniciais desejados</li>
          <li>Boa sorte e divirta-se</li>
        </ol>
      </header>
      <div className="career" ref={parentRef}>
        {seasons.map((s, index) => (
          <div key={index} className="career-container">
            <Season season={s} open={index >= seasons.length - 1} />
          </div>
        ))}
      </div>
      <div className="choices" id="init-nation">
        <h3 style={{ marginBottom: "1rem" }}>Escolha o país do jogador:</h3>
        <a className="d-alert" onClick={() => ChooseNation(initNation[0])}>
          {initNation[0].name}
        </a>
        <a className="d-alert" onClick={() => ChooseNation(initNation[1])}>
          {initNation[1].name}
        </a>
        <a className="d-alert" onClick={() => ChooseNation(initNation[2])}>
          {initNation[2].name}
        </a>
      </div>
      <div className="choices" id="init-pos" style={{ display: "none" }}>
        <h3 style={{ marginBottom: "1rem" }}>Escolha a posição do jogador:</h3>
        <a className="d-alert" onClick={() => ChoosePos(initPos[0])}>
          {initPos[0].title}
        </a>
        <a className="d-alert" onClick={() => ChoosePos(initPos[1])}>
          {initPos[1].title}
        </a>
        <a className="d-alert" onClick={() => ChoosePos(initPos[2])}>
          {initPos[2].title}
        </a>
      </div>
      <div className="choices" id="team-choice" style={{ display: "none" }}>
        <a
          className="d-stay"
          id="decision-stay"
          style={{ display: "none" }}
          onClick={() => ChooseTeam()}
        >
          <p>Continuar em {player.team == null ? "null" : player.team.name}</p>
          <p>
            {player.team == null ? "null" : (player.team.power / 2).toFixed(2)}⭐ | $
            {FormatarNumero(renew.value)}/ano |{" "}
            {renew.duration + " " + (renew.duration > 1 ? "anos" : "ano")}
          </p>
        </a>
        <a className="d-alert" id="decision-transfer1" onClick={() => ChooseTeam(transfers[0])}>
          <p>
            {transfers[0] == null ? "null" : transfers[0].loan ? "Empréstimo" : "Transferir"} para{" "}
            {transfers[0] == null ? "null" : transfers[0].team.name}
          </p>
          <p>
            {transfers[0] == null ? "null" : (transfers[0].team.power / 2).toFixed(2)}⭐ | $
            {transfers[0] == null ? "null" : FormatarNumero(transfers[0].contract.value)}
            /ano | {transfers[0] == null ? "null" : transfers[0].contract.duration} anos
          </p>
        </a>
        <a className="d-alert" id="decision-transfer2" onClick={() => ChooseTeam(transfers[1])}>
          <p>
            {transfers[1] == null ? "null" : transfers[1].loan ? "Empréstimo" : "Transferir"} para{" "}
            {transfers[1] == null ? "null" : transfers[1].team.name}
          </p>
          <p>
            {transfers[1] == null ? "null" : (transfers[1].team.power / 2).toFixed(2)}⭐ | $
            {transfers[1] == null ? "null" : FormatarNumero(transfers[1].contract.value)}
            /ano | {transfers[1] == null ? "null" : transfers[1].contract.duration} anos
          </p>
        </a>
        <a className="d-alert" id="decision-transfer3" onClick={() => ChooseTeam(transfers[2])}>
          <p>
            {transfers[2] == null ? "null" : transfers[2].loan ? "Empréstimo" : "Transferir"} para{" "}
            {transfers[2] == null ? "null" : transfers[2].team.name}
          </p>
          <p>
            {transfers[2] == null ? "null" : (transfers[2].team.power / 2).toFixed(2)}⭐ | $
            {transfers[2] == null ? "null" : FormatarNumero(transfers[2].contract.value)}
            /ano | {transfers[2] == null ? "null" : transfers[2].contract.duration} anos
          </p>
        </a>
        <a className="d-alert" id="retire" style={{ display: "none" }} onClick={() => Retire()}>
          Aposentar-se
        </a>
      </div>
      <div className="choices" id="continue" style={{ display: "none" }}>
        <a className="d-stay" onClick={() => Continue()}>
          Simular Temporada ({contract} {contract > 1 ? "anos restantes" : "ano restante"})
        </a>
      </div>
      <div className="chart" id="chart" style={{ display: "none" }}>
        <ChartComponent data={seasons} />
      </div>
      <div className="stats">
        <h1>Carreira</h1>
        <div>
          Fama: {StarPath[Math.min(Math.floor(player.fame / 100), StarPath.length - 1)]}
          <div
            style={{
              width: "300px",
              height: "20px",
              backgroundColor: "var(--color-medium)",
              borderRadius: "10px",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: `${Math.floor(Math.min(player.fame, 1000) % 100)}%`,
                minHeight: "20px",
                backgroundColor: `${player.fame < 1000 ? "var(--color-contrast)" : "gold"}`,
                borderRadius: "10px",
                margin: "0",
              }}
            />
            <span
              style={{
                position: "relative",
                top: "-50%", // Centraliza verticalmente
                left: "50%", // Centraliza horizontalmente
                transform: "translate(-50%, -50%)", // Centraliza completamente
                color: "var(--color-dark)",
              }}
            >
              {Math.floor(player.fame)}
            </span>
          </div>
          <p>Posição: {player.position == null ? "A definir" : player.position.title}</p>
          <p>Seleção: {player.nation == null ? "A definir" : player.nation.name}</p>
        </div>
        <details>
          <summary>Copa do Mundo: {player.worldCup.length}</summary>
          {player.worldCup.map((wc) => (
            <p key={wc}>{wc}</p>
          ))}
        </details>
        <div>
          <p>Gols: {player.totalGoals}</p>
          <p>Assistências: {player.totalAssists}</p>
        </div>
        <div>
          <details>
            <summary>Ligas: {player.leagueTitles.length}</summary>
            {player.leagueTitles.map((l) => (
              <p key={l}>{l}</p>
            ))}
          </details>
        </div>
        <div>
          <details>
            <summary>Copas Nacionais: {player.nationalCup.length}</summary>
            {player.nationalCup.map((nc) => (
              <p key={nc}>{nc}</p>
            ))}
          </details>
        </div>
        <div>
          <details>
            <summary>Champions League: {player.champions.length}</summary>
            {player.champions.map((ch) => (
              <p key={ch}>{ch}</p>
            ))}
          </details>
        </div>
        <div>
          <details>
            <summary>Europa League: {player.europa.length}</summary>
            {player.europa.map((el) => (
              <p key={el}>{el}</p>
            ))}
          </details>
        </div>
        <div>
          <details>
            <summary>Premiações: {player.awards.length}</summary>
            {player.awards.map((a) => (
              <p key={a}>{a}</p>
            ))}
          </details>
        </div>
        <div>
          <details>
            <summary>Bola de Ouro: {player.ballonDor.length}</summary>
            {player.ballonDor.map((b) => (
              <p key={b}>{b}</p>
            ))}
          </details>
        </div>
      </div>
      <footer>
        <p>Por Gustavo Amamia Kumagai</p>
      </footer>
    </>
  );
}

export default App;
