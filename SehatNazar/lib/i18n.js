import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANG_KEY = 'sehatnazar.lang';

const dictionary = {
  en: {
    // Tabs
    tab_home: 'Home',
    tab_log: 'Log',
    tab_nearby: 'Nearby',
    tab_records: 'Records',

    // Home
    greeting: 'Assalam-o-Alaikum, {name}',
    outbreak_alert: 'Outbreak alert',
    your_area: 'YOUR AREA',
    alert_detail: '8 fever cases in 48 hours across Chak 112 and Basti Malook. Dengue suspected — being confirmed.',
    advisory_title: 'Sunein — Urdu advisory',
    advisory_sub: 'What to tell families today',
    todays_rounds: "Today's rounds",
    see_all: 'See all',
    houses_visited: 'houses visited',
    houses_left: '{n} left in Chak 112',
    days_reporting: '{n} days reporting',
    keep_going: 'keep it going',
    log_a_case: 'Log a case',
    no_cases_yet: 'No cases yet',
    ahead_of_yesterday: 'You are ahead of yesterday.',

    // Log
    new_case: 'New case',
    location_found: 'location found',
    nothing_to_type: 'All filled in for you — nothing to type.',
    speak: 'Speak',
    tap: 'Tap',
    tap_mic: 'Tap the mic and say what you saw',
    listening: 'Listening — tap again when you finish',
    understanding: 'Understanding what you said…',
    we_heard: 'We heard this',
    tap_to_fix: 'tap anything to fix it',
    check_before_save: 'Check this before saving. If a word was heard wrong, tap it and change it — the case saves exactly as you confirm it.',
    save_case: 'Save case',
    case_saved: 'Case saved',
    who_patient: 'Who is the patient?',
    girl_or_boy: 'Girl or boy?',
    what_you_saw: 'What did you see?',
    since_when: 'Since when?',
    add: '+ Add',
    sent_to_district: 'Sent to the district office',

    // Symptoms
    symptom_fever: 'High fever',
    symptom_eye: 'Eye pain',
    symptom_rash: 'Skin rash',
    symptom_diarrhea: 'Watery diarrhoea',
    symptom_vomit: 'Vomiting',
    symptom_cough: 'Cough',
    symptom_jaundice: 'Yellow eyes',
    symptom_ache: 'Body ache',

    // Demographics
    age_baby: 'Baby 0-5',
    age_child: 'Child 6-17',
    age_adult: 'Adult 18-59',
    age_elder: 'Elder 60+',
    gender_female: 'Girl / Woman',
    gender_male: 'Boy / Man',

    // Duration
    duration_today: 'Today',
    duration_2days: '2 days',
    duration_3to5days: '3-5 days',
    duration_week: 'A week or more',

    // Records
    my_records: 'My records',
    cases_this_month: '{n} cases this month',
    all: 'All',
    waiting: 'Waiting',
    sent: 'Sent',
    on_phone: 'Saved on phone',
    sent_status: 'Sent',
    safe_on_phone: '{n} cases saved safely on this phone',
    not_reached: 'Not yet reached the office. Nothing is lost — they will send automatically when signal returns.',
    send_now: 'Send now',
    no_cases_here: 'No cases saved yet',

    // Nearby
    nearby_areas: 'Nearby areas',
    nearby_sub: 'What other health workers are seeing around you',
    why_flagged: 'Why this was flagged',
    what_ai_says: 'What the analysis says',
    recommended_actions: 'Recommended actions',
    level_alert: 'ALERT',
    level_watch: 'WATCH',
    level_normal: 'NORMAL',
    risk: 'Risk',
    reason_cases_count: '{n} cases (need {need})',
    reason_pattern_share: '{n}% identical symptoms (need {need}%)',
    reason_times_usual: '{n}x usual (baseline {baseline})',
    pass: 'Pass',
    fail: 'Not met',
    no_active_clusters: 'No active clusters nearby.',
    metrics_peak: 'Metrics peak:',
    cohesion_label: 'Cohesion',
    lift_label: 'Lift',
    day_M: 'M',
    day_T: 'T',
    day_W: 'W',
    day_Th: 'T',
    day_F: 'F',
    day_S: 'S',
    day_Su: 'S',

    // Onboarding
    onboarding_1_title: 'Report with your voice',
    onboarding_1_body: 'Speak in Urdu or Saraiki. The app fills the form for you.',
    onboarding_2_title: 'Early warning',
    onboarding_2_body: 'Reports from nearby villages are connected to spot an outbreak early.',
    onboarding_3_title: 'Works without internet',
    onboarding_3_body: 'Cases save without signal and send themselves later.',
    get_started: 'Get started',
    skip: 'Skip',

    // Auth
    phone: 'Phone number',
    pin: '4-digit PIN',
    sign_in: 'Sign in',
    sign_up: 'Complete registration',
    wrong_phone_pin: 'Phone or PIN is incorrect',
    forgot_pin: 'Forgot PIN?',
    new_here: 'New here? Create account',
    send_code: 'Send code',
    demo_code: 'Demo code: {code}',
    code_sent: 'Code sent to {phone}',
    resend_in: 'Resend in {n}s',
    resend: 'Resend',
    lhw_id: 'LHW ID (optional)',
    full_name: 'Full Name',
    district: 'District',
    tehsil: 'Tehsil',
    uc: 'Union Council',
    village: 'Village / Chak',
    confirm_pin: 'Confirm PIN',
    next: 'Next',
    create_account: 'Create Account',
    profile_title: 'My Profile',
    joined: 'Joined',
    stats: 'Stats',
    total_cases: 'Total cases',
    pending: 'Pending',
    edit: 'Edit',
    save: 'Save',
    sign_out: 'Sign out',
    sign_out_confirm: 'Are you sure you want to sign out? Unsent cases will stay on the phone.',
    cancel: 'Cancel',
    yes_sign_out: 'Yes, Sign Out',
    required: 'Required',
    invalid_phone: 'Must be 11 digits starting with 03',
    pin_mismatch: 'PINs do not match',
    pin_invalid: 'Must be 4 digits',
  },
  ur: {
    // Tabs
    tab_home: 'ہوم',
    tab_log: 'رپورٹ',
    tab_nearby: 'قریب',
    tab_records: 'ریکارڈ',

    // Home
    greeting: 'السلام علیکم، {name}',
    outbreak_alert: 'وبائی الرٹ',
    your_area: 'آپ کا علاقہ',
    alert_detail: '48 گھنٹوں میں 8 بخار کے کیس — چک 112 اور بستی ملوک میں۔ ڈینگی کا شبہ ہے، تصدیق ہو رہی ہے۔',
    advisory_title: 'سنیں — اردو ہدایت',
    advisory_sub: 'آج گھر والوں کو کیا بتانا ہے',
    todays_rounds: 'آج کا دورہ',
    see_all: 'سب دیکھیں',
    houses_visited: 'گھروں کا دورہ مکمل',
    houses_left: 'چک 112 میں {n} باقی ہیں',
    days_reporting: '{n} دن مسلسل رپورٹنگ',
    keep_going: 'جاری رکھیں',
    log_a_case: 'نیا کیس درج کریں',
    no_cases_yet: 'ابھی کوئی کیس نہیں',
    ahead_of_yesterday: 'آپ کل سے آگے ہیں۔', // Assuming simple translation for missing strings

    // Log
    new_case: 'نیا کیس',
    location_found: 'مقام مل گیا',
    nothing_to_type: 'سب کچھ خود بھر گیا — کچھ لکھنے کی ضرورت نہیں',
    speak: 'بولیں',
    tap: 'منتخب کریں',
    tap_mic: 'مائیک دبائیں اور جو دیکھا وہ بتائیں',
    listening: 'سن رہے ہیں — بات مکمل ہو تو دوبارہ دبائیں',
    understanding: 'آپ کی بات سمجھ رہے ہیں…',
    we_heard: 'ہم نے یہ سنا',
    tap_to_fix: 'غلط ہو تو ٹیپ کر کے درست کریں',
    check_before_save: 'محفوظ کرنے سے پہلے دیکھ لیں۔ کوئی لفظ غلط سنا گیا ہو تو ٹیپ کر کے بدل دیں۔',
    save_case: 'کیس محفوظ کریں',
    case_saved: 'کیس محفوظ ہو گیا',
    who_patient: 'مریض کون ہے؟',
    girl_or_boy: 'لڑکی یا لڑکا؟',
    what_you_saw: 'آپ نے کیا دیکھا؟',
    since_when: 'کب سے؟',
    add: 'مزید',
    sent_to_district: 'ضلعی دفتر کو بھیج دیا گیا',

    // Symptoms
    symptom_fever: 'تیز بخار',
    symptom_eye: 'آنکھوں میں درد',
    symptom_rash: 'جسم پر دانے',
    symptom_diarrhea: 'پتلے دست',
    symptom_vomit: 'اُلٹی',
    symptom_cough: 'کھانسی',
    symptom_jaundice: 'آنکھوں کی زردی',
    symptom_ache: 'جسم میں درد',

    // Demographics
    age_baby: 'شیر خوار (0-5)',
    age_child: 'بچہ (6-17)',
    age_adult: 'بالغ (18-59)',
    age_elder: 'بزرگ (60+)',
    gender_female: 'لڑکی / خاتون',
    gender_male: 'لڑکا / مرد',

    // Duration
    duration_today: 'آج',
    duration_2days: '2 دن',
    duration_3to5days: '3-5 دن',
    duration_week: 'ایک ہفتہ یا زیادہ',

    // Records
    my_records: 'میرے ریکارڈ',
    cases_this_month: 'اس مہینے {n} کیس',
    all: 'سب',
    waiting: 'باقی',
    sent: 'بھیجے گئے',
    on_phone: 'فون میں محفوظ',
    sent_status: 'بھیج دیا',
    safe_on_phone: '{n} کیس اس فون میں محفوظ ہیں',
    not_reached: 'ابھی دفتر تک نہیں پہنچے۔ کچھ ضائع نہیں ہوا — سگنل آنے پر خود چلے جائیں گے۔',
    send_now: 'ابھی بھیجیں',
    no_cases_here: 'یہاں ابھی کوئی کیس نہیں',

    // Nearby
    nearby_areas: 'قریبی علاقے',
    nearby_sub: 'آپ کے آس پاس دوسری ورکرز کیا دیکھ رہی ہیں',
    why_flagged: 'یہ کیوں نشان زد ہوا',
    what_ai_says: 'تجزیہ کیا کہتا ہے',
    recommended_actions: 'تجویز کردہ اقدامات',
    level_alert: 'الرٹ',
    level_watch: 'نگرانی',
    level_normal: 'معمول',
    risk: 'خطرہ',
    reason_cases_count: '{n} کیس (ضرورت {need})',
    reason_pattern_share: '{n}٪ ایک جیسی علامات (ضرورت {need}٪)',
    reason_times_usual: 'معمول سے {n} گنا (بنیاد {baseline})',
    pass: 'درست',
    fail: 'پورا نہیں',
    no_active_clusters: 'آس پاس کوئی سرگرم کلسٹر نہیں۔',
    metrics_peak: 'اعدادوشمار کی چوٹی:',
    cohesion_label: 'یکسانیت',
    lift_label: 'اضافہ',
    day_M: 'پی',
    day_T: 'من',
    day_W: 'بد',
    day_Th: 'جم',
    day_F: 'جمع',
    day_S: 'ہف',
    day_Su: 'ات',

    // Onboarding
    onboarding_1_title: 'آواز سے رپورٹ کریں',
    onboarding_1_body: 'اردو یا سرائیکی میں بولیں۔ ایپ خود فارم بھر دے گی۔',
    onboarding_2_title: 'وبا سے پہلے اطلاع',
    onboarding_2_body: 'قریبی گاؤں کی رپورٹیں جوڑ کر وبا کا پتہ پہلے چل جاتا ہے۔',
    onboarding_3_title: 'انٹرنیٹ کے بغیر بھی',
    onboarding_3_body: 'سگنل نہ ہو تو بھی کیس محفوظ رہتا ہے، بعد میں خود بھیج دیتا ہے۔',
    get_started: 'شروع کریں',
    skip: 'چھوڑیں',

    // Auth
    phone: 'فون نمبر',
    pin: '4 ہندسوں کا پن',
    sign_in: 'لاگ ان کریں',
    sign_up: 'رجسٹریشن مکمل کریں',
    wrong_phone_pin: 'فون یا پن غلط ہے',
    forgot_pin: 'پن بھول گئے؟',
    new_here: 'نیا اکاؤنٹ بنائیں',
    send_code: 'کوڈ بھیجیں',
    demo_code: 'ڈیمو کوڈ: {code}',
    code_sent: 'کوڈ {phone} پر بھیجا گیا',
    resend_in: '{n} سیکنڈ میں دوبارہ بھیجیں',
    resend: 'دوبارہ بھیجیں',
    lhw_id: 'LHW ID (اختیاری)',
    full_name: 'پورا نام',
    district: 'ضلع',
    tehsil: 'تحصیل',
    uc: 'یونین کونسل',
    village: 'گاؤں / چک',
    confirm_pin: 'پن کی تصدیق کریں',
    next: 'آگے بڑھیں',
    create_account: 'اکاؤنٹ بنائیں',
    profile_title: 'میری پروفائل',
    joined: 'شامل ہوئے',
    stats: 'اعداد و شمار',
    total_cases: 'کل کیس',
    pending: 'باقی',
    edit: 'ترمیم کریں',
    save: 'محفوظ کریں',
    sign_out: 'لاگ آؤٹ کریں',
    sign_out_confirm: 'کیا آپ واقعی لاگ آؤٹ کرنا چاہتے ہیں؟ نہ بھیجے گئے کیس فون پر ہی رہیں گے۔',
    cancel: 'منسوخ کریں',
    yes_sign_out: 'ہاں، لاگ آؤٹ کریں',
    required: 'ضروری ہے',
    invalid_phone: '03 سے شروع ہونے والے 11 ہندسے ضروری ہیں',
    pin_mismatch: 'پن آپس میں نہیں مل رہے',
    pin_invalid: '4 ہندسے لازمی ہیں',
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('ur'); // Default Urdu
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then(val => {
      if (val === 'en' || val === 'ur') {
        setLangState(val);
      }
      setIsLoaded(true);
    });
  }, []);

  const setLang = useCallback(async (newLang) => {
    if (newLang === 'en' || newLang === 'ur') {
      setLangState(newLang);
      await AsyncStorage.setItem(LANG_KEY, newLang);
    }
  }, []);

  const t = useCallback((key, params = {}) => {
    let str = dictionary[lang]?.[key] || dictionary['en']?.[key] || key;
    
    // Replace {n}, {name} etc.
    Object.keys(params).forEach(p => {
      str = str.replace(new RegExp(`{${p}}`, 'g'), String(params[p]));
    });

    return str;
  }, [lang]);

  const isUrdu = lang === 'ur';
  const font = isUrdu ? 'NotoNaskhArabic_400Regular' : undefined;
  const dir = isUrdu ? 'rtl' : 'ltr';

  const toggleLang = useCallback(() => {
    setLang(lang === 'ur' ? 'en' : 'ur');
  }, [lang, setLang]);

  if (!isLoaded) return null;

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, isUrdu, font, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
