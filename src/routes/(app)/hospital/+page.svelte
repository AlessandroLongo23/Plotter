<script>
    import { onMount } from 'svelte';

    import Sidebar from '$lib/components/Sidebar.svelte';
    import HospitalCanvas from '$lib/components/HospitalCanvas.svelte';

    let sidebarElement = $state('');
    let sidebarWidth = $state(100);
    let isSidebarOpen = $state(true);
    let prevSidebarState = $state(true);
    
    let width = $state(600);
    let height = $state(600);
    let isResizing = $state(false);

    onMount(() => {
        updateDimensions();
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    });

    $effect(() => {
        if (prevSidebarState !== isSidebarOpen) {
            prevSidebarState = isSidebarOpen;
            
            const delay = isSidebarOpen ? 300 : 10;
            
            setTimeout(() => {
                updateDimensions();
            }, delay);
        }
    });
    
    const handleResize = () => {
        if (!isResizing) {
            isResizing = true;
            setTimeout(() => {
                updateDimensions();
                isResizing = false;
            }, 100);
        }
    }
    
    const updateDimensions = () => {
        if (!sidebarElement) return;
        
        sidebarWidth = isSidebarOpen ? sidebarElement.clientWidth : 48;
        
        width = window.innerWidth - sidebarWidth;
        height = window.innerHeight;
    }
</script>

<div class="flex h-screen w-full bg-zinc-900 overflow-hidden">
    <Sidebar 
        bind:sidebarElement={sidebarElement} 
        bind:isSidebarOpen={isSidebarOpen}
    />
        
    <div
        class="absolute top-0 right-0 bottom-0 transition-all duration-300 z-0 bg-zinc-900 overflow-hidden"
        style="left: {sidebarWidth}px;"
    >
        <HospitalCanvas 
            width={width}
            height={height} 
        />
    </div>
</div>