// HireSmart mock data — realistic Southeast Asian executive search context.

export type UserRole = "owner" | "admin" | "recruiter" | "sourcer";
export type ProjectStatus =
  | "draft"
  | "open"
  | "sourcing"
  | "shortlisted"
  | "interviewing"
  | "offer"
  | "placed"
  | "closed"
  | "on_hold";
export type CandidateSource =
  | "cv_upload"
  | "linkedin"
  | "manual"
  | "inbound"
  | "chrome_extension"
  | "csv_import"
  | "referral";
export type SeniorityLevel =
  | "c_suite"
  | "vp"
  | "director"
  | "manager"
  | "senior"
  | "mid"
  | "junior";
export type CampaignStatus = "draft" | "active" | "paused" | "completed";
export type InboxClassification =
  | "interested"
  | "not_interested"
  | "needs_review"
  | "out_of_office"
  | "referral"
  | "other";
export type PipelineStage =
  | "applied"
  | "screening"
  | "shortlisted"
  | "submitted_to_client"
  | "interview"
  | "offer"
  | "placed"
  | "rejected";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  initials: string;
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  location: string;
  openProjects: number;
  totalPlacements: number;
  primaryContact: string;
}

export interface Project {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  status: ProjectStatus;
  seniority: SeniorityLevel;
  location: string;
  candidates: number;
  shortlisted: number;
  daysOpen: number;
  owner: string;
}

export interface Candidate {
  id: string;
  name: string;
  currentTitle: string;
  currentCompany: string;
  location: string;
  seniority: SeniorityLevel;
  source: CandidateSource;
  matchScore: number;
  lastContact: string;
  email: string;
}

export interface Campaign {
  id: string;
  name: string;
  projectId: string;
  status: CampaignStatus;
  sent: number;
  opened: number;
  replied: number;
  interested: number;
  startedAt: string;
}

export interface InboxMessage {
  id: string;
  candidateName: string;
  subject: string;
  preview: string;
  classification: InboxClassification;
  receivedAt: string;
  campaignId: string;
  unread: boolean;
}

export interface PipelineEntry {
  id: string;
  candidateId: string;
  candidateName: string;
  projectId: string;
  projectTitle: string;
  stage: PipelineStage;
  updatedAt: string;
}

export const currentUser: User = {
  id: "u1",
  name: "Priya Sharma",
  email: "priya@hiresmart.io",
  role: "owner",
  initials: "PS",
};

export const clients: Client[] = [
  {
    id: "c1",
    name: "Indorama Ventures",
    industry: "Petrochemicals",
    location: "Bangkok, Thailand",
    openProjects: 3,
    totalPlacements: 12,
    primaryContact: "Anand Krishnan",
  },
  {
    id: "c2",
    name: "OYO Hotels",
    industry: "Hospitality",
    location: "Gurugram, India",
    openProjects: 2,
    totalPlacements: 8,
    primaryContact: "Rohit Kapoor",
  },
  {
    id: "c3",
    name: "KNS Group",
    industry: "Manufacturing",
    location: "Jakarta, Indonesia",
    openProjects: 1,
    totalPlacements: 4,
    primaryContact: "Budi Santoso",
  },
  {
    id: "c4",
    name: "Oasis Water",
    industry: "Consumer Goods",
    location: "Dubai, UAE",
    openProjects: 1,
    totalPlacements: 6,
    primaryContact: "Yousef Al Mahmoud",
  },
  {
    id: "c5",
    name: "Stylo International",
    industry: "Retail / Fashion",
    location: "Singapore",
    openProjects: 1,
    totalPlacements: 3,
    primaryContact: "Mei Lin Tan",
  },
];

