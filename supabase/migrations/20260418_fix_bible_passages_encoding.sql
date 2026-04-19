-- ═══════════════════════════════════════════════════════════════════
-- Migration: Fix double-encoded UTF-8 in bible_passages
--
-- Bug discovered 2026-04-18: when the original seed was pasted via
-- Supabase SQL editor, the clipboard→paste pipeline re-encoded UTF-8
-- as MacRoman, resulting in literal mojibake stored as real UTF-8
-- bytes in the DB. Browsers then render the mojibake faithfully.
--
-- Fix: UPDATE each seeded row with the correct UTF-8 text. Idempotent
-- — safe to re-run. Only touches the 5 seed refs.
-- ═══════════════════════════════════════════════════════════════════

UPDATE bible_passages SET
  ref_display_is = 'Jóhannes 3:16',
  ref_display_en = 'John 3:16',
  text_is = 'Því svo elskaði Guð heiminn, að hann gaf son sinn eingetinn, til þess að hver sem á hann trúir glatist ekki, heldur hafi eilíft líf.',
  text_en = 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.'
WHERE ref_canonical = 'JHN.3.16';

UPDATE bible_passages SET
  ref_display_is = 'Matteus 5:3–10',
  ref_display_en = 'Matthew 5:3–10',
  text_is = 'Sælir eru fátækir í anda, því að þeirra er himnaríki. Sælir eru sorgmæddir, því að þeir munu huggaðir verða. Sælir eru hógværir, því að þeir munu jörðina erfa. Sælir eru þeir sem hungrar og þyrstir eftir réttlætinu, því að þeir munu saddir verða. Sælir eru miskunnsamir, því að þeim mun miskunnað verða. Sælir eru hjartahreinir, því að þeir munu Guð sjá. Sælir eru friðflytjendur, því að þeir munu Guðs börn kallaðir verða. Sælir eru þeir sem ofsóttir eru fyrir réttlætis sakir, því að þeirra er himnaríki.',
  text_en = 'Blessed are the poor in spirit, for theirs is the kingdom of heaven. Blessed are those who mourn, for they shall be comforted. Blessed are the meek, for they shall inherit the earth. Blessed are those who hunger and thirst for righteousness, for they shall be satisfied. Blessed are the merciful, for they shall receive mercy. Blessed are the pure in heart, for they shall see God. Blessed are the peacemakers, for they shall be called sons of God. Blessed are those who are persecuted for righteousness'' sake, for theirs is the kingdom of heaven.'
WHERE ref_canonical = 'MAT.5.3-MAT.5.10';

UPDATE bible_passages SET
  ref_display_is = 'Sálmarnir 23',
  ref_display_en = 'Psalm 23',
  text_is = 'Drottinn er minn hirðir, mig mun ekkert bresta. Á grænum grundum lætur hann mig hvílast, leiðir mig að vötnum þar sem ég má næðis njóta.',
  text_en = 'The LORD is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters.'
WHERE ref_canonical = 'PSA.23';

UPDATE bible_passages SET
  ref_display_is = 'Rómverjabréfið 8:28',
  ref_display_en = 'Romans 8:28',
  text_is = 'Vér vitum, að þeim sem Guð elska, samverkar allt til góðs, þeim sem kallaðir eru eftir fyrirætlun Guðs.',
  text_en = 'And we know that for those who love God all things work together for good, for those who are called according to his purpose.'
WHERE ref_canonical = 'ROM.8.28';

UPDATE bible_passages SET
  ref_display_is = 'Filippíbréfið 4:6–7',
  ref_display_en = 'Philippians 4:6–7',
  text_is = 'Verið ekki hugsjúkir um neitt, heldur gerið í öllum hlutum óskir yðar kunnar Guði með bæn og beiðni og þakkargjörð. Og friður Guðs, sem er æðri öllum skilningi, mun varðveita hjörtu yðar og hugsanir yðar í Kristi Jesú.',
  text_en = 'Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts and your minds in Christ Jesus.'
WHERE ref_canonical = 'PHP.4.6-PHP.4.7';
