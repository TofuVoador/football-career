import React, { useEffect, useState } from 'react';
import './App.css';
import Teams from './Database/teams.json';

function randomNumber(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function getNewTeam() {
  let league = Teams[randomNumber(0, Teams.length-1)];
  let id = randomNumber(0, league.teams.length-1)
  return(league.teams[id])
}

function getNewPosition() {
  let pos = positions[randomNumber(0, positions.length-1)];
  return(pos)
}

let transfer = getNewTeam();

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

  const [year, setYear] = useState(randomNumber(2019, 2021));

  const [player, setPlayer] = useState({ 
    age: randomNumber(17, 19),
    position: getNewPosition(),
    team: getNewTeam(),
    totalGoals: 0,
    totalAssists: 0,
    overall: randomNumber(60, 70),
    champions: 0,
    ballonDOr: 0,
    prodigyAward: 0,
    worldCup: 0
  })



  function Generate (team) {
    let newTeam = team;
    let newPosition = player.position;

    if(team != player.team) {
      newPosition = getNewPosition();
    }

    let newAge = player.age+1;

    let growth = (26+randomNumber(0, 10)-newAge)/2.5;

    let newOverall = Math.floor(player.overall + growth);

    if(newOverall > 100) newOverall = 100;

    let goalsThisYear = Math.floor((newOverall/2)  / newTeam.ranking) + randomNumber(0, newPosition.goalsBonus)
    let assistsThisYear = Math.floor((newOverall/3) / newTeam.ranking) + randomNumber(0, newPosition.assistsBonus);

    let newGoals = player.totalGoals + goalsThisYear;
    let newAssists = player.totalAssists + assistsThisYear;

    let newTitles = [];

    let chances = (newOverall/6-(newTeam.ranking*newTeam.ranking/2));

    if(chances < 0) chances = 0;

    console.log(chances)

    let newChampions = player.champions;
    if (randomNumber(1, 100) < chances) {
      newChampions += 1;
      newTitles.push("Champions");
      chances += 20;
    }
    
    let newWorldCup = player.worldCup;
    if((year+2)%4 == 0 && (newOverall > 80) && randomNumber(1,100) < newOverall/6) {
        newWorldCup += 1;
        newTitles.push("Copa do Mundo");
        chances += 20;
    }

    let newBallonDOr = player.ballonDOr;
    let newProdigyAward = player.prodigyAward;

    if(newAge > 24){
      if(newOverall >= 90 && randomNumber(1,100) <= chances) {
        newBallonDOr += 1;
        newTitles.push("Ballon D'Or");
      }
    } else {
      if(newOverall >= 75 && randomNumber(1,100) <= chances) {
        newProdigyAward += 1;
        newTitles.push("Prodígio");
      }
    }

    if(randomNumber(1,100) <= 1) {
      newTitles.push("Puskás");
    }

    let newplayer = {
      age: newAge,
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
    transfer = getNewTeam();
  }

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
      <a onClick={() => (Generate(player.team))}>Continuar em {player.team.name}</a>
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
