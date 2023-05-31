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
    goalsBonus: 10,
    assistsBonus: 4,
  },{
    title: "CF",
    goalsBonus: 9,
    assistsBonus: 5,
  },{
    title: "LW",
    goalsBonus: 8,
    assistsBonus: 6,
  },{
    title: "RW",
    goalsBonus: 8,
    assistsBonus: 6,
  },{
    
    title: "CAM",
    goalsBonus: 7,
    assistsBonus: 7,
  },{
    title: "LM",
    goalsBonus: 6,
    assistsBonus: 6,
  },{
    title: "RM",
    goalsBonus: 6,
    assistsBonus: 6,
  },{
    title: "CM",
    goalsBonus: 5,
    assistsBonus: 5,
  },{
    title: "CDM",
    goalsBonus: 4,
    assistsBonus: 4,
  },{
    title: "LB",
    goalsBonus: 6,
    assistsBonus: 6,
  },{
    title: "RB",
    goalsBonus: 5,
    assistsBonus: 5,
  },{
    title: "CB",
    goalsBonus: 4,
    assistsBonus: 4,
  },{
    title: "GK",
    goalsBonus: 4,
    assistsBonus: 4,
  }
]

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
    seasonSponsor: null
  });

  const [year, setYear] = useState(new Date().getFullYear()-1);

  const [player, setPlayer] = useState({ 
    potential: RandomNumber(1, 5),
    age: RandomNumber(17, 19),
    nation: Nations[RandomNumber(0, Nations.length-1)],
    team: GetNewTeam(),
    position: GetNewPosition(),
    wage: 20,
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
    currentSponsor: GetNewSponsor()
  })

  const [contract, setContract] = useState(0)

  const [changeSponsor, setChangeSponsor] = useState(GetNewSponsor())

  const [transfer1, setTransfer1] = useState(GetNewTeam());
  const [transfer2, setTransfer2] = useState(GetNewTeam());

  function ChooseTeam (team = null) {   //next season
    document.getElementById('team-choice').style.display = "none"
    document.getElementById('sponsor-choice').style.display = "flex"

    //load all player's stats
    let newPlayer = player

    newPlayer.age++

    //pre season setup
    if(team) {    //if they change team
      newPlayer.team = team
      let newContract = RandomNumber(1,3);
      newPlayer.wage = Math.floor(Math.pow(newPlayer.overall - newPlayer.age / 2, 2) / 2) / 10;
      setContract(newContract)
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
    } else {    //else if contract expires
      let cont = contract - 1;
      if(cont <= 0) {
        let newContract = RandomNumber(1,3);
        newPlayer.wage = Math.floor(Math.pow(newPlayer.overall - newPlayer.age / 2, 2) / 2) / 10;
        setContract(newContract)
      } else {
        setContract(cont)
      }
    }

    //calcule the player's performance
    
    let newPerformance = (RandomNumber(-10, 10) + RandomNumber(-10, 10) + newPlayer.team.power) / 10
    newPlayer.overall = (84 + newPlayer.potential * 2) - Math.pow((30 - newPlayer.age), 2) / 10 + newPerformance;
    if(newPlayer.overall > 100) newPlayer.overall = 100;
    
    //giving the performance, set how many games did they were the starter player
    let starting = Math.floor(8*(newPlayer.overall - (70 + 2 * newPlayer.team.power)))
    if(starting > 100) starting = 100
    else if(starting < 0) starting = 0

    let newSp = GetNewSponsor();
    while (newSp.name == newPlayer.currentSponsor.title) {
      newSp = GetNewPosition();
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
      seasonSponsor: newPlayer.currentSponsor
    }

    //save
    setCurrentSeason(newSeason)
    setPlayer(newPlayer);
    setYear(year+1)
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

    //giving the starting rate, randomize how many goals/assists did they score
    newSeason.goals = Math.floor((newSeason.starting * newPlayer.overall) / 250 + RandomNumber(0, newPlayer.position.goalsBonus));
    newSeason.assists = Math.floor((newSeason.starting * newPlayer.overall) / 500 + RandomNumber(0, newPlayer.position.assistsBonus));

    let awardPoints = newSeason.performance;

    //League
    let leaguePosition = GetLeaguePosition(newPlayer.team.power)

    leaguePosition += (newPlayer.performance > 1 ? 1 : newPlayer.performance < -1 ? -1 : 0)

    if(leaguePosition <= 1) {
      newPlayer.leagues++
      leaguePosition = 1
    }

    awardPoints += (4-leaguePosition)
    newSeason.leaguePosition = leaguePosition
    newSeason.titles.push("Liga: " + newSeason.leaguePosition + "° lugar");

    //Champions & Europa League
    if(newPlayer.championsQualification) {
      let phase = 1;
      let description = "Champions League: ";
      let opponents = [];

      let op = GetNewTeam();
      let op2 = GetNewTeam();
      while (op.power < (phase) / 2 + 1 ||
      ((op.name == op2.name || op2.name == newPlayer.team.name || newPlayer.team.name == op.name) || 
      (op.league == op2.league || op2.league == newPlayer.team.league ||  newPlayer.team.league == op.league))) {
        op = GetNewTeam()
        op2 = GetNewTeam()
      }
      opponents.push(op) 
      opponents.push(op2)

      description += " -> " + opponents[0].name + " / " + opponents[1].name;

      if(RandomNumber(0, opponents[0].power * opponents[1].power) < RandomNumber(0, newPlayer.team.power * newPlayer.team.power) +
      ((newPlayer.performance > 1) ? 1.5 : (newPlayer.performance > -1) ? 0.5 : -0.5)) {
        phase++;    
        awardPoints++

        let end = false;
        while (!end) {
          let op = GetNewTeam();
          while (op.power < (phase) / 2 + 1 || op.name == newPlayer.team.name || opponents.includes(op)) {
            op = GetNewTeam();
          }
          opponents.push(op) 

          description += " -> " + opponents[phase].name;
    
          if(RandomNumber(0, opponents[phase].power * opponents[phase].power) < RandomNumber(0, newPlayer.team.power * newPlayer.team.power) + 
          ((newPlayer.performance > 1) ? 1.5 : (newPlayer.performance > -1) ? 0.5 : -0.5)) {
            phase++
            awardPoints++
            if(phase >= TournamentPath.length - 1){
              end = true
              newPlayer.champions++
              awardPoints++
            }
          } else {
            end = true
          }
        }
      }

      newSeason.championsPhase = phase;
      newSeason.titles.push(description + " | " + TournamentPath[phase]);
    } else if (newPlayer.europaQualification) {
      let phase = 1;
      let description = "Europa League: ";
      let opponents = [];

      let op = GetNewTeam();
      let op2 = GetNewTeam();
      while (op.power > (phase) / 2 + 1 ||
      ((op.name == op2.name || op2.name == newPlayer.team.name || newPlayer.team.name == op.name) || 
      (op.league == op2.league || op2.league == newPlayer.team.league ||  newPlayer.team.league == op.league))) {
        op = GetNewTeam()
        op2 = GetNewTeam()
      }
      opponents.push(op) 
      opponents.push(op2)

      description += " -> " + opponents[0].name + " / " + opponents[1].name;

      if(RandomNumber(0, opponents[0].power * opponents[1].power) < RandomNumber(0, newPlayer.team.power * newPlayer.team.power) + 
      ((newPlayer.performance > 1) ? 1.5 : (newPlayer.performance > -1) ? 0.5 : -0.5)) {
        phase++;    

        let end = false;
        while (!end) {
          let op = GetNewTeam();
          while (op.power < (phase) / 2 + 1 || op.name == newPlayer.team.name || opponents.includes(op)) {
            op = GetNewTeam();
          }
          opponents.push(op) 

          description += " -> " + opponents[phase].name;
    
          if(RandomNumber(0, opponents[phase].power * opponents[phase].power) < RandomNumber(0, newPlayer.team.power * newPlayer.team.power) + 
          ((newPlayer.performance > 1) ? 1.5 : (newPlayer.performance > -1) ? 0.5 : -0.5)) {
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

      newSeason.europaPhase = phase;
      newSeason.titles.push(description + " | " + TournamentPath[phase]);
    }

    //World Cup
    if ((year+2) % 4 == 0) {
      let phase = 1;
      let description = "World Cup: ";
      let opponents = [];

      let op = Nations[RandomNumber(0, Nations.length - 1)];
      let op2 = Nations[RandomNumber(0, Nations.length - 1)];
      while (op.power < (phase) / 2 + 1 ||
      ((op.name == op2.name || op2.name == player.nation.name || player.nation.name == op.name) || 
      (op.continent == op2.continent || op2.continent == player.nation.continent || player.nation.continent == op.continent))) {
        op = Nations[RandomNumber(0, Nations.length - 1)]
        op2 = Nations[RandomNumber(0, Nations.length - 1)]
      }
      opponents.push(op) 
      opponents.push(op2)

      description += " -> " + opponents[0].name + " / " + opponents[1].name;

      if(RandomNumber(0, opponents[0].power * opponents[1].power) < RandomNumber(0, player.nation.power * player.nation.power) + 
      ((newPlayer.performance > 1) ? 1.5 : (newPlayer.performance > -1) ? 0.5 : -0.5)) {
        phase++;    

        let end = false;
        while (!end) {
          let op = Nations[RandomNumber(0, Nations.length - 1)];
          while (op.power < (phase) / 2 + 1 || op.name == player.nation.name || opponents.includes(op)) {
            op = Nations[RandomNumber(0, Nations.length - 1)];
          }
          opponents.push(op) 

          description += " -> " + opponents[phase].name;
    
          if(RandomNumber(0, opponents[phase].power * opponents[phase].power) < RandomNumber(0, player.nation.power * player.nation.power) +
          ((newPlayer.performance > 1) ? 1.5 : (newPlayer.performance > -1) ? 0.5 : -0.5)) {
            phase++
            if(phase >= TournamentPath.length - 1){
              end = true
              newPlayer.worldCup++
            }
          } else {
            end = true
          }
        }
      }

      newSeason.worldCupPhase = phase;
      newSeason.titles.push(description + " | " + TournamentPath[phase]);
    }

    //add goals to the carrer summary
    newPlayer.totalGoals += newSeason.goals;
    newPlayer.totalAssists += newSeason.assists;

    //post season results
    if(RandomNumber(0,100) < 1) newSeason.titles.push("Puskás");  //Puskás

    if(RandomNumber(40,50) < newSeason.goals) {  //Golden Shoes
      newPlayer.goldenShoes++
      awardPoints += 2
      newSeason.titles.push("Chuteira de Ouro");
    }

    if(awardPoints + newPlayer.overall >= 100) {    //Ballon D'or
      newPlayer.ballonDOr++;
      newSeason.titles.push("Ballon D'Or");
    }

    //trasnfer window

    //fired
    if((newSeason.performance <= -1 && 
      newSeason.europaPhase < newPlayer.team.power && newSeason.championsPhase < newPlayer.team.power && leaguePosition > (7 - newPlayer.team.power)) ||
      newPlayer.overall >= 85 + newPlayer.team.power * 3)
      document.getElementById("decision-stay").style.display = "none"
    else
      document.getElementById("decision-stay").style.display = "flex"

    //load option of transfer
    let newTransfer1 = GetNewTeam();
    let newTransfer2 = GetNewTeam();

    while (newTransfer1.name == newPlayer.team.name || newTransfer2.name == newPlayer.team.name || newTransfer1.name == newTransfer2.name || 
      newPlayer.overall >= 80 + newTransfer1.power * 4 || newPlayer.overall >= 80 + newTransfer2.power * 4) {
      newTransfer1 = GetNewTeam();
      newTransfer2 = GetNewTeam();
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

    //set Seasons
    const newSeasons = [
      ... seasons,
      newSeason
    ];
    setSeasons(newSeasons)
  }

  function GetLeaguePosition(teamPower) {
    let pos = RandomNumber(4, 8) - teamPower 
     return pos;
  }
  
  function GetNewTeam() {
    let leagueID = RandomNumber(0, Teams.length-1);
    let league = Teams[leagueID];
    let team = league.teams[RandomNumber(0, league.teams.length-1)];

    return(team)
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
    console.log(chart)
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
          <li>Boa sorte e divirta-se</li>
        </ol>
      </header>
      <div className='career'>
        {seasons.map((s, index) => (
          <Season key={index} season={s} open={index >= seasons.length - 1}/>
        ))}
      </div>
      <div className='choices' id='team-choice'>
        <a id='decision-stay' style={{display: "none"}} onClick={() => (ChooseTeam())}>Continuar em {player.team.name}</a>
        <a id='decision-transfer1' onClick={() => (ChooseTeam(transfer1))}>Transferir para {transfer1.name}</a>
        <a id='decision-transfer2' onClick={() => (ChooseTeam(transfer2))}>Transferir para {transfer2.name}</a>
        <a id='retire' style={{display: "none"}}  onClick={() => (Retire())}>Aposentar-se</a>
      </div>
      <div className='choices' id='sponsor-choice' style={{display: "none"}}>
        <a id='decision-same-sponsor' onClick={() => (ChooseSponsor())}>Continuar com {player.currentSponsor.name}: {player.currentSponsor.description}</a>
        <a id='decision-change-sponsor' onClick={() => (ChooseSponsor(changeSponsor))}>Assinar com {changeSponsor.name}: {changeSponsor.description}</a>
      </div>
      <div className='stats'>
        <div>
          <h1>Carreira</h1>
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
