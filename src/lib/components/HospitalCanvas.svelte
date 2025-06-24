<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { controls } from '$lib/stores/plotter';
    import { Vector } from '$lib/classes/Vector.svelte.js';
    import { wards, simulationParameters } from '$lib/stores/hospital';
    import { httpApiService } from '$lib/services/http-api';
    import { simulationPlaybackState, simulator } from '$lib/stores/simulation';
    import { Simulator } from '$lib/classes/hospital/Simulator.svelte.js';

    let {
        width = 600,
        height = 600,
    } = $props();

    let prevWidth = $state(width);   
    let prevHeight = $state(height);

    let canvasElement = $state(null);
    let canvasContainer = $state();
    let p5;
    let myp5 = $state();

    let simulationData = $state(null);

    let httpResults = httpApiService.simulationResults;
    let httpRunning = httpApiService.simulationRunning;

    $effect(() => {
        if ($httpResults) {
            console.log('Received HTTP simulation results:', $httpResults);
            loadSimulationData($httpResults);
        }
    });

    const loadSimulationData = async (data) => {
        if (data.event_history) {
            const eventsByDisease = {};
            const arrivalsByDisease = {};
            
            data.event_history.forEach(eventData => {
                const disease = eventData.event.disease;
                const eventType = eventData.event.type || eventData.event.event_type;
                
                if (!eventsByDisease[disease]) {
                    eventsByDisease[disease] = 0;
                    arrivalsByDisease[disease] = 0;
                }
                
                eventsByDisease[disease]++;
                if (eventType === 'Arrival') {
                    arrivalsByDisease[disease]++;
                }
            });
        }

        simulationData = data;
        $simulationPlaybackState.hasSimulationData = true;
        $simulationPlaybackState.isPlaying = true;
        $simulationPlaybackState.time = 0;
        $simulationPlaybackState.prevTime = Date.now();

        if ($simulator) {
            $simulator.reset();
            
            await $simulator.loadFromEventHistory(data.event_history);
            updateSimulatorWithCurrentParameters();
        }
    };

    const updateSimulatorWithCurrentParameters = () => {
        if (!$simulator || !$simulationPlaybackState.hasSimulationData) return;

        const bedDistribution = {};
        $wards.forEach(ward => {
            bedDistribution[ward.disease] = ward.assignedBeds;
        });

        $simulator.updateParameters({
            bedDistribution,
            arrivalRates: $simulationParameters.arrivalRates,
            stayMeans: $simulationParameters.stayMeans
        });
    };


    onMount(async () => {
        if (typeof window !== 'undefined') {
            p5 = (await import('p5')).default;
            myp5 = new p5(sketch, canvasContainer);

            canvasElement = myp5;
            
            if (width && height && myp5) {
                myp5.resizeCanvas(width, height);
                prevWidth = width;
                prevHeight = height;
            }
        }
    });

    $effect(() => {
        if (myp5 && (width !== prevWidth || height !== prevHeight)) {
            prevWidth = width;
            prevHeight = height;
            
            if (canvasElement && canvasElement.resizeCanvas) {
                canvasElement.resizeCanvas(width, height);
            }
        }
    });

	let sketch = async function(p5) {
        p5.setup = async () => {
            p5.createCanvas(width, height);
            p5.colorMode(p5.HSB, 360, 100, 100);
            canvasElement = p5;
            p5.stroke(0);
            p5.strokeWeight(1 / $controls.targetZoom);
            
            $simulator = new Simulator();
            
            $simulationPlaybackState.prevTime = Date.now();
        }

        p5.draw = async () => {
            p5.background(0, 0, 12);
            p5.translate(0, height);
            p5.scale(1, -1);

            if ($simulationPlaybackState.hasSimulationData && $simulator) {
                if ($simulationPlaybackState.isPlaying && $simulationPlaybackState.prevTime !== null) {
                    $simulationPlaybackState.time += (Date.now() - $simulationPlaybackState.prevTime) / 1000 * $simulationPlaybackState.speed;
                    $simulationPlaybackState.time = Math.min($simulationPlaybackState.time, $simulationPlaybackState.maxTime);
                    $simulationPlaybackState.prevTime = Date.now();
                }

                $simulator.update($simulationPlaybackState.time);
                $simulator.hospital.draw(p5);

                drawSimulationInfo(p5);
            } else {
                drawEmptyState(p5);
            }

            drawUI(p5);
        }

        const drawEmptyState = (p5) => {
            p5.push();
            p5.translate(0, -height);
            p5.scale(1, -1);
            p5.fill(255, 50);
            p5.textAlign(p5.CENTER);
            p5.textSize(20);
            p5.text('Run a simulation to see visualization', width/2, height/2 - 20);
            p5.textSize(14);
            p5.text('Adjust parameters in the sidebar and click "Run Simulation"', width/2, height/2 + 10);
            p5.pop();
        };

        const drawSimulationInfo = (p5) => {
            if (!simulationData || !$simulationPlaybackState.isPlaying) return;
            
            p5.push();
            p5.translate(0, -height);
            p5.scale(1, -1);
            p5.fill(255);
            p5.textAlign(p5.LEFT);
            p5.text(`Simulation Time: ${($simulationPlaybackState.time * $simulationPlaybackState.speed / (24 * 3600)).toFixed(1)} days`, 10, height - 70);
            p5.text(`Total Events: ${simulationData.total_events}`, 10, height - 50);
            p5.text(`Speed: {$simulationPlaybackState.speed}x`, 10, height - 30);
            p5.pop();
        };

        const drawUI = (p5) => {
            p5.push();
            p5.translate(0, -height);
            p5.scale(1, -1);
            const isRunning = $httpRunning;
            
            let statusText = '';
            let color = p5.color('white');
            
            if (isRunning) {
                statusText = 'Simulation Running...';
                color = p5.color('yellow');
            } else if ($simulationPlaybackState.hasSimulationData) {
                statusText = $simulationPlaybackState.isPlaying ? 'Simulation Playing' : 'Simulation Paused';
                color = p5.color('green');
            } else {
                statusText = 'Ready to Simulate';
                color = p5.color('white');
            }
            
            p5.fill(color);
            p5.textAlign(p5.RIGHT);
            p5.text(statusText, width - 10, height - 10);
            p5.pop();
        };

        p5.windowResized = () => {
            if (prevWidth !== width || prevHeight !== height) {
                p5.resizeCanvas(width, height);
                prevWidth = width;
                prevHeight = height;
            }
        }
    };
</script>

<div class="relative h-full w-full">
    <div class="cursor-pointer" bind:this={canvasContainer} role="img" aria-label="Hospital simulation canvas" oncontextmenu={(e) => e.preventDefault()}></div>
</div>