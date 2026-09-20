/**
 * Warm, open-ended writing prompts for the author.
 * Topics: people, places, food, festivals, first times, small kindnesses, work, journeys, and objects.
 * Strictly non-intrusive: no trauma, illness, or money troubles.
 */

export interface WritingPrompt {
  id: number;
  category: 'people' | 'places' | 'food' | 'festivals' | 'first-times' | 'kindness' | 'work' | 'journeys' | 'objects';
  text: string;
}

export const WRITING_PROMPTS: readonly WritingPrompt[] = [
  // People
  {
    id: 1,
    category: 'people',
    text: 'Think of an elder from your village whose voice or laugh you can still clearly hear. What was a phrase they often repeated?',
  },
  {
    id: 2,
    category: 'people',
    text: 'A teacher or mentor who said something encouraging that stayed with you throughout your life.',
  },
  {
    id: 3,
    category: 'people',
    text: 'A childhood friend with whom you shared an unwritten secret or a silly game that only the two of you understood.',
  },
  {
    id: 4,
    category: 'people',
    text: 'A quiet neighbour who always observed the lane from their verandah or doorway.',
  },
  {
    id: 5,
    category: 'people',
    text: 'Someone whose handwriting or letters you used to look forward to receiving.',
  },

  // Places
  {
    id: 6,
    category: 'places',
    text: 'The cool shade of a particular banyan or neem tree where people gathered during hot summer afternoons.',
  },
  {
    id: 7,
    category: 'places',
    text: 'A room or corner of your ancestral house that felt especially peaceful at dusk.',
  },
  {
    id: 8,
    category: 'places',
    text: 'The local market or weekly haat—the smells, the calls of vendors, and the bustling energy.',
  },
  {
    id: 9,
    category: 'places',
    text: 'The riverbank, pond, or well where the village met at the start or end of the day.',
  },
  {
    id: 10,
    category: 'places',
    text: 'The first impression of a bustling railway platform when arriving in a new town for the very first time.',
  },

  // Food
  {
    id: 11,
    category: 'food',
    text: 'A seasonal delicacy or winter sweet that someone in the family prepared with great care and patience.',
  },
  {
    id: 12,
    category: 'food',
    text: 'The aroma of fresh tea brewing on a cool morning alongside hot snacks wrapped in newspaper.',
  },
  {
    id: 13,
    category: 'food',
    text: 'A simple meal eaten under the open sky after a long day of travel or field work.',
  },
  {
    id: 14,
    category: 'food',
    text: 'A fruit plucked directly from a branch—guavas with salt, sour raw mangoes, or sweet jamuns.',
  },
  {
    id: 15,
    category: 'food',
    text: 'The special brass or steel thali that was brought out only when honoured guests came over.',
  },

  // Festivals
  {
    id: 16,
    category: 'festivals',
    text: 'The warm glow of clay diyas lined up along the parapet on Diwali night.',
  },
  {
    id: 17,
    category: 'festivals',
    text: 'The joy of hearing the dholak and folk songs sung together late into the evening during Chhath or Holi.',
  },
  {
    id: 18,
    category: 'festivals',
    text: 'The excitement of buying small tin toys, wooden flutes, or sweets at a village mela.',
  },
  {
    id: 19,
    category: 'festivals',
    text: 'Wearing crisp new clothes on a festive morning and going door to door to touch the feet of elders.',
  },

  // First Times
  {
    id: 20,
    category: 'first-times',
    text: 'The first time you rode a bicycle on your own down an open village road.',
  },
  {
    id: 21,
    category: 'first-times',
    text: 'Your very first watch or wrist timepiece, and how often you checked the minute hand that first week.',
  },
  {
    id: 22,
    category: 'first-times',
    text: 'The first time you boarded an overnight passenger train and watched the landscape slip past in the dark.',
  },
  {
    id: 23,
    category: 'first-times',
    text: 'Walking into a cinema hall for the first time and the wonder of the giant illuminated screen.',
  },
  {
    id: 24,
    category: 'first-times',
    text: 'The first time you sent or received a telegram, and the hush that fell over the house.',
  },

  // Small Kindnesses
  {
    id: 25,
    category: 'kindness',
    text: 'A stranger on a long journey who shared their tiffin or offered their seat without asking.',
  },
  {
    id: 26,
    category: 'kindness',
    text: 'An elder who quietly slipped a small coin or sweet into your palm with a gentle wink.',
  },
  {
    id: 27,
    category: 'kindness',
    text: 'A time someone lent you a book, an umbrella, or a bicycle when you needed it most.',
  },
  {
    id: 28,
    category: 'kindness',
    text: 'The quiet reassurance of someone who sat beside you without speaking when you were anxious.',
  },

  // Work & Craft
  {
    id: 29,
    category: 'work',
    text: 'The pride of earning your first salary or stipend, and the very first thing you bought with it.',
  },
  {
    id: 30,
    category: 'work',
    text: 'The rhythmic sounds of a craftsman at work—a carpenter, blacksmith, weaver, or potter in the village.',
  },
  {
    id: 31,
    category: 'work',
    text: 'A desk, notebook, or ledger where you spent countless focused hours in your early working years.',
  },
  {
    id: 32,
    category: 'work',
    text: 'A colleague or coworker whose steadfast dependability made hard work feel lighter.',
  },

  // Journeys
  {
    id: 33,
    category: 'journeys',
    text: 'The anticipation of waiting at a rural bus stop with a heavy trunk as the afternoon heat faded.',
  },
  {
    id: 34,
    category: 'journeys',
    text: 'Looking out of the train window at dawn as the mist rose over green mustard fields.',
  },
  {
    id: 35,
    category: 'journeys',
    text: 'A walk undertaken in pouring monsoon rain under a large black umbrella.',
  },
  {
    id: 36,
    category: 'journeys',
    text: 'Returning home after a long absence, and the exact moment you recognized the village landmarks.',
  },

  // Objects of Memory
  {
    id: 37,
    category: 'objects',
    text: 'A fountain pen, inkpot, or Parker pen that you kept carefully in your pocket.',
  },
  {
    id: 38,
    category: 'objects',
    text: 'An old brass trunk, wooden almirah, or radio transistor that was part of daily family life.',
  },
  {
    id: 39,
    category: 'objects',
    text: 'A warm woolen shawl or muffler that came out every winter and smelled of cedar or sun-dried fabric.',
  },
  {
    id: 40,
    category: 'objects',
    text: 'A black-and-white family photograph preserved in a glass frame or an old album.',
  },
];

/**
 * Returns a random prompt, optionally avoiding the current prompt ID.
 */
export function getRandomPrompt(currentId?: number): WritingPrompt {
  const available = currentId ? WRITING_PROMPTS.filter((p) => p.id !== currentId) : WRITING_PROMPTS;
  const index = Math.floor(Math.random() * available.length);
  return available[index] || WRITING_PROMPTS[0];
}
