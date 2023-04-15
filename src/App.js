import React, { useEffect, useState } from 'react';
import './App.css';
import Teams from './Database/teams.json';
import Nations from './Database/nations.json'
import Decision from './Components/decision';

function RandomNumber(min, max) { // min and max included 
  return Math.floor(Math.random() * (max + 1 - min) + min)
}

const positions = [
  {
    title: "ST",
    goalsBonus: 20,
    assistsBonus: 0,
  },{
    title: "LW",
    goalsBonus: 16,
    assistsBonus: 4,
  },{
    title: "RW",
    goalsBonus: 16,
    assistsBonus: 4,
  },{
    title: "CAM",
    goalsBonus: 12,
    assistsBonus: 8,
  },{
    title: "CM",
    goalsBonus: 8,
    assistsBonus: 12,
  },{
    title: "LM",
    goalsBonus: 4,
    assistsBonus: 16,
  },{
    title: "RM",
    goalsBonus: 4,
    assistsBonus: 16,
  },{
    title: "CDM",
    goalsBonus: 0,
    assistsBonus: 20,
  }
]

function App() {
  const [decisions, setDecisions]  = useState([]);

  const [year, setYear] = useState(RandomNumber(2017, 2021));

  const [player, setPlayer] = useState({ 
    potential: RandomNumber(1, 4),
    age: 17,
    nation: Nations[RandomNumber(0, Nations.length-1)],
    team: GetNewTeam(),
    position: GetNewPosition(),
    wage_M: 0,
    overall: 68,
    totalGoals: 0,
    totalAssists: 0,
    champions: 0,
    worldCup: 0,
    prodigyAward: 0,
    ballonDOr: 0
  })

  const [contract, setContract] = useState(RandomNumber(2, 6))

  function Generate (team = null) {
    //load all player's stats
    let newAge = player.age+1;
    let newTeam = player.team;
    let newPosition = player.position;
    let newWage = player.wage_M;
    let newOverall = player.overall;
    let newGoals = player.totalGoals;
    let newAssists = player.totalAssists;
    let newChampions = player.champions;
    let newWorldCup = player.worldCup;
    let newProdigyAward = player.prodigyAward;
    let newBallonDOr = player.ballonDOr;

    //pre season setup
    if(team) {    //if they change team
      newTeam = team
      newPosition = GetNewPosition()
      newWage = Math.floor(Math.pow((player.overall - player.age) / 2.5 + (player.potential * newTeam.power), 2)) / 10
      setContract(RandomNumber(2,5))
    } else {    //else if contract expires
      let cont = contract - 1;
      if(cont <= 0) {
        setContract(RandomNumber(2,5))
        newWage = Math.floor(Math.pow((player.overall - player.age) / 2.5 + (player.potential * newTeam.power), 2)) / 10
      } else {
        setContract(cont)
      }
    }

    //calcule the player's performance
    let growth = RandomNumber(-2, 3)/2.0-(newAge-(27+player.potential/1.6))/3.2;
    newOverall += growth;
    if(newOverall > 100) newOverall = 100;
    
    //giving the performance, set how many games did they were the starter player
    let starting = Math.floor(8*(newOverall - (67.5 + 1.5 * newTeam.power)))
    if(starting > 100) starting = 100
    else if(starting < 0) starting = 0

    //giving the starting rate, randomize how many goals/assists did they score
    let goalsThisYear = RandomNumber((starting/100) * newOverall / 3, (starting/100) * newOverall / 2) + RandomNumber(0, newPosition.goalsBonus);
    let assistsThisYear = RandomNumber((starting/100) * newOverall / 5, (starting/100) * newOverall / 4) + RandomNumber(0, newPosition.assistsBonus);

    //add to the carrer summary
    newGoals += goalsThisYear;
    newAssists += assistsThisYear;

    //post season results
    let newTitles = [];   //collects the awards

    if(RandomNumber(0,100) < 1) {   //Puskás
      newTitles.push("Puskás");
    }

    let ballonDOreChances = (newOverall-88)*5;
    let prodigyChances = (newOverall-80)*5;

    if (RandomNumber(0, 100) < (newOverall/100)*(newTeam.power*newTeam.power-8)) {   //Champions Trophy
      newChampions += 1;
      newTitles.push("Champions");
      ballonDOreChances += 15;
      prodigyChances += 15;
    }

    if((year+2)%4 == 0 && RandomNumber(0, 100) < (newOverall/100)*(player.nation.power*player.nation.power-8)) {   //World Cup Trophy
      newWorldCup += 1;
      newTitles.push("Copa do Mundo");
      ballonDOreChances += 20;
      prodigyChances += 20;
    }

    if(newAge >= 24){
      if(newOverall >= 88 && RandomNumber(0,100) <= ballonDOreChances) {    //Ballon D'or
        newBallonDOr += 1;
        newTitles.push("Ballon D'Or");
      }
    } else {
      if(newOverall >= 80 && RandomNumber(0,100) <= prodigyChances) {   //Prodigy
        newProdigyAward += 1;
        newTitles.push("Prodígio");
      }
    }

    //trasnfer window
    let stay_btn = document.getElementById("decision-stay")
    if((growth < 1 && newAge < 24+newTeam.power/2.5) || (growth <= -1 && newAge < 27+newTeam.power/2.5) || (growth < newTeam.power/2.5-4)) {
      stay_btn.style.display = "none";    //fired by the team
    } else {
      stay_btn.style.display = "flex";
    }

    //load two options of transfer
    transfer = GetNewTeam();    
    transfer2 = GetNewTeam();

    if(newAge >= 30) {    //retire option
      let retire_btn = document.getElementById("retire");
      retire_btn.style.display = "flex";
    }

    //set pleyer
    let newplayer = {
      potential: player.potential,
      age: newAge,
      nation: player.nation,
      team: newTeam,
      position: newPosition,
      wage_M: newWage,
      overall: newOverall,
      totalGoals: newGoals,
      totalAssists: newAssists,
      champions: newChampions,
      worldCup: newWorldCup,
      prodigyAward: newProdigyAward,
      ballonDOr: newBallonDOr
    }
    setPlayer(newplayer);

    //set Decisions
    const newDecisions = [
      ... decisions,
      {
        year: year,
        age: newAge,
        team: newTeam,
        wage: newWage,
        position: newPosition,
        starting: starting,
        titles: newTitles,
        goals: goalsThisYear,
        assists: assistsThisYear,
        overall: newOverall
      }
    ];
    setDecisions(newDecisions)
    setYear(year+1)
  }
  
  function GetNewTeam() {
    let league = Teams[RandomNumber(0, Teams.length-1)];
    let team = league.teams[RandomNumber(0, league.teams.length-1)]

    return(team)
  }
  
  function GetNewPosition() {
    let pos = positions[RandomNumber(0, positions.length-1)];
    return(pos)
  }

  function Retire() {
    console.log("Retired")
  }
  
  let transfer = GetNewTeam();
  let transfer2 = GetNewTeam();

  return (
    <>
      <header>
        <h1>Football Star</h1>
      </header>
      <div className='career'>
        {decisions.map((d, index) => (
          <Decision key={index} decision={d}/>
        ))}
      </div>
      <div className='choices'>
        <a id='decision-stay' style={{display: "none"}} onClick={() => (Generate())}>Continuar em {player.team.name}</a>
        <a id='decision-transfer' onClick={() => (Generate(transfer))}>Transferir para {transfer.name}</a>
        <a id='decision-transfer' onClick={() => (Generate(transfer2))}>Transferir para {transfer2.name}</a>
        <a id='retire' style={{display: "none"}}  onClick={() => (Retire())}>Aposentar-se</a>
      </div>
      <div className='stats'>
        <h1>Sobre</h1>
        <p>Potencial: {player.potential}</p>
        <p>Seleção: {player.nation.name}</p>
        <h1>Carreira</h1>
        <p>Gols: {player.totalGoals}</p>
        <p>Assistências: {player.totalAssists}</p>
        <p>Champions: {player.champions}</p>
        <p>Copa do Mundo: {player.worldCup}</p>
        <p>Prodígio: {player.prodigyAward}</p>
        <p>Ballon D'Or: {player.ballonDOr}</p>
      </div>
    </>
  );
}

export default App;
