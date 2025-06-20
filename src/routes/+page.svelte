<script>
	// Project data
	const projects = $state([
		{
			id: 'plotter',
			title: '2D Function Plotter & Integral Calculator',
			description: 'Interactive visualization tool for mathematical functions with Monte Carlo integration capabilities. Plot complex functions, compute definite integrals, and explore numerical methods through an intuitive interface.',
			technologies: ['Monte Carlo Methods', 'Numerical Integration', 'Interactive Visualization'],
			image: '/images/plotter-preview.png',
			link: '/plotter'
		},
		{
			id: 'markov',
			title: 'Markov Chain Visualizer',
			description: 'Dynamic visualization of Markov Chain Monte Carlo (MCMC) processes. Explore state transitions, steady-state distributions, and convergence behavior with real-time animations and statistical analysis.',
			technologies: ['Markov Chains', 'MCMC', 'Statistical Analysis'],
			image: '/images/markov-preview.png',
			link: '/markov'
		},
		{
			id: 'tsp',
			title: 'Traveling Salesman Problem Solver',
			description: 'Simulated annealing optimization for the classic TSP. Watch the algorithm find near-optimal solutions through temperature-controlled random walks, with adjustable parameters and convergence visualization.',
			technologies: ['Simulated Annealing', 'Optimization', 'Combinatorial Problems'],
			image: '/images/tsp-preview.png',
			link: '/tsp'
		}
	]);
</script>

<main class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
	<!-- Header Section -->
	<header class="container mx-auto px-6 py-12">
		<div class="text-center max-w-4xl mx-auto">
			<h1 class="text-5xl font-bold text-gray-900 mb-4">
				Stochastic Simulation Projects
			</h1>
			<p class="text-xl text-gray-600 mb-6">
				Course 02443 - DTU Technical University of Denmark
			</p>
			<div class="bg-white rounded-lg shadow-md p-6 mb-8">
				<h2 class="text-2xl font-semibold text-gray-800 mb-4">About the Course</h2>
				<p class="text-gray-600 leading-relaxed">
					An intensive simulation course covering random number generation, discrete event simulation, 
					Monte Carlo methods, Markov Chain Monte Carlo, and optimization techniques. These projects 
					demonstrate practical applications of stochastic simulation methods learned throughout the course.
				</p>
				<div class="flex flex-wrap justify-center gap-3 mt-4">
					<span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Monte Carlo Methods</span>
					<span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Markov Chains</span>
					<span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">Simulated Annealing</span>
					<span class="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">Numerical Methods</span>
				</div>
			</div>
		</div>
	</header>

	<!-- Projects Section -->
	<section class="container mx-auto px-6 pb-12">
		<h2 class="text-3xl font-bold text-center text-gray-900 mb-12">Projects</h2>
		
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
			{#each projects as project}
				<div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
					<!-- Project Image -->
					<div class="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
						<img 
							src={project.image}
							alt="{project.title} preview"
							class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
							onerror={(e) => {
								e.target.style.display = 'none';
								e.target.parentElement.classList.add('bg-gradient-to-br', 'from-blue-400', 'to-purple-500');
							}}
						/>
					</div>
					
					<!-- Project Content -->
					<div class="p-6">
						<h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
							{project.title}
						</h3>
						<p class="text-gray-600 mb-4 leading-relaxed">
							{project.description}
						</p>
						
						<!-- Technologies -->
						<div class="flex flex-wrap gap-2 mb-4">
							{#each project.technologies as tech}
								<span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
									{tech}
								</span>
							{/each}
						</div>
						
						<!-- Project Link -->
						<a 
							href={project.link}
							class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
						>
							Explore Project
							<svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
							</svg>
						</a>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Course Information Footer -->
	<footer class="bg-gray-900 text-white py-8 mt-12">
		<div class="container mx-auto px-6 text-center">
			<h3 class="text-xl font-semibold mb-4">Course Information</h3>
			<p class="text-gray-300 mb-2">
				Course 02443: Stochastic Simulation
			</p>
			<p class="text-gray-400 text-sm mb-4">
				DTU Technical University of Denmark
			</p>
			<a 
				href="https://www2.imm.dtu.dk/courses/02443/" 
				target="_blank" 
				rel="noopener noreferrer"
				class="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
			>
				View Course Website
				<svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
				</svg>
			</a>
		</div>
	</footer>
</main>

<style>
	/* Additional custom styles if needed */
	.container {
		max-width: 1200px;
	}
</style>