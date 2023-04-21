import React from 'react';
import './season.css';

const Season = (props) => {
  let season = props.season
  let open = props.open
  return ( 
    <details className='season' key={season.year} open={open}>
      <summary className='season-title'>{season.year}: {season.team.name} ({season.position.title}) - Overall: {Math.floor(season.overall*10.0)/10}</summary>
      <div className='season-stats'>
        <p>Idade: {season.age}</p>
        <p>Salário Anual: {season.wage}M</p>
        <p>Titular: {season.starting}%</p>
        <p>Gols: {season.goals}</p>
        <p>Assistências: {season.assists}</p>
      </div>
      <div className='season-titles'>
        <div className='season-titles-list'>
          {season.titles.map((t) => (
            <p key={season.year+t}>{t}</p>
          ))}
        </div>
      </div>
    </details>
  );
}
 
export default Season;