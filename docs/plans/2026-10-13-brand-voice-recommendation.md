# Brand voice and tone: research and recommendation

**Written:** 2026-10-13, at the user's request: "do research on what other brands include in sections like this and analyze my current website, then report back with a recommendation about what to write in this section and what words to use."
**Status:** recommendation only. **The user writes the section; the agent proofreads.** Nothing here is published on the site. This section has to be finished before the branch is pushed to `portfoliowebsite`.
**Where it goes:** the Brand page (`app/portfolio/BrandProject.tsx`), after *Type System*. The Brand tile and the page's own description both already promise "voice", and there is no voice section yet.

## The short version

Write one screen, not a manual. Three parts:

1. **One sentence** that says who the voice is, as a person talking to a person.
2. **Three traits**, each written as "X, not Y", each with a rule you can check in a draft and one real line from your own site as the example.
3. **A word list**: words you use, words you avoid and what you say instead, plus a handful of mechanics you already follow.

Optional fourth part, a small tone table (how the same voice changes between a project page, the Contact page and the Mistrust series). That is where "tone" gets answered, and it is the part most personal sites skip.

Recommended traits, taken from what your site already does (evidence below): **plainspoken, not stiff**; **warm and listening, not salesy**; **dry and a little wondering, not cute**.

## 1. What other brands put in this section

