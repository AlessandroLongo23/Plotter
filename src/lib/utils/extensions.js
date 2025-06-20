Array.prototype.pickRandom = function(weights = Array.from({ length: this.length }, () => 1 / this.length)) {
    let sum = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * sum;
    let cumulative = 0;
    for (let i = 0; i < this.length; i++) {
        cumulative += weights[i];
        if (random <= cumulative) return this[i];
    }
}