<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { controls } from '$lib/stores/plotter';
    import { Vector } from '$lib/classes/Vector.svelte.js';
    import { wards, simulationParameters } from '$lib/stores/hospital';
    import { httpApiService } from '$lib/services/http-api';

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

    let time = $state(0);
    let simulator = $state();
    let prevTime = $state(null);
    let simulationData = $state(null);
    let isPlayingSimulation = $state(false);
    let simulationSpeed = $state(1);
    let hasSimulationData = $state(false);

    // Subscribe to HTTP API service for simulation results
    let httpResults = httpApiService.simulationResults;
    let httpRunning = httpApiService.simulationRunning;

    // Watch for simulation results from HTTP API
    $effect(() => {
        if ($httpResults) {
            console.log('Received HTTP simulation results:', $httpResults);
            loadSimulationData($httpResults);
        }
    });

    // Watch for ward changes and update simulator if we have data
    $effect(() => {
        const wardBeds = $wards.map(w => `${w.disease}:${w.assignedBeds}`).join(',');
        if (hasSimulationData && simulator && wardBeds) {
            updateSimulatorWithCurrentParameters();
        }
    });

    // Watch for parameter changes and update simulator if we have data
    $effect(() => {
        const arrivalRatesStr = JSON.stringify($simulationParameters.arrivalRates);
        const stayMeansStr = JSON.stringify($simulationParameters.stayMeans);
        if (hasSimulationData && simulator && arrivalRatesStr && stayMeansStr) {
            updateSimulatorWithCurrentParameters();
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
        hasSimulationData = true;
        isPlayingSimulation = true;
        time = 0;
        prevTime = Date.now();

        if (simulator) {
            simulator.reset();
            
            await simulator.loadFromEventHistory(data.event_history);
            updateSimulatorWithCurrentParameters();
        }
    };

    const updateSimulatorWithCurrentParameters = () => {
        if (!simulator || !hasSimulationData) return;

        // Update simulator with current ward bed counts
        const bedDistribution = {};
        $wards.forEach(ward => {
            bedDistribution[ward.disease] = ward.assignedBeds;
        });

        // Update simulator with current parameters
        simulator.updateParameters({
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
            
            // Create simulator but don't load any data yet
            simulator = new Simulator();
            
            // Don't start time until we have simulation data
            prevTime = Date.now();
        }

        p5.draw = async () => {
            p5.background(0, 0, 12);
            p5.translate(0, height);
            p5.scale(1, -1);

            if (hasSimulationData && simulator) {
                if (isPlayingSimulation && prevTime !== null) {
                    time += (Date.now() - prevTime) / 1000 * simulationSpeed;
                    prevTime = Date.now();
                }

                simulator.update(time);
                simulator.hospital.draw(p5);

                // Show simulation info overlay
                drawSimulationInfo(p5);
            } else {
                // Show empty state message
                drawEmptyState(p5);
            }

            // Always show UI status
            drawUI(p5);
        }

        const drawEmptyState = (p5) => {
            p5.push();
            p5.translate(0, -height);
            p5.scale(1, -1);
            p5.fill(255, 50); // Semi-transparent white
            p5.textAlign(p5.CENTER);
            p5.textSize(20);
            p5.text('Run a simulation to see visualization', width/2, height/2 - 20);
            p5.textSize(14);
            p5.text('Adjust parameters in the sidebar and click "Run Simulation"', width/2, height/2 + 10);
            p5.pop();
        };

        const drawSimulationInfo = (p5) => {
            if (!simulationData || !isPlayingSimulation) return;
            
            p5.push();
            p5.translate(0, -height);
            p5.scale(1, -1);
            p5.fill(255);
            p5.textAlign(p5.LEFT);
            p5.text(`Simulation Time: ${(time * simulationSpeed / (24 * 3600)).toFixed(1)} days`, 10, height - 70);
            p5.text(`Total Events: ${simulationData.total_events}`, 10, height - 50);
            p5.text(`Speed: ${simulationSpeed}x`, 10, height - 30);
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
            } else if (hasSimulationData) {
                statusText = isPlayingSimulation ? 'Simulation Playing' : 'Simulation Paused';
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

        p5.mousePressed = (event) => {
            if (event && event.target !== p5.canvas) return;

            if (event.button === 1) {
                const mouse = new Vector(p5.mouseX - p5.width/2, p5.mouseY - p5.height/2);
                const worldPoint = Vector.sub(mouse, $controls.targetOffset).scale(1 / $controls.targetZoom);
                $controls.targetOffset.set(Vector.sub(new Vector(0, 0), Vector.scale(worldPoint, $controls.targetZoom)));
                return;
            }

            if (event.button === 2) {
                event.preventDefault();
                event.stopPropagation();
                $controls.targetOffset.set(new Vector(0, 0));
                $controls.targetZoom = 50;
                return;
            }
        }

        p5.keyPressed = () => {
            if (hasSimulationData) {
                if (p5.key === ' ') {
                    // Toggle play/pause
                    isPlayingSimulation = !isPlayingSimulation;
                    if (isPlayingSimulation && prevTime === null) {
                        prevTime = Date.now();
                    } else if (isPlayingSimulation) {
                        prevTime = Date.now() - time * 1000;
                    }
                } else if (p5.key === 'r' || p5.key === 'R') {
                    // Restart simulation
                    time = 0;
                    prevTime = Date.now();
                    isPlayingSimulation = true;
                    // Reset the simulator state
                    if (simulator) {
                        simulator.reset();
                        updateSimulatorWithCurrentParameters();
                    }
                } else if (p5.key === '+') {
                    // Increase speed
                    simulationSpeed = Math.min(simulationSpeed * 2, 16);
                } else if (p5.key === '-') {
                    // Decrease speed
                    simulationSpeed = Math.max(simulationSpeed / 2, 0.125);
                }
            }
        };

        p5.mouseWheel = (event) => {
            // Zoom functionality can be added here if needed
        };
    };
</script>

<div class="relative h-full w-full">
    <div class="cursor-pointer" bind:this={canvasContainer} role="img" aria-label="Hospital simulation canvas" oncontextmenu={(e) => e.preventDefault()}></div>
    
    {#if hasSimulationData}
        <div class="absolute top-4 left-4 bg-black/50 text-white p-3 rounded-lg text-sm">
            <div class="font-semibold mb-2">Simulation Controls</div>
            <div>Space: Play/Pause</div>
            <div>R: Restart</div>
            <div>+/-: Speed ({simulationSpeed}x)</div>
        </div>
    {/if}
</div>