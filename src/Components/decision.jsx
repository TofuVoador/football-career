import React from 'react';
import './decision.css';

const Decision = (props) => {
  let decision = props.decision
  let open = props.open
  return ( 
    <details className='decision' key={decision.year} open={open}>
      <summary className='decision-title'>{decision.team.name} ({decision.position.title}) - Overall: {Math.floor(decision.overall*10.0)/10}</summary>
      <div className='decision-stats'>
        <p>Ano: {decision.year}</p>
        <p>Idade: {decision.age}</p>
        <p>Salário Anual: {decision.wage}M</p>
        <p>Titular: {decision.starting}%</p>
        <p>Gols: {decision.goals}</p>
        <p>Assistências: {decision.assists}</p>
      </div>
      <div className='decision-titles'>
        <div className='decision-titles-list'>
          {decision.titles.map((t) => (
            <p key={decision.year+t}>{t}</p>
          ))}
        </div>
      </div>
    </details>
  );
}
 
export default Decision;