<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	let { 
		data = [], // e.g. [{ward: 'A', 'A': 10, 'B': 5}, {ward: 'B', ...}]
		width = 340, 
		height = 250,
        maxHeight = null
	} = $props();

	let container;
	
	const diseases = ['A', 'B', 'C', 'D', 'E', 'F'];
	const colors = ['#ff4444', '#44ff44', '#4444ff', '#44ffff', '#ff44ff', '#ffff44', '#ffffff'];
	const colorScale = d3.scaleOrdinal().domain(diseases).range(colors);

	const margin = { top: 20, right: 20, bottom: 30, left: 40 };
	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;

	$effect(() => {
		if (container && data.length > 0) {
			drawChart();
		}
	});

	function drawChart() {
		d3.select(container).selectAll('*').remove();

		const svg = d3.select(container)
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		const wards = data.map(d => d.ward);
		const stack = d3.stack().keys(diseases);
		const stackedData = stack(data);

		const xScale = d3.scaleBand()
			.domain(wards)
			.range([0, innerWidth])
			.padding(0.1);

		const yScale = d3.scaleLinear()
			.domain([0, maxHeight || d3.max(stackedData[stackedData.length - 1], d => d[1])])
			.nice()
			.range([innerHeight, 0]);

		svg.append('g')
			.selectAll('g')
			.data(stackedData)
			.join('g')
				.attr('fill', d => colorScale(d.key))
			.selectAll('rect')
			.data(d => d)
			.join('rect')
				.attr('x', d => xScale(d.data.ward))
				.attr('y', d => yScale(d[1]))
				.attr('height', d => yScale(d[0]) - yScale(d[1]))
				.attr('width', xScale.bandwidth());

		svg.append('g')
			.attr('transform', `translate(0,${innerHeight})`)
			.call(d3.axisBottom(xScale));

		svg.append('g')
			.call(d3.axisLeft(yScale));
	}
</script>

<div bind:this={container}></div> 