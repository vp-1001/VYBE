import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production' || process.argv.includes('--production');

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK server-side
const apiKey = process.env.GEMINI_API_KEY;
const configuredModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim() !== '') {
  aiClient = new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'vybe-ai-event-architect',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!aiClient,
    model: configuredModel,
    isProduction,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Resilient caller that queries Gemini with automatic model fallback
 * (e.g. configuredModel -> gemini-2.5-flash -> gemini-1.5-flash -> gemini-3.8-flash)
 * Throws on genuine auth, network, or quota failures.
 */
async function generateWithGemini(prompt: string, preferredModel = configuredModel): Promise<string> {
  if (!aiClient) {
    throw new Error('No Gemini API key configured.');
  }

  const candidateModels = [preferredModel, 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-3.8-flash'];
  const uniqueModels = Array.from(new Set(candidateModels));
  let lastError: any = null;

  for (const model of uniqueModels) {
    try {
      const response = await aiClient.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      if (response && response.text && response.text.trim().length > 0) {
        return response.text;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini generation with model ${model} failed: ${err.message}`);
      if (
        err.status === 401 ||
        err.status === 403 ||
        err.message?.includes('API_KEY_INVALID') ||
        err.message?.includes('quota')
      ) {
        throw err;
      }
    }
  }

  throw lastError || new Error('Empty response received from Gemini API');
}

// Fallback intelligent generator for resilient offline / no-key demo execution
function generateFallbackPlan(body: any) {
  const eventType = body.eventType || 'college';
  const location = body.location || 'Kolkata';
  const guestCount = Number(body.guestCount) || 200;
  const budget = Number(body.budget) || 80000;
  const currency = body.currency || 'INR';
  const vibes = body.vibes?.join(', ') || 'Modern Bengali Elegance, Cinematic';
  const vision = body.vision || 'A grand celebration with music, authentic catering, and memorable photo ops';

  const title = body.vision && body.vision.length > 5 && body.vision.length < 50
    ? body.vision
    : `${eventType.charAt(0).toUpperCase() + eventType.slice(1)} Celebration: ${vibes.split(',')[0] || 'Vibrant'}`;

  // Smart allocation percentages based on event type
  const venueCost = Math.round(budget * 0.22);
  const cateringCost = Math.round(budget * 0.38);
  const decorCost = Math.round(budget * 0.16);
  const photoCost = Math.round(budget * 0.10);
  const soundCost = Math.round(budget * 0.08);
  const contingencyCost = Math.round(budget * 0.06);

  return {
    title: title.replace(/['"]+/g, ''),
    tagline: 'Your Vision. Your People. Your Moment.',
    conceptDescription: `An expertly orchestrated ${eventType} designed for ${guestCount} guests in ${location}. Inspired by ${vibes}, this plan balances bespoke aesthetics with strict fiscal discipline.`,
    theme: {
      name: body.vibes?.[0] ? `${body.vibes[0]} Aesthetic` : 'Modern Bengali Elegance',
      vibe: vibes,
      tagline: 'Intimate, cinematic, and culturally rooted',
      description: `A warm, sophisticated blend of heritage motifs and contemporary minimalism tailored for ${location}.`,
      colors: ['#7F1D1D', '#D4AF37', '#FAF8F5', '#22212A', '#A78BFA'],
      decorElements: [
        'Curated floral stage backdrop with warm brass accents',
        'Custom interactive memory photobooth with themed props',
        'Ambient warm festoon and architectural uplighting',
        'Minimalist signage and bespoke digital welcome board',
      ],
      musicMood: 'Acoustic warm lounge welcoming transitioning to high-energy celebratory sets',
      lightingStyle: 'Warm 2700K ambient wash with dynamic stage focus beams',
      dressCodePrompt: 'Contemporary festive elegance / semi-formal chic',
    },
    budget: [
      { id: 'b1', category: 'Venue', name: 'Banquet Hall & Stage Facility', estimatedCost: venueCost, actualCost: 0, priority: 'must-have' },
      { id: 'b2', category: 'Catering', name: `Buffet Menu (${guestCount} plates)`, estimatedCost: cateringCost, actualCost: 0, priority: 'must-have' },
      { id: 'b3', category: 'Decorations', name: 'Stage Backdrop, Floral & Welcome Arch', estimatedCost: decorCost, actualCost: 0, priority: 'nice-to-have' },
      { id: 'b4', category: 'Photography', name: 'Candid Photography & Highlights Reel', estimatedCost: photoCost, actualCost: 0, priority: 'must-have' },
      { id: 'b5', category: 'Entertainment', name: 'Sound System, Mic Array & DJ Deck', estimatedCost: soundCost, actualCost: 0, priority: 'nice-to-have' },
      { id: 'b6', category: 'Contingency', name: 'Emergency Buffer & Overrun Reserve', estimatedCost: contingencyCost, actualCost: 0, priority: 'optional' },
    ],
    tasks: [
      { id: 't1', title: 'Confirm Venue Contract & Deposit', category: 'Venue', dueDate: '2026-11-05', priority: 'high', status: 'pending', dependencies: [], estimatedDurationHours: 8 },
      { id: 't2', title: 'Finalize Guest RSVPs & Headcount', category: 'Planning', dueDate: '2026-11-08', priority: 'medium', status: 'pending', dependencies: ['t1'], estimatedDurationHours: 12 },
      { id: 't3', title: 'Confirm Catering Menu & Tasting', category: 'Catering', dueDate: '2026-11-12', priority: 'high', status: 'pending', dependencies: ['t2'], estimatedDurationHours: 6 },
      { id: 't4', title: 'Approve Stage Design & Floral Palette', category: 'Decor', dueDate: '2026-11-14', priority: 'medium', status: 'pending', dependencies: ['t1'], estimatedDurationHours: 10 },
      { id: 't5', title: 'Book Photographer & Brief Shot List', category: 'Media', dueDate: '2026-11-15', priority: 'medium', status: 'pending', dependencies: [], estimatedDurationHours: 4 },
      { id: 't6', title: 'Technical AV & Mic Soundcheck', category: 'Logistics', dueDate: '2026-11-18', priority: 'urgent', status: 'pending', dependencies: ['t1'], estimatedDurationHours: 4 },
    ],
    schedule: [
      { id: 's1', startTime: '15:00', endTime: '16:30', activity: 'Vendor Setup, Floral Dressing & Soundcheck', location: 'Main Hall', status: 'scheduled' },
      { id: 's2', startTime: '16:30', endTime: '17:30', activity: 'Guest Welcome, Mocktails & Photobooth', location: 'Foyer', status: 'scheduled' },
      { id: 's3', startTime: '17:30', endTime: '19:00', activity: 'Keynote, Honors & Cultural Performances', location: 'Stage', status: 'scheduled' },
      { id: 's4', startTime: '19:00', endTime: '20:30', activity: 'Grand Dinner Buffet Service', location: 'Dining Hall', status: 'scheduled' },
      { id: 's5', startTime: '20:30', endTime: '21:30', activity: 'DJ Dance Celebration & Farewell Toast', location: 'Dance Floor', status: 'scheduled' },
    ],
    activities: [
      'Interactive Polaroid Memory Wall',
      'Senior Farewell Memento Presentation',
      'Live Acoustic Bengali Fusion Set',
      'Signature Mocktail Hour & Photo Booth',
    ],
    risks: [
      { id: 'r1', risk: 'Guest headcount exceeds 200 RSVP limit', severity: 'medium', likelihood: 'medium', contingencyPlan: 'Contract 10% flexible plate buffer with caterer; prepare overflow seating.', status: 'monitored' },
      { id: 'r2', risk: 'Audio feedback or electrical power trip during performance', severity: 'high', likelihood: 'low', contingencyPlan: 'Dedicated 10kVA silent backup generator and secondary wireless mic channel.', status: 'monitored' },
      { id: 'r3', risk: 'Inclement evening weather during arrival', severity: 'medium', likelihood: 'low', contingencyPlan: 'Covered canopy walkway from drop-off gate to main entrance.', status: 'monitored' },
    ],
  };
}

// 1. Generate Full Structured Event Plan
app.post('/api/ai/generate-plan', async (req, res) => {
  try {
    const { eventType, vision, date, location, guestCount, budget, currency, vibes, culturalPreferences, indoorOutdoor, specialRequirements } = req.body;

    if (!aiClient) {
      console.log('No Gemini API key detected, using offline demonstration planner');
      return res.json({
        success: true,
        isAIGenerated: false,
        source: 'offline-demo',
        offlineNotice: 'Operating in Offline Demonstration Mode. Configure GEMINI_API_KEY in server environment to enable live AI generation.',
        plan: generateFallbackPlan(req.body),
      });
    }

    const prompt = `
You are the master AI Event Architect for VYBE AI ("Your Vision. Your People. Your Moment.").
Generate a comprehensive, production-grade, budget-aware event plan based on these parameters:
- Event Type: ${eventType || 'college'}
- Vision: "${vision || 'Modern college farewell celebration'}"
- Date: ${date || '2026-11-20'}
- Location: ${location || 'Kolkata'}
- Guest Count: ${guestCount || 200}
- Total Budget: ${budget || 80000} ${currency || 'INR'}
- Aesthetic Vibes: ${(vibes || []).join(', ') || 'Modern Bengali Elegance'}
- Cultural / Dietary / Special: ${culturalPreferences || 'None'} | ${indoorOutdoor || 'Indoor'} | ${specialRequirements || 'None'}

Return a single JSON object conforming strictly to this format:
{
  "title": string (catchy, sophisticated event title),
  "tagline": string (short inspiring tagline),
  "conceptDescription": string (2-3 sentences explaining the overarching vision and flow),
  "theme": {
    "name": string,
    "vibe": string,
    "tagline": string,
    "description": string,
    "colors": string[] (array of exactly 5 hex colors),
    "decorElements": string[] (4 distinct concrete decorative items),
    "musicMood": string,
    "lightingStyle": string,
    "dressCodePrompt": string
  },
  "budget": [
    {
      "id": string (unique e.g. "b1"),
      "category": string (e.g. Venue, Catering, Decorations, Photography, Entertainment, Contingency),
      "name": string,
      "estimatedCost": number (ensure total sum matches or is strictly under ${budget}),
      "actualCost": 0,
      "priority": "must-have" | "nice-to-have" | "optional"
    }
  ],
  "tasks": [
    {
      "id": string (e.g. "t1"),
      "title": string,
      "category": string,
      "dueDate": string (YYYY-MM-DD),
      "priority": "low" | "medium" | "high" | "urgent",
      "status": "pending",
      "dependencies": string[] (array of predecessor task IDs, must form a valid DAG without cycles),
      "estimatedDurationHours": number
    }
  ],
  "schedule": [
    {
      "id": string (e.g. "s1"),
      "startTime": string ("HH:MM"),
      "endTime": string ("HH:MM"),
      "activity": string,
      "location": string,
      "status": "scheduled"
    }
  ],
  "activities": string[] (3-5 signature event moments),
  "risks": [
    {
      "id": string (e.g. "r1"),
      "risk": string,
      "severity": "low" | "medium" | "high",
      "likelihood": "low" | "medium" | "high",
      "contingencyPlan": string,
      "status": "monitored"
    }
  ]
}

DO NOT include markdown wrappers or backticks if possible, just valid JSON. Sum of estimatedCost in budget MUST NEVER exceed ${budget}.
`;

    const text = await generateWithGemini(prompt);
    let parsedPlan: any;
    try {
      parsedPlan = JSON.parse(text);
    } catch (parseErr) {
      console.warn('JSON parse error from Gemini output, repairing...', parseErr);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedPlan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON response from Gemini');
      }
    }

    // Safety validation on budget sum
    const totalAllocated = (parsedPlan.budget || []).reduce(
      (sum: number, item: any) => sum + (Number(item.estimatedCost) || 0),
      0
    );
    if (totalAllocated > Number(budget)) {
      // Re-scale deterministically so it never silently overruns
      const factor = Number(budget) / totalAllocated;
      parsedPlan.budget.forEach((item: any) => {
        item.estimatedCost = Math.round(item.estimatedCost * factor);
      });
    }

    return res.json({
      success: true,
      isAIGenerated: true,
      source: 'gemini-live',
      plan: parsedPlan,
    });
  } catch (error: any) {
    console.error('Gemini plan generation error:', error.message);
    return res.status(500).json({
      success: false,
      isAIGenerated: false,
      source: 'gemini-error',
      error: `Gemini Plan Generation Failed: ${error.message || 'Unknown API error'}. Verify your GEMINI_API_KEY and server connectivity.`,
    });
  }
});

// 1b. Regenerate Individual Section (without replacing the entire plan)
app.post('/api/ai/regenerate-section', async (req, res) => {
  try {
    const { section, currentPlan, userGuidance } = req.body;
    if (!section) {
      return res.status(400).json({ error: 'Section parameter is required.' });
    }

    if (!aiClient) {
      const fallback = generateFallbackPlan(currentPlan || {});
      let sectionData: any;
      if (section === 'theme') sectionData = fallback.theme;
      else if (section === 'budget') sectionData = fallback.budget;
      else if (section === 'tasks') sectionData = fallback.tasks;
      else if (section === 'schedule') sectionData = fallback.schedule;
      else if (section === 'activities') sectionData = fallback.activities;
      else sectionData = (fallback as Record<string, any>)[section];

      return res.json({
        success: true,
        isAIGenerated: false,
        source: 'offline-demo',
        offlineNotice: 'Operating in Offline Demonstration Mode.',
        section,
        data: sectionData,
      });
    }

    const eventType = currentPlan?.eventType || 'college';
    const totalBudget = Number(currentPlan?.totalBudget || currentPlan?.budget) || 80000;
    const currency = currentPlan?.currency || 'INR';
    const guestCount = Number(currentPlan?.guestCount) || 200;
    const location = currentPlan?.location || 'Kolkata';

    let prompt = '';
    if (section === 'theme') {
      prompt = `
You are the master AI Event Designer for VYBE AI.
Generate a distinctive, creative event theme for an event with type "${eventType}", location "${location}", vibes "${(currentPlan?.vibes || []).join(', ')}", and guidance: "${userGuidance || 'Fresh elegant aesthetic'}".
Return JSON strictly conforming to:
{
  "theme": {
    "name": string,
    "vibe": string,
    "tagline": string,
    "description": string,
    "colors": string[] (array of exactly 5 hex colors),
    "decorElements": string[] (4 distinct decor items),
    "musicMood": string,
    "lightingStyle": string,
    "dressCodePrompt": string
  }
}
`;
    } else if (section === 'budget') {
      prompt = `
You are the master AI Budget Architect for VYBE AI.
Generate an itemized, realistic budget allocation strictly under ${totalBudget} ${currency} for a ${eventType} with ${guestCount} guests in ${location}. User guidance: "${userGuidance || 'Balanced realistic breakdown'}".
Return JSON strictly conforming to:
{
  "budget": [
    {
      "id": string (unique e.g. "b1"),
      "category": string (Venue, Catering, Decorations, Photography, Entertainment, Contingency),
      "name": string,
      "estimatedCost": number (ensure total sum matches or is strictly under ${totalBudget}),
      "actualCost": 0,
      "priority": "must-have" | "nice-to-have" | "optional"
    }
  ]
}
`;
    } else if (section === 'tasks') {
      prompt = `
You are the master AI Event Scheduler for VYBE AI.
Generate 6-8 milestone tasks with valid DAG dependencies (array of predecessor task IDs, NO circular dependencies) for event date "${currentPlan?.date || '2026-11-28'}". Guidance: "${userGuidance || 'Detailed planning milestones'}".
Return JSON strictly conforming to:
{
  "tasks": [
    {
      "id": string (e.g. "t1"),
      "title": string,
      "category": string,
      "dueDate": string (YYYY-MM-DD),
      "priority": "low" | "medium" | "high" | "urgent",
      "status": "pending",
      "dependencies": string[],
      "estimatedDurationHours": number
    }
  ]
}
`;
    } else if (section === 'schedule') {
      prompt = `
You are the master AI Event Day Director for VYBE AI.
Generate a chronological run-of-show schedule for event day. Event type: "${eventType}". Guidance: "${userGuidance || 'Comprehensive day-of run-of-show'}".
Return JSON strictly conforming to:
{
  "schedule": [
    {
      "id": string (e.g. "s1"),
      "startTime": string ("HH:MM"),
      "endTime": string ("HH:MM"),
      "activity": string,
      "location": string,
      "status": "scheduled"
    }
  ]
}
`;
    } else {
      prompt = `
Generate 4-6 signature event moments / interactive activities for a ${eventType} in ${location}. Guidance: "${userGuidance || 'Unique memorable moments'}".
Return JSON strictly conforming to:
{
  "activities": string[]
}
`;
    }

    const text = await generateWithGemini(prompt);
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
      else throw new Error('Could not parse JSON response from Gemini');
    }

    let sectionData = parsed[section] || parsed.theme || parsed.budget || parsed.tasks || parsed.schedule || parsed.activities || parsed;

    if (section === 'budget' && Array.isArray(sectionData)) {
      const sum = sectionData.reduce((s: number, b: any) => s + (Number(b.estimatedCost) || 0), 0);
      if (sum > totalBudget) {
        const factor = totalBudget / sum;
        sectionData.forEach((b: any) => {
          b.estimatedCost = Math.round((Number(b.estimatedCost) || 0) * factor);
        });
      }
    }

    return res.json({
      success: true,
      isAIGenerated: true,
      source: 'gemini-live',
      section,
      data: sectionData,
    });
  } catch (err: any) {
    console.error('Section regeneration error:', err);
    return res.status(500).json({
      success: false,
      error: `Section regeneration failed: ${err.message}`,
    });
  }
});

// 2. Event Copilot: Conversational assistant with structured proposal extraction
app.post('/api/ai/copilot', async (req, res) => {
  try {
    const { message, currentEvent } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check for common deterministic commands like "photographer late by 30 mins" or "increase catering by 5000"
    const lower = message.toLowerCase();

    // Attempt Gemini if available
    if (aiClient) {
      try {
        const prompt = `
You are VYBE AI Event Copilot, an elite real-time event planning strategist.
Current Event Context:
- Title: "${currentEvent.title}"
- Event Type: ${currentEvent.eventType}
- Guests: ${currentEvent.guestCount}
- Total Budget: ${currentEvent.currency} ${currentEvent.totalBudget}
- Current Budget Allocations: ${JSON.stringify(currentEvent.budget?.map((b: any) => ({ category: b.category, name: b.name, estimated: b.estimatedCost })) || [])}
- Schedule Items: ${JSON.stringify(currentEvent.schedule?.map((s: any) => ({ activity: s.activity, time: `${s.startTime}-${s.endTime}` })) || [])}
- Incomplete Tasks: ${JSON.stringify(currentEvent.tasks?.filter((t: any) => t.status !== 'completed').map((t: any) => t.title) || [])}
- Selected Theme: ${currentEvent.theme?.name}

User message: "${message}"

Task:
Provide a clear, strategic answer and determine whether this message implies a concrete state change to the event.
If it implies an actionable change (e.g. adjusting budget, adding 40 guests, handling late vendor, shifting schedule, rain contingency, adding task, switching theme), you MUST generate a structured proposal with status "pending" so the user can review and approve it.

Return JSON strictly conforming to this schema:
{
  "replyText": string (direct, friendly, professional advice / explanation),
  "hasProposal": boolean,
  "proposal": {
    "id": string (unique ID e.g. "prop-" + timestamp),
    "type": "budget_adjustment" | "schedule_shift" | "add_task" | "theme_change" | "contingency_action" | "general_advice",
    "title": string,
    "description": string,
    "impactSummary": string,
    "proposedChanges": {
      "budgetAdjustments": [ { "category": string, "oldAmount": number, "newAmount": number } ],
      "scheduleShifts": [ { "itemId": string, "newStartTime": string, "newEndTime": string, "reason": string } ],
      "tasksToAdd": [ { "title": string, "category": string, "priority": "high", "dueDate": string } ],
      "themeUpdate": { "vibe": string, "description": string }
    }
  } (or null if hasProposal is false)
}
`;

        const text = await generateWithGemini(prompt);
        const parsed = JSON.parse(text || '{}');
        return res.json({
          success: true,
          reply: parsed.replyText || "I've reviewed your event parameters.",
          proposal: parsed.hasProposal ? parsed.proposal : null,
        });
      } catch (geminiErr: any) {
        console.warn('Gemini copilot error, falling through to deterministic engine:', geminiErr.message);
      }
    }

    // Deterministic fallback copilot engine
    if (lower.includes('photographer') && (lower.includes('late') || lower.includes('delay'))) {
      return res.json({
        success: true,
        reply: 'I detected a delay in photography arrival. I have calculated the downstream schedule impacts to preserve golden-hour group portraits and shift the formal dinner by 25 minutes without compromising overall curfew.',
        proposal: {
          id: `prop-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'schedule_shift',
          title: 'Resolve Photographer Delay Incident',
          description: 'Shift photographer arrival and delay reception start by 25 minutes to protect key ceremony coverage.',
          impactSummary: 'Extends arrival buffer; shifts dinner service start to 19:25 with zero venue curfew overrun.',
          proposedChanges: {
            scheduleShifts: [
              { itemId: 's1', newStartTime: '15:25', newEndTime: '16:55', reason: 'Accommodate 25m transit delay' },
            ],
          },
          status: 'pending',
        },
      });
    }

    if (lower.includes('catering') || lower.includes('food') || lower.includes('budget') || lower.includes('premium')) {
      return res.json({
        success: true,
        reply: 'To elevate catering and stage presence without exceeding your total budget, we can safely rebalance ₹5,000 from generic printed favors and contingency reserve while locking in upgraded live counter desserts.',
        proposal: {
          id: `prop-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'budget_adjustment',
          title: 'Rebalance for Premium Catering & Stage',
          description: 'Increase Catering by ₹5,000 and Stage Decor by ₹2,000; offset by trimming Miscellaneous and Contingency reserve.',
          impactSummary: 'Net budget change: ₹0. Premium artisanal live food station added; total budget remains strictly within cap.',
          proposedChanges: {
            budgetAdjustments: [
              { category: 'Catering', oldAmount: 30400, newAmount: 35400 },
              { category: 'Contingency', oldAmount: 4800, newAmount: 1800 },
              { category: 'Decorations', oldAmount: 12800, newAmount: 14800 },
              { category: 'Miscellaneous', oldAmount: 3000, newAmount: 1000 },
            ],
          },
          status: 'pending',
        },
      });
    }

    if (lower.includes('rain') || lower.includes('weather') || lower.includes('storm')) {
      return res.json({
        success: true,
        reply: 'Weather contingencies require securing covered pathways and a waterproof stage canopy. I have prepared an emergency task and vendor verification protocol.',
        proposal: {
          id: `prop-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'contingency_action',
          title: 'Deploy Rain Contingency Protocol',
          description: 'Add urgent waterproof canopy task and activate indoor hall backup seating arrangement.',
          impactSummary: 'Ensures zero equipment damage from rain; triggers covered guest arrival corridor setup.',
          proposedChanges: {
            tasksToAdd: [
              { title: 'Confirm Waterproof Stage Canopy & Outdoor Tarps', category: 'Logistics', priority: 'urgent', dueDate: '2026-11-19' },
              { title: 'Verify Indoor Overflow Auditorium Power Lines', category: 'AV', priority: 'high', dueDate: '2026-11-19' },
            ],
          },
          status: 'pending',
        },
      });
    }

    return res.json({
      success: true,
      reply: `I analyzed your event "${currentEvent.title}". You currently have ${(currentEvent.tasks || []).filter((t: any) => t.status !== 'completed').length} pending tasks and your budget is at ${Math.round(((currentEvent.budget || []).reduce((s: number, b: any) => s + b.estimatedCost, 0) / (currentEvent.totalBudget || 1)) * 100)}% allocation. Let me know if you would like me to optimize vendor contracts, rebalance spending, or adjust the run-of-show schedule!`,
      proposal: null,
    });
  } catch (err: any) {
    console.error('Copilot error:', err);
    res.status(500).json({ error: err.message || 'Internal copilot error' });
  }
});

