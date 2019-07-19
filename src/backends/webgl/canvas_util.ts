/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

// const contexts: {[key: string]: WebGLRenderingContext} = {};

// TODO(kreeger): Make this an enum
let version = 0;
let context: WebGLRenderingContext = null;

const WEBGL_ATTRIBUTES: WebGLContextAttributes = {
  alpha: false,
  antialias: false,
  premultipliedAlpha: false,
  preserveDrawingBuffer: false,
  depth: false,
  stencil: false,
  failIfMajorPerformanceCaveat: true
};

// export function setWebGLContext(
//     webGLVersion: number, gl: WebGLRenderingContext) {
//   contexts[webGLVersion] = gl;
// }

// TODO(kreeger): drop version request?
export function getWebGLContext(webGLVersion: number): WebGLRenderingContext {
  if (context !== null) {
    if (webGLVersion === version && !context.isContextLost()) {
      return context;
    }
    context = null;  // TODO(cleanup/dispose?)
  }

  // Context doesn't match requested version or has lost context:
  const gl = getWebGLRenderingContext(webGLVersion);

  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.STENCIL_TEST);
  gl.disable(gl.BLEND);
  gl.disable(gl.DITHER);
  gl.disable(gl.POLYGON_OFFSET_FILL);
  gl.disable(gl.SAMPLE_COVERAGE);
  gl.enable(gl.SCISSOR_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  context = gl;
  version = webGLVersion;
  return context;
}

export function createCanvas(webGLVersion: number) {
  if (typeof OffscreenCanvas !== 'undefined' && webGLVersion === 2) {
    return new OffscreenCanvas(300, 150);
  } else if (typeof document !== 'undefined') {
    return document.createElement('canvas');
  } else {
    throw new Error('Cannot create a canvas in this context');
  }
}

function getWebGLRenderingContext(webGLVersion: number): WebGLRenderingContext {
  if (webGLVersion !== 1 && webGLVersion !== 2) {
    throw new Error('Cannot get WebGL rendering context, WebGL is disabled.');
  }
  const canvas = createCanvas(webGLVersion);

  canvas.addEventListener('webglcontextlost', (ev: Event) => {
    ev.preventDefault();
    context = null;
    // delete contexts[webGLVersion];
  }, false);
  if (webGLVersion === 1) {
    return (canvas.getContext('webgl', WEBGL_ATTRIBUTES) ||
            canvas.getContext('experimental-webgl', WEBGL_ATTRIBUTES)) as
        WebGLRenderingContext;
  }
  return canvas.getContext('webgl2', WEBGL_ATTRIBUTES) as WebGLRenderingContext;
}