export const projects: Project[] = [
  {
    id: "p1",
    title: "Group Chief Financial Officer",
    clientId: "c1",
    clientName: "Indorama Ventures",
    status: "shortlisted",
    seniority: "c_suite",
    location: "Bangkok, Thailand",
    candidates: 42,
    shortlisted: 6,
    daysOpen: 28,
    owner: "Priya Sharma",
  },
  {
    id: "p2",
    title: "VP Operations, Southeast Asia",
    clientId: "c2",
    clientName: "OYO Hotels",
    status: "interviewing",
    seniority: "vp",
    location: "Jakarta, Indonesia",
    candidates: 67,
    shortlisted: 9,
    daysOpen: 41,
    owner: "Daniel Wirawan",
  },
  {
    id: "p3",
    title: "Country Director, Indonesia",
    clientId: "c3",
    clientName: "KNS Group",
    status: "sourcing",
    seniority: "c_suite",
    location: "Jakarta, Indonesia",
    candidates: 23,
    shortlisted: 2,
    daysOpen: 12,
    owner: "Priya Sharma",
  },
  {
    id: "p4",
    title: "Head of Digital Transformation",
    clientId: "c4",
    clientName: "Oasis Water",
    status: "open",
    seniority: "director",
    location: "Dubai, UAE",
    candidates: 31,
    shortlisted: 4,
    daysOpen: 19,
    owner: "Aisha Rahman",
  },
  {
    id: "p5",
    title: "Regional Sales Director, APAC",
    clientId: "c5",
    clientName: "Stylo International",
    status: "offer",
    seniority: "director",
    location: "Singapore",
    candidates: 54,
    shortlisted: 7,
    daysOpen: 55,
    owner: "Daniel Wirawan",
  },
  {
    id: "p6",
    title: "Chief People Officer",
    clientId: "c1",
    clientName: "Indorama Ventures",
    status: "placed",
    seniority: "c_suite",
    location: "Bangkok, Thailand",
    candidates: 78,
    shortlisted: 12,
    daysOpen: 73,
    owner: "Priya Sharma",
  },
  {
    id: "p7",
    title: "Head of Supply Chain",
    clientId: "c2",
    clientName: "OYO Hotels",
    status: "on_hold",
    seniority: "vp",
    location: "Mumbai, India",
    candidates: 18,
    shortlisted: 3,
    daysOpen: 34,
    owner: "Aisha Rahman",
  },
  {
    id: "p8",
    title: "Plant General Manager",
    clientId: "c1",
    clientName: "Indorama Ventures",
    status: "draft",
    seniority: "director",
    location: "Rayong, Thailand",
    candidates: 0,
    shortlisted: 0,
    daysOpen: 1,
    owner: "Priya Sharma",
  },
];

