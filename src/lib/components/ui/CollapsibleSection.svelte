<script>
	import * as ls from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	
	let {
		title,
		isOpen = $bindable(true),
		children,
		onReset = null
	} = $props();

	const toggleSection = () => {
		isOpen = !isOpen;
	};
</script>

<div class="border-b border-zinc-700/80 bg-zinc-800/40">
	<div class="p-3">
		<div class="flex items-center justify-between mb-3">
			<button
				onclick={toggleSection}
				class="flex items-center gap-2 text-sm font-medium text-white/90 uppercase tracking-wider hover:text-white transition-colors"
			>
				<div class="transform transition-transform duration-200 {isOpen ? 'rotate-0' : '-rotate-90'}">
					<ls.ChevronDown size={16} />
				</div>
				{title}
			</button>
			
			{#if onReset}
				<button
					class="p-1 rounded-md hover:bg-zinc-700/70 transition-all text-white/80 hover:text-white/100 cursor-pointer"
					onclick={onReset}
					title="Reset to defaults"
				>
					<ls.RefreshCcw size={16} />
				</button>
			{/if}
		</div>
		
		{#if isOpen}
			<div transition:slide={{ duration: 300, axis: 'y' }} class="space-y-3">
				{@render children()}
			</div>
		{/if}
	</div>
</div> 