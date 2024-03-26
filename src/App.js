import React, { useState } from "react";
import "./App.css";
import Teams from "./Database/teams.json";
import ExtraTeams from "./Database/extrateams.json";
import Nations from "./Database/nations.json";
import Positions from "./Database/positions.json";
import ChartComponent from "./Components/chartComponent";
import Season from "./Components/season";
import { RandomNumber, DeepClone, FormatarNumero } from "./Utils";

const StarPath = [
  "Esquecido", //0
  "Péssimo", //100
  "Ruim", //200
  "Ok", //300
  "Bom", //400
  "Ótimo", //500
  "Deixou sua marca", //600
  "Estrela", //700
  "Ídolo Nacional", //800
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
  const [teams, setTeams] = useState([...Teams]);
  const [extrateams, setExtraTeams] = useState([...ExtraTeams]);
  const [nations, setNations] = useState([...Nations]);

  const [seasons, setSeasons] = useState([]);

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
    leagues: [],
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

  const [history, setHistory] = useState([]);

  const [year, setYear] = useState(new Date().getFullYear());

  const [contract, setContract] = useState(0);

  const [generalPerformance, setGeneralPerformance] = useState([]);
  const [maxFame, setMaxFame] = useState(0);

  const [transfers, setTransfers] = useState([]);

  const initStat = GetNewInit();

  const [renew, setRenew] = useState({ value: 0, duration: 0 });

  function ChooseInitStats(initStat) {
    //change display
    document.getElementById("team-choice").style.display = "flex";
    document.getElementById("init-choice").style.display = "none";

    let newPlayer = player;
    newPlayer.position = initStat.pos;
    newPlayer.nation = initStat.nat;

    let newTeams = UpdateTeamsStats(25.0);

    setPlayer(newPlayer);
    setTransfers(GetInitTeams(initStat.pos.value, newTeams));
  }

  function ChooseTeam(newTeam = null) {
    //change display
    document.getElementById("team-choice").style.display = "none";
    document.getElementById("continue").style.display = "flex";

    //load
    let newPlayer = player;
    let newGeneralPerformance = generalPerformance;
    let newHistory = history;

    //age and contract
    newPlayer.age++;
    let newContract = contract - 1;
    //pre season setup
    if (newTeam != null) {
      //if they change team
      let oldTeamLeague = newPlayer.team == null ? "" : newPlayer.team.league; //store old league table results
      newHistory.push(newTeam.team.name);
      if (newTeam.loan) {
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

      let lp = 99;
      //if the new team is in the same league as the old
      if (oldTeamLeague == newPlayer.team.league) {
        lp =
          currentSeason.leagueTable.findIndex(
            (team) => team === newPlayer.team
          ) + 1; //get the new team's position
      } else {
        let newLeague =
          teams.find((league) => league.name === newPlayer.team.league) || []; //find the new team league
        let bonuses = Array.from(
          { length: newLeague.teams.length },
          () => Math.round(50.0 * (Math.random() - Math.random())) / 100
        );
        const sum = bonuses.reduce((acc, val) => acc + val, 0);
        const adjustment = sum / newLeague.teams.length;
        bonuses = bonuses.map((num) => num - adjustment);
        let leagueResults = GetLeaguePosition(newLeague.teams, bonuses); //simulate the past season
        lp =
          leagueResults.findIndex((team) => team.name == newPlayer.team.name) +
          1;
      }

      //get players league
      let league = teams.find(
        (league) => league.name === newPlayer.team.league
      );

      //was classificated last year
      if (lp <= league.championsSpots) {
        //for the champions
        newPlayer.championsQualification = true;
        newPlayer.europaQualification = false;
        newPlayer.lastLeaguePosition = lp;
      } else if (lp <= league.championsSpots + league.europaSpots) {
        //for the europa league
        newPlayer.championsQualification = false;
        newPlayer.europaQualification = true;
      } else {
        //was not
        newPlayer.championsQualification = false;
        newPlayer.europaQualification = false;
      }
    } else if (newContract <= 0) {
      newContract = renew.duration; //new contrat length
      newPlayer.wage = renew.value; //new contrat value
    }

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
    newPlayer.performance =
      Math.round(100.0 * (Math.random() - Math.random())) / 100.0;

    newPlayer.overall =
      GetOverall(newPlayer.potential, newPlayer.age, newPlayer.team.power) +
      newPlayer.performance * 2;

    //set performance over team
    newGeneralPerformance.push(newPlayer.performance);
    if (newGeneralPerformance.length > 4) newGeneralPerformance.shift();

    //giving the performance, set how many games did they were the starter player
    let starting = Math.floor(
      (newPlayer.overall - (75 + newPlayer.team.power / 2)) / 0.1 +
        (Math.random() - Math.random()) * 10
    );
    if (starting > 100) starting = 100;
    else if (starting < 0) starting = 0;

    //change teams power on each season
    let newTeams = UpdateTeamsStats(50.0);
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
    let allNations = UpdateNationsStats();
    allNations.sort((a, b) => {
      return b.power - a.power;
    });
    //creates a list of top 12 nations
    let topNations = allNations.slice(0, 12);

    newPlayer.team = allTeams.find((t) => t.name == newPlayer.team.name); //find player's team by name and update
    newPlayer.nation = allNations.find((n) => n.name == newPlayer.nation.name); //find player's nation by name and update

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
        (Math.pow(newPlayer.team.power, Math.log10(50)) +
          newSeason.starting / 2)) /
      100.0;
    let assistsOppostunities =
      (newPlayer.position.assistsBonus *
        (Math.pow(newPlayer.team.power, Math.log10(50)) +
          newSeason.starting / 2)) /
      100.0;

    newSeason.goals = Math.floor(
      goalsOppostunities *
        (Math.pow(newPlayer.overall, 2.55853) / 100000.0) *
        (1.0 + newSeason.performance / 4.0) *
        (1.0 + (Math.random() - Math.random()) / 4.0)
    );
    newSeason.assists = Math.floor(
      assistsOppostunities *
        (Math.pow(newPlayer.overall, 2.55853) / 100000.0) *
        (1.0 + newSeason.performance / 4.0) *
        (1.0 + (Math.random() - Math.random()) / 4.0)
    );

    newSeason.awardPoints = newSeason.performance * 2; //min = -2.0 | max = 2.0

    let med = 0;
    for (let i = 0; i < generalPerformance.length; i++) {
      med += generalPerformance[i];
    }
    med /= generalPerformance.length;

    //national tournaments
    let league = teams.find((league) => league.name === newPlayer.team.league);

    let triplice = 0;

    //national league
    let bonuses = Array.from(
      { length: league.teams.length },
      () => Math.round(70.0 * (Math.random() - Math.random())) / 100
    );
    let playerIndex = league.teams.findIndex(
      (team) => team.name == newPlayer.team.name
    );
    bonuses[playerIndex] += newPlayer.performance * 0.7;
    bonuses[playerIndex] /= 2;
    const sum = bonuses.reduce((acc, val) => acc + val, 0);
    const adjustment = sum / league.teams.length;
    bonuses = bonuses.map((num) => num - adjustment);

    let leagueResults = GetLeaguePosition(league.teams, bonuses);

    const playerPosition =
      leagueResults.findIndex((team) => team.name == newPlayer.team.name) + 1;

    newSeason.leagueTable = leagueResults;

    //top eight from the league
    let topEight = "";
    for (let p = 0; p < 8; p++) {
      topEight += `-> ${p + 1}º: ${leagueResults[p].name}`;
    }

    newSeason.awardPoints +=
      ((league.championsSpots / 4.0) * (5 - playerPosition)) / 2; //max = 2.0

    //if fist place, then won trophy
    if (playerPosition == 1) {
      newPlayer.leagues.push(`${year} (${newPlayer.team.name})`);
      newPlayer.fame += 10;
      triplice++;
    }

    newSeason.titles.push(`Liga: ${playerPosition}º lugar ${topEight}`);

    let description = "";
    let end = false;
    let phase = 2;
    let playerPhase = 2;

    //get opponents for national cup
    let pot3 = DeepClone([...league.teams]);
    let pot1 = pot3.splice(0, pot3.length / 4);
    let pot2 = pot3.splice(0, pot3.length / 3);

    //embaralhar
    for (let i = pot1.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pot1[i], pot1[j]] = [pot1[j], pot1[i]];
    }

    for (let i = pot2.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pot2[i], pot2[j]] = [pot2[j], pot2[i]];
    }

    for (let i = pot3.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pot3[i], pot3[j]] = [pot3[j], pot3[i]];
    }

    let classif = pot1.concat(pot2, pot3);

    while (!end) {
      let newOpponentsLeft = [];
      let games = "";
      let playerGame = "";
      let playerEffect = 1 - phase / 10.0;
      for (let matchID = 0; matchID < classif.length / 2; matchID++) {
        let team1 = classif[matchID];
        let team2 = classif[classif.length - (matchID + 1)];
        let game = GetKnockoutResult(
          team1,
          team2,
          team1.name == newPlayer.team.name
            ? newSeason.performance * playerEffect
            : team2.name == newPlayer.team.name
            ? -newSeason.performance * playerEffect
            : 0,
          phase >= TournamentPath.length - 2 ? false : true
        );

        if (
          team1.name == newPlayer.team.name ||
          team2.name == newPlayer.team.name
        ) {
          playerGame += `: ${game.game}`;
          if (
            (game.result && team1.name == newPlayer.team.name) ||
            (!game.result && team2.name == newPlayer.team.name)
          ) {
            playerPhase++;
            newSeason.awardPoints += 0.3; //max 0.3 x 5 = 1.5
            if (playerPhase >= TournamentPath.length - 1) {
              newPlayer.nationalCup.push(`${year} (${newPlayer.team.name})`);
              newPlayer.fame += 10;
              newSeason.awardPoints += 0.5; //max 0.3 x 5 + 0.5 = 2.0
              triplice++;
            }
          }
        }

        games += `=> ${game.game}`;

        if (game.result) {
          newOpponentsLeft.push(team1);
        } else {
          newOpponentsLeft.push(team2);
        }
      }

      description += `-> ${TournamentPath[phase]}${
        playerGame != "" && phase + 1 < TournamentPath.length - 1
          ? playerGame
          : ""
      }`;
      description += games;

      phase++;
      classif = newOpponentsLeft;

      if (phase >= TournamentPath.length - 1) {
        end = true;
        description += `-> Vencedor: ${newOpponentsLeft[0].name}`;
      }
    }

    description = `Copa Nacional: ${TournamentPath[playerPhase]} ${description}`;
    newSeason.titles.push(description);

    if (newPlayer.championsQualification) {
      //Champions League
      phase = 0;
      playerPhase = 0;

      let qualified = [];

      //get top teams in each league
      for (let leagueID = 0; leagueID < teams.length; leagueID++) {
        let remainingTeams = DeepClone([...teams[leagueID].teams]);
        let selected = remainingTeams.splice(0, teams[leagueID].championsSpots);

        if (newPlayer.team.league == teams[leagueID].name) {
          let playerTeamSelected = selected.find(
            (team) => team.name == newPlayer.team.name
          );

          if (!playerTeamSelected) {
            let weakestTeamIndex = selected.length - 1;
            selected[weakestTeamIndex] = newPlayer.team;
          }
        }

        for (let i = 0; i < selected.length; i++) {
          qualified.push(DeepClone(selected[i]));
        }
      }

      qualified = qualified.concat(extrateams.slice(0, 12));

      let group = GetChampionsPosition(
        qualified,
        newPlayer.team,
        newPlayer.performance
      );

      description = `-> ${TournamentPath[playerPhase]}: ${group.pos}º lugar`;
      description += group.desc;

      let playoffsClassif = DeepClone([...group.table]).splice(0, 24);

      phase++;
      if (playoffsClassif.some((t) => t.name == newPlayer.team.name)) {
        playerPhase++;
      }

      let classif = playoffsClassif.splice(0, 8);

      let games = "";
      let playerGame = "";

      for (let matchID = 0; matchID < playoffsClassif.length / 2; matchID++) {
        let team1 = playoffsClassif[matchID];
        let team2 = playoffsClassif[playoffsClassif.length - (matchID + 1)];
        let game = GetKnockoutResult(
          team1,
          team2,
          team1.name == newPlayer.team.name
            ? newSeason.performance
            : team2.name == newPlayer.team.name
            ? -newSeason.performance
            : 0,
          true
        );

        if (
          team1.name == newPlayer.team.name ||
          team2.name == newPlayer.team.name
        ) {
          playerGame += `: ${game.game}`;
        }

        games += `=> ${game.game}`;

        if (game.result) {
          classif.push(team1);
        } else {
          classif.push(team2);
        }
      }

      description += `-> ${TournamentPath[phase]}${
        playerGame != "" && phase < TournamentPath.length - 1 ? playerGame : ""
      }`;
      description += games;

      if (classif.some((t) => t.name == newPlayer.team.name)) {
        playerPhase++;
      }

      phase++;
      end = false;
      while (!end) {
        let games = "";
        playerGame = "";
        let newClassif = [];
        let playerEffect = 1 - phase / 10.0;
        for (let matchID = 0; matchID < classif.length / 2; matchID++) {
          let team1 = classif[matchID];
          let team2 = classif[classif.length - (matchID + 1)];
          let game = GetKnockoutResult(
            team1,
            team2,
            team1.name == newPlayer.team.name
              ? newSeason.performance * playerEffect
              : team2.name == newPlayer.team.name
              ? -newSeason.performance * playerEffect
              : 0,
            phase >= TournamentPath.length - 2 ? false : true
          );

          if (
            team1.name == newPlayer.team.name ||
            team2.name == newPlayer.team.name
          ) {
            playerGame += `: ${game.game}`;

            if (
              (game.result && team1.name == newPlayer.team.name) ||
              (!game.result && team2.name == newPlayer.team.name)
            ) {
              playerPhase++;
              newSeason.awardPoints += 0.9; //max 0.9 x 5 = 4.5
              if (playerPhase >= TournamentPath.length - 1) {
                newPlayer.champions.push(`${year} (${newPlayer.team.name})`);
                newPlayer.fame += 40;
                newSeason.awardPoints += 1.5; //max 0.9 x 5 + 1.5 = 6.0
                triplice++;
              }
            }
          }

          games += `=> ${game.game}`;

          if (game.result) {
            newClassif.push(team1);
          } else {
            newClassif.push(team2);
          }
        }

        description += `-> ${TournamentPath[phase]}${
          playerGame != "" && phase + 1 < TournamentPath.length - 1
            ? playerGame
            : ""
        }`;
        description += games;

        phase++;
        classif = newClassif;

        if (phase >= TournamentPath.length - 1) {
          end = true;
          description += `-> Vencedor: ${newClassif[0].name}`;
        }
      }

      description = `Champions League: ${TournamentPath[playerPhase]} ${description}`;
      newSeason.titles.push(description);
    }

    if (newPlayer.europaQualification) {
      phase = 0;
      playerPhase = 0;
      description = "";

      let qualified = [];

      for (let leagueID = 0; leagueID < teams.length; leagueID++) {
        let remainingTeams = DeepClone([...teams[leagueID].teams]);
        let selected = remainingTeams.splice(
          teams[leagueID].championsSpots,
          teams[leagueID].europaSpots
        );

        if (newPlayer.team.league == teams[leagueID].name) {
          let playerTeamSelected = selected.find(
            (team) => team.name == newPlayer.team.name
          );

          if (!playerTeamSelected) {
            let weakestTeamIndex = selected.length - 1;

            selected[weakestTeamIndex] = newPlayer.team;
          }
        }

        for (let i = 0; i < selected.length; i++) {
          qualified.push(DeepClone(selected[i]));
        }
      }

      qualified = qualified.concat(extrateams.slice(12, extrateams.length));

      let group = GetEuropaPosition(
        qualified,
        newPlayer.team,
        newPlayer.performance
      );

      description = `-> ${TournamentPath[playerPhase]}: ${group.pos}º lugar`;
      description += group.desc;

      let classif = DeepClone([...group.table]).splice(0, 16);

      if (classif.some((t) => t.name == newPlayer.team.name)) {
        playerPhase += 2;
      }

      phase += 2;
      end = false;
      while (!end) {
        let games = "";
        let playerGame = "";
        let newClassif = [];
        let playerEffect = 1 - phase / 10.0;
        for (let matchID = 0; matchID < classif.length / 2; matchID++) {
          let team1 = classif[matchID];
          let team2 = classif[classif.length - (matchID + 1)];
          let game = GetKnockoutResult(
            team1,
            team2,
            team1.name == newPlayer.team.name
              ? newSeason.performance * playerEffect
              : team2.name == newPlayer.team.name
              ? -newSeason.performance * playerEffect
              : 0,
            phase >= TournamentPath.length - 2 ? false : true
          );

          if (
            team1.name == newPlayer.team.name ||
            team2.name == newPlayer.team.name
          ) {
            playerGame += `: ${game.game}`;

            if (
              (game.result && team1.name == newPlayer.team.name) ||
              (!game.result && team2.name == newPlayer.team.name)
            ) {
              playerPhase++;
              if (playerPhase >= TournamentPath.length - 1) {
                newPlayer.europa.push(`${year} (${newPlayer.team.name})`);
                newPlayer.fame += 10;
              }
            }
          }

          games += `=> ${game.game}`;

          if (game.result) {
            newClassif.push(team1);
          } else {
            newClassif.push(team2);
          }
        }

        description += `-> ${TournamentPath[phase]}${
          playerGame != "" && phase + 1 < TournamentPath.length - 1
            ? playerGame
            : ""
        }`;
        description += games;

        phase++;
        classif = newClassif;

        if (phase >= TournamentPath.length - 1) {
          end = true;
          description += `-> Vencedor: ${newClassif[0].name}`;
        }
      }

      description = `Europa League: ${TournamentPath[playerPhase]} ${description}`;
      newSeason.titles.push(description);
    }

    //World Cup
    if ((year + 2) % 4 == 0) {
      newSeason.awardPoints -= 2.0;
      phase = 0;
      playerPhase = 0;

      let allNations = DeepClone([...nations]);

      //was called by the manager
      let playedWorldCup =
        newPlayer.overall > 75 + newPlayer.nation.power ||
        (med > 0 && newPlayer.age <= 36 && newPlayer.age >= 24);

      //create four pots to the group draw
      let pots = Array.from({ length: 4 }, (_, potID) =>
        allNations.slice(potID * 12, (potID + 1) * 12)
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

            pots[potID] = pots[potID].filter(
              (n) => validNations[randomIndex] != n
            );
          } else {
            //if there is no other nation available, try repeating Europe
            validNations = pots[potID].filter((n) => n.continent == "Europa");
            if (validNations.length > 0) {
              let randomIndex = RandomNumber(0, validNations.length - 1);
              groups[GroupID].push(validNations[randomIndex]);
              pots[potID] = pots[potID].filter(
                (n) => validNations[randomIndex] != n
              );
            } else {
              validNations = pots[potID];
              if (validNations.length > 0) {
                let randomIndex = RandomNumber(0, validNations.length - 1);
                groups[GroupID].push(validNations[randomIndex]);
                pots[potID] = pots[potID].filter(
                  (n) => validNations[randomIndex] != n
                );
              } else {
                //if can't make a group
                throw new Error(
                  "Não foi possível gerar o grupo para a copa",
                  groups
                );
              }
            }
          }
        }
      }

      let playerGroup = null;
      let firstPlaces = [];
      let secondPlaces = [];
      let thirdPlaces = [];

      for (let groupID = 0; groupID < groups.length; groupID++) {
        let bonuses = Array.from(
          { length: groups[groupID].length },
          () => Math.round(70.0 * (Math.random() - Math.random())) / 100
        );
        let playerIndex = groups[groupID].findIndex(
          (team) => team.name == newPlayer.nation.name
        );
        bonuses[playerIndex] += newPlayer.performance * 0.7;
        bonuses[playerIndex] /= 2;
        const sum = bonuses.reduce((acc, val) => acc + val, 0);
        const adjustment = sum / groups[groupID].length;
        bonuses = bonuses.map((num) => num - adjustment);

        let thisGroup = GetWorldCupPosition(groups[groupID], bonuses);

        const playerPosition =
          thisGroup.table.findIndex(
            (team) => team.name == newPlayer.nation.name
          ) + 1;

        if (playerPosition > 0) {
          playerGroup = thisGroup;
          description = `-> ${TournamentPath[phase]}: ${playerGroup.table[0].name} / ${playerGroup.table[1].name} / ${playerGroup.table[2].name} / ${playerGroup.table[3].name}`;
          description += thisGroup.desc;
        }

        firstPlaces.push(thisGroup.table[0]);
        secondPlaces.push(thisGroup.table[1]);
        thirdPlaces.push(thisGroup.table[2]);
      }

      let classif = firstPlaces.concat(secondPlaces, thirdPlaces.slice(0, 8));
      phase++;

      if (classif.some((t) => t.name == newPlayer.nation.name)) {
        playerPhase++;
      }

      let end = false;
      while (!end) {
        let games = "";
        let newClassif = [];
        let playerGame = "";
        let playerEffect = 1 - phase / 10.0;
        for (let matchID = 0; matchID < classif.length / 2; matchID++) {
          let team1 = classif[matchID];
          let team2 = classif[classif.length - (matchID + 1)];
          let game = GetKnockoutResult(
            team1,
            team2,
            team1.name == player.nation.name
              ? newSeason.performance * playerEffect
              : team2.name == player.nation.name
              ? -newSeason.performance * playerEffect
              : 0,
            false
          );

          if (
            team1.name == player.nation.name ||
            team2.name == player.nation.name
          ) {
            playerGame += `: ${game.game}`;

            if (
              (game.result && team1.name == player.nation.name) ||
              (!game.result && team2.name == player.nation.name)
            ) {
              playerPhase++;
              if (playedWorldCup) newSeason.awardPoints += 0.9; //max 0.9 x 5 - 2.0 = 2.5
              if (playerPhase >= TournamentPath.length - 1) {
                if (playedWorldCup) {
                  newPlayer.worldCup.push(`${year}`);
                  newSeason.awardPoints += 1.5; //max 0.9 x 5 - 2.0 + 1.5 = 4.0
                  newPlayer.fame += 40;
                }
              }
            }
          }

          games += `=> ${game.game}`;

          if (game.result) {
            newClassif.push(team1);
          } else {
            newClassif.push(team2);
          }
        }

        description += `-> ${TournamentPath[phase]}${
          playerGame != "" && phase + 1 < TournamentPath.length - 1
            ? playerGame
            : ""
        }`;
        description += games;

        phase++;
        classif = newClassif;

        if (phase >= TournamentPath.length - 1) {
          end = true;
          description += `-> Vencedor: ${newClassif[0].name}`;
        }
      }

      description = `Copa do Mundo: ${TournamentPath[playerPhase]} ${
        playedWorldCup ? "" : " (Não Convocado)"
      } ${description}`;
      newSeason.titles.push(description);
    }

    //add goals to the carrer summary
    newPlayer.totalGoals += newSeason.goals;
    newPlayer.totalAssists += newSeason.assists;

    //post season results
    if (RandomNumber(1, 1000) <= 5) {
      //Puskás
      newPlayer.awards.push(`Puskás ${year} (${newPlayer.team.name})`);
      newSeason.titles.push("Puskás");
    }

    if (triplice >= 3) {
      newPlayer.awards.push(`Tríplice Coroa ${year} (${newPlayer.team.name})`);
      newSeason.titles.push("Tríplice Coroa");
      newPlayer.fame += 20;
      newSeason.awardPoints += 1.0;
    }

    if (45 + RandomNumber(0, 3) + RandomNumber(0, 2) < newSeason.goals) {
      //Golden Shoes
      newPlayer.awards.push(
        `Chuteiras de Ouro ${year} (${newPlayer.team.name})`
      );
      newSeason.awardPoints += 1.0;
      newPlayer.fame += 20;
      newSeason.titles.push("Chuteira de Ouro");
    } else if (
      player.position.title == "GK" &&
      newSeason.performance * 5 + (newPlayer.overall - 75) / 2 > 10
    ) {
      //Golden Gloves
      newPlayer.awards.push(`Luvas de Ouro ${year} (${newPlayer.team.name})`);
      newSeason.awardPoints += 1.0;
      newPlayer.fame += 20;
      newSeason.titles.push("Luva de Ouro");
    }

    newPlayer.fame += newSeason.performance * 10;

    newPlayer.fame += newSeason.goals / 5.0;
    newPlayer.fame += newSeason.assists / 5.0;

    let position = -1;

    if (newSeason.awardPoints + newPlayer.overall >= 100) {
      //Ballon D'or
      newPlayer.ballonDor.push(`Ballon D'or ${year} (${newPlayer.team.name})`);
      newPlayer.fame += 80;
      position = 1;

      newSeason.titles.push(`Ballon D'Or: 1º lugar`);
    } else if (newSeason.awardPoints + newPlayer.overall >= 91) {
      let pts = Math.floor(newSeason.awardPoints + newPlayer.overall - 91);
      newPlayer.fame += pts * 4;
      position = 10 - pts;
      newSeason.titles.push(`Ballon D'Or: ${position}º lugar`);
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

    if (newSeason.fame > maxFame) setMaxFame(newSeason.fame);

    //trasnfer window
    let newTransfers = GetNewTeams(newPlayer);

    if (
      //if ended loan
      newPlayer.contractTeam != null &&
      contract <= 1
    ) {
      newTransfers = [newPlayer.contractTeam];

      setRenew({
        value: newPlayer.contractTeam.contract.value,
        duration: newPlayer.contractTeam.contract.duration,
      });

      newPlayer.contractTeam = null;

      document.getElementById("decision-transfer1").style.display = "flex";
      document.getElementById("decision-transfer2").style.display = "none";
      document.getElementById("decision-transfer3").style.display = "none";
      document.getElementById("decision-stay").style.display = "flex";
      document.getElementById("retire").style.display = "none";
    } else if (
      //if played good midde contract
      newPlayer.performance >= newPlayer.team.power / 10 &&
      med > 0 &&
      generalPerformance.length >= 2 &&
      newTransfers[0] != null &&
      contract > 2
    ) {
      let contractValue = Math.round(
        newPlayer.position.value *
          GetWage(newPlayer.overall, newPlayer.team.power, newPlayer.fame)
      );

      if (contractValue < newPlayer.wage) contractValue = newPlayer.wage;

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
        value: contractValue,
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
      if (med < 0) {
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
    setPlayer(newPlayer);
    setTransfers(newTransfers);

    //set Seasons
    const newSeasons = [...seasons, newSeason];
    setSeasons(newSeasons);
  }

  function GetEuropaPosition(teams, playerTeam, bonus) {
    let desc = "";
    let newTeams = DeepClone(teams);
    //sort by power
    newTeams.sort((a, b) => {
      return a.power - b.power + Math.random() / 2;
    });

    let points = new Array(newTeams.length).fill(0);

    for (let round = 0; round < 6; round++) {
      let newOrderTeams = [];
      let newOrderPoints = [];
      for (let i = 0; i < newTeams.length / 2; i++) {
        let home = i;
        let away = i + newTeams.length / 2;

        let newBonus =
          newTeams[home].name == playerTeam.name
            ? bonus
            : newTeams[away].name == playerTeam.name
            ? -bonus
            : 0;

        let game = GetMatch(newTeams[home], newTeams[away], newBonus);

        if (
          newTeams[home].name == playerTeam.name ||
          newTeams[away].name == playerTeam.name
        )
          desc += `=> Rodada ${round + 1}: ${newTeams[home].name} ${
            game[0]
          } x ${game[1]} ${newTeams[away].name}`;

        if (game[0] > game[1]) {
          points[home] += 3;
        } else if (game[1] > game[0]) {
          points[away] += 3;
        } else {
          points[away] += 1;
          points[home] += 1;
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

    const playerPosition =
      table.findIndex((team) => team.name == playerTeam.name) + 1;

    return {
      pos: playerPosition,
      table: table,
      desc: desc,
    };
  }

  function GetChampionsPosition(teams, playerTeam, bonus) {
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

    for (let i = pot1.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pot1[i], pot1[j]] = [pot1[j], pot1[i]];
    }

    for (let i = pot2.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pot2[i], pot2[j]] = [pot2[j], pot2[i]];
    }

    for (let i = pot3.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pot3[i], pot3[j]] = [pot3[j], pot3[i]];
    }

    for (let i = pot4.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pot4[i], pot4[j]] = [pot4[j], pot4[i]];
    }

    newTeams = pot1.concat(pot2, pot3, pot4);

    let points = new Array(newTeams.length).fill(0);

    for (let round = 0; round < 8; round++) {
      let newOrderTeams = Array(newTeams.length).fill(null);
      let newOrderPoints = Array(newTeams.length).fill(0);
      for (let i = 0; i < newTeams.length - 1; i += 2) {
        let home = i;
        let away = i + 1;

        let newBonus =
          newTeams[home].name == playerTeam.name
            ? bonus
            : newTeams[away].name == playerTeam.name
            ? -bonus
            : 0;

        let game = GetMatch(newTeams[home], newTeams[away], newBonus);

        if (
          newTeams[home].name == playerTeam.name ||
          newTeams[away].name == playerTeam.name
        )
          desc += `=> Rodada ${round + 1}: ${newTeams[home].name} ${
            game[0]
          } x ${game[1]} ${newTeams[away].name}`;

        if (game[0] > game[1]) {
          points[home] += 3;
        } else if (game[1] > game[0]) {
          points[away] += 3;
        } else {
          points[away] += 1;
          points[home] += 1;
        }

        newOrderTeams[
          ((i * 2) % newTeams.length) + Math.floor((2 * i) / newTeams.length)
        ] = newTeams[home];
        newOrderTeams[
          (((i + 1) * 2) % newTeams.length) +
            Math.floor((2 * i) / newTeams.length)
        ] = newTeams[away];
        newOrderPoints[
          ((i * 2) % newTeams.length) + Math.floor((2 * i) / newTeams.length)
        ] = points[home];
        newOrderPoints[
          (((i + 1) * 2) % newTeams.length) +
            Math.floor((2 * i) / newTeams.length)
        ] = points[away];
      }

      newTeams = newOrderTeams;
      points = newOrderPoints;
    }

    let table = [...newTeams];

    table.sort((a, b) => {
      return points[table.indexOf(b)] - points[table.indexOf(a)];
    });

    const playerPosition =
      table.findIndex((team) => team.name == playerTeam.name) + 1;

    return {
      pos: playerPosition,
      table: table,
      desc: desc,
    };
  }

  function GetLeaguePosition(teams, bonuses) {
    let newTeams = DeepClone(teams);

    let points = new Array(newTeams.length).fill(0);
    for (let home = 0; home < newTeams.length; home++) {
      let newBonus = Math.round(bonuses[home] * 100) / 100;
      for (let away = 0; away < newTeams.length; away++) {
        if (newTeams[home] !== newTeams[away]) {
          let game = GetMatch(newTeams[home], newTeams[away], newBonus);

          if (game[0] > game[1]) {
            points[home] += 3;
          } else if (game[1] > game[0]) {
            points[away] += 3;
          } else {
            points[away] += 1;
            points[home] += 1;
          }
        }
      }
    }

    let table = [...newTeams];

    table.sort((a, b) => {
      return points[table.indexOf(b)] - points[table.indexOf(a)];
    });

    return table;
  }

  function GetWorldCupPosition(teams, bonuses) {
    let desc = "";
    let newTeams = DeepClone([...teams]);
    let points = new Array(teams.length).fill(0);

    for (let home = 0; home < teams.length; home++) {
      let newBonus = newTeams[home].name == bonuses[home];
      for (let away = 0; away < home; away++) {
        if (teams[home] !== teams[away]) {
          let game = GetMatch(teams[home], teams[away], newBonus);

          if (game[0] > game[1]) {
            points[home] += 3;
          } else if (game[1] > game[0]) {
            points[away] += 3;
          } else {
            points[away] += 1;
            points[home] += 1;
          }

          desc += `=> ${teams[home].name} ${game[0]} x ${game[1]} ${teams[away].name}`;
        }
      }
    }

    let table = [...newTeams];

    table.sort((a, b) => {
      return points[table.indexOf(b)] - points[table.indexOf(a)];
    });

    return {
      table: table,
      desc: desc,
    };
  }

  function GetMatch(team1, team2, bonus) {
    let base = Math.pow(team1.power, 2) + Math.pow(team2.power, 2);
    let team1Power = Math.pow(team1.power, 2) / base;
    let team2Power = Math.pow(team2.power, 2) / base;

    let goals = Math.random() + Math.random() * 1.5;

    let team1Luck = (Math.random() + Math.random()) * 2;
    let team2Luck = (Math.random() + Math.random()) * 2;

    let team1Score = Math.round(goals * team1Luck * team1Power + bonus);
    let team2Score = Math.round(goals * team2Luck * team2Power);

    if (team1Score < 0) team1Score = 0;
    if (team2Score < 0) team2Score = 0;

    return [team1Score, team2Score];
  }

  function GetExtraTime(team1, team2) {
    let base = Math.pow(team1.power, 2) + Math.pow(team2.power, 2);
    let team1Power = Math.pow(team1.power, 2) / base;
    let team2Power = Math.pow(team2.power, 2) / base;

    let goals = Math.random() + Math.random();

    let team1Luck = Math.random() + Math.random();
    let team2Luck = Math.random() + Math.random();

    let team1Score = Math.round(goals * team1Luck * team1Power);
    let team2Score = Math.round(goals * team2Luck * team2Power);

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

  function GetKnockoutResult(team1, team2, bonus, ida_e_volta) {
    let gameDesc = "";

    let game = GetMatch(team1, team2, bonus);
    let teamGoals1 = game[0];
    let teamGoals2 = game[1];

    if (ida_e_volta) {
      let game2 = GetMatch(team2, team1, -bonus);
      teamGoals1 += game2[1];
      teamGoals2 += game2[0];
    }

    if (teamGoals1 == teamGoals2) {
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
    let allTeams = teams.reduce((acumulador, liga) => {
      return acumulador.concat(liga.teams);
    }, []);

    allTeams.sort((a, b) => {
      return b.power - a.power + Math.random() / 2;
    });

    let interestedCut = 1;
    if (currentPlayer.overall > 90) {
      interestedCut = 4;
    } else if (currentPlayer.overall > 85) {
      interestedCut = 3;
    } else if (currentPlayer.overall > 80) {
      interestedCut = 2;
    }

    allTeams = allTeams.slice(0, allTeams.length / interestedCut);

    let interestedTeams = [];

    for (let i = 0; i < allTeams.length; i++) {
      let chance = currentPlayer.overall / allTeams[i].power;

      let r = RandomNumber(0, 100);
      if (r < chance && !history.some((t) => t == allTeams[i].name)) {
        interestedTeams.push(allTeams[i]);
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
          currentPlayer.position.value *
            GetTransferValue(expectedOverall, team.power)
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
      return b.power - a.power + Math.random() / 2;
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

    let contractDurations = [
      RandomNumber(2, 5),
      RandomNumber(2, 5),
      RandomNumber(2, 5),
    ];

    let contractWages = [
      Math.round(
        posValue * GetWage(GetOverall(0, 18, teams[0].power), teams[0].power, 0)
      ),
      Math.round(
        posValue * GetWage(GetOverall(0, 18, teams[1].power), teams[1].power, 0)
      ),
      Math.round(
        posValue * GetWage(GetOverall(0, 18, teams[2].power), teams[2].power, 0)
      ),
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
      Math.round(
        posValue * GetTransferValue(expectedOveralls[0], teams[0].power)
      ),
      Math.round(
        posValue * GetTransferValue(expectedOveralls[1], teams[1].power)
      ),
      Math.round(
        posValue * GetTransferValue(expectedOveralls[2], teams[2].power)
      ),
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

  function GetNewInit() {
    let newPos = DeepClone(Positions);
    for (let i = newPos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newPos[i], newPos[j]] = [newPos[j], newPos[i]];
    }

    let newNat = DeepClone(Nations);
    for (let i = newNat.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newNat[i], newNat[j]] = [newNat[j], newNat[i]];
    }

    return [
      {
        pos: newPos[0],
        nat: newNat[0],
      },
      {
        pos: newPos[1],
        nat: newNat[1],
      },
      {
        pos: newPos[2],
        nat: newNat[2],
      },
    ];
  }

  function GetOverall(potential, age, teamPower) {
    return (
      89 +
      potential / 10 +
      Math.round(10.0 * teamPower) / 100 -
      (28 - age) ** 2 / 10
    );
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
    let newTeams = DeepClone([...teams]);

    for (let leagueID = 0; leagueID < newTeams.length; leagueID++) {
      let last = Math.random();
      let teamIndices = Array.from(
        { length: newTeams[leagueID].teams.length },
        (_, index) => index
      );
      for (let i = teamIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [teamIndices[i], teamIndices[j]] = [teamIndices[j], teamIndices[i]];
      }

      for (let i = 0; i < newTeams[leagueID].teams.length; i++) {
        let teamID = teamIndices[i];

        let current = Math.random();
        let change = Math.round(limit * (last - current)) / 100.0;
        last = current;

        let newPower = newTeams[leagueID].teams[teamID].power + change;
        newTeams[leagueID].teams[teamID].power =
          Math.round(100.0 * newPower) / 100;

        if (newTeams[leagueID].teams[teamID].power > 10)
          newTeams[leagueID].teams[teamID].power = 10;
        else if (newTeams[leagueID].teams[teamID].power < 2)
          newTeams[leagueID].teams[teamID].power = 2;
      }

      newTeams[leagueID].teams.sort((a, b) => {
        return b.power - a.power;
      });
    }
    setTeams(newTeams);
    return newTeams;
  }

  function UpdateExtraTeamsStats() {
    let newTeams = DeepClone([...extrateams]);
    let last = Math.random();
    let teamIndices = Array.from(
      { length: newTeams.length },
      (_, index) => index
    );
    for (let i = teamIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [teamIndices[i], teamIndices[j]] = [teamIndices[j], teamIndices[i]];
    }

    for (let i = 0; i < newTeams.length; i++) {
      let teamID = teamIndices[i];

      let current = Math.random();
      let change = Math.round(25.0 * (last - current)) / 100.0;
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
    let newNations = DeepClone([...nations]);

    let last = Math.random();
    let nationIndices = Array.from(
      { length: newNations.length },
      (_, index) => index
    );
    for (let i = nationIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nationIndices[i], nationIndices[j]] = [
        nationIndices[j],
        nationIndices[i],
      ];
    }

    for (let i = 0; i < newNations.length; i++) {
      let nationID = nationIndices[i];

      let current = Math.random();
      let change = Math.round(50.0 * (last - current)) / 100.0;
      last = current;

      let newPower = newNations[nationID].power + change;

      newNations[nationID].power = Math.round(100.0 * newPower) / 100.0;

      if (newNations[nationID].power > 10) newNations[nationID].power = 10;
      else if (newNations[nationID].power < 2) newNations[nationID].power = 2;
    }

    newNations.sort((a, b) => {
      return b.power - a.power;
    });
    setNations(newNations);
    return newNations;
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
          <li>
            Você pode recarregar a página para alterar os atributos iniciais do
            jogador
          </li>
          <li>Boa sorte e divirta-se</li>
        </ol>
      </header>
      <div className="career">
        {seasons.map((s, index) => (
          <Season key={index} season={s} open={index >= seasons.length - 1} />
        ))}
      </div>
      <div className="choices" id="init-choice">
        <a className="d-alert" onClick={() => ChooseInitStats(initStat[0])}>
          <p>
            {initStat[0].pos.title} | {initStat[0].nat.name}
          </p>
        </a>
        <a className="d-alert" onClick={() => ChooseInitStats(initStat[1])}>
          <p>
            {initStat[1].pos.title} | {initStat[1].nat.name}
          </p>
        </a>
        <a className="d-alert" onClick={() => ChooseInitStats(initStat[2])}>
          <p>
            {initStat[2].pos.title} | {initStat[2].nat.name}
          </p>
        </a>
      </div>
      <div className="choices" id="team-choice" style={{ display: "none" }}>
        <a
          className="d-stay"
          id="decision-stay"
          style={{ display: "none" }}
          onClick={() => ChooseTeam()}
        >
          <p>
            Continuar em {player.team == null ? "null" : player.team.name} (
            {player.team == null ? "null" : (player.team.power / 2).toFixed(2)}
            ⭐)
          </p>
          <p>
            ${FormatarNumero(renew.value)}/ano |
            {renew.duration + " " + (renew.duration > 1 ? "anos" : "ano")}
          </p>
        </a>
        <a
          className="d-alert"
          id="decision-transfer1"
          onClick={() => ChooseTeam(transfers[0])}
        >
          <p>
            {transfers[0] == null
              ? "null"
              : transfers[0].loan
              ? "Empréstimo"
              : "Transferir"}{" "}
            para {transfers[0] == null ? "null" : transfers[0].team.name} (
            {transfers[0] == null
              ? "null"
              : (transfers[0].team.power / 2).toFixed(2)}
            ⭐)
          </p>
          <p>
            $
            {transfers[0] == null
              ? "null"
              : FormatarNumero(transfers[0].contract.value)}
            /ano |{" "}
            {transfers[0] == null ? "null" : transfers[0].contract.duration}{" "}
            anos
          </p>
        </a>
        <a
          className="d-alert"
          id="decision-transfer2"
          onClick={() => ChooseTeam(transfers[1])}
        >
          <p>
            {transfers[1] == null
              ? "null"
              : transfers[1].loan
              ? "Empréstimo"
              : "Transferir"}{" "}
            para {transfers[1] == null ? "null" : transfers[1].team.name} (
            {transfers[1] == null
              ? "null"
              : (transfers[1].team.power / 2).toFixed(2)}
            ⭐)
          </p>
          <p>
            $
            {transfers[1] == null
              ? "null"
              : FormatarNumero(transfers[1].contract.value)}
            /ano |{" "}
            {transfers[1] == null ? "null" : transfers[1].contract.duration}{" "}
            anos
          </p>
        </a>
        <a
          className="d-alert"
          id="decision-transfer3"
          onClick={() => ChooseTeam(transfers[2])}
        >
          <p>
            {transfers[2] == null
              ? "null"
              : transfers[2].loan
              ? "Empréstimo"
              : "Transferir"}{" "}
            para {transfers[2] == null ? "null" : transfers[2].team.name} (
            {transfers[2] == null
              ? "null"
              : (transfers[2].team.power / 2).toFixed(2)}
            ⭐)
          </p>
          <p>
            $
            {transfers[2] == null
              ? "null"
              : FormatarNumero(transfers[2].contract.value)}
            /ano |{" "}
            {transfers[2] == null ? "null" : transfers[2].contract.duration}{" "}
            anos
          </p>
        </a>
        <a
          className="d-alert"
          id="retire"
          style={{ display: "none" }}
          onClick={() => Retire()}
        >
          Aposentar-se
        </a>
      </div>
      <div className="choices" id="continue" style={{ display: "none" }}>
        <a className="d-stay" onClick={() => Continue()}>
          Simular Temporada ({contract}{" "}
          {contract > 1 ? "anos restantes" : "ano restante"})
        </a>
      </div>
      <div className="chart" id="chart" style={{ display: "none" }}>
        <ChartComponent data={seasons} />
      </div>
      <div className="stats">
        <h1>Carreira</h1>
        <div>
          <p>
            Fama da Carreira: {Math.floor(maxFame)} (
            {StarPath[Math.min(Math.floor(maxFame / 100), StarPath.length - 1)]}
            )
          </p>
          <p>
            Posição:{" "}
            {player.position == null ? "A definir" : player.position.title}
          </p>
          <p>
            Seleção: {player.nation == null ? "A definir" : player.nation.name}
          </p>
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
            <summary>Ligas: {player.leagues.length}</summary>
            {player.leagues.map((l) => (
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
    </>
  );
}

export default App;
