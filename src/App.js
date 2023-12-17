import React, { useState } from "react";
import "./App.css";
import Teams from "./Database/teams.json";
import Nations from "./Database/nations.json";
import Positions from "./Database/positions.json";
import ChartComponent from "./Components/chartComponent";
import Season from "./Components/season";
import { RandomNumber } from "./Utils";

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
  "Fase de Grupos",
  "16 avos",
  "Oitavas",
  "Quartas",
  "Semi-finais",
  "Final",
  "Vencedor",
];

function App() {
  const [allTeams, setAllTeams] = useState(Teams);

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
    leaguePosition: null,
    nationalCupPhase: null,
    championsPhase: null,
    europaPhase: null,
    worldCupPhase: null,
    fame: null,
    marketValue: null,
  });

  const [player, setPlayer] = useState({
    potential: RandomNumber(1, 5) + RandomNumber(1, 5),
    age: 17,
    nation: Nations[RandomNumber(0, Nations.length - 1)],
    team: null,
    position: GetNewPosition(),
    wage: 1,
    overall: 70,
    performance: 0,
    totalGoals: 0,
    totalAssists: 0,
    leagues: 0,
    nationalCup: 0,
    europa: 0,
    champions: 0,
    worldCup: 0,
    goldenAward: 0,
    ballonDOr: 0,
    championsQualification: false,
    lastLeaguePosition: 0,
    europaQualification: false,
    fame: 0,
    marketValue: 1,
  });

  const [year, setYear] = useState(new Date().getFullYear());

  const [contract, setContract] = useState(0);

  const [generalPerformance, setGeneralPerformance] = useState([]);
  const [maxFame, setMaxFame] = useState(0);

  const [transfer1, setTransfer1] = useState(GetNewTeam());

  const [transfer2, setTransfer2] = useState(GetNewTeam());

  function ChooseTeam(newTeam = null) {
    //next season
    document.getElementById("team-choice").style.display = "none";
    document.getElementById("continue").style.display = "flex";

    //load all player's stats
    let newPlayer = player;
    let newGeneralPerformance = generalPerformance;
    let newAllTeams = allTeams;

    //age and contract
    newPlayer.age++;
    let newContract = contract - 1;

    //pre season setup
    if (newTeam) {
      //if they change team
      let oldTeamLeague = newPlayer.team == null ? "" : newPlayer.team.league; //store old league table results
      newGeneralPerformance = [];
      newPlayer.fame -= newPlayer.team == null ? 0 : newPlayer.team.power * 20; //remove fame buff
      if (newPlayer.fame < 0) newPlayer.fame = 0;
      newPlayer.team = newTeam.team;
      newContract = newTeam.contract.duration;
      newPlayer.marketValue = newTeam.transferValue;
      newPlayer.wage = newTeam.contract.value;
      newPlayer.fame += newPlayer.team.power * 20; //add fame buff
      let lp = 99;
      //if the new team is in the same league as the old
      if (oldTeamLeague == newPlayer.team.league) {
        lp =
          currentSeason.leagueTable.findIndex(
            (team) => team === newPlayer.team
          ) + 1; //get the new team's position
      } else {
        let nationalTeams =
          newAllTeams.find((league) => league.name === newPlayer.team.league)
            ?.teams || []; //find the new team league
        lp = GetLeaguePosition(nationalTeams, newPlayer.team, 0.5).pos; //simulate the past season
      }

      //get players league
      let league = newAllTeams.find(
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
      newContract = RandomNumber(2, 3); //new contrat lenght
      newPlayer.marketValue = Math.max(
        transfer1.transferValue,
        transfer2.transferValue
      );
      newPlayer.wage =
        Math.floor(
          (newPlayer.overall + newPlayer.team.power + newPlayer.fame / 20) **
            2 /
            60
        ) / 10;
    }

    //calcule the player's performance

    newPlayer.performance = (RandomNumber(0, 20) - RandomNumber(0, 20)) / 10;

    newPlayer.overall =
      GetOverall(newPlayer.potential, newPlayer.age) + newPlayer.performance;

    newGeneralPerformance.push(newPlayer.performance);
    if (newGeneralPerformance.length > 3) newGeneralPerformance.shift();

    //giving the performance, set how many games did they were the starter player
    let starting = Math.floor(
      (newPlayer.overall - (68 + newPlayer.team.power)) / 0.1 +
        RandomNumber(-5, 5)
    );
    if (starting > 100) starting = 100;
    else if (starting < 0) starting = 0;

    newPlayer.fame +=
      (starting / 100 + newPlayer.performance) * newPlayer.team.power;

    //set season start
    let newSeason = {
      year: year + 1,
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
      leaguePosition: 1,
      nationalCupPhase: 0,
      championsPhase: 0,
      europaPhase: 0,
      worldCupPhase: 0,
      fame: newPlayer.fame,
      marketValue: newPlayer.marketValue,
    };

    //save
    setCurrentSeason(newSeason);
    setYear(year + 1);
    setContract(newContract);
    setPlayer(newPlayer);
    setGeneralPerformance(newGeneralPerformance);
    setAllTeams(newAllTeams);
  }

  function Continue() {
    document.getElementById("team-choice").style.display = "flex";
    document.getElementById("continue").style.display = "none";

    let newPlayer = player;
    let newSeason = currentSeason;
    let newAllTeams = allTeams;

    //giving the starting rate, randomize how many goals/assists did they score
    let goalsOppostunities =
      newPlayer.position.goalsBonus *
      (1 + (newPlayer.team.power + newSeason.performance * 2.5) / 20);
    let assistsOppostunities =
      newPlayer.position.assistsBonus *
      (1 + (newPlayer.team.power + newSeason.performance * 2.5) / 20);

    newSeason.goals = Math.floor(
      (newSeason.starting / 100) *
        goalsOppostunities *
        (newPlayer.overall / 100)
    );
    newSeason.assists = Math.floor(
      (newSeason.starting / 100) *
        assistsOppostunities *
        (newPlayer.overall / 100) *
        (newPlayer.team.power / 8)
    );

    if (newSeason.goals < 0) newSeason.goals = 0;
    if (newSeason.assists < 0) newSeason.assists = 0;

    newSeason.awardPoints = newSeason.performance * 2; //max = 4.0

    let med = 0;
    for (let i = 0; i < generalPerformance.length; i++) {
      med += generalPerformance[i];
    }
    med /= generalPerformance.length;

    //national tournaments
    let league = newAllTeams.find(
      (league) => league.name === newPlayer.team.league
    );

    //national league
    let leagueResults = GetLeaguePosition(
      league.teams,
      newPlayer.team,
      newSeason.performance / 2
    );

    let leaguePosition = leagueResults.pos;

    newSeason.leagueTable = leagueResults.table;

    //top six from the league
    let topSix = "";
    for (let p = 0; p < 6; p++) {
      topSix += "->" + (p + 1) + "º: " + leagueResults.table[p].name;
    }

    if (leaguePosition == 1) newPlayer.leagues++;

    newSeason.awardPoints += (7 - leaguePosition) / 2; //max = 3.0
    newSeason.leaguePosition = leaguePosition;
    newSeason.titles.push(
      "Liga: " + newSeason.leaguePosition + "º lugar" + topSix
    );

    //national cup
    let opponents = [];
    for (let i = 0; i < 5; i++) {
      let op = league.teams[RandomNumber(0, league.teams.length - 1)];
      while (op.name == newPlayer.team.name || opponents.includes(op)) {
        op = league.teams[RandomNumber(0, league.teams.length - 1)];
      }
      opponents.push(op);
    }

    opponents.sort((a, b) => {
      return a.power - b.power + RandomNumber(-2, 2) / 2;
    });

    let description = "";
    let end = false;
    let phase = 0;

    while (!end) {
      let game = GetGameResult(
        newPlayer.team,
        opponents[phase],
        newSeason.performance,
        phase >= TournamentPath.length - 2 ? 1 : 2
      );

      description += `-> ${TournamentPath[phase + 1]}: ${game.game}`;

      if (game.result) {
        phase++;
        newSeason.awardPoints += 0.6; //max 0.6 x 5 = 3.0
        if (phase >= TournamentPath.length - 2) {
          end = true;
          newPlayer.nationalCup++;
        }
      } else {
        end = true;
      }
    }

    description = `National Cup: ${TournamentPath[phase + 1]} ${description}`;

    newSeason.nationalCupPhase = phase;
    newSeason.titles.push(description);

    if (newPlayer.championsQualification) {
      //Champions League
      phase = 0;

      let qualified = [newPlayer.team];

      for (let l = 0; l < newAllTeams.length; l++) {
        for (
          let i = 0;
          i <
          newAllTeams[l].championsSpots * 1.5 -
            (newPlayer.team.league == newAllTeams[l].name ? 1 : 0);
          i++
        ) {
          let t =
            newAllTeams[l].teams[
              RandomNumber(0, newAllTeams[l].championsSpots * 2)
            ];

          let count = 0;
          while (qualified.includes(t)) {
            t =
              newAllTeams[l].teams[
                RandomNumber(0, newAllTeams[l].championsSpots * 2)
              ];

            count++;
            if (count >= 20) {
              throw new Error("Limite de Loop atingido");
            }
          }

          qualified.push(t);
        }
      }

      let group = GetChampionsPosition(
        qualified,
        newPlayer.team,
        newSeason.performance
      );

      description = `-> ${TournamentPath[phase]}: ${group.pos}º lugar`;

      opponents = [];
      for (let i = 0; i < TournamentPath.length; i++) {
        let op = group.table[RandomNumber(0, 3 + i)];
        while (op.name == newPlayer.team.name || opponents.includes(op)) {
          op = group.table[RandomNumber(0, 3 + i)];
        }
        opponents.push(op);
      }
      opponents.sort((a, b) => {
        return a.power - b.power + RandomNumber(-2, 2) / 2;
      });

      let playoffs = false;
      if (group.pos > 8 && group.pos <= 24) {
        let game = GetGameResult(
          newPlayer.team,
          opponents[0],
          newSeason.performance,
          2
        );

        description += `-> Playoff: ${game.game}`;

        if (game.result) playoffs = true;
      }

      if (group.pos <= 8 || playoffs) {
        phase++;
        end = false;
        while (!end) {
          let game = GetGameResult(
            newPlayer.team,
            opponents[phase],
            newSeason.performance,
            phase >= TournamentPath.length - 2 ? 1 : 2
          );

          description += `-> ${TournamentPath[phase]}: ${game.game}`;

          if (game.result) {
            phase++;
            newSeason.awardPoints += 0.8; //max 0.8 x 5 = 4.0
            if (phase >= TournamentPath.length - 1) {
              end = true;
              newPlayer.champions++;
              newPlayer.fame += 30;
            }
          } else {
            end = true;
          }
        }
      }

      description = `Champions League: ${TournamentPath[phase]} ${description}`;

      newSeason.championsPhase = phase;
      newSeason.titles.push(description);
    }

    if (newPlayer.europaQualification) {
      //Europa league
      phase = 0;

      let op1 = GetRandomOpponent();
      while (
        op1.power < 4.5 ||
        op1.power > 7.5 ||
        newPlayer.team.league == op1.league
      ) {
        op1 = GetRandomOpponent();
      }

      let op2 = GetRandomOpponent();
      while (
        op2.power < 4.5 ||
        op2.power > 7.5 ||
        newPlayer.team.league == op2.league ||
        op1.league == op2.league
      ) {
        op2 = GetRandomOpponent();
      }

      let op3 = GetRandomOpponent();
      while (
        op3.power < 4.5 ||
        op3.power > 7.5 ||
        newPlayer.team.league == op3.league ||
        op1.league == op3.league ||
        op2.league == op3.league
      ) {
        op3 = GetRandomOpponent();
      }

      let group = GetLeaguePosition(
        [newPlayer.team, op1, op2, op3],
        newPlayer.team,
        newSeason.performance
      );

      if (newSeason.championsPhase == 0 && newPlayer.championsQualification)
        description = "->Fase de Grupos da Champions";
      else
        description = `-> ${TournamentPath[phase]}: ${group.table[0].name} / ${group.table[1].name} / ${group.table[2].name} / ${group.table[3].name}`;

      if (
        group.pos <= 2 ||
        (newSeason.championsPhase == 0 && newPlayer.championsQualification)
      ) {
        phase++;
        opponents = [];
        for (let i = 0; i < TournamentPath.length; i++) {
          let op = GetRandomOpponent();
          while (
            op.power < 4.5 ||
            op.name == newPlayer.team.name ||
            opponents.includes(op) ||
            (phase <= 2 && (op1.name == op.name || op2.name == op.name))
          ) {
            op = GetRandomOpponent();
          }
          opponents.push(op);
        }
        opponents.sort((a, b) => {
          return a.power - b.power + RandomNumber(-2, 2) / 2;
        });
        end = false;
        while (!end) {
          let game = GetGameResult(
            newPlayer.team,
            opponents[phase],
            newSeason.performance,
            phase >= TournamentPath.length - 2 ? 1 : 2
          );

          description += `-> ${TournamentPath[phase]}: ${game.game}`;

          if (game.result) {
            phase++;
            if (phase >= TournamentPath.length - 1) {
              end = true;
              newPlayer.europa++;
            }
          } else {
            end = true;
          }
        }
      }

      description = `Europa League: ${TournamentPath[phase]} ${description}`;

      newSeason.europaPhase = phase;
      newSeason.titles.push(description);
    }

    //World Cup
    if ((year + 2) % 4 == 0) {
      newSeason.awardPoints -= 2.0;
      phase = 0;

      let nationsLeft = [
        "Europa",
        "América do Sul",
        "América do Norte",
        "Ásia",
        "África",
        "Europa",
      ];

      nationsLeft.splice(nationsLeft.indexOf(newPlayer.nation.name), 1);

      let medPower = newPlayer.nation.power;

      let op1 =
        Nations[
          RandomNumber(0, Nations.length / 2 - 1) +
            (medPower < 7.5 ? 0 : Nations.length / 2)
        ];
      while (
        !nationsLeft.includes(op1.continent) ||
        op1.name == newPlayer.nation.name
      ) {
        op1 =
          Nations[
            RandomNumber(0, Nations.length / 2 - 1) +
              (medPower < 7.5 ? 0 : Nations.length / 2)
          ];
      }
      nationsLeft.splice(nationsLeft.indexOf(op1.continent), 1);

      medPower += op1.power;

      let op2 =
        Nations[
          RandomNumber(0, Nations.length / 2 - 1) +
            (medPower < 15 ? 0 : Nations.length / 2)
        ];
      while (
        !nationsLeft.includes(op2.continent) ||
        op2.name == newPlayer.nation.name ||
        op2.name == op1.name
      ) {
        op2 =
          Nations[
            RandomNumber(0, Nations.length / 2 - 1) +
              (medPower < 15 ? 0 : Nations.length / 2)
          ];
      }
      nationsLeft.splice(nationsLeft.indexOf(op2.continent), 1);

      let op3 = Nations[RandomNumber(0, Nations.length - 1)];
      while (
        !nationsLeft.includes(op3.continent) ||
        op3.name == newPlayer.nation.name ||
        op3.name == op2.name ||
        op3.name == op1.name
      ) {
        op3 = Nations[RandomNumber(0, Nations.length - 1)];
      }
      nationsLeft.splice(nationsLeft.indexOf(op3.continent), 1);

      let group = GetLeaguePosition(
        [newPlayer.nation, op1, op2, op3],
        newPlayer.nation,
        newSeason.performance
      );

      description = `-> ${TournamentPath[phase]}: ${group.table[0].name} / ${group.table[1].name} / ${group.table[2].name} / ${group.table[3].name}`;

      if (group.pos <= 2) {
        phase++;
        opponents = [];
        for (let i = 0; i < TournamentPath.length; i++) {
          let op = Nations[RandomNumber(0, Nations.length - 1)];
          while (
            op.power < 4.5 ||
            op.name == player.nation.name ||
            opponents.includes(op) ||
            (phase <= 7 &&
              (op1.name == op.name ||
                op2.name == op.name ||
                op3.name == op.name))
          ) {
            op = Nations[RandomNumber(0, Nations.length - 1)];
          }
          opponents.push(op);
        }
        opponents.sort((a, b) => {
          return a.power - b.power + RandomNumber(-2, 2) / 2;
        });
        end = false;
        while (!end) {
          let game = GetGameResult(
            newPlayer.nation,
            opponents[phase],
            newSeason.performance,
            1
          );

          description += `-> ${TournamentPath[phase]}: ${game.game}`;

          if (game.result) {
            phase++;
            if (newPlayer.overall > 75 + newPlayer.nation.power || med > 0)
              newSeason.awardPoints += 0.8; //max 0.8 x 5 = 4.0
            if (phase >= TournamentPath.length - 1) {
              end = true;
              if (newPlayer.overall > 75 + newPlayer.nation.power || med > 0) {
                newPlayer.worldCup++;
                newPlayer.fame += 30;
              }
            }
          } else {
            end = true;
          }
        }
      }

      description = `World Cup: ${TournamentPath[phase]} ${
        newPlayer.overall > 75 + newPlayer.nation.power ||
        (med > 0 && newPlayer.overall > 70 + newPlayer.nation.power)
          ? ""
          : " (Não Convocado)"
      } ${description}`;

      newSeason.worldCupPhase = phase;
      newSeason.titles.push(description);
    }

    //add goals to the carrer summary
    newPlayer.totalGoals += newSeason.goals;
    newPlayer.totalAssists += newSeason.assists;

    //post season results
    if (RandomNumber(0, 100) < 1) newSeason.titles.push("Puskás"); //Puskás

    if (45 + RandomNumber(0, 10) < newSeason.goals) {
      //Golden Shoes
      newPlayer.goldenAward++;
      newSeason.awardPoints += 2;
      newPlayer.fame += 20;
      newSeason.titles.push("Chuteira de Ouro");
    } else if (
      player.position.title == "GK" &&
      newSeason.performance * 2 + (newPlayer.overall - 75) / 2 >= 10
    ) {
      newPlayer.goldenAward++;
      newSeason.awardPoints += 2;
      newPlayer.fame += 20;
      newSeason.titles.push("Luva de Ouro");
    }

    newPlayer.fame += newSeason.awardPoints;

    let position = -1;

    if (newSeason.awardPoints + newPlayer.overall >= 100) {
      //Ballon D'or
      newPlayer.ballonDOr++;
      newPlayer.fame += 60;
      position = 1;

      newSeason.titles.push(`Ballon D'Or: 1º lugar`);
    } else if (newSeason.awardPoints + newPlayer.overall >= 91) {
      let pts = Math.floor(newSeason.awardPoints + newPlayer.overall - 91);
      newPlayer.fame += pts * 4;
      position = 10 - pts;
      newSeason.titles.push(`Ballon D'Or: ${position}º lugar`);
    }

    if (position > 0) {
    }

    //trasnfer window

    //fired
    if (
      contract <= 1 &&
      ((newPlayer.overall <= 80 + newPlayer.team.power / 2 &&
        newPlayer.age > 32) ||
        med <= -0.35)
    ) {
      document.getElementById("decision-stay").style.display = "none";
    } else {
      document.getElementById("decision-stay").style.display = "flex";
    }

    //load option of transfer
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

    if (newPlayer.age >= 32) {
      //retire option
      document.getElementById("retire").style.display = "flex";
    }

    if (leaguePosition <= league.championsSpots) {
      newPlayer.championsQualification = true;
      newPlayer.europaQualification = false;
      newPlayer.lastLeaguePosition = leaguePosition;
    } else if (leaguePosition <= league.championsSpots + league.europaSpots) {
      newPlayer.championsQualification = false;
      newPlayer.europaQualification = true;
    } else {
      newPlayer.championsQualification = false;
      newPlayer.europaQualification = false;
    }

    //set pleyer
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

  function GetChampionsPosition(teams, playerTeam, bonus) {
    //sort by power
    teams.sort((a, b) => {
      return a.power - b.power + RandomNumber(-2, 2);
    });

    let points = new Array(teams.length).fill(0);
    for (let round = 0; round < 8; round++) {
      let newOrderTeams = [];
      let newOrderPoints = [];
      for (let i = 0; i < teams.length / 2; i++) {
        let home = i;
        let away = i + teams.length / 2;

        let game = GetMatch(
          teams[home],
          teams[away],
          teams[home] === playerTeam ? bonus : 0.5
        );

        if (game[0] > game[1]) {
          points[home] += 3;
        } else if (game[1] > game[0]) {
          points[away] += 3;
        } else {
          points[away] += 1;
          points[home] += 1;
        }

        newOrderTeams.push(teams[home]);
        newOrderTeams.push(teams[away]);
        newOrderPoints.push(points[home]);
        newOrderPoints.push(points[away]);
      }

      teams = newOrderTeams;
      points = newOrderPoints;
    }

    let teamPositions = [...Array(teams.length).keys()].map(
      (position) => position + 1
    );

    teamPositions.sort((a, b) => points[b - 1] - points[a - 1]);

    let playerPosition = teamPositions.findIndex(
      (position) => teams[position - 1] === playerTeam
    );

    let table = teamPositions.map((position) => teams[position - 1]);

    return {
      pos: playerPosition + 1,
      table: table,
    };
  }

  function GetLeaguePosition(teams, playerTeam, bonus) {
    let points = new Array(teams.length).fill(0);
    for (let home = 0; home < teams.length; home++) {
      for (let away = 0; away < teams.length; away++) {
        if (teams[home] !== teams[away]) {
          let game = GetMatch(
            teams[home],
            teams[away],
            teams[home] === playerTeam ? bonus : 0.5
          );

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

    let teamPositions = [...Array(teams.length).keys()].map(
      (position) => position + 1
    );

    teamPositions.sort((a, b) => points[b - 1] - points[a - 1]);

    let playerPosition = teamPositions.findIndex(
      (position) => teams[position - 1] === playerTeam
    );

    let table = teamPositions.map((position) => teams[position - 1]);

    return {
      pos: playerPosition + 1,
      table: table,
    };
  }

  function GetMatch(team1, team2, bonus) {
    let team1Points =
      team1.power / 4 +
      RandomNumber(0, team1.power * 2) / 2 -
      RandomNumber(0, team2.power * 2) / 2;

    let team2Points =
      team2.power / 4 +
      RandomNumber(0, team2.power * 2) / 2 -
      RandomNumber(0, team1.power * 2) / 2;

    let team1Score = Math.floor((team1Points + bonus) / 3);
    let team2Score = Math.floor(team2Points / 3);

    if (team1Score < 0) team1Score = 0;
    if (team2Score < 0) team2Score = 0;

    return [team1Score, team2Score];
  }

  function GetPenalties(team1, team2) {
    let winner = false;
    let team1goals = 0;
    let team2goals = 0;
    let count = 0;
    while (!winner) {
      count++;
      let team1shooter = RandomNumber(0, (team1.power + 1) * 2);
      let team2keeper = RandomNumber(0, team2.power * 2);
      if (team1shooter > team2keeper) team1goals++;

      if (count <= 5 && Math.abs(team1goals - team2goals) > 6 - count) {
        winner = true;
        break;
      }

      let team2shooter = RandomNumber(0, (team2.power + 1) * 2);
      let team1keeper = RandomNumber(0, team1.power * 2);
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

  function GetGameResult(team1, team2, bonus, numberOfGames = 1) {
    let gameDesc = "";
    let teamGoals1 = 0;
    let teamGoals2 = 0;

    for (let i = 0; i < numberOfGames; i++) {
      let game = GetMatch(team1, team2, bonus);
      teamGoals1 += game[0];
      teamGoals2 += game[1];
    }

    if (teamGoals1 == teamGoals2) {
      let extra = GetMatch(team1, team2, bonus);
      teamGoals1 += extra[0];
      teamGoals2 += extra[1];

      if (teamGoals1 == teamGoals2) {
        let penalties = GetPenalties(team1, team2);
        gameDesc = `${team1.name} ${teamGoals1} (${penalties[0]}) x (${penalties[1]}) ${teamGoals2} ${team2.name} (Penaltis)`;
        teamGoals1 += penalties[0];
        teamGoals2 += penalties[1];
      } else {
        gameDesc = `${team1.name} ${teamGoals1} x ${teamGoals2} ${team2.name} (Prorrogação)`;
      }
    } else {
      gameDesc = `${team1.name} ${teamGoals1} x ${teamGoals2} ${team2.name}`;
    }

    let result = teamGoals1 > teamGoals2;

    return { result: result, game: gameDesc };
  }

  function GetRandomOpponent() {
    let leagueID = RandomNumber(0, Teams.length - 1);
    let league = Teams[leagueID];
    let team = league.teams[RandomNumber(0, league.teams.length - 1)];

    return team;
  }

  function GetNewTeam(currentPlayer = null) {
    let leagueID = RandomNumber(0, allTeams.length - 1);
    let league = allTeams[leagueID];
    let team = league.teams[RandomNumber(0, league.teams.length - 1)];
    let contractDuration = 3;
    let contractValue = Math.floor((70 + team.power) ** 2 / 60) / 10;
    let transferValue = 18 + RandomNumber(0, 4);

    if (currentPlayer) {
      let count = 0;
      while (
        currentPlayer.team.name == team.name ||
        (team.power < currentPlayer.team.power - count / 3 &&
          currentPlayer.age <= 32) ||
        (team.power > currentPlayer.team.power &&
          currentPlayer.age > 32 &&
          currentPlayer.age < 36) ||
        (currentPlayer.overall < 80 + team.power / 2 && currentPlayer.age >= 36)
      ) {
        league = allTeams[leagueID];
        team = league.teams[RandomNumber(0, league.teams.length - 1)];

        count++;

        if (count >= 15) return null;
      }

      contractDuration = RandomNumber(2, 3);
      contractValue =
        Math.floor(
          (currentPlayer.overall +
            team.power +
            currentPlayer.potential +
            currentPlayer.fame / 20) **
            2 /
            60
        ) / 10;
      transferValue = Math.floor(
        ((currentPlayer.overall / 5.0) ** 2 / 10) *
          currentPlayer.position.value *
          (1 + currentPlayer.performance / 20.0) +
          (1 + RandomNumber(-10, 10) / 100)
      );

      if (transferValue < 0) transferValue = 0;
    }

    let newContract = { value: contractValue, duration: contractDuration };

    return { team: team, contract: newContract, transferValue: transferValue };
  }

  function GetNewPosition() {
    let posID = RandomNumber(0, Positions.length - 1);
    let pos = Positions[posID];
    return pos;
  }

  function GetOverall(potential, age) {
    return 87 + potential / 2 - (30 - age) ** 2 / 10;
  }

  function Retire() {
    document.getElementById("team-choice").style.display = "none";
    document.getElementById("continue").style.display = "none";
    document.getElementById("chart").style.display = "flex";
  }

  return (
    <>
      <header>
        <h1>Football Career Simulator</h1>
        <h3 style={{ marginTop: "1rem" }}>Como Jogar</h3>
        <ol style={{ marginLeft: "2rem" }}>
          <li>Escolha entre ficar ou transferir para outro time.</li>
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
      <div className="choices" id="team-choice">
        <a
          className="d-stay"
          id="decision-stay"
          style={{ display: "none" }}
          onClick={() => ChooseTeam()}
        >
          <p>Continuar em {player.team == null ? "" : player.team.name}</p>
          <p>(Valores não definidos)</p>
        </a>
        <a
          className="d-alert"
          id="decision-transfer1"
          onClick={() => ChooseTeam(transfer1)}
        >
          <p>Transferir para {transfer1.team.name}</p>{" "}
          <p>
            (${transfer1.contract.value}M | {transfer1.contract.duration} anos)
          </p>
        </a>
        <a
          className="d-alert"
          id="decision-transfer2"
          onClick={() => ChooseTeam(transfer2)}
        >
          <p>Transferir para {transfer2.team.name}</p>{" "}
          <p>
            (${transfer2.contract.value}M | {transfer2.contract.duration} anos)
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
          <p>Posição: {player.position.title}</p>
        </div>
        <div>
          <p>Seleção: {player.nation.name}</p>
          <p>Copa do Mundo: {player.worldCup}</p>
        </div>
        <div>
          <p>Gols: {player.totalGoals}</p>
          <p>Assistências: {player.totalAssists}</p>
        </div>
        <div>
          <p>Ligas: {player.leagues}</p>
          <p>Copas Nacionais: {player.nationalCup}</p>
          <p>Champions: {player.champions}</p>
          <p>Europa League: {player.europa}</p>
        </div>
        <div>
          <p>Chuteiras/Luvas de Ouro: {player.goldenAward}</p>
          <p>Ballon D'Or: {player.ballonDOr}</p>
        </div>
      </div>
    </>
  );
}

export default App;
