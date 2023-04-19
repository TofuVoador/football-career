import React from 'react';
import './decision.css';

const Decision = (props) => {
  let decision = props.decision
  return ( 
    <div className='decision' key={decision.year}>
      <h1 className='decision-title'>{decision.year} (Idade: {decision.age}) - Overall: {Math.floor(decision.overall*10.0)/10}</h1>
      <div className='decision-stats'>
        <p>Time: {decision.team.name} ({decision.position.title})</p>
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
    </div>
  );
}
 
export default Decision;