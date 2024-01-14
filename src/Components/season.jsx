import React from "react";
import "./season.css";

const Season = (props) => {
  let season = props.season;
  let open = props.open;
  return (
    <details className="season" key={season.year} open={open}>
      <summary className="season-title">
        {season.year}: {season.team.name} - Overall: {season.overall.toFixed(1)}
      </summary>
      <div className="season-stats">
        <p>Idade: {season.age}</p>
        <p>Valor de Mercado: {season.marketValue}M</p>
        <p>Salário Anual: {season.wage}M</p>
        <p>
          Desempenho: {season.performance > 0 ? "+" : ""}
          {season.performance}
        </p>
        <p>Fama: {Math.floor(season.fame)}</p>
        <p>Titular: {season.starting}%</p>
        <p>Gols: {season.goals}</p>
        <p>Assistências: {season.assists}</p>
      </div>
      <div className="season-titles">
        <div className="season-titles-list">
          <details>
            <summary>Top 10</summary>
            {season.top10.map((team, index) => (
              <p key={team + "top10" + index}>
                {team.name} ({team.power})
              </p>
            ))}
          </details>
          <details>
            <summary>Top Seleções</summary>
            {season.topNations.map((team, index) => (
              <p key={team + "topNations" + index}>
                {team.name} ({team.power})
              </p>
            ))}
          </details>
          {season.titles.map((t) => {
            let titleDesc = t.split("->");
            if (titleDesc.length > 1) {
              let matches = titleDesc.slice(1);
              return (
                <details key={season.year + titleDesc[0]}>
                  <summary>{titleDesc[0]}</summary>
                  {matches.map((match) => (
                    <p key={season.year + match}>{match}</p>
                  ))}
                </details>
              );
            } else {
              return <h1 key={season.year + titleDesc[0]}>{titleDesc[0]}</h1>;
            }
          })}
        </div>
      </div>
    </details>
  );
};

export default Season;
