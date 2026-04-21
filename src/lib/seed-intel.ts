import { faker } from "@faker-js/faker";
import type {
  CallMoment,
  CallMomentType,
  CallRecording,
  CallTranscriptLine,
  Channel,
  Conversation,
  Lead,
  Message,
  Rep,
  Sequence,
  SequenceStep,
  SequenceStepType,
  Signal,
  SignalType,
} from "./types";

const CHANNELS_POOL: Channel[] = [
  "email",
  "linkedin",
  "whatsapp",
  "telegram",
  "sms",
];

const EMAIL_SUBJECTS = [
  "Quick intro from Alpina",
  "Following up on your demo",
  "Pricing — tailored to your team",
  "Customer story from your industry",
  "Found you via $REFERRAL",
  "5 min next Tuesday?",
  "Benchmarks for your team size",
];

const OUTBOUND_BODIES = [
  "Hey $FIRST — saw $COMPANY just raised Series B. Congrats! We help teams like yours double pipeline velocity without adding headcount. Open to a 15-min chat next week?",
  "Following up — here's a 2-min loom showing how $INDUSTRY teams use Alpina to cut lead response time by 60%. Worth a look?",
  "Quick thought for you, $FIRST: our CFO benchmark shows most $INDUSTRY companies under-invest in scoring. We could calibrate yours in a week.",
  "Not sure if this is on your radar, but we just shipped a case study with a peer of yours. Want me to send it over?",
  "Circling back — no pressure, but wanted to make sure my last email didn't get buried.",
  "Proposal attached. Let me know if anything is unclear. Happy to jump on a call.",
];

const INBOUND_BODIES = [
  "Thanks for reaching out! Yes, we're evaluating tools in this space. Can you send pricing?",
  "Interesting timing — we're mid-RFP. Who else should I loop in?",
  "Not right now, ping us next quarter.",
  "Happy to take the call. Wednesday 3pm work?",
  "Can you share a demo URL? I'll forward to the team.",
  "Love this angle. Send me the case study.",
  "We already use a competitor but always open to comparing. What's your differentiator?",
];

const LINKEDIN_BODIES = [
  "Hey — saw your post about $TOPIC, really resonated. Happy to swap notes any time.",
  "Thanks for connecting! Are you looking at sales tooling this quarter?",
  "Appreciate the note. DM me whenever.",
];

const WHATSAPP_BODIES = [
  "Quick one — will we have the pricing by EOD?",
  "Running 5 min late to the call, sorry!",
  "Thanks, got it — forwarding to the team 👍",
  "Can you confirm the NDA is signed?",
  "Slack me when you're free?",
];

const SMS_BODIES = [
  "Hey it's $REP from Alpina — just calling, can you pick up?",
  "Got your voicemail — all good, call me back when you can.",
  "Confirming we're on for tomorrow 10am.",
];

const CALL_SUMMARIES = [
  "Discovery call — confirmed budget is allocated for Q3. Next step: technical deep-dive with their security team.",
  "Pricing negotiation — they pushed for 15% off, we anchored at 8%. Champion is on our side. Decision next Friday.",
  "Demo — showed dashboard + scoring. Strong reactions to pipeline velocity view. Two follow-up questions on CRM integration.",
  "Renewal conversation — expansion signal: they want to add 12 more seats. Upsell to Pro tier likely.",
  "Competitive loss-prevention — incumbent is Outreach. Positioned Alpina as complementary, not replacement.",
];

