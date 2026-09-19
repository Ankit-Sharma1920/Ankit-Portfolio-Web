import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BarChart3,
  BrainCircuit,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleAlert,
  Code2,
  Database,
  ExternalLink,
  FileDown,
  Github,
  GraduationCap,
  Linkedin,
  Menu,
  MessageCircle,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import portraitAsset from "@/assets/ankit-portrait.jpg.asset.json";

const GITHUB_USERNAME = "Ankit-sharma1920";
const GITHUB_URL = `https://github.com/${GITHUB_USERNAME}`;
const LINKEDIN_URL = "https://www.linkedin.com/in/ankit-sharma1920/";
const RESUME_URL = "/resume/Ankit-Sharma-Resume.pdf";
// Free Web3Forms access key (public, safe for client-side use).
// Get one at https://web3forms.com with ankit936928@gmail.com — messages then land in that inbox.
const WEB3FORMS_ACCESS_KEY = "8c1845a1-7527-4323-9551-f565ebc01813";

type GithubRepo = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
};

type SectionId = "home" | "about" | "skills" | "education" | "certifications" | "projects" | "github" | "contact";

const navItems: Array<{ id: SectionId; label: string }> = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
  { id: "certifications", label: "Certifications" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

const certificates = [
  { title: "Data Analytics with AI Tools", detail: "40 Days Training Program", issuer: "SKDeft / Dayanand Academy of Management Studies", date: "June 2026" },
  { title: "Python", detail: "40 Days Training Program", issuer: "Dayanand Academy of Management Studies", date: "July 2025" },
  { title: "Database Management System", detail: "Project Training", issuer: "SKDeft", date: "Details available on request" },
  { title: "Getting Started with Cybersecurity", detail: "", issuer: "IBM SkillsBuild", date: "June 2026", url: "https://www.credly.com/badges/093cf9d9-9cae-4ce3-8a28-2e0f82907114" },
  { title: "Digital Marketing", detail: "", issuer: "Adobe / Coursera", date: "January 2026", url: "https://coursera.org/verify/YY4S59SJPHF5" },
  { title: "Cyber Security & Ethical Hacking", detail: "2 Days Workshop", issuer: "SKDeft", date: "September 2025" },
  { title: "Communication Skills", detail: "", issuer: "TCS iON", date: "September 2026" },
];

const skillGroups = [
  { title: "Programming", icon: Code2, accent: "brand", items: ["Python", "Java", "C"] },
  { title: "Data & Database", icon: Database, accent: "brand-strong", items: ["SQL", "Database Management", "Data Analysis", "Microsoft Excel"] },
  { title: "Tools", icon: BriefcaseBusiness, accent: "cyan", items: ["Git", "GitHub", "Microsoft Word", "Microsoft PowerPoint"] },
  { title: "Other", icon: BrainCircuit, accent: "success", items: ["Problem Solving", "Presentation Skills", "Cybersecurity"] },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ankit Sharma | BCA Student & Aspiring Data Analyst" },
      { name: "description", content: "Ankit Sharma — BCA student and aspiring Data Analyst interested in Python, SQL, Data Analytics, Database Management and technology." },
      { property: "og:title", content: "Ankit Sharma | BCA Student & Aspiring Data Analyst" },
      { property: "og:description", content: "A BCA student building with Python, SQL, data and practical software projects." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const [activeSection, setActiveSection] = useState<SectionId>("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [githubState, setGithubState] = useState<"loading" | "ready" | "error" | "empty">("loading");
  const [resumeAvailable, setResumeAvailable] = useState(false);
  const sectionRefs = useRef<Record<SectionId, HTMLElement | null>>({
    home: null,
    about: null,
    skills: null,
    education: null,
    certifications: null,
    projects: null,
    github: null,
    contact: null,
  });

  useEffect(() => {
    const observers = navItems.map(({ id }) => {
      const element = sectionRefs.current[id];
      if (!element) return null;
      const observer = new IntersectionObserver(([entry]) => {
        if (entry?.isIntersecting) setActiveSection(id);
      }, { rootMargin: "-30% 0px -55% 0px", threshold: 0 });
      observer.observe(element);
      return observer;
    });
    return () => observers.forEach((observer) => observer?.disconnect());
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`, { signal: controller.signal, headers: { Accept: "application/vnd.github+json" } })
      .then((response) => {
        if (!response.ok) throw new Error("GitHub request failed");
        return response.json() as Promise<GithubRepo[]>;
      })
      .then((data) => {
        const nextRepos = data.filter((repo) => !repo.name.startsWith("."));
        setRepos(nextRepos);
        setGithubState(nextRepos.length > 0 ? "ready" : "empty");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setGithubState("error");
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    fetch(RESUME_URL, { method: "HEAD" }).then((response) => setResumeAvailable(response.ok)).catch(() => setResumeAvailable(false));
  }, []);

  const setSectionRef = (id: SectionId) => (element: HTMLElement | null) => {
    sectionRefs.current[id] = element;
  };

  const navigateTo = (id: SectionId) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-ink text-foreground antialiased">
      <div className="pointer-events-none fixed inset-0 z-0 grid-backdrop opacity-60" />
      <div className="pointer-events-none fixed -top-40 left-1/2 z-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-brand/20 blur-[130px]" />
      <div className="pointer-events-none fixed right-[-10rem] top-1/3 z-0 h-[360px] w-[360px] rounded-full bg-brand-strong/15 blur-[120px]" />

      <header className="sticky top-0 z-50 border-b border-line bg-ink/75 backdrop-blur-xl">
        <nav className="mx-auto grid h-16 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 sm:flex sm:justify-between">
          <button type="button" onClick={() => navigateTo("home")} className="flex min-w-0 items-center gap-2 text-left font-mono text-lg font-semibold tracking-tight" aria-label="Go to home">
            <span className="grid size-8 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-brand to-brand-strong ring-1 ring-line"><img src={portraitAsset.url} alt="Ankit Sharma" className="size-full object-cover" loading="lazy" /></span>
            <span className="hidden truncate text-foreground/80 sm:inline">Ankit<span className="text-brand"></span></span>
          </button>
          <div className="hidden items-center gap-1 text-sm text-foreground/60 md:flex">
            {navItems.map((item) => (
              <button key={item.id} type="button" onClick={() => navigateTo(item.id)} className={cn("rounded-lg px-3 py-2 transition-colors hover:text-foreground", activeSection === item.id && "text-foreground")}>{item.label}</button>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button asChild className="hidden rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 md:inline-flex"><a href="#contact">Let's Connect</a></Button>
            <Button type="button" variant="outline" size="icon" className="border-line bg-transparent text-foreground/70 hover:bg-secondary hover:text-foreground md:hidden" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? "Close menu" : "Open menu"}>{menuOpen ? <X /> : <Menu />}</Button>
          </div>
        </nav>
        {menuOpen && <div id="mobile-menu" className="border-t border-line bg-ink/95 px-5 py-3 backdrop-blur-xl md:hidden"><div className="mx-auto grid max-w-7xl gap-1">{navItems.map((item) => <button key={item.id} type="button" onClick={() => navigateTo(item.id)} className={cn("rounded-lg px-3 py-3 text-left text-sm text-foreground/70 hover:bg-secondary hover:text-foreground", activeSection === item.id && "bg-secondary text-foreground")}>{item.label}</button>)}</div></div>}
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-5">
        <section ref={setSectionRef("home")} id="home" className="grid scroll-mt-20 items-center gap-12 pb-20 pt-16 lg:grid-cols-2 lg:pt-24">
          <div className="reveal-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/5 px-3 py-1.5 font-mono text-xs text-cyan"><span className="size-1.5 animate-pulse rounded-full bg-cyan" /> Based in Kanpur, India</div>
            <h1 className="text-balance text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl">Hi, I'm <span className="animate-shimmer bg-gradient-to-r from-brand via-brand-strong to-brand bg-clip-text text-transparent">Ankit Sharma</span><span className="text-foreground/40">.</span></h1>
            <p className="mt-5 text-lg font-semibold text-foreground/90">BCA Student | Aspiring Data Analyst</p>
            <p className="mt-1.5 max-w-xl text-pretty text-base leading-relaxed text-foreground/60">Turning curiosity in data and code into practical, working projects.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3"><Button asChild className="rounded-xl bg-gradient-to-r from-brand to-brand-strong px-5 py-3 font-semibold text-primary-foreground shadow-lg shadow-brand/30 hover:brightness-110"><a href="#projects">View Projects <ArrowDownRight /></a></Button><Button asChild variant="outline" className="glass-panel rounded-xl border-line px-5 py-3 font-medium text-foreground hover:border-brand/40 hover:bg-secondary"><a href="#contact">Let's Connect</a></Button></div>
            <div className="mt-8 flex items-center gap-3"><SocialIcon href={GITHUB_URL} label="GitHub" icon={<Github />} /><SocialIcon href={LINKEDIN_URL} label="LinkedIn" icon={<Linkedin />} /><span className="ml-1 text-xs text-foreground/40">@{GITHUB_USERNAME}</span></div>
          </div>
          <HeroVisual />
        </section>

<section ref={setSectionRef("about")} id="about" className="scroll-mt-20 py-16"><SectionHeading number="01" title="About Me" /><div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]"><div className="glass-panel rounded-2xl border border-line p-6"><p className="max-w-2xl text-lg leading-relaxed text-foreground/70">I'm a BCA student with a strong interest in Data Analytics, Programming, and Database Management. I enjoy turning what I learn into practical projects and continuously improving my technical and problem-solving skills.</p><div className="mt-8 grid gap-4 sm:grid-cols-2"><InfoItem icon={<GraduationCap />} title="BCA Student" detail="Dayanand Academy of Management Studies, Kanpur" /><InfoItem icon={<BarChart3 />} title="Data Analytics" detail="Interested in practical analysis and working with data" /><InfoItem icon={<Code2 />} title="Programming" detail="Python, C, Java " /><InfoItem icon={<ShieldCheck />} title="Cybersecurity" detail="Exploring cybersecurity and technology" /></div></div><div className="glass-panel rounded-2xl border border-line p-6"><p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan">Current direction</p><div className="mt-7 space-y-5"><DirectionItem label="Learning" value="Java · SQL · Analysis" /><DirectionItem label="Building" value="Practical software projects" /><DirectionItem label="Improving" value="Technical & problem-solving skills" /></div><div className="mt-8 border-t border-line pt-5"><p className="text-sm text-foreground/50">Also curious about</p><div className="mt-3 flex flex-wrap gap-2"><Tag>Psychology</Tag><Tag>Human Behavior</Tag><Tag>Technology</Tag></div></div></div></div></section>

        <section ref={setSectionRef("skills")} id="skills" className="scroll-mt-20 py-16"><SectionHeading number="02" title="Skills" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{skillGroups.map((group) => <SkillCard key={group.title} {...group} />)}</div></section>

        <section ref={setSectionRef("education")} id="education" className="scroll-mt-20 py-16"><SectionHeading number="03" title="Education" /><div className="relative pl-8"><div className="absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-brand via-brand-strong to-transparent" /><span className="absolute -left-0.5 top-2 size-3.5 rounded-full bg-brand ring-4 ring-brand/20" /><div className="glass-panel rounded-2xl border border-line p-6"><div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"><h3 className="min-w-0 text-xl font-semibold">Bachelor of Computer Applications (BCA)</h3><span className="w-fit rounded-md border border-brand/20 bg-brand/10 px-2.5 py-1 font-mono text-xs text-brand">Expected 2027</span></div><p className="mt-2 text-foreground/60">Dayanand Academy of Management Studies, Kanpur</p><p className="text-sm text-foreground/40">Affiliated to Chhatrapati Shahu Ji Maharaj University (CSJMU)</p></div></div></section>

        <section ref={setSectionRef("certifications")} id="certifications" className="scroll-mt-20 py-16"><SectionHeading number="04" title="Certifications" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{certificates.map((certificate) => <CertificateCard key={certificate.title} {...certificate} />)}</div></section>

        <section ref={setSectionRef("projects")} id="projects" className="scroll-mt-20 py-16"><SectionHeading number="05" title="Projects" /><div className="grid gap-4 md:grid-cols-2"><article className="group relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-brand/10 via-transparent to-brand-strong/10 p-6 transition-colors hover:border-brand/50"><div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-brand to-transparent opacity-50 transition-opacity group-hover:opacity-100" /><div className="mb-6 flex items-start justify-between gap-4"><div className="grid size-12 shrink-0 place-items-center rounded-xl border border-brand/20 bg-gradient-to-br from-brand/20 to-brand-strong/20 text-brand"><Database /></div><Tag>Python</Tag></div><h3 className="text-xl font-semibold">Student Database Management System</h3><p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/55">A practical application designed to add, update, search and manage student records efficiently.</p><div className="mt-6 flex items-center gap-3"><Button asChild variant="outline" size="sm" className="border-line bg-transparent text-foreground hover:border-brand/40 hover:bg-secondary"><a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub <ArrowUpRight /></a></Button><span className="font-mono text-xs text-foreground/30">Live demo not provided</span></div></article><div className="grid place-items-center rounded-2xl border border-dashed border-line p-6 text-center"><div><div className="mx-auto mb-3 grid size-12 place-items-center rounded-xl bg-secondary text-foreground/40"><Plus /></div><p className="font-semibold">More Projects Coming Soon</p><p className="mt-1 text-sm text-foreground/45">Built with Python, SQL & data tooling.</p></div></div></div></section>

         <section ref={setSectionRef("contact")} id="contact" className="scroll-mt-20 py-16"><SectionHeading number="07" title="Let's Connect" /><div className="grid gap-8 rounded-2xl border border-line bg-gradient-to-br from-brand/10 via-transparent to-brand-strong/10 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr]"><div><p className="max-w-xl text-lg leading-relaxed text-foreground/70">I'm always interested in learning, collaborating and connecting with people in technology and data.</p><div className="mt-6 flex flex-wrap gap-3"><Button asChild className="rounded-xl bg-brand px-4 py-2.5 text-primary-foreground hover:bg-brand/90"><a href={LINKEDIN_URL} target="_blank" rel="noreferrer">Connect on LinkedIn <ArrowUpRight /></a></Button><Button asChild className="rounded-xl bg-foreground px-4 py-2.5 text-background hover:bg-foreground/90"><a href={GITHUB_URL} target="_blank" rel="noreferrer"><Github /> GitHub <ArrowUpRight /></a></Button><span className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-xs text-foreground/55"><MessageCircle /> ankit936928@gmail.com</span></div><div className="mt-8 border-t border-line pt-5"><p className="text-sm text-foreground/45">Resume</p>{resumeAvailable ? <Button asChild variant="outline" className="mt-3 border-line bg-transparent text-foreground hover:border-cyan"><a href={RESUME_URL} download>Download Resume <FileDown /></a></Button> : <Button type="button" variant="outline" disabled className="mt-3 border-line text-foreground/40"><FileDown /> Resume coming soon</Button>}<p className="mt-3 text-xs text-foreground/40">Resume will be updated as I gain new skills and experience.</p></div></div><ContactForm /></div></section>
      </main>

      <footer className="relative z-10 mt-8 border-t border-line"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-5 py-10 sm:flex-row sm:items-center"><div className="flex items-center gap-3"><span className="grid size-8 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-brand to-brand-strong ring-1 ring-line"><img src={portraitAsset.url} alt="Ankit Sharma" className="size-full object-cover" loading="lazy" /></span><div><p className="text-sm font-medium">© 2026 Ankit Sharma</p><p className="font-mono text-xs text-foreground/40">Learning · Building · Improving</p></div></div><div className="flex items-center gap-4 text-sm text-foreground/50"><a href={GITHUB_URL} target="_blank" rel="noreferrer" className="hover:text-foreground">GitHub</a><a href={LINKEDIN_URL} target="_blank" rel="noreferrer" className="hover:text-foreground">LinkedIn</a><button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover:text-foreground">Back to Top ↑</button></div></div></footer>
    </div>
  );
}

function HeroVisual() {
  const bars = ["h-1/3", "h-2/3", "h-1/2", "h-full", "h-3/4", "h-1/2", "h-2/3"];
  return <div className="relative reveal-up [animation-delay:120ms]"><div className="spec-glow absolute -inset-6 rounded-[2rem] opacity-70" /><div className="glass-panel glowline relative rounded-2xl border border-line p-6"><div className="mb-5 flex items-center justify-between"><div className="flex gap-2"><span className="size-2.5 rounded-full bg-brand-strong/70" /><span className="size-2.5 rounded-full bg-brand/70" /><span className="size-2.5 rounded-full bg-cyan/70" /></div><span className="font-mono text-xs text-foreground/40">profile.py</span></div><div className="flex items-center gap-4"><div className="grid size-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-brand to-brand-strong text-2xl font-extrabold text-primary-foreground shadow-lg shadow-brand/40 ring-1 ring-line"><img src={portraitAsset.url} alt="Ankit Sharma" className="size-full object-cover" loading="lazy" /></div><div><p className="font-semibold">Ankit Sharma</p><p className="text-sm text-foreground/50">Data & Software</p></div></div><div className="mt-6 space-y-2.5 font-mono text-xs"><div className="flex justify-between text-foreground/50"><span className="text-brand-strong">def</span><span className="text-cyan">analyze</span><span>(dataset)</span></div><div className="pl-4 text-foreground/70">return transform(data)</div><div className="pl-4 text-foreground/40"># insights &gt; noise</div></div><div className="mt-6 flex h-20 items-end gap-1.5">{bars.map((height, index) => <div key={index} className={cn("flex-1 rounded-t bg-gradient-to-t", height, index === 2 || index === 6 ? "from-brand-strong/40 to-brand-strong/70" : index === 4 ? "from-cyan/40 to-cyan/70" : "from-brand/40 to-brand/70")} />)}</div><p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/30">Signals · Trends · Insights</p></div><span className="animate-float-y glass-panel absolute -left-5 top-8 rounded-lg border border-line px-3 py-1.5 text-xs font-medium shadow-lg">Python</span><span className="animate-float-y-reverse glass-panel absolute -right-4 top-24 rounded-lg border border-cyan/30 px-3 py-1.5 text-xs font-medium text-cyan shadow-lg">SQL</span><span className="animate-float-y glass-panel absolute -bottom-4 left-10 rounded-lg border border-brand-strong/30 px-3 py-1.5 text-xs font-medium text-brand-strong shadow-lg">Data Analytics</span><span className="animate-float-y-reverse glass-panel absolute -bottom-6 right-8 rounded-lg border border-line px-3 py-1.5 text-xs font-medium shadow-lg">Java</span></div>;
}

function SectionHeading({ number, title }: { number: string; title: string }) { return <div className="mb-8 flex items-baseline gap-3"><span className="font-mono text-sm text-brand">{number}</span><h2 className="text-3xl font-bold tracking-tight">{title}</h2></div>; }
function SocialIcon({ href, label, icon }: { href: string; label: string; icon: ReactNode }) { return <a href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid size-11 place-items-center rounded-xl border border-line bg-secondary/20 text-foreground/70 transition-colors hover:border-brand/40 hover:text-foreground">{icon}</a>; }
function SocialLink({ href, label, icon }: { href: string; label: string; icon: ReactNode }) { return <Button asChild variant="outline" className="border-line bg-transparent text-foreground hover:border-brand/40 hover:bg-secondary"><a href={href} target="_blank" rel="noreferrer">{icon}{label} <ArrowUpRight /></a></Button>; }
function Tag({ children }: { children: ReactNode }) { return <span className="inline-flex rounded-md border border-line bg-secondary/40 px-2.5 py-1 font-mono text-[11px] text-foreground/70">{children}</span>; }
function InfoItem({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) { return <div className="flex items-start gap-3"><span className="mt-0.5 text-brand">{icon}</span><div><p className="font-medium">{title}</p><p className="mt-1 text-sm text-foreground/50">{detail}</p></div></div>; }
function DirectionItem({ label, value }: { label: string; value: string }) { return <div className="grid grid-cols-[86px_minmax(0,1fr)] gap-3 border-b border-line pb-4 last:border-0 last:pb-0"><span className="font-mono text-xs uppercase tracking-wider text-foreground/40">{label}</span><span className="text-sm text-foreground/80">{value}</span></div>; }
function SkillCard({ title, icon: Icon, accent, items }: { title: string; icon: typeof Code2; accent: string; items: string[] }) { return <div className="glass-panel rounded-2xl border border-line p-5 transition-colors hover:border-brand/40"><div className={cn("mb-4 flex items-center gap-2 text-xs font-mono uppercase tracking-widest", accent === "brand" && "text-brand", accent === "brand-strong" && "text-brand-strong", accent === "cyan" && "text-cyan", accent === "success" && "text-success")}><Icon className="size-4" />{title}</div><div className="flex flex-wrap gap-2">{items.map((item) => <Tag key={item}>{item}</Tag>)}</div></div>; }
function CertificateCard({ title, detail, issuer, date, url }: { title: string; detail: string; issuer: string; date: string; url?: string }) { return <article className="glass-panel group rounded-2xl border border-line p-5 transition-colors hover:border-brand/40"><div className="flex items-start justify-between gap-4"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand"><Award /></div>{url && <a href={url} target="_blank" rel="noreferrer" className="text-foreground/40 transition-colors hover:text-cyan" aria-label={`Verify ${title}`}><ExternalLink className="size-4" /></a>}</div><h3 className="mt-5 font-semibold">{title}</h3>{detail && <p className="mt-1 text-sm text-foreground/60">{detail}</p>}<p className="mt-4 text-sm text-foreground/50">{issuer}</p><p className="mt-2 font-mono text-[11px] text-cyan">{date}</p>{url ? <a href={url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-xs text-brand hover:text-cyan">View Certificate <ArrowUpRight className="size-3" /></a> : <p className="mt-4 text-xs text-foreground/35">Certificate details available on request</p>}</article>; }

function GithubSection({ repos, state }: { repos: GithubRepo[]; state: "loading" | "ready" | "error" | "empty" }) {
  const sectionRef = (element: HTMLElement | null) => { if (element) document.querySelector("#github"); };
  return <section ref={sectionRef} id="github" className="scroll-mt-20 py-16"><SectionHeading number="06" title="GitHub Activity" /><div className="glass-panel rounded-2xl border border-line p-6 sm:p-8"><div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"><div><p className="max-w-2xl text-sm leading-relaxed text-foreground/55">Public repositories from GitHub, sorted by recent activity. No token required, no statistics invented.</p><div className="mt-4 flex flex-wrap gap-3 font-mono text-xs text-foreground/45"><span className="inline-flex items-center gap-1.5"><Github className="size-3.5" /> {GITHUB_USERNAME}</span><span className="inline-flex items-center gap-1.5"><Sparkles className="size-3.5 text-cyan" /> live public data</span></div></div><Button asChild className="w-fit rounded-xl bg-cyan/15 text-cyan ring-1 ring-cyan/30 hover:bg-cyan/20"><a href={GITHUB_URL} target="_blank" rel="noreferrer">View GitHub Profile <ArrowUpRight /></a></Button></div><div className="mt-6">{state === "loading" && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-36 animate-pulse rounded-xl border border-line bg-secondary/30" />)}</div>}{state === "ready" && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{repos.map((repo) => <a key={repo.id} href={repo.html_url} target="_blank" rel="noreferrer" className="group rounded-xl border border-line bg-secondary/25 p-5 transition-colors hover:border-brand/50"><div className="flex items-start justify-between gap-3"><p className="min-w-0 truncate font-mono text-sm text-foreground">{repo.name}</p><ArrowUpRight className="size-4 shrink-0 text-foreground/30 transition-colors group-hover:text-cyan" /></div><p className="mt-3 line-clamp-2 min-h-10 text-xs leading-relaxed text-foreground/50">{repo.description || "No description provided."}</p><div className="mt-4 flex items-center gap-3 font-mono text-[11px] text-foreground/40"><span>{repo.language || "Unspecified"}</span><span>★ {repo.stargazers_count}</span><span>⑂ {repo.forks_count}</span></div></a>)}</div>}{(state === "error" || state === "empty") && <div className="rounded-xl border border-dashed border-line p-7 text-center"><CircleAlert className="mx-auto size-5 text-cyan" /><p className="mt-3 font-medium">{state === "empty" ? "No public repositories yet" : "GitHub activity is unavailable right now"}</p><p className="mx-auto mt-1 max-w-md text-sm text-foreground/45">Visit the public profile for the latest information.</p><Button asChild variant="outline" className="mt-4 border-line bg-transparent text-foreground hover:border-cyan"><a href={GITHUB_URL} target="_blank" rel="noreferrer">Open GitHub Profile <ExternalLink /></a></Button></div>}</div></div></section>;
}

function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formKey, setFormKey] = useState(0);
  const formReady = WEB3FORMS_ACCESS_KEY.length > 0;
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting || !formReady) return;
    const form = event.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    setSubmitting(true); setError("");
    try {
      const data = new FormData(form);
      data.set("access_key", WEB3FORMS_ACCESS_KEY);
      data.set("from_name", "Portfolio Contact Form");
      data.set("subject", `Portfolio contact: ${String(data.get("subject") ?? "")}`);
      data.set("replyto", String(data.get("email") ?? ""));
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      const result = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !result.success) throw new Error(result.message || "Message could not be sent.");
      setSubmitted(true); setFormKey((key) => key + 1);
    } catch (err) {
      const reason = err instanceof Error && err.message ? ` (${err.message})` : "";
      setError(`Something went wrong while sending${reason}. Please try again, or reach me on LinkedIn.`);
    } finally {
      setSubmitting(false);
    }
  };
  return <form key={formKey} onSubmit={handleSubmit} className="glass-panel rounded-2xl border border-line p-5" noValidate><input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" /><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="font-mono text-[11px] uppercase tracking-[0.15em] text-foreground/45">Name</span><Input required name="name" className="mt-1.5 border-line bg-secondary/30 text-foreground placeholder:text-foreground/30" placeholder="Your name" /></label><label className="block"><span className="font-mono text-[11px] uppercase tracking-[0.15em] text-foreground/45">Email</span><Input required type="email" name="email" className="mt-1.5 border-line bg-secondary/30 text-foreground placeholder:text-foreground/30" placeholder="you@email.com" /></label></div><label className="mt-4 block"><span className="font-mono text-[11px] uppercase tracking-[0.15em] text-foreground/45">Subject</span><Input required name="subject" className="mt-1.5 border-line bg-secondary/30 text-foreground placeholder:text-foreground/30" placeholder="What's this about?" /></label><label className="mt-4 block"><span className="font-mono text-[11px] uppercase tracking-[0.15em] text-foreground/45">Message</span><Textarea required name="message" rows={4} className="mt-1.5 resize-none border-line bg-secondary/30 text-foreground placeholder:text-foreground/30" placeholder="Write a short message…" /></label><Button type="submit" disabled={submitting || !formReady} className="mt-5 w-full rounded-xl bg-gradient-to-r from-brand to-brand-strong py-3 font-semibold text-primary-foreground hover:brightness-110">{submitting ? "Sending…" : "Send Message"} {submitting ? <Sparkles /> : <Send />}</Button>{submitted && <p role="status" className="mt-3 flex items-center gap-2 text-xs text-success"><Check className="size-4" /> Message accepted — please check Inbox, Promotions or Spam.</p>}{error && <p role="alert" className="mt-3 text-xs text-destructive">{error}</p>}{!submitted && !error && !formReady && <p className="mt-3 text-xs text-foreground/40">Contact form is ready to connect. Please use LinkedIn or GitHub for now.</p>}{!submitted && !error && formReady && <p className="mt-3 text-xs text-foreground/40">Messages are delivered securely through Web3Forms.</p>}</form>;
}