export const candidates: Candidate[] = [
  {
    id: "ca1",
    name: "Rajeev Menon",
    currentTitle: "CFO",
    currentCompany: "Reliance Polymers",
    location: "Mumbai, India",
    seniority: "c_suite",
    source: "linkedin",
    matchScore: 92,
    lastContact: "2 days ago",
    email: "rajeev.menon@example.com",
  },
  {
    id: "ca2",
    name: "Siti Nurhaliza",
    currentTitle: "VP Operations",
    currentCompany: "Traveloka",
    location: "Jakarta, Indonesia",
    seniority: "vp",
    source: "chrome_extension",
    matchScore: 88,
    lastContact: "5 days ago",
    email: "siti.n@example.com",
  },
  {
    id: "ca3",
    name: "James Tan Wei Ming",
    currentTitle: "Managing Director",
    currentCompany: "Grab Holdings",
    location: "Singapore",
    seniority: "c_suite",
    source: "referral",
    matchScore: 85,
    lastContact: "1 week ago",
    email: "james.tan@example.com",
  },
  {
    id: "ca4",
    name: "Olivia Pemberton",
    currentTitle: "Head of Digital",
    currentCompany: "Woolworths Group",
    location: "Sydney, Australia",
    seniority: "director",
    source: "linkedin",
    matchScore: 79,
    lastContact: "3 days ago",
    email: "o.pemberton@example.com",
  },
  {
    id: "ca5",
    name: "Arjun Krishnamurthy",
    currentTitle: "Country Manager",
    currentCompany: "Unilever Indonesia",
    location: "Jakarta, Indonesia",
    seniority: "vp",
    source: "manual",
    matchScore: 81,
    lastContact: "4 days ago",
    email: "arjun.k@example.com",
  },
  {
    id: "ca6",
    name: "Mei Wong",
    currentTitle: "Finance Director",
    currentCompany: "DBS Bank",
    location: "Singapore",
    seniority: "director",
    source: "cv_upload",
    matchScore: 74,
    lastContact: "1 day ago",
    email: "mei.wong@example.com",
  },
  {
    id: "ca7",
    name: "Bambang Hartono",
    currentTitle: "Plant Director",
    currentCompany: "Astra International",
    location: "Surabaya, Indonesia",
    seniority: "director",
    source: "csv_import",
    matchScore: 68,
    lastContact: "2 weeks ago",
    email: "bambang.h@example.com",
  },
  {
    id: "ca8",
    name: "Lakshmi Iyer",
    currentTitle: "Chief HR Officer",
    currentCompany: "Tata Steel",
    location: "Mumbai, India",
    seniority: "c_suite",
    source: "linkedin",
    matchScore: 90,
    lastContact: "6 days ago",
    email: "l.iyer@example.com",
  },
  {
    id: "ca9",
    name: "Daniel O'Connor",
    currentTitle: "Regional VP",
    currentCompany: "Marriott International",
    location: "Sydney, Australia",
    seniority: "vp",
    source: "inbound",
    matchScore: 77,
    lastContact: "Today",
    email: "daniel.oc@example.com",
  },
  {
    id: "ca10",
    name: "Priscilla Lim",
    currentTitle: "VP Strategy",
    currentCompany: "Shopee",
    location: "Singapore",
    seniority: "vp",
    source: "chrome_extension",
    matchScore: 83,
    lastContact: "3 days ago",
    email: "p.lim@example.com",
  },
  {
    id: "ca11",
    name: "Vikram Singh",
    currentTitle: "Supply Chain Director",
    currentCompany: "Mahindra Logistics",
    location: "Bangalore, India",
    seniority: "director",
    source: "linkedin",
    matchScore: 71,
    lastContact: "1 week ago",
    email: "vikram.s@example.com",
  },
  {
    id: "ca12",
    name: "Ratna Dewi",
    currentTitle: "Head of Sales",
    currentCompany: "Tokopedia",
    location: "Jakarta, Indonesia",
    seniority: "director",
    source: "referral",
    matchScore: 76,
    lastContact: "5 days ago",
    email: "ratna.d@example.com",
  },
  {
    id: "ca13",
    name: "Hiroshi Yamamoto",
    currentTitle: "Asia CFO",
    currentCompany: "Mitsubishi Chemicals",
    location: "Bangkok, Thailand",
    seniority: "c_suite",
    source: "manual",
    matchScore: 87,
    lastContact: "2 days ago",
    email: "h.yamamoto@example.com",
  },
  {
    id: "ca14",
    name: "Amara Okonkwo",
    currentTitle: "VP People",
    currentCompany: "Gojek",
    location: "Jakarta, Indonesia",
    seniority: "vp",
    source: "linkedin",
    matchScore: 65,
    lastContact: "3 weeks ago",
    email: "a.okonkwo@example.com",
  },
  {
    id: "ca15",
    name: "Sophie Chen",
    currentTitle: "Director of Operations",
    currentCompany: "Lazada",
    location: "Kuala Lumpur, Malaysia",
    seniority: "director",
    source: "inbound",
    matchScore: 80,
    lastContact: "4 days ago",
    email: "sophie.chen@example.com",
  },
];

