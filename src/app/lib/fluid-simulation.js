const VERTEX_SHADER = `
precision highp float;

attribute vec2 aPosition;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform vec2 u_vertex_texel;

void main () {
    vUv = aPosition * .5 + .5;
    vL = vUv - vec2(u_vertex_texel.x, 0.);
    vR = vUv + vec2(u_vertex_texel.x, 0.);
    vT = vUv + vec2(0., u_vertex_texel.y);
    vB = vUv - vec2(0., u_vertex_texel.y);
    gl_Position = vec4(aPosition, 0., 1.);
}
`;

const ADVECTION_SHADER = `
precision highp float;
precision highp sampler2D;

varying vec2 vUv;
uniform sampler2D u_velocity_txr;
uniform sampler2D u_input_txr;
uniform vec2 u_vertex_texel;
uniform vec2 u_output_textel;
uniform float u_dt;
uniform float u_dissipation;

vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
    vec2 st = uv / tsize - 0.5;
    vec2 iuv = floor(st);
    vec2 fuv = fract(st);

    vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
    vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
    vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
    vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);

    return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
}

void main () {
    vec2 coord = vUv - u_dt * bilerp(u_velocity_txr, vUv, u_vertex_texel).xy * u_vertex_texel;
    gl_FragColor = u_dissipation * bilerp(u_input_txr, coord, u_output_textel);
    gl_FragColor.a = 1.;
}
`;

const DIVERGENCE_SHADER = `
precision highp float;
precision highp sampler2D;

varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D u_velocity_txr;

void main () {
    float L = texture2D(u_velocity_txr, vL).x;
    float R = texture2D(u_velocity_txr, vR).x;
    float T = texture2D(u_velocity_txr, vT).y;
    float B = texture2D(u_velocity_txr, vB).y;

    float div = .5 * (R - L + T - B);
    gl_FragColor = vec4(div, 0., 0., 1.);
}
`;

const PRESSURE_SHADER = `
precision highp float;
precision highp sampler2D;

varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D u_pressure_txr;
uniform sampler2D u_divergence_txr;

void main () {
    float L = texture2D(u_pressure_txr, vL).x;
    float R = texture2D(u_pressure_txr, vR).x;
    float T = texture2D(u_pressure_txr, vT).x;
    float B = texture2D(u_pressure_txr, vB).x;
    float C = texture2D(u_pressure_txr, vUv).x;
    float divergence = texture2D(u_divergence_txr, vUv).x;
    float pressure = (L + R + B + T - divergence) * 0.25;
    gl_FragColor = vec4(pressure, 0., 0., 1.);
}
`;

const GRADIENT_SUBTRACT_SHADER = `
precision highp float;
precision highp sampler2D;

varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D u_pressure_txr;
uniform sampler2D u_velocity_txr;

void main () {
    float L = texture2D(u_pressure_txr, vL).x;
    float R = texture2D(u_pressure_txr, vR).x;
    float T = texture2D(u_pressure_txr, vT).x;
    float B = texture2D(u_pressure_txr, vB).x;
    vec2 velocity = texture2D(u_velocity_txr, vUv).xy;
    velocity.xy -= vec2(R - L, T - B);
    gl_FragColor = vec4(velocity, 0., 1.);
}
`;

const POINT_SHADER = `
precision highp float;
precision highp sampler2D;

varying vec2 vUv;
uniform sampler2D u_input_txr;
uniform float u_ratio;
uniform vec3 u_point_value;
uniform vec2 u_point;
uniform float u_point_size;

void main () {
    vec2 p = vUv - u_point.xy;
    p.x *= u_ratio;
    vec3 splat = pow(2., -dot(p, p) / u_point_size) * u_point_value;
    vec3 base = texture2D(u_input_txr, vUv).xyz;
    gl_FragColor = vec4(base + splat, 1.);
}
`;

const DISPLAY_SHADER = `
precision highp float;
precision highp sampler2D;

varying vec2 vUv;
uniform sampler2D u_output_texture;

void main () {
    vec3 C = texture2D(u_output_texture, vUv).rgb;
    float a = max(C.r, max(C.g, C.b));
    vec3 background = vec3(0.0, 0.0, 0.0);
    a = pow(.1 * a, .1);
    a = clamp(a, 0., 1.);
    gl_FragColor = vec4(1. - C, 1. - a);
}
`;

