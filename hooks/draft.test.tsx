import { expect, test } from 'claude-code/testing'

test('a draft previews in the reply and /draft fills the prompt', async ($, on) => {
  on('classic.Stop', () => ({}))
  on('command.register', () => ({ value: { command: 'draft' } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  let filled = ''
  on('prompt.fill', (_, e: any) => { filled = e.text; return { isFilled: true, text: e.text, cursor: 0 } as any })
  on('ui.render', ($, e) => { const { Text } = $.ui.resolve(e); return <Text>engine</Text> })

  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true } as any)
  const msg = await $.ui.mount({
    plugin: 'draft-box', surface: 'terminal', component: 'AssistantMessage',
    props: { text: 'Here:\n\n```draft\nHi Sam,\nThursday?\n```\n\nDone.', isFirstOfReply: true },
  } as any)
  expect(await msg.find({ type: 'Text', text: /Hi Sam/ })).toBeTruthy()
  await msg.unmount()

  await $.classic.Stop({ last_assistant_message: 'Here:\n\n```draft\nHi Sam,\nThursday?\n```\n' } as any)
  await ($ as any).command.run({ command: 'draft', args: '' })
  expect(filled).toBe('Hi Sam,\nThursday?')
})

test('the rule is added to the system prompt', async ($, on) => {
  on('prompt.compose', () => ({ sections: [{ id: 'intro', text: 'hi', scope: 'shared' }] }) as any)
  const r: any = await ($ as any).prompt.compose({ traits: [], model: 'claude-opus-5-5', promptModel: 'claude-opus-5-5', outputStyle: null, tools: [], surfaces: ['terminal'] })
  expect(r.sections.at(-1).id).toBe('draft-box:rule')
})

test('/draft takes the last of two drafts, and an unclosed fence is no draft', async ($, on) => {
  on('classic.Stop', () => ({}))
  on('command.register', () => ({ value: { command: 'draft' } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  let filled = ''
  on('prompt.fill', (_, e: any) => { filled = e.text; return { isFilled: true, text: e.text, cursor: 0 } as any })
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true } as any)

  await $.classic.Stop({ last_assistant_message: '```draft\nfirst\n```\nor\n```draft\nsecond\n```' } as any)
  await ($ as any).command.run({ command: 'draft', args: '' })
  expect(filled).toBe('second')

  await $.classic.Stop({ last_assistant_message: '```draft\nclosed\n```\nthen\n```draft\nnever closed' } as any)
  await ($ as any).command.run({ command: 'draft', args: '' })
  expect(filled).toBe('closed')

  await $.classic.Stop({ last_assistant_message: '```draft\nnever closed' } as any)
  await ($ as any).command.run({ command: 'draft', args: '' })
  expect(filled).toBe('closed')
})
