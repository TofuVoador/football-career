import React from "react";
import "./season.css";

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
        <div className="double-column">
          <div>
            <div>{season.age} anos</div>
            <div>Fama: {Math.floor(season.fame)}</div>
          </div>
          <div>
            <div>${season.marketValue}M</div>
            <div>${season.wage}M/ano</div>
          </div>
        </div>
        <p style={{ marginTop: "0.5rem" }}>Performance:</p>
        <div
          className="dual-progress-bar"
          style={{
            width: "auto",
            height: "20px",
            border: "1px var(--color-light2) solid",
            boxsizing: "border-box",
            borderRadius: "10px",
            position: "relative",
          }}
        >
          <div
            className="progress"
            style={{
              width: `${Math.abs(season.performance.toFixed(2)) * 50}%`,
              height: "18px",
              backgroundColor: `${
                season.performance.toFixed(2) >= 0
                  ? season.performance.toFixed(2) >= 0.5
                    ? "cyan"
                    : "lime"
                  : season.performance.toFixed(2) >= -0.5
                  ? "orange"
                  : "maroon"
              }`,
              borderRadius:
                season.performance.toFixed(2) >= 0
                  ? "0 10px 10px 0"
                  : "10px 0 0 10px", // Bordas arredondadas dependendo da direção
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
                color: `${
                  season.performance.toFixed(2) >= 0
                    ? season.performance.toFixed(2) >= 0.5
                      ? "blue"
                      : "green"
                    : season.performance.toFixed(2) >= -0.5
                    ? "yellow"
                    : "red"
                }`,
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
            backgroundColor: "var(--color-dark2)",
            borderRadius: "10px",
          }}
        >
          <div
            style={{
              width: `${season.starting}%`,
              height: "20px",
              backgroundColor: "var(--color-light2)",
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
