import React, { useCallback, useEffect, useState } from "react";
import "./App.css";
import Teams from "./Database/teams.json";
import Nations from "./Database/nations.json";
import Positions from "./Database/positions.json";
import ChartComponent from "./Components/chartComponent";
import Season from "./Components/season";

function RandomNumber(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max + 1 - min) + min);
}

const StarPath = [
  "Esquecido",
  "Ok",
  "Bem visto",
  "Jogador mediano",
  "Deixou sua marca",
  "Estrela",
  "Ídolo Nacional",
  "Lenda",
  "GOAT",
];

const TournamentPath = [
  "Não Classificado",
  "Fase de Grupos",
  "16 avos",
  "Oitavas",
  "Quartas",
  "Semi-finais",
  "Final",
  "Vencedor",
];

function App() {
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
  });

  const [year, setYear] = useState(new Date().getFullYear() - 1);

  const [player, setPlayer] = useState({
    potential: RandomNumber(1, 5),
    age: 17,
    nation: Nations[RandomNumber(0, Nations.length - 1)],
    team: null,
    position: GetNewPosition(),
    wage: 10,
    overall: 70,
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
    europaQualification: false,
    fame: 0,
  });

  const [contract, setContract] = useState(0);

  const [generalPerformance, setGeneralPerformance] = useState(0);
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

    //age and contract
    newPlayer.age++;
    let newContract = contract - 1;

    //pre season setup
    if (newTeam) {
      //if they change team
      let oldTeamLeague = newPlayer.team == null ? "" : newPlayer.team.league; //store old league table results
      newGeneralPerformance = 0; //resets team affection
      newPlayer.fame -=
        newPlayer.team == null ? 0 : (newPlayer.team.power - 2.5) * 10; //remove fame buff
      if (newPlayer.fame < 0) newPlayer.fame = 0;
      newPlayer.team = newTeam.team;
      newContract = newTeam.contract.duration;
      newPlayer.wage = newTeam.contract.value;
      newPlayer.fame += (newPlayer.team.power - 2.5) * 10; //add fame buff
      let lp = 99;
      //if the new team is in the same league as the old
      if (oldTeamLeague == newPlayer.team.league) {
        lp =
          currentSeason.leagueTable.findIndex(
            (team) => team === newPlayer.team
          ) + 1; //get the new team's position
      } else {
        let nationalTeams =
          Teams.find((league) => league.name === newPlayer.team.league)
            ?.teams || []; //find the new team league
        lp = GetLeaguePosition(nationalTeams, newPlayer.team).pos; //simulate the past season
      }

      //get players league
      let league = Teams.find(
        (league) => league.name === newPlayer.team.league
      );

      //was classificated last year
      if (lp <= league.championsSpots) {
        //for the champions
        newPlayer.championsQualification = true;
        newPlayer.europaQualification = false;
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
      newContract = RandomNumber(1, 3); //new contrat lenght
      newPlayer.wage =
        Math.floor(
          Math.pow(
            newPlayer.overall +
              newContract * newPlayer.potential +
              (newPlayer.team.power - 2.5) * RandomNumber(1, 3) +
              newPlayer.fame / 5,
            2
          ) / 50
        ) / 10; //generate a new wage payment
    }

    //calcule the player's performance
    let newPerformance =
      (RandomNumber(0, 20) -
        RandomNumber(0, 20) +
        (newPlayer.team.power - 1.5) * 2) /
      20;
    newPlayer.overall =
      85 +
      newPlayer.potential * 1.4 -
      Math.pow(27.5 - newPlayer.age + newPlayer.potential / 2, 2) / 12 +
      newPerformance;
    newGeneralPerformance += newPerformance;

    //giving the performance, set how many games did they were the starter player
    let starting = Math.floor(
      10 * (newPlayer.overall - (70 + (newPlayer.team.power - 2.5) * 4))
    );
    if (starting > 100) starting = 100;
    else if (starting < 0) starting = 0;

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
      performance: newPerformance,
      awardPoints: 0,
      leagueTable: [],
      leaguePosition: 1,
      nationalCupPhase: 0,
      championsPhase: 0,
      europaPhase: 0,
      worldCupPhase: 0,
      fame: newPlayer.fame,
    };

    //save
    setCurrentSeason(newSeason);
    setPlayer(newPlayer);
    setYear(year + 1);
    setContract(newContract);
    setGeneralPerformance(newGeneralPerformance);
  }

  function Continue() {
    document.getElementById("team-choice").style.display = "flex";
    document.getElementById("continue").style.display = "none";

    let newPlayer = player;
    let newSeason = currentSeason;

    //giving the starting rate, randomize how many goals/assists did they score
    let goalsOppostunities =
      newPlayer.position.goalsBonus *
      (1 +
        (RandomNumber(0, newPlayer.team.power * 2) +
          newSeason.performance * 10) /
          20);
    let assistsOppostunities =
      newPlayer.position.assistsBonus *
      (1 +
        (RandomNumber(0, newPlayer.team.power * 2) +
          newSeason.performance * 10) /
          20);

    newSeason.goals = Math.floor(
      (newSeason.starting / 100) *
        goalsOppostunities *
        (newPlayer.overall / 100)
    );
    newSeason.assists = Math.floor(
      (newSeason.starting / 100) *
        assistsOppostunities *
        (newPlayer.overall / 100)
    );

    if (newSeason.goals < 0) newSeason.goals = 0;
    if (newSeason.assists < 0) newSeason.assists = 0;

    newSeason.awardPoints = newSeason.performance * 2;

    //national tournaments
    let league = Teams.find((league) => league.name === newPlayer.team.league);

    //national league
    let leagueResults = GetLeaguePosition(
      league.teams,
      newPlayer,
      newSeason.performance * 2
    );
    let leaguePosition = leagueResults.pos;

    newSeason.leagueTable = leagueResults.table;

    //top six from the league
    let topSix = "";
    for (let p = 0; p < 6; p++) {
      topSix += "->" + (p + 1) + "º: " + leagueResults.table[p].name;
    }

    if (leaguePosition == 1) newPlayer.leagues++;

    newSeason.awardPoints += 4 - leaguePosition;
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
      let game = GetHomeAwayResult(
        newPlayer.team,
        opponents[phase],
        newSeason.performance * 2
      );

      description += "->" + TournamentPath[phase + 2] + ": " + game.game;

      if (game.result) {
        phase++;
        newSeason.awardPoints += 0.2;
        if (phase >= TournamentPath.length - 3) {
          end = true;
          newPlayer.nationalCup++;
        }
      } else {
        end = true;
      }
    }

    description = "Copa Nacional: " + TournamentPath[phase + 2] + description;

    newSeason.nationalCupPhase = phase;
    newSeason.titles.push(description);

    if (newPlayer.championsQualification) {
      //Champions League
      phase = 1;

      let op1 = GetNewOpponent();
      while (
        op1.power < 3 ||
        op1.power == newPlayer.team.power ||
        newPlayer.team.league == op1.league
      ) {
        op1 = GetNewOpponent();
      }

      let op2 = GetNewOpponent();
      while (
        op2.power < 3 ||
        op2.power == newPlayer.team.power ||
        op1.power == op2.power ||
        newPlayer.team.league == op2.league ||
        op1.league == op2.league
      ) {
        op2 = GetNewOpponent();
      }

      description =
        "->" + TournamentPath[phase] + ": " + op1.name + " / " + op2.name;

      let game1 = GetGame(newPlayer.team, op1, newSeason.performance * 2);
      let game2 = GetGame(newPlayer.team, op2, newSeason.performance * 2);

      if (
        (game1[0] > game1[1] ? 3 : game1[0] == game1[1] ? 1 : 0) +
          (game2[0] > game2[1] ? 3 : game2[0] == game2[1] ? 1 : 0) >=
        2
      ) {
        phase++;
        opponents = [];
        for (let i = 0; i < TournamentPath.length; i++) {
          let op = GetNewOpponent();
          while (
            op.power < 4 ||
            op.name == newPlayer.team.name ||
            opponents.includes(op) ||
            (phase <= 3 && (op1.name == op.name || op2.name == op.name))
          ) {
            op = GetNewOpponent();
          }
          opponents.push(op);
        }
        opponents.sort((a, b) => {
          return a.power - b.power + RandomNumber(-2, 2) / 2;
        });
        end = false;
        while (!end) {
          let game = GetHomeAwayResult(
            newPlayer.team,
            opponents[phase],
            newSeason.performance * 2
          );

          description += "->" + TournamentPath[phase] + ": " + game.game;

          if (game.result) {
            phase++;
            newSeason.awardPoints += 0.8;
            if (phase >= TournamentPath.length - 1) {
              end = true;
              newPlayer.champions++;
            }
          } else {
            end = true;
          }
        }
      }

      description = "Champions League: " + TournamentPath[phase] + description;

      newSeason.championsPhase = phase;
      newSeason.titles.push(description);

      if (newSeason.championsPhase == 1) newPlayer.europaQualification = true;
    }

    if (newPlayer.europaQualification) {
      //Europa league
      phase = 1;

      let op1 = GetNewOpponent();
      while (op1.power >= 4 || newPlayer.team.league == op1.league) {
        op1 = GetNewOpponent();
      }

      let op2 = GetNewOpponent();
      while (
        op2.power >= 4 ||
        newPlayer.team.league == op2.league ||
        op1.league == op2.league
      ) {
        op2 = GetNewOpponent();
      }

      if (newSeason.championsPhase == 1)
        description = "->Fase de Grupos da Champions";
      else
        description =
          "->" + TournamentPath[phase] + ": " + op1.name + " / " + op2.name;

      let game1 = GetGame(newPlayer.team, op1, newSeason.performance * 2);
      let game2 = GetGame(newPlayer.team, op2, newSeason.performance * 2);

      if (
        (game1[0] > game1[1] ? 3 : game1[0] == game1[1] ? 1 : 0) +
          (game2[0] > game2[1] ? 3 : game2[0] == game2[1] ? 1 : 0) >=
          2 ||
        newSeason.championsPhase == 1
      ) {
        phase++;
        opponents = [];
        for (let i = 0; i < TournamentPath.length; i++) {
          let op = GetNewOpponent();
          while (
            op.power == 5 ||
            op.name == newPlayer.team.name ||
            opponents.includes(op) ||
            (phase <= 3 && (op1.name == op.name || op2.name == op.name))
          ) {
            op = GetNewOpponent();
          }
          opponents.push(op);
        }
        opponents.sort((a, b) => {
          return a.power - b.power + RandomNumber(-2, 2) / 2;
        });
        end = false;
        while (!end) {
          let game = GetHomeAwayResult(
            newPlayer.team,
            opponents[phase],
            newSeason.performance * 2
          );

          description += "->" + TournamentPath[phase] + ": " + game.game;

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

      description = "Europa League: " + TournamentPath[phase] + description;

      newSeason.europaPhase = phase;
      newSeason.titles.push(description);
    }

    //World Cup
    if ((year + 2) % 4 == 0) {
      phase = 1;

      let op1 = Nations[RandomNumber(0, Nations.length - 1)];
      while (
        op1.power == player.nation.power ||
        op1.continent == player.nation.continent
      ) {
        op1 = Nations[RandomNumber(0, Nations.length - 1)];
      }

      let op2 = Nations[RandomNumber(0, Nations.length - 1)];
      while (
        op2.power == player.nation.power ||
        op2.continent == player.nation.continent ||
        op2.continent == op1.continent
      ) {
        op2 = Nations[RandomNumber(0, Nations.length - 1)];
      }

      description =
        "->" + TournamentPath[phase] + ": " + op1.name + " / " + op2.name;

      let game1 = GetGame(newPlayer.nation, op1, newSeason.performance * 2);
      let game2 = GetGame(newPlayer.nation, op2, newSeason.performance * 2);

      if (
        (game1[0] > game1[1] ? 3 : game1[0] == game1[1] ? 1 : 0) +
          (game2[0] > game2[1] ? 3 : game2[0] == game2[1] ? 1 : 0) >=
        2
      ) {
        phase++;
        opponents = [];
        for (let i = 0; i < TournamentPath.length; i++) {
          let op = Nations[RandomNumber(0, Nations.length - 1)];
          while (
            op.power < 4 ||
            op.name == player.nation.name ||
            opponents.includes(op) ||
            (phase <= 3 && (op1.name == op.name || op2.name == op.name))
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
          let game = GetHomeAwayResult(
            newPlayer.nation,
            opponents[phase],
            newSeason.performance * 2
          );

          description += "->" + TournamentPath[phase] + ": " + game.game;

          if (game.result) {
            phase++;
            newSeason.awardPoints += 0.4;
            if (phase >= TournamentPath.length - 1) {
              end = true;
              newPlayer.worldCup++;
            }
          } else {
            end = true;
          }
        }
      }

      description = "World Cup: " + TournamentPath[phase] + description;

      newSeason.worldCupPhase = phase;
      newSeason.titles.push(description);
    }

    //add goals to the carrer summary
    newPlayer.totalGoals += newSeason.goals;
    newPlayer.totalAssists += newSeason.assists;

    //post season results
    if (RandomNumber(0, 100) < 1) newSeason.titles.push("Puskás"); //Puskás

    if (35 + RandomNumber(0, 10) < newSeason.goals) {
      //Golden Shoes
      newPlayer.goldenAward++;
      newSeason.awardPoints++;
      newPlayer.fame += 10;
      newSeason.titles.push("Chuteira de Ouro");
    } else if (
      player.position.title == "GK" &&
      newSeason.performance * 10 + (newPlayer.overall - 70) / 3 >= 18
    ) {
      newPlayer.fame += 10;
      newSeason.awardPoints++;
      newSeason.titles.push("Luva de Ouro");
    }

    newPlayer.fame += newSeason.awardPoints;

    if (newSeason.awardPoints + newPlayer.overall >= 99) {
      //Ballon D'or
      newPlayer.ballonDOr++;
      newSeason.titles.push("Ballon D'Or: Ganhador");
      newPlayer.fame += 30;
      if (newPlayer.fame < 100) newPlayer.fame = 100;
    } else if (newSeason.awardPoints + newPlayer.overall >= 90) {
      let pts = Math.floor(newSeason.awardPoints + newPlayer.overall - 90);
      newPlayer.fame += pts * 2;
      let position = 10 - pts;
      newSeason.titles.push("Ballon D'Or: " + position + "º lugar");
    }

    //trasnfer window

    //fired
    if (
      contract <= 1 &&
      (newPlayer.overall >= 80 + (newPlayer.team.power - 2.5) * 6 ||
        (newPlayer.age > 28 &&
          newPlayer.overall <= 82.5 + newPlayer.team.power / 2) ||
        generalPerformance < 0)
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

    if (newPlayer.age >= 28) {
      //retire option
      document.getElementById("retire").style.display = "flex";
    }

    if (leaguePosition <= league.championsSpots) {
      newPlayer.championsQualification = true;
      newPlayer.europaQualification = false;
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

  function GetLeaguePosition(teams, currentPlayer, bonus) {
    let points = new Array(teams.length).fill(0);
    for (let home = 0; home < teams.length; home++) {
      for (let away = 0; away < teams.length; away++) {
        if (teams[home] !== teams[away]) {
          let b = 0.5;

          if (teams[home] === currentPlayer.team) b += bonus;
          else if (teams[away] === currentPlayer.team) b -= bonus;

          let game = GetGame(teams[home], teams[away], b);

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
      (position) => teams[position - 1] === player.team
    );

    let table = teamPositions.map((position) => teams[position - 1]);

    return {
      pos: playerPosition + 1,
      table: table,
    };
  }

  function GetGame(team1, team2, bonus) {
    let team1Points =
      (team1.power - 1) * 2 +
      RandomNumber(0, (team1.power - 1) * 2) -
      RandomNumber(0, (team2.power - 1) * 2) +
      bonus;
    let team2Points =
      (team2.power - 1) * 2 +
      RandomNumber(0, (team2.power - 1) * 2) -
      RandomNumber(0, (team1.power - 1) * 2);

    let team1Score = Math.floor(team1Points / 5);
    let team2Score = Math.floor(team2Points / 5);

    if (team1Score < 0) team1Score = 0;
    if (team2Score < 0) team2Score = 0;

    return [team1Score, team2Score];
  }

  function GetHomeAwayResult(team1, team2, bonus) {
    let game1 = GetGame(team1, team2, bonus);
    let game2 = GetGame(team1, team2, bonus);

    let teamGoals1 = game1[0] + game2[0];
    let teamGoals2 = game1[1] + game2[1];

    let gameDesc =
      team1.name + " " + teamGoals1 + " x " + teamGoals2 + " " + team2.name;

    if (teamGoals1 == teamGoals2) {
      let extra = GetGame(team1, team2, bonus);
      teamGoals1 += extra[0];
      teamGoals2 += extra[1];
    }

    let result =
      teamGoals1 + team1.power / 10 + bonus / 100 >
      teamGoals2 + team2.power / 10;

    return { result: result, game: gameDesc };
  }

  function GetNewOpponent() {
    let leagueID = RandomNumber(0, Teams.length - 1);
    let league = Teams[leagueID];
    let team = league.teams[RandomNumber(0, league.teams.length - 1)];

    return team;
  }

  function GetNewTeam(currentPlayer = null) {
    let leagueID = RandomNumber(0, Teams.length - 1);
    let league = Teams[leagueID];
    let team = league.teams[RandomNumber(0, league.teams.length - 1)];
    let contractDuration = RandomNumber(3, 5);
    let contractValue =
      Math.floor(
        Math.pow(
          80 + contractDuration * 3 + (team.power - 2.5) * RandomNumber(0, 3),
          2
        ) / 50
      ) / 10;

    if (currentPlayer) {
      let count = 0;
      while (
        currentPlayer.overall >= 80 + (team.power - 2.5) * 6 ||
        (currentPlayer.age > 28 &&
          currentPlayer.overall <= 82.5 + team.power / 2) ||
        currentPlayer.team.name == team.name
      ) {
        league = Teams[leagueID];
        team = league.teams[RandomNumber(0, league.teams.length - 1)];

        count++;
        if (count > 20) return null;
      }

      contractDuration = RandomNumber(2, 4);
      contractValue =
        Math.floor(
          Math.pow(
            currentPlayer.overall +
              contractDuration * currentPlayer.potential +
              (team.power - 2.5) * RandomNumber(1, 3) +
              currentPlayer.fame / 5,
            2
          ) / 50
        ) / 10;
    }

    let newContract = { value: contractValue, duration: contractDuration };

    return { team: team, contract: newContract };
  }

  function GetNewPosition() {
    let posID = RandomNumber(0, Positions.length - 1);
    let pos = Positions[posID];
    return pos;
  }

  function Retire() {
    document.getElementById("team-choice").style.display = "none";
    document.getElementById("continue").style.display = "none";
    let chart = document.getElementById("chart");
    chart.style.display = "flex";
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
          Continuar em {player.team == null ? "" : player.team.name}
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
            {StarPath[Math.floor(Math.min(maxFame / 40, StarPath.length))]})
          </p>
        </div>
        <div>
          <p>Potencial: {player.potential}</p>
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
