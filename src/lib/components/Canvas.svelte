<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { controls } from '$lib/stores/plotter';
    import * as ls from 'lucide-svelte';

    import { Renderer } from '$lib/classes/Renderer.svelte.js';
    import { Vector } from '$lib/classes/Vector.svelte.js';
    import { Grid } from '$lib/classes/Grid.svelte.js';

    let {
        width = 600,
        height = 600,
        fn
    } = $props();

    let prevWidth = $state(width);   
    let prevHeight = $state(height);

    let canvasElement = $state(null);
    let canvasContainer = $state();
    let p5;
    let myp5 = $state();

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

    let minx = $state(-10);
    let maxx = $state(10);
    let ratio = $derived(width / height);
    let miny = $derived(-(maxx - minx) / ratio / 2);
    let maxy = $derived(-miny);
    let step = $state(0.1);

    let renderer = $derived(new Renderer(myp5));

    let grid = $state(new Grid());

    let prevFn = $state(fn);

	let sketch = function(p5) {
        p5.setup = () => {
            p5.createCanvas(width, height);
            canvasElement = p5;
            p5.stroke(0);
            p5.strokeWeight(1 / $controls.targetZoom);
        }

        p5.draw = async () => {
            p5.background(255);
            p5.translate(0, height);
            p5.scale(1, -1);

            if (prevFn !== fn) {
                prevFn = fn;
                renderer.update(fn, minx, maxx, miny, maxy, step, step);
            }

            // p5.push();
            p5.translate(width/2, height/2);
            p5.scale($controls.targetZoom);
            // p5.translate($controls.targetOffset.x, $controls.targetOffset.y);
            renderer.render(p5, minx, maxx, miny, maxy);
            // renderer.drawIntegral(p5, minx, maxx, miny, maxy, fn, 0, 1);
            // p5.pop();
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

            // grab = true;
        }

        p5.mouseWheel = (event) => {
        }
    };
</script>

<div class="relative h-full w-full">
    <div class="cursor-pointer" bind:this={canvasContainer} oncontextmenu={(e) => e.preventDefault()}></div>
</div>