const FRAGMENT_SHADERS = {
  point: POINT_SHADER,
  divergence: DIVERGENCE_SHADER,
  pressure: PRESSURE_SHADER,
  gradientSubtract: GRADIENT_SUBTRACT_SHADER,
  advection: ADVECTION_SHADER,
  display: DISPLAY_SHADER,
};

function hexToRgb(color) {
  if (!color) {
    return { r: Math.random(), g: Math.random(), b: Math.random() };
  }

  const value = color.trim().replace("#", "");
  const hex = value.length === 3
    ? value.split("").map((character) => character + character).join("")
    : value;

  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    throw new Error('primaryColor doit être une couleur hexadécimale, par exemple "#7c3aed".');
  }

  return {
    r: Number.parseInt(hex.slice(0, 2), 16) / 255,
    g: Number.parseInt(hex.slice(2, 4), 16) / 255,
    b: Number.parseInt(hex.slice(4, 6), 16) / 255,
  };
}

function interpolateColor(from, to, amount) {
  return {
    r: from.r + (to.r - from.r) * amount,
    g: from.g + (to.g - from.g) * amount,
    b: from.b + (to.b - from.b) * amount,
  };
}

function normalizePrimaryColors(primaryColor, primaryColors) {
  if (primaryColors !== undefined) {
    if (!Array.isArray(primaryColors) || primaryColors.length < 1 || primaryColors.length > 3) {
      throw new Error("primaryColors doit contenir entre 1 et 3 couleurs hexadécimales.");
    }

    const colors = primaryColors.map(hexToRgb);
    return [colors[0], colors[1] ?? colors[0], colors[2] ?? colors[0]];
  }

  const color = hexToRgb(primaryColor);
  return [color, color, color];
}

export class FluidSimulation {
  constructor(
    canvas,
    background,
    {
      primaryColor,
      primaryColors,
      hoverSize = 5,
      autoAnimation = true,
      eventTarget = canvas,
    } = {},
  ) {
    this.canvas = canvas;
    this.background = background;
    this.eventTarget = eventTarget;
    this.frameId = null;
    this.timerId = null;
    this.destroyed = false;
    this.programs = [];
    this.shaders = [];
    this.textures = [];
    this.framebuffers = [];
    this.hoverSize = Number(hoverSize);
    this.autoAnimation = Boolean(autoAnimation);
    this.primaryColors = normalizePrimaryColors(primaryColor, primaryColors);
    this.colorCycleStartedAt = performance.now();

    if (!Number.isFinite(this.hoverSize) || this.hoverSize <= 0) {
      throw new Error("hoverSize doit être un nombre strictement supérieur à 0.");
    }

    this.params = {
      SIM_RESOLUTION: 128,
      DYE_RESOLUTION: 1024,
      DENSITY_DISSIPATION: 0.995,
      VELOCITY_DISSIPATION: 0.9,
      PRESSURE_ITERATIONS: 10,
      SPLAT_RADIUS: this.hoverSize / window.innerHeight,
    };

    this.pointer = {
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      moved: false,
      firstMove: !this.autoAnimation,
    };

    this.gl = this.canvas.getContext("webgl");
    if (!this.gl) throw new Error("WebGL n’est pas disponible dans ce navigateur.");
    if (!this.gl.getExtension("OES_texture_float")) {
      throw new Error("L’extension WebGL OES_texture_float n’est pas disponible.");
    }

    this.prevTimestamp = Date.now();
    this.resize();

    this.vertexShader = this.createShader(VERTEX_SHADER, this.gl.VERTEX_SHADER);
    this.splatProgram = this.createProgram("point");
    this.divergenceProgram = this.createProgram("divergence");
    this.pressureProgram = this.createProgram("pressure");
    this.gradientSubtractProgram = this.createProgram("gradientSubtract");
    this.advectionProgram = this.createProgram("advection");
    this.displayProgram = this.createProgram("display");

    this.createBlitGeometry();
    this.initFBOs();
    this.setupEvents();

    if (this.autoAnimation) {
      this.timerId = window.setTimeout(() => {
        this.pointer.firstMove = true;
      }, 3000);
    }

    this.background.style.opacity = "1";
    this.render = this.render.bind(this);
    this.render();
  }

