import { score } from "./src/backend/scoring";
import type { ScoringInput, Verdict } from "./src/backend/scoring";

type Row = {
  name: string;
  industry: string;
  expected: Verdict;
  i: Omit<ScoringInput, "workflowDescription">;
  note?: string;
};

// Expected verdict = what a reasonable consultant/operator would conclude.
// Inputs are realistic for each named workflow.
const W: Row[] = [
  // ── OPERATIONS ────────────────────────────────────────────────
  { name:"Meeting notes summarization", industry:"Operations", expected:"BUY",
    i:{volume:2000,timePerRun:"10-30min",laborCost:"20-50",errorImpact:"Low",repeatability:"Standardized",judgment:"Low",workflowNature:"Communication",dataReadiness:"Ready",sensitivity:"Internal",integration:"Standalone",engCapacity:"Limited",budget:"Small",timeline:"3months"} },
  { name:"Internal ticket categorization", industry:"Operations", expected:"BUY",
    i:{volume:8000,timePerRun:"2-10min",laborCost:"20-50",errorImpact:"Low",repeatability:"Standardized",judgment:"Low",workflowNature:"DigitalOps",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Moderate",budget:"Medium",timeline:"3months"} },
  { name:"SOP document generation", industry:"Operations", expected:"BUY",
    i:{volume:300,timePerRun:"30-60min",laborCost:"20-50",errorImpact:"Low",repeatability:"Somewhat",judgment:"Moderate",workflowNature:"Knowledge",dataReadiness:"Partial",sensitivity:"Internal",integration:"Standalone",engCapacity:"Limited",budget:"Small",timeline:"3months"} },
  { name:"Facilities work-order routing", industry:"Operations", expected:"BUY",
    i:{volume:5000,timePerRun:"2-10min",laborCost:"<20",errorImpact:"Medium",repeatability:"Standardized",judgment:"Low",workflowNature:"DigitalOps",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Limited",budget:"Small",timeline:"3months"} },
  { name:"Inventory reconciliation", industry:"Operations", expected:"BUILD",
    i:{volume:10000,timePerRun:"2-10min",laborCost:"20-50",errorImpact:"Medium",repeatability:"Highly",judgment:"Low",workflowNature:"DataProc",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Strong",budget:"Medium",timeline:"Flexible"} },
  { name:"Vendor onboarding compliance check", industry:"Operations", expected:"HYBRID",
    i:{volume:500,timePerRun:"30-60min",laborCost:"50-100",errorImpact:"High",repeatability:"Standardized",judgment:"Moderate",workflowNature:"Knowledge",dataReadiness:"Partial",sensitivity:"Confidential",integration:"Many",engCapacity:"Moderate",budget:"Medium",timeline:"3months"} },

  // ── FINANCE ───────────────────────────────────────────────────
  { name:"Invoice data extraction (AP)", industry:"Finance", expected:"BUILD",
    i:{volume:10000,timePerRun:"2-10min",laborCost:"20-50",errorImpact:"Medium",repeatability:"Highly",judgment:"Low",workflowNature:"DataProc",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Moderate",budget:"Medium",timeline:"3months"} },
  { name:"Expense report auditing", industry:"Finance", expected:"BUY",
    i:{volume:5000,timePerRun:"2-10min",laborCost:"20-50",errorImpact:"Medium",repeatability:"Standardized",judgment:"Low",workflowNature:"DataProc",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Limited",budget:"Small",timeline:"3months"} },
  { name:"Payroll processing", industry:"Finance", expected:"BUY",
    i:{volume:2000,timePerRun:"<2min",laborCost:"20-50",errorImpact:"High",repeatability:"Highly",judgment:"Low",workflowNature:"DigitalOps",dataReadiness:"Ready",sensitivity:"Confidential",integration:"Few",engCapacity:"Limited",budget:"Small",timeline:"1month"} },
  { name:"Month-end close reconciliation", industry:"Finance", expected:"HYBRID",
    i:{volume:200,timePerRun:"60+min",laborCost:"50-100",errorImpact:"High",repeatability:"Standardized",judgment:"Moderate",workflowNature:"DataProc",dataReadiness:"Partial",sensitivity:"Confidential",integration:"Many",engCapacity:"Moderate",budget:"Medium",timeline:"3months"} },
  { name:"Regulatory FX compliance reporting", industry:"Finance", expected:"HYBRID",
    i:{volume:500,timePerRun:"60+min",laborCost:"100+",errorImpact:"Critical",repeatability:"Standardized",judgment:"High",workflowNature:"DataProc",dataReadiness:"Partial",sensitivity:"Regulated",integration:"Enterprise",engCapacity:"Moderate",budget:"Large",timeline:"3months"} },
  { name:"Fraud transaction screening", industry:"Finance", expected:"BUILD",
    i:{volume:50000,timePerRun:"<2min",laborCost:"50-100",errorImpact:"High",repeatability:"Highly",judgment:"Low",workflowNature:"DataProc",dataReadiness:"Ready",sensitivity:"Confidential",integration:"Few",engCapacity:"Strong",budget:"Large",timeline:"Flexible"} },
  { name:"Tax filing prep (SMB)", industry:"Finance", expected:"HYBRID",
    i:{volume:100,timePerRun:"60+min",laborCost:"50-100",errorImpact:"Critical",repeatability:"Standardized",judgment:"High",workflowNature:"Knowledge",dataReadiness:"Partial",sensitivity:"Regulated",integration:"Few",engCapacity:"Limited",budget:"Small",timeline:"3months"} },
  { name:"Budget variance commentary", industry:"Finance", expected:"BUY",
    i:{volume:300,timePerRun:"30-60min",laborCost:"50-100",errorImpact:"Low",repeatability:"Somewhat",judgment:"Moderate",workflowNature:"Knowledge",dataReadiness:"Ready",sensitivity:"Internal",integration:"Standalone",engCapacity:"Limited",budget:"Small",timeline:"3months"} },

  // ── HEALTHCARE ────────────────────────────────────────────────
  { name:"Medical coding (ICD-10)", industry:"Healthcare", expected:"HYBRID",
    i:{volume:5000,timePerRun:"10-30min",laborCost:"50-100",errorImpact:"Critical",repeatability:"Standardized",judgment:"Moderate",workflowNature:"Knowledge",dataReadiness:"Partial",sensitivity:"Regulated",integration:"Enterprise",engCapacity:"Moderate",budget:"Medium",timeline:"3months"} },
  { name:"Prior authorization review", industry:"Healthcare", expected:"HYBRID",
    i:{volume:500,timePerRun:"30-60min",laborCost:"50-100",errorImpact:"Critical",repeatability:"Standardized",judgment:"High",workflowNature:"Knowledge",dataReadiness:"Ready",sensitivity:"Regulated",integration:"Many",engCapacity:"Moderate",budget:"Medium",timeline:"3months"} },
  { name:"Appointment scheduling/reminders", industry:"Healthcare", expected:"HYBRID",
    i:{volume:10000,timePerRun:"2-10min",laborCost:"20-50",errorImpact:"Low",repeatability:"Highly",judgment:"Low",workflowNature:"DigitalOps",dataReadiness:"Ready",sensitivity:"Regulated",integration:"Few",engCapacity:"Moderate",budget:"Medium",timeline:"3months"} },
  { name:"Clinical note transcription", industry:"Healthcare", expected:"HYBRID",
    i:{volume:5000,timePerRun:"10-30min",laborCost:"100+",errorImpact:"Critical",repeatability:"Standardized",judgment:"Moderate",workflowNature:"Knowledge",dataReadiness:"Partial",sensitivity:"Regulated",integration:"Enterprise",engCapacity:"Moderate",budget:"Large",timeline:"3months"} },
  { name:"Radiology report drafting", industry:"Healthcare", expected:"HYBRID",
    i:{volume:2000,timePerRun:"30-60min",laborCost:"100+",errorImpact:"Critical",repeatability:"Standardized",judgment:"High",workflowNature:"Knowledge",dataReadiness:"Ready",sensitivity:"Regulated",integration:"Enterprise",engCapacity:"Strong",budget:"Large",timeline:"3months"} },
  { name:"Patient intake form processing", industry:"Healthcare", expected:"HYBRID",
    i:{volume:8000,timePerRun:"2-10min",laborCost:"20-50",errorImpact:"High",repeatability:"Standardized",judgment:"Low",workflowNature:"DataProc",dataReadiness:"Partial",sensitivity:"Regulated",integration:"Many",engCapacity:"Moderate",budget:"Medium",timeline:"3months"} },
  { name:"Surgical instrument sterilization", industry:"Healthcare", expected:"DON'T",
    i:{volume:20000,timePerRun:"2-10min",laborCost:"20-50",errorImpact:"Critical",repeatability:"Highly",judgment:"Low",workflowNature:"Physical",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Moderate",budget:"Medium",timeline:"3months"}, note:"physical" },

  // ── INSURANCE ─────────────────────────────────────────────────
  { name:"Claims intake triage", industry:"Insurance", expected:"BUILD",
    i:{volume:5000,timePerRun:"10-30min",laborCost:"20-50",errorImpact:"High",repeatability:"Standardized",judgment:"Moderate",workflowNature:"Knowledge",dataReadiness:"Partial",sensitivity:"Internal",integration:"Few",engCapacity:"Moderate",budget:"Medium",timeline:"3months"} },
  { name:"Complex commercial underwriting", industry:"Insurance", expected:"HYBRID",
    i:{volume:200,timePerRun:"60+min",laborCost:"100+",errorImpact:"Critical",repeatability:"Somewhat",judgment:"Critical",workflowNature:"Knowledge",dataReadiness:"Partial",sensitivity:"Confidential",integration:"Many",engCapacity:"Moderate",budget:"Medium",timeline:"3months"} },
  { name:"Document fraud detection", industry:"Insurance", expected:"BUILD",
    i:{volume:20000,timePerRun:"2-10min",laborCost:"50-100",errorImpact:"High",repeatability:"Standardized",judgment:"Moderate",workflowNature:"DataProc",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Strong",budget:"Large",timeline:"Flexible"} },
  { name:"Policy renewal letters", industry:"Insurance", expected:"BUY",
    i:{volume:10000,timePerRun:"2-10min",laborCost:"20-50",errorImpact:"Low",repeatability:"Highly",judgment:"Low",workflowNature:"Communication",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Limited",budget:"Small",timeline:"3months"} },
  { name:"First-notice-of-loss call logging", industry:"Insurance", expected:"BUY",
    i:{volume:8000,timePerRun:"2-10min",laborCost:"20-50",errorImpact:"Medium",repeatability:"Standardized",judgment:"Low",workflowNature:"Communication",dataReadiness:"Partial",sensitivity:"Internal",integration:"Few",engCapacity:"Moderate",budget:"Medium",timeline:"3months"} },

  // ── LEGAL ─────────────────────────────────────────────────────
  { name:"Contract review (high judgment)", industry:"Legal", expected:"HYBRID",
    i:{volume:500,timePerRun:"30-60min",laborCost:"100+",errorImpact:"High",repeatability:"Standardized",judgment:"High",workflowNature:"Knowledge",dataReadiness:"Ready",sensitivity:"Confidential",integration:"Few",engCapacity:"Moderate",budget:"Medium",timeline:"3months"} },
  { name:"NDA clause extraction", industry:"Legal", expected:"BUILD",
    i:{volume:2000,timePerRun:"10-30min",laborCost:"100+",errorImpact:"Medium",repeatability:"Standardized",judgment:"Low",workflowNature:"DataProc",dataReadiness:"Ready",sensitivity:"Confidential",integration:"Few",engCapacity:"Moderate",budget:"Medium",timeline:"3months"} },
  { name:"E-discovery document triage", industry:"Legal", expected:"BUILD",
    i:{volume:50000,timePerRun:"<2min",laborCost:"50-100",errorImpact:"High",repeatability:"Standardized",judgment:"Moderate",workflowNature:"DataProc",dataReadiness:"Ready",sensitivity:"Confidential",integration:"Few",engCapacity:"Strong",budget:"Large",timeline:"Flexible"} },
  { name:"Legal research memo drafting", industry:"Legal", expected:"HYBRID",
    i:{volume:300,timePerRun:"60+min",laborCost:"100+",errorImpact:"High",repeatability:"Somewhat",judgment:"High",workflowNature:"Knowledge",dataReadiness:"Partial",sensitivity:"Confidential",integration:"Standalone",engCapacity:"Limited",budget:"Small",timeline:"3months"} },
  { name:"Litigation deadline docketing", industry:"Legal", expected:"BUY",
    i:{volume:2000,timePerRun:"2-10min",laborCost:"50-100",errorImpact:"Critical",repeatability:"Highly",judgment:"Low",workflowNature:"DataProc",dataReadiness:"Ready",sensitivity:"Confidential",integration:"Few",engCapacity:"Limited",budget:"Small",timeline:"3months"} },

  // ── GOVERNMENT ────────────────────────────────────────────────
  { name:"Permit application review", industry:"Government", expected:"HYBRID",
    i:{volume:1000,timePerRun:"30-60min",laborCost:"50-100",errorImpact:"High",repeatability:"Standardized",judgment:"Moderate",workflowNature:"Knowledge",dataReadiness:"Partial",sensitivity:"Internal",integration:"Enterprise",engCapacity:"Limited",budget:"Small",timeline:"3months"} },
  { name:"Benefits eligibility determination", industry:"Government", expected:"HYBRID",
    i:{volume:10000,timePerRun:"10-30min",laborCost:"20-50",errorImpact:"Critical",repeatability:"Standardized",judgment:"Moderate",workflowNature:"DataProc",dataReadiness:"Ready",sensitivity:"Regulated",integration:"Enterprise",engCapacity:"Moderate",budget:"Large",timeline:"Flexible"} },
  { name:"FOIA request redaction", industry:"Government", expected:"HYBRID",
    i:{volume:2000,timePerRun:"30-60min",laborCost:"20-50",errorImpact:"High",repeatability:"Standardized",judgment:"Moderate",workflowNature:"DataProc",dataReadiness:"Partial",sensitivity:"Regulated",integration:"Many",engCapacity:"Limited",budget:"Medium",timeline:"3months"} },
  { name:"311 citizen request routing", industry:"Government", expected:"BUY",
    i:{volume:30000,timePerRun:"2-10min",laborCost:"20-50",errorImpact:"Low",repeatability:"Standardized",judgment:"Low",workflowNature:"Communication",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Moderate",budget:"Medium",timeline:"3months"} },
  { name:"Tax return anomaly flagging", industry:"Government", expected:"BUILD",
    i:{volume:50000,timePerRun:"<2min",laborCost:"50-100",errorImpact:"High",repeatability:"Highly",judgment:"Low",workflowNature:"DataProc",dataReadiness:"Ready",sensitivity:"Regulated",integration:"Enterprise",engCapacity:"Strong",budget:"Large",timeline:"Flexible"} },

  // ── MANUFACTURING ─────────────────────────────────────────────
  { name:"Visual defect detection (line)", industry:"Manufacturing", expected:"DON'T",
    i:{volume:100000,timePerRun:"<2min",laborCost:"20-50",errorImpact:"High",repeatability:"Highly",judgment:"Low",workflowNature:"Physical",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Strong",budget:"Large",timeline:"Flexible"}, note:"physical" },
  { name:"Production scheduling optimization", industry:"Manufacturing", expected:"BUILD",
    i:{volume:1000,timePerRun:"30-60min",laborCost:"50-100",errorImpact:"High",repeatability:"Standardized",judgment:"Moderate",workflowNature:"DataProc",dataReadiness:"Ready",sensitivity:"Internal",integration:"Many",engCapacity:"Strong",budget:"Large",timeline:"Flexible"} },
  { name:"Supplier quality report parsing", industry:"Manufacturing", expected:"BUY",
    i:{volume:2000,timePerRun:"10-30min",laborCost:"20-50",errorImpact:"Medium",repeatability:"Standardized",judgment:"Low",workflowNature:"DataProc",dataReadiness:"Partial",sensitivity:"Internal",integration:"Few",engCapacity:"Moderate",budget:"Medium",timeline:"3months"} },
  { name:"Machine maintenance log entry", industry:"Manufacturing", expected:"DON'T",
    i:{volume:5000,timePerRun:"2-10min",laborCost:"20-50",errorImpact:"Medium",repeatability:"Highly",judgment:"Low",workflowNature:"Mixed",dataReadiness:"Messy",sensitivity:"Internal",integration:"Standalone",engCapacity:"None",budget:"Micro",timeline:"Immediate"}, note:"weak feasibility + messy" },
  { name:"Predictive maintenance modeling", industry:"Manufacturing", expected:"BUILD",
    i:{volume:5000,timePerRun:"2-10min",laborCost:"50-100",errorImpact:"High",repeatability:"Highly",judgment:"Low",workflowNature:"DataProc",dataReadiness:"Ready",sensitivity:"Internal",integration:"Many",engCapacity:"Strong",budget:"Large",timeline:"Flexible"} },

  // ── LOGISTICS ─────────────────────────────────────────────────
  { name:"Pick and pack (warehouse)", industry:"Logistics", expected:"DON'T",
    i:{volume:50000,timePerRun:"2-10min",laborCost:"<20",errorImpact:"Low",repeatability:"Highly",judgment:"Low",workflowNature:"Physical",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Moderate",budget:"Medium",timeline:"Flexible"}, note:"physical" },
  { name:"Shipment tracking alerts", industry:"Logistics", expected:"BUY",
    i:{volume:100000,timePerRun:"<2min",laborCost:"<20",errorImpact:"Low",repeatability:"Highly",judgment:"Low",workflowNature:"DigitalOps",dataReadiness:"Ready",sensitivity:"Internal",integration:"Many",engCapacity:"Moderate",budget:"Small",timeline:"3months"} },
  { name:"Freight invoice auditing", industry:"Logistics", expected:"BUILD",
    i:{volume:10000,timePerRun:"2-10min",laborCost:"20-50",errorImpact:"Medium",repeatability:"Highly",judgment:"Low",workflowNature:"DataProc",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Strong",budget:"Medium",timeline:"Flexible"} },
  { name:"Route optimization", industry:"Logistics", expected:"BUY",
    i:{volume:5000,timePerRun:"2-10min",laborCost:"20-50",errorImpact:"Medium",repeatability:"Standardized",judgment:"Low",workflowNature:"DataProc",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Limited",budget:"Small",timeline:"3months"} },
  { name:"Customs documentation prep", industry:"Logistics", expected:"HYBRID",
    i:{volume:2000,timePerRun:"10-30min",laborCost:"20-50",errorImpact:"High",repeatability:"Standardized",judgment:"Moderate",workflowNature:"DataProc",dataReadiness:"Partial",sensitivity:"Regulated",integration:"Many",engCapacity:"Moderate",budget:"Medium",timeline:"3months"} },

  // ── RETAIL ────────────────────────────────────────────────────
  { name:"Product catalog enrichment", industry:"Retail", expected:"BUY",
    i:{volume:50000,timePerRun:"<2min",laborCost:"<20",errorImpact:"Low",repeatability:"Highly",judgment:"Low",workflowNature:"DataProc",dataReadiness:"Partial",sensitivity:"Public",integration:"Standalone",engCapacity:"Limited",budget:"Small",timeline:"Flexible"} },
  { name:"Customer review response", industry:"Retail", expected:"BUY",
    i:{volume:5000,timePerRun:"2-10min",laborCost:"<20",errorImpact:"Medium",repeatability:"Somewhat",judgment:"Moderate",workflowNature:"Communication",dataReadiness:"Ready",sensitivity:"Public",integration:"Standalone",engCapacity:"None",budget:"Micro",timeline:"3months"} },
  { name:"Demand forecasting", industry:"Retail", expected:"BUY",
    i:{volume:1000,timePerRun:"30-60min",laborCost:"50-100",errorImpact:"Medium",repeatability:"Standardized",judgment:"Moderate",workflowNature:"DataProc",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Moderate",budget:"Medium",timeline:"3months"} },
  { name:"Planogram shelf restocking", industry:"Retail", expected:"DON'T",
    i:{volume:20000,timePerRun:"2-10min",laborCost:"<20",errorImpact:"Low",repeatability:"Highly",judgment:"Low",workflowNature:"Physical",dataReadiness:"Ready",sensitivity:"Internal",integration:"Standalone",engCapacity:"Limited",budget:"Small",timeline:"3months"}, note:"physical" },
  { name:"Returns fraud screening", industry:"Retail", expected:"BUILD",
    i:{volume:20000,timePerRun:"2-10min",laborCost:"20-50",errorImpact:"Medium",repeatability:"Highly",judgment:"Low",workflowNature:"DataProc",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Strong",budget:"Medium",timeline:"Flexible"} },
  { name:"Price match verification", industry:"Retail", expected:"BUY",
    i:{volume:8000,timePerRun:"2-10min",laborCost:"<20",errorImpact:"Low",repeatability:"Standardized",judgment:"Low",workflowNature:"DigitalOps",dataReadiness:"Ready",sensitivity:"Public",integration:"Few",engCapacity:"Limited",budget:"Small",timeline:"3months"} },

  // ── CUSTOMER SUPPORT ──────────────────────────────────────────
  { name:"Email triage & routing", industry:"Support", expected:"BUY",
    i:{volume:10000,timePerRun:"2-10min",laborCost:"20-50",errorImpact:"Low",repeatability:"Standardized",judgment:"Low",workflowNature:"Communication",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Moderate",budget:"Small",timeline:"3months"} },
  { name:"Tier-1 chatbot deflection", industry:"Support", expected:"BUY",
    i:{volume:50000,timePerRun:"2-10min",laborCost:"20-50",errorImpact:"Low",repeatability:"Standardized",judgment:"Low",workflowNature:"Communication",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Moderate",budget:"Medium",timeline:"3months"} },
  { name:"Knowledge base article drafting", industry:"Support", expected:"BUY",
    i:{volume:500,timePerRun:"30-60min",laborCost:"20-50",errorImpact:"Low",repeatability:"Somewhat",judgment:"Moderate",workflowNature:"Knowledge",dataReadiness:"Ready",sensitivity:"Internal",integration:"Standalone",engCapacity:"Limited",budget:"Small",timeline:"3months"} },
  { name:"Complex escalation resolution", industry:"Support", expected:"DON'T",
    i:{volume:500,timePerRun:"30-60min",laborCost:"20-50",errorImpact:"High",repeatability:"AdHoc",judgment:"High",workflowNature:"Knowledge",dataReadiness:"Messy",sensitivity:"Internal",integration:"Many",engCapacity:"None",budget:"Micro",timeline:"Immediate"}, note:"adhoc+messy+no feasibility" },
  { name:"Live chat first-response", industry:"Support", expected:"HYBRID",
    i:{volume:30000,timePerRun:"2-10min",laborCost:"20-50",errorImpact:"Medium",repeatability:"Somewhat",judgment:"Moderate",workflowNature:"Communication",dataReadiness:"Partial",sensitivity:"Internal",integration:"Few",engCapacity:"Moderate",budget:"Medium",timeline:"3months"} },
  { name:"Sentiment/CSAT analysis", industry:"Support", expected:"BUY",
    i:{volume:20000,timePerRun:"<2min",laborCost:"20-50",errorImpact:"Low",repeatability:"Highly",judgment:"Low",workflowNature:"DataProc",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Limited",budget:"Small",timeline:"3months"} },

  // ── HR ────────────────────────────────────────────────────────
  { name:"Resume screening", industry:"HR", expected:"BUY",
    i:{volume:2000,timePerRun:"10-30min",laborCost:"20-50",errorImpact:"Medium",repeatability:"Standardized",judgment:"Moderate",workflowNature:"Knowledge",dataReadiness:"Partial",sensitivity:"Internal",integration:"Standalone",engCapacity:"Limited",budget:"Small",timeline:"3months"} },
  { name:"Onboarding document generation", industry:"HR", expected:"BUY",
    i:{volume:500,timePerRun:"10-30min",laborCost:"20-50",errorImpact:"Low",repeatability:"Highly",judgment:"Low",workflowNature:"Communication",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"None",budget:"Micro",timeline:"Flexible"} },
  { name:"Performance review synthesis", industry:"HR", expected:"BUY",
    i:{volume:200,timePerRun:"30-60min",laborCost:"50-100",errorImpact:"High",repeatability:"Somewhat",judgment:"High",workflowNature:"Knowledge",dataReadiness:"Partial",sensitivity:"Confidential",integration:"Standalone",engCapacity:"Limited",budget:"Small",timeline:"3months"} },
  { name:"Benefits Q&A helpdesk", industry:"HR", expected:"BUY",
    i:{volume:5000,timePerRun:"2-10min",laborCost:"20-50",errorImpact:"Medium",repeatability:"Standardized",judgment:"Low",workflowNature:"Communication",dataReadiness:"Ready",sensitivity:"Confidential",integration:"Few",engCapacity:"Limited",budget:"Small",timeline:"3months"} },
  { name:"Payroll dispute investigation", industry:"HR", expected:"DON'T",
    i:{volume:200,timePerRun:"30-60min",laborCost:"20-50",errorImpact:"High",repeatability:"AdHoc",judgment:"High",workflowNature:"Knowledge",dataReadiness:"Messy",sensitivity:"Confidential",integration:"Many",engCapacity:"None",budget:"Micro",timeline:"Immediate"}, note:"adhoc+messy" },

  // ── MARKETING ─────────────────────────────────────────────────
  { name:"Social media post generation", industry:"Marketing", expected:"BUY",
    i:{volume:500,timePerRun:"10-30min",laborCost:"20-50",errorImpact:"Low",repeatability:"Somewhat",judgment:"Moderate",workflowNature:"Communication",dataReadiness:"Ready",sensitivity:"Public",integration:"Standalone",engCapacity:"None",budget:"Micro",timeline:"Immediate"} },
  { name:"SEO meta-tag generation", industry:"Marketing", expected:"BUY",
    i:{volume:10000,timePerRun:"<2min",laborCost:"20-50",errorImpact:"Low",repeatability:"Highly",judgment:"Low",workflowNature:"Communication",dataReadiness:"Ready",sensitivity:"Public",integration:"Few",engCapacity:"Limited",budget:"Small",timeline:"3months"} },
  { name:"Email campaign personalization", industry:"Marketing", expected:"BUY",
    i:{volume:50000,timePerRun:"<2min",laborCost:"20-50",errorImpact:"Low",repeatability:"Highly",judgment:"Low",workflowNature:"Communication",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Moderate",budget:"Medium",timeline:"3months"} },
  { name:"Ad copy A/B variant generation", industry:"Marketing", expected:"BUY",
    i:{volume:2000,timePerRun:"2-10min",laborCost:"20-50",errorImpact:"Low",repeatability:"Standardized",judgment:"Low",workflowNature:"Communication",dataReadiness:"Ready",sensitivity:"Public",integration:"Standalone",engCapacity:"None",budget:"Micro",timeline:"Flexible"} },
  { name:"Brand strategy development", industry:"Marketing", expected:"DON'T",
    i:{volume:20,timePerRun:"60+min",laborCost:"100+",errorImpact:"Medium",repeatability:"AdHoc",judgment:"Critical",workflowNature:"Knowledge",dataReadiness:"Messy",sensitivity:"Internal",integration:"Standalone",engCapacity:"None",budget:"Micro",timeline:"Flexible"}, note:"low vol expert creative" },

  // ── SALES ─────────────────────────────────────────────────────
  { name:"Lead enrichment & scoring", industry:"Sales", expected:"BUY",
    i:{volume:10000,timePerRun:"2-10min",laborCost:"20-50",errorImpact:"Low",repeatability:"Standardized",judgment:"Low",workflowNature:"DataProc",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Moderate",budget:"Medium",timeline:"3months"} },
  { name:"CRM data entry from emails", industry:"Sales", expected:"BUY",
    i:{volume:8000,timePerRun:"2-10min",laborCost:"20-50",errorImpact:"Low",repeatability:"Standardized",judgment:"Low",workflowNature:"DigitalOps",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Limited",budget:"Small",timeline:"3months"} },
  { name:"Proposal/quote drafting", industry:"Sales", expected:"BUY",
    i:{volume:1000,timePerRun:"30-60min",laborCost:"50-100",errorImpact:"Medium",repeatability:"Standardized",judgment:"Moderate",workflowNature:"Knowledge",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Limited",budget:"Small",timeline:"3months"} },
  { name:"Call transcript summarization", industry:"Sales", expected:"BUY",
    i:{volume:5000,timePerRun:"10-30min",laborCost:"50-100",errorImpact:"Low",repeatability:"Standardized",judgment:"Low",workflowNature:"Communication",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Moderate",budget:"Medium",timeline:"3months"} },
  { name:"Enterprise deal strategy", industry:"Sales", expected:"DON'T",
    i:{volume:50,timePerRun:"60+min",laborCost:"100+",errorImpact:"High",repeatability:"AdHoc",judgment:"Critical",workflowNature:"Knowledge",dataReadiness:"Messy",sensitivity:"Confidential",integration:"Many",engCapacity:"Limited",budget:"Small",timeline:"3months"}, note:"adhoc expert" },

  // ── ENGINEERING ───────────────────────────────────────────────
  { name:"Automated code review (lint/sec)", industry:"Engineering", expected:"BUILD",
    i:{volume:50000,timePerRun:"<2min",laborCost:"50-100",errorImpact:"High",repeatability:"Highly",judgment:"Low",workflowNature:"DataProc",dataReadiness:"Ready",sensitivity:"Internal",integration:"Standalone",engCapacity:"Strong",budget:"Medium",timeline:"Flexible"} },
  { name:"Regression test execution", industry:"Engineering", expected:"BUILD",
    i:{volume:5000,timePerRun:"2-10min",laborCost:"50-100",errorImpact:"High",repeatability:"Highly",judgment:"Low",workflowNature:"DigitalOps",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Strong",budget:"Medium",timeline:"Flexible"} },
  { name:"Bug triage from reports", industry:"Engineering", expected:"BUY",
    i:{volume:3000,timePerRun:"2-10min",laborCost:"50-100",errorImpact:"Medium",repeatability:"Standardized",judgment:"Moderate",workflowNature:"Knowledge",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Moderate",budget:"Medium",timeline:"3months"} },
  { name:"Exploratory test planning", industry:"Engineering", expected:"BUY",
    i:{volume:200,timePerRun:"60+min",laborCost:"50-100",errorImpact:"High",repeatability:"AdHoc",judgment:"High",workflowNature:"Knowledge",dataReadiness:"Partial",sensitivity:"Internal",integration:"Standalone",engCapacity:"Moderate",budget:"Small",timeline:"3months"} },
  { name:"API documentation generation", industry:"Engineering", expected:"BUY",
    i:{volume:2000,timePerRun:"2-10min",laborCost:"50-100",errorImpact:"Low",repeatability:"Highly",judgment:"Low",workflowNature:"DataProc",dataReadiness:"Ready",sensitivity:"Internal",integration:"Standalone",engCapacity:"Strong",budget:"Medium",timeline:"Flexible"} },

  // ── IT ────────────────────────────────────────────────────────
  { name:"Password reset automation", industry:"IT", expected:"BUY",
    i:{volume:10000,timePerRun:"2-10min",laborCost:"20-50",errorImpact:"Medium",repeatability:"Highly",judgment:"Low",workflowNature:"DigitalOps",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Moderate",budget:"Medium",timeline:"3months"} },
  { name:"Log anomaly detection", industry:"IT", expected:"BUILD",
    i:{volume:100000,timePerRun:"<2min",laborCost:"50-100",errorImpact:"High",repeatability:"Highly",judgment:"Low",workflowNature:"DataProc",dataReadiness:"Ready",sensitivity:"Internal",integration:"Many",engCapacity:"Strong",budget:"Large",timeline:"Flexible"} },
  { name:"Access provisioning requests", industry:"IT", expected:"BUY",
    i:{volume:5000,timePerRun:"2-10min",laborCost:"20-50",errorImpact:"High",repeatability:"Standardized",judgment:"Low",workflowNature:"DigitalOps",dataReadiness:"Ready",sensitivity:"Confidential",integration:"Many",engCapacity:"Moderate",budget:"Medium",timeline:"3months"} },
  { name:"Incident postmortem drafting", industry:"IT", expected:"BUY",
    i:{volume:300,timePerRun:"30-60min",laborCost:"50-100",errorImpact:"Medium",repeatability:"Somewhat",judgment:"Moderate",workflowNature:"Knowledge",dataReadiness:"Partial",sensitivity:"Internal",integration:"Standalone",engCapacity:"Strong",budget:"Medium",timeline:"3months"} },
  { name:"Hardware asset cabling/setup", industry:"IT", expected:"DON'T",
    i:{volume:2000,timePerRun:"30-60min",laborCost:"20-50",errorImpact:"Medium",repeatability:"Standardized",judgment:"Low",workflowNature:"Physical",dataReadiness:"Ready",sensitivity:"Internal",integration:"Standalone",engCapacity:"Moderate",budget:"Medium",timeline:"3months"}, note:"physical" },

  // ── CONSTRUCTION ──────────────────────────────────────────────
  { name:"On-site bricklaying", industry:"Construction", expected:"DON'T",
    i:{volume:50000,timePerRun:"2-10min",laborCost:"20-50",errorImpact:"Medium",repeatability:"Highly",judgment:"Low",workflowNature:"Physical",dataReadiness:"Ready",sensitivity:"Internal",integration:"Standalone",engCapacity:"Limited",budget:"Small",timeline:"3months"}, note:"physical" },
  { name:"Bid estimate takeoff", industry:"Construction", expected:"HYBRID",
    i:{volume:500,timePerRun:"60+min",laborCost:"50-100",errorImpact:"High",repeatability:"Standardized",judgment:"Moderate",workflowNature:"DataProc",dataReadiness:"Partial",sensitivity:"Internal",integration:"Few",engCapacity:"Limited",budget:"Small",timeline:"3months"} },
  { name:"Permit/code compliance check", industry:"Construction", expected:"HYBRID",
    i:{volume:1000,timePerRun:"30-60min",laborCost:"50-100",errorImpact:"High",repeatability:"Standardized",judgment:"Moderate",workflowNature:"Knowledge",dataReadiness:"Partial",sensitivity:"Internal",integration:"Many",engCapacity:"Limited",budget:"Small",timeline:"3months"} },
  { name:"Subcontractor invoice matching", industry:"Construction", expected:"BUY",
    i:{volume:3000,timePerRun:"2-10min",laborCost:"20-50",errorImpact:"Medium",repeatability:"Standardized",judgment:"Low",workflowNature:"DataProc",dataReadiness:"Partial",sensitivity:"Internal",integration:"Few",engCapacity:"Limited",budget:"Small",timeline:"3months"} },
  { name:"Site safety inspection (physical)", industry:"Construction", expected:"DON'T",
    i:{volume:2000,timePerRun:"30-60min",laborCost:"50-100",errorImpact:"Critical",repeatability:"Standardized",judgment:"Moderate",workflowNature:"Physical",dataReadiness:"Partial",sensitivity:"Internal",integration:"Standalone",engCapacity:"None",budget:"Micro",timeline:"3months"}, note:"physical" },

  // ── EDUCATION ─────────────────────────────────────────────────
  { name:"Objective assignment grading", industry:"Education", expected:"HYBRID",
    i:{volume:5000,timePerRun:"10-30min",laborCost:"20-50",errorImpact:"Medium",repeatability:"Highly",judgment:"Low",workflowNature:"Knowledge",dataReadiness:"Ready",sensitivity:"Internal",integration:"Standalone",engCapacity:"None",budget:"Micro",timeline:"Flexible"} },
  { name:"Essay feedback generation", industry:"Education", expected:"BUY",
    i:{volume:2000,timePerRun:"30-60min",laborCost:"20-50",errorImpact:"Medium",repeatability:"Somewhat",judgment:"High",workflowNature:"Knowledge",dataReadiness:"Partial",sensitivity:"Internal",integration:"Standalone",engCapacity:"None",budget:"Micro",timeline:"Flexible"} },
  { name:"Lesson plan drafting", industry:"Education", expected:"BUY",
    i:{volume:1000,timePerRun:"30-60min",laborCost:"20-50",errorImpact:"Low",repeatability:"Somewhat",judgment:"Moderate",workflowNature:"Knowledge",dataReadiness:"Ready",sensitivity:"Public",integration:"Standalone",engCapacity:"None",budget:"Micro",timeline:"Flexible"} },
  { name:"Admissions application review", industry:"Education", expected:"HYBRID",
    i:{volume:3000,timePerRun:"10-30min",laborCost:"20-50",errorImpact:"High",repeatability:"Standardized",judgment:"Moderate",workflowNature:"Knowledge",dataReadiness:"Partial",sensitivity:"Confidential",integration:"Few",engCapacity:"Limited",budget:"Small",timeline:"3months"} },
  { name:"Student enrollment data entry", industry:"Education", expected:"BUY",
    i:{volume:8000,timePerRun:"2-10min",laborCost:"<20",errorImpact:"Medium",repeatability:"Highly",judgment:"Low",workflowNature:"DigitalOps",dataReadiness:"Ready",sensitivity:"Confidential",integration:"Few",engCapacity:"Limited",budget:"Small",timeline:"3months"} },

  // ── EXTRA EDGE / CROSS-INDUSTRY ───────────────────────────────
  { name:"Low-volume expert advisory memo", industry:"Finance", expected:"DON'T",
    i:{volume:30,timePerRun:"60+min",laborCost:"100+",errorImpact:"High",repeatability:"AdHoc",judgment:"Critical",workflowNature:"Knowledge",dataReadiness:"Partial",sensitivity:"Confidential",integration:"Standalone",engCapacity:"Limited",budget:"Small",timeline:"3months"}, note:"low vol expert" },
  { name:"Tiny-volume contract drafting", industry:"Legal", expected:"DON'T",
    i:{volume:8,timePerRun:"60+min",laborCost:"100+",errorImpact:"High",repeatability:"Somewhat",judgment:"High",workflowNature:"Knowledge",dataReadiness:"Ready",sensitivity:"Confidential",integration:"Standalone",engCapacity:"Strong",budget:"Large",timeline:"Flexible"}, note:"G1 volume<10" },
  { name:"Data labeling for ML", industry:"Operations", expected:"BUY",
    i:{volume:100000,timePerRun:"<2min",laborCost:"<20",errorImpact:"Low",repeatability:"Highly",judgment:"Low",workflowNature:"DataProc",dataReadiness:"Ready",sensitivity:"Public",integration:"Standalone",engCapacity:"Limited",budget:"Small",timeline:"Flexible"} },
  { name:"Messy-data report consolidation", industry:"Operations", expected:"DON'T",
    i:{volume:300,timePerRun:"10-30min",laborCost:"20-50",errorImpact:"Medium",repeatability:"Somewhat",judgment:"Moderate",workflowNature:"DataProc",dataReadiness:"Messy",sensitivity:"Internal",integration:"Many",engCapacity:"None",budget:"Micro",timeline:"Immediate"}, note:"G3 messy+lowAP" },
  { name:"High-stakes regulated comms (low vol)", industry:"Healthcare", expected:"DON'T",
    i:{volume:40,timePerRun:"60+min",laborCost:"100+",errorImpact:"Critical",repeatability:"Somewhat",judgment:"Critical",workflowNature:"Knowledge",dataReadiness:"Partial",sensitivity:"Regulated",integration:"Enterprise",engCapacity:"Limited",budget:"Small",timeline:"3months"}, note:"low vol critical" },
  { name:"Drone-based field survey", industry:"Construction", expected:"DON'T",
    i:{volume:5000,timePerRun:"10-30min",laborCost:"50-100",errorImpact:"Medium",repeatability:"Standardized",judgment:"Low",workflowNature:"Physical",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Strong",budget:"Large",timeline:"Flexible"}, note:"physical" },
  { name:"Translation of support content", industry:"Support", expected:"BUY",
    i:{volume:20000,timePerRun:"2-10min",laborCost:"20-50",errorImpact:"Low",repeatability:"Highly",judgment:"Low",workflowNature:"Communication",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Limited",budget:"Small",timeline:"3months"} },
  { name:"Contract renewal reminders", industry:"Operations", expected:"BUY",
    i:{volume:1000,timePerRun:"<2min",laborCost:"20-50",errorImpact:"Low",repeatability:"Highly",judgment:"Low",workflowNature:"DigitalOps",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Limited",budget:"Small",timeline:"3months"} },
  { name:"AML/KYC document verification", industry:"Finance", expected:"HYBRID",
    i:{volume:10000,timePerRun:"2-10min",laborCost:"20-50",errorImpact:"Critical",repeatability:"Standardized",judgment:"Moderate",workflowNature:"DataProc",dataReadiness:"Partial",sensitivity:"Regulated",integration:"Many",engCapacity:"Moderate",budget:"Large",timeline:"3months"} },
  { name:"Insurance subrogation review", industry:"Insurance", expected:"HYBRID",
    i:{volume:1000,timePerRun:"30-60min",laborCost:"50-100",errorImpact:"High",repeatability:"Standardized",judgment:"High",workflowNature:"Knowledge",dataReadiness:"Partial",sensitivity:"Confidential",integration:"Many",engCapacity:"Moderate",budget:"Medium",timeline:"3months"} },
  { name:"Grant application scoring", industry:"Government", expected:"HYBRID",
    i:{volume:2000,timePerRun:"30-60min",laborCost:"50-100",errorImpact:"High",repeatability:"Standardized",judgment:"High",workflowNature:"Knowledge",dataReadiness:"Partial",sensitivity:"Internal",integration:"Few",engCapacity:"Limited",budget:"Small",timeline:"3months"} },
  { name:"Manufacturing BOM data cleanup", industry:"Manufacturing", expected:"BUY",
    i:{volume:5000,timePerRun:"2-10min",laborCost:"20-50",errorImpact:"Medium",repeatability:"Standardized",judgment:"Low",workflowNature:"DataProc",dataReadiness:"Partial",sensitivity:"Internal",integration:"Few",engCapacity:"Moderate",budget:"Medium",timeline:"3months"} },
  { name:"Retail planogram design (digital)", industry:"Retail", expected:"BUY",
    i:{volume:1000,timePerRun:"30-60min",laborCost:"20-50",errorImpact:"Low",repeatability:"Somewhat",judgment:"Moderate",workflowNature:"DataProc",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Limited",budget:"Small",timeline:"3months"} },
  { name:"Recruiting outreach personalization", industry:"HR", expected:"BUY",
    i:{volume:10000,timePerRun:"2-10min",laborCost:"20-50",errorImpact:"Low",repeatability:"Standardized",judgment:"Low",workflowNature:"Communication",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Limited",budget:"Small",timeline:"3months"} },
  { name:"Sales territory planning", industry:"Sales", expected:"BUY",
    i:{volume:500,timePerRun:"30-60min",laborCost:"50-100",errorImpact:"Medium",repeatability:"Standardized",judgment:"Moderate",workflowNature:"DataProc",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Moderate",budget:"Medium",timeline:"3months"} },
  { name:"Cloud cost optimization analysis", industry:"IT", expected:"BUY",
    i:{volume:1000,timePerRun:"10-30min",laborCost:"50-100",errorImpact:"Medium",repeatability:"Standardized",judgment:"Moderate",workflowNature:"DataProc",dataReadiness:"Ready",sensitivity:"Internal",integration:"Many",engCapacity:"Strong",budget:"Medium",timeline:"3months"} },
  { name:"Curriculum standards alignment", industry:"Education", expected:"BUY",
    i:{volume:2000,timePerRun:"10-30min",laborCost:"20-50",errorImpact:"Low",repeatability:"Standardized",judgment:"Moderate",workflowNature:"Knowledge",dataReadiness:"Ready",sensitivity:"Public",integration:"Standalone",engCapacity:"None",budget:"Micro",timeline:"Flexible"} },
  { name:"Warehouse inbound doc capture", industry:"Logistics", expected:"BUY",
    i:{volume:5000,timePerRun:"2-10min",laborCost:"<20",errorImpact:"Medium",repeatability:"Standardized",judgment:"Low",workflowNature:"DataProc",dataReadiness:"Partial",sensitivity:"Internal",integration:"Few",engCapacity:"Limited",budget:"Small",timeline:"3months"} },
  { name:"Clinical trial eligibility matching", industry:"Healthcare", expected:"HYBRID",
    i:{volume:2000,timePerRun:"10-30min",laborCost:"100+",errorImpact:"Critical",repeatability:"Standardized",judgment:"High",workflowNature:"Knowledge",dataReadiness:"Partial",sensitivity:"Regulated",integration:"Many",engCapacity:"Moderate",budget:"Large",timeline:"3months"} },
  { name:"Mortgage underwriting", industry:"Finance", expected:"HYBRID",
    i:{volume:3000,timePerRun:"30-60min",laborCost:"50-100",errorImpact:"Critical",repeatability:"Standardized",judgment:"High",workflowNature:"Knowledge",dataReadiness:"Partial",sensitivity:"Regulated",integration:"Many",engCapacity:"Moderate",budget:"Large",timeline:"3months"} },
  { name:"Procurement RFP drafting", industry:"Operations", expected:"BUY",
    i:{volume:50,timePerRun:"60+min",laborCost:"50-100",errorImpact:"High",repeatability:"Somewhat",judgment:"High",workflowNature:"Knowledge",dataReadiness:"Partial",sensitivity:"Internal",integration:"Standalone",engCapacity:"Limited",budget:"Small",timeline:"3months"} },
  { name:"IT helpdesk ticket auto-response", industry:"IT", expected:"BUY",
    i:{volume:20000,timePerRun:"2-10min",laborCost:"20-50",errorImpact:"Low",repeatability:"Standardized",judgment:"Low",workflowNature:"Communication",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Moderate",budget:"Medium",timeline:"3months"} },
  { name:"Lease abstraction (real estate)", industry:"Legal", expected:"HYBRID",
    i:{volume:200,timePerRun:"60+min",laborCost:"50-100",errorImpact:"High",repeatability:"Standardized",judgment:"Moderate",workflowNature:"Knowledge",dataReadiness:"Partial",sensitivity:"Confidential",integration:"Standalone",engCapacity:"Limited",budget:"Small",timeline:"3months"} },
  { name:"Manufacturing shift handover notes", industry:"Manufacturing", expected:"BUY",
    i:{volume:3000,timePerRun:"2-10min",laborCost:"20-50",errorImpact:"Medium",repeatability:"Standardized",judgment:"Low",workflowNature:"Communication",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Moderate",budget:"Medium",timeline:"3months"} },
  { name:"Field service dispatch (physical)", industry:"Operations", expected:"DON'T",
    i:{volume:5000,timePerRun:"10-30min",laborCost:"20-50",errorImpact:"Medium",repeatability:"Standardized",judgment:"Low",workflowNature:"Physical",dataReadiness:"Ready",sensitivity:"Internal",integration:"Few",engCapacity:"Moderate",budget:"Medium",timeline:"3months"}, note:"physical" },
  { name:"Government records digitization", industry:"Government", expected:"BUY",
    i:{volume:50000,timePerRun:"<2min",laborCost:"<20",errorImpact:"Low",repeatability:"Highly",judgment:"Low",workflowNature:"DataProc",dataReadiness:"Partial",sensitivity:"Internal",integration:"Standalone",engCapacity:"Limited",budget:"Small",timeline:"Flexible"} },
];

const counts: Record<Verdict, { match: number; total: number }> = {
  "BUY":   { match: 0, total: 0 },
  "BUILD": { match: 0, total: 0 },
  "HYBRID":{ match: 0, total: 0 },
  "DON'T": { match: 0, total: 0 },
};

let overallMatch = 0;
const mismatches: string[] = [];

console.log("IDX | EXPECT  | ACTUAL  | M | AP S  R  F  | g  | INDUSTRY      | NAME");
W.forEach((row, idx) => {
  const r = score({ workflowDescription: row.name, ...row.i });
  const match = r.verdict === row.expected;
  counts[row.expected].total++;
  if (match) { counts[row.expected].match++; overallMatch++; }
  else mismatches.push(`#${idx+1} ${row.name} [${row.industry}] expected ${row.expected}, got ${r.verdict} (AP=${r.automationPotential} S=${r.aiSuitability} R=${r.riskComplexity} F=${r.feasibility} g=${r.firedGate??'-'})${row.note?` {${row.note}}`:''}`);
  console.log(
    `${String(idx+1).padStart(3)} | ${row.expected.padEnd(7)} | ${r.verdict.padEnd(7)} | ${match?'Y':'N'} | ${String(r.automationPotential).padStart(2)} ${String(r.aiSuitability).padStart(2)} ${String(r.riskComplexity).padStart(2)} ${String(r.feasibility).padStart(2)} | ${(r.firedGate??'-').padEnd(2)} | ${row.industry.padEnd(13)} | ${row.name}`
  );
});

console.log("\n================ AGREEMENT ================");
(["BUY","HYBRID","BUILD","DON'T"] as Verdict[]).forEach(v => {
  const c = counts[v];
  console.log(`${v.padEnd(7)} agreement: ${c.match}/${c.total} (${c.total?Math.round(100*c.match/c.total):0}%)`);
});
console.log(`\nOVERALL: ${overallMatch}/${W.length} (${Math.round(100*overallMatch/W.length)}%)`);

console.log("\n================ MISMATCHES ================");
mismatches.forEach(m => console.log(m));