export const campaigns: Campaign[] = [
  {
    id: "cm1",
    name: "CFO Search — Indorama Outreach Wave 1",
    projectId: "p1",
    status: "active",
    sent: 142,
    opened: 98,
    replied: 27,
    interested: 11,
    startedAt: "2026-05-02",
  },
  {
    id: "cm2",
    name: "OYO VP Ops — Indonesia Senior Leaders",
    projectId: "p2",
    status: "active",
    sent: 89,
    opened: 61,
    replied: 18,
    interested: 7,
    startedAt: "2026-04-28",
  },
  {
    id: "cm3",
    name: "KNS Country Director — Warm Intros",
    projectId: "p3",
    status: "draft",
    sent: 0,
    opened: 0,
    replied: 0,
    interested: 0,
    startedAt: "2026-05-14",
  },
];

export const inboxMessages: InboxMessage[] = [
  {
    id: "m1",
    candidateName: "Rajeev Menon",
    subject: "Re: CFO opportunity at a leading petrochemical group",
    preview:
      "Happy to discuss this further. Could we set up a 30-min call next week? My availability is...",
    classification: "interested",
    receivedAt: "10 min ago",
    campaignId: "cm1",
    unread: true,
  },
  {
    id: "m2",
    candidateName: "Hiroshi Yamamoto",
    subject: "Re: Group CFO role",
    preview:
      "Thank you for reaching out. I'm currently very engaged with my role but would be open to a confidential conversation in Q3...",
    classification: "needs_review",
    receivedAt: "1 hour ago",
    campaignId: "cm1",
    unread: true,
  },
  {
    id: "m3",
    candidateName: "Siti Nurhaliza",
    subject: "Re: VP Operations — Southeast Asia",
    preview:
      "Hi, thanks for the note. I'd love to learn more about the company and the mandate. When works for a call?",
    classification: "interested",
    receivedAt: "3 hours ago",
    campaignId: "cm2",
    unread: true,
  },
  {
    id: "m4",
    candidateName: "James Tan Wei Ming",
    subject: "Out of office",
    preview:
      "I'm currently traveling and will respond on my return on 20 May. For urgent matters, please contact...",
    classification: "out_of_office",
    receivedAt: "5 hours ago",
    campaignId: "cm1",
    unread: false,
  },
  {
    id: "m5",
    candidateName: "Arjun Krishnamurthy",
    subject: "Re: Country Manager opportunity",
    preview:
      "Not the right fit for me at the moment, but I can refer a strong candidate — my former colleague at P&G...",
    classification: "referral",
    receivedAt: "Yesterday",
    campaignId: "cm2",
    unread: false,
  },
  {
    id: "m6",
    candidateName: "Olivia Pemberton",
    subject: "Re: Head of Digital role",
    preview:
      "Appreciate the outreach, but I'm not actively looking. Please remove me from your list.",
    classification: "not_interested",
    receivedAt: "Yesterday",
    campaignId: "cm1",
    unread: false,
  },
  {
    id: "m7",
    candidateName: "Mei Wong",
    subject: "Re: Finance leadership opportunity",
    preview:
      "Yes, this sounds aligned with what I'm exploring. Can you share the full position spec?",
    classification: "interested",
    receivedAt: "2 days ago",
    campaignId: "cm1",
    unread: false,
  },
  {
    id: "m8",
    candidateName: "Daniel O'Connor",
    subject: "Re: Regional VP, Hospitality",
    preview:
      "Interesting timing — I'd be open to a conversation. What's the compensation framework looking like?",
    classification: "interested",
    receivedAt: "2 days ago",
    campaignId: "cm2",
    unread: false,
  },
  {
    id: "m9",
    candidateName: "Vikram Singh",
    subject: "Re: Supply Chain Director",
    preview:
      "Could you tell me more about the company before I commit to anything?",
    classification: "needs_review",
    receivedAt: "3 days ago",
    campaignId: "cm2",
    unread: false,
  },
  {
    id: "m10",
    candidateName: "Sophie Chen",
    subject: "Re: Operations Director opportunity",
    preview:
      "Thanks but I just accepted a new role last month. Best of luck with the search.",
    classification: "not_interested",
    receivedAt: "4 days ago",
    campaignId: "cm2",
    unread: false,
  },
];

