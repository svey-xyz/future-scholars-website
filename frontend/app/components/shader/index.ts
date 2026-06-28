// Export the lazy wrapper as `ShaderBackground` so every consumer code-splits
// the WebGL runtime. Importing the eager component here would re-create a
// static graph edge and pull the lib back into the initial bundle.
export {default as ShaderBackground} from './ShaderBackgroundLazy'
export * from './registry'
