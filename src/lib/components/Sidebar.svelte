<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import * as ls from 'lucide-svelte';

	import { wards, simulationParameters, simulationRunning } from '$lib/stores/hospital';
	import { httpApiService } from '$lib/services/http-api';
	import { simulationPlaybackState, simulator } from '$lib/stores/simulation';
	import { sidebarSections } from '$lib/stores/sidebar';

	import Slider from '$lib/components/ui/Slider.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import CollapsibleSection from '$lib/components/ui/CollapsibleSection.svelte';
	import SimulationControls from '$lib/components/SimulationControls.svelte';

	let {
		isSidebarOpen = $bindable(true),
		sidebarElement = $bindable(''),
	} = $props();

	const dispatch = createEventDispatcher();
	
	let status = $state('ready');
	let error = $state(null);
	let defaultParameters = $state(null);

	const setupHttpStores = async () => {
		httpApiService.status.subscribe(value => status = value);
		httpApiService.error.subscribe(value => error = value);
		httpApiService.defaultParameters.subscribe(value => defaultParameters = value);
		httpApiService.simulationRunning.subscribe(value => {
			simulationRunning.set(value);
		});
		
		try {
			await httpApiService.fetchDefaults();
		} catch (e) {
			console.error('Failed to fetch defaults:', e);
		}
	};
	
	onMount(() => {
		setupHttpStores();
	});
	
	const toggleSidebar = () => {
		isSidebarOpen = !isSidebarOpen;
		
		dispatch('toggle', { isSidebarOpen });
		
		if (isSidebarOpen) {
			setTimeout(() => {
				window.dispatchEvent(new Event('resize'));
			}, 300);
		}
	}

	let bedsF = $derived.by(() => {
		let bedsF = $wards.reduce((acc, ward) => {
			if (ward.disease === 'F') return acc;
			return acc + (ward.maxBeds - ward.assignedBeds);
		}, 0);

		$wards.find(ward => ward.disease === 'F').assignedBeds = bedsF;
		return bedsF;
	});

	let totalBeds = $derived.by(() => {
		return $wards.reduce((acc, ward) => {
			return acc + ward.maxBeds;
		}, 0);
	});

	const runSimulation = async () => {
		const bedDistribution = {};
		$wards.forEach(ward => {
			bedDistribution[ward.disease] = ward.assignedBeds;
		});

		const parameters = {
			time: $simulationParameters.time,
			bedDistribution,
			arrivalRates: $simulationParameters.arrivalRates,
			stayMeans: $simulationParameters.stayMeans
		};

		console.log('🚀 Running simulation with parameters:', parameters);

		try {
			await httpApiService.runSimulation(parameters);
		} catch (e) {
			console.error('Simulation failed:', e);
		}
	};

	const resetBeds = () => {
		if (defaultParameters) {
			wards.update(wardsArray => {
				return wardsArray.map(ward => ({
					...ward,
					assignedBeds: defaultParameters.bed_distribution[ward.disease]
				}));
			});
		}
	}

	const resetArrivalRates = () => {
		if (defaultParameters) {
			simulationParameters.update(params => ({
				...params,
				arrivalRates: defaultParameters.arrival_rates,
			}));
		}
	};

	const resetStayMeans = () => {
		if (defaultParameters) {
			simulationParameters.update(params => ({
				...params,
				stayMeans: defaultParameters.stay_means
			}));
		}
	}

	const handleReset = () => {
        if ($simulationPlaybackState.hasSimulationData) {
            $simulationPlaybackState.time = 0;
            $simulationPlaybackState.prevTime = Date.now();
            if ($simulator) {
                $simulator.reset();
            }
        }
    };

    const handlePlayPause = () => {
        if ($simulationPlaybackState.hasSimulationData) {
            $simulationPlaybackState.isPlaying = !$simulationPlaybackState.isPlaying;
            if ($simulationPlaybackState.isPlaying && $simulationPlaybackState.prevTime === null) {
                $simulationPlaybackState.prevTime = Date.now();
            } else if ($simulationPlaybackState.isPlaying) {
                $simulationPlaybackState.prevTime = Date.now();
            }
        }
    };

    const handleSpeedChange = (newSpeed) => {
        $simulationPlaybackState.speed = newSpeed;
    };

    const maxTime = $derived($simulationParameters.time * 24 * 3600);
