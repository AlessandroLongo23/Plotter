<script>
    import Canvas from '$lib/components/Canvas.svelte';

    import { onMount } from 'svelte';

    let width = $state(600);
    let height = $state(600);

    onMount(() => {
        if (typeof window !== 'undefined') {
            width = window.innerWidth;
            height = window.innerHeight;
        }
    });

    let inputBox = $state('x*x + y*y - 1');
    let fn = $state();
</script>

<div class="h-screen w-screen flex justify-center items-center">
    <Canvas width={width} height={height} fn={fn}/>

    <div class="absolute bottom-4 left-[50%] translate-x-[-50%]">
        <input type="text" bind:value={inputBox} onkeydown={(e) => {
            if (e.key === 'Enter') {
                fn = '(x, y) => { return ' + inputBox + '; }';
            }
        }}/>
    </div>
</div>