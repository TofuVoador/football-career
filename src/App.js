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
    goalsBonus: 12,
    assistsBonus: 0,
  },{
    title: "CF",
    goalsBonus: 12,
    assistsBonus: 0,
  },{
    title: "LW",
    goalsBonus: 9,
    assistsBonus: 3,
  },{
    title: "RW",
    goalsBonus: 9,
    assistsBonus: 3,
  },{
    title: "CAM",
    goalsBonus: 6,
    assistsBonus: 6,
  },{
    title: "LM",
    goalsBonus: 3,
    assistsBonus: 9,
  },{
    title: "RM",
    goalsBonus: 3,
    assistsBonus: 9,
  },{
    title: "CM",
    goalsBonus: 0,
    assistsBonus: 12,
  },{
    title: "CDM",
    goalsBonus: 0,
    assistsBonus: 12,
  }
]

const TournamentPath = [ "Não Classificado", "Fase de Grupos", "16 avos", "Oitavas", "Quartas", "Semi-finais", "Final", "Vencedor" ]

function App() {
  const [decisions, setDecisions]  = useState([]);

  const [year, setYear] = useState(RandomNumber(2021, 2025));

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
    leagues: 0,
    champions: 0,
    worldCup: 0,
    goldenShoes: 0,
    prodigyAward: 0,
    ballonDOr: 0,
    championsQualification: false
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
    let newLeagues = player.leagues;
    let newChampions = player.champions;
    let newWorldCup = player.worldCup;
    let newGoldenShoes = player.goldenShoes;
    let newProdigyAward = player.prodigyAward;
    let newBallonDOr = player.ballonDOr;
    let newChampionsQualification = player.championsQualification;

    //pre season setup
    if(team) {    //if they change team
      newTeam = team
      newPosition = GetNewPosition()
      newWage = Math.floor(Math.pow((player.overall - player.age) / 2.5 + (player.potential * newTeam.power), 2)) / 10
      setContract(RandomNumber(2,5))
      if (4 <= GetLeaguePosition(newTeam.power)) newChampionsQualification = true
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
    let growth = RandomNumber(-2, 3)/2.0-(newAge-(26+player.potential/1.5))/3.0;
    newOverall += growth;
    if(newOverall > 100) newOverall = 100;
    
    //giving the performance, set how many games did they were the starter player
    let starting = Math.floor(8*(newOverall - (67.5 + 1.5 * newTeam.power)))
    if(starting > 100) starting = 100
    else if(starting < 0) starting = 0

    //giving the starting rate, randomize how many goals/assists did they score
    let goalsThisYear = Math.floor((starting * newOverall / 300) + RandomNumber(0, newPosition.goalsBonus));
    let assistsThisYear = Math.floor((starting * newOverall / 500) + RandomNumber(0, newPosition.assistsBonus));

    let newTitles = [];   //collects the awards
    let awardChances = starting * newOverall / 200;

    //League
    let leaguePosition = GetLeaguePosition(newTeam.power)

    if(leaguePosition <= 1) {
      newLeagues++
      awardChances += 10
      leaguePosition = 1
    }

    newTitles.push("Liga: " + leaguePosition + "° lugar");

    let phase = 0;
    let end = true;

    //Champions Trophy
    if(newChampionsQualification) {
      phase++
      end = false
    }

    while (!end) {
      if (RandomNumber(0, 100) < (newTeam.power * newTeam.power * 4) - (phase * phase)) {   
        phase++;

        awardChances += phase;

        if(phase >= TournamentPath.length - 1) {
          newChampions += 1;
          end = true
        }
      } else {
        end = true
      }
    } 

    newTitles.push("Champions: " + TournamentPath[phase]);

    //World Cup Trophy
    if ((year+2)%4 == 0) {
      phase = 0;
      end = false;

      while (!end) {
        if (RandomNumber(0, 100) < (player.nation.power * player.nation.power * 4) - (phase * phase)) {   
          phase++;

          awardChances += phase;
  
          if(phase >= TournamentPath.length - 1) {
            newWorldCup += 1;
            end = true
          }
        } else {
          end = true
        }
      } 

      newTitles.push("Copa do Mundo: " + TournamentPath[phase]);
    }

    //add goals to the carrer summary
    newGoals += goalsThisYear;
    newAssists += assistsThisYear;

    //post season results
    if(RandomNumber(0,100) < 1) newTitles.push("Puskás");  //Puskás

    if(RandomNumber(30,50) < goalsThisYear) {  //Golden Shoes
      newGoldenShoes++
      newTitles.push("Chuteira de Ouro");
    }

    if(newAge >= 24){
      if(newOverall >= 90 && RandomNumber(0,100) <= awardChances) {    //Ballon D'or
        newBallonDOr++;
        newTitles.push("Ballon D'Or");
      }
    } else {
      if(newOverall >= 80 && RandomNumber(0,100) <= awardChances) {   //Prodigy
        newProdigyAward++;
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

    //load three options of transfer
    transfer = GetNewTeam();    

    if(newAge >= 30) {    //retire option
      let retire_btn = document.getElementById("retire");
      retire_btn.style.display = "flex";
    }

    if(leaguePosition <= 4) newChampionsQualification = true
    else newChampionsQualification = false

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
      leagues: newLeagues,
      champions: newChampions,
      worldCup: newWorldCup,
      goldenShoes: newGoldenShoes,
      prodigyAward: newProdigyAward,
      ballonDOr: newBallonDOr,
      championsQualification: newChampionsQualification
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
    let leagueID = RandomNumber(0, Teams.length-1);
    let league = Teams[leagueID];
    let team = league.teams[RandomNumber(0, league.teams.length-1)]

    return(team)
  }
  
  function GetNewPosition() {
    let pos = positions[RandomNumber(0, positions.length-1)];
    return(pos)
  }

  function GetLeaguePosition(power) {
    return RandomNumber(4-power, 12-power*2)
  }

  function Retire() {
    console.log("Retired")
  }
  
  let transfer = GetNewTeam();

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
        <a id='retire' style={{display: "none"}}  onClick={() => (Retire())}>Aposentar-se</a>
      </div>
      <div className='stats'>
        <h1>Sobre</h1>
        <p>Potencial: {player.potential}</p>
        <p>Seleção: {player.nation.name}</p>
        <h1>Carreira</h1>
        <p>Gols: {player.totalGoals}</p>
        <p>Assistências: {player.totalAssists}</p>
        <p>Ligas: {player.leagues}</p>
        <p>Champions: {player.champions}</p>
        <p>Copa do Mundo: {player.worldCup}</p>
        <p>Prodígio: {player.prodigyAward}</p>
        <p>Ballon D'Or: {player.ballonDOr}</p>
      </div>
    </>
  );
}

export default App;
