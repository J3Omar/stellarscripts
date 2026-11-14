// Book content. Body text is NOT stored here: it comes from assets/cues/<device>.json,
// which scripts/align_cues.py builds from narration/<device>.txt, so the highlighted
// text always matches the audio word for word.
//
// Page fields:
//   headline  ≤ 8 words, plain fact
//   stat      { value, label } key-number callout (from the narration or the chapter fact sheet)
//   diagram   id of an SVG in js/book-diagrams.js (original artwork)
//   photo     { file, at? }  file listed in assets/credits.json; credit comes from there
//   caption   plain-fact caption under the visual
//   schematic true → "Schematic, not to scale" is printed with the diagram
//   note      optional small fact line on the text page
window.SS_BOOK = {
  chapters: [
    { num: 'one', title: 'The Twin Rovers', sub: 'Spirit & Opportunity · Mars', chapterId: 'spirit-opportunity', contents: 'gusev',
      devices: ['spirit', 'opportunity'],
      sugg: ['How did a broken wheel find silica?', 'What were the "blueberries" Opportunity found?', 'How did Spirit and Opportunity go silent?'] },
    { num: 'two', title: 'The Pioneers', sub: 'Pioneer 10 & 11 · Deep space', chapterId: 'pioneer10-11', contents: 'saturn',
      devices: ['pioneer-10', 'pioneer-11'],
      sugg: ['How did Pioneer 10 cross the asteroid belt?', 'What is on the Pioneer plaque?', 'What did Pioneer 11 discover at Saturn?'] },
    { num: 'three', title: 'Ingenuity', sub: 'The first flight on another world', chapterId: 'ingenuity', contents: 'img:assets/photos/PIA24550_ingenuity-first-flight.jpg',
      devices: ['ingenuity'],
      sugg: ['How can a helicopter fly in Mars\'s thin air?', 'Why did Ingenuity stop flying?', 'Why did it carry Wright Flyer fabric?'] },
    { num: 'four', title: 'Surveyor 3', sub: 'The robot Apollo came back for', chapterId: 'surveyor3', contents: 'img:assets/photos/AS12-48-7134_surveyor3-apollo12.jpg',
      devices: ['surveyor-3'],
      sugg: ['Why was Surveyor 3 sent to the Moon?', 'What did Apollo 12 take from Surveyor 3?', 'Why did Surveyor 3 stop working?'] },
  ],

  devices: {
    spirit: {
      name: 'Spirit', world: 'Mars',
      sources: [
        ['NASA Science — Spirit mission page', 'https://science.nasa.gov/mission/mer-spirit/'],
        ['NASA Science — Mars Exploration Rovers: Spirit and Opportunity', 'https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/'],
        ['NASA Science — MER science highlights', 'https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/science-highlights/'],
      ],
      pages: [
        { headline: 'A dead wheel, dragged like a plow',
          stat: { value: '1', label: 'front wheel that no longer turned' },
          diagram: 'spirit-drag', schematic: true,
          caption: 'Spirit\'s front wheel stopped working in 2006. The rover kept driving and dragged it through the soil.' },
        { headline: 'Twenty-eight bounces into Gusev Crater',
          stat: { value: 'Jan 2004', label: 'landed in Gusev Crater, Mars' },
          diagram: 'spirit-bounce', schematic: true, photo: { file: 'PIA05117_spirit-lander-airbags.webp' },
          caption: 'Airbags wrapped the lander so it could bounce to a stop. Opportunity landed on the opposite side of Mars.' },
        { headline: 'Built for 90 days, cleaned by the wind',
          stat: { value: '25×', label: 'longer than its 90-Martian-day plan' },
          diagram: 'spirit-power', photo: { file: 'PIA04187_spirit-dust-devils.jpg' },
          caption: 'Photo: the ground around the rover seen from above, stitched from its own camera images (its deck is at the centre). Inset: dust devils, small whirlwinds of dust, cleaned the solar panels and power rose from 60% to 93%.' },
        { headline: 'Bright soil under a dead wheel',
          stat: { value: 'Nearly pure silica', label: 'the main ingredient of window glass' },
          diagram: 'spirit-silica', schematic: true,
          caption: 'In 2007 the dragged wheel scraped away the top soil and exposed bright, nearly pure silica.' },
        { headline: 'Stuck, silent, then a farewell',
          stat: { value: '1,300+', label: 'commands sent while trying to reach it' },
          diagram: 'spirit-timeline',
          caption: 'Spirit\'s mission, 2004–2011, in order. Dates from NASA\'s Spirit mission record.' },
      ],
    },
    // Remaining devices: pages are added in the next step (same pattern as Spirit).
    opportunity: {
      name: 'Opportunity', world: 'Mars',
      sources: [
        ['NASA Science — Opportunity mission page', 'https://science.nasa.gov/mission/mer-opportunity/'],
        ['NASA Science — Opportunity end-of-mission article (Feb 2019)', 'https://science.nasa.gov/missions/mer/nasas-opportunity-rover-mission-on-mars-comes-to-end/'],
        ['NASA Science — MER science highlights', 'https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/science-highlights/'],
      ],
      pages: [
        { headline: 'A marathon, with no one cheering',
          stat: { value: '26.2 mi', label: 'a marathon, passed in March 2015' },
          diagram: 'opp-marathon',
          caption: 'A marathon is 26.2 miles. Opportunity was the first human enterprise to travel that far on another world.' },
        { headline: 'Built for 90 days, it lasted 14+ years',
          stat: { value: '1,100 yd → 28+ mi', label: 'planned driving vs. what it drove' },
          photo: { file: 'PIA05755_opportunity-eagle-crater.webp' }, diagram: 'opp-distance',
          caption: 'Eagle Crater, where Opportunity landed, with its empty lander and wheel tracks. Inset: planned vs. actual driving, to scale.' },
        { headline: 'Blueberries made of a water mineral',
          stat: { value: 'Hematite', label: 'a mineral that usually forms in water' },
          photo: { file: 'PIA05634_opportunity-blueberries.jpg' }, diagram: 'opp-hematite',
          caption: '"Blueberries" is a nickname for their round shape. NASA found this ancient water was acidic, which would have made life harder.' },
        { headline: 'A meteorite, then friendlier water',
          stat: { value: 'Neutral water', label: 'the friendliest conditions for life it found' },
          photo: { file: 'PIA07269_heat-shield-rock.jpg' }, diagram: 'opp-endeavour', schematic: true,
          caption: 'Heat Shield Rock, identified in January 2005 as an iron-nickel meteorite. Inset: clays on Endeavour Crater\'s rim formed in neutral, not acidic, water.' },
        { headline: 'Silenced by a planet-wide dust storm',
          stat: { value: '28+ miles', label: 'on its odometer when the mission ended' },
          diagram: 'opp-storm', schematic: true,
          caption: 'In June 2018 dust blocked the sunlight its solar panels needed. NASA declared the mission complete in February 2019.' },
      ],
    },
    'pioneer-10': { name: 'Pioneer 10', world: 'Deep space', sources: [['NASA Science — Pioneer 10 mission page', 'https://science.nasa.gov/mission/pioneer-10/']], pages: null },
    'pioneer-11': { name: 'Pioneer 11', world: 'Deep space', sources: [['NASA Science — Pioneer 11 mission page', 'https://science.nasa.gov/mission/pioneer-11/']], pages: null },
    ingenuity: { name: 'Ingenuity', world: 'Mars', sources: [['NASA Science — Ingenuity Mars Helicopter', 'https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/']], pages: null },
    'surveyor-3': { name: 'Surveyor 3', world: 'The Moon', sources: [['NASA Science — Surveyor 3 mission page', 'https://science.nasa.gov/mission/surveyor-3/']], pages: null },
  },
};