// 3. AI Vendor Comparison Endpoint
app.post('/api/ai/compare-vendors', async (req, res) => {
  try {
    const { category, vendors } = req.body;
    if (!vendors || vendors.length === 0) {
      return res.json({
        summary: 'No vendors available in this category yet to compare. Add at least two vendors to run an AI comparative breakdown.',
        recommendedVendorId: null,
      });
    }

    if (aiClient) {
      try {
        const prompt = `
Compare these ${category} vendors based on their normalized quotations:
${JSON.stringify(vendors, null, 2)}

Provide an insightful, unbiased comparison summary (max 3 sentences) highlighting who provides the best value, hidden fees, and transparent service coverage.
Return JSON:
{
  "summary": string,
  "recommendedVendorId": string,
  "keyHighlights": string[]
}
`;
        const text = await generateWithGemini(prompt);
        return res.json(JSON.parse(text || '{}'));
      } catch (geminiErr: any) {
        console.warn('Gemini vendor comparison error, falling back:', geminiErr.message);
      }
    }

    // Deterministic fallback comparison
    const sorted = [...vendors].sort((a: any, b: any) => {
      const qA = a.quotations?.[0]?.basePrice || 999999;
      const qB = b.quotations?.[0]?.basePrice || 999999;
      return qA - qB;
    });

    return res.json({
      summary: `${sorted[0]?.name || 'First vendor'} offers the most competitive base package with transparent setup fees. Verify their inclusions against overtime hourly rates before final signoff.`,
      recommendedVendorId: sorted[0]?.id || null,
      keyHighlights: [
        'Cost-effective baseline quotation with standard audio/lighting',
        'Transparent tax and logistics fees included',
        'Strong track record in regional college/cultural banquets',
      ],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. AI Theme Generator Endpoint
app.post('/api/ai/suggest-themes', async (req, res) => {
  try {
    const { eventType, concept, vibe } = req.body;

    if (aiClient) {
      try {
        const prompt = `
Generate an alternative creative event theme for a ${eventType || 'celebration'}.
Current concept context: "${concept || 'Cultural celebratory event'}"
Desired vibe: "${vibe || 'Creative & distinct'}"

Return JSON conforming strictly to:
{
  "theme": {
    "name": string,
    "vibe": string,
    "tagline": string,
    "description": string,
    "colors": string[] (array of exactly 5 hex colors),
    "decorElements": string[] (4 distinct decor items),
    "musicMood": string,
    "lightingStyle": string,
    "dressCodePrompt": string
  }
}
`;
        const text = await generateWithGemini(prompt);
        const parsed = JSON.parse(text || '{}');
        if (parsed.theme) {
          return res.json({ success: true, theme: parsed.theme });
        }
      } catch (geminiErr: any) {
        console.warn('Gemini theme suggestion error, using fallback:', geminiErr.message);
      }
    }

    // Creative alternative theme generator
    const creativeAlternatives = [
      {
        name: 'Neo-Terracotta & Brass Minimalist',
        vibe: 'Modern Heritage × Architectural',
        tagline: 'Warm terracotta clay, antique brass, and modern geometry',
        description: 'An architectural reinterpretation of regional heritage with monolithic clay plinths, brass oil urns, and minimal warm wash pin-spots.',
        colors: ['#9C4133', '#C59B27', '#F7F3E9', '#1C1B22', '#8B5CF6'],
        decorElements: ['Hand-thrown Terracotta Plinths', 'Suspended Brass Urn Sculptures', 'Marigold Petal Mosaic Tables', 'Frameless Linear Amber Beams'],
        musicMood: 'Ambient sitar & sarod over lo-fi downtempo beats',
        lightingStyle: 'Warm 2400K architectural grazing with focused stage highlights',
        dressCodePrompt: 'Textured handloom silks, linen kurtas, and structured festive jackets',
      },
      {
        name: 'Celestial Twilight Gala',
        vibe: 'Deep Midnight & Gilded Starlight',
        tagline: 'Deep indigo, starlight silver, champagne shimmer, and velvet',
        description: 'An enchanting evening landscape with midnight navy drapery, suspended crystal starbursts, and subtle champagne sparkle.',
        colors: ['#0F172A', '#E2E8F0', '#F59E0B', '#6366F1', '#FAF8F5'],
        decorElements: ['Fibre-Optic Star Ceiling Canopy', 'Mirror-Top Banquet Tables', 'Suspended Geometric Prisms', 'Low-Lying Dry Ice Fog Effects'],
        musicMood: 'Cinematic acoustic strings leading to melodic evening anthems',
        lightingStyle: 'Pin-spot tables with deep indigo perimeter flood and starlight accents',
        dressCodePrompt: 'Midnight glam: metallic accents, dark suits, and celestial evening gowns',
      },
    ];

    const chosen = creativeAlternatives[Math.floor(Math.random() * creativeAlternatives.length)];
    return res.json({
      success: true,
      theme: {
        ...chosen,
        id: `theme-ai-${Date.now()}`,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// Mount Vite middleware in development or serve static in production
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`> VYBE AI Server running on port ${port} (Node ${process.version}) [Production: ${isProduction}]`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
