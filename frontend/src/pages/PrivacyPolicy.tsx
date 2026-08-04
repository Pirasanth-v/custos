import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Lock,
  FileText,
  Database,
  Mail,
  ArrowLeft,
  CheckCircle2,
  Cookie,
  MessageSquare,
  UserCheck,
  Search,
  ExternalLink,
  ChevronRight,
  Sun,
  Moon,
  Clock,
  Globe,
  Trash2,
  Copy,
  Check,
} from "lucide-react";
import logo from "@/assets/logo_crop.png";
import useThemeStore from "@/store/themeStore";

interface PolicySection {
  id: string;
  title: string;
  icon: React.ElementType;
}

const SECTIONS: PolicySection[] = [
  {
    id: "definitions",
    title: "1. Interpretation & Definitions",
    icon: FileText,
  },
  { id: "collection", title: "2. Data Collection & Cookies", icon: Database },
  { id: "usage", title: "3. How We Use & Share Data", icon: Shield },
  { id: "sms", title: "4. Text Messages (SMS) Notice", icon: MessageSquare },
  { id: "retention", title: "5. Retention & Security", icon: Clock },
  { id: "rights", title: "6. Your Rights & Data Deletion", icon: UserCheck },
  { id: "children", title: "7. Minors & Third Parties", icon: Lock },
  { id: "contact", title: "8. Contact Us", icon: Mail },
];

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const { isDark, toggle } = useThemeStore();
  const [activeSection, setActiveSection] = useState<string>("definitions");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("pirasanth.v3@gmail.com");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const matchesSearch = (text: string) => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 flex flex-col">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex items-center gap-2 text-sm font-medium"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => navigate("/dashboard")}
            >
              <img src={logo} alt="Custos Logo" className="h-8 w-auto" />
              <span className="font-bold text-lg text-foreground tracking-tight">
                Custos
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hidden sm:inline-block">
              Privacy Portal
            </span>
            <button
              onClick={toggle}
              className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 via-card to-background border border-primary/20 p-6 md:p-10 mb-8 md:mb-12 shadow-xs">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
              <Shield size={14} />
              <span>Legal & Transparency</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Privacy Policy
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              At Custos, we hold your trust and financial privacy as our highest
              priority. This document outlines how we collect, protect, and
              manage your personal data.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs md:text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5 bg-background/60 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-border">
                <Clock size={15} className="text-primary" />
                <span>
                  Last Updated: <strong>August 04, 2026</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-background/60 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-border">
                <Globe size={15} className="text-primary" />
                <span>
                  Jurisdiction: <strong>Sri Lanka / Global</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Highlights Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="p-4 md:p-5 rounded-xl border border-border bg-card/60 hover:bg-card hover:border-primary/40 transition-all duration-200 shadow-xs">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary w-fit mb-3">
              <Lock size={20} />
            </div>
            <h3 className="font-semibold text-foreground text-sm mb-1">
              Strict Security
            </h3>
            <p className="text-xs text-muted-foreground leading-normal">
              Industry-standard encryption to protect your credentials and
              session tokens.
            </p>
          </div>

          <div className="p-4 md:p-5 rounded-xl border border-border bg-card/60 hover:bg-card hover:border-primary/40 transition-all duration-200 shadow-xs">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500 w-fit mb-3">
              <Cookie size={20} />
            </div>
            <h3 className="font-semibold text-foreground text-sm mb-1">
              Essential Cookies
            </h3>
            <p className="text-xs text-muted-foreground leading-normal">
              We only use necessary session cookies required for authenticating
              your account.
            </p>
          </div>

          <div className="p-4 md:p-5 rounded-xl border border-border bg-card/60 hover:bg-card hover:border-primary/40 transition-all duration-200 shadow-xs">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500 w-fit mb-3">
              <MessageSquare size={20} />
            </div>
            <h3 className="font-semibold text-foreground text-sm mb-1">
              No Data Sales
            </h3>
            <p className="text-xs text-muted-foreground leading-normal">
              Your mobile and contact information is never sold or shared for
              third-party marketing.
            </p>
          </div>

          <div className="p-4 md:p-5 rounded-xl border border-border bg-card/60 hover:bg-card hover:border-primary/40 transition-all duration-200 shadow-xs">
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-500 w-fit mb-3">
              <UserCheck size={20} />
            </div>
            <h3 className="font-semibold text-foreground text-sm mb-1">
              Your Rights
            </h3>
            <p className="text-xs text-muted-foreground leading-normal">
              Full control to request data access, modifications, or complete
              account deletion.
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mb-8 max-w-xl">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search policy topics (e.g. cookies, deletion, SMS, security)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground bg-muted px-2 py-0.5 rounded-md"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Content Layout with Sticky Table of Contents */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar / Toc Nav */}
          <aside className="lg:col-span-4 sticky top-20 hidden lg:block">
            <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-xs">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-3 py-2">
                Table of Contents
              </p>
              {SECTIONS.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full flex items-center justify-between text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon size={16} />
                      <span className="truncate">{sec.title}</span>
                    </div>
                    {isActive && <ChevronRight size={14} />}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main Policy Content Sections */}
          <main className="lg:col-span-8 space-y-8">
            {/* Section 1 */}
            {matchesSearch(
              "Interpretation Definitions Account Affiliate Company Cookies Device Personal Data",
            ) && (
              <section
                id="definitions"
                className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4 shadow-xs"
              >
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <FileText size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">
                    1. Interpretation and Definitions
                  </h2>
                </div>

                <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    The words whose initial letters are capitalized have
                    meanings defined under the following conditions. The
                    definitions apply regardless of whether they appear in
                    singular or plural.
                  </p>
                  <div className="grid grid-cols-1 gap-3 pt-2">
                    <div className="p-3.5 rounded-xl border border-border bg-background/50 space-y-1">
                      <span className="font-semibold text-foreground text-xs uppercase tracking-wider block">
                        Account
                      </span>
                      <p className="text-xs text-muted-foreground">
                        A unique account created for You to access Our Service
                        or parts of Our Service.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-border bg-background/50 space-y-1">
                      <span className="font-semibold text-foreground text-xs uppercase tracking-wider block">
                        Company (We / Us / Our)
                      </span>
                      <p className="text-xs text-muted-foreground">
                        Refers to <strong>Custos</strong> Enterprise Financial
                        Management Platform.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-border bg-background/50 space-y-1">
                      <span className="font-semibold text-foreground text-xs uppercase tracking-wider block">
                        Personal Data
                      </span>
                      <p className="text-xs text-muted-foreground">
                        Any information that relates to an identified or
                        identifiable individual (e.g. Email address, First &amp;
                        Last Name).
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-border bg-background/50 space-y-1">
                      <span className="font-semibold text-foreground text-xs uppercase tracking-wider block">
                        Website &amp; Service
                      </span>
                      <p className="text-xs text-muted-foreground">
                        Refers to Custos, accessible from{" "}
                        <a
                          href="https://custos.pirasanth.dev"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline font-medium hover:opacity-80"
                        >
                          https://custos.pirasanth.dev
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Section 2 */}
            {matchesSearch(
              "Collecting Data Cookies Usage Personal Tracking",
            ) && (
              <section
                id="collection"
                className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4 shadow-xs"
              >
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Database size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">
                    2. Collecting and Using Your Personal Information
                  </h2>
                </div>

                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <h3 className="font-semibold text-foreground text-base">
                    Types of Data Collected
                  </h3>

                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground text-sm flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-primary" />
                      Personal Data
                    </h4>
                    <p className="text-xs pl-6">
                      While using Our Service, We may ask You to provide Us with
                      personally identifiable information, including but not
                      limited to:
                    </p>
                    <ul className="list-disc list-inside text-xs pl-6 space-y-1">
                      <li>Email address</li>
                      <li>First name and last name</li>
                      <li>Organization or Business membership details</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground text-sm flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-primary" />
                      Usage &amp; Diagnostic Data
                    </h4>
                    <p className="text-xs pl-6">
                      Usage Data is collected automatically when using the
                      Service. It may include IP address, browser type,
                      operating system, pages visited, time spent, and unique
                      device identifiers.
                    </p>
                  </div>

                  <div className="mt-4 p-4 rounded-xl border border-border bg-background/70 space-y-3">
                    <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                      <Cookie className="text-amber-500" size={18} />
                      <span>Tracking Technologies &amp; Cookies Policy</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      We use essential session cookies to manage authentication,
                      protect against cross-site security threats, and remember
                      preferences.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                      <div className="p-2.5 rounded-lg bg-card border border-border">
                        <strong className="text-foreground block">
                          Session Cookies:
                        </strong>
                        Stored temporarily to verify logged-in states and
                        deleted when browser closes.
                      </div>
                      <div className="p-2.5 rounded-lg bg-card border border-border">
                        <strong className="text-foreground block">
                          Functionality Cookies:
                        </strong>
                        Persistent cookies that store theme or user interface
                        preferences.
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Section 3 */}
            {matchesSearch(
              "Use Sharing Personal Data Account Contract Services",
            ) && (
              <section
                id="usage"
                className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4 shadow-xs"
              >
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                    <Shield size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">
                    3. How We Use &amp; Share Your Data
                  </h2>
                </div>

                <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    The Company may use Personal Data for the following
                    operational purposes:
                  </p>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-start gap-2 p-2.5 rounded-lg bg-background/50 border border-border">
                      <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>
                        <strong className="text-foreground">
                          To provide and maintain Our Service:
                        </strong>{" "}
                        Including monitoring platform performance and system
                        health.
                      </span>
                    </li>
                    <li className="flex items-start gap-2 p-2.5 rounded-lg bg-background/50 border border-border">
                      <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>
                        <strong className="text-foreground">
                          To manage Your Account:
                        </strong>{" "}
                        Providing seamless access to financial tools,
                        organizations, and team member controls.
                      </span>
                    </li>
                    <li className="flex items-start gap-2 p-2.5 rounded-lg bg-background/50 border border-border">
                      <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>
                        <strong className="text-foreground">
                          To contact You:
                        </strong>{" "}
                        Sending security alerts, critical service updates, or
                        responding to support inquiries.
                      </span>
                    </li>
                  </ul>
                </div>
              </section>
            )}

            {/* Section 4 */}
            {matchesSearch(
              "Text Messages SMS Phone Third Parties Marketing Opt-Out",
            ) && (
              <section
                id="sms"
                className="rounded-2xl border border-primary/30 bg-primary/5 p-6 md:p-8 space-y-4 shadow-xs"
              >
                <div className="flex items-center gap-3 pb-3 border-b border-primary/20">
                  <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      4. Text Messages (SMS) Privacy Notice
                    </h2>
                    <p className="text-xs text-primary font-medium">
                      Zero Third-Party Sharing Promise
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs md:text-sm text-muted-foreground leading-relaxed">
                  <div className="p-4 rounded-xl bg-card border border-primary/20 space-y-2">
                    <p className="font-semibold text-foreground text-sm">
                      🔒 No Mobile Data Sharing
                    </p>
                    <p className="text-xs">
                      No mobile information will be shared with or sold to third
                      parties or affiliates for marketing or promotional
                      purposes. Phone numbers and consent records collected for
                      texting are strictly protected and never shared.
                    </p>
                  </div>

                  <p>
                    If You opt-in to receive SMS notifications from Us, messages
                    may relate to:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-card border border-border flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-primary" />
                      <span>Account activity &amp; security alerts</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-card border border-border flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-primary" />
                      <span>OTP passcodes &amp; 2FA verification</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-card border border-border flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-primary" />
                      <span>Bill upload &amp; transaction updates</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-card border border-border flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-primary" />
                      <span>Customer care &amp; support responses</span>
                    </div>
                  </div>

                  <div className="pt-2 text-xs bg-background/80 p-3 rounded-lg border border-border text-foreground font-mono">
                    💡 Reply <strong>STOP</strong> to opt-out anytime. Reply{" "}
                    <strong>HELP</strong> for support. Message &amp; data rates
                    may apply.
                  </div>
                </div>
              </section>
            )}

            {/* Section 5 */}
            {matchesSearch(
              "Retention Security Period Storage Accounts Logs Support",
            ) && (
              <section
                id="retention"
                className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4 shadow-xs"
              >
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                    <Clock size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">
                    5. Data Retention &amp; Security Policy
                  </h2>
                </div>

                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <p className="text-xs">
                    We retain Your Personal Data only for as long as necessary
                    to fulfill the purposes set out in this policy or to comply
                    with statutory legal requirements.
                  </p>

                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted/60 text-foreground font-semibold border-b border-border">
                        <tr>
                          <th className="p-3">Data Category</th>
                          <th className="p-3">Retention Period</th>
                          <th className="p-3">Primary Purpose</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="p-3 font-medium text-foreground">
                            User Accounts
                          </td>
                          <td className="p-3">
                            Duration + up to 24 months post-closure
                          </td>
                          <td className="p-3 text-muted-foreground">
                            Account management &amp; dispute resolution
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-foreground">
                            Support Tickets
                          </td>
                          <td className="p-3">Up to 24 months</td>
                          <td className="p-3 text-muted-foreground">
                            Quality assurance &amp; legal compliance
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-foreground">
                            Server Logs &amp; Analytics
                          </td>
                          <td className="p-3">Up to 24 months</td>
                          <td className="p-3 text-muted-foreground">
                            Security monitoring &amp; fraud prevention
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 rounded-xl bg-background/50 border border-border space-y-2">
                    <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider flex items-center gap-2">
                      <Lock size={14} className="text-primary" />
                      Security Measures
                    </h4>
                    <p className="text-xs">
                      We utilize commercially reasonable technical safeguards,
                      encrypted data channels, and access controls. However, no
                      method of internet transmission is 100% immune to all
                      security risks.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Section 6 */}
            {matchesSearch(
              "Delete Rights Deletion Request Remove Account Consent",
            ) && (
              <section
                id="rights"
                className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4 shadow-xs"
              >
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                    <Trash2 size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">
                    6. Your Rights &amp; Data Deletion
                  </h2>
                </div>

                <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                  <p className="text-xs">
                    You have full rights to access, update, or permanently
                    delete the personal data we hold about you.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-4 rounded-xl border border-border bg-background/50 space-y-1.5">
                      <span className="font-semibold text-foreground text-xs flex items-center gap-2">
                        <UserCheck size={14} className="text-primary" />
                        In-App Account Settings
                      </span>
                      <p className="text-xs text-muted-foreground">
                        Update or modify your profile, email, and organization
                        details directly inside your Account Settings page.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-border bg-background/50 space-y-1.5">
                      <span className="font-semibold text-foreground text-xs flex items-center gap-2">
                        <Trash2 size={14} className="text-danger" />
                        Data Removal Request
                      </span>
                      <p className="text-xs text-muted-foreground">
                        Request complete deletion of your account and personal
                        records by contacting support at any time.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Section 7 */}
            {matchesSearch("Children Minors Privacy Links External 16") && (
              <section
                id="children"
                className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4 shadow-xs"
              >
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                    <Lock size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">
                    7. Children's Privacy &amp; External Links
                  </h2>
                </div>

                <div className="space-y-3 text-xs md:text-sm text-muted-foreground leading-relaxed">
                  <p>
                    Our Service is not intended for individuals under 16 years
                    of age. We do not knowingly collect personal data from
                    children. If you become aware that a child has provided us
                    with personal data, please contact us immediately.
                  </p>
                  <p>
                    Our Service may contain links to external sites. We strongly
                    advise you to review the privacy policy of every third-party
                    site you visit, as we have no control over their policies.
                  </p>
                </div>
              </section>
            )}

            {/* Section 8 */}
            {matchesSearch("Contact Us Email Questions Support Help") && (
              <section
                id="contact"
                className="rounded-2xl border border-primary/30 bg-linear-to-br from-card via-card to-primary/5 p-6 md:p-8 space-y-4 shadow-xs"
              >
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      8. Contact Us
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Have questions regarding your privacy rights?
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      Direct Privacy Email
                    </span>
                    <a
                      href="mailto:pirasanth.v3@gmail.com"
                      className="text-base font-bold text-primary hover:underline flex items-center gap-2"
                    >
                      pirasanth.v3@gmail.com
                      <ExternalLink size={14} />
                    </a>
                  </div>

                  <button
                    onClick={handleCopyEmail}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-xs"
                  >
                    {copiedEmail ? (
                      <>
                        <Check size={14} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy Email</span>
                      </>
                    )}
                  </button>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-card/40 py-6 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Custos" className="h-5 w-auto" />
            <span className="font-semibold text-foreground">Custos</span>
            <span>&copy; 2026. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => navigate("/dashboard")}
              className="hover:text-foreground transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/login")}
              className="hover:text-foreground transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
