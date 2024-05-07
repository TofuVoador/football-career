import React from "react";
import "./season.css";
import { FormatarNumero } from "../Utils";

const Season = (props) => {
  let season = props.season;
  let open = props.open;

  return (
    <details className="season" key={season.year} open={open}>
      <summary className="season-title">
        <p>
          {season.year}: {season.team.name}
        </p>
        <div className="oval">{season.overall.toFixed(1)}</div>
      </summary>
      <div className="season-stats">
        {season.age} anos
        <div className="double-column">
          <div>${FormatarNumero(season.marketValue)}</div>
          <div>${FormatarNumero(season.wage)}/ano</div>
        </div>
        <p style={{ marginTop: "0.5rem" }}>Performance:</p>
        <div
          className="dual-progress-bar"
          style={{
            width: "auto",
            height: "20px",
            backgroundColor: "var(--color-medium)",
            borderRadius: "10px",
          }}
        >
          <div
            className="progress"
            style={{
              width: `${Math.abs(season.performance.toFixed(2)) * 50}%`,
              height: "20px",
              backgroundColor:
                season.performance.toFixed(2) >= 0 ? "var(--color-contrast)" : "var(--color-light)",
              borderRadius: season.performance.toFixed(2) >= 0 ? "0 10px 10px 0" : "10px 0 0 10px", // Bordas arredondadas dependendo da direção
              position: "relative",
              left: season.performance.toFixed(2) >= 0 ? "50%" : "auto",
              right:
                season.performance.toFixed(2) >= 0
                  ? "auto"
                  : `-${50 - Math.abs(season.performance.toFixed(2)) * 50}%`,
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "50%", // Centraliza verticalmente
                left: season.performance.toFixed(2) >= 0 ? "5px" : "auto",
                right: season.performance.toFixed(2) >= 0 ? "auto" : "5px",
                transform: "translateY(-50%)", // Centraliza verticalmente
                color:
                  season.performance.toFixed(2) >= 0
                    ? "var(--color-dark)"
                    : "var(--color-contrast)",
              }}
            >
              {season.performance.toFixed(2) > 0 ? "+" : ""}
              {season.performance.toFixed(2)}
            </span>
          </div>
        </div>
        <p>Titular:</p>
        <div
          style={{
            width: "auto",
            height: "20px",
            backgroundColor: "var(--color-medium)",
            borderRadius: "10px",
          }}
        >
          <div
            style={{
              width: `${season.starting}%`,
              height: "20px",
              backgroundColor: "var(--color-contrast)",
              borderRadius: "10px",
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "50%", // Centraliza verticalmente
                left: "50%", // Centraliza horizontalmente
                transform: "translate(-50%, -50%)", // Centraliza completamente
                color: "var(--color-dark)",
              }}
            >
              {season.starting}%
            </span>
          </div>
        </div>
        <div className="double-column">
          <div>{season.goals} gols</div>
          <div>{season.assists} assistências</div>
        </div>
      </div>
      <div className="season-titles">
        <div className="season-titles-list">
          <details>
            <summary>Top Clubes</summary>
            {season.top10.map((team, index) => (
              <p key={team + "topClubs" + index}>
                {team.name} ({(Math.round(team.power * 50.0) / 100.0).toFixed(2)})
              </p>
            ))}
          </details>
          <details>
            <summary>Top Seleções</summary>
            {season.topNations.map((team, index) => (
              <p key={team + "topNations" + index}>
                {team.name} ({(Math.round(team.power * 50.0) / 100.0).toFixed(2)})
              </p>
            ))}
          </details>
          {season.titles.map((title) => {
            if (title.length > 1) {
              let stages = title.slice(1);
              return (
                <details key={season.year + title[0]}>
                  <summary>{title[0]}</summary>
                  {stages.map((round) => {
                    let matchDetails = round.split("-->");
                    if (matchDetails.length > 1) {
                      let matches = matchDetails.slice(1);
                      return (
                        <details key={season.year + matchDetails[0]}>
                          <summary>{matchDetails[0]}</summary>
                          {matches.map((match) => {
                            let innerDetails = match.split("->");
                            if (innerDetails.length > 1) {
                              let inners = innerDetails.slice(1);
                              return (
                                <details key={season.year + innerDetails[0]}>
                                  <summary>{innerDetails[0]}</summary>
                                  {inners.map((innerMatch) => (
                                    <p key={season.year + innerMatch}>{innerMatch}</p>
                                  ))}
                                </details>
                              );
                            } else {
                              return <p key={season.year + match}>{match}</p>;
                            }
                          })}
                        </details>
                      );
                    } else {
                      return <p key={season.year + round}>{round}</p>;
                    }
                  })}
                </details>
              );
            } else {
              return (
                <h1 className="single-title" key={season.year + title}>
                  {title}
                </h1>
              );
            }
          })}
        </div>
      </div>
    </details>
  );
};

export default Season;
