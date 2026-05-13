# wuld.ink Cross-Project Baton

A structured handoff document Josiah carries between project chats. Each project's Claude fills in their section, then Josiah passes the baton to the next project. By the time it returns to the wuld.ink Cowork session, it carries enough cross-project context to drive wuld.ink's information architecture, glossary curation, and content migration decisions in session B.

---

## How to use this baton

**Josiah:** Copy this file. Paste into the project chat. Say *"Fill the [Project Name] section below as the Claude working on this project. Don't modify any other project's section. Append a new project section using the same template if your project is new to the baton."*

**Receiving Claude:** Read the instructions. Fill ONLY the section for your project. Add a new section at the bottom (copy the template block) if your project isn't yet represented. Keep each section tight — aim for ~300-500 words total per project. Truncate before you over-explain. The wuld.ink Claude on the receiving end values signal density over prose.

**When baton is complete:** Josiah pastes the filled baton into the wuld.ink Cowork session at the start of session B. Cowork-side Claude ingests it as the cross-project synthesis input for IA + glossary scaffolding.

**Timing note — EFIList Argument Library section:** Do NOT fill the EFIList section before the library's current audit closes. The audit will sharpen what the library's actual sourcing state is, which directly informs the "Core canon" and "Migration verdict" answers. Premature fill = wasted entry that has to be redone. Library-Claude flagged this on 2026-05-12; fill that section last, with audit findings in hand.

---

## Per-project section template

Copy this block per project. Replace placeholders.

```markdown
### Project: [Name]

**Filled by:** [Claude in which chat / date]
**Current home:** [URL, repo, doc path — whatever exists]
**Active or dormant:** [active / dormant / archived]
**Purpose in one sentence:**

#### 1. Audience overlap with wuld.ink
[Same audience? Partial overlap? Distinct audience? One sentence.]

#### 2. Core canon — terms / concepts / named entities (5-15 items)
Candidates for the wuld.ink glossary. Mark with † if proprietary to Josiah's vocabulary (vs general philosophy terms).

- 
- 
- 

#### 3. Content artifacts catalog
Every distinct artifact this project produces or hosts — essays, posts, excerpts, tools, visualizations, pages, sections. Tag each with a migration verdict:

- `[embed]` — content should live natively under `wuld.ink/[path]`
- `[link]` — `wuld.ink` links out; canonical stays here
- `[extract]` — extract specific components/visuals into `wuld.ink`, leave the rest here
- `[mirror]` — both projects host copies; designate one as canonical
- `[skip]` — not appropriate for `wuld.ink`

Format: `- [verdict] <title> — <one-line description>`

- 
- 
- 

#### 4. Aesthetic carryover
Visual / typographic / structural decisions this project uses that should harmonize (or deliberately clash) with wuld.ink's literary-neobrutalist register.

- Typography: 
- Color palette: 
- Layout patterns: 
- Component conventions worth importing/avoiding: 

#### 5. Cross-link map
Where this project already gestures at other Josiah projects, or where it SHOULD once wuld.ink ships.

- Already references (outbound):
- Should reference once wuld.ink ships (planned outbound):
- Should receive references from wuld.ink (inbound opportunities):

#### 6. Migration verdict (summary)
Overall stance on this project's relationship to wuld.ink. One paragraph.

[embed entirely / extract components / link out / mirror / fully separate, with justification]

#### 7. One forced question
The single question that wuld.ink integration would force THIS project to answer. Examples: *"Does our naming convention conflict with wuld.ink's URL scheme?"* / *"What happens to our existing canonical URL when content moves?"* / *"Who owns the content if it's mirrored — this project or wuld.ink?"* / *"Does this project survive after wuld.ink absorbs its content, or is it sunset?"*

[Your question here.]

---
```

---

## Project sections (filled as baton travels)

<!-- Projects to cover, in priority order:
     1. EFIList Argument Library (in active update — fill first)
     2. The Book (hybrid compendium in active development)
     3. AnomicIndividual87 (handle's existing output)
     4. Evilis Anihilis Uls (handle's existing output)
     5. Any other projects Josiah identifies
-->

### Project: [Name]

**Filled by:** [Claude in which chat / date]
**Current home:** 
**Active or dormant:** 
**Purpose in one sentence:**

#### 1. Audience overlap with wuld.ink


#### 2. Core canon — terms / concepts / named entities (5-15 items)
- 

#### 3. Content artifacts catalog
- 

#### 4. Aesthetic carryover
- Typography: 
- Color palette: 
- Layout patterns: 
- Component conventions worth importing/avoiding: 

#### 5. Cross-link map
- Already references (outbound):
- Should reference once wuld.ink ships (planned outbound):
- Should receive references from wuld.ink (inbound opportunities):

#### 6. Migration verdict (summary)


#### 7. One forced question


---

## Synthesis prompt (for the wuld.ink Cowork Claude at session B start)

Once the baton returns with all sections filled, paste into wuld.ink Cowork with:

> *"Baton complete. Ingest the cross-project sections below. Synthesize into:
> (a) glossary candidate list — deduplicate canon entries across projects, mark proprietary terms;
> (b) IA recommendation — which projects embed, which link out, which extract;
> (c) cross-link map — concrete inbound/outbound links to scaffold into the IA;
> (d) one consolidated 'forced question' list — what needs to be answered before content migration can start.
> Then proceed with session B build per CLAUDE.md."*

The baton's value compounds with each project filled. Two projects = useful. All projects = a real planning artifact.
