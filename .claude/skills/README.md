# Antigravity Integration

![antigravity](https://img.shields.io/badge/Integration-antigravity-0A66C2)

This directory contains converted Claude Skills for **Antigravity**.

## Included Skills

- **175** skills generated from this repository.

## Format

Directory skill bundles: `SKILL.md` with Antigravity frontmatter (`risk`, `source`, `date_added`) plus copied `scripts/`, `references/`, `templates/` when present.

## Install

### Manual

Copy each folder from `integrations/antigravity/<skill-name>/` to `~/.gemini/antigravity/skills/<skill-name>/`.

### Script

```bash
git clone https://github.com/alirezarezvani/claude-skills.git
cd claude-skills
./scripts/install.sh --tool antigravity
```

## Verify

Run `find ~/.gemini/antigravity/skills -name "SKILL.md" | wc -l` and confirm the count, then check your Gemini/Antigravity skill list.

## Update

Re-run `./scripts/convert.sh --tool antigravity` and then reinstall with `./scripts/install.sh --tool antigravity`.

## Source Repository

- https://github.com/alirezarezvani/claude-skills
