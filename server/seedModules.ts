/**
 * Seed data for the 14 Interactive Book Modules
 * Based on the Destiny Hacking book chapters
 */

export const modulesSeedData = [
  {
    moduleNumber: 1,
    title: "The Divine Gift",
    corePrinciple: "Free will is a skill, not a given. You must train it like a muscle.",
    mentalModel: "Imagine your will as a muscle that atrophies without use. Every conscious choice is a rep. Every automatic behavior is decay.",
    dailyPractice: "The Passenger/Pilot Check-In: Throughout the day, pause and ask yourself: 'Am I the passenger or the pilot right now?' Notice when you're on autopilot and consciously take back control.",
    decisionChallenge: {
      scenario: "You wake up and reach for your phone automatically. What do you do?",
      options: [
        {
          choice: "Put the phone down and take 3 conscious breaths first",
          outcome: "You've just exercised your will muscle. The day starts with you in control.",
          impact: { courage: +5, discipline: +5 }
        },
        {
          choice: "Check your phone but notice you're doing it",
          outcome: "Awareness is the first step. You're no longer unconscious.",
          impact: { reactivity: -3 }
        },
        {
          choice: "Scroll mindlessly for 30 minutes",
          outcome: "The passenger is driving. Your will muscle atrophies a little more.",
          impact: { discipline: -5, calm: -3 }
        }
      ]
    },
    reflectionPrompt: "Identify one automatic behavior you do every day without thinking. Tomorrow, do it consciously and notice how it feels different.",
    requiredPreviousModule: null,
    requiredPracticeDays: 0, // First module is unlocked by default
    estimatedMinutes: 15
  },
  {
    moduleNumber: 2,
    title: "The Unbreakable Law",
    corePrinciple: "You reap what you sow. Every action is a seed that produces a harvest.",
    mentalModel: "Your life is a garden. Every choice plants a seed. Some seeds grow fast (habits), others take years (character). You can't cheat the harvest.",
    dailyPractice: "Sowing & Reaping Journal: Each evening, write down one seed you planted today and predict what harvest it will produce in 30 days.",
    decisionChallenge: {
      scenario: "You have a difficult conversation ahead. You can prepare thoughtfully or wing it.",
      options: [
        {
          choice: "Spend 15 minutes clarifying your intention and desired outcome",
          outcome: "You plant a seed of intentionality. The conversation is more likely to be productive.",
          impact: { discipline: +5, courage: +3 }
        },
        {
          choice: "Go in reactive and see what happens",
          outcome: "You plant a seed of chaos. The harvest will match the seed.",
          impact: { reactivity: +5, control: -3 }
        }
      ]
    },
    reflectionPrompt: "Think of one area of your life where you're unhappy with the harvest. What seeds have you been planting there?",
    requiredPreviousModule: 1,
    requiredPracticeDays: 7,
    estimatedMinutes: 15
  },
  {
    moduleNumber: 3,
    title: "The Unfair Advantage",
    corePrinciple: "Suffering is raw material for strength. Your hardships are your competitive advantage.",
    mentalModel: "Think of suffering as weight in the gym. It's not punishment—it's resistance training for your soul.",
    dailyPractice: "The Meaning-Making Exercise: When something difficult happens, immediately ask: 'How is this making me stronger?' Write down one specific way.",
    decisionChallenge: {
      scenario: "You face a setback that feels unfair and painful.",
      options: [
        {
          choice: "Ask 'What is this teaching me?' and extract the lesson",
          outcome: "You transform suffering into strength. The pain becomes fuel.",
          impact: { courage: +7, victim: -5 }
        },
        {
          choice: "Acknowledge the pain but don't dwell on it",
          outcome: "You don't let it break you, but you don't fully use it either.",
          impact: { acceptance: +3 }
        },
        {
          choice: "Complain about how unfair it is",
          outcome: "You stay stuck in victim mode. The suffering is wasted.",
          impact: { victim: +5, blame: +3 }
        }
      ]
    },
    reflectionPrompt: "Reframe one past hardship: How did it make you stronger? What would you have missed if it hadn't happened?",
    requiredPreviousModule: 2,
    requiredPracticeDays: 7,
    estimatedMinutes: 15
  },
  {
    moduleNumber: 4,
    title: "The Gravity of Choice",
    corePrinciple: "Understand victim/abuser dynamics. You're not a victim—you're choosing your response.",
    mentalModel: "Victim and abuser are roles, not identities. You can step out of both by owning your power to choose.",
    dailyPractice: "Responsibility Inventory: List one area where you've been playing victim. Ask: 'What am I choosing here? What power do I actually have?'",
    decisionChallenge: {
      scenario: "Someone treats you unfairly. You feel victimized.",
      options: [
        {
          choice: "Identify what you can control and take action on it",
          outcome: "You reclaim your power. The victim role dissolves.",
          impact: { victim: -7, blame: -5, courage: +5 }
        },
        {
          choice: "Set a boundary and walk away",
          outcome: "You protect yourself without staying stuck in the dynamic.",
          impact: { control: +3, attachment: -3 }
        },
        {
          choice: "Blame them and tell everyone how unfair it is",
          outcome: "You cement yourself in the victim role. Nothing changes.",
          impact: { victim: +7, blame: +5 }
        }
      ]
    },
    reflectionPrompt: "Identify one area where you're playing victim. What are you avoiding by staying in that role?",
    requiredPreviousModule: 3,
    requiredPracticeDays: 7,
    estimatedMinutes: 15
  },
  {
    moduleNumber: 5,
    title: "The Crossroads",
    corePrinciple: "Indecision is a hidden cost. Every delay is a choice with consequences.",
    mentalModel: "Imagine standing at a crossroads. Staying there costs energy. Moving forward—even if imperfect—creates momentum.",
    dailyPractice: "The 10-Minute Decision Protocol: Set a timer for 10 minutes. List pros/cons, then decide. No more deliberation.",
    decisionChallenge: {
      scenario: "You've been avoiding a decision for weeks. It's draining your energy.",
      options: [
        {
          choice: "Use the 10-minute protocol and commit to a decision now",
          outcome: "You break free. Even if it's not perfect, you have momentum.",
          impact: { discipline: +7, courage: +5, calm: +3 }
        },
        {
          choice: "Gather one more piece of information, then decide tomorrow",
          outcome: "You delay again. The cost compounds.",
          impact: { discipline: -3, calm: -2 }
        },
        {
          choice: "Keep waiting for clarity",
          outcome: "Paralysis deepens. The decision makes itself by default.",
          impact: { discipline: -7, courage: -5 }
        }
      ]
    },
    reflectionPrompt: "Make one decision you've been avoiding. Set a 10-minute timer right now and commit.",
    requiredPreviousModule: 4,
    requiredPracticeDays: 7,
    estimatedMinutes: 15
  },
  {
    moduleNumber: 6,
    title: "The Phoenix Moment",
    corePrinciple: "Forgiveness is power reclamation. Holding grudges gives your power away.",
    mentalModel: "A grudge is like drinking poison and expecting the other person to die. Forgiveness is setting yourself free.",
    dailyPractice: "The Forgiveness Ritual: Write down one grudge. Then write: 'I release this. I reclaim my power.' Burn or shred the paper.",
    decisionChallenge: {
      scenario: "Someone wronged you deeply. You're holding onto resentment.",
      options: [
        {
          choice: "Perform the Forgiveness Ritual and let it go",
          outcome: "You reclaim your energy. The weight lifts.",
          impact: { attachment: -7, calm: +5, courage: +3 }
        },
        {
          choice: "Acknowledge the hurt but don't dwell on it",
          outcome: "You make progress but don't fully release it.",
          impact: { attachment: -3, calm: +2 }
        },
        {
          choice: "Keep replaying the story of what they did",
          outcome: "You stay chained to the past. They still control you.",
          impact: { attachment: +7, victim: +5, calm: -5 }
        }
      ]
    },
    reflectionPrompt: "Release one grudge. Notice how much energy it was costing you.",
    requiredPreviousModule: 5,
    requiredPracticeDays: 7,
    estimatedMinutes: 15
  },
  {
    moduleNumber: 7,
    title: "The Inner Citadel (Stoicism)",
    corePrinciple: "Build an unbreakable inner fortress. External chaos can't touch your core.",
    mentalModel: "Your mind is a fortress. Stoicism is the architecture that makes it impenetrable.",
    dailyPractice: "Marcus Aurelius's Morning Meditation: Each morning, remind yourself: 'Today I will meet difficult people. They can't harm my character—only I can do that.'",
    decisionChallenge: {
      scenario: "External chaos erupts—criticism, setbacks, unexpected problems.",
      options: [
        {
          choice: "Practice dichotomy of control for 24 hours: focus only on what you can control",
          outcome: "You build your inner citadel. External chaos loses its power.",
          impact: { control: +7, calm: +7, acceptance: +5 }
        },
        {
          choice: "React to everything but try to stay calm",
          outcome: "You're still at the mercy of external events.",
          impact: { reactivity: +3, calm: -2 }
        },
        {
          choice: "Let the chaos overwhelm you",
          outcome: "Your fortress crumbles. You're defenseless.",
          impact: { reactivity: +7, calm: -7, control: -5 }
        }
      ]
    },
    reflectionPrompt: "Practice dichotomy of control for 24 hours. Notice how much mental energy you reclaim.",
    requiredPreviousModule: 6,
    requiredPracticeDays: 7,
    estimatedMinutes: 15
  },
  {
    moduleNumber: 8,
    title: "Responsibility as Power",
    corePrinciple: "Radical ownership = radical freedom. The more you own, the more power you have.",
    mentalModel: "Responsibility isn't a burden—it's the key to freedom. Blame is a prison.",
    dailyPractice: "The 'I am responsible' mantra: When something goes wrong, immediately say: 'I am responsible.' Then ask: 'What can I do about it?'",
    decisionChallenge: {
      scenario: "Something goes wrong that wasn't your fault. You could blame others or own it.",
      options: [
        {
          choice: "Take ownership of one thing you've been blaming others for",
          outcome: "You reclaim your power. Solutions appear.",
          impact: { blame: -7, victim: -5, courage: +7 }
        },
        {
          choice: "Acknowledge your part but also point out others' roles",
          outcome: "You share responsibility but don't fully own it.",
          impact: { blame: -3, victim: -2 }
        },
        {
          choice: "Blame everyone else and defend your innocence",
          outcome: "You stay powerless. Nothing changes.",
          impact: { blame: +7, victim: +7, courage: -5 }
        }
      ]
    },
    reflectionPrompt: "Take ownership of one thing you've been blaming others for. Notice how your power returns.",
    requiredPreviousModule: 7,
    requiredPracticeDays: 7,
    estimatedMinutes: 15
  },
  {
    moduleNumber: 9,
    title: "The Alchemy of Will",
    corePrinciple: "Turn suffering into strength. Pain is the raw material for transformation.",
    mentalModel: "You're an alchemist. Suffering is lead. Will is the fire that transforms it into gold.",
    dailyPractice: "The Redemption Narrative Exercise: Take one painful experience and rewrite the story from the perspective of what it made possible.",
    decisionChallenge: {
      scenario: "You're in pain—emotional, physical, or circumstantial.",
      options: [
        {
          choice: "Rewrite one chapter of your past: What did that pain make possible?",
          outcome: "You transform the pain into fuel. It becomes your advantage.",
          impact: { victim: -7, courage: +7, attachment: -5 }
        },
        {
          choice: "Accept the pain but don't try to transform it",
          outcome: "You endure but don't alchemize.",
          impact: { acceptance: +3 }
        },
        {
          choice: "Stay stuck in the pain and wish it hadn't happened",
          outcome: "The pain remains dead weight. No transformation.",
          impact: { victim: +7, attachment: +5 }
        }
      ]
    },
    reflectionPrompt: "Rewrite one chapter of your past. What did that suffering make possible that wouldn't exist otherwise?",
    requiredPreviousModule: 8,
    requiredPracticeDays: 7,
    estimatedMinutes: 15
  },
  {
    moduleNumber: 10,
    title: "The Surfer and the Wave",
    corePrinciple: "Balance will with acceptance. You can't control the wave, but you can ride it.",
    mentalModel: "You're a surfer. The wave is life. Fighting it makes you drown. Accepting and riding it makes you free.",
    dailyPractice: "The Serenity Prayer Protocol: Each morning, list what you can control today and what you must accept. Focus only on the first list.",
    decisionChallenge: {
      scenario: "Something is outside your control but affecting you deeply.",
      options: [
        {
          choice: "Identify what you can/can't control today using the Serenity Prayer Protocol",
          outcome: "You find peace. Energy flows to what matters.",
          impact: { acceptance: +7, control: +5, calm: +7 }
        },
        {
          choice: "Try to control it anyway",
          outcome: "You exhaust yourself fighting the wave.",
          impact: { control: +5, calm: -5, acceptance: -3 }
        },
        {
          choice: "Give up and feel helpless",
          outcome: "You drown in the wave. No power, no peace.",
          impact: { victim: +7, control: -7 }
        }
      ]
    },
    reflectionPrompt: "Identify what you can/can't control today. Let go of the second list completely.",
    requiredPreviousModule: 9,
    requiredPracticeDays: 7,
    estimatedMinutes: 15
  },
  {
    moduleNumber: 11,
    title: "Prayer as Will Amplifier",
    corePrinciple: "Prayer is technology, not surrender. It's a tool for amplifying will.",
    mentalModel: "Prayer isn't begging. It's alignment. You're not asking for rescue—you're asking for strength to act.",
    dailyPractice: "The Four-Part Prayer: Gratitude (acknowledge what is), Clarity (ask for wisdom), Strength (request power to act), Alignment (align will with purpose).",
    decisionChallenge: {
      scenario: "You face a challenge that requires more than you think you have.",
      options: [
        {
          choice: "Pray with intention using the Four-Part Prayer, then act",
          outcome: "You access a deeper reservoir of will. Power flows.",
          impact: { courage: +7, calm: +5, discipline: +5 }
        },
        {
          choice: "Try to push through with willpower alone",
          outcome: "You make progress but it's harder than it needs to be.",
          impact: { discipline: +3, calm: -2 }
        },
        {
          choice: "Pray passively and wait for rescue",
          outcome: "Nothing changes. Prayer without action is empty.",
          impact: { victim: +5, discipline: -5 }
        }
      ]
    },
    reflectionPrompt: "Pray with intention, not passivity. Use the Four-Part Prayer before a difficult task and notice the difference.",
    requiredPreviousModule: 10,
    requiredPracticeDays: 7,
    estimatedMinutes: 15
  },
  {
    moduleNumber: 12,
    title: "The Power of Tribe",
    corePrinciple: "Your will needs a community. Isolation weakens you; tribe strengthens you.",
    mentalModel: "You're not a lone wolf. You're a pack animal. Your will is amplified by the right tribe.",
    dailyPractice: "Inner Circle Audit: List your closest 5 people. Ask: 'Do they make my will stronger or weaker?' Adjust accordingly.",
    decisionChallenge: {
      scenario: "You're trying to build will alone. It's exhausting.",
      options: [
        {
          choice: "Reach out to one person in your tribe for accountability",
          outcome: "Your will is amplified. The burden becomes shared strength.",
          impact: { courage: +5, discipline: +5, attachment: +3 }
        },
        {
          choice: "Keep trying alone",
          outcome: "You make progress but it's harder and lonelier.",
          impact: { discipline: +2, attachment: -3 }
        },
        {
          choice: "Surround yourself with people who enable weakness",
          outcome: "Your will atrophies. The tribe drags you down.",
          impact: { discipline: -7, courage: -5 }
        }
      ]
    },
    reflectionPrompt: "Reach out to one person in your tribe. Share one challenge and ask for accountability.",
    requiredPreviousModule: 11,
    requiredPracticeDays: 7,
    estimatedMinutes: 15
  },
  {
    moduleNumber: 13,
    title: "The Architect of Destiny",
    corePrinciple: "Daily choices build your future. You're not finding your destiny—you're building it.",
    mentalModel: "You're an architect. Every day is a brick. Your destiny is the building.",
    dailyPractice: "The Keystone Habit Protocol: Identify one habit that, if done daily, would transform everything else. Commit to it for 30 days.",
    decisionChallenge: {
      scenario: "You want a different future but keep making the same choices.",
      options: [
        {
          choice: "Identify and commit to one keystone habit starting today",
          outcome: "You lay the first brick of a new destiny. Momentum builds.",
          impact: { discipline: +7, courage: +5, victim: -5 }
        },
        {
          choice: "Make small changes but no keystone commitment",
          outcome: "You improve but don't transform.",
          impact: { discipline: +3 }
        },
        {
          choice: "Keep waiting for the right moment",
          outcome: "Your destiny is built by default, not design.",
          impact: { discipline: -7, victim: +5 }
        }
      ]
    },
    reflectionPrompt: "Identify and commit to one keystone habit. What single daily action would change everything?",
    requiredPreviousModule: 12,
    requiredPracticeDays: 7,
    estimatedMinutes: 15
  },
  {
    moduleNumber: 14,
    title: "Your Invictus Moment",
    corePrinciple: "You are the captain of your soul. No one can take that from you.",
    mentalModel: "Your soul is a ship. Life is the ocean. You don't control the waves, but you command the vessel.",
    dailyPractice: "The Invictus Declaration: Each morning, declare: 'I am the master of my fate. I am the captain of my soul.' Then act accordingly.",
    decisionChallenge: {
      scenario: "Life throws everything at you. You can surrender or stand.",
      options: [
        {
          choice: "Write your personal manifesto: What do you stand for?",
          outcome: "You claim your sovereignty. No one can take it from you.",
          impact: { courage: +10, victim: -10, discipline: +7 }
        },
        {
          choice: "Keep going but without a clear declaration",
          outcome: "You endure but don't fully claim your power.",
          impact: { courage: +3 }
        },
        {
          choice: "Give up and let life happen to you",
          outcome: "You abdicate the throne. Someone else will rule your life.",
          impact: { victim: +10, courage: -10, discipline: -7 }
        }
      ]
    },
    reflectionPrompt: "Write your personal manifesto. What do you stand for? What is non-negotiable? This is your Invictus Moment.",
    requiredPreviousModule: 13,
    requiredPracticeDays: 7,
    estimatedMinutes: 20
  }
];
