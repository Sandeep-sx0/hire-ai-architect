export type JobSeniority = "C-Suite" | "VP" | "Director" | "Manager";
export type JobWorkModel = "On-site" | "Hybrid" | "Remote";

export interface PublicJob {
  id: string;
  title: string;
  company: string;
  location: string;
  city: string; // for filter matching
  workModel: JobWorkModel;
  seniority: JobSeniority;
  experience: string;
  function: string;
  industry: string;
  skills: string[];
  postedDaysAgo: number;
  datePosted: string; // ISO
}

const iso = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
};

export const PUBLIC_JOBS: PublicJob[] = [
  {
    id: "cfo-indorama",
    title: "Chief Financial Officer",
    company: "Indorama Ventures",
    location: "Jakarta, Indonesia",
    city: "Jakarta",
    workModel: "Hybrid",
    seniority: "C-Suite",
    experience: "15–20 years experience",
    function: "Finance & Accounting",
    industry: "Manufacturing",
    skills: ["Financial Planning", "IFRS", "M&A", "Treasury"],
    postedDaysAgo: 3,
    datePosted: iso(3),
  },
  {
    id: "vp-ops-oyo",
    title: "VP Operations — Southeast Asia",
    company: "OYO Hotels",
    location: "Jakarta, Indonesia",
    city: "Jakarta",
    workModel: "On-site",
    seniority: "VP",
    experience: "12–18 years experience",
    function: "Operations",
    industry: "Hospitality",
    skills: ["Operations", "P&L", "Hospitality", "Team Leadership"],
    postedDaysAgo: 7,
    datePosted: iso(7),
  },
  {
    id: "country-dir-kns",
    title: "Country Director — Indonesia",
    company: "KNS Group",
    location: "Jakarta, Indonesia",
    city: "Jakarta",
    workModel: "On-site",
    seniority: "Director",
    experience: "10–15 years experience",
    function: "General Management",
    industry: "Manufacturing",
    skills: ["General Management", "Manufacturing", "Strategy"],
    postedDaysAgo: 5,
    datePosted: iso(5),
  },
  {
    id: "head-digital-stylo",
    title: "Head of Digital Transformation",
    company: "Stylo International",
    location: "Jakarta, Indonesia",
    city: "Jakarta",
    workModel: "Hybrid",
    seniority: "Director",
    experience: "8–12 years experience",
    function: "Technology",
    industry: "Consumer Goods",
    skills: ["Digital Strategy", "E-commerce", "Data Analytics"],
    postedDaysAgo: 1,
    datePosted: iso(1),
  },
  {
    id: "rsd-oasis",
    title: "Regional Sales Director — APAC",
    company: "Oasis Water International",
    location: "Singapore",
    city: "Singapore",
    workModel: "Hybrid",
    seniority: "Director",
    experience: "10–15 years experience",
    function: "Sales",
    industry: "F&B",
    skills: ["Sales Leadership", "FMCG", "Distribution"],
    postedDaysAgo: 14,
    datePosted: iso(14),
  },
  {
    id: "plant-mgr-kns",
    title: "Plant Manager — Cikarang",
    company: "KNS Group",
    location: "Cikarang, Indonesia",
    city: "Cikarang",
    workModel: "On-site",
    seniority: "Manager",
    experience: "8–12 years experience",
    function: "Operations",
    industry: "Manufacturing",
    skills: ["Manufacturing", "Lean", "Quality Management"],
    postedDaysAgo: 21,
    datePosted: iso(21),
  },
];

export function postedLabel(days: number): string {
  if (days <= 0) return "Posted today";
  if (days === 1) return "Posted 1 day ago";
  if (days < 7) return `Posted ${days} days ago`;
  if (days < 14) return "Posted 1 week ago";
  if (days < 30) return `Posted ${Math.floor(days / 7)} weeks ago`;
  return `Posted ${Math.floor(days / 30)} month${days >= 60 ? "s" : ""} ago`;
}
