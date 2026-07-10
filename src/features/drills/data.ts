export type DrillCategory = "ott" | "approach" | "shortgame" | "putting";
export type SourceType = "youtube" | "instagram" | "tiktok" | "article";
export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface Drill {
  id: string;
  category: DrillCategory;
  title: string;
  description: string;
  source: {
    type: SourceType;
    label: string;
    url: string;
  };
  difficulty: Difficulty;
  durationMin: number;
  tags: string[];
}

function extractYouTubeId(url: string): string | null {
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return watchMatch[1];
  const shortsMatch = url.match(/\/shorts\/([^?/]+)/);
  if (shortsMatch) return shortsMatch[1];
  const shortLinkMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortLinkMatch) return shortLinkMatch[1];
  return null;
}

export function getDrillThumbnail(drill: Drill): string | null {
  if (drill.source.type !== "youtube") return null;
  const id = extractYouTubeId(drill.source.url);
  if (!id) return null;
  // mqdefault is 320×180 (16:9) and always available
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

export const DRILLS: Drill[] = [
  // ─── OFF THE TEE ───────────────────────────────────────────────────────────
  {
    id: "ott-1",
    category: "ott",
    title: "Tee Height Drill",
    description:
      "Learn exactly how high to tee the ball for your driver to optimize launch angle and spin. A simple but widely neglected fundamental that unlocks consistent distance.",
    source: {
      type: "youtube",
      label: "Me and My Golf",
      url: "https://www.youtube.com/watch?v=tflEyJ0O7VY",
    },
    difficulty: "beginner",
    durationMin: 10,
    tags: ["setup", "launch", "driver"],
  },
  {
    id: "ott-2",
    category: "ott",
    title: "Hip Rotation Drill",
    description:
      "Fix the most common fault in the downswing: early extension and stalling hips. This drill teaches you to properly clear your hips through impact for more power.",
    source: {
      type: "youtube",
      label: "Top Speed Golf",
      url: "https://www.youtube.com/watch?v=X2voOYvhVVk",
    },
    difficulty: "intermediate",
    durationMin: 15,
    tags: ["hips", "rotation", "power", "impact"],
  },
  {
    id: "ott-3",
    category: "ott",
    title: "Magic Move Pump Drill",
    description:
      "A sequencing drill that ingrains the correct transition from backswing to downswing. Eliminates the 'over-the-top' move that causes slices and weak shots.",
    source: {
      type: "youtube",
      label: "Athletic Motion Golf",
      url: "https://www.youtube.com/watch?v=DDS_zByxXdI",
    },
    difficulty: "intermediate",
    durationMin: 15,
    tags: ["transition", "sequence", "path", "slice fix"],
  },
  {
    id: "ott-4",
    category: "ott",
    title: "Swing From the Inside",
    description:
      "Use this drill to shallow the club on the downswing and attack the ball from the inside for a draw. Targets the root cause of pulls, slices, and inconsistent contact.",
    source: {
      type: "youtube",
      label: "Scratch Golf Academy",
      url: "https://www.youtube.com/watch?v=hfSSWhJGpj0",
    },
    difficulty: "beginner",
    durationMin: 10,
    tags: ["path", "inside-out", "draw", "slice fix"],
  },
  {
    id: "ott-5",
    category: "ott",
    title: "Downswing Stick Drill",
    description:
      "Place an alignment stick in the ground at 45° behind you. This external reference cues the correct downswing plane, eliminating casting and over-the-top moves.",
    source: {
      type: "youtube",
      label: "Chris Ryan Golf",
      url: "https://www.youtube.com/watch?v=ZrthDLf6Jh8",
    },
    difficulty: "intermediate",
    durationMin: 20,
    tags: ["plane", "downswing", "alignment", "path"],
  },
  {
    id: "ott-6",
    category: "ott",
    title: "Pause at the Top",
    description:
      "Deliberately pause at the top of your backswing to slow down your transition and improve tempo. Fixes rushing, improves sequence, and builds a consistent, repeatable action.",
    source: {
      type: "youtube",
      label: "Mark Crossfield",
      url: "https://www.youtube.com/shorts/FwzvO7xgChA",
    },
    difficulty: "beginner",
    durationMin: 10,
    tags: ["tempo", "transition", "backswing", "consistency"],
  },

  // ─── APPROACH ──────────────────────────────────────────────────────────────
  {
    id: "app-1",
    category: "approach",
    title: "Iron Contact Drill",
    description:
      "A focused drill to find the sweet spot every time with your irons. Targets the exact adjustments needed to compress the ball correctly and take a consistent divot.",
    source: {
      type: "youtube",
      label: "Eric Cogorno Golf",
      url: "https://www.youtube.com/watch?v=JAPGO-waO_o",
    },
    difficulty: "beginner",
    durationMin: 15,
    tags: ["contact", "compression", "divot", "irons"],
  },
  {
    id: "app-2",
    category: "approach",
    title: "Gate Drill for Irons",
    description:
      "Set two tees just outside the toe and heel of the ball to create a gate. Trains the club to travel on the correct in-to-square-to-in path without feedback from a teacher.",
    source: {
      type: "youtube",
      label: "Golf Instruction",
      url: "https://www.youtube.com/watch?v=-ouRybILLgY",
    },
    difficulty: "intermediate",
    durationMin: 20,
    tags: ["path", "face", "irons", "contact"],
  },
  {
    id: "app-3",
    category: "approach",
    title: "Step-Through Drill",
    description:
      "Step your trail foot toward the target as you swing through. Exaggerates the weight transfer and hip clearing needed to trap the ball and take a forward divot.",
    source: {
      type: "youtube",
      label: "Malaska Golf",
      url: "https://www.youtube.com/watch?v=m2eIwtXflOw",
    },
    difficulty: "intermediate",
    durationMin: 15,
    tags: ["weight shift", "hips", "impact", "irons"],
  },
  {
    id: "app-4",
    category: "approach",
    title: "Ball Then Turf Drill",
    description:
      "Danny Maude's go-to drill for striking irons correctly. Teaches you to hit the ball before the ground every time — the single most important skill in iron play.",
    source: {
      type: "youtube",
      label: "Danny Maude",
      url: "https://www.youtube.com/watch?v=La_RJYi1V04",
    },
    difficulty: "beginner",
    durationMin: 15,
    tags: ["contact", "divot", "low point", "irons"],
  },
  {
    id: "app-5",
    category: "approach",
    title: "Consistent Ball-Turf Contact",
    description:
      "Me and My Golf's approach to grooving perfect contact: a drill you can practice on the range or at home, building the muscle memory for ball-first strikes.",
    source: {
      type: "youtube",
      label: "Me and My Golf",
      url: "https://www.youtube.com/watch?v=oNClWgyqdoE",
    },
    difficulty: "beginner",
    durationMin: 10,
    tags: ["contact", "compression", "consistency", "irons"],
  },
  {
    id: "app-6",
    category: "approach",
    title: "Half-Swing Solid Strike",
    description:
      "Hit shots with a 9-to-3 (half) swing to feel true compression and proper rotation without the complexity of a full swing. Great for grooving the impact position.",
    source: {
      type: "youtube",
      label: "Top Speed Golf",
      url: "https://www.youtube.com/watch?v=sZJjIzTL4dg",
    },
    difficulty: "intermediate",
    durationMin: 20,
    tags: ["impact", "rotation", "half swing", "irons"],
  },

  // ─── SHORT GAME ────────────────────────────────────────────────────────────
  {
    id: "sg-1",
    category: "shortgame",
    title: "Hinge and Hold Chip Shot",
    description:
      "James Sieckmann's foundational chipping technique: hinge the wrists on the backswing and hold the angle through impact. Produces crisp, low-spinning chips that run out predictably.",
    source: {
      type: "youtube",
      label: "James Sieckmann",
      url: "https://www.youtube.com/watch?v=mlu7hMWtaDc",
    },
    difficulty: "intermediate",
    durationMin: 20,
    tags: ["chipping", "technique", "wrist", "contact"],
  },
  {
    id: "sg-2",
    category: "shortgame",
    title: "Wedge Distance Control — Clock System",
    description:
      "Dave Pelz's clock system: hit shots with your arms swinging to 8, 9, and 10 o'clock to produce consistent 50, 75, and 100-yard wedge distances. A tour-proven method.",
    source: {
      type: "youtube",
      label: "Dave Pelz / Golf Channel",
      url: "https://www.youtube.com/watch?v=0N9eVJxpZGY",
    },
    difficulty: "intermediate",
    durationMin: 30,
    tags: ["wedge", "distance control", "clock system", "scoring"],
  },
  {
    id: "sg-3",
    category: "shortgame",
    title: "Chipping 101",
    description:
      "Phil Mickelson breaks down his chipping fundamentals: setup, shaft lean, and swing technique. From a 6-time major champion famous for one of the best short games ever.",
    source: {
      type: "youtube",
      label: "Golf Channel",
      url: "https://www.youtube.com/watch?v=dpFd1xocxrE",
    },
    difficulty: "beginner",
    durationMin: 15,
    tags: ["chipping", "setup", "technique", "short game"],
  },
  {
    id: "sg-4",
    category: "shortgame",
    title: "Blast Out of Bunkers",
    description:
      "Rick Shiels demystifies the greenside bunker shot. Learn the correct entry angle, how to use the bounce, and how to consistently escape sand in one shot.",
    source: {
      type: "youtube",
      label: "Rick Shiels Golf",
      url: "https://www.youtube.com/watch?v=IEhq1hMWupg",
    },
    difficulty: "beginner",
    durationMin: 20,
    tags: ["bunker", "sand", "bounce", "greenside"],
  },
  {
    id: "sg-5",
    category: "shortgame",
    title: "How to Pitch a Golf Ball",
    description:
      "Danny Maude covers the complete pitching motion for 30–80 yard shots. Addresses body rotation, wrist action, and the key differences between a chip and a pitch.",
    source: {
      type: "youtube",
      label: "Danny Maude",
      url: "https://www.youtube.com/watch?v=1E7BPqJbb1s",
    },
    difficulty: "beginner",
    durationMin: 20,
    tags: ["pitching", "wedge", "technique", "short game"],
  },
  {
    id: "sg-6",
    category: "shortgame",
    title: "Luke Kwon Short Game Techniques",
    description:
      "Luke Kwon Golf covers practical short game techniques including wedge bounce usage, greenside reads, and drills for consistent up-and-downs.",
    source: {
      type: "youtube",
      label: "Luke Kwon Golf",
      url: "https://www.youtube.com/c/LukeKwonGolf",
    },
    difficulty: "intermediate",
    durationMin: 15,
    tags: ["chipping", "wedge", "bounce", "short game"],
  },

  // ─── PUTTING ───────────────────────────────────────────────────────────────
  {
    id: "put-1",
    category: "putting",
    title: "AimPoint Green Reading",
    description:
      "Learn to read greens using the AimPoint Express method — the system used by dozens of tour winners. Feel the slope with your feet to precisely calculate break.",
    source: {
      type: "youtube",
      label: "AimPoint Golf",
      url: "https://www.youtube.com/watch?v=N9JIIyh1YjU",
    },
    difficulty: "intermediate",
    durationMin: 20,
    tags: ["green reading", "break", "aim", "technique"],
  },
  {
    id: "put-2",
    category: "putting",
    title: "Dave Stockton Putting Drills",
    description:
      "Dave Stockton — coach to Phil Mickelson and Rory McIlroy — shares his approach to the stroke, face control at impact, and the pre-shot routine he teaches tour players.",
    source: {
      type: "youtube",
      label: "Dave Stockton",
      url: "https://www.youtube.com/watch?v=RZTDwTW0tcE",
    },
    difficulty: "intermediate",
    durationMin: 20,
    tags: ["stroke", "face", "pre-shot", "technique"],
  },
  {
    id: "put-3",
    category: "putting",
    title: "Lag Putting Drill",
    description:
      "Chris Como's fix for the most common cause of three-putts: poor lag putting. Covers distance control mechanics for 10, 25, and 40-foot putts.",
    source: {
      type: "youtube",
      label: "Chris Como Golf",
      url: "https://www.youtube.com/watch?v=c3E1YFmLT88",
    },
    difficulty: "intermediate",
    durationMin: 15,
    tags: ["lag putting", "distance control", "long putts"],
  },
  {
    id: "put-4",
    category: "putting",
    title: "The Putting Stroke — Brad Faxon",
    description:
      "Brad Faxon, widely considered the best putter of his generation, explains his approach to the stroke: soft grip, quiet body, and letting the putterhead flow through the ball.",
    source: {
      type: "youtube",
      label: "Brad Faxon",
      url: "https://www.youtube.com/watch?v=H71-ELqOQWU",
    },
    difficulty: "beginner",
    durationMin: 15,
    tags: ["stroke", "tempo", "grip", "feel"],
  },
  {
    id: "put-5",
    category: "putting",
    title: "3-Foot Circle Drill",
    description:
      "Dave Pelz's landmark drill: place 8 balls in a circle 3 feet from the hole and make all 8 before moving on. Builds the pressure-proof consistency that saves strokes.",
    source: {
      type: "youtube",
      label: "Dave Pelz / Golf Channel",
      url: "https://www.youtube.com/watch?v=IukApU3-Uys",
    },
    difficulty: "beginner",
    durationMin: 15,
    tags: ["short putts", "consistency", "pressure", "circle drill"],
  },
  {
    id: "put-6",
    category: "putting",
    title: "Metronome Tempo Drill",
    description:
      "Use a metronome (or app) to lock in a consistent putting rhythm. Research shows elite putters have a near-identical backswing-to-through ratio — this drill builds that habit.",
    source: {
      type: "youtube",
      label: "Golf Instruction",
      url: "https://www.youtube.com/watch?v=V3rxfrwP2BM",
    },
    difficulty: "beginner",
    durationMin: 10,
    tags: ["tempo", "rhythm", "consistency", "stroke"],
  },

  // ─── OFF THE TEE — Instagram / TikTok ─────────────────────────────────────
  {
    id: "ott-ig-1",
    category: "ott",
    title: "Hip Centering Drill",
    description:
      "George Gankas's 'butt against the wall' drill. Stand with your backside lightly touching a wall and make swings without bumping it — teaches you to center your pelvis instead of swaying off the ball.",
    source: {
      type: "instagram",
      label: "George Gankas",
      url: "https://www.instagram.com/reel/C61MmaJrf3y/",
    },
    difficulty: "intermediate",
    durationMin: 15,
    tags: ["hips", "sway", "setup", "power"],
  },
  {
    id: "ott-ig-2",
    category: "ott",
    title: "Stop Slicing Your Driver",
    description:
      "Me and My Golf break down exactly why pulling on the handle opens the face and causes the slice — and the one move that fixes it instantly. One of their most-watched Reels.",
    source: {
      type: "instagram",
      label: "Me and My Golf",
      url: "https://www.instagram.com/meandmygolf/reel/DB14ksTIq2l/",
    },
    difficulty: "beginner",
    durationMin: 10,
    tags: ["slice fix", "face angle", "path", "driver"],
  },
  {
    id: "ott-tt-1",
    category: "ott",
    title: "Stop Slicing Forever",
    description:
      "Rick Shiels explains why golfers slice (pulling the handle in the downswing opens the face) and gives a simple feel drill to square it up. High-engagement TikTok with 130K+ likes.",
    source: {
      type: "tiktok",
      label: "Rick Shiels PGA",
      url: "https://www.tiktok.com/@rickshielspga/video/7385621944542039329",
    },
    difficulty: "beginner",
    durationMin: 10,
    tags: ["slice fix", "face angle", "driver", "quick fix"],
  },
  {
    id: "ott-ig-3",
    category: "ott",
    title: "Hand Path Drill",
    description:
      "Shauheen Nakhjavani's alignment-stick drill: set a stick at belt height, place the ball under it, and keep your hands inside and below the stick on the downswing. Shallows the club and eliminates over-the-top.",
    source: {
      type: "instagram",
      label: "@shkeengolf",
      url: "https://www.instagram.com/shkeengolf/reel/C54IrWjpRbE/",
    },
    difficulty: "intermediate",
    durationMin: 15,
    tags: ["path", "shallowing", "over-the-top", "alignment stick"],
  },

  // ─── APPROACH — Instagram / TikTok ────────────────────────────────────────
  {
    id: "app-ig-1",
    category: "approach",
    title: "Rotation Drill for Sequencing",
    description:
      "Monte Scheinblum's drill shows you exactly how you're supposed to rotate in the golf swing — and instantly exposes where you're going wrong. Addresses the sequencing fault that plagues most amateurs.",
    source: {
      type: "instagram",
      label: "Monte Scheinblum",
      url: "https://www.instagram.com/montescheinblum/reel/DAXKgF5vyiR/",
    },
    difficulty: "intermediate",
    durationMin: 15,
    tags: ["rotation", "sequence", "impact", "irons"],
  },
  {
    id: "app-ig-2",
    category: "approach",
    title: "Flamingo Drill",
    description:
      "Chris Ryan's Flamingo Drill: keep your weight forward and your swing short, focusing on landing the club target-side of the ball. Fixes fat/thin strikes caused by hanging back and prevents the arc bottoming out too early.",
    source: {
      type: "instagram",
      label: "Chris Ryan Golf",
      url: "https://www.instagram.com/p/DQmqLPMjNrS/",
    },
    difficulty: "intermediate",
    durationMin: 15,
    tags: ["weight shift", "low point", "fat/thin", "irons"],
  },
  {
    id: "app-ig-3",
    category: "approach",
    title: "Master Weight Shift",
    description:
      "Shawn Clement (Wisdom in Golf) shows how to properly shift weight from trail to lead leg without over-loading the back foot — a subtle but critical sequencing fault that costs distance and consistency.",
    source: {
      type: "instagram",
      label: "Wisdom in Golf",
      url: "https://www.instagram.com/reel/DE2HNBsxq9t/",
    },
    difficulty: "intermediate",
    durationMin: 15,
    tags: ["weight shift", "sequence", "trail leg", "irons"],
  },

  // ─── SHORT GAME — Instagram / TikTok ──────────────────────────────────────
  {
    id: "sg-ig-1",
    category: "shortgame",
    title: "Chipping Ladder Drill",
    description:
      "Luke Gerrard's ladder drill: lay 5 clubs on the ground 1 meter apart, 5 meters from you, then chip one ball to each position in order — 1→2→3→4 then back. Miss any target and restart. Builds precise flight and distance control.",
    source: {
      type: "instagram",
      label: "Luke Gerrard Golf",
      url: "https://www.instagram.com/lukegerrardgolf/reel/C5U1V22SYGf/",
    },
    difficulty: "intermediate",
    durationMin: 20,
    tags: ["chipping", "distance control", "ladder", "game drill"],
  },
  {
    id: "sg-tt-1",
    category: "shortgame",
    title: "Chipping Made Simple",
    description:
      "Chris Ryan simplifies chipping fundamentals into one easy-to-follow TikTok lesson — setup, clubface, and the one swing thought that cleans up contact around the greens.",
    source: {
      type: "tiktok",
      label: "Chris Ryan Golf",
      url: "https://www.tiktok.com/@chrisryangolf/video/7446383828496583969",
    },
    difficulty: "beginner",
    durationMin: 10,
    tags: ["chipping", "setup", "technique", "quick tip"],
  },

  // ─── PUTTING — Instagram / TikTok ─────────────────────────────────────────
  {
    id: "put-ig-1",
    category: "putting",
    title: "Coin Drill — Speed Control",
    description:
      "Phil Kenyon (putting coach to Rory McIlroy, Dustin Johnson, and more) breaks down how the coin drill is commonly misapplied — and the correct way to use it to develop the speed control he calls the most important putting skill.",
    source: {
      type: "instagram",
      label: "Phil Kenyon",
      url: "https://www.instagram.com/philkenyonputting/reel/C2INeu2tvYi/",
    },
    difficulty: "intermediate",
    durationMin: 15,
    tags: ["speed control", "face", "distance", "tour coached"],
  },
  {
    id: "put-ig-2",
    category: "putting",
    title: "Gate Drill Setup",
    description:
      "Pavan Sagoo demonstrates the classic gate drill: set two tees just wider than your putterhead, then stroke through without touching them. Trains start line, path, and face angle simultaneously.",
    source: {
      type: "instagram",
      label: "Pavan Sagoo",
      url: "https://www.instagram.com/pavansagoo/reel/DFOJPu5t0YZ/",
    },
    difficulty: "beginner",
    durationMin: 10,
    tags: ["gate drill", "path", "face", "start line"],
  },
];

export const CATEGORY_CONFIG: Record<
  DrillCategory,
  { label: string; color: string; bg: string }
> = {
  ott: { label: "Off the Tee", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  approach: { label: "Approach", color: "#22d3ee", bg: "rgba(34,211,238,0.12)" },
  shortgame: { label: "Short Game", color: "#fb7185", bg: "rgba(251,113,133,0.12)" },
  putting: { label: "Putting", color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
};

export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; className: string }
> = {
  beginner: { label: "Beginner", className: "text-positive" },
  intermediate: { label: "Intermediate", className: "text-[#f59e0b]" },
  advanced: { label: "Advanced", className: "text-[#fb7185]" },
};
