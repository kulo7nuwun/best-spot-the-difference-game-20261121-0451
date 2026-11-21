// Twin Harbor — Spot the Difference: the three levels and their differences.
//
// Each level names a scene and the differences hidden in it. A difference is a
// circle in panel space (x, y, radius) plus a short label used by the hint text
// and the level-complete list. The scene painter (scenes.js) reads the same ids
// and changes exactly that spot in the right-hand picture; the left picture is
// always the untouched original. Fair but not obvious: every change is a small
// local edit of something the player has already seen, never a whole new object
// appearing out of nowhere.

export const LEVELS = [
  {
    id: 'harbor',
    name: 'Sunny Harbor',
    subtitle: 'Morning at the little fishing harbor',
    timeLimitSeconds: 150,
    hints: 3,
    differences: [
      { id: 'sun-rays', x: 96, y: 78, r: 44, label: 'the sun lost its rays' },
      { id: 'sail-color', x: 300, y: 300, r: 52, label: 'the sail changed colour' },
      { id: 'gull', x: 452, y: 118, r: 30, label: 'a seagull flew away' },
      { id: 'lighthouse-stripe', x: 470, y: 223, r: 32, label: 'a lighthouse stripe is missing' },
      { id: 'buoy', x: 150, y: 520, r: 30, label: 'the red buoy is gone' },
      { id: 'fish', x: 400, y: 560, r: 26, label: 'a fish jumped out of the water' },
    ],
  },
  {
    id: 'kitchen',
    name: 'Cozy Kitchen',
    subtitle: 'Tea time in grandma’s kitchen',
    timeLimitSeconds: 150,
    hints: 3,
    differences: [
      { id: 'clock-hands', x: 290, y: 92, r: 42, label: 'the clock shows another time' },
      { id: 'mug-color', x: 120, y: 250, r: 34, label: 'the mug changed colour' },
      { id: 'cat', x: 470, y: 244, r: 42, label: 'the cat left the windowsill' },
      { id: 'apple', x: 300, y: 448, r: 32, label: 'an apple is missing from the bowl' },
      { id: 'steam', x: 210, y: 400, r: 34, label: 'the kettle stopped steaming' },
      { id: 'picture', x: 92, y: 122, r: 36, label: 'the wall picture changed' },
      { id: 'cushion', x: 106, y: 526, r: 34, label: 'the chair cushion changed colour' },
    ],
  },
  {
    id: 'garden',
    name: 'Night Garden',
    subtitle: 'Fireflies over the old garden wall',
    timeLimitSeconds: 180,
    hints: 3,
    differences: [
      { id: 'moon', x: 486, y: 82, r: 42, label: 'the moon changed phase' },
      { id: 'firefly', x: 180, y: 260, r: 24, label: 'a firefly went dark' },
      { id: 'flower-color', x: 330, y: 470, r: 32, label: 'a flower changed colour' },
      { id: 'picket', x: 98, y: 360, r: 28, label: 'a fence picket is missing' },
      { id: 'owl-eyes', x: 462, y: 210, r: 34, label: 'the owl closed its eyes' },
      { id: 'mushroom-spots', x: 210, y: 540, r: 32, label: 'the mushroom lost its spots' },
      { id: 'star', x: 300, y: 60, r: 22, label: 'a star went out' },
      { id: 'stepping-stone', x: 400, y: 560, r: 30, label: 'a stepping stone is gone' },
    ],
  },
];

// Total differences across the whole game, for the final tally.
export const TOTAL_DIFFERENCES = LEVELS.reduce((n, level) => n + level.differences.length, 0);
