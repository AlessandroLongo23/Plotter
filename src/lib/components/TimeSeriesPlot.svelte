<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	let {
		data = [],
		windowSize = 300,
		avgWindowSize = 10,
		width = 800,
		height = 400,
		showRawData = true,
		seriesNames = ['A', 'B', 'C', 'D', 'E', 'F', 'total'], 	
		colors = ['#ff4444', '#44ff44', '#4444ff', '#44ffff', '#ff44ff', '#ffff44', '#ffffff'],
		legend = false,
		ymax = null,
		cumulative = false,
	} = $props();

	let svg;
	let container;
	
	let isMultipleSeries = $derived(Array.isArray(data) && data.length > 0 && Array.isArray(data[0]));
	
	const baseData = $derived.by(() => {
		if (!isMultipleSeries) {
			return [data];
		} else {
			return data;
		}
	});

	let processedData = $derived.by(() => {
		if (cumulative) {
			return baseData.map(series => computeCumulative(series));
		}
		return baseData;
	});
	
	let globalTimeWindow = $derived.by(() => {
		const allData = processedData.flat();
		if (allData.length === 0) return { min: 0, max: 0 };
		
		const latestTime = Math.max(...allData.map(d => d.x));
		const cutoffTime = latestTime - windowSize;
		return { min: cutoffTime, max: latestTime };
	});
	
	let filteredDataSeries = $derived.by(() => 
		processedData.map(series => getLatestWindowGlobal(series, globalTimeWindow))
	);
	
	let averagedDataSeries = $derived.by(() => {
		if (cumulative) {
			return processedData;
		}

		if (avgWindowSize <= 1) {
			return processedData.map(series => [...series].sort((a, b) => a.x - b.x));
		}
		return processedData.map(series => computeSimpleMovingAverage(series, avgWindowSize));
	});

	let filteredAveragedDataSeries = $derived.by(() => 
		averagedDataSeries.map(series => getLatestWindowGlobal(series, globalTimeWindow))
	);

	const margin = { top: 20, right: 30, bottom: 40, left: 50 };
	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;

	function getLatestWindowGlobal(data, timeWindow) {
		if (!data || data.length === 0) return [];
		return data.filter(d => d.x >= timeWindow.min && d.x <= timeWindow.max);
	}

	function computeSimpleMovingAverage(series, windowSize) {
		if (!series || series.length < windowSize) return [];
		
		const sortedSeries = [...series].sort((a, b) => a.x - b.x);
		const averaged = [];
		let sum = 0;
		const currentWindow = [];

		for (let i = 0; i < sortedSeries.length; i++) {
			const point = sortedSeries[i];
			currentWindow.push(point.y);
			sum += point.y;

			if (currentWindow.length > windowSize) {
				sum -= currentWindow.shift();
			}

			if (currentWindow.length === windowSize) {
				averaged.push({ x: point.x, y: sum / windowSize });
			}
		}
		
		return averaged;
	}

	function computeCumulative(series) {
		if (!series || series.length === 0) return [];
		
		const sortedSeries = [...series].sort((a, b) => a.x - b.x);
		
		let cumulativeSum = 0;
		return sortedSeries.map(point => {
			cumulativeSum += point.y;
			return { ...point, y: cumulativeSum };
		});
	}

	function createVisualization() {
		if (!container || filteredDataSeries.every(series => series.length === 0)) return;

		d3.select(container).selectAll('*').remove();

		svg = d3.select(container)
		.append('svg')
		.attr('width', width)
		.attr('height', height);

		const g = svg.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);
		
		const xScale = d3.scaleLinear()
			.domain([globalTimeWindow.min, globalTimeWindow.max])
			.range([0, innerWidth]);

		const allYValues = [
			...filteredDataSeries.flat().map(d => d.y),
			...filteredAveragedDataSeries.flat().map(d => d.y)
		];
		const yScale = d3.scaleLinear()
			.domain([0, ymax || d3.max(allYValues)])
			.nice()
			.range([innerHeight, 0]);

		const xAxis = d3.axisBottom(xScale)
		.tickFormat(d3.format('.0f'));
		
		const yAxis = d3.axisLeft(yScale);

		g.append('g')
		.attr('class', 'x-axis')
		.attr('transform', `translate(0,${innerHeight})`)
		.call(xAxis);

		g.append('g')
		.attr('class', 'y-axis')
		.call(yAxis);

		g.append('text')
		.attr('class', 'x-label')
		.attr('text-anchor', 'middle')
		.attr('x', innerWidth / 2)
		.attr('y', innerHeight + 35)
		.text('Time');

		g.append('text')
		.attr('class', 'y-label')
		.attr('text-anchor', 'middle')
		.attr('transform', `translate(-35,${innerHeight / 2}) rotate(-90)`)
		.text('Value');

		processedData.forEach((_, seriesIndex) => {
			const color = colors[seriesIndex % colors.length];
			const seriesName = seriesNames[seriesIndex] || `Series ${seriesIndex + 1}`;
			
			const rawSeriesData = filteredDataSeries[seriesIndex];
			if (showRawData && rawSeriesData && rawSeriesData.length > 0) {
				g.selectAll(`.data-point-series-${seriesIndex}`)
					.data(rawSeriesData)
					.enter()
					.append('circle')
					.attr('class', `data-point data-point-series-${seriesIndex}`)
					.attr('cx', d => xScale(d.x))
					.attr('cy', d => yScale(d.y))
					.attr('r', 2)
					.style('fill', color)
					.style('opacity', 0.5)
					.append('title')
					.text(d => `${seriesName}: (${d.x.toFixed(1)}, ${d.y.toFixed(1)})`);
			}
			
			const averagedSeriesData = filteredAveragedDataSeries[seriesIndex];
			if (averagedSeriesData && averagedSeriesData.length > 1) {
				const line = d3.line()
					.x(d => xScale(d.x))
					.y(d => yScale(d.y));

				g.append('path')
					.datum(averagedSeriesData)
					.attr('class', `line-series-${seriesIndex}`)
					.attr('fill', 'none')
					.attr('stroke', color)
					.attr('stroke-width', 2.5)
					.attr('d', line)
					.append('title')
					.text(seriesName);
			}
		});

		g.append('g')
		.attr('class', 'grid')
		.attr('transform', `translate(0,${innerHeight})`)
		.call(d3.axisBottom(xScale)
			.tickSize(-innerHeight)
			.tickFormat('')
		)
		.style('stroke-dasharray', '2,2')
		.style('opacity', 0.3);

		g.append('g')
			.attr('class', 'grid')
			.call(d3.axisLeft(yScale)
				.tickSize(-innerWidth)
				.tickFormat('')
			)
			.style('stroke-dasharray', '2,2')
			.style('opacity', 0.3);

		if (legend && processedData.length > 1) {
			const legendGroup = g.append('g')
				.attr('class', 'legend')
				.attr('transform', `translate(${innerWidth - 150}, 20)`);

			processedData.forEach((series, seriesIndex) => {
				if (filteredDataSeries[seriesIndex].length === 0) return;
				
				const color = colors[seriesIndex % colors.length];
				const seriesName = seriesNames[seriesIndex] || `Series ${seriesIndex + 1}`;
				
				const legendItem = legendGroup.append('g')
					.attr('class', 'legend-item')
					.attr('transform', `translate(0, ${seriesIndex * 18})`);

				legendItem.append('line')
					.attr('x1', 0)
					.attr('x2', 18)
					.attr('y1', 0)
					.attr('y2', 0)
					.style('stroke', color)
					.style('stroke-width', 3);

				legendItem.append('text')
					.attr('x', 22)
					.attr('y', 0)
					.attr('dy', '0.35em')
					.style('font-size', '11px')
					.style('fill', '#333')
					.style('font-weight', '500')
					.text(seriesName);
			});
		}
	}

	onMount(() => {
		createVisualization();
	});

	$effect(() => {
		filteredDataSeries;
		filteredAveragedDataSeries;
		createVisualization();
	});
</script>

<div bind:this={container} class="time-series-plot">
</div>

<style>
	.time-series-plot {
		width: 100%;
		height: 100%;
	}

	:global(.time-series-plot .x-axis),
	:global(.time-series-plot .y-axis) {
		font-size: 12px;
	}

	:global(.time-series-plot .x-label),
	:global(.time-series-plot .y-label) {
		font-size: 14px;
		font-weight: 500;
	}

	:global(.time-series-plot .grid line) {
		stroke: #e0e0e0;
	}

	:global(.time-series-plot .data-point) {
		transition: r 0.2s ease;
	}

	:global(.time-series-plot .data-point:hover) {
		r: 4;
	}

	:global(.time-series-plot .smoothed-line) {
		filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
	}
</style> 