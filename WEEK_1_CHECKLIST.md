# AgentTodo Week 1 Launch Checklist
## Execute This Week (Feb 17-23) to Launch March 4

---

## PRIORITY 1: DEMO VIDEO (Do this FIRST)
**Target:** 2-3 minute video showing AgentTodo in action
**Timeline:** 4 hours
**Impact:** Highest ROI — used everywhere (Product Hunt, Twitter, YouTube, website)

- [ ] **Write script (30 min)**
  - [ ] 15 sec: Problem (AI agents lose context, you can't see them)
  - [ ] 45 sec: Demo (show creating task, agent claiming it, completing it, real-time view)
  - [ ] 30 sec: Benefits (audit trail, human review, visibility)
  - [ ] 30 sec: CTA (GitHub stars, cloud signup)

- [ ] **Record video (1 hour)**
  - [ ] Use Loom.com (free) or QuickTime
  - [ ] Screen record with high quality (1080p)
  - [ ] Clear audio (use mic, not MacBook speaker)
  - [ ] Zoom in on dashboard for readability
  - [ ] Test: Can someone understand AgentTodo from this?

- [ ] **Edit video (30 min)**
  - [ ] Add intro/outro title cards (Loom does this auto)
  - [ ] Cut out pauses, mistakes
  - [ ] Add music (YouTube free audio library)
  - [ ] Export as MP4

- [ ] **Upload everywhere (1 hour)**
  - [ ] YouTube channel (unlisted or public)
  - [ ] Website home page
  - [ ] Product Hunt when you submit
  - [ ] Twitter (as video post)
  - [ ] Loom share link for easy embedding

- [ ] **Share link:** `_____________`

---

## PRIORITY 2: GITHUB OPTIMIZATION (Do this SECOND)
**Target:** Make GitHub repo shine for discovery + ease of use
**Timeline:** 3 hours
**Impact:** Drives organic stars + reduces friction for new users

### README Enhancements
- [ ] **Add badges to top of README**
  ```
  [![GitHub stars](https://img.shields.io/github/stars/EricStrohmaier/agenttodo?style=social)](https://github.com/EricStrohmaier/agenttodo)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9C%93-brightgreen)](https://github.com/EricStrohmaier/agenttodo)
  ```

- [ ] **Add architecture diagram** (simple ASCII or Excalidraw)
  - Show: API → Dashboard → Agent feedback loop
  - One simple PNG, 400x300px

- [ ] **Add "What problem does this solve?" section**
  - Bullet points: context loss, visibility, coordination, audit
  - Keep concise

- [ ] **Add feature grid with icons**
  - Rest API ✓
  - Real-time updates ✓
  - Audit trail ✓
  - Human review ✓
  - Self-hosted ✓
  - Cloud option ✓

- [ ] **Simplify Quick Start**
  - 3 steps max for self-hosted
  - 1 link for cloud signup
  - Add: "5 minute setup" claim

- [ ] **Add "Agent Integrations" section**
  - Links to: Claude, OpenAI, LangChain (even if just docs links)
  - "More coming soon"

- [ ] **Add demo link prominently**
  - YouTube video or GIF
  - Link to live demo (if available)

### Project Setup
- [ ] **Enable GitHub Discussions**
  - Settings → Features → Enable Discussions
  - Create categories: Help, Ideas, Show & Tell, Announcements
  - Pin welcome message

- [ ] **Add topics to repo**
  - Settings → About → Topics
  - Add: agent, ai, task-queue, automation, open-source, autonomous-agents

- [ ] **Update description (60 chars max)**
  - "Task queue for AI agents. Open source + cloud option."

- [ ] **Create CONTRIBUTING.md if not done**
  - First-time contributor instructions
  - Link to good first issues
  - Thank you message

- [ ] **Create /examples directory**
  ```
  /examples
    /claude-agent
      - README.md
      - script.js or .py
    /openai-agent
      - README.md
      - script.js or .py
    /langchain-agent
      - README.md
      - script.py
  ```
  - Time: 1 hour for 3 basic examples

- [ ] **Add issue templates**
  - Settings → Issues → Add Bug/Feature templates
  - Keeps submissions organized

---

## PRIORITY 3: LANDING PAGE / WEBSITE
**Target:** Simple, clear homepage that explains AgentTodo
**Timeline:** 4 hours
**Impact:** Converts traffic to signups + builds credibility

- [ ] **Hero Section**
  ```
  Headline: "One execution layer for autonomous agents."
  Subheadline: "Your AI agents work. You watch. Your team wins."
  CTA Buttons: [Star on GitHub] [Sign Up Free]
  ```

- [ ] **Problem Section**
  ```
  Headline: "Why AgentTodo?"
  Problems listed:
  - Agents lose context between runs
  - You can't see what they're doing
  - No way to prioritize their work
  - No audit trail for compliance
  - No human review loop
  ```

- [ ] **Solution Section**
  ```
  Features:
  - Real-time dashboard
  - REST API for agents
  - Audit trail
  - Human review built-in
  - Open source + self-hosted
  ```

- [ ] **Code Example Section**
  ```
  Show simple curl example:
  curl -X POST https://api.agenttodo.vercel.app/api/tasks \
    -H "Authorization: Bearer YOUR_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Research competitor features",
      "intent": "research",
      "priority": 4
    }'
  ```

- [ ] **Pricing Section**
  ```
  Free: $0/mo
  - 50 tasks
  - 2 API keys
  - Basic dashboard

  Pro: $4.99/mo
  - Unlimited tasks
  - Unlimited API keys
  - Advanced analytics
  - Priority support

  Self-hosted: Free
  - Full control
  - Your infrastructure
  ```

- [ ] **Get Started Section**
  ```
  Two buttons:
  [Hosted Cloud] [Self-Host Guide]
  ```

- [ ] **Footer**
  ```
  - Links to docs
  - GitHub link
  - Community Discord
  - Email signup for newsletter
  ```

- [ ] **Page Performance**
  - [ ] Test on mobile (looks good?)
  - [ ] Test links (all work?)
  - [ ] Test signup (process works?)

---

## PRIORITY 4: EMAIL LIST + WELCOME SEQUENCE
**Target:** Capture emails + deliver welcome series
**Timeline:** 2 hours
**Impact:** Retains early users, keeps engaged, drives sign ups

### Email Infrastructure
- [ ] **Choose platform** (pick one)
  - [ ] Substack (easiest, good for founders)
  - [ ] SendGrid (free tier, more flexible)
  - [ ] Beehiiv (free tier, growth tools)

- [ ] **Create landing page for signup**
  - Add to website (top of page?)
  - Headline: "Get AgentTodo updates + agent tips"
  - Button: "Join now"

### Email Sequence
- [ ] **Email 0: Welcome (Day 0)**
  ```
  Subject: Welcome to AgentTodo!
  Content:
  - Thank them for subscribing
  - What they should expect
  - Link to GitHub + cloud signup
  - Link to getting started docs
  ```

- [ ] **Email 1: Getting Started (Day 3)**
  ```
  Subject: Your first AI agent task (3 min setup)
  Content:
  - Step-by-step quick start
  - Link to docs
  - "Let me know if you have questions" (include email)
  ```

- [ ] **Email 2: Success Story (Day 7)**
  ```
  Subject: How we use AgentTodo for our team
  Content:
  - Your use case / story
  - Screenshot of dashboard
  - Call to action: Try it, share feedback
  ```

- [ ] **Email 3: New Feature or Community Highlight (Day 14)**
  ```
  Subject: New feature: [feature] OR Community spotlight: [user]
  Content:
  - Highlight something new or community member
  - Show momentum
  ```

- [ ] **Create email list CSV** (optional, for pre-launch seeding)
  - Gather 50-100 email addresses from network
  - These are your first email subscribers

---

## PRIORITY 5: SEED BLOG POSTS (3 posts minimum)
**Target:** Published, SEO-optimized blog content
**Timeline:** 6 hours
**Impact:** SEO authority + content for social + email + press

### Post 1: "We Built AgentTodo Because Our Agents Lost Context" (Launch Post)
- [ ] **Outline (20 min)**
  - Your story (why you built it)
  - The problem (agent context loss, examples)
  - The solution (AgentTodo features)
  - Get started (link to cloud, GitHub)

- [ ] **Write (1.5 hours)**
  - Target: 1500 words
  - Tone: Personal, authentic, not salesy
  - Include: Real problem examples, your experience
  - Structure: Problem → Story → Solution → CTA

- [ ] **Publish (30 min)**
  - Add to `/docs` or `/blog` directory
  - URL: `/blog/we-built-agenttodo-why`
  - Meta description (160 chars)
  - Feature image

- [ ] **Share on social**
  - Twitter thread (5-7 tweets)
  - LinkedIn post
  - Reddit r/OpenSource (only share link, not spam)

### Post 2: "Why AI Agents Lose Context (And Why It Matters)"
- [ ] **Outline (20 min)**
  - Token limits explanation
  - Context window problem
  - Real-world impact (money wasted, bugs, frustration)
  - The solution (AgentTodo)

- [ ] **Write (1.5 hours)**
  - Target: 1500 words
  - Tone: Educational, authority-building
  - Don't mention AgentTodo until end (soft sell)
  - Structure: Problem deep-dive → Real impacts → Solution

- [ ] **Publish (30 min)**
  - URL: `/blog/why-agents-lose-context`
  - Meta description
  - Include code example

### Post 3: "Quick Start: Building a Task Queue for Your First AI Agent"
- [ ] **Outline (20 min)**
  - What you'll build (simple agent that reads tasks)
  - Prerequisites (curl, any agent SDK)
  - Step-by-step instructions
  - Example code

- [ ] **Write (1.5 hours)**
  - Target: 1200 words
  - Tone: Tutorial, step-by-step
  - Include: Real code blocks, screenshots
  - Structure: Intro → Setup → Code → Test → Variations

- [ ] **Publish (30 min)**
  - URL: `/blog/quick-start-agent-task-queue`
  - Add to navigation/features
  - Include copy-paste code examples

---

## PRIORITY 6: PRE-LAUNCH OUTREACH
**Target:** Reach out to 50 key people
**Timeline:** 3 hours
**Impact:** Get 10-20 early users + feedback + launch day momentum

- [ ] **Create outreach list (50 people)**
  - [ ] Past colleagues (AI/dev focused)
  - [ ] Twitter connections with relevant interests
  - [ ] GitHub stars/followers
  - [ ] Discord connections
  - [ ] Framework maintainers (LangChain, CrewAI, etc.)

- [ ] **Create outreach email template** (Short + authentic)
  ```
  Subject: Building a task queue for AI agents — feedback?

  Hi [name],

  I just built AgentTodo (open source) — a simple REST API + dashboard
  for managing AI agent tasks. It solves a problem we had: our agents
  would lose context between runs and we had no visibility.

  Since you're interested in [agents / automation / open source],
  thought you might find it useful.

  GitHub: github.com/EricStrohmaier/agenttodo

  Would love to know if this would help you, or any feedback.

  —Eric
  ```

- [ ] **Send emails** (personalize each one)
  - [ ] Week 1: Send to 20 people (Mon-Wed)
  - [ ] Week 2: Send to 30 people (Tue-Thu)
  - [ ] Track responses in spreadsheet
  - [ ] Note: Who's interested? Who's signed up?

- [ ] **Ask for specific feedback** (in follow-up)
  - "Would this be useful for your workflow?"
  - "What would make it more valuable?"
  - "Will you try it and give feedback?"

- [ ] **Document learnings**
  - [ ] What % engage?
  - [ ] What's the common feedback?
  - [ ] Who's a good early user to highlight?

---

## PRIORITY 7: SOCIAL MEDIA SETUP
**Target:** Twitter, LinkedIn, Reddit presence established
**Timeline:** 2 hours
**Impact:** Reaches developers where they are

### Twitter
- [ ] **Update bio**
  - [ ] Include: Founder of AgentTodo, AI agent enthusiast, open source
  - [ ] Example: "Building AgentTodo. Making AI agents easier. GitHub: agenttodo.vercel.app"
  - [ ] Add link to agenttodo.vercel.app

- [ ] **Create pinned tweet**
  - Text: AgentTodo launch announcement + demo video
  - Image: Product screenshot or demo GIF
  - Links: GitHub, cloud signup, docs

- [ ] **Prepare week 1 tweet schedule** (Compose in Notepad)
  ```
  Day 1: Launch announcement + video
  Day 1 (4 hours later): Getting started guide
  Day 2: Use case story
  Day 2 (afternoon): Open source call (contribute with us)
  Day 3: Feature highlight
  Day 3 (afternoon): Community engagement (ask question)
  Day 4: Blog post announcement
  Day 4 (afternoon): Retweet early users
  Day 5: Thank you post (early supporters)
  ```

- [ ] **Follow relevant accounts**
  - [ ] @LangChainAI, @anthropic, @openai
  - [ ] AI agent developers (build list of 30+)
  - [ ] Dev tools accounts
  - [ ] Open source influencers

### LinkedIn
- [ ] **Update profile**
  - [ ] Title: "Founder @ AgentTodo"
  - [ ] Headline: "Making AI agents easier | Open source task queue"
  - [ ] Add to featured (GitHub link, website link)

- [ ] **Create launch post**
  ```
  Content: Founder story + problem we solved
  Tone: Professional but personal
  CTA: Join our community, try AgentTodo
  Include: GIF or demo screenshot
  ```

- [ ] **Build connection list** (target 50 connections)
  - [ ] Add colleagues from past jobs
  - [ ] Add founders in AI space
  - [ ] Add VCs/investors (later)

### Reddit
- [ ] **Join relevant subreddits**
  - [ ] r/agents
  - [ ] r/MachineLearning
  - [ ] r/LanguageModels
  - [ ] r/OpenSource
  - [ ] r/selfhosted
  - [ ] r/devtools

- [ ] **Create first Reddit account or verify existing**
  - [ ] Verify email
  - [ ] Set up profile

- [ ] **Plan Reddit posts** (don't spam, participate authentically)
  - [ ] Week 1: Participate in 3-4 discussions (helpful comments)
  - [ ] Week 2: "Show AgentTodo" post in r/OpenSource

- [ ] **Avoid** (Reddit hates this)
  - [ ] Posting same thing in multiple subreddits
  - [ ] Account looking like bot
  - [ ] Self-promotion in Help threads
  - [ ] Posting without participating community

---

## PRIORITY 8: PRODUCT HUNT REGISTRATION
**Target:** Product Hunt account ready + launch post prepared
**Timeline:** 2 hours
**Impact:** Largest launch day traffic source

- [ ] **Create/verify Product Hunt account**
  - [ ] Go to producthunt.com
  - [ ] Create account (use your real name/email)
  - [ ] Verify email

- [ ] **Prepare product hunt submission**
  - [ ] Product name: "AgentTodo"
  - [ ] Tagline: "One execution layer for autonomous agents" (60 chars max)
  - [ ] Description (140 chars): "Open-source task queue for AI agents with real-time dashboard, audit trail, and human review."
  - [ ] Full description (longer):
    ```
    AgentTodo is a shared task queue for humans and AI agents.

    Your agents grab work from the queue, do it, and report back. You watch
    from a real-time dashboard and make sure they don't mess up.

    Features:
    - REST API (works with Claude, GPT, LangChain, CrewAI)
    - Real-time dashboard with Kanban + list views
    - Audit trail (every action logged)
    - Human review loop built-in
    - Open source (MIT licensed)
    - Self-hosted + cloud options

    Built because we had AI agents losing context and no visibility into
    what they were doing. Turns out we weren't the only ones.
    ```

- [ ] **Prepare product images**
  - [ ] Main image: 1440x900px
    - Screenshot of dashboard
    - Or: Design showing problem → solution
  - [ ] Gallery images (3-5):
    - Dashboard Kanban view
    - Dashboard list view
    - API example
    - Real-time updates (GIF if possible)
    - Feature grid

- [ ] **Prepare 5 discussion talking points**
  - [ ] "Why we built AgentTodo" (your story)
  - [ ] "How it compares to manual task management"
  - [ ] "Integration with Claude/OpenAI agents"
  - [ ] "Why open source matters here"
  - [ ] "Self-hosted vs cloud pricing"

- [ ] **Plan launch day timing**
  - [ ] Submit to Product Hunt: Night before (Monday 11:59pm PT)
  - [ ] Or: Tuesday 12:01am PT (to catch worldwide)
  - [ ] Be online for first 8 hours (9am-5pm PT)

- [ ] **Get launch day upvote commitments**
  - [ ] Message 50 people before launch
  - [ ] Ask them to upvote first thing Tuesday
  - [ ] Target: 100 upvotes by 10am ET = trending

---

## PRIORITY 9: ANALYTICS & TRACKING SETUP
**Target:** Dashboard to track key metrics
**Timeline:** 1 hour
**Impact:** Know what's working (optimize based on data)

- [ ] **Google Analytics setup**
  - [ ] Add GA4 tracking code to website
  - [ ] Create custom dashboard for these metrics:
    - Unique visitors (daily)
    - Traffic source breakdown
    - Conversion: visitor → cloud signup
    - Pages visited (which content resonates?)

- [ ] **Create Google Sheet tracking dashboard**
  ```
  Columns: Date | GitHub Stars | Cloud Signups | Website Visitors | Twitter Followers | Discord Members
  Rows: Daily for 30 days
  Formula: Calculate week-over-week % growth
  ```
  - [ ] Set reminder: Every Sunday night, update metrics
  - [ ] Review: 5 minute ritual

- [ ] **GitHub tracking**
  - [ ] Check: Insights > Community > Traffic (stars, forks)
  - [ ] Check: Insights > Network (clone sources)
  - [ ] Document weekly in tracking sheet

- [ ] **Track signups manually**
  - [ ] Cloud dashboard shows signup count
  - [ ] Update spreadsheet daily first week
  - [ ] Note: Which source sent each signup?

- [ ] **Twitter analytics**
  - [ ] Go to Twitter Analytics dashboard (analytics.twitter.com)
  - [ ] Track: Impressions, engagements, clicks
  - [ ] Note highest-performing tweets

- [ ] **Bookmark these URLs for daily check**
  - [ ] GitHub: github.com/EricStrohmaier/agenttodo
  - [ ] Analytics: google.com/analytics
  - [ ] Cloud dashboard: your signup numbers
  - [ ] Twitter analytics: analytics.twitter.com

---

## PRIORITY 10: COMMUNITY DISCORD SERVER
**Target:** Active Discord server for users + community
**Timeline:** 1 hour
**Impact:** Central hub for feedback + support + engagement

- [ ] **Create Discord server** (free)
  - [ ] Go to discord.com
  - [ ] "Create a server"
  - [ ] Name: "AgentTodo Community"
  - [ ] Copy invite link, save it

- [ ] **Set up channels** (delete default channels first)
  ```
  #announcements — updates only
  #general — discussion
  #help — support/questions
  #integrations — show your agent integrations
  #ideas — feature requests + voting
  #showcase — what you built with AgentTodo
  #bugs — bug reports
  #selfhosted — deployment help
  ```

- [ ] **Write welcome message** (pin in #announcements)
  ```
  Welcome to AgentTodo Community! 👋

  This is where we hang out, share ideas, help each other, and build together.

  Getting started?
  - Read the docs: docs.agenttodo.vercel.app
  - Try cloud: agenttodo.vercel.app
  - Star GitHub: github.com/EricStrohmaier/agenttodo

  Questions? Ask in #help. Building something cool? Show us in #showcase.

  Let's make AI agents simpler together! 🤖
  ```

- [ ] **Set up roles** (optional, for later)
  - [ ] Contributor role (for GitHub contributors)
  - [ ] User role (for cloud users)
  - [ ] Moderator role (for helpers)

- [ ] **Invite your first members**
  - [ ] Email your network the invite link
  - [ ] Share in Twitter DMs with early users
  - [ ] Goal for week 1: 50-100 members

- [ ] **Join Discord yourself daily**
  - [ ] Answer questions within 24 hours
  - [ ] Celebrate wins ("First self-hosted setup! 🎉")
  - [ ] Learn from community feedback

---

## WEEK 1 EXECUTION TIMELINE

### Monday (Feb 17)
- [ ] Demo video (script + record): 4 hours
- [ ] GitHub optimization (README + examples): 3 hours
- [ ] Remaining: Email setup, landing page start

### Tuesday-Wednesday (Feb 18-19)
- [ ] Landing page (finish): 3 hours
- [ ] Email sequence (setup + copy): 2 hours
- [ ] Blog post 1 (write + publish): 2 hours
- [ ] Product Hunt setup: 1 hour

### Thursday-Friday (Feb 20-21)
- [ ] Blog posts 2 & 3 (write + publish): 3 hours
- [ ] Social media setup (all platforms): 2 hours
- [ ] Pre-launch outreach (emails): 2 hours
- [ ] Analytics setup: 1 hour

### Saturday-Sunday (Feb 22-23)
- [ ] Discord server setup + invites: 1 hour
- [ ] Launch preparation checklist: 30 min
- [ ] Rest + prepare for launch week

---

## LAUNCH WEEK (Feb 24 - Mar 2)

### Sunday Night Before (Feb 23)
- [ ] All systems checked
- [ ] No last-minute changes
- [ ] Get good sleep

### Monday-Tuesday (Feb 24-25)
- [ ] Send final outreach messages
- [ ] Build momentum on social
- [ ] 10 people upvoting Product Hunt ready
- [ ] Pre-launch messages queued

### Tuesday Night / Wednesday Morning (Feb 25-26)
- [ ] Product Hunt "Going live" post (optional, teaser)
- [ ] Queue launch day posts

### Wednesday-Thursday (Feb 26-27)
- [ ] Minor blog posts or Twitter content
- [ ] Gather more early supporters

### Thursday-Friday (Feb 27-28)
- [ ] Final preparation
- [ ] All links tested
- [ ] Response templates ready
- [ ] Celebrate: You're 1 week from launch

---

## DURING LAUNCH (March 4-10)

### Launch Day (Tuesday, Mar 4)
- [ ] 12:01am PT: Submit to Product Hunt
- [ ] 9:00am PT: Tweet launch announcement
- [ ] Throughout day:
  - [ ] Monitor Product Hunt every 30 min (respond to comments)
  - [ ] Monitor Twitter (engage, retweet)
  - [ ] Monitor email (questions from early users)
  - [ ] Monitor GitHub (welcome new stars/forks)
  - [ ] Monitor Discord (welcome new members)
  - [ ] Fix any bugs reported

### Day 2 (Wednesday, Mar 5)
- [ ] 11:00am ET: Post on Hacker News
- [ ] Respond to HN comments (technical depth)
- [ ] Continue Product Hunt + Twitter engagement

### Days 3-7 (Thursday-Tuesday)
- [ ] Maintain Product Hunt engagement
- [ ] Publish 1 blog post
- [ ] Publish 5+ tweets
- [ ] Respond to all community feedback
- [ ] Fix top 3 bugs reported
- [ ] Collect testimonials from happy users

---

## SUCCESS METRICS FOR WEEK 1

**By end of Day 1:**
- [ ] 200+ GitHub stars
- [ ] 10+ cloud signups
- [ ] 50+ Product Hunt upvotes
- [ ] 50+ new Twitter followers
- [ ] 100+ Discord members

**By end of Week 1:**
- [ ] 500+ GitHub stars
- [ ] 50+ cloud signups
- [ ] 300+ Product Hunt upvotes
- [ ] 200+ new Twitter followers
- [ ] 300+ Discord members
- [ ] 5+ user testimonials captured

**If not hitting these numbers:**
- Day 2: Review what's not working
- Day 3: Adjust messaging or increase outreach
- Pivot to top-performing channels only

---

## CRITICAL SUCCESS FACTORS

1. **Demo video is polished and clear** — This is your #1 conversion tool
2. **You respond to EVERY early user** — Builds community + gets feedback
3. **Blog posts are published (not perfect)** — Imperfect published beats perfect draft
4. **You personally reach out to 50 people** — Your network is gold
5. **You show up daily on Twitter** — Consistency beats perfection
6. **You celebrate wins publicly** — Momentum builds momentum

---

## IF YOU FALL BEHIND

**Absolute minimums to launch (can skip rest):**
- [ ] Demo video (MUST HAVE)
- [ ] GitHub README optimization (MUST HAVE)
- [ ] Landing page (MUST HAVE)
- [ ] Email list signup form (MUST HAVE)
- [ ] 1 blog post (MUST HAVE)
- [ ] Product Hunt profile (MUST HAVE)
- [ ] Twitter posts for launch day (MUST HAVE)

**Can delay to week 2:**
- [ ] Blog posts 2 & 3 (publish week 2 instead)
- [ ] Discord setup (launch with GitHub Discussions first)
- [ ] Analytics dashboard (track manually in spreadsheet)

---

## QUESTIONS TO ASK YOURSELF DAILY

- [ ] Did I ship something today? (even tiny)
- [ ] Did I engage with 10+ users/community members?
- [ ] Did I track metrics? (what changed this week?)
- [ ] Am I focusing on top 3 channels only?
- [ ] Are early users happy? (NPS check)

---

## YOUR COMMITMENT

Print this checklist and put it somewhere visible. This is what separates founders who launch well from founders who launch quietly.

You've got this. Ship on Tuesday.

---

**Checklist Version:** 1.0
**Last Updated:** Feb 11, 2026
**Next Review:** Feb 18, 2026