</script>

<div id="sidebar" class="h-full fixed left-0 top-0 transition-all duration-300 flex flex-col shadow-2xl {isSidebarOpen ? 'w-96' : 'w-12'}" bind:this={sidebarElement}>
	<div class="bg-zinc-800/90 backdrop-blur-sm text-white h-full overflow-hidden flex flex-col border-r border-zinc-700/80">
		<div class="p-3 flex items-center justify-between border-b border-zinc-700/80 flex-shrink-0 bg-zinc-900/30">
			{#if isSidebarOpen}
				<h2 class="text-sm font-medium text-white/90 uppercase tracking-wider">Hospital Simulation</h2>
			{/if}

			<button
				onclick={toggleSidebar}
				class="p-1 rounded-md hover:bg-zinc-700/70 transition-all text-white/80 hover:text-white/100"
				aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
			>
				{#if isSidebarOpen}
					<ls.ChevronLeft size={18} />
				{:else}
					<ls.ChevronRight size={18} />
				{/if}
			</button>
		</div>
		
		{#if isSidebarOpen}
			<div class="flex-1 overflow-y-auto">
				<CollapsibleSection 
					title="Simulation Setup" 
					bind:isOpen={$sidebarSections.simulation}
				>
					{#snippet children()}
						<Slider
							id="sim-time"
							label="Simulation Time (days)"
							min={30}
							max={3650}
							bind:value={$simulationParameters.time}
						/>
						
						<Button 
							onclick={runSimulation}
							disabled={$simulationRunning}
							class="w-full {$simulationRunning ? 'bg-zinc-600' : 'bg-blue-600 hover:bg-blue-700'}"
						>
							{#if $simulationRunning}
								<ls.Loader2 size={16} class="animate-spin mr-2" />
								Running...
							{:else}
								<ls.Play size={16} class="mr-2" />
								Run Simulation
							{/if}
						</Button>
					{/snippet}
				</CollapsibleSection>

				<!-- Ward Beds Section -->
				<CollapsibleSection 
					title="Ward Beds" 
					bind:isOpen={$sidebarSections.wardBeds}
					onReset={resetBeds}
				>
					{#snippet children()}
						{#each $wards as ward}
							{#if ward.disease !== 'F'}
								<Slider
									id={`ward-${ward.disease}`}
									label='Ward {ward.disease}'
									min={0}
									max={ward.maxBeds}
									bind:value={ward.assignedBeds}
								/>
							{/if}
						{/each}
						<Slider
							id="ward-F"
							label="Ward F (Auto)"
							min={0}
							disabled={true}
							max={totalBeds}
							value={bedsF}
						/>
					{/snippet}
				</CollapsibleSection>

				<!-- Arrival Rates Section -->
				<CollapsibleSection 
					title="Arrival Rates" 
					bind:isOpen={$sidebarSections.arrivalRates}
					onReset={resetArrivalRates}
				>
					{#snippet children()}
						{#each Object.keys($simulationParameters.arrivalRates) as disease}
							<Slider
								id={`arrival-${disease}`}
								label='Disease {disease} (patients/day)'
								min={0}
								max={30}
								step={0.1}
								bind:value={$simulationParameters.arrivalRates[disease]}
							/>
						{/each}
					{/snippet}
				</CollapsibleSection>

				<!-- Length of Stay Section -->
				<CollapsibleSection 
					title="Length of Stay" 
					bind:isOpen={$sidebarSections.lengthOfStay}
					onReset={resetStayMeans}
				>
					{#snippet children()}
						{#each Object.keys($simulationParameters.stayMeans) as disease}
							<Slider
								id={`stay-${disease}`}
								label='Disease {disease} (days)'
								min={0.1}
								max={10}
								step={0.1}
								bind:value={$simulationParameters.stayMeans[disease]}
							/>
						{/each}
					{/snippet}
				</CollapsibleSection>
			</div>

			<!-- Fixed Simulation Controls at Bottom -->
			{#if $simulationPlaybackState.hasSimulationData}
				<div class="border-t border-zinc-700/80 bg-zinc-900/40 backdrop-blur-sm flex-shrink-0">
					<div class="p-3">
						<SimulationControls
							onReset={handleReset}
							onPlayPause={handlePlayPause}
							onSpeedChange={handleSpeedChange}
						/>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>