<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import * as ls from 'lucide-svelte';

	import { wards } from '$lib/stores/hospital';

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
</script>

<div id="sidebar" class="h-full fixed left-0 top-0 transition-all duration-300 flex flex-col shadow-2xl {isSidebarOpen ? 'w-96' : 'w-12'}" bind:this={sidebarElement}>
	<div class="bg-zinc-800/90 backdrop-blur-sm text-white h-full overflow-hidden flex flex-col border-r border-zinc-700/50">
		<div class="p-3 flex items-center justify-between border-b border-zinc-700/50 flex-shrink-0 bg-zinc-900/30">
			{#if isSidebarOpen}
				<h2 class="text-sm font-medium text-white/90 uppercase tracking-wider">Controls</h2>
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
			<div class="flex-1 overflow-hidden">
				<div class="p-3 flex-shrink-0 border-b border-zinc-700/50 bg-zinc-800/40 flex flex-row items-center justify-between">
					<h2 class="text-sm font-medium text-white/90 uppercase tracking-wider">Wards</h2>
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

                <div class="p-3 flex-shrink-0 border-b border-zinc-700/50 bg-zinc-800/40 flex flex-col gap-4">
					{#each $wards as ward}
						{#if ward.disease !== 'F'}
							<div class="flex items-center justify-between">
								<Slider
									id={`ward-${ward.disease}`}
									label='Ward {ward.disease}'
									min={0}
									max={ward.maxBeds}
									bind:value={ward.assignedBeds}
									onchange={() => {}}
								/>
							</div>
						{/if}
					{/each}
					<Slider
						id="ward-F"
						label="Ward F"
						min={0}
						disabled={true}
						max={totalBeds}
						value={bedsF}
					/>
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