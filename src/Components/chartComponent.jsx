import React, { useRef, useEffect } from "react";
import Chart from "chart.js/auto";

const ChartComponent = ({ data }) => {
	const chartRef1 = useRef(null);
	const chartRef2 = useRef(null);
	const chartRef3 = useRef(null);

	useEffect(() => {
		const chartOptions = {
			scales: {
				x: {
					grid: {
						color: "rgba(71, 74, 72, 1)", // Set color for x-axis grid lines
					},
					ticks: {
						color: "rgba(144, 149, 144, 1)", // Set color for x-axis labels
					},
				},
				y: {
					grid: {
						color: "rgba(71, 74, 72, 1)", // Set color for x-axis grid lines
					},
					ticks: {
						color: "rgba(144, 149, 144, 1)", // Set color for x-axis labels
					},
				},
			},
			plugins: {
				title: {
					display: true,
					color: "rgba(144, 149, 144, 1)", // Set color for chart title
				},
				legend: {
					labels: {
						color: "rgba(144, 149, 144, 1)", // Set color for legend labels
					},
				},
			},
		};

		const chart1 = new Chart(chartRef1.current, {
			type: "line", // specify chart type, e.g. line, bar, pie, etc.
			data: {
				labels: data.map((item) => item.age), // x-axis labels
				datasets: [
					{
						label: "Fama",
						data: data.map((item) => item.fame), // y-axis data
						backgroundColor: "rgba(154, 225, 157, 1)", // Set background color
						borderColor: "rgba(154, 225, 157, 1)", // Set border color
					},
				],
			},
			options: chartOptions,
		});

		const chart2 = new Chart(chartRef2.current, {
			type: "line", // specify chart type, e.g. line, bar, pie, etc.
			data: {
				labels: data.map((item) => item.year), // x-axis labels
				datasets: [
					{
						label: "Gols",
						data: data.map((item) => item.goals), // y-axis data
						backgroundColor: "rgba(154, 225, 157, 1)", // Set background color
						borderColor: "rgba(154, 225, 157, 1)", // Set border color
					},
					{
						label: "Assistências",
						data: data.map((item) => item.assists), // y-axis data
						backgroundColor: "rgba(83, 122, 90, 1)", // Set background color
						borderColor: "rgba(83, 122, 90, 1)", // Set border color
					},
				],
			},
			options: chartOptions,
		});

		const chart3 = new Chart(chartRef3.current, {
			type: "line", // specify chart type, e.g. line, bar, pie, etc.
			data: {
				labels: data.map((item) => item.age), // x-axis labels
				datasets: [
					{
						label: "Valor (M)",
						data: data.map((item) => Math.floor(item.marketValue / 100000) / 10), // y-axis data
						backgroundColor: "rgba(154, 225, 157, 1)", // Set background color
						borderColor: "rgba(154, 225, 157, 1)", // Set border color
					},
					{
						label: "Salário (M)",
						data: data.map((item) => Math.floor(item.wage / 100000) / 10), // y-axis data
						backgroundColor: "rgba(83, 122, 90, 1)", // Set background color
						borderColor: "rgba(83, 122, 90, 1)", // Set border color
					},
				],
			},
			options: chartOptions,
		});

		// Clean up the chart when component unmounts
		return () => {
			chart1.destroy();
			chart2.destroy();
			chart3.destroy();
		};
	}, [data]);

	return (
		<div>
			<canvas ref={chartRef1} />
			<canvas ref={chartRef2} />
			<canvas ref={chartRef3} />
		</div>
	);
};

export default ChartComponent;
