export const symptomOptions = [
  { id:'fever',    label:'High fever',      grad:'peach'  },
  { id:'eye',      label:'Eye pain',        grad:'lilac'  },
  { id:'rash',     label:'Skin rash',       grad:'pink'   },
  { id:'diarrhea', label:'Watery diarrhoea',grad:'mint'   },
  { id:'vomit',    label:'Vomiting',        grad:'mint'   },
  { id:'cough',    label:'Cough',           grad:'lilac'  },
  { id:'jaundice', label:'Yellow eyes',     grad:'butter' },
  { id:'ache',     label:'Body ache',       grad:'peach'  },
];

export const ageGroups = ['Baby 0-5','Child 6-17','Adult 18-59','Elder 60+'];
export const genders   = ['Girl / Woman','Boy / Man'];

// Fake ASR transcription fallbacks for the demo
export const fakeTranscript =
  'Chak 112 mein saat saal ke bachay ko do din se tez bukhar aur ulti hai.';
export const fakeParsed = {
  age:'Child 6-17', ageNote:'7 years', gender:'Boy / Man',
  symptoms:['fever','vomit'], duration:'2 days',
};
