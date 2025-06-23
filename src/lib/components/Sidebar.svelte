<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import * as ls from 'lucide-svelte';

	import { wards, simulationParameters, simulationRunning } from '$lib/stores/hospital';
	import { websocketService } from '$lib/services/websocket';
	import { httpApiService } from '$lib/services/http-api';

	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let {
		isSidebarOpen = $bindable(true),
		sidebarElement = $bindable(''),
	} = $props();

	const dispatch = createEventDispatcher();
	
	// Service selection and stores
	let currentService = $state('http'); // Default to HTTP for Vercel compatibility
	let connected = $state(true); // HTTP is always "connected"
	let status = $state('ready');
	let error = $state(null);
	let defaultParameters = $state(null);
	
	// Try WebSocket first, fallback to HTTP
	const initializeServices = async () => {
		// Check if we're in development and WebSocket is available
		const isLocal = typeof window !== 'undefined' && 
						(window.location.hostname === 'localhost' || 
						 window.location.hostname === '127.0.0.1');
		
		if (isLocal) {
			try {
				// Try WebSocket first for local development
				websocketService.connect();
				
				// Wait a bit to see if WebSocket connects
				setTimeout(() => {
					if (websocketService.connected.value) {
						currentService = 'websocket';
						setupWebSocketStores();
					} else {
						currentService = 'http';
						setupHttpStores();
					}
				}, 1000);
			} catch (e) {
				currentService = 'http';
				setupHttpStores();
			}
		} else {
			// Use HTTP for production
			currentService = 'http';
			setupHttpStores();
		}
	};

	const setupWebSocketStores = () => {
		// Subscribe to WebSocket stores
		websocketService.connected.subscribe(value => connected = value);
		websocketService.status.subscribe(value => status = value);
		websocketService.error.subscribe(value => error = value);
		websocketService.defaultParameters.subscribe(value => defaultParameters = value);
	};

	const setupHttpStores = async () => {
		// Subscribe to HTTP stores
		httpApiService.status.subscribe(value => status = value);
		httpApiService.error.subscribe(value => error = value);
		httpApiService.defaultParameters.subscribe(value => defaultParameters = value);
		
		// Fetch defaults immediately
		try {
			await httpApiService.fetchDefaults();
		} catch (e) {
			console.error('Failed to fetch defaults:', e);
		}
	};
	
	// Load default parameters when they arrive
	$effect(() => {
		if (defaultParameters) {
			simulationParameters.update(params => ({
				...params,
				arrivalRates: defaultParameters.arrival_rates,
				stayMeans: defaultParameters.stay_means
			}));
		}
	});

	onMount(() => {
		initializeServices();
		
		return () => {
			if (currentService === 'websocket') {
				websocketService.disconnect();
			}
		};
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
	})

	const runSimulation = async () => {
		// Prepare bed distribution from wards
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
		console.log('📊 Arrival rates being sent:', $simulationParameters.arrivalRates);

		try {
			if (currentService === 'websocket' && connected) {
				websocketService.runSimulation(parameters);
			} else {
				await httpApiService.runSimulation(parameters);
			}
		} catch (e) {
			console.error('Simulation failed:', e);
		}
	};

	const resetParameters = () => {
		if (defaultParameters) {
			simulationParameters.update(params => ({
				time: 365,
				arrivalRates: defaultParameters.arrival_rates,
				stayMeans: defaultParameters.stay_means
			}));
		}
	};

	// Get simulation running state from current service
	$effect(() => {
		if (currentService === 'websocket') {
			websocketService.simulationRunning.subscribe(value => {
				simulationRunning.set(value);
			});
		} else {
			httpApiService.simulationRunning.subscribe(value => {
				simulationRunning.set(value);
			});
		}
	});
</script>

<div id="sidebar" class="h-full fixed left-0 top-0 transition-all duration-300 flex flex-col shadow-2xl {isSidebarOpen ? 'w-96' : 'w-12'}" bind:this={sidebarElement}>
	<div class="bg-zinc-800/90 backdrop-blur-sm text-white h-full overflow-hidden flex flex-col border-r border-zinc-700/50">
		<div class="p-3 flex items-center justify-between border-b border-zinc-700/50 flex-shrink-0 bg-zinc-900/30">
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
				<!-- Connection Status -->
				<div class="p-3 border-b border-zinc-700/50 bg-zinc-800/40">
					<div class="flex items-center gap-2 text-sm">
						<div class="w-2 h-2 rounded-full {connected ? 'bg-green-500' : 'bg-yellow-500'}"></div>
						<span class="text-white/80">{currentService === 'websocket' ? 'WebSocket' : 'HTTP API'}: {status}</span>
					</div>
					{#if error}
						<div class="mt-2 text-xs text-red-400">{error}</div>
					{/if}
				</div>

				<!-- Simulation Controls -->
				<div class="p-3 border-b border-zinc-700/50 bg-zinc-800/40">
					<div class="flex items-center justify-between mb-3">
						<h3 class="text-sm font-medium text-white/90 uppercase tracking-wider">Simulation</h3>
					</div>
					
					<div class="space-y-3">
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
					</div>
				</div>

				<!-- Ward Configuration -->
				<div class="p-3 border-b border-zinc-700/50 bg-zinc-800/40">
					<div class="flex items-center justify-between mb-3">
						<h3 class="text-sm font-medium text-white/90 uppercase tracking-wider">Ward Beds</h3>
						<button
							class="p-1 rounded-md hover:bg-zinc-700/70 transition-all text-white/80 hover:text-white/100 cursor-pointer"
							onclick={() => {
								wards.update(wardsArray => {
									return wardsArray.map(ward => ({
										...ward,
										assignedBeds: ward.maxBeds
									}));
								});
							}}
						>
							<ls.RefreshCcw size={16} />
						</button>
					</div>

					<div class="space-y-3">
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
					</div>
				</div>

				<!-- Arrival Rates -->
				<div class="p-3 border-b border-zinc-700/50 bg-zinc-800/40">
					<div class="flex items-center justify-between mb-3">
						<h3 class="text-sm font-medium text-white/90 uppercase tracking-wider">Arrival Rates</h3>
						<button
							class="p-1 rounded-md hover:bg-zinc-700/70 transition-all text-white/80 hover:text-white/100"
							onclick={resetParameters}
						>
							<ls.RefreshCcw size={16} />
						</button>
					</div>

					<div class="space-y-3">
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
					</div>
				</div>

				<!-- Stay Means -->
				<div class="p-3 bg-zinc-800/40">
					<h3 class="text-sm font-medium text-white/90 uppercase tracking-wider mb-3">Length of Stay</h3>
					
					<div class="space-y-3">
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
					</div>
				</div>
			</div>
		{/if}
	</div>
</div> 

<style>
	.sticky-header {
		position: sticky;
		top: 0;
		z-index: 10;
		transition: all 0.2s ease;
	}
	
	.sticky-header.scrolling {
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}
	
	.group-indicator {
		padding: 0.25rem 0.5rem;
		margin-top: 0.5rem;
		background-color: rgba(39, 39, 42, 0.5);
		border-radius: 0.25rem;
		transition: all 0.15s ease;
		border: 1px solid rgba(63, 63, 70, 0.3);
	}
</style>