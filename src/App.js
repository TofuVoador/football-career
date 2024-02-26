import React, { useState } from "react";
import "./App.css";
import Teams from "./Database/teams.json";
import ExtraTeams from "./Database/extrateams.json";
import Nations from "./Database/nations.json";
import Positions from "./Database/positions.json";
import ChartComponent from "./Components/chartComponent";
import Season from "./Components/season";
import { RandomNumber, DeepClone } from "./Utils";

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
  "16 avos",
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

  const [transfer1, setTransfer1] = useState(GetNewTeam());

  const [transfer2, setTransfer2] = useState(GetNewTeam());

  const initStat1 = {
    pos: GetNewPosition(),
    nat: Nations[RandomNumber(0, 35)],
  };

  const initStat2 = {
    pos: GetNewPosition(),
    nat: Nations[RandomNumber(0, 35)],
  };

  const initStat3 = {
    pos: GetNewPosition(),
    nat: Nations[RandomNumber(0, 35)],
  };

  const [renew, setRenew] = useState({ value: 0, duration: 0 });

  function ChooseInitStats(initStat) {
    //change display
    document.getElementById("team-choice").style.display = "flex";
    document.getElementById("init-choice").style.display = "none";

    let newPlayer = player;
    newPlayer.position = initStat.pos;
    newPlayer.nation = initStat.nat;

    setPlayer(newPlayer);
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
    if (newTeam) {
      //if they change team
      newHistory.push(newTeam.team.name);
      let oldTeamLeague = newPlayer.team == null ? "" : newPlayer.team.league; //store old league table results
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
        let nationalTeams =
          teams.find((league) => league.name === newPlayer.team.league)
            ?.teams || []; //find the new team league
        lp = GetLeaguePosition(nationalTeams, newPlayer.team, 0.5).pos; //simulate the past season
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
      //else if contract expires
      newPlayer.marketValue = Math.max(
        transfer1.transferValue,
        transfer2.transferValue
      );

      newContract = renew.duration; //new contrat length
      newPlayer.wage = renew.value; //new contrat value
    }

    //calcule the player's performance
    newPlayer.performance =
      Math.round(50.0 * (Math.random() - Math.random())) / 50.0;

    newPlayer.overall =
      GetOverall(newPlayer.potential, newPlayer.age, newPlayer.team.power) +
      newPlayer.performance * 2;

    //set performance over time
    newGeneralPerformance.push(newPlayer.performance);
    if (newGeneralPerformance.length > 3) newGeneralPerformance.shift();

    //giving the performance, set how many games did they were the starter player
    let starting = Math.floor(
      (newPlayer.overall - (75 + newPlayer.team.power / 2)) / 0.1 +
        (Math.random() - Math.random()) * 10
    );
    if (starting > 100) starting = 100;
    else if (starting < 0) starting = 0;

    //change teams power on each season
    let newTeams = UpdateTeamsStats();
    let newExtraTeams = UpdateExtraTeamsStats();

    let allTeams = [];
    for (let leagueID = 0; leagueID < newTeams.length; leagueID++) {
      allTeams = allTeams.concat([...newTeams[leagueID].teams]);
    }
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
    let leagueResults = GetLeaguePosition(
      league.teams,
      newPlayer.team,
      newSeason.performance
    );

    newSeason.leagueTable = leagueResults.table;

    //top six from the league
    let topSix = "";
    for (let p = 0; p < 6; p++) {
      topSix += `-> ${p + 1}º: ${leagueResults.table[p].name}`;
    }

    newSeason.awardPoints +=
      ((league.championsSpots / 4.0) * (5 - leagueResults.pos)) / 2; //max = 2.0

    //if fist place, then won trophy
    if (leagueResults.pos == 1) {
      newPlayer.leagues.push(`${year} (${newPlayer.team.name})`);
      newPlayer.fame += 10;
      triplice++;
    }

    newSeason.titles.push(`Liga: ${leagueResults.pos}º lugar ${topSix}`);

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
      for (let matchID = 0; matchID < classif.length / 2; matchID++) {
        let team1 = classif[matchID];
        let team2 = classif[classif.length - (matchID + 1)];
        let game = GetKnockoutResult(
          team1,
          team2,
          team1.name == newPlayer.team.name
            ? newSeason.performance
            : team2.name == newPlayer.team.name
            ? -newSeason.performance
            : 0
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
              newPlayer.nationalCup.push(`${year} (${newPlayer.team.name})`);
              newPlayer.fame += 10;
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

      qualified.sort((a, b) => {
        return b.power - a.power + Math.random() / 2;
      });

      let group = GetRoundsPosition(qualified, newPlayer.team, 8);

      description = `-> ${TournamentPath[playerPhase]}: ${group.pos}º lugar`;
      description += group.desc;

      let playoffsClassif = DeepClone([...group.table]).splice(0, 24);

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
            : 0
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

      description += `-> Playoffs${
        playerGame != "" && phase + 1 < TournamentPath.length - 1
          ? playerGame
          : ""
      }`;
      description += games;

      if (classif.some((t) => t.name == newPlayer.team.name)) {
        playerPhase += 2;
      }

      phase += 2;
      end = false;
      while (!end) {
        let games = "";
        playerGame = "";
        let newClassif = [];
        for (let matchID = 0; matchID < classif.length / 2; matchID++) {
          let team1 = classif[matchID];
          let team2 = classif[classif.length - (matchID + 1)];
          let game = GetKnockoutResult(
            team1,
            team2,
            team1.name == newPlayer.team.name
              ? newSeason.performance
              : team2.name == newPlayer.team.name
              ? -newSeason.performance
              : 0
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

      qualified = qualified.concat(extrateams.slice(8, extrateams.length));

      qualified.sort((a, b) => {
        return b.power - a.power + Math.random() / 2;
      });

      let group = GetRoundsPosition(qualified, newPlayer.team, 6);

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
        for (let matchID = 0; matchID < classif.length / 2; matchID++) {
          let team1 = classif[matchID];
          let team2 = classif[classif.length - (matchID + 1)];
          let game = GetKnockoutResult(
            team1,
            team2,
            team1.name == newPlayer.team.name
              ? newSeason.performance
              : team2.name == newPlayer.team.name
              ? -newSeason.performance
              : 0
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
        let thisGroup = GetWorldCupPosition(
          groups[groupID],
          newPlayer.nation,
          0
        );

        if (groups[groupID].some((n) => n.name == newPlayer.nation.name)) {
          playerGroup = thisGroup;
          description = `-> ${TournamentPath[phase]}: ${playerGroup.table[0].name} / ${playerGroup.table[1].name} / ${playerGroup.table[2].name} / ${playerGroup.table[3].name}`;
          description += thisGroup.desc;
        }

        firstPlaces.push(thisGroup.table[0]);
        secondPlaces.push(thisGroup.table[1]);
        thirdPlaces.push(thisGroup.table[2]);
      }

      firstPlaces.sort((a, b) => {
        return b.power - a.power + Math.random() / 2;
      });

      secondPlaces.sort((a, b) => {
        return b.power - a.power + Math.random() / 2;
      });

      thirdPlaces.sort((a, b) => {
        return b.power - a.power + Math.random() / 2;
      });

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
        for (let matchID = 0; matchID < classif.length / 2; matchID++) {
          let team1 = classif[matchID];
          let team2 = classif[classif.length - (matchID + 1)];
          let game = GetKnockoutResult(
            team1,
            team2,
            team1.name == player.nation.name
              ? newSeason.performance
              : team2.name == player.nation.name
              ? -newSeason.performance
              : 0
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

      description = `World Cup: ${TournamentPath[playerPhase]} ${
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

    //trasnfer window

    if (contract <= 1) {
      //fired
      if (
        (newPlayer.overall <= 82 + newPlayer.team.power / 2 &&
          newPlayer.age > 34) ||
        med <= -0.2
      ) {
        document.getElementById("decision-stay").style.display = "none";
      } else {
        document.getElementById("decision-stay").style.display = "flex";
        let renewDuration = RandomNumber(1, 4);

        let renewValue =
          Math.floor(
            newPlayer.position.value *
              (newPlayer.overall ** 4 / 1000000) *
              (1 + (Math.random() - Math.random()) / 10.0) *
              (1 + newPlayer.team.power / 50.0)
          ) / 10.0;
        setRenew({ value: renewValue, duration: renewDuration });
      }

      let newTransfer1 = GetNewTeam(newPlayer);
      let newTransfer2 = GetNewTeam(newPlayer);

      if (newTransfer1 == null) {
        document.getElementById("decision-transfer1").style.display = "none";
      } else {
        document.getElementById("decision-transfer1").style.display = "flex";
        setTransfer1(newTransfer1);
      }

      if (newTransfer1 != null) {
        if (
          newTransfer2 == null ||
          newTransfer2.team.name == newTransfer1.team.name
        ) {
          document.getElementById("decision-transfer2").style.display = "none";
        } else {
          document.getElementById("decision-transfer2").style.display = "flex";
          setTransfer2(newTransfer2);
        }
      } else {
        if (newTransfer2 == null) {
          document.getElementById("decision-transfer2").style.display = "none";
          document.getElementById("retire").style.display = "flex";
        } else {
          setTransfer2(newTransfer2);
        }
      }
    }

    if (newPlayer.age >= 32) {
      //retire option
      document.getElementById("retire").style.display = "flex";
    }

    //setup next season
    if (leagueResults.pos <= league.championsSpots) {
      newPlayer.championsQualification = true;
      newPlayer.europaQualification = false;
      newPlayer.lastLeaguePosition = leagueResults.pos;
    } else if (
      leagueResults.pos <=
      league.championsSpots + league.europaSpots
    ) {
      newPlayer.championsQualification = false;
      newPlayer.europaQualification = true;
    } else {
      newPlayer.championsQualification = false;
      newPlayer.europaQualification = false;
    }

    //set ayer
    setPlayer(newPlayer);

    if (newPlayer.fame < 0) newPlayer.fame = 0;

    newSeason.fame = newPlayer.fame;

    if (newSeason.fame > maxFame) setMaxFame(newSeason.fame);

    //set Seasons
    const newSeasons = [...seasons, newSeason];
    setSeasons(newSeasons);

    //continue
    if (contract > 1) ChooseTeam();
  }

  function GetRoundsPosition(teams, playerTeam, rounds) {
    let desc = "";
    let newTeams = DeepClone(teams);
    //sort by power
    newTeams.sort((a, b) => {
      return a.power - b.power + Math.random() / 2;
    });

    let points = new Array(newTeams.length).fill(0);

    for (let round = 0; round < rounds; round++) {
      let newOrderTeams = [];
      let newOrderPoints = [];
      for (let i = 0; i < newTeams.length / 2; i++) {
        let home = i;
        let away = i + newTeams.length / 2;

        let game = GetMatch(newTeams[home], newTeams[away], 0);

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

    const playerPosition = table.findIndex(
      (time) => time.name == playerTeam.name
    );

    return {
      pos: playerPosition + 1,
      table: table,
      desc: desc,
    };
  }

  function GetLeaguePosition(teams, playerTeam, bonus) {
    let newTeams = DeepClone(teams);

    let points = new Array(newTeams.length).fill(0);
    for (let home = 0; home < newTeams.length; home++) {
      let newBonus =
        newTeams[home].name == playerTeam.name
          ? bonus
          : Math.round(10.0 * (Math.random() - Math.random())) / 10;
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

    const playerPosition = table.findIndex(
      (time) => time.name == playerTeam.name
    );

    return {
      pos: playerPosition + 1,
      table: table,
    };
  }

  function GetWorldCupPosition(teams, playerTeam, bonus) {
    let desc = "";
    let newTeams = DeepClone([...teams]);
    let points = new Array(teams.length).fill(0);
    for (let home = 0; home < teams.length; home++) {
      let newBonus =
        newTeams[home].name == playerTeam.name
          ? bonus
          : Math.round(10.0 * (Math.random() - Math.random())) / 10;
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

          if (
            teams[home].name == playerTeam.name ||
            teams[away].name == playerTeam.name
          )
            desc += `=> Rodada ${home}: ${teams[home].name} ${game[0]} x ${game[1]} ${teams[away].name}`;
        }
      }
    }

    let table = [...newTeams];

    table.sort((a, b) => {
      return points[table.indexOf(b)] - points[table.indexOf(a)];
    });

    const playerPosition = table.findIndex(
      (time) => time.name == playerTeam.name
    );

    return {
      pos: playerPosition + 1,
      table: table,
      desc: desc,
    };
  }

  function GetMatch(team1, team2, bonus) {
    let base = team1.power + team2.power;
    let team1Power = team1.power / base;
    let team2Power = team2.power / base;

    let goals = Math.random() + Math.random() + Math.random() / 2;

    let team1Luck = (Math.random() + Math.random()) * 2;
    let team2Luck = (Math.random() + Math.random()) * 2;

    let team1Score = Math.round(goals * team1Luck * team1Power + bonus / 2);
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
    let base = Math.pow(team1.power, 3) + Math.pow(team2.power, 3);
    let team1Power = Math.pow(team1.power, 3) / base;
    let team2Power = Math.pow(team2.power, 3) / base;

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

  function GetKnockoutResult(team1, team2, bonus) {
    let gameDesc = "";

    let game = GetMatch(team1, team2, bonus);
    let teamGoals1 = game[0];
    let teamGoals2 = game[1];

    if (teamGoals1 == teamGoals2) {
      let extra = GetExtraTime(team1, team2, bonus);
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

  function GetNewTeam(currentPlayer = null) {
    //randomize a play
    let leagueID = RandomNumber(0, teams.length - 1);
    let league = teams[leagueID];
    let team = league.teams[Math.round(2 + Math.random() * 5)];
    let contractDuration = RandomNumber(2, 5);
    let contractValue =
      Math.floor(
        32 *
          (1 + (Math.random() - Math.random()) / 10.0) *
          (1 + team.power / 50.0)
      ) / 10.0;
    let transferValue =
      Math.floor(
        2400 *
          (1 + (Math.random() - Math.random()) / 10.0) *
          (1 + team.power / 50.0)
      ) / 100.0;

    if (currentPlayer) {
      //identificar de qual liga o jogador é
      let playerLeague = teams.find(
        (league) => league.name === currentPlayer.team.league
      );
      playerLeague.teams.sort((a, b) => {
        return b.power - a.power;
      });
      let currentPlayerTeamRank = playerLeague.teams.findIndex(
        (team) => team.name === currentPlayer.team.name
      );
      let count = 0;
      while (
        history.some((t) => t == team.name) ||
        (team.power < currentPlayer.team.power - count / 3 &&
          currentPlayer.age < 34) ||
        (currentPlayer.overall < 82 + team.power / 2 && currentPlayer.age >= 34)
      ) {
        leagueID = RandomNumber(0, teams.length - 1);
        league = teams[leagueID];
        team =
          league.teams[
            Math.round(Math.random() * currentPlayerTeamRank + count / 3)
          ];

        count++;

        if (count >= 15) return null;
      }

      contractDuration = RandomNumber(1, 4);
      if (currentPlayer.age < 34) contractDuration++;

      let expectedOverall =
        GetOverall(
          currentPlayer.potential,
          currentPlayer.age + Math.round(contractDuration / 2),
          team.power
        ) + currentPlayer.performance;

      contractValue =
        Math.floor(
          currentPlayer.position.value *
            (expectedOverall ** 4 / 1000000) *
            (1 + (Math.random() - Math.random()) / 10.0) *
            (1 + team.power / 50.0)
        ) / 10.0;

      transferValue =
        Math.floor(
          currentPlayer.position.value *
            (currentPlayer.overall ** 5 / 1000000) *
            (1 + (Math.random() - Math.random()) / 10.0) *
            (1 + team.power / 50.0) +
            currentPlayer.fame
        ) / 100.0;
    }

    let newContract = { value: contractValue, duration: contractDuration };

    return { team: team, contract: newContract, transferValue: transferValue };
  }

  function GetNewPosition() {
    let posID = RandomNumber(0, Positions.length - 1);
    let pos = Positions[posID];
    return pos;
  }

  function GetOverall(potential, age, teamPower) {
    return (
      89 +
      potential / 10 +
      Math.round(10 * teamPower) / 50 -
      (28 - age) ** 2 / 10
    );
  }

  function Retire() {
    document.getElementById("team-choice").style.display = "none";
    document.getElementById("continue").style.display = "none";
    document.getElementById("chart").style.display = "flex";
  }

  function UpdateTeamsStats() {
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
        let change = Math.round(5 * (last - current)) / 10.0;
        last = current;

        let newPower = newTeams[leagueID].teams[teamID].power + change;

        newTeams[leagueID].teams[teamID].power =
          Math.round(10.0 * newPower) / 10;

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
      let change = Math.round(5 * (last - current)) / 10.0;
      last = current;

      let newPower = newTeams[teamID].power + change;
      newTeams[teamID].power = Math.round(10.0 * newPower) / 10;

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
      let change = Math.round(5 * (last - current)) / 10.0;
      last = current;

      let newPower = newNations[nationID].power + change;

      newNations[nationID].power = Math.round(10.0 * newPower) / 10.0;

      newNations[nationID].power =
        Math.round(newNations[nationID].power * 10) / 10;

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
        <a className="d-alert" onClick={() => ChooseInitStats(initStat1)}>
          <p>
            {initStat1.pos.title} | {initStat1.nat.name}
          </p>
        </a>
        <a className="d-alert" onClick={() => ChooseInitStats(initStat2)}>
          <p>
            {initStat2.pos.title} | {initStat2.nat.name}
          </p>
        </a>
        <a className="d-alert" onClick={() => ChooseInitStats(initStat3)}>
          <p>
            {initStat3.pos.title} | {initStat3.nat.name}
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
            Continuar em {player.team == null ? "" : player.team.name} (
            {(
              Math.round(player.team == null ? 0 : player.team.power * 5) / 10
            ).toFixed(1)}
            ⭐)
          </p>
          <p>
            ${renew.value}M/ano |
            {renew.duration + " " + (renew.duration > 1 ? "anos" : "ano")}
          </p>
        </a>
        <a
          className="d-alert"
          id="decision-transfer1"
          onClick={() => ChooseTeam(transfer1)}
        >
          <p>
            Transferir para {transfer1.team.name} (
            {(Math.round(transfer1.team.power * 5) / 10).toFixed(1)}⭐)
          </p>
          <p>
            ${transfer1.contract.value}M/ano | {transfer1.contract.duration}{" "}
            anos
          </p>
        </a>
        <a
          className="d-alert"
          id="decision-transfer2"
          onClick={() => ChooseTeam(transfer2)}
        >
          <p>
            Transferir para {transfer2.team.name} (
            {(Math.round(transfer2.team.power * 5) / 10).toFixed(1)}⭐)
          </p>
          <p>
            ${transfer2.contract.value}M/ano | {transfer2.contract.duration}{" "}
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
