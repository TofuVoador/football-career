import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';

const ChartComponent = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const chartOptions = {
      // specify chart configuration options
    };

    const chartData = {
      labels: data.map(item => item.year), // x-axis labels
      datasets: [
        {
          label: 'Wage',
          data: data.map(item => item.wage), // y-axis data
          backgroundColor: 'rgba(75, 192, 192, 0.2)', // specify chart color
          borderColor: 'rgba(75, 192, 192, 1)', // specify border color
          borderWidth: 1 // specify border width
        },{
          label: 'Overall',
          data: data.map(item => item.overall), // y-axis data
          backgroundColor: 'rgba(192, 75, 192,  0.2)', // specify chart color
          borderColor: 'rgba(192, 75, 192,  1)', // specify border color
          borderWidth: 1 // specify border width
        },{
          label: 'Goals/Assists',
          data: data.map(item => (item.goals + item.assists)), // y-axis data
          backgroundColor: 'rgba(192, 192, 75,  0.2)', // specify chart color
          borderColor: 'rgba(192, 192, 75,  1)', // specify border color
          borderWidth: 1 // specify border width
        }
      ]
    };

    // Initialize the chart
    const chart = new Chart(chartRef.current, {
      type: 'line', // specify chart type, e.g. line, bar, pie, etc.
      data: chartData,
      options: chartOptions
    });

    // Clean up the chart when component unmounts
    return () => {
      chart.destroy();
    };
  }, [data]);

  return (
    <div>
      <canvas ref={chartRef} />
    </div>
  );
};

export default ChartComponent;