const TRANSCRIPT_TEMPLATES = [
  [
    {
      speaker: "rep",
      text: "Thanks for making time, $NAME. Mind if I dive right in?",
    },
    { speaker: "prospect", text: "Go ahead." },
    {
      speaker: "rep",
      text: "So what I heard last time — your team is manually scoring leads in a spreadsheet. Is that still the case?",
    },
    {
      speaker: "prospect",
      text: "Yeah, unfortunately. It takes our SDR lead about four hours a week.",
    },
    {
      speaker: "rep",
      text: "That's exactly what we've heard from five other $INDUSTRY teams. Let me show you what automated scoring looks like in practice.",
    },
    {
      speaker: "prospect",
      text: "Before you do — what does this integrate with? We're on HubSpot.",
    },
    {
      speaker: "rep",
      text: "HubSpot is day-one. Two-way sync. You'd get scoring fields back in HubSpot within 15 minutes of implementation.",
    },
    { speaker: "prospect", text: "That's exactly what I need. Price?" },
    {
      speaker: "rep",
      text: "For your team size, we're looking at $4,800 a month on annual. I can send a full quote today.",
    },
    {
      speaker: "prospect",
      text: "Send it over. If legal approves, we could start a pilot next month.",
    },
    {
      speaker: "rep",
      text: "Perfect. Want to loop your CFO in on the pricing call next week?",
    },
    { speaker: "prospect", text: "Yes. Thursday 2pm is open on my side." },
  ],
  [
    {
      speaker: "rep",
      text: "Hey $NAME, great to connect. I watched the webinar replay.",
    },
    { speaker: "prospect", text: "Oh nice, what did you think?" },
    {
      speaker: "rep",
      text: "Honestly the Q&A was the best part. Someone asked about conversion by source — we've got that dashboard.",
    },
    {
      speaker: "prospect",
      text: "We're tracking that in three tools right now. It's a mess.",
    },
    {
      speaker: "rep",
      text: "That's the biggest reason teams move to us. One place, not three. What's your timeline on making a change?",
    },
    {
      speaker: "prospect",
      text: "We're actually looking at Chorus and Gong too. Budget sign-off end of the month.",
    },
    {
      speaker: "rep",
      text: "Fair. Both are strong. Our angle is scoring + attribution, not conversation intel. Different lane.",
    },
    { speaker: "prospect", text: "Can you do a side-by-side write-up?" },
    { speaker: "rep", text: "Absolutely — I'll have it to you by Friday." },
  ],
  [
    {
      speaker: "rep",
      text: "I know you're tight on time, so let me be direct.",
    },
    { speaker: "prospect", text: "Please." },
    {
      speaker: "rep",
      text: "On our last call you said scoring was the top priority. Has that changed?",
    },
    {
      speaker: "prospect",
      text: "Honestly — we just hired an RFP coordinator. Pricing page engagement is actually where we want to focus now.",
    },
    {
      speaker: "rep",
      text: "Got it. We track pricing-page visits as a high-intent signal. I can show you that view in 3 minutes.",
    },
    { speaker: "prospect", text: "Go for it." },
    {
      speaker: "rep",
      text: "Here — every lead with a pricing-page visit in the last 30 days. 47 leads. Your SDR team hasn't touched 31 of them.",
    },
    {
      speaker: "prospect",
      text: "Wow. Okay that's compelling. What's the lift on reply rate if we call them within an hour?",
    },
    {
      speaker: "rep",
      text: "Industry data says 8x. Ours is averaging 11x across our customer cohort.",
    },
    { speaker: "prospect", text: "Let's move forward. How fast can we pilot?" },
    { speaker: "rep", text: "Two weeks, end-to-end." },
  ],
];

const MOMENT_TEMPLATES: {
  type: CallMomentType;
  phrases: string[];
}[] = [
  {
    type: "pricing",
    phrases: [
      "Price?",
      "We're looking at $4,800 a month on annual.",
      "Pricing page engagement is actually where we want to focus now.",
    ],
  },
  {
    type: "objection",
    phrases: [
      "We already use a competitor.",
      "Legal still needs to sign off.",
      "Budget is tight this quarter.",
    ],
  },
  {
    type: "commitment",
    phrases: [
      "Let's move forward.",
      "Send me the quote.",
      "If legal approves, we could start a pilot next month.",
    ],
  },
  {
    type: "competitor",
    phrases: [
      "We're actually looking at Chorus and Gong too.",
      "Incumbent is Outreach.",
      "HubSpot native reporting is what we compare against.",
    ],
  },
  {
    type: "question",
    phrases: [
      "What does this integrate with?",
      "Can you do a side-by-side write-up?",
      "What's the lift on reply rate?",
    ],
  },
  {
    type: "next_steps",
    phrases: [
      "Thursday 2pm works.",
      "I'll have it to you by Friday.",
      "Loop my CFO in on the pricing call.",
    ],
  },
];

