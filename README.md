# just-draft

Edit what Claude writes for you without leaving Claude Code.

![just-draft: a draft appears in a box, /draft puts it in the prompt box, and it gets edited](assets/demo.gif)

When you ask Claude Code for an email, message, post or cover letter, the text usually sits in the reply where you can't edit it. If you copy it and paste it back into the prompt, it turns into `[Pasted text #1]`.

just-draft fixes that:

1. Claude puts the text you'll send inside a `draft` block, and the mod shows it in a box.
2. Type `/draft` and the latest draft fills your prompt box as plain, editable text, with no `[Pasted text]`.
3. Edit it, then copy it, or press Enter to send your version back to Claude.

## Use

Ask Claude for something you'll send:

```
write a short message to my landlord saying the sink is leaking
```

The message shows up in an orange draft box. Then type:

```
/draft
```

The full text is now in your prompt box. Change what you want, then copy it out, or press Enter to send it back to Claude (for example with "make it more polite" added on top).

To copy the draft without editing it, type `/draft copy`. In Warp, click "Allow clipboard writes" the first time.

If there's no draft yet, `/draft` says `No draft yet.`

## Requirements

- Claude Code with plugin hooks modules. Built and tested on 2.1.322 in the terminal (Warp and macOS Terminal).
- Other surfaces (desktop app, IDE extensions) are untested.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install just-draft --marketplace MinitJain/just-draft
```

Answer `y` to add the marketplace, then pick a scope.

From a shell:

```
claude plugin install just-draft --marketplace MinitJain/just-draft
```

In the desktop app: click + next to the prompt box, then Plugins, then Add marketplace with `MinitJain/just-draft`, then Add plugin.

## Update or remove

```
/plugin marketplace update just-draft
/plugin uninstall just-draft
```

Installed the old name `draft-box`? Run `/plugin uninstall draft-box` first, then install `just-draft`.

## Troubleshooting

- **`/draft` doesn't show up:** restart Claude Code after installing.
- **`No draft yet.`:** Claude didn't use a draft block. Ask again and say "as a draft".
- **Two `/draft` commands:** both `draft-box` and `just-draft` are installed. Uninstall `draft-box`.

## Privacy

The mod makes no network calls. It only keeps the latest draft in memory for the current session.

## Limits

- The box inside the reply is a preview. Claude Code doesn't let a mod's text box take clicks or keys there, so editing happens in the prompt box.
- `/draft` takes the most recent draft only (the last one, if a reply has two).

## Develop

`tsconfig.json` extends `.claude-plugin/types/tsconfig.json`, which Claude Code writes when it loads the mod. Load it once (`claude --plugin-dir .`), then `tsc -p .` type-checks it. Run the tests with `claude plugin test .`.

## Contributing

Issues and PRs welcome at [MinitJain/just-draft](https://github.com/MinitJain/just-draft/issues).

## License

MIT
