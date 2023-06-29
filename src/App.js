import React, { useCallback, useEffect, useState } from 'react';
import './App.css';
import Teams from './Database/teams.json';
import Nations from './Database/nations.json'
import ChartComponent from './Components/chartComponent';
import Season from './Components/season';

function RandomNumber(min, max) { // min and max included 
  return Math.floor(Math.random() * (max + 1 - min) + min)
}

const positions = [
  {
    title: "ST",
    goalsBonus: 30,
    assistsBonus: 12,
  },{
    title: "CF",
    goalsBonus: 30,
    assistsBonus: 12,
  },{
    title: "LF",
    goalsBonus: 27,
    assistsBonus: 12,
  },{
    title: "RF",
    goalsBonus: 27,
    assistsBonus: 12,
  },{
    title: "CAM",
    goalsBonus: 24,
    assistsBonus: 12,
  },{
    title: "LW",
    goalsBonus: 21,
    assistsBonus: 12,
  },{
    title: "RW",
    goalsBonus: 21,
    assistsBonus: 12,
  },{
    title: "LM",
    goalsBonus: 18,
    assistsBonus: 12,
  },{
    title: "CM",
    goalsBonus: 18,
    assistsBonus: 12,
  },{
    title: "RM",
    goalsBonus: 18,
    assistsBonus: 12,
  },{
    title: "LWB",
    goalsBonus: 15,
    assistsBonus: 10,
  },{
    title: "RWB",
    goalsBonus: 15,
    assistsBonus: 10,
  },{
    title: "CDM",
    goalsBonus: 12,
    assistsBonus: 8,
  },{
    title: "LB",
    goalsBonus: 9,
    assistsBonus: 6,
  },{
    title: "RB",
    goalsBonus: 9,
    assistsBonus: 6,
  },{
    title: "CB",
    goalsBonus: 6,
    assistsBonus: 4,
  },{
    title: "GK",
    goalsBonus: 3,
    assistsBonus: 2,
  }
]

const StarPath = ["Esquecido", "Ok", "Bem visto", "Jogador mediano", "Deixou sua marca", "Estrela", "Ídolo Nacional", "Lenda", "GOAT"]

const TournamentPath = [ "Não Classificado", "Fase de Grupos", "16 avos", "Oitavas", "Quartas", "Semi-finais", "Final", "Vencedor" ]