  resize = () => {
    this.params.SPLAT_RADIUS = this.hoverSize / window.innerHeight;
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
  };

  getPointerPosition(event) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  handleClick = (event) => {
    const position = this.getPointerPosition(event);
    this.pointer.dx = 10;
    this.pointer.dy = 10;
    this.pointer.x = position.x;
    this.pointer.y = position.y;
    this.pointer.firstMove = true;
  };

  handleMouseMove = (event) => {
    const position = this.getPointerPosition(event);
    this.pointer.moved = true;
    this.pointer.dx = 5 * (position.x - this.pointer.x);
    this.pointer.dy = 5 * (position.y - this.pointer.y);
    this.pointer.x = position.x;
    this.pointer.y = position.y;
    this.pointer.firstMove = true;
  };

  handleTouchMove = (event) => {
    event.preventDefault();
    const touch = event.targetTouches[0];
    if (!touch) return;

    const position = this.getPointerPosition(touch);
    this.pointer.moved = true;
    this.pointer.dx = 8 * (position.x - this.pointer.x);
    this.pointer.dy = 8 * (position.y - this.pointer.y);
    this.pointer.x = position.x;
    this.pointer.y = position.y;
    this.pointer.firstMove = true;
  };

  setupEvents() {
    window.addEventListener("resize", this.resize);
    this.eventTarget.addEventListener("click", this.handleClick);
    this.eventTarget.addEventListener("mousemove", this.handleMouseMove);
    this.eventTarget.addEventListener("touchmove", this.handleTouchMove, { passive: false });
  }

