<script>
	import Button from '$lib/components/ui/Button.svelte';
	import * as ls from 'lucide-svelte';
	import { simulationPlaybackState } from '$lib/stores/simulation';
	
	let {
		onReset = () => {},
		onPlayPause = () => {},
		onSpeedChange = () => {}
	} = $props();

	const speedLevels = [0.25, 0.5, 1, 2, 4, 8];
	
	const handleSpeedCycle = () => {
		const currentIndex = speedLevels.indexOf($simulationPlaybackState.speed);
		const nextIndex = (currentIndex + 1) % speedLevels.length;
		const newSpeed = speedLevels[nextIndex];
		onSpeedChange(newSpeed);
	};

	const formatSpeed = (speed) => {
		return speed < 1 ? `×${speed}` : `×${speed}`;
	};

	let displayTime = $derived.by(() => ($simulationPlaybackState.time).toFixed(0));
	let displayMaxTime = $derived.by(() => ($simulationPlaybackState.maxTime).toFixed(0));
	let progress = $derived.by(() => (displayTime / displayMaxTime) * 100);
</script>

<div class="flex items-center justify-between mb-3">
	<h3 class="text-sm font-medium text-white/90 uppercase tracking-wider">Simulation Controls</h3>
</div>

<div class="p-4 space-y-4">
	<div class="flex items-center justify-center gap-2">
		<button
			onclick={onReset}
			class="flex items-center justify-center w-12 h-10 rounded-md bg-zinc-700/40 hover:bg-zinc-600/60 border border-zinc-600/30 hover:border-zinc-500/50 text-white/80 hover:text-white transition-all duration-200 group"
			title="Reset Simulation"
		>
			<ls.RotateCcw size={16} class="group-hover:rotate-180 transition-transform duration-300" />
		</button>

		<button
			onclick={onPlayPause}
			class="flex items-center justify-center w-12 h-10 rounded-md bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 hover:text-emerald-300 transition-all duration-200"
			title={$simulationPlaybackState.isPlaying ? "Pause Simulation" : "Play Simulation"}
		>
			{#if $simulationPlaybackState.isPlaying}
				<ls.Pause size={16} />
			{:else}
				<ls.Play size={16} />
			{/if}
		</button>

		<button
			onclick={handleSpeedCycle}
			class="flex items-center justify-center w-12 h-10 rounded-md bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 hover:border-amber-500/50 text-amber-400 hover:text-amber-300 transition-all duration-200"
			title="Cycle Speed"
		>
			<span class="text-xs font-semibold">{formatSpeed($simulationPlaybackState.speed)}</span>
		</button>
	</div>

	<div class="space-y-2">
		<div class="relative w-full h-2 bg-zinc-700/50 rounded-full overflow-hidden">
			<div 
				class="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 rounded-full transition-all duration-300 ease-out"
				style="width: {progress}%"
			>
			</div>
		</div>
		
		<div class="flex justify-between items-center text-xs">
			<span class="text-white/60">Progress</span>
			<div class="flex items-center gap-1 text-white/80 font-medium">
				<ls.Clock size={12} />
				<span>{displayTime} / {displayMaxTime} days</span>
			</div>
		</div>
	</div>
</div>