export const pipelineEntries: PipelineEntry[] = [
  { id: "pe1", candidateId: "ca1", candidateName: "Rajeev Menon", projectId: "p1", projectTitle: "Group CFO", stage: "submitted_to_client", updatedAt: "Today" },
  { id: "pe2", candidateId: "ca13", candidateName: "Hiroshi Yamamoto", projectId: "p1", projectTitle: "Group CFO", stage: "shortlisted", updatedAt: "Yesterday" },
  { id: "pe3", candidateId: "ca6", candidateName: "Mei Wong", projectId: "p1", projectTitle: "Group CFO", stage: "screening", updatedAt: "2d" },
  { id: "pe4", candidateId: "ca8", candidateName: "Lakshmi Iyer", projectId: "p6", projectTitle: "CPO", stage: "placed", updatedAt: "1w" },
  { id: "pe5", candidateId: "ca2", candidateName: "Siti Nurhaliza", projectId: "p2", projectTitle: "VP Ops SEA", stage: "interview", updatedAt: "Today" },
  { id: "pe6", candidateId: "ca5", candidateName: "Arjun Krishnamurthy", projectId: "p2", projectTitle: "VP Ops SEA", stage: "submitted_to_client", updatedAt: "2d" },
  { id: "pe7", candidateId: "ca14", candidateName: "Amara Okonkwo", projectId: "p2", projectTitle: "VP Ops SEA", stage: "screening", updatedAt: "3d" },
  { id: "pe8", candidateId: "ca12", candidateName: "Ratna Dewi", projectId: "p2", projectTitle: "VP Ops SEA", stage: "applied", updatedAt: "4d" },
  { id: "pe9", candidateId: "ca3", candidateName: "James Tan Wei Ming", projectId: "p3", projectTitle: "Country Director", stage: "shortlisted", updatedAt: "Yesterday" },
  { id: "pe10", candidateId: "ca10", candidateName: "Priscilla Lim", projectId: "p3", projectTitle: "Country Director", stage: "screening", updatedAt: "2d" },
  { id: "pe11", candidateId: "ca4", candidateName: "Olivia Pemberton", projectId: "p4", projectTitle: "Head of Digital", stage: "interview", updatedAt: "Today" },
  { id: "pe12", candidateId: "ca15", candidateName: "Sophie Chen", projectId: "p4", projectTitle: "Head of Digital", stage: "shortlisted", updatedAt: "3d" },
  { id: "pe13", candidateId: "ca11", candidateName: "Vikram Singh", projectId: "p7", projectTitle: "Head of Supply Chain", stage: "applied", updatedAt: "1w" },
  { id: "pe14", candidateId: "ca7", candidateName: "Bambang Hartono", projectId: "p8", projectTitle: "Plant GM", stage: "applied", updatedAt: "2d" },
  { id: "pe15", candidateId: "ca9", candidateName: "Daniel O'Connor", projectId: "p5", projectTitle: "Regional Sales Director", stage: "offer", updatedAt: "Yesterday" },
  { id: "pe16", candidateId: "ca6", candidateName: "Mei Wong", projectId: "p5", projectTitle: "Regional Sales Director", stage: "rejected", updatedAt: "1w" },
  { id: "pe17", candidateId: "ca2", candidateName: "Siti Nurhaliza", projectId: "p4", projectTitle: "Head of Digital", stage: "applied", updatedAt: "5d" },
  { id: "pe18", candidateId: "ca5", candidateName: "Arjun Krishnamurthy", projectId: "p3", projectTitle: "Country Director", stage: "applied", updatedAt: "3d" },
  { id: "pe19", candidateId: "ca10", candidateName: "Priscilla Lim", projectId: "p5", projectTitle: "Regional Sales Director", stage: "submitted_to_client", updatedAt: "Today" },
  { id: "pe20", candidateId: "ca8", candidateName: "Lakshmi Iyer", projectId: "p2", projectTitle: "VP Ops SEA", stage: "shortlisted", updatedAt: "2d" },
];

export const unreadInboxCount = inboxMessages.filter((m) => m.unread).length;