| Source | Voice traits | Tone | Words | Notes |
|---|---|---|---|---|
| Mailchimp | Four, each a short rule: plainspoken, genuine, translators, dry humor | Shifts with the reader's mood: "the same voice all the time, but your tone changes"; clear beats entertaining | Plain English, active voice, no slang or jargon | The model most guides copy. Humor "when it comes naturally". |
| Monzo | Three principles: clear, warm wit, everyday magic | Per channel (app, help, marketing, social); no jokes in customer service | Swap formal words for normal ones; avoid empty adjectives and marketing cliches | Humor is "a delicate seasoning". |
| Atlassian | Three traits: bold, optimistic, practical with a wink | Per what the person is feeling (confident, confused, stressed) | Same vocabulary everywhere | Warns that the wink "isn't always appropriate". |
| Slack | Five copy principles (don't make me think, be memorable, be approachable...) | A spectrum from product copy to marketing | Language your readers use | Best copy shows at least three of five. |
| Template guides (Oppira, Khoi Pro, EazyCreatives) | Three to five traits, each with do and don't and an example | A small tone map using the four Nielsen Norman Group scales: formal to casual, serious to funny, respectful to irreverent, matter-of-fact to enthusiastic | Words to use, words to avoid with a replacement for each | "Two pages" or "one page" is the advice. Longer guides get skimmed. |
| Freelancer guides (BrandKernel, Twin-Gig, Stephen Marsh) | Found from your own writing, not picked from an adjective list | Voice stays fixed, tone moves | Three columns: I am, I say, I never say | The warning: describe the voice you have, not the one you wish you had. |

What nearly all of them agree on:

- **Voice is constant, tone changes with the situation.** Say that once, at the top.
- **Three to five traits, framed as "this, not that".** "Friendly" alone is on everyone's list. The refused overdone version ("friendly but not chummy") is what makes it yours.
- **Every trait gets a rule you can check and a real example.** A trait you cannot point to in a sentence is just an adjective.
- **A "use / avoid" word list with replacements**, not only a banned list.
- **Short.** One screen on a site, two pages in a document.

For a one-person brand, drop the parts built for teams: channel-by-channel rules (you have no social channels on the site), grammar manuals, and persona demographics.

## 2. What your site sounds like now

Read from the live copy: the About box, Contact and thanks pages, both project tiles and descriptions, the Mistrust slide text, the 12 gallery titles, the hero, the type specimen, and your longer bio (`about_me.md`).

**What is already consistent**

- **Plain on facts.** The Mistrust slides state a fact, then a number or a date: the Tuskegee study, "Black people represent only 12% of the population but bear 38% of new diagnoses". No hype. The tiles do the same: "A 30-slide Instagram series on why some communities struggle to trust doctors."
- **Warm and invitational, once.** Contact: "Tell me what you're working on and I'll get back to you as soon as I can." The Mistrust series ends: "let's start that conversation together." Your longer bio: "Every project starts with listening... I design with empathy and I deliver with precision."
- **A dry, wondering streak that only shows in your own words.** "I woke up in a world that was falling apart at the seams, with a crayon in my hand." Coffee, cozy games, "brewing coffee and conversation". The gallery titles are blunt one-or-two-word names (Gross, Chill, Beheaded, Lollipop). The display type is a handwriting face (Sriracha) over a neon spectrum on near-black, so the look is playful and a little nocturnal.
- **Mechanics you already follow:** first person "I" and "my" (never "we"); contractions in the About and Contact copy; no em dashes in your prose (they appear only in page titles, citations and type-specimen labels); exclamation marks are rare, two on the whole site (the About closing and the last Mistrust slide), never more than one per page; US spelling; Title Case section headings; sentences average about 16 words in the About box and 12 on the tiles.

**Where it drifts**

- **Two registers.** The long bio is vivid, wry and specific. The About box that actually ships is flatter and reads like a resume ("a design practice in the margins", "my true passions"). The spark did not make the cut.
- **Tile copy is impersonal.** Both tiles have no "I", no contractions and read like a catalog entry. They were drafted by the agent on 2026-10-05 and approved for release; they do not sound like the Contact page.
- **A few abstract lines.** "This philosophy drives the ultimate creation to contain clean, appealing, reusable assets that can be built on." is 20+ words with no person in it. "Feel free to reach out" and "my true passions" are filler phrases.
- **The job title moves.** "Brand & Visual Designer" (hero, page titles), "digital designer" and "traditional artist" (About), "visual graphic & brand designer" (bio). Pick one for the voice section to defend.
- **Promise and delivery.** The Brand page says "a consistent voice" in its description, and the tile says "voice", but nothing explains it yet. This section is the missing half of a promise already made.

## 3. Recommendation: what to write

Length: about 150 to 200 words on the page plus two small tables. If it needs more, cut.

### 3a. One sentence

A person, a reader, a feeling. Seed for you to rewrite in your own words:

> I sound like a collaborator who listens first, says things plainly, and keeps a little wonder in the corner of the page. After reading, you should feel heard, never sold to.

### 3b. Three traits, "X, not Y", each with a checkable rule and a line from your site

| Trait | Not | Rule you can check | Example from your own words |
|---|---|---|---|
| Plainspoken | Stiff or abstract | Say what it is first, then one detail. Prefer a verb to an abstract noun. Most sentences under 20 words. | "A 30-slide Instagram series on why some communities struggle to trust doctors." |
| Warm, and listens first | Salesy or pleading | Invite once, in the first person, and say "you" at least once. No "feel free to". | "Tell me what you're working on and I'll get back to you as soon as I can." |
| Dry, with a little wonder | Cute or loud | At most one wink per page. None on heavy subjects. No exclamation marks, with one allowed per page. | "I woke up in a world that was falling apart at the seams, with a crayon in my hand." |

### 3c. Tone table (voice stays; the dial moves)

| Where | Tone |
|---|---|
| About | Warm and personal; one wink allowed |
| Project pages and tiles | Matter-of-fact and informative; no jokes; "I" is fine |
| The Mistrust series and other heavy subjects | Sober, factual, humane; no wink at all |
| Contact and replies to clients | Friendly, specific, short; say what happens next |
| Gallery titles and captions | Blunt and a little playful |
| Alt text | Literal and plain; describe what is there |

### 3d. Words

**Use** (they are already yours): systems, reusable, built to last, character, mood, craft, clean, clear, accessible, listening, the brief, collaborate (or "work with"), "I".

**Avoid, and say instead**

| Avoid | Say instead | Why |
|---|---|---|
| passionate, "my true passions" | name the thing you do | Every portfolio says it |
| creative solutions, innovative, unique, stunning, seamless, elevate | what it does, or the plain adjective | Marketing filler |
| leverage, utilize, ultimate | use, the thing itself | Nobody talks like this |
| feel free to reach out | reach out, or email me | "Feel free" asks permission to do what you want them to do |
| we, our studio | I, my | You are one person and say so |
| three different titles on one page | Brand & Visual Designer | One name to defend |
| hedges: I try to, kind of, I hope to | say it straight | Confident without being loud |

**Mechanics** (keep doing these, write them down): first person singular; contractions yes; no em dashes in prose; at most one exclamation mark per page; US spelling; numerals for numbers; Title Case for headings, sentence case in body copy.

### 3e. Before and after, from the live site (examples only; yours to change)

| Now | Tighter |
|---|---|
| "feel free to reach out through my contact page or email below!" | "Reach out through the contact page or email me below." |
| "This philosophy drives the ultimate creation to contain clean, appealing, reusable assets that can be built on." | "I build clean, reusable assets that others can build on." |
| "building a design practice in the margins... my true passions" | keep "in the margins", name the passion |

### 3f. Leave out

Channel-by-channel guides, a grammar manual, a brand story, and persona demographics. Those belong to teams and platforms you do not run.

## 4. How it sits on the page

After *Type System*, same section header style as the others (`h4.section-title`). Voice summary sentence first, then the three trait rows in the same framed block the type specimen uses, then the tone table, then two short columns: *Use* and *Avoid*. About one screen at desktop, scrolling on a phone with no side scroll. This matches the slot already in mockup 5.

## 5. Questions before you draft

1. **Three traits as proposed**, or swap one? A fourth candidate from the evidence: *Careful with serious things*, but it works better as a tone rule than a trait.
2. **Is the dry, wondering streak something you want public?** It is the part most unlike every other portfolio, and the part that is absent from the live About.
3. **Include the "avoid" list on the page?** It is the most useful part for a client or collaborator, and the part most likely to read as preachy. A shorter list of five lands better than twelve.
4. **Section title:** "Brand voice and tone" (your words) or just "Voice".
5. **Do you want the About box brought in line afterward?** The voice section will make the gap between the long bio and the shipped About box more obvious. That is a separate pass, and yours to write.

## Sources

- Mailchimp Content Style Guide, voice and tone: <https://styleguide.mailchimp.com/voice-and-tone/>
- Monzo tone of voice: <https://monzo.com/tone-of-voice>
- Atlassian Design, voice and tone: <https://atlassian.design/foundations/content/voice-tone>
- Slack Design, five copy principles: <https://slack.design/articles/thevoiceofthebrand-5principles/>
- Oppira, brand voice guidelines template (seven sections, tone map from the Nielsen Norman Group's four scales): <https://oppira.com/guides/brand-voice-guidelines-template/>
- Khoi Pro, how to define and document a brand voice: <https://khoipro.com/brand-voice-guide-smes/>
- BrandKernel, brand voice exercise for freelancers (I am, I say, I never say): <https://brandkernel.io/blog/define-brand-voice-exercise-freelancers>
- Twin-Gig, freelance brand voice: <https://twin-gig.com/blog/freelance-brand-voice>
- Stephen Marsh, the freelancer's guide to tone of voice: <https://stephenmarshcopywriter.co.uk/blog/the-freelancers-guide-to-tone-of-voice/>
