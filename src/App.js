import React, { useCallback, useEffect, useState } from 'react';
import './App.css';
import Teams from './Database/teams.json';
import Nations from './Database/nations.json'
import Sponsor from './Database/sponsors.json'
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
    leaguePosition: null,
    championsPhase: null,
    europaPhase: null,
    worldCupPhase: null,
    seasonSponsor: null,
    fame: null
  });

  const [year, setYear] = useState(new Date().getFullYear()-1);

  const [player, setPlayer] = useState({ 
    potential: RandomNumber(1, 5),
    age: 17,
    nation: Nations[RandomNumber(0, Nations.length-1)],
    team: GetNewOpponent(),
    position: GetNewPosition(),
    wage: 10,
    overall: 70,
    totalGoals: 0,
    totalAssists: 0,
    leagues: 0,
    europa: 0,
    champions: 0,
    worldCup: 0,
    goldenShoes: 0,
    ballonDOr: 0,
    championsQualification: false,
    europaQualification: false,
    currentSponsor: GetNewSponsor(),
    fame: 0
  })

  const [contract, setContract] = useState(0)

  const [changeSponsor, setChangeSponsor] = useState(GetNewSponsor())

  const [maxFame, setMaxFame] = useState(0);

  const [transfer1, setTransfer1] = useState(GetNewTeam({ 
    potential: 3,
    age: 17,
    overall: 72
  }));

  const [transfer2, setTransfer2] = useState(GetNewTeam({ 
    potential: 3,
    age: 17,
    overall: 72
  }));

  function ChooseTeam (newTeam = null) {   //next season
    document.getElementById('team-choice').style.display = "none"
    document.getElementById('sponsor-choice').style.display = "flex"

    //load all player's stats
    let newPlayer = player

    newPlayer.age++

    let newContract = contract - 1
    
    //pre season setup
    if(newTeam) {    //if they change team
      newPlayer.fame -= newPlayer.team.power * 10
      if(newPlayer.fame < 0) newPlayer.fame = 0;
      newPlayer.team = newTeam.team
      newContract = newTeam.contract.duration;
      newPlayer.wage = newTeam.contract.value;
      newPlayer.fame += newPlayer.team.power * 10
      let lp = GetLeaguePosition(newPlayer.team.power);
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
      newContract = Math.floor((60 - newPlayer.age) / 10)
      newPlayer.wage = Math.floor(Math.pow(newPlayer.overall + newContract * newPlayer.potential * RandomNumber(0, newPlayer.team.power) / 2, 2) / 10) / 10;
    }

    //calcule the player's performance
    
    let newPerformance = (RandomNumber(-10, 10) + RandomNumber(-10, 10) + newPlayer.team.power) / 10
    newPlayer.overall = (82 + newPlayer.potential * 2) - Math.pow((30 - newPlayer.age), 2) / 10 + newPerformance;
    if(newPlayer.overall > 100) newPlayer.overall = 100;

    //giving the performance, set how many games did they were the starter player
    let starting = Math.floor(8 * (newPlayer.overall - (67.5 + newPlayer.team.power * 1.5)))
    if(starting > 100) starting = 100
    else if(starting < 0) starting = 0

    let newSp = GetNewSponsor();
    while (newSp.name == newPlayer.currentSponsor.company_name || newSp.fame_rating > newPlayer.fame / 20) {
      newSp = GetNewSponsor();
    }
    setChangeSponsor(newSp);

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
      leaguePosition: (8-newPlayer.team.power),
      championsPhase: 0,
      europaPhase: 0,
      worldCupPhase: 0,
      seasonSponsor: newPlayer.currentSponsor,
      fame: newPlayer.fame
    }

    //save
    setCurrentSeason(newSeason)
    setPlayer(newPlayer);
    setYear(year+1)
    setContract(newContract)
  }

  function ChooseSponsor(newSp = null) {
    document.getElementById('team-choice').style.display = "flex"
    document.getElementById('sponsor-choice').style.display = "none"

    let newPlayer = player;
    let newSeason = currentSeason;

    if(newSp) {
      newPlayer.currentSponsor = newSp;
      newSeason.seasonSponsor = newSp;
    }

    newPlayer.fame += RandomNumber(0, newPlayer.currentSponsor.fame_rating) / 2
    //giving the starting rate, randomize how many goals/assists did they score
    newSeason.goals = Math.floor(((newSeason.starting / 100) * (newPlayer.team.power * 2 + newPlayer.position.goalsBonus) * (newPlayer.overall / 100)) + newSeason.performance * 4);
    newSeason.assists = Math.floor(((newSeason.starting / 100) * (newPlayer.team.power + newPlayer.position.assistsBonus) * (newPlayer.overall / 100)) + newSeason.performance * 2);

    if(newSeason.goals < 0) newSeason.goals = 0;
    if(newSeason.assists < 0) newSeason.assists = 0;

    let awardPoints = newSeason.performance * 2;

    let playerAssistBonus = (newPlayer.performance > 1) ? 1.5 : (newPlayer.performance > -1) ? 0.5 : -0.5;

    //League
    let leaguePosition = GetLeaguePosition(newPlayer.team.power)

    if(leaguePosition <= 1) {
      newPlayer.leagues++
      leaguePosition = 1
    }

    awardPoints += (4-leaguePosition)
    newSeason.leaguePosition = leaguePosition
    newSeason.titles.push("Liga: " + newSeason.leaguePosition + "º lugar");

    //Champions & Europa League
    if(newPlayer.championsQualification) {
      let phase = 1;

      let op1 = GetNewOpponent()
      while (op1.power <= 1 || op1.power == newPlayer.team.power || newPlayer.team.league == op1.league) {
        op1 = GetNewOpponent()
      }

      let op2 = GetNewOpponent()
      while (op2.power <= 1 || op2.power == newPlayer.team.power || op1.power == op2.power || newPlayer.team.league == op2.league || op1.league == op2.league) {
        op2 = GetNewOpponent()
      }

      let description = TournamentPath[phase] + ": " + op1.name + " / " + op2.name;

      if(GetWinner(op1, newPlayer.team, playerAssistBonus).result || GetWinner(op2, newPlayer.team, playerAssistBonus).result) {
        phase++;    
        let opponents = [];
        let end = false;
        while (!end) {
          let op = GetNewOpponent()
          while (op2.power <= 1 || op.power < (phase / 2 + 1) || op.name == newPlayer.team.name || opponents.includes(op) || (phase <= 3 && (op1.name == op.name || op2.name == op.name))) {
            op = GetNewOpponent()
          }
          opponents.push(op) 

          let game = GetWinner(op, newPlayer.team, playerAssistBonus)

          description += "->" + TournamentPath[phase] + ": " + game.game;
    
          if(game.result) {
            phase++
            awardPoints++
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
      let phase = 1;

      let op1 = GetNewOpponent()
      while (op1.power >= 4 || op1.power == newPlayer.team.power || newPlayer.team.league == op1.league) {
        op1 = GetNewOpponent()
      }

      let op2 = GetNewOpponent()
      while (op2.power >= 4 || op2.power == newPlayer.team.power || op1.power == op2.power || newPlayer.team.league == op2.league || op1.league == op2.league) {
        op2 = GetNewOpponent()
      }

      let description = TournamentPath[phase] + ": " + op1.name + " / " + op2.name;
      
      if(GetWinner(op1, newPlayer.team, playerAssistBonus) || GetWinner(op2, newPlayer.team, playerAssistBonus)) {
        phase++;    
        let opponents = [];
        let end = false;
        while (!end) {
          let op = GetNewOpponent();
          while (op.power >= 4 || op.name == newPlayer.team.name || opponents.includes(op) || (phase <= 3 && (op1.name == op.name || op2.name == op.name))) {
            op = GetNewOpponent();
          }
          opponents.push(op) 

          let game = GetWinner(op, newPlayer.team, playerAssistBonus)

          description += "->" + TournamentPath[phase] + ": " + game.game;
    
          if(game.result) {
            phase++
            if(phase >= TournamentPath.length - 1){
              end = true
              newPlayer.europa++
              awardPoints++
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
      let phase = 1;

      let op1 = Nations[RandomNumber(0, Nations.length - 1)];
      while (op1.power == player.nation.power) {
        op1 = Nations[RandomNumber(0, Nations.length - 1)]
      }

      let op2 = Nations[RandomNumber(0, Nations.length - 1)];
      while (op2.power == player.nation.power || op1.power == op2.power || (op1.continent == op2.continent && op2.continent == player.nation.continent)) {
        op2 = Nations[RandomNumber(0, Nations.length - 1)]
      }

      let description = TournamentPath[phase] + ": " + op1.name + " / " + op2.name;

      if(GetWinner(op1, newPlayer.nation, playerAssistBonus) || GetWinner(op2, newPlayer.nation, playerAssistBonus)) {
        phase++;    
        let opponents = [];
        let end = false;
        while (!end) {
          let op = Nations[RandomNumber(0, Nations.length - 1)];
          while (op.power < (phase) / 2 + 1 || op.name == player.nation.name || opponents.includes(op) || (phase <= 3 && (op1.name == op.name || op2.name == op.name))) {
            op = Nations[RandomNumber(0, Nations.length - 1)];
          }
          opponents.push(op) 

          let game = GetWinner(op, newPlayer.nation, playerAssistBonus);

          description += "->" + TournamentPath[phase] + ": " + game.game;
    
          if(game.result) {
            phase++
            if(phase >= TournamentPath.length - 1){
              end = true
              newPlayer.worldCup++
              awardPoints++
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

    if(RandomNumber(40,50) < newSeason.goals) {  //Golden Shoes
      newPlayer.goldenShoes++
      awardPoints++
      newSeason.titles.push("Chuteira de Ouro");
    }

    newPlayer.fame += awardPoints

    if(awardPoints + newPlayer.overall >= 100) {    //Ballon D'or
      newPlayer.ballonDOr++;
      newSeason.titles.push("Ballon D'Or: Ganhador");
      newPlayer.fame += 25
      if(newPlayer.fame < 100) newPlayer.fame = 100;
    } else if(awardPoints + newPlayer.overall >= 90) {
      let ballonDOr_pos = Math.floor(101 - (awardPoints + newPlayer.overall))
      newSeason.titles.push("Ballon D'Or: " + ballonDOr_pos + "º lugar");
      newPlayer.fame += (10 - ballonDOr_pos)
    }

    //trasnfer window

    //fired
    if(contract <= 1 && (newPlayer.overall >= 75 + newPlayer.team.power * 4 || newPlayer.overall <= 65 + newPlayer.team.power * 3)) {
        document.getElementById("decision-stay").style.display = "none"
      } else {
        document.getElementById("decision-stay").style.display = "flex"
      }

    //load option of transfer
    let newTransfer1 = GetNewTeam(newPlayer);
    let newTransfer2 = GetNewTeam(newPlayer);

    while (newTransfer1.team.name == newPlayer.team.name || newTransfer2.team.name == newPlayer.team.name || newTransfer1.team.name == newTransfer2.team.name) {
      newTransfer1 = GetNewTeam(newPlayer);
      newTransfer2 = GetNewTeam(newPlayer);
    } 

    setTransfer1(newTransfer1);
    setTransfer2(newTransfer2);

    if(newPlayer.age >= 30) {    //retire option
      let retire_btn = document.getElementById("retire");
      retire_btn.style.display = "flex";
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

  function GetLeaguePosition(teamPower) {
    let pos = (6 - teamPower) + Math.floor((RandomNumber(-2, 2) - RandomNumber(-2, 2)) / 2)
     return pos;
  }

  function GetWinner(opponent, playerTeam, bonus) {
    let opponentScore = RandomNumber(0, opponent.power * opponent.power)
    let playerTeamScore = RandomNumber(0, playerTeam.power * playerTeam.power) + bonus

    let result = (opponentScore < playerTeamScore)

    if(playerTeamScore < 0) playerTeamScore = 0;

    opponentScore = Math.floor(opponentScore / (2.5 + playerTeam.power / 2.5));
    playerTeamScore = Math.floor(playerTeamScore / (2.5 + opponent.power / 2.5));

    let game = playerTeam.name + " " + playerTeamScore + " x " + opponentScore + " " + opponent.name

    return {"result": result, "game": game}
  }

  function GetNewOpponent() {
    let leagueID = RandomNumber(0, Teams.length-1);
    let league = Teams[leagueID];
    let team = league.teams[RandomNumber(0, league.teams.length-1)];

    return(team) 
  }
  
  function GetNewTeam(currentPlayer) {
    let leagueID = RandomNumber(0, Teams.length-1);
    let league = Teams[leagueID];
    let team = league.teams[RandomNumber(0, league.teams.length-1)];

    let count = 0;

    while (
      currentPlayer.overall >= 80 + team.power * 4 || 
      currentPlayer.overall <= 60 + team.power * 2 ||
      (currentPlayer.age > 30 && currentPlayer.overall <= 70 + team.power * 2)) {
      league = Teams[leagueID];
      team = league.teams[RandomNumber(0, league.teams.length-1)];

      count++
      if(count > 10) {
        return(null) 
      }
    }

    let contractDuration = Math.floor((60 - currentPlayer.age) / 10) + RandomNumber(0,2);
    let contractValue = Math.floor(Math.pow(currentPlayer.overall + contractDuration * currentPlayer.potential * RandomNumber(0, team.power) / 2, 2) / 10) / 10;
    let newContract = {"value": contractValue, "duration": contractDuration}
    return({"team": team, "contract": newContract}) 

  }
  
  function GetNewPosition() {
    let posID = RandomNumber(0, positions.length-1);
    let pos = positions[posID];
    return(pos)
  }

  function GetNewSponsor() {
    let sponsorID = RandomNumber(0, Sponsor.length - 1);
    let sp = Sponsor[sponsorID];
    return(sp)
  }

  function Retire() {
    document.getElementById("team-choice").style.display = "none";
    document.getElementById("sponsor-choice").style.display = "none";
    let chart = document.getElementById('chart')
    chart.style.display = 'flex';
    chart.scrollIntoView()
  }

  return (
    <>
      <header>
        <h1>Football Career Simulator</h1>
        <h3 style={{marginTop: "1rem"}}>Como Jogar</h3>
        <ol style={{marginLeft: "2rem"}}>
          <li>Escolha entre ficar ou transferir para outro time.</li>
          <li>Escolha entre manter ou assinar com outro patrocinador.</li>
          <li>O jogo simulará uma temporada a partir do que você escolheu</li>
          <li>Você pode recarregar a página caso não gostar dos atributos iniciais de seu jogador</li>
          <li>Boa sorte e divirta-se</li>
        </ol>
      </header>
      <div className='career'>
        {seasons.map((s, index) => (
          <Season key={index} season={s} open={index >= seasons.length - 1}/>
        ))}
      </div>
      <div className='choices' id='team-choice'>
        <a className='d-stay' id='decision-stay' style={{display: "none"}} onClick={() => (ChooseTeam())}>Continuar em {player.team.name}</a>
        <a className='d-alert' id='decision-transfer1' onClick={() => (ChooseTeam(transfer1))}>Transferir para {transfer1.team.name} (${transfer1.contract.value}M | {transfer1.contract.duration} anos)</a>
        <a className='d-alert' id='decision-transfer2' onClick={() => (ChooseTeam(transfer2))}>Transferir para {transfer2.team.name} (${transfer2.contract.value}M | {transfer2.contract.duration} anos)</a>
        <a className='d-alert' id='retire' style={{display: "none"}}  onClick={() => (Retire())}>Aposentar-se</a>
      </div>
      <div className='choices' id='sponsor-choice' style={{display: "none"}}>
        <a className='d-stay' id='decision-same-sponsor' onClick={() => (ChooseSponsor())}>Continuar com {player.currentSponsor.company_name} (${player.currentSponsor.contract_value}M)</a>
        <a className='d-alert' id='decision-change-sponsor' onClick={() => (ChooseSponsor(changeSponsor))}>Assinar com {changeSponsor.company_name} (${changeSponsor.contract_value}M)</a>
      </div>
      <div className='stats'>
        <h1>Carreira</h1>
        <div>
          <p>Fama da Carreira: {Math.floor(maxFame)} ({StarPath[Math.floor(3 * maxFame / 100)]})</p>
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
          <p>Champions: {player.champions}</p>
          <p>Europa League: {player.europa}</p>
        </div>
        <div>
          <p>Chuteiras de Ouro: {player.goldenShoes}</p>
          <p>Ballon D'Or: {player.ballonDOr}</p>
        </div>
      </div>
      <div className='chart' id='chart' style={{display: 'none'}}>
          <ChartComponent data={seasons}/>
      </div>
    </>
  );
}

export default App;
