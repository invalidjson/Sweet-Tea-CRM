import { BookOpen, Search, Users, LayoutDashboard, Star, Phone, Globe, AlertTriangle, TrendingUp, Building2, Zap, ChevronRight } from "lucide-react"

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6">
      {children}
    </section>
  )
}

function SectionHeader({ icon: Icon, title, sub }: { icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="shrink-0 w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center mt-0.5">
        <Icon size={15} className="text-primary" strokeWidth={1.75} />
      </div>
      <div>
        <h2 className="text-[13px] font-mono font-bold uppercase tracking-[0.2em] text-foreground">
          {title}
        </h2>
        <p className="text-[13px] font-mono text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

function Callout({ type, children }: { type: "tip" | "warning" | "info"; children: React.ReactNode }) {
  const styles = {
    tip: "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
    warning: "border-primary/30 bg-primary/5 text-primary",
    info: "border-border bg-muted text-muted-foreground",
  }
  return (
    <div className={`border rounded-sm px-4 py-3 text-[13px] font-mono leading-relaxed ${styles[type]}`}>
      {children}
    </div>
  )
}

function GradePill({ grade, label, color }: { grade: string; label: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-7 h-7 rounded flex items-center justify-center text-[13px] font-mono font-bold ${color}`}>
        {grade}
      </div>
      <span className="text-[13px] font-mono text-foreground">{label}</span>
    </div>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-6 h-6 rounded-sm bg-primary text-primary-foreground flex items-center justify-center text-[12px] font-mono font-bold mt-0.5">
        {n}
      </div>
      <div className="flex-1 pb-6 border-b border-border last:border-0 last:pb-0">
        <p className="text-[13px] font-mono font-bold uppercase tracking-wide text-foreground mb-1.5">{title}</p>
        <div className="text-[13px] font-mono text-muted-foreground leading-relaxed space-y-2">
          {children}
        </div>
      </div>
    </div>
  )
}

const TOC = [
  { href: "#overview", label: "Overview" },
  { href: "#dashboard", label: "Dashboard" },
  { href: "#search", label: "Lead Search" },
  { href: "#leads", label: "Lead Management" },
  { href: "#scoring", label: "Closeability Score" },
  { href: "#workflow", label: "Recommended Workflow" },
]

export default function HelpPage() {
  return (
    <div className="flex gap-0 h-full">
      {/* TOC sidebar */}
      <aside className="w-48 shrink-0 border-r border-border p-4 sticky top-0 h-full overflow-y-auto hidden lg:block">
        <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-3">On this page</p>
        <nav className="space-y-0.5">
          {TOC.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="block text-[13px] font-mono text-muted-foreground hover:text-foreground transition-colors py-1 px-2 rounded-sm hover:bg-muted"
            >
              {label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-8 space-y-12">

          {/* Hero */}
          <div className="border-b border-border pb-8">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={13} className="text-primary" />
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">User Guide</span>
            </div>
            <h1 className="text-lg font-mono font-bold uppercase tracking-wide text-foreground mb-2">
              Sweet Tea <span className="text-primary">CRM</span>
            </h1>
            <p className="text-[14px] font-mono text-muted-foreground leading-relaxed max-w-lg">
              A focused lead generation tool for web agency sales. Find local businesses that need a website, score them automatically, and work your pipeline — all in one place.
            </p>
          </div>

          {/* Overview */}
          <Section id="overview">
            <SectionHeader icon={Zap} title="Overview" sub="What Sweet Tea CRM does and how it fits your workflow" />
            <div className="space-y-4 text-[13px] font-mono text-muted-foreground leading-relaxed">
              <p>
                Sweet Tea CRM is built around one idea: <span className="text-foreground font-medium">the best lead for a web agency is a local business with no website, a phone number, and happy customers.</span> The app helps you find these businesses, score them, and track your outreach.
              </p>
              <p>
                The three core modules work together in sequence:
              </p>
              <div className="grid gap-3 mt-2">
                {[
                  { icon: Search, title: "Search", desc: "Find businesses by type and location. Results are scored automatically." },
                  { icon: Users, title: "Leads", desc: "Save promising results and move them through your sales pipeline." },
                  { icon: LayoutDashboard, title: "Dashboard", desc: "Monitor pipeline health, follow-ups due, and recent activity at a glance." },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-3 border border-border rounded-sm p-3">
                    <Icon size={13} className="text-primary shrink-0 mt-0.5" strokeWidth={1.75} />
                    <div>
                      <span className="text-[13px] font-mono font-bold uppercase tracking-wide text-foreground">{title}</span>
                      <span className="text-muted-foreground"> — {desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Dashboard */}
          <Section id="dashboard">
            <SectionHeader icon={LayoutDashboard} title="Dashboard" sub="Your pipeline at a glance" />
            <div className="space-y-4 text-[13px] font-mono text-muted-foreground leading-relaxed">
              <p>The dashboard is your home base. It surfaces the numbers that matter most so you can start each day knowing exactly where to focus.</p>

              <div className="space-y-3">
                <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground/60">Stat tiles</p>
                {[
                  { stat: "Total Saved", desc: "How many leads you've saved from searches." },
                  { stat: "New This Week", desc: "Leads added in the last 7 days — momentum indicator." },
                  { stat: "No Website", desc: "Saved leads with no web presence. These are your highest-priority targets." },
                  { stat: "Follow-ups Due", desc: "Leads with a follow-up date today or overdue. Work these first." },
                  { stat: "Active Pipeline", desc: "Leads in Contacted, Follow-up, or Interested status." },
                  { stat: "Won This Month", desc: "Closed deals in the past 30 days." },
                ].map(({ stat, desc }) => (
                  <div key={stat} className="flex gap-3">
                    <ChevronRight size={11} className="text-primary shrink-0 mt-0.5" />
                    <p><span className="text-foreground font-medium">{stat}</span> — {desc}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground/60">Other panels</p>
                <p><span className="text-foreground font-medium">Top Leads</span> — your five highest-scoring active leads. Click any to open the detail sheet.</p>
                <p><span className="text-foreground font-medium">Leads by Status</span> — a breakdown of how many leads are in each stage of your pipeline.</p>
                <p><span className="text-foreground font-medium">Recent Activity</span> — a feed of the last 8 events (saves and contact log entries) across all leads.</p>
              </div>
            </div>
          </Section>

          {/* Search */}
          <Section id="search">
            <SectionHeader icon={Search} title="Lead Search" sub="Find new businesses to pitch" />
            <div className="space-y-5 text-[13px] font-mono text-muted-foreground leading-relaxed">
              <p>The search page lets you find businesses by type and location. Each result is scored automatically so you know which ones are worth pursuing before you even dial.</p>

              <div className="space-y-4">
                <Step n={1} title="Enter a search">
                  <p>Type a <span className="text-foreground">business type</span> (e.g. "HVAC", "plumber", "roofing contractor"), a <span className="text-foreground">city</span>, and a <span className="text-foreground">state</span>. Hit Search.</p>
                  <Callout type="tip">Be specific with business type — "auto repair" works better than "car". Trades and local service businesses score highest.</Callout>
                </Step>
                <Step n={2} title="Review scored results">
                  <p>Results appear as cards in a 4-column grid. Each card shows contact info, an <span className="text-foreground">A–F grade badge</span>, and a score bar. Sort by score (default) to see your best opportunities first.</p>
                  <p>The <span className="text-foreground text-primary font-medium">no website</span> tag means the business has zero online presence — a prime candidate.</p>
                </Step>
                <Step n={3} title="Filter to your criteria">
                  <p>Use the filter bar to narrow by:</p>
                  <ul className="space-y-1 list-disc list-inside pl-2">
                    <li><span className="text-foreground">No Website</span> — businesses with no web presence</li>
                    <li><span className="text-foreground">Has Phone</span> — directly callable leads</li>
                    <li><span className="text-foreground">Has Email</span> — reachable via email</li>
                    <li><span className="text-foreground">Unsaved</span> — hide leads you've already saved</li>
                  </ul>
                </Step>
                <Step n={4} title="Save the best ones">
                  <p>Click <span className="text-foreground font-medium">Save</span> on any card to add it to your Leads pipeline. The button turns to "Saved" so you don't accidentally duplicate.</p>
                </Step>
              </div>
            </div>
          </Section>

          {/* Leads */}
          <Section id="leads">
            <SectionHeader icon={Users} title="Lead Management" sub="Work your pipeline" />
            <div className="space-y-5 text-[13px] font-mono text-muted-foreground leading-relaxed">
              <p>The Leads page is where saved leads live. Track status, log contact attempts, add notes, and move leads through your pipeline until they close — or don't.</p>

              <div className="space-y-3">
                <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground/60">Status stages</p>
                {[
                  { status: "NEW", desc: "Just saved. Not yet contacted." },
                  { status: "SAVED", desc: "Saved and reviewed but outreach not started yet." },
                  { status: "CONTACTED", desc: "You've reached out at least once." },
                  { status: "FOLLOW UP", desc: "You have a callback or follow-up date set." },
                  { status: "INTERESTED", desc: "They expressed interest. Move fast." },
                  { status: "NOT INTERESTED", desc: "They passed. Archive and move on." },
                  { status: "WON", desc: "Closed. Congratulations." },
                  { status: "LOST", desc: "Deal fell through after interest." },
                ].map(({ status, desc }) => (
                  <div key={status} className="flex gap-3">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-primary shrink-0 mt-0.5 w-24">{status}</span>
                    <span>{desc}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground/60">Lead detail sheet</p>
                <p>Click any lead card (or the name) to open the detail panel on the right. From here you can:</p>
                <ul className="space-y-1 list-disc list-inside pl-2">
                  <li>Call, email, or visit the website directly via quick-action buttons</li>
                  <li>Add notes — anything useful about the business or owner</li>
                  <li>Log contact events (call, email, SMS, meeting) with outcome notes</li>
                  <li>See the full contact history sorted newest-first</li>
                </ul>
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground/60">Filters</p>
                <p>Use the filter bar to narrow by status, no website, or sort by score, name, or follow-up date.</p>
                <Callout type="warning">
                  Leads with a follow-up date due today appear in orange on the dashboard. Check Follow-ups Due every morning.
                </Callout>
              </div>
            </div>
          </Section>

          {/* Scoring */}
          <Section id="scoring">
            <SectionHeader icon={Star} title="Closeability Score" sub="How leads are ranked A through F" />
            <div className="space-y-5 text-[13px] font-mono text-muted-foreground leading-relaxed">
              <p>
                Every lead gets a score from <span className="text-foreground font-medium">0–100</span> and a letter grade. The score answers one question: <span className="text-foreground font-medium">how likely is this business to need and buy a website from you?</span>
              </p>

              {/* Grade pills */}
              <div className="border border-border rounded-sm p-4 space-y-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Grade thresholds</p>
                <GradePill grade="A" label="80–100 · Hot lead — pursue immediately" color="bg-emerald-500 text-white" />
                <GradePill grade="B" label="65–79 · Strong lead — worth a call" color="bg-primary text-primary-foreground" />
                <GradePill grade="C" label="45–64 · Possible lead — situational" color="bg-amber-400 text-amber-950" />
                <GradePill grade="D" label="25–44 · Weak lead — low priority" color="bg-orange-300 text-orange-950" />
                <GradePill grade="F" label="0–24 · Poor fit — skip" color="bg-muted text-muted-foreground" />
              </div>

              <div className="space-y-4 pt-2">
                <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground/60">What the score measures</p>
                <p>Seven signals are combined, each weighted by how strongly they predict a sale:</p>

                {[
                  { icon: Globe, label: "Website Pain (30%)", desc: "No website scores highest. A broken, slow, or outdated site also scores well. A modern, fast site scores low — they probably won't buy." },
                  { icon: TrendingUp, label: "Digital Presence (20%)", desc: "Missing from social media, no Google photos, no business hours listed — all signal a business that's behind online." },
                  { icon: Star, label: "Activity (15%)", desc: "Google review count and rating. Active businesses with good ratings have real customers to refer and can afford the service." },
                  { icon: Building2, label: "Industry Fit (10%)", desc: "Trades (HVAC, plumbing, roofing), salons, dentists, restaurants — these buy websites. Software companies and government agencies don't." },
                  { icon: TrendingUp, label: "Revenue Proxy (10%)", desc: "Higher review counts, mid-to-premium price points, and 2–5 locations suggest a business that can afford $100–200/month." },
                  { icon: Phone, label: "Reachability (10%)", desc: "Phone is the best outreach channel for cold calls to local businesses. Email and contact forms add options. No contact methods = can't pursue." },
                  { icon: AlertTriangle, label: "Competition (5%)", desc: "Lots of nearby competitors with better websites means the business is already feeling the pressure. They're more motivated to act." },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex gap-3">
                    <Icon size={13} className="text-primary shrink-0 mt-0.5" strokeWidth={1.75} />
                    <div>
                      <span className="text-foreground font-medium">{label}</span>
                      <p className="mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground/60">Score penalties</p>
                <p>Some signals can tank an otherwise decent score. These are hard disqualifiers:</p>
                <ul className="space-y-1 list-disc list-inside pl-2">
                  <li><span className="text-foreground">Franchise</span> — the local manager can't approve purchases. Skip or find the corporate contact.</li>
                  <li><span className="text-foreground">Permanently closed</span> — no longer a viable business.</li>
                  <li><span className="text-foreground">Modern locked platform</span> — recently redesigned on Squarespace/Wix/Webflow. Low probability of switching.</li>
                  <li><span className="text-foreground">No contact methods</span> — completely unreachable.</li>
                  <li><span className="text-foreground">Wrong industry</span> — hospitals, software companies, government — they don't buy what you sell.</li>
                </ul>
              </div>

              <Callout type="info">
                The score is a prioritization tool, not a guarantee. A B-grade lead you can reach by phone is almost always better than an A-grade lead with no contact info. Trust your judgment — the score just does the triage.
              </Callout>
            </div>
          </Section>

          {/* Workflow */}
          <Section id="workflow">
            <SectionHeader icon={Zap} title="Recommended Workflow" sub="How to get the most out of Sweet Tea CRM" />
            <div className="space-y-4 text-[13px] font-mono text-muted-foreground leading-relaxed">
              <div className="space-y-4">
                <Step n={1} title="Search a new market (weekly)">
                  <p>Pick a trade category and a city. Run the search, filter to "No Website + Has Phone", sort by score descending. Save every B+ lead that's reachable.</p>
                </Step>
                <Step n={2} title="Work follow-ups first (daily)">
                  <p>Open the Dashboard. Check Follow-ups Due. Call every one of those leads before you do anything else. These are warm — don't let them go cold.</p>
                </Step>
                <Step n={3} title="Cold call your new leads (daily)">
                  <p>Go to Leads, filter by NEW status. Call down the list in score order. Log every attempt — even "no answer" — so you know where you left off.</p>
                </Step>
                <Step n={4} title="Log everything">
                  <p>After every call or email, open the lead and log the contact event with an outcome note. This keeps your follow-up dates accurate and gives you context when you call back.</p>
                  <Callout type="tip">Note the owner's name, best time to call, and anything personal they mentioned. Local business owners remember who listened.</Callout>
                </Step>
                <Step n={5} title="Move leads through status">
                  <p>Don't leave leads stuck in CONTACTED for weeks. If they're not responding after 3 attempts, mark them NOT_INTERESTED and move on. Pipeline hygiene keeps your metrics honest.</p>
                </Step>
              </div>
            </div>
          </Section>

        </div>
      </div>
    </div>
  )
}
