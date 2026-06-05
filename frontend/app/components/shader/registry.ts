/**
 * GLSL preset registry for `ShaderBackground`.
 *
 * Each preset is a self-contained **WebGL1 / GLSL ES 1.00** program: a vertex
 * shader that forwards the hardcoded full-screen-quad attribute `a_position`
 * (vec2, clip space) plus a fragment shader that paints using a small set of
 * driver uniforms fed by `ShaderBackground`:
 *
 *   - `u_time`       (float)  elapsed seconds * speed   — LOOP hook
 *   - `u_resolution` (vec2)   canvas pixel size         — INIT + RESIZE hooks
 *   - `u_color`      (vec3)   theme/custom accent, 0–1  — pushed by the component
 *   - `u_intensity`  (float)  effect strength multiplier
 *
 * `@svey-xyz/simple-shader-component@1.1.1` runs on `getContext("webgl")` (no
 * `webgl2`), so shaders MUST stay GLSL ES 1.00: `attribute`/`varying`, a
 * `precision` qualifier in the fragment stage, and `gl_FragColor` output. The
 * geometry is a hardcoded quad drawn as two triangles, so `a_position` already
 * spans the viewport in clip space — we map it to UV in the fragment shader.
 *
 * Keep presets GPU-cheap (a handful of noise octaves, no loops over textures).
 * Add new presets by extending `shaderPresets` with another `{vert, frag,
 * uniforms}` entry keyed by name, then surfacing the key in the Studio
 * `background.preset` list.
 */

export type ShaderPresetUniform = {
  name: string
  type: 'float' | 'vec2' | 'vec3' | 'vec4' | 'int'
  /** Default value used until the component overrides it (e.g. u_color, u_time). */
  value: number | number[]
}

export type ShaderPreset = {
  vert: string
  frag: string
  /** Static defaults; the component appends/overrides u_time, u_resolution, u_color, u_intensity. */
  uniforms: ShaderPresetUniform[]
}

/**
 * Shared vertex shader — the geometry is a fixed full-screen quad, so every
 * preset just passes the clip-space position straight through and hands the
 * fragment stage a 0–1 UV (`v_uv`) derived from it.
 */
const fullScreenVert = /* glsl */ `
  attribute vec2 a_position;
  varying vec2 v_uv;

  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

/**
 * Preset #1 — "blob": a slow, organic gradient driven by 2D simplex noise
 * (Ashima/McGuire-style, public-domain implementation), layered into a couple
 * of fbm octaves and warped over time. Produces flowing soft blobs in the theme
 * color over a transparent-to-dark base. Cheap: ~3 noise evals per fragment.
 */
const blobFrag = /* glsl */ `
  precision highp float;

  varying vec2 v_uv;

  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec3 u_color;
  uniform float u_intensity;

  // --- Simplex 2D noise (Ian McEwan, Ashima Arts — MIT/public domain) ---
  vec3 permute(vec3 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
  }

  float snoise(vec2 v) {
    const vec4 C = vec4(
      0.211324865405187,
      0.366025403784439,
      -0.577350269189626,
      0.024390243902439
    );
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(
      0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)),
      0.0
    );
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Two-octave fractional Brownian motion for a softer, blobbier field.
  float fbm(vec2 p) {
    float v = 0.0;
    v += 0.6 * snoise(p);
    v += 0.4 * snoise(p * 2.0 + 7.3);
    return v;
  }

  void main() {
    // Aspect-correct UV centered at the origin so blobs don't stretch.
    vec2 uv = v_uv;
    float aspect = max(u_resolution.x, 1.0) / max(u_resolution.y, 1.0);
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

    // Slow domain warp: offset the sample point with another noise field.
    float t = u_time * 0.15;
    vec2 warp = vec2(
      fbm(p * 1.5 + vec2(0.0, t)),
      fbm(p * 1.5 + vec2(t, 0.0))
    );

    float n = fbm(p * 2.2 + warp * 0.8 + t * 0.5);
    // Remap noise (-1..1) → 0..1 and shape into soft blobs.
    float blob = smoothstep(-0.2, 0.9, n);

    // Strength multiplier; clamp so authors can't blow out the gradient.
    float strength = clamp(u_intensity, 0.0, 4.0);
    blob = clamp(blob * strength, 0.0, 1.0);

    // Theme color blobs fading into a near-transparent base. Alpha follows the
    // blob so edges feather out and the foreground stays readable.
    vec3 col = u_color * blob;
    float alpha = blob;

    gl_FragColor = vec4(col, alpha);
  }
`

export const shaderPresets = {
  blob: {
    vert: fullScreenVert,
    frag: blobFrag,
    // Component-driven uniforms (u_time, u_resolution, u_color, u_intensity) are
    // appended by ShaderBackground; these are inert defaults so the program
    // links and renders something sane before the first hook fires.
    uniforms: [
      {name: 'u_time', type: 'float', value: 0},
      {name: 'u_resolution', type: 'vec2', value: [1, 1]},
      {name: 'u_color', type: 'vec3', value: [1, 0.33, 0]},
      {name: 'u_intensity', type: 'float', value: 1},
    ],
  },
} satisfies Record<string, ShaderPreset>

export type ShaderPresetName = keyof typeof shaderPresets

export const defaultShaderPreset: ShaderPresetName = 'blob'

/** Narrowing helper so callers can validate an author-supplied preset string. */
export function isShaderPreset(name: string | undefined | null): name is ShaderPresetName {
  return !!name && Object.prototype.hasOwnProperty.call(shaderPresets, name)
}
