<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { controls } from '$lib/stores/plotter';
    import { Vector } from '$lib/classes/Vector.svelte.js';

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
    let startTime = $state(null);

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
            simulator = new Simulator();
            await simulator.loadData('log.txt');

            startTime = Date.now();
        }

        p5.draw = async () => {
            p5.background(0, 0, 12);
            p5.translate(0, height);
            p5.scale(1, -1);

            if (startTime !== null) {
                time = (Date.now() - startTime) / 1000;
            }

            simulator.update(time);
            simulator.hospital.draw(p5);
        }

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

        p5.mouseWheel = (event) => {
        }
    };
</script>

<div class="relative h-full w-full">
    <div class="cursor-pointer" bind:this={canvasContainer} oncontextmenu={(e) => e.preventDefault()}></div>
</div>