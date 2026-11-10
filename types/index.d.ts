export type Draft = string
declare module 'claude-code' {
  interface PluginState {
    'just-draft': { latest: string | null }
  }
}
