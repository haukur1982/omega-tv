export const PRAYER_CATEGORIES = {
  personal: {
    label: 'Persónulegt',
    topics: [
      { value: 'Lækning', label: 'Lækning' },
      { value: 'Fjölskylda', label: 'Fjölskylda' },
      { value: 'Fjárhagur', label: 'Fjárhagur' },
      { value: 'Andlegur Vöxtur', label: 'Andlegur Vöxtur' },
      { value: 'Annað', label: 'Annað' },
    ],
  },
  national: {
    label: 'Fyrir Þjóðina',
    topics: [
      { value: 'Ísland', label: 'Ísland' },
      { value: 'Ríkisstjórnin', label: 'Ríkisstjórnin' },
      { value: 'Ísrael', label: 'Ísrael' },
      { value: 'Kirkjan', label: 'Kirkjan' },
    ],
  },
} as const;

// Scripture prayers tied to each topic
export const TOPIC_SCRIPTURES: Record<string, { verse: string; reference: string }> = {
  'Lækning': {
    verse: 'Hann læknar þá sem sundurkramdir eru á hjarta og bindur sár þeirra.',
    reference: 'Sálmur 147:3',
  },
  'Fjölskylda': {
    verse: 'En ég og mitt hús, við viljum þjóna Drottni.',
    reference: 'Jósúa 24:15',
  },
  'Fjárhagur': {
    verse: 'Guð minn mun fylla allar ykkar þarfir eftir auðæfum sínum í dýrð í Kristi Jesú.',
    reference: 'Filippíbréfið 4:19',
  },
  'Andlegur Vöxtur': {
    verse: 'Verið stöðug, óbifanleg, og ávalt æðri í verki Drottins, vitandi að strit yðar er ekki árangurslaust í Drottni.',
    reference: '1. Korintubréfið 15:58',
  },
  'Annað': {
    verse: 'Varpaðu allri áhyggju þinni á hann, því að hann ber umhyggju fyrir þér.',
    reference: '1. Pétursbréfið 5:7',
  },
  'Ísland': {
    verse: 'Ef þjóð mín, sem kennd er við mig, auðmýkir sig og biður og leitar ásjónu minnar, þá mun ég heyra af himni.',
    reference: '2. Kroníkubók 7:14',
  },
  'Ríkisstjórnin': {
    verse: 'Ég skora á að bænir, biðlar og þakkargjörðir séu færðar fyrir alla menn, fyrir konunga og alla þá sem í yfirvaldi eru.',
    reference: '1. Tímóteusarbréfið 2:1-2',
  },
  'Ísrael': {
    verse: 'Biðjið fyrir friði Jerúsalem. Vel gangi þeim sem þig elska.',
    reference: 'Sálmur 122:6',
  },
  'Kirkjan': {
    verse: 'Á þessari kletti mun ég reisa kirkju mína, og helvítis hlið skulu ekki fá vald yfir henni.',
    reference: 'Matteusar 16:18',
  },
};

export const ALL_TOPICS = [
  ...PRAYER_CATEGORIES.personal.topics,
  ...PRAYER_CATEGORIES.national.topics,
];

export type CategoryType = 'personal' | 'national';
export type TopicValue = typeof ALL_TOPICS[number]['value'];