const SIGNAL_DETAILS: Record<SignalType, string[]> = {
  website_visit: [
    "Visited /product — 3 min",
    "Visited /customers — 1 min",
    "Visited /about — 40s",
    "Visited /integrations — 2 min",
  ],
  pricing_page: [
    "Opened pricing — 4 min dwell",
    "Opened pricing — compared annual vs monthly",
    "Opened pricing — returned 3 times this week",
  ],
  content_download: [
    "Downloaded '2026 SDR playbook'",
    "Downloaded 'Benchmark report: SaaS conversion'",
    "Downloaded security whitepaper",
  ],
  email_open: [
    "Opened 'Intro from Alpina' · 3×",
    "Opened 'Demo follow-up'",
    "Opened 'Pricing proposal'",
  ],
  email_click: [
    "Clicked case study link",
    "Clicked pricing CTA",
    "Clicked calendar booking",
  ],
  linkedin_view: [
    "Viewed your LinkedIn profile",
    "Viewed 3 other Alpina team profiles",
  ],
  linkedin_engage: [
    "Liked your product-launch post",
    "Commented on Alpina Tech announcement",
    "Followed Alpina Tech company page",
  ],
  competitor_research: [
    "Visited competitor comparison page",
    "Read G2 review thread",
    "Requested Outreach demo (via intent data)",
  ],
  webinar_attend: [
    "Attended 'Sales velocity in B2B' webinar — 47 min",
    "Registered for upcoming workshop",
  ],
  form_fill: ["Filled contact form", "Submitted ROI calculator"],
  demo_request: ["Requested a demo via /contact", "Booked calendar slot"],
};

const SEQUENCE_NAMES = [
  "Q2 · Outbound · AE-ICP · Mid-market SaaS",
  "Q2 · Inbound · Demo follow-up · 72h",
  "Q2 · Reactivation · Cold since Jan",
  "Q2 · Expansion · Existing customers",
  "Q2 · Event follow-up · SaaStr",
];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function substitute(template: string, lead: Lead, rep?: Rep): string {
  return template
    .replaceAll("$FIRST", lead.firstName)
    .replaceAll("$COMPANY", lead.company)
    .replaceAll("$INDUSTRY", lead.industry)
    .replaceAll("$REP", rep?.name ?? "the Alpina team")
    .replaceAll("$NAME", lead.firstName)
    .replaceAll(
      "$TOPIC",
      pick(["ICP calibration", "pipeline velocity", "lead scoring"]),
    )
    .replaceAll(
      "$REFERRAL",
      pick(["a mutual connection", "Sequoia portfolio", "SaaStr"]),
    );
}