  createShader(sourceCode, type) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, sourceCode);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const message = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error(`Erreur de compilation du shader : ${message}`);
    }

    this.shaders.push(shader);
    return shader;
  }

  createProgram(name) {
    const fragmentShader = this.createShader(FRAGMENT_SHADERS[name], this.gl.FRAGMENT_SHADER);
    const program = this.gl.createProgram();
    this.gl.attachShader(program, this.vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.bindAttribLocation(program, 0, "aPosition");
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const message = this.gl.getProgramInfoLog(program);
      this.gl.deleteProgram(program);
      throw new Error(`Erreur d’initialisation du programme WebGL : ${message}`);
    }

    this.programs.push(program);
    return { program, uniforms: this.getUniforms(program) };
  }

  getUniforms(program) {
    const uniforms = {};
    const count = this.gl.getProgramParameter(program, this.gl.ACTIVE_UNIFORMS);

    for (let index = 0; index < count; index += 1) {
      const name = this.gl.getActiveUniform(program, index).name;
      uniforms[name] = this.gl.getUniformLocation(program, name);
    }

    return uniforms;
  }

  createBlitGeometry() {
    this.vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
      this.gl.STATIC_DRAW,
    );

    this.indexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array([0, 1, 2, 0, 2, 3]),
      this.gl.STATIC_DRAW,
    );

    this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(0);
  }

  blit(target = null) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(0);

    if (target === null) {
      this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    } else {
      this.gl.viewport(0, 0, target.width, target.height);
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, target.fbo);
    }

    this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
  }

  initFBOs() {
    const simRes = this.getResolution(this.params.SIM_RESOLUTION);
    const dyeRes = this.getResolution(this.params.DYE_RESOLUTION);

    this.outputColor = this.createDoubleFBO(dyeRes.width, dyeRes.height);
    this.velocity = this.createDoubleFBO(simRes.width, simRes.height);
    this.divergence = this.createFBO(simRes.width, simRes.height, this.gl.RGB);
    this.pressure = this.createDoubleFBO(simRes.width, simRes.height, this.gl.RGB);
  }

  getResolution(resolution) {
    let aspectRatio = this.gl.drawingBufferWidth / this.gl.drawingBufferHeight;
    if (aspectRatio < 1) aspectRatio = 1 / aspectRatio;

    const min = Math.round(resolution);
    const max = Math.round(resolution * aspectRatio);

    return this.gl.drawingBufferWidth > this.gl.drawingBufferHeight
      ? { width: max, height: min }
      : { width: min, height: max };
  }

  getCurrentPrimaryColor() {
    const duration = 15000;
    const elapsed = (performance.now() - this.colorCycleStartedAt) % (duration * 2);
    const progress = elapsed <= duration
      ? elapsed / duration
      : 2 - elapsed / duration;

    const keyframes = [
      { stop: 0, color: this.primaryColors[0] },
      { stop: 0.33, color: this.primaryColors[1] },
      { stop: 0.66, color: this.primaryColors[2] },
      { stop: 1, color: this.primaryColors[0] },
    ];

    for (let index = 0; index < keyframes.length - 1; index += 1) {
      const from = keyframes[index];
      const to = keyframes[index + 1];

      if (progress <= to.stop) {
        const amount = (progress - from.stop) / (to.stop - from.stop);
        return interpolateColor(from.color, to.color, amount);
      }
    }

    return this.primaryColors[0];
  }

  createFBO(width, height, type = this.gl.RGBA) {
    this.gl.activeTexture(this.gl.TEXTURE0);
    const texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, type, width, height, 0, type, this.gl.FLOAT, null);

    const fbo = this.gl.createFramebuffer();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fbo);
    this.gl.framebufferTexture2D(
      this.gl.FRAMEBUFFER,
      this.gl.COLOR_ATTACHMENT0,
      this.gl.TEXTURE_2D,
      texture,
      0,
    );
    this.gl.viewport(0, 0, width, height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.textures.push(texture);
    this.framebuffers.push(fbo);

    return {
      fbo,
      width,
      height,
      attach: (id) => {
        this.gl.activeTexture(this.gl.TEXTURE0 + id);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        return id;
      },
    };
  }

  createDoubleFBO(width, height, type) {
    let fbo1 = this.createFBO(width, height, type);
    let fbo2 = this.createFBO(width, height, type);

    return {
      width,
      height,
      texelSizeX: 1 / width,
      texelSizeY: 1 / height,
      read: () => fbo1,
      write: () => fbo2,
      swap: () => {
        const temporary = fbo1;
        fbo1 = fbo2;
        fbo2 = temporary;
      },
    };
  }

  render() {
    if (this.destroyed) return;

    const dt = (Date.now() - this.prevTimestamp) / 1000;
    this.prevTimestamp = Date.now();

    if (!this.pointer.firstMove) {
      this.pointer.moved = true;
      const newX = (
        0.5
        + 0.2 * Math.cos(0.006 * this.prevTimestamp) * Math.sin(0.008 * this.prevTimestamp)
      ) * this.canvas.width;
      const newY = (0.5 + 0.12 * Math.sin(0.01 * this.prevTimestamp)) * this.canvas.height;
      this.pointer.dx = 10 * (newX - this.pointer.x);
      this.pointer.dy = 10 * (newY - this.pointer.y);
      this.pointer.x = newX;
      this.pointer.y = newY;
    }

    if (this.pointer.moved) {
      this.pointer.moved = false;
      const currentPrimaryColor = this.getCurrentPrimaryColor();

      this.gl.useProgram(this.splatProgram.program);
      this.gl.uniform1i(this.splatProgram.uniforms.u_input_txr, this.velocity.read().attach(0));
      this.gl.uniform1f(this.splatProgram.uniforms.u_ratio, this.canvas.width / this.canvas.height);
      this.gl.uniform2f(
        this.splatProgram.uniforms.u_point,
        this.pointer.x / this.canvas.width,
        1 - this.pointer.y / this.canvas.height,
      );
      this.gl.uniform3f(
        this.splatProgram.uniforms.u_point_value,
        this.pointer.dx,
        -this.pointer.dy,
        1,
      );
      this.gl.uniform1f(this.splatProgram.uniforms.u_point_size, this.params.SPLAT_RADIUS);
      this.blit(this.velocity.write());
      this.velocity.swap();

      this.gl.useProgram(this.splatProgram.program);
      this.gl.uniform1i(this.splatProgram.uniforms.u_input_txr, this.outputColor.read().attach(0));
      this.gl.uniform3f(
        this.splatProgram.uniforms.u_point_value,
        1 - currentPrimaryColor.r,
        1 - currentPrimaryColor.g,
        1 - currentPrimaryColor.b,
      );
      this.blit(this.outputColor.write());
      this.outputColor.swap();
    }

    this.gl.useProgram(this.divergenceProgram.program);
    this.gl.uniform2f(
      this.divergenceProgram.uniforms.u_vertex_texel,
      this.velocity.texelSizeX,
      this.velocity.texelSizeY,
    );
    this.gl.uniform1i(
      this.divergenceProgram.uniforms.u_velocity_txr,
      this.velocity.read().attach(0),
    );
    this.blit(this.divergence);

    this.gl.useProgram(this.pressureProgram.program);
    this.gl.uniform2f(
      this.pressureProgram.uniforms.u_vertex_texel,
      this.velocity.texelSizeX,
      this.velocity.texelSizeY,
    );
    this.gl.uniform1i(
      this.pressureProgram.uniforms.u_divergence_txr,
      this.divergence.attach(0),
    );
    for (let index = 0; index < this.params.PRESSURE_ITERATIONS; index += 1) {
      this.gl.uniform1i(
        this.pressureProgram.uniforms.u_pressure_txr,
        this.pressure.read().attach(1),
      );
      this.blit(this.pressure.write());
      this.pressure.swap();
    }

    this.gl.useProgram(this.gradientSubtractProgram.program);
    this.gl.uniform2f(
      this.gradientSubtractProgram.uniforms.u_vertex_texel,
      this.velocity.texelSizeX,
      this.velocity.texelSizeY,
    );
    this.gl.uniform1i(
      this.gradientSubtractProgram.uniforms.u_pressure_txr,
      this.pressure.read().attach(0),
    );
    this.gl.uniform1i(
      this.gradientSubtractProgram.uniforms.u_velocity_txr,
      this.velocity.read().attach(1),
    );
    this.blit(this.velocity.write());
    this.velocity.swap();

    this.gl.useProgram(this.advectionProgram.program);
    this.gl.uniform2f(
      this.advectionProgram.uniforms.u_vertex_texel,
      this.velocity.texelSizeX,
      this.velocity.texelSizeY,
    );
    this.gl.uniform2f(
      this.advectionProgram.uniforms.u_output_textel,
      this.velocity.texelSizeX,
      this.velocity.texelSizeY,
    );
    this.gl.uniform1i(
      this.advectionProgram.uniforms.u_velocity_txr,
      this.velocity.read().attach(0),
    );
    this.gl.uniform1i(
      this.advectionProgram.uniforms.u_input_txr,
      this.velocity.read().attach(0),
    );
    this.gl.uniform1f(this.advectionProgram.uniforms.u_dt, dt);
    this.gl.uniform1f(
      this.advectionProgram.uniforms.u_dissipation,
      this.params.VELOCITY_DISSIPATION,
    );
    this.blit(this.velocity.write());
    this.velocity.swap();

    this.gl.uniform2f(
      this.advectionProgram.uniforms.u_output_textel,
      this.outputColor.texelSizeX,
      this.outputColor.texelSizeY,
    );
    this.gl.uniform1i(
      this.advectionProgram.uniforms.u_velocity_txr,
      this.velocity.read().attach(0),
    );
    this.gl.uniform1i(
      this.advectionProgram.uniforms.u_input_txr,
      this.outputColor.read().attach(1),
    );
    this.gl.uniform1f(
      this.advectionProgram.uniforms.u_dissipation,
      this.params.DENSITY_DISSIPATION,
    );
    this.blit(this.outputColor.write());
    this.outputColor.swap();

    this.gl.useProgram(this.displayProgram.program);
    this.gl.uniform1i(
      this.displayProgram.uniforms.u_output_texture,
      this.outputColor.read().attach(0),
    );
    this.blit();

    this.frameId = window.requestAnimationFrame(this.render);
  }

  destroy() {
    this.destroyed = true;
    window.cancelAnimationFrame(this.frameId);
    window.clearTimeout(this.timerId);
    window.removeEventListener("resize", this.resize);
    this.eventTarget.removeEventListener("click", this.handleClick);
    this.eventTarget.removeEventListener("mousemove", this.handleMouseMove);
    this.eventTarget.removeEventListener("touchmove", this.handleTouchMove);

    this.programs.forEach((program) => this.gl.deleteProgram(program));
    this.shaders.forEach((shader) => this.gl.deleteShader(shader));
    this.textures.forEach((texture) => this.gl.deleteTexture(texture));
    this.framebuffers.forEach((fbo) => this.gl.deleteFramebuffer(fbo));
    this.gl.deleteBuffer(this.vertexBuffer);
    this.gl.deleteBuffer(this.indexBuffer);
  }
}
