import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';

const ChartComponent = ({ data }) => {
  const chartRef1 = useRef(null);
  const chartRef2 = useRef(null);
  const chartRef3 = useRef(null);
  const chartRef4 = useRef(null);

  useEffect(() => {
    const chartOptions = {
      // specify chart configuration options
    };

    const chartData1 = {
      labels: data.map(item => item.age), // x-axis labels
      datasets: [
        {
          label: 'Overall',
          data: data.map(item => item.overall), // y-axis data
          backgroundColor: 'rgba(89, 168, 125, 1)', // specify chart color
          borderColor: 'rgba(89, 168, 125, 1)', // specify border color
          borderWidth: 2 // specify border width
        }
      ]
    };

    const chartData2 = {
      labels: data.map(item => item.team.power), // x-axis labels
      datasets: [
        {
          label: 'Wage',
          data: data.map(item => item.wage), // y-axis data
          backgroundColor: 'rgba(89, 168, 125, 1)', // specify chart color
          borderColor: 'rgba(89, 168, 125, 1)', // specify border color
          borderWidth: 2 // specify border width
        }
      ]
    };

    const chartData3 = {
      labels: data.map(item => item.starting), // x-axis labels
      datasets: [
        {
          label: 'Goals',
          data: data.map(item => item.goals), // y-axis data
          backgroundColor: 'rgba(89, 168, 125, 1)', // specify chart color
          borderColor: 'rgba(89, 168, 125, 1)', // specify border color
          borderWidth: 2 // specify border width
        },{
          label: 'Assists',
          data: data.map(item => item.assists), // y-axis data
          backgroundColor: 'rgba(22, 69, 63, 1)', // specify chart color
          borderColor: 'rgba(22, 69, 63, 1)', // specify border color
          borderWidth: 2 // specify border width
        }
      ]
    };

    const chartData4 = {
      labels: data.map(item => item.year), // x-axis labels
      datasets: [
        {
          label: 'Champions Phase',
          data: data.map(item => item.championsPhase), // y-axis data
          backgroundColor: 'rgba(89, 168, 125, 1)', // specify chart color
          borderColor: 'rgba(89, 168, 125, 1)', // specify border color
          borderWidth: 2 // specify border width
        },{
          label: 'League Position',
          data: data.map(item => item.leaguePosition), // y-axis data
          backgroundColor: 'rgba(22, 69, 63, 1)', // specify chart color
          borderColor: 'rgba(22, 69, 63, 1)', // specify border color
          borderWidth: 2 // specify border width
        }
      ]
    };

    // Initialize the chart
    const chart1 = new Chart(chartRef1.current, {
      type: 'line', // specify chart type, e.g. line, bar, pie, etc.
      data: chartData1,
      options: chartOptions
    });

    const chart2 = new Chart(chartRef2.current, {
      type: 'line', // specify chart type, e.g. line, bar, pie, etc.
      data: chartData2,
      options: chartOptions
    });

    const chart3 = new Chart(chartRef3.current, {
      type: 'line', // specify chart type, e.g. line, bar, pie, etc.
      data: chartData3,
      options: chartOptions
    });

    const chart4 = new Chart(chartRef4.current, {
      type: 'line', // specify chart type, e.g. line, bar, pie, etc.
      data: chartData4,
      options: chartOptions
    });


    // Clean up the chart when component unmounts
    return () => {
      chart1.destroy();
      chart2.destroy();
      chart3.destroy();
      chart4.destroy();
    };
  }, [data]);

  return (
    <div>
      <canvas ref={chartRef1} />
      <canvas ref={chartRef2} />
      <canvas ref={chartRef3} />
      <canvas ref={chartRef4} />
    </div>
  );
};

export default ChartComponent;