export function generateConversations(
  leads: Lead[],
  reps: Rep[],
): Conversation[] {
  const conversations: Conversation[] = [];
  for (const lead of leads) {
    if (lead.status === "new" && Math.random() > 0.4) continue;
    const channelCount =
      lead.status === "qualified" || lead.status === "converted"
        ? faker.number.int({ min: 2, max: 3 })
        : faker.number.int({ min: 1, max: 2 });
    const channels = faker.helpers.arrayElements(CHANNELS_POOL, channelCount);
    const rep =
      reps.find((r) => r.id === lead.assignedTo) ??
      faker.helpers.arrayElement(reps);

    for (const channel of channels) {
      const messageCount = faker.number.int({ min: 3, max: 15 });
      const messages: Message[] = [];
      const base = new Date(lead.createdAt).getTime();
      for (let i = 0; i < messageCount; i++) {
        const direction: "inbound" | "outbound" =
          i === 0 ? "outbound" : Math.random() > 0.55 ? "outbound" : "inbound";
        const template =
          channel === "linkedin"
            ? pick(LINKEDIN_BODIES)
            : channel === "whatsapp" || channel === "telegram"
              ? pick(WHATSAPP_BODIES)
              : channel === "sms"
                ? pick(SMS_BODIES)
                : direction === "outbound"
                  ? pick(OUTBOUND_BODIES)
                  : pick(INBOUND_BODIES);
        const ts = new Date(
          base + i * faker.number.int({ min: 6, max: 40 }) * 60 * 60 * 1000,
        ).toISOString();
        messages.push({
          id: faker.string.uuid(),
          channel,
          direction,
          timestamp: ts,
          body: substitute(template, lead, rep),
          repId: direction === "outbound" ? rep.id : undefined,
          status:
            direction === "outbound"
              ? pick(["sent", "delivered", "read", "replied"])
              : "delivered",
          sentiment:
            direction === "inbound"
              ? pick(["positive", "neutral", "neutral", "negative"])
              : "neutral",
        });
      }
      const unread =
        direction(messages[messages.length - 1]) === "inbound"
          ? faker.number.int({ min: 0, max: 2 })
          : 0;
      conversations.push({
        id: faker.string.uuid(),
        leadId: lead.id,
        channel,
        subject:
          channel === "email"
            ? substitute(pick(EMAIL_SUBJECTS), lead, rep)
            : undefined,
        messages,
        lastMessageAt: messages[messages.length - 1].timestamp,
        unread,
        preview: messages[messages.length - 1].body.slice(0, 120),
      });
    }
  }
  return conversations.sort(
    (a, b) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  );
}

function direction(message: Message): "inbound" | "outbound" {
  return message.direction;
}

function waveform(duration: number): number[] {
  const samples = Math.min(Math.max(Math.floor(duration / 5), 20), 80);
  const arr: number[] = [];
  for (let i = 0; i < samples; i++) {
    const envelope = Math.sin((i / samples) * Math.PI) + 0.4;
    arr.push(
      Math.max(0.08, Math.min(1, envelope * (0.3 + Math.random() * 0.7))),
    );
  }
  return arr;
}

export function generateCalls(leads: Lead[], reps: Rep[]): CallRecording[] {
  const calls: CallRecording[] = [];
  for (const lead of leads) {
    if (
      lead.status !== "qualified" &&
      lead.status !== "converted" &&
      !(lead.status === "contacted" && Math.random() > 0.7)
    ) {
      continue;
    }
    const rep =
      reps.find((r) => r.id === lead.assignedTo) ??
      faker.helpers.arrayElement(reps);
    const callCount = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < callCount; i++) {
      const duration = faker.number.int({ min: 420, max: 2700 });
      const template = TRANSCRIPT_TEMPLATES[i % TRANSCRIPT_TEMPLATES.length];
      const transcript: CallTranscriptLine[] = template.map((line, idx) => ({
        speaker: line.speaker as "rep" | "prospect",
        timestamp: Math.round((duration / template.length) * idx),
        text: substitute(line.text, lead, rep),
      }));

      const keyMoments: CallMoment[] = MOMENT_TEMPLATES.slice(
        0,
        faker.number.int({ min: 3, max: 5 }),
      ).map((m, idx) => ({
        type: m.type,
        timestamp: Math.round((duration / 5) * (idx + 1) - 30),
        speaker: pick(["rep", "prospect"]) as "rep" | "prospect",
        text: pick(m.phrases),
      }));

      const started = new Date(lead.createdAt);
      started.setDate(
        started.getDate() + i + faker.number.int({ min: 1, max: 8 }),
      );
      started.setHours(faker.number.int({ min: 9, max: 17 }));

      calls.push({
        id: faker.string.uuid(),
        leadId: lead.id,
        repId: rep.id,
        startedAt: started.toISOString(),
        duration,
        talkRatio:
          0.4 + Math.random() * 0.25 + (lead.status === "converted" ? 0.05 : 0),
        sentiment: faker.number.float({
          min: lead.status === "converted" ? 0.3 : -0.2,
          max: lead.status === "converted" ? 0.9 : 0.6,
        }),
        summary: pick(CALL_SUMMARIES),
        transcript,
        keyMoments,
        waveform: waveform(duration),
      });
    }
  }
  return calls.sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );
}

export function generateSignals(leads: Lead[]): Signal[] {
  const signals: Signal[] = [];
  const types: SignalType[] = [
    "website_visit",
    "pricing_page",
    "content_download",
    "email_open",
    "email_click",
    "linkedin_view",
    "linkedin_engage",
    "competitor_research",
    "webinar_attend",
    "form_fill",
    "demo_request",
  ];
  for (const lead of leads) {
    const count = faker.number.int({ min: 3, max: 18 });
    for (let i = 0; i < count; i++) {
      const type = pick(types);
      const ts = new Date(lead.createdAt);
      ts.setHours(
        ts.getHours() +
          faker.number.int({ min: -240, max: 240 }) +
          i * faker.number.int({ min: 2, max: 12 }),
      );
      const intent: Signal["intent"] =
        type === "pricing_page" ||
        type === "demo_request" ||
        type === "competitor_research"
          ? "high"
          : type === "content_download" ||
              type === "webinar_attend" ||
              type === "linkedin_engage"
            ? "medium"
            : "low";
      signals.push({
        id: faker.string.uuid(),
        leadId: lead.id,
        timestamp: ts.toISOString(),
        type,
        detail: pick(SIGNAL_DETAILS[type]),
        intent,
      });
    }
  }
  return signals.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export function generateSequences(reps: Rep[]): Sequence[] {
  return SEQUENCE_NAMES.map((name, i) => {
    const owner = faker.helpers.arrayElement(
      reps.filter((r) => r.role === "SDR" || r.role === "Manager"),
    );
    const enrolled = faker.number.int({ min: 60, max: 320 });
    const delivered = Math.round(enrolled * (0.92 + Math.random() * 0.07));
    const opened = Math.round(delivered * (0.38 + Math.random() * 0.2));
    const replied = Math.round(delivered * (0.04 + Math.random() * 0.12));
    const booked = Math.round(replied * (0.2 + Math.random() * 0.4));
    const stepCount = faker.number.int({ min: 4, max: 6 });
    const steps: SequenceStep[] = [];
    const stepTypes: SequenceStepType[] = [
      "email",
      "linkedin",
      "email",
      "call",
      "linkedin",
      "task",
    ];
    let dayOffset = 0;
    for (let j = 0; j < stepCount; j++) {
      const type = stepTypes[j % stepTypes.length];
      dayOffset += j === 0 ? 0 : faker.number.int({ min: 2, max: 5 });
      steps.push({
        id: faker.string.uuid(),
        day: dayOffset,
        type,
        subject:
          type === "email"
            ? pick(EMAIL_SUBJECTS)
            : type === "linkedin"
              ? "LinkedIn DM — warm intro"
              : type === "call"
                ? "Discovery call attempt"
                : "Research account",
        replyRate:
          type === "email"
            ? 0.03 + Math.random() * 0.08
            : type === "linkedin"
              ? 0.12 + Math.random() * 0.14
              : 0,
        openRate: type === "email" ? 0.35 + Math.random() * 0.3 : 0,
        bounceRate: type === "email" ? Math.random() * 0.05 : 0,
      });
    }
    return {
      id: `seq-${i + 1}`,
      name,
      ownerId: owner.id,
      audience: pick([
        "AE-ICP · Mid-market SaaS",
        "Inbound · 72h response",
        "Cold · 6mo no touch",
        "Existing customers · expansion",
        "SaaStr attendees",
      ]),
      status: pick(["active", "active", "active", "paused", "draft"] as const),
      enrolled,
      delivered,
      opened,
      replied,
      booked,
      steps,
      createdAt: faker.date.past({ years: 0.5 }).toISOString(),
    };
  });
}
