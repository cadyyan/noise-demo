function RandInt(max) {
	var log  = Math.floor(Math.log(max) / Math.LN10) + 1;
	var mult = Math.pow(10, log);

	return Math.floor(Math.random() * mult) % max;
}

function GradientVector2D(x, y) {
	this.x = x;
	this.y = y;
	this.normalize = function () {
		var length = Math.sqrt(this.x * this.x + this.y * this.y);
		this.x /= length;
		this.y /= length;
	}

	this.normalize();
}

function PerlinNoiseGenerator1D() {
	this.permutations = [];
	this.gradients    = [];

	this.init = function (seed) {
		Math.seedrandom(seed);

		this.permutations = [];
		this.gradients    = [];

		for (var i = 0; i != 512; i++) {
			this.permutations.push(i & 255);

			this.gradients.push((RandInt(512) - 256) / 256.0);
		}

		for (var i = 0; i != 512; i++) {
			var index = RandInt(512);

			var t = this.permutations[i];
			this.permutations[i]     = this.permutations[index];
			this.permutations[index] = t;
		}
	}

	this.fade = function (t) {
		return t * t * t * (t * (t * 6 - 15) + 10);
	};

	this.gradient = function (hash, x) {
		var gradient = this.gradients[hash];
		return gradient * x;
	};

	this.linearInterpolation = function (t, a, b) {
		return a + t * (b - a);
	};

	this.noise = function (x) {
		var X = Math.floor(x) & 255;

		x -= Math.floor(x);

		var u = this.fade(x);

		var p0 = this.permutations[X];
		var p1 = this.permutations[X + 1];

		return this.linearInterpolation(u, this.gradient(p0, x), this.gradient(p1, x - 1));
	};
}

function PerlinNoiseGenerator2D() {
	this.permutations = [];
	this.gradients    = [];

	this.init = function (seed) {
		Math.seedrandom(seed);

		this.permutations = [];
		this.gradients    = [];

		for (var i = 0; i != 512; i++) {
			this.permutations.push(i & 255);

			var g = new GradientVector2D((RandInt(512) - 256) / 256.0, (RandInt(512) - 256) / 256.0);

			this.gradients.push(g);
		}

		for (var i = 0; i != 512; i++) {
			var index = RandInt(512);

			var t = this.permutations[i];
			this.permutations[i]     = this.permutations[index];
			this.permutations[index] = t;
		}
	};

	this.fade = function (t) {
		return t * t * t * (t * (t * 6 - 15) + 10);
	};

	this.gradient = function (hash, x, y) {
		var gradient = this.gradients[hash];
		return gradient.x * x + gradient.y * y;
	};

	this.linearInterpolation = function (t, a, b) {
		return a + t * (b - a);
	};

	this.noise = function (x, y) {
		var X = Math.floor(x) & 255;
		var Y = Math.floor(y) & 255;

		x -= Math.floor(x);
		y -= Math.floor(y);

		var u = this.fade(x);
		var v = this.fade(y);

		var p00 = this.permutations[this.permutations[X] + Y];
		var p10 = this.permutations[this.permutations[X + 1] + Y];
		var p01 = this.permutations[this.permutations[X] + Y + 1];
		var p11 = this.permutations[this.permutations[X + 1] + Y + 1];

		return this.linearInterpolation(v,
			this.linearInterpolation(u, this.gradient(p00, x, y), this.gradient(p10, x - 1, y)),
			this.linearInterpolation(u, this.gradient(p01, x, y - 1), this.gradient(p11, x - 1, y - 1)));
	};
}

function PerlinNoiseOctaveGenerator(generator) {
	this.generator = generator;

	this.init = function (seed, persistence, octaves) {
		this.persistence = persistence;
		this.octaves     = octaves;

		this.generator.init(seed);
	};

	this.noise = function () {
		var noise = 0;
		for (var octave = 0; octave != this.octaves; octave++) {
			var amplitude = Math.pow(this.persistence, octave);

			for (var i = 0; i != arguments.length; i++) {
				arguments[i] *= 2;
			}

			noise += this.generator.noise.apply(this.generator, arguments) * amplitude;
		}

		return noise;
	};
}