function App() {
  const [seasons, setSeasons]  = useState([]);

  const [currentSeason, setCurrentSeason]  = useState({
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
    fame: null
  });

  const [year, setYear] = useState(new Date().getFullYear()-1);

  const [player, setPlayer] = useState({ 
    potential: RandomNumber(1, 5),
    age: 17,
    nation: Nations[RandomNumber(0, Nations.length-1)],
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
    goldenShoes: 0,
    ballonDOr: 0,
    championsQualification: false,
    europaQualification: false,
    fame: 0
  })

  const [contract, setContract] = useState(0)

  const [generalPerformance, setGeneralPerformance] = useState(0);
  const [maxFame, setMaxFame] = useState(0);

  const [transfer1, setTransfer1] = useState(GetNewTeam());

  const [transfer2, setTransfer2] = useState(GetNewTeam());

  function ChooseTeam (newTeam = null) {   //next season
    document.getElementById('team-choice').style.display = "none"
    document.getElementById('continue').style.display = "flex"

    //load all player's stats
    let newPlayer = player
    let newGeneralPerformance = generalPerformance

    newPlayer.age++

    let newContract = contract - 1
    
    //pre season setup
    if(newTeam) {    //if they change team
      let oldTeamLeague = newPlayer.team == null ? "" : newPlayer.team.league
      newGeneralPerformance = 0;
      newPlayer.fame -= (newPlayer.team == null ? 0 : (newPlayer.team.power - 2.5) * 10)
      if(newPlayer.fame < 0) newPlayer.fame = 0;
      newPlayer.team = newTeam.team
      newContract = newTeam.contract.duration;
      newPlayer.wage = newTeam.contract.value;
      newPlayer.fame += (newPlayer.team.power - 2.5) * 10
      let lp = 99;

      if(oldTeamLeague == newPlayer.team.league) {
        lp = currentSeason.leagueTable.findIndex((team) => team === newPlayer.team) + 1;
      } else {
        let nationalTeams = Teams.find((league) => league.name === newPlayer.team.league)?.teams || [];
        lp = GetLeaguePosition(nationalTeams, newPlayer.team).pos;
      }

      let league = Teams.find((league) => league.name === newPlayer.team.league);

      if(lp <= league.championsSpots) {
        newPlayer.championsQualification = true
        newPlayer.europaQualification = false
      }
      else if (lp <= league.championsSpots + league.europaSpots) {
        newPlayer.championsQualification = false
        newPlayer.europaQualification = true
      } else {
        newPlayer.championsQualification = false
        newPlayer.europaQualification = false
      }
    } else if(newContract <= 0) {   //else if contract expires
      newContract = RandomNumber(1, 3)
      newPlayer.wage = Math.floor(Math.pow(newPlayer.overall + (newContract * newPlayer.potential) + (newPlayer.team.power - 2.5) * 3 + newPlayer.fame / 6, 2) / 50) / 10;
    }

    //calcule the player's performance
    
    let newPerformance = 1//(RandomNumber(-10, 10) - RandomNumber(-10, 10) + (newPlayer.team.power - 2) * 2) / 20
    newPlayer.overall = (85 + newPlayer.potential * 1.5) - Math.pow((27.5 - newPlayer.age + newPlayer.potential / 2), 2) / 12 + newPerformance;
    newGeneralPerformance += newPerformance

    //giving the performance, set how many games did they were the starter player
    let starting = Math.floor(10 * (newPlayer.overall - (70 + (newPlayer.team.power - 2.5) * 4)))
    if(starting > 100) starting = 100
    else if(starting < 0) starting = 0

    //set season start
    let newSeason = {
      year: year+1,
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
      fame: newPlayer.fame
    }

    //save
    setCurrentSeason(newSeason)
    setPlayer(newPlayer);
    setYear(year+1)
    setContract(newContract)
    setGeneralPerformance(newGeneralPerformance)
  }

  function Continue() {
    document.getElementById('team-choice').style.display = "flex"
    document.getElementById('continue').style.display = "none"

    let newPlayer = player;
    let newSeason = currentSeason;

    //giving the starting rate, randomize how many goals/assists did they score
    let goalsOppostunities = (newPlayer.position.goalsBonus * (1 + (RandomNumber(0, newPlayer.team.power * 2) + newSeason.performance * 10) / 20))
    let assistsOppostunities = (newPlayer.position.assistsBonus * (1 + (RandomNumber(0, newPlayer.team.power * 2) + newSeason.performance * 10) / 20))

    newSeason.goals = Math.floor(((newSeason.starting / 100) * goalsOppostunities * (newPlayer.overall / 100)));
    newSeason.assists = Math.floor(((newSeason.starting / 100) * assistsOppostunities * (newPlayer.overall / 100)));

    if(newSeason.goals < 0) newSeason.goals = 0;
    if(newSeason.assists < 0) newSeason.assists = 0;

    newSeason.awardPoints = newSeason.performance * 2;

    //national tournaments
    let league = Teams.find((league) => league.name === newPlayer.team.league);

    //national league
    let leagueResults = GetLeaguePosition(league.teams, newPlayer.team);
    let leaguePosition = leagueResults.pos

    newSeason.leagueTable = leagueResults.table

    let topSix = ""
    for(let p = 0; p < 6; p++) {
      topSix += "->" + (p+1) + "º: "+ leagueResults.table[p].name
    }

    if(leaguePosition == 1) newPlayer.leagues++

    newSeason.awardPoints += (5-leaguePosition) / 2
    newSeason.leaguePosition = leaguePosition
    newSeason.titles.push("Liga: " + newSeason.leaguePosition + "º lugar" + topSix);

    //national cup
    let opponents = [];
    for(let i = 0; i < 5; i++) {
      let op = league.teams[RandomNumber(0, league.teams.length - 1)]
      while (op.name == newPlayer.team.name || opponents.includes(op)) {
        op = league.teams[RandomNumber(0, league.teams.length - 1)]
      }
      opponents.push(op) 
    }

    let description = ""
    let end = false;
    let phase = 0;

    while (!end) {
      let game = GetWinner(newPlayer.team, opponents[phase], newSeason.performance * 2)

      description += "->" + TournamentPath[phase + 2] + ": " + game.game;

      if(game.result) {
        phase++
        newSeason.awardPoints += 0.2
        if(phase >= TournamentPath.length - 3){
          end = true
          newPlayer.nationalCup++
        }
      } else {
        end = true
      }
    }

    description = "Copa Nacional: " + TournamentPath[phase + 2] + description

    newSeason.nationalCupPhase = phase;
    newSeason.titles.push(description);

    if(newPlayer.championsQualification) {    //Champions League
      phase = 1;

      let op1 = GetNewOpponent()
      while (op1.power <= 3 || op1.power == newPlayer.team.power || newPlayer.team.league == op1.league) {
        op1 = GetNewOpponent()
      }

      let op2 = GetNewOpponent()
      while (op2.power <= 3 || op2.power == newPlayer.team.power || op1.power == op2.power || newPlayer.team.league == op2.league || op1.league == op2.league) {
        op2 = GetNewOpponent()
      }

      description = "->" + TournamentPath[phase] + ": " + op1.name + " / " + op2.name;

      if(GetWinner(newPlayer.team, op1, newSeason.performance * 5).result || GetWinner(newPlayer.team, op2, newSeason.performance * 5).result) {
        phase++;
        opponents = [];
        end = false;
        while (!end) {
          let op = GetNewOpponent()
          while (op.power <= 4 || op.name == newPlayer.team.name || opponents.includes(op) || (phase <= 3 && (op1.name == op.name || op2.name == op.name))) {
            op = GetNewOpponent()
          }
          opponents.push(op) 

          let game = GetWinner(newPlayer.team, op, newSeason.performance * 5)

          description += "->" + TournamentPath[phase] + ": " + game.game;
    
          if(game.result) {
            phase++
            newSeason.awardPoints += 0.8
            if(phase >= TournamentPath.length - 1){
              end = true
              newPlayer.champions++
            }
          } else {
            end = true
          }
        }
      }

      description = "Champions League: " + TournamentPath[phase] + description

      newSeason.championsPhase = phase;
      newSeason.titles.push(description);

      if(newSeason.championsPhase == 1) newPlayer.europaQualification = true;
    }
    
    if (newPlayer.europaQualification) {    //Europa league
      phase = 1;

      let op1 = GetNewOpponent()
      while (op1.power >= 4.5 || newPlayer.team.league == op1.league) {
        op1 = GetNewOpponent()
      }

      let op2 = GetNewOpponent()
      while (op2.power >= 4.5 || newPlayer.team.league == op2.league || op1.league == op2.league) {
        op2 = GetNewOpponent()
      }

      if (newSeason.championsPhase == 1) description = "->Fase de Grupos da Champions"
      else description = "->" + TournamentPath[phase] + ": " + op1.name + " / " + op2.name;

      if(GetWinner(newPlayer.team, op1, newSeason.performance * 3) || GetWinner(newPlayer.team, op2, newSeason.performance * 3) || newSeason.championsPhase == 1) {
        phase++;
        opponents = [];
        end = false;
        while (!end) {
          let op = GetNewOpponent();
          while (op.power == 5 || op.name == newPlayer.team.name || opponents.includes(op) || (phase <= 3 && (op1.name == op.name || op2.name == op.name))) {
            op = GetNewOpponent();
          }
          opponents.push(op) 

          let game = GetWinner(newPlayer.team, op, newSeason.performance * 3)

          description += "->" + TournamentPath[phase] + ": " + game.game;
    
          if(game.result) {
            phase++
            if(phase >= TournamentPath.length - 1){
              end = true
              newPlayer.europa++
              newSeason.awardPoints++
            }
          } else {
            end = true
          }
        }
      }

      description = "Europa League: " + TournamentPath[phase] + description

      newSeason.europaPhase = phase;
      newSeason.titles.push(description);
    }

    //World Cup
    if ((year+2) % 4 == 0) {
      phase = 1;

      let op1 = Nations[RandomNumber(0, Nations.length - 1)];
      while (op1.power == player.nation.power || op1.continent == player.nation.continent) {
        op1 = Nations[RandomNumber(0, Nations.length - 1)]
      }

      let op2 = Nations[RandomNumber(0, Nations.length - 1)];
      while (op2.power == player.nation.power || op2.continent == player.nation.continent || op2.continent == op1.continent) {
        op2 = Nations[RandomNumber(0, Nations.length - 1)]
      }

      description = "->" + TournamentPath[phase] + ": " + op1.name + " / " + op2.name;

      if(GetWinner(newPlayer.nation, op1, newSeason.performance * 4).result || GetWinner(newPlayer.nation, op2, newSeason.performance * 4).result) {
        phase++;    
        opponents = [];
        end = false;
        while (!end) {
          let op = Nations[RandomNumber(0, Nations.length - 1)];
          while (op.power <= 4 || op.name == player.nation.name || opponents.includes(op) || (phase <= 3 && (op1.name == op.name || op2.name == op.name))) {
            op = Nations[RandomNumber(0, Nations.length - 1)];
          }
          opponents.push(op) 

          let game = GetWinner(newPlayer.nation, op, newSeason.performance * 4);

          description += "->" + TournamentPath[phase] + ": " + game.game;
    
          if(game.result) {
            phase++
            newSeason.awardPoints += 0.6
            if(phase >= TournamentPath.length - 1){
              end = true
              newPlayer.worldCup++
            }
          } else {
            end = true
          }
        }
      }

      description = "World Cup: " + TournamentPath[phase] + description

      newSeason.worldCupPhase = phase;
      newSeason.titles.push(description);
    }

    //add goals to the carrer summary
    newPlayer.totalGoals += newSeason.goals;
    newPlayer.totalAssists += newSeason.assists;

    //post season results
    if(RandomNumber(0,100) < 1) newSeason.titles.push("Puskás");  //Puskás

    if(35 + RandomNumber(0,10) < newSeason.goals) {  //Golden Shoes
      newPlayer.goldenShoes++
      newSeason.awardPoints++
      newPlayer.fame += 10
      newSeason.titles.push("Chuteira de Ouro");
    }

    newPlayer.fame += newSeason.awardPoints

    if(newSeason.awardPoints + newPlayer.overall >= 99) {    //Ballon D'or
      newPlayer.ballonDOr++;
      newSeason.titles.push("Ballon D'Or: Ganhador");
      newPlayer.fame += 30
      if(newPlayer.fame < 100) newPlayer.fame = 100;
    } else if(newSeason.awardPoints + newPlayer.overall >= 90) {
      let pts = Math.floor((newSeason.awardPoints + newPlayer.overall) - 90)
      newPlayer.fame += pts * 2
      let position = 10 - pts;
      newSeason.titles.push("Ballon D'Or: " + position + "º lugar");
    }

    //trasnfer window

    //fired
    if(contract <= 1 && (newPlayer.overall >= 80 + (newPlayer.team.power - 2.5) * 8 || (newPlayer.age > 28 && newPlayer.overall <= 82.5 + newPlayer.team.power) ||
      generalPerformance < 0)) {
        document.getElementById("decision-stay").style.display = "none"
      } else {
        document.getElementById("decision-stay").style.display = "flex"
      }

    //load option of transfer
    let newTransfer1 = GetNewTeam(newPlayer);
    let newTransfer2 = GetNewTeam(newPlayer);

    if(newTransfer1 == null) {
      document.getElementById("decision-transfer1").style.display = "none"
    } else {
      document.getElementById("decision-transfer1").style.display = "flex"
      setTransfer1(newTransfer1);
    }

    if(newTransfer1 != null) {
      if(newTransfer2 == null || newTransfer2.team.name == newTransfer1.team.name) {
        document.getElementById("decision-transfer2").style.display = "none"
      } else {
        document.getElementById("decision-transfer2").style.display = "flex"
        setTransfer2(newTransfer2);
      }  
    } else {
      if(newTransfer2 == null) {
        document.getElementById("decision-transfer2").style.display = "none"
        document.getElementById("retire").style.display = "flex";;
      } else {
        setTransfer2(newTransfer2);
      }  
    }

    
    if(newPlayer.age >= 28) {    //retire option
      document.getElementById("retire").style.display = "flex";
    }

    if(leaguePosition <= league.championsSpots) {
      newPlayer.championsQualification = true
      newPlayer.europaQualification = false
    }
    else if (leaguePosition <= league.championsSpots + league.europaSpots) {
      newPlayer.championsQualification = false
      newPlayer.europaQualification = true
    } else {
      newPlayer.championsQualification = false
      newPlayer.europaQualification = false
    }

    //set pleyer
    setPlayer(newPlayer);

    if(newPlayer.fame < 0) newPlayer.fame = 0;
    
    newSeason.fame = newPlayer.fame

    if(newSeason.fame > maxFame) setMaxFame(newSeason.fame);

    //set Seasons
    const newSeasons = [
      ... seasons,
      newSeason
    ];
    setSeasons(newSeasons)

    //continue
    if(contract > 1) ChooseTeam()
  }

  function GetLeaguePosition(teams, playerTeam) {
    let points = new Array(teams.length).fill(0);
    for (let home = 0; home < teams.length; home++) {
      for (let away = 0; away < teams.length; away++) {
        if (teams[home] !== teams[away]) {
          let game = GetGame(teams[home], teams[away], 0.5)
  
          if (game[0] > game[1]) {
            points[home] += 3;
          } else if (game[1]  > game[0]) {
            points[away] += 3;
          } else {
            points[away] += 1;
            points[home] += 1;
          }
        }
      }
    }
  
    let teamPositions = [...Array(teams.length).keys()].map((position) => position + 1);
  
    teamPositions.sort((a, b) => points[b - 1] - points[a - 1]);
  
    let playerPosition = teamPositions.findIndex((position) => teams[position - 1] === playerTeam);

    let table = teamPositions.map((position) => teams[position - 1]);
  
    return {
      pos: playerPosition + 1,
      table: table
    };
  }  

  function GetGame(team1, team2, bonus) {
    let team1Points = RandomNumber(0, (team1.power - 2) * 4) + RandomNumber(0, (team1.power - 2) * 4) + bonus 
    let team2Points = RandomNumber(0, (team2.power - 2) * 4) + RandomNumber(0, (team2.power - 2) * 4)

    let divisor = 5
    let team1Score = Math.floor(team1Points / divisor);
    let team2Score = Math.floor(team2Points / divisor);
    
    while(team2Score + team1Score > 5) {
      divisor++
      team1Score = Math.floor(team1Points / divisor);
      team2Score = Math.floor(team2Points / divisor);
    }

    if(team1Score < 0) team1Score = 0;
    if(team2Score < 0) team2Score = 0;

    return [team1Score, team2Score]
  }

  function GetWinner(playerTeam, opponent, bonus) {
    let playerTeamPoints = RandomNumber(playerTeam.power, (playerTeam.power - 2) * 4) + RandomNumber(playerTeam.power, (playerTeam.power - 2) * 4) + bonus 
    let opponentPoints = RandomNumber(opponent.power, (opponent.power - 2) * 4) + RandomNumber(opponent.power, (opponent.power - 2) * 4)

    let result = (opponentPoints < playerTeamPoints)

    let divisor = 5
    let playerTeamScore = Math.floor(playerTeamPoints / divisor);
    let opponentScore = Math.floor(opponentPoints / divisor);
    
    while(playerTeamScore + opponentScore > 5) {
      divisor++
      playerTeamScore = Math.floor(playerTeamPoints / divisor);
      opponentScore = Math.floor(opponentPoints / divisor);
    }

    if(playerTeamScore < 0) playerTeamScore = 0;
    if(opponentScore < 0) opponentScore = 0;

    let game = playerTeam.name + " " + playerTeamScore + " x " + opponentScore + " " + opponent.name

    return {"result": result, "game": game}
  }

  function GetNewOpponent() {
    let leagueID = RandomNumber(0, Teams.length-1);
    let league = Teams[leagueID];
    let team = league.teams[RandomNumber(0, league.teams.length-1)];

    return(team) 
  }
  
  function GetNewTeam(currentPlayer = null) {
    let leagueID = RandomNumber(0, Teams.length-1);
    let league = Teams[leagueID];
    let team = league.teams[RandomNumber(0, league.teams.length-1)];
    let contractDuration = RandomNumber(2,4);
    let contractValue = Math.floor(Math.pow(80 + (contractDuration * 3) + (team.power - 2.5) * 3, 2) / 50) / 10;

    if(currentPlayer) {
      let count = 0
      while (currentPlayer.overall >= 80 + (team.power - 2) * 8 || 
      (currentPlayer.age > 28 && currentPlayer.overall <= 80 + (team.power - 2.5) * 2) ||
      currentPlayer.team.name == team.name) {
        league = Teams[leagueID];
        team = league.teams[RandomNumber(0, league.teams.length-1)];

        count++
        if(count > 20) return(null) 
      }

      contractValue = Math.floor(Math.pow(currentPlayer.overall + (contractDuration * currentPlayer.potential) + (team.power - 2.5) * 3 + currentPlayer.fame / 6, 2) / 50) / 10;
    }
    
    let newContract = {"value": contractValue, "duration": contractDuration}

    return({"team": team, "contract": newContract}) 
  }
  
  function GetNewPosition() {
    let posID = RandomNumber(0, positions.length-1);
    let pos = positions[posID];
    return(pos)
  }

  function Retire() {
    document.getElementById("team-choice").style.display = "none";
    document.getElementById("continue").style.display = "none";
    let chart = document.getElementById('chart')
    chart.style.display = 'flex';
  }

  return (
    <>
      <header>
        <h1>Football Career Simulator</h1>
        <h3 style={{marginTop: "1rem"}}>Como Jogar</h3>
        <ol style={{marginLeft: "2rem"}}>
          <li>Escolha entre ficar ou transferir para outro time.</li>
          <li>O jogo simulará a partir do que você escolheu</li>
          <li>Você pode recarregar a página para alterar os atributos iniciais do jogador</li>
          <li>Boa sorte e divirta-se</li>
        </ol>
      </header>
      <div className='career'>
        {seasons.map((s, index) => (
          <Season key={index} season={s} open={index >= seasons.length - 1}/>
        ))}
      </div>
      <div className='choices' id='team-choice'>
        <a className='d-stay' id='decision-stay' style={{display: "none"}} onClick={() => (ChooseTeam())}>Continuar em {player.team == null ? "" : player.team.name}</a>
        <a className='d-alert' id='decision-transfer1' onClick={() => (ChooseTeam(transfer1))}><p>Transferir para {transfer1.team.name}</p> <p>(${transfer1.contract.value}M | {transfer1.contract.duration} anos)</p></a>
        <a className='d-alert' id='decision-transfer2' onClick={() => (ChooseTeam(transfer2))}><p>Transferir para {transfer2.team.name}</p> <p>(${transfer2.contract.value}M | {transfer2.contract.duration} anos)</p></a>
        <a className='d-alert' id='retire' style={{display: "none"}}  onClick={() => (Retire())}>Aposentar-se</a>
      </div>
      <div className='choices' id='continue' style={{display: "none"}}>
        <a className='d-stay' onClick={() => (Continue())}>Simular Temporada ({contract} {(contract > 1) ? "anos restantes" : "ano restante"})</a>
      </div>
      <div className='chart' id='chart' style={{display: 'none'}}>
          <ChartComponent data={seasons}/>
      </div>
      <div className='stats'>
        <h1>Carreira</h1>
        <div>
          <p>Fama da Carreira: {Math.floor(maxFame)} ({StarPath[Math.floor(maxFame / 50)]})</p>
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
          <p>Chuteiras de Ouro: {player.goldenShoes}</p>
          <p>Ballon D'Or: {player.ballonDOr}</p>
        </div>
      </div>
    </>
  );
}

export default App;
