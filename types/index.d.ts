export type Draft = string
declare module 'claude-code' {
  interface PluginState {
    'draft-box': { latest: string | null }
  }
}
