export async function assessCluster(clusterResult, cases, context) {
  const getFallback = () => {
    const sId = clusterResult.syndrome?.id;
    const sLabel = clusterResult.syndrome?.label || 'illness';
    const reason = `The engine detected ${clusterResult.n} cases of ${sLabel}, which is a ${clusterResult.lift}x increase over the usual baseline. ${Math.round(clusterResult.cohesion * 100)}% of cases share a tight symptom pattern within a ${clusterResult.window}h window.`;
    const reasonUrdu = `انجن نے ${sLabel} کے ${clusterResult.n} کیس پکڑے ہیں، جو معمول سے ${clusterResult.lift} گنا زیادہ ہیں۔ ${Math.round(clusterResult.cohesion * 100)}٪ کیسز میں ایک جیسی علامات ہیں۔`;
    
    if (sId === 'CHOLERA_LIKE') {
      return {
        source: 'fallback',
        syndromic_pattern: context.isUrdu ? "پانی سے پھیلنے والی بیماری" : "Acute watery diarrheal illness",
        differentials: ["Cholera", "Rotavirus", "E. coli"],
        risk_score: 0.89,
        severity: "HIGH",
        evidence_reasoning: context.isUrdu ? reasonUrdu : reason,
        recommended_investigation: context.isUrdu ? "فوری طور پر پاخانے کے نمونے لیں اور پانی چیک کریں۔" : "Immediate stool sampling for vibrio cholerae and water quality testing.",
        recommended_actions: context.isUrdu ? ["ORS اور Aquatabs تقسیم کریں", "پانی کے ذرائع چیک کریں", "پانی ابالنے کی ہدایت دیں"] : ["Distribute ORS and Aquatabs", "Inspect local water sources", "Issue boil-water advisory"],
        advisory_roman_urdu: "Sunein, gaon mein pani se phailne wali bimari phail rahi hai. Peenay ka pani ubaal kar istemal karein. Agar kisi ko dast ya ulti ho toh foran ORS pilayen.",
        alert_type: 'INVESTIGATE'
      };
    } else if (sId === 'MEASLES_LIKE') {
      return {
        source: 'fallback',
        syndromic_pattern: context.isUrdu ? "بخار اور دانوں والی بیماری" : "Acute febrile illness with rash",
        differentials: ["Measles", "Rubella"],
        risk_score: 0.85,
        severity: "HIGH",
        evidence_reasoning: context.isUrdu ? reasonUrdu : reason,
        recommended_investigation: context.isUrdu ? "خون کے نمونے لیں اور ویکسین کا ریکارڈ چیک کریں۔" : "Collect serum samples for measles IgM and verify vaccination records.",
        recommended_actions: context.isUrdu ? ["مشتبہ مریضوں کو الگ کریں", "ویکسینیشن مہم کی منصوبہ بندی کریں", "مقامی کلینک کو الرٹ کریں"] : ["Isolate suspected cases", "Plan mop-up vaccination", "Alert local primary care"],
        advisory_roman_urdu: "Sunein, bacho mein khasra phailne ka khadsha hai. Agar kisi bache ko bukhar aur daane hain toh usay doosre bacho se door rakhein aur LHW ko batayen.",
        alert_type: 'INVESTIGATE'
      };
    } else if (sId === 'RESPIRATORY') {
       return {
        source: 'fallback',
        syndromic_pattern: "Acute respiratory infection",
        differentials: ["Influenza", "COVID-19", "RSV"],
        risk_score: 0.80,
        severity: "MEDIUM",
        evidence_reasoning: context.isUrdu ? reasonUrdu : reason,
        recommended_investigation: context.isUrdu ? "کیسز پر نظر رکھیں، ضرورت پڑنے پر ٹیسٹ کریں۔" : "Monitor case counts and collect nasal swabs if severity increases.",
        recommended_actions: context.isUrdu ? ["ہجوم میں ماسک پہننے کی ہدایت دیں", "مقامی کلینک کو الرٹ کریں"] : ["Advise mask wearing in crowds", "Alert local primary care"],
        advisory_roman_urdu: "Sunein, gaon mein khansi aur bukhar phail raha hai. Bheed wali jagahon se gurez karein. Agar saans lene mein dushwari ho toh doctor ke paas jayen.",
        alert_type: 'INVESTIGATE'
       };
    }
    
    return {
      source: 'fallback',
      syndromic_pattern: context.isUrdu ? "تیز بخار والی بیماری" : "Acute febrile illness with rash",
      differentials: ["Dengue Fever", "Chikungunya", "Measles"],
      risk_score: 0.85,
      severity: "HIGH",
      evidence_reasoning: context.isUrdu ? reasonUrdu : reason,
      recommended_investigation: context.isUrdu ? "فوری طور پر خون کے نمونے لینے والی ٹیم بھیجیں۔" : "Immediate dispatch of rapid response team for blood sampling.",
      recommended_actions: context.isUrdu ? ["مچھر مار سپرے کریں", "مقامی کلینک کو الرٹ کریں", "آگاہی مہم شروع کریں"] : ["Conduct IRS vector control", "Alert local primary care", "Begin community awareness"],
      advisory_roman_urdu: "Sunein, gaon mein bukhar aur daanon ki bemari phail rahi hai. Apne ird gird safai rakhein aur pani khara na hone dein. Agar kisi ko tez bukhar ho toh foran doctor ke paas le kar jayen.",
      alert_type: 'INVESTIGATE'
    };
  };

  const fallback = getFallback();

  const KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!KEY || KEY.trim() === '' || KEY === '<placeholder>') {
    console.log('Gemini failure reason: missing key');
    return fallback;
  }

  let prompt = `You are an epidemiological analyst supporting a District Health Office in Punjab, Pakistan. You receive a cluster that has ALREADY been detected by a deterministic statistical engine. The statistics are given to you as facts — do not recompute or dispute them. Your job is interpretation only.

Rules:
- Never name a single confirmed disease. Always give 2-4 differentials.
- Your alert_type is INVESTIGATE, never OUTBREAK CONFIRMED. You are flagging a signal for human verification, not diagnosing.
- Quote the actual numbers you were given in your reasoning.
- The Urdu advisory must be simple spoken Urdu a Lady Health Worker would say to a village family. Roman Urdu script. Around 30 words. No medical jargon.
- Reply with JSON only. No markdown fences, no preamble.`;

  if (context.isUrdu) {
    prompt += `\n- Write syndromic_pattern, evidence_reasoning, recommended_investigation and all recommended_actions in simple Urdu script. Keep advisory_roman_urdu in Roman Urdu as before.`;
  }

  const anonymizedCases = cases.map(c => ({
    age: c.age,
    gender: c.gender,
    symptoms: c.symptoms,
    village: c.village
  }));

  const payload = {
    clusterStats: {
      n: clusterResult.n,
      cohesion: clusterResult.cohesion,
      lift: clusterResult.lift,
      baseline: context.baseline,
      syndromeLabel: clusterResult.syndrome?.label,
      threshold: clusterResult.threshold,
      window: clusterResult.window,
      inRing: context.inRing
    },
    context: {
      district: context.district,
      villages: context.villages,
      rainfall: context.rainfall
    },
    cases: anonymizedCases
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: prompt }] },
        contents: [{ parts: [{ text: JSON.stringify(payload) }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.log('Gemini failure reason: network error / API error', res.status, res.statusText);
      return fallback;
    }

    const data = await res.json();
    console.log('Gemini Raw JSON:', JSON.stringify(data, null, 2));

    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    text = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (parseError) {
      console.log('Gemini failure reason: parse failure (invalid JSON)', text);
      return fallback;
    }

    if (parsed.syndromic_pattern && Array.isArray(parsed.differentials) && parsed.evidence_reasoning && parsed.alert_type) {
      return { ...parsed, source: 'gemini' };
    }
    
    console.log('Gemini failure reason: parse failure (missing required fields)');
    return fallback;
  } catch (err) {
    clearTimeout(timeoutId);
    console.log('Gemini failure reason: timeout or fetch error', err);
    return fallback;
  }
}
