import React, { useEffect, useState } from 'react';
import './App.css';
import Teams from './Database/teams.json';

function RandomNumber(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const positions = [
  {
    title: "ST",
    goalsBonus: 40,
    assistsBonus: 0,
  },{
    title: "LW",
    goalsBonus: 32,
    assistsBonus: 4,
  },{
    title: "RW",
    goalsBonus: 32,
    assistsBonus: 4,
  },{
    title: "CAM",
    goalsBonus: 24,
    assistsBonus: 8,
  },{
    title: "CM",
    goalsBonus: 16,
    assistsBonus: 12,
  },{
    title: "LM",
    goalsBonus: 8,
    assistsBonus: 16,
  },{
    title: "RM",
    goalsBonus: 8,
    assistsBonus: 16,
  },{
    title: "CDM",
    goalsBonus: 0,
    assistsBonus: 20,
  }
]

function App() {
  const [decisions, setDecisions]  = useState([]);

  const [year, setYear] = useState(RandomNumber(2019, 2021));

  const [player, setPlayer] = useState({ 
    age: RandomNumber(17, 19),
    potential: RandomNumber(0, 4),
    position: GetNewPosition(),
    team: GetNewTeam(),
    totalGoals: 0,
    totalAssists: 0,
    overall: RandomNumber(62, 68),
    champions: 0,
    ballonDOr: 0,
    prodigyAward: 0,
    worldCup: 0
  })

  function Generate (team = null) {
    let newTeam = player.team;

    let newPosition = player.position;

    if(team) {
      newTeam = team
      newPosition = GetNewPosition()
    }

    let newAge = player.age+1;

    let growth = (player.potential+RandomNumber(24, 32)-newAge)/3;

    let newOverall = Math.floor(player.overall + growth);

    if(newOverall > 100) newOverall = 100;

    let goalsThisYear = Math.floor(newTeam.power*newOverall/10) + RandomNumber(0, newPosition.goalsBonus)
    let assistsThisYear = Math.floor(newTeam.power*newOverall/20) + RandomNumber(0, newPosition.assistsBonus);

    let newGoals = player.totalGoals + goalsThisYear;
    let newAssists = player.totalAssists + assistsThisYear;

    let newTitles = [];

    let awardChances = (newOverall-75);

    let newChampions = player.champions;
    if (RandomNumber(1, 100) < newTeam.power*newTeam.power) {
      newChampions += 1;
      newTitles.push("Champions");
      awardChances += 15;
    }
    
    let newWorldCup = player.worldCup;
    if((year+2)%4 == 0 && RandomNumber(1,100) < newOverall/12) {
        newWorldCup += 1;
        newTitles.push("Copa do Mundo");
        awardChances += 15;
    }

    let newBallonDOr = player.ballonDOr;
    let newProdigyAward = player.prodigyAward;

    if(newAge > 24){
      if(newOverall >= 85 && RandomNumber(1,100) <= awardChances - 10) {
        newBallonDOr += 1;
        newTitles.push("Ballon D'Or");
      }
    } else {
      if(newOverall >= 75 && RandomNumber(1,100) <= awardChances) {
        newProdigyAward += 1;
        newTitles.push("Prodígio");
      }
    }

    if(RandomNumber(1,100) <= 1) {
      newTitles.push("Puskás");
    }

    let newplayer = {
      age: newAge,
      potential: player.potential,
      team: newTeam,
      position: newPosition,
      overall: newOverall,
      totalGoals: newGoals,
      totalAssists: newAssists,
      worldCup: newWorldCup,
      champions: newChampions,
      ballonDOr: newBallonDOr,
      prodigyAward: newProdigyAward
    }

    setPlayer(newplayer);

    const newDecisions = [
      ... decisions,
      {
        year: year,
        age: newAge,
        team: newTeam,
        position: newPosition,
        titles: newTitles,
        goals: goalsThisYear,
        assists: assistsThisYear,
        overall: newOverall
      }
    ];

    setDecisions(newDecisions)
    setYear(year+1)
    transfer = GetNewTeam();
  }
  
  function GetNewTeam() {
    let league = Teams[RandomNumber(0, Teams.length-1)];
    let id = RandomNumber(0, league.teams.length-1)
    return(league.teams[id])
  }
  
  function GetNewPosition() {
    let pos = positions[RandomNumber(0, positions.length-1)];
    return(pos)
  }
  
  let transfer = GetNewTeam();

  useEffect(() => {
    console.log("Potencial: "+player.potential)
    Generate(); 
  }, []);

  return (
    <>
      <header>
        <h1>Football Star</h1>
      </header>
      <div className='career'>
        {decisions.map((d) => (
          <div className='decision' key={d.year}>
            <h1>{d.year} (Idade: {d.age}) - {d.team.name} ({d.position.title})</h1>
            <div className='titles'>
              <h1>Titles:</h1>
              <div className='titles-list'> 
                {d.titles.map((t) => (
                  <p key={d.year+t}>{t}</p>
                ))}
              </div>
            </div>
            <div className='stats-year'>
              <p>Overall: {d.overall}</p>
              <p>Goals: {d.goals}</p>
              <p>Assists: {d.assists}</p>
            </div>
          </div>
        ))}
      </div>
      <a onClick={() => (Generate())}>Continuar em {player.team.name}</a>
      <a onClick={() => (Generate(transfer))}>Transferir para {transfer.name}</a>
      <div className='stats'>
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
