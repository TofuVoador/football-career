import React, { useEffect, useState } from 'react';
import './App.css';
import Teams from "./Database/teams.json";

function randomNumber(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const positions = []

function App() {
  const [decisions, setDecisions]  = useState([]);

  const [year, setYear] = useState(2020);

  const [player, setPlayer] = useState({ age: 20, overall: randomNumber(60, 80), position: "ST",  })

  function UpdatePlayer(factor) {
    let newplayer = {
      age: player.age+1,
      overall: Math.floor(player.overall*factor)
    }

    setPlayer(newplayer);
  }

  function Generate () {
    let desempenho = randomNumber(90, 125-Math.floor(player.age / 2)) / 100.0;
    console.log(desempenho);
    UpdatePlayer(desempenho);

    let goalsYear = randomNumber(Math.floor(player.overal / 2), Math.floor(player.overall * 2));


    let newtitle = "t";
    let newdescription = "Age: "+player.age+"| Goals: "+goalsYear + "| Overall: "+player.overall;


    const newDecisions = [
      ... decisions,
      {
        year: year,
        title: newtitle,
        description: newdescription
      }
    ];

    setDecisions(newDecisions)
    setYear(year+1)
  }

  return (
    <>
      <header>
        <h1>Football Star</h1>
      </header>
      <div className='career'>
        {decisions.map((d) => (
          <div className='decision'>
            <h1>{d.year} | {d.title}</h1>
            <p>{d.description}</p>
          </div>
        ))}
      </div>
      <a onClick={() => (Generate())}>Generate</a>
    </>
  );
}

export default App;
