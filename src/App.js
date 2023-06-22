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
    assistsBonus: 15,
  },{
    title: "CF",
    goalsBonus: 27,
    assistsBonus: 15,
  },{
    title: "LF",
    goalsBonus: 24,
    assistsBonus: 15,
  },{
    title: "RF",
    goalsBonus: 24,
    assistsBonus: 15,
  },{
    title: "CAM",
    goalsBonus: 21,
    assistsBonus: 15,
  },{
    title: "LW",
    goalsBonus: 18,
    assistsBonus: 15,
  },{
    title: "RW",
    goalsBonus: 18,
    assistsBonus: 15,
  },{
    title: "LM",
    goalsBonus: 15,
    assistsBonus: 15,
  },{
    title: "CM",
    goalsBonus: 15,
    assistsBonus: 15,
  },{
    title: "RM",
    goalsBonus: 15,
    assistsBonus: 15,
  },{
    title: "LWB",
    goalsBonus: 12,
    assistsBonus: 12,
  },{
    title: "RWB",
    goalsBonus: 12,
    assistsBonus: 12,
  },{
    title: "CDM",
    goalsBonus: 9,
    assistsBonus: 9,
  },{
    title: "LB",
    goalsBonus: 6,
    assistsBonus: 6,
  },{
    title: "RB",
    goalsBonus: 6,
    assistsBonus: 6,
  },{
    title: "CB",
    goalsBonus: 3,
    assistsBonus: 3,
  },{
    title: "GK",
    goalsBonus: 0,
    assistsBonus: 0,
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
      newPlayer.fame -= (newPlayer.team == null ? 0 : newPlayer.team.power) * 10
      if(newPlayer.fame < 0) newPlayer.fame = 0;
      newPlayer.team = newTeam.team
      newContract = newTeam.contract.duration;
      newPlayer.wage = newTeam.contract.value;
      newPlayer.fame += newPlayer.team.power * 10
      let lp = -1;

      if(oldTeamLeague == newPlayer.team.league) {
        lp = currentSeason.leagueTable.findIndex((team) => team === newPlayer.team) + 1;
      } else {
        let nationalTeams = Teams.find((league) => league.name === newPlayer.team.league)?.teams || [];
        lp = GetLeaguePosition(nationalTeams, newPlayer.team).pos;
      }

      if(lp <= 4) {
        newPlayer.championsQualification = true
        newPlayer.europaQualification = false
      }
      else if (lp <= 6) {
        newPlayer.championsQualification = false
        newPlayer.europaQualification = true
      } else {
        newPlayer.championsQualification = false
        newPlayer.europaQualification = false
      }
    } else if(newContract <= 0) {   //else if contract expires
      newContract = RandomNumber(1, 3)
      newPlayer.wage = Math.floor(Math.pow(newPlayer.overall + (newContract * newPlayer.potential) + newPlayer.team.power + newPlayer.fame / 5, 2) / 50) / 10;
    }

    //calcule the player's performance
    
    let newPerformance = (RandomNumber(-10, 10) + RandomNumber(-10, 10) + newPlayer.team.power) / 20
    newPlayer.overall = (82 + newPlayer.potential * 2) - Math.pow((28 - newPlayer.age + newPlayer.potential / 2.5), 2) / 10 + newPerformance;
    newGeneralPerformance += newPerformance

    //giving the performance, set how many games did they were the starter player
    let starting = Math.floor(8 * (newPlayer.overall - (67.5 + newPlayer.team.power * 1.5)))
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
    newSeason.goals = Math.floor(((newSeason.starting / 100) * (newPlayer.team.power * 2 + newPlayer.position.goalsBonus) * (newPlayer.overall / 100)) + newSeason.performance * 4);
    newSeason.assists = Math.floor(((newSeason.starting / 100) * (newPlayer.team.power + newPlayer.position.assistsBonus) * (newPlayer.overall / 100)) + newSeason.performance * 2);

    if(newSeason.goals < 0) newSeason.goals = 0;
    if(newSeason.assists < 0) newSeason.assists = 0;

    newSeason.awardPoints = newSeason.performance * 2.5;

    let playerImpactBonus = (newPlayer.performance > 0.5) ? 2.5 : (newPlayer.performance > -0.5) ? 1.5 : 0.5;

    //national tournaments
    let nationalTeams = Teams.find((league) => league.name === newPlayer.team.league)?.teams || [];

    //national league
    let leagueResults = GetLeaguePosition(nationalTeams, newPlayer.team);
    let leaguePosition = leagueResults.pos

    newSeason.leagueTable = leagueResults.table

    let topSix = ""
    for(let p = 0; p < 6; p++) {
      topSix += "->" + (p+1) + "º: "+ leagueResults.table[p].name
    }

    if(leaguePosition == 1) newPlayer.leagues++

    newSeason.awardPoints += (4-leaguePosition)
    newSeason.leaguePosition = leaguePosition
    newSeason.titles.push("Liga: " + newSeason.leaguePosition + "º lugar->" + topSix);

    //national cup
    let opponents = [];
    for(let i = 0; i < 5; i++) {
      let op = nationalTeams[RandomNumber(0, nationalTeams.length - 1)]
      while (op.power > (i + 1) || op.power < (i - 2) || op.name == newPlayer.team.name || opponents.includes(op)) {
        op = nationalTeams[RandomNumber(0, nationalTeams.length - 1)]
      }
      opponents.push(op) 
    }

    let description = ""
    let end = false;
    let phase = 0;

    while (!end) {
      let game = GetWinner(opponents[phase], newPlayer.team, playerImpactBonus)

      description += "->" + TournamentPath[phase + 2] + ": " + game.game;

      if(game.result) {
        phase++
        newSeason.awardPoints += 0.4
        if(phase >= TournamentPath.length - 3){
          end = true
          newPlayer.nationalCup++
        }
      } else {
        end = true
      }
    }

    description = "Copa Nacional: " + TournamentPath[phase + 2] + "->" + description

    newSeason.nationalCupPhase = phase;
    newSeason.titles.push(description);
  
    //Champions & Europa League
    if(newPlayer.championsQualification) {
      phase = 1;

      let op1 = GetNewOpponent()
      while (op1.power == 0 || op1.power == newPlayer.team.power || newPlayer.team.league == op1.league) {
        op1 = GetNewOpponent()
      }

      let op2 = GetNewOpponent()
      while (op2.power == 0 || op2.power == newPlayer.team.power || op1.power == op2.power || newPlayer.team.league == op2.league || op1.league == op2.league) {
        op2 = GetNewOpponent()
      }

      let description = TournamentPath[phase] + ": " + op1.name + " / " + op2.name;

      if(GetWinner(op1, newPlayer.team, playerImpactBonus).result || GetWinner(op2, newPlayer.team, playerImpactBonus).result) {
        phase++;
        opponents = [];
        end = false;
        while (!end) {
          let op = GetNewOpponent()
          while (op2.power == 0 || op.power < (phase / 2 + 1) || op.name == newPlayer.team.name || opponents.includes(op) || (phase <= 3 && (op1.name == op.name || op2.name == op.name))) {
            op = GetNewOpponent()
          }
          opponents.push(op) 

          let game = GetWinner(op, newPlayer.team, playerImpactBonus)

          description += "->" + TournamentPath[phase] + ": " + game.game;
    
          if(game.result) {
            phase++
            newSeason.awardPoints++
            newPlayer.fame++
            if(phase >= TournamentPath.length - 1){
              end = true
              newPlayer.champions++
            }
          } else {
            end = true
          }
        }
      }

      description = "Champions League: " + TournamentPath[phase] + "->" + description

      newSeason.championsPhase = phase;
      newSeason.titles.push(description);
    } else if (newPlayer.europaQualification) {
      phase = 1;

      let op1 = GetNewOpponent()
      while (op1.power == 5 || newPlayer.team.league == op1.league) {
        op1 = GetNewOpponent()
      }

      let op2 = GetNewOpponent()
      while (op2.power == 5 || newPlayer.team.league == op2.league || op1.league == op2.league) {
        op2 = GetNewOpponent()
      }

      let description = TournamentPath[phase] + ": " + op1.name + " / " + op2.name;
      
      if(GetWinner(op1, newPlayer.team, playerImpactBonus) || GetWinner(op2, newPlayer.team, playerImpactBonus)) {
        phase++;
        opponents = [];
        end = false;
        while (!end) {
          let op = GetNewOpponent();
          while (op.power == 5 || op.name == newPlayer.team.name || opponents.includes(op) || (phase <= 3 && (op1.name == op.name || op2.name == op.name))) {
            op = GetNewOpponent();
          }
          opponents.push(op) 

          let game = GetWinner(op, newPlayer.team, playerImpactBonus)

          description += "->" + TournamentPath[phase] + ": " + game.game;
    
          if(game.result) {
            phase++
            newPlayer.fame += 0.5
            if(phase >= TournamentPath.length - 1){
              end = true
              newPlayer.europa++
            }
          } else {
            end = true
          }
        }
      }

      description = "Europa League: " + TournamentPath[phase] + "->" + description

      newSeason.europaPhase = phase;
      newSeason.titles.push(description);
    }

    //World Cup
    if ((year+2) % 4 == 0) {
      phase = 1;

      let op1 = Nations[RandomNumber(0, Nations.length - 1)];
      while (op1.power == player.nation.power) {
        op1 = Nations[RandomNumber(0, Nations.length - 1)]
      }

      let op2 = Nations[RandomNumber(0, Nations.length - 1)];
      while (op2.power == player.nation.power || op1.power == op2.power || (op1.continent == op2.continent && op2.continent == player.nation.continent)) {
        op2 = Nations[RandomNumber(0, Nations.length - 1)]
      }

      let description = TournamentPath[phase] + ": " + op1.name + " / " + op2.name;

      if(GetWinner(op1, newPlayer.nation, playerImpactBonus) || GetWinner(op2, newPlayer.nation, playerImpactBonus)) {
        phase++;    
        opponents = [];
        end = false;
        while (!end) {
          let op = Nations[RandomNumber(0, Nations.length - 1)];
          while (op.power < (phase) / 2 + 1 || op.name == player.nation.name || opponents.includes(op) || (phase <= 3 && (op1.name == op.name || op2.name == op.name))) {
            op = Nations[RandomNumber(0, Nations.length - 1)];
          }
          opponents.push(op) 

          let game = GetWinner(op, newPlayer.nation, playerImpactBonus);

          description += "->" + TournamentPath[phase] + ": " + game.game;
    
          if(game.result) {
            phase++
            newPlayer.fame++
            if(phase >= TournamentPath.length - 1){
              end = true
              newPlayer.worldCup++
              newSeason.awardPoints += 2
            }
          } else {
            end = true
          }
        }
      }

      description = "World Cup: " + TournamentPath[phase] + "->" + description

      newSeason.worldCupPhase = phase;
      newSeason.titles.push(description);
    }

    //add goals to the carrer summary
    newPlayer.totalGoals += newSeason.goals;
    newPlayer.totalAssists += newSeason.assists;

    //post season results
    if(RandomNumber(0,100) < 1) newSeason.titles.push("Puskás");  //Puskás

    if(37.5 + RandomNumber(0,10) < newSeason.goals) {  //Golden Shoes
      newPlayer.goldenShoes++
      newSeason.awardPoints += 2
      newPlayer.fame += 10
      newSeason.titles.push("Chuteira de Ouro");
    }

    newPlayer.fame += newSeason.awardPoints / 2

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
    if(contract <= 1 && (newPlayer.overall >= 80 + newPlayer.team.power * 4 || (newPlayer.age > 28 && newPlayer.overall <= 79 + newPlayer.team.power) ||
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

    if(leaguePosition <= 4) {
      newPlayer.championsQualification = true
      newPlayer.europaQualification = false
    }
    else if (leaguePosition <= 6) {
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
          let awayPower = teams[away].power / 2 + 2.5;
          let homePower = teams[home].power / 2 + 2.5;
  
          let awayScore = Math.floor(RandomNumber(awayPower, awayPower * awayPower) / 5);
          let homeScore = Math.floor(RandomNumber(homePower, homePower * homePower) / 5);
  
          if (awayScore > homeScore) {
            points[away] += 3;
          } else if (homeScore > awayScore) {
            points[home] += 3;
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

  function GetWinner(opponent, playerTeam, bonus) {
    let opponentPower = opponent.power / 2 + 2.5
    let playerTeamPower = playerTeam.power / 2 + 2.5

    let opponentScore = RandomNumber(opponent.power, opponentPower * opponentPower)
    let playerTeamScore = RandomNumber(playerTeam.power, playerTeamPower * playerTeamPower) + bonus 

    let result = (opponentScore < playerTeamScore)

    if(playerTeamScore < 0) playerTeamScore = 0;

    opponentScore = Math.floor(opponentScore / 5);
    playerTeamScore = Math.floor(playerTeamScore / 5);

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
    let contractValue = Math.floor(Math.pow(80 + (contractDuration * 3) + team.power, 2) / 50) / 10;

    if(currentPlayer) {
      let count = 0
      while (currentPlayer.overall >= 80 + team.power * 4 || 
      currentPlayer.overall <= 74 + team.power ||
      (currentPlayer.age > 28 && currentPlayer.overall <= 79 + team.power) ||
      currentPlayer.team.name == team.name) {
        league = Teams[leagueID];
        team = league.teams[RandomNumber(0, league.teams.length-1)];

        count++
        if(count > 10) return(null) 
      }
      contractValue = Math.floor(Math.pow(currentPlayer.overall + (contractDuration * currentPlayer.potential) + team.power + currentPlayer.fame / 5, 2) / 50) / 10;
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
        <a className='d-alert' id='decision-transfer1' onClick={() => (ChooseTeam(transfer1))}>Transferir para {transfer1.team.name} (${transfer1.contract.value}M | {transfer1.contract.duration} anos)</a>
        <a className='d-alert' id='decision-transfer2' onClick={() => (ChooseTeam(transfer2))}>Transferir para {transfer2.team.name} (${transfer2.contract.value}M | {transfer2.contract.duration} anos)</a>
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
