import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

const latest = atom({ plugin: 'draft-box', key: 'latest' } as const, null)

// shortcut: stub parser; replaced by the user's splitDraft
function splitDraft(text: string) {
  const open = text.indexOf('```draft\n')
  if (open < 0) return null
  const close = text.indexOf('\n```', open + 9)
  if (close < 0) return null
  return { before: text.slice(0, open), draft: text.slice(open + 9, close), after: text.slice(close + 4) }
}

const RULE = `# Drafts
When you write text the user will send or post somewhere else (an email, message, reply, post, cover letter, bio), put that text alone inside a fenced block whose language is \`draft\`:

\`\`\`draft
<the text, nothing else>
\`\`\`

Keep your comments outside the fence. Use one draft block per reply. Never use it for code, commands or files.`

export const register: Register = on => {
  // Tell Claude to fence drafts, so the mod can find them.
  on('prompt.compose', async ($, e, next) => {
    const r = await next(e)
    return { sections: [...r.sections, { id: 'draft-box:rule', text: RULE, scope: 'session' as const }] }
  })

  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'draft', description: 'Put the latest draft in the prompt box to edit' })
    return next(e)
  })

  // The prompt box is the one place that always takes clicks and keys.
  on('command.run', { command: 'draft' }, async $ => {
    const draft = await read($, latest)
    if (draft === null) return { text: 'No draft yet.' }
    const r = await $.prompt.fill({ text: draft })
    return { text: r.isFilled ? 'Draft is in your prompt box.' : 'Could not fill the prompt box.' }
  })

  // Save the newest draft when a reply finishes (render hooks can't write state).
  on('classic.Stop', async ($, e, next) => {
    const parts = splitDraft(e.last_assistant_message ?? '')
    if (parts) await update($, latest, () => parts.draft)
    return next(e)
  })

  // In the reply: a read-only preview (Inputs in the reply and band never took clicks or keys live).
  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    const parts = splitDraft(e.props.text)
    if (!parts) return next(e)
    const { Box, Markdown, Text } = $.ui.resolve(e)
    return (
      <Box flexDirection="column">
        {parts.before.trim() ? <Markdown text={parts.before} /> : null}
        <Box borderStyle="round" paddingX={1} flexDirection="column">
          <Text dimColor>✎ draft · type /draft to edit it</Text>
          <Text>{parts.draft}</Text>
        </Box>
        {parts.after.trim() ? <Markdown text={parts.after} /> : null}
      </Box>
    )
  })
}
