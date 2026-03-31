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

export const ALL_TOPICS = [
  ...PRAYER_CATEGORIES.personal.topics,
  ...PRAYER_CATEGORIES.national.topics,
];

export type CategoryType = 'personal' | 'national';
export type TopicValue = typeof ALL_TOPICS[number]['value'];
