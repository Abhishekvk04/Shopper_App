"use client";
import React, { useState } from 'react';
import Link from 'next/link';

type Language = 'en' | 'hi' | 'kn' | 'te' | 'ta' | 'ml' | 'tulu';

const TRANSLATIONS: Record<Language, any> = {
  en: {
    login: "Login",
    get_started: "Get Started",
    hero_title: "Local retail,\nreinvented.",
    hero_desc: "Shopper connects your physical store to WhatsApp. An AI front desk that answers, sells, and manages customers 24/7.",
    start_trial: "Start Free Trial",
    how_it_works: "See how it works",
    discovery: "Discovery",
    location_aware: "Location Aware.",
    location_desc: "Customers find you by just being nearby. We use real-time GPS to rank your shop first when it matters most.",
    intelligence: "Intelligence",
    zero_friction: "Zero Friction.",
    friction_desc: "No apps to download. Your customers chat on WhatsApp, our AI handles the rest. Prices, timings, availability—instantly answered.",
    growth: "Growth",
    verified_trust: "Verified Trust.",
    trust_desc: "Stand out from the noise. Verified Partner badges give customers the confidence to buy from you immediately.",
    pricing_title: "Simple pricing.",
    pricing_desc: "Start for free. Upgrade when you're too busy counting sales.",
    free: "Free",
    forever: "Forever",
    per_month: "Per Month",
    chats_limit: "50 AI Chats/mo",
    unlimited_ai: "Unlimited AI",
    verified_badge: "Verified Badge"
  },
  hi: {
    login: "लॉग इन",
    get_started: "शुरू करें",
    hero_title: "स्थानीय खुदरा,\nअब नए रूप में।",
    hero_desc: "Shopper आपकी दुकान को WhatsApp से जोड़ता है। एक AI रिसेप्शनिस्ट जो 24/7 जवाब देता है, बिक्री करता है और ग्राहकों का प्रबंधन करता है।",
    start_trial: "मुफ्त ट्रायल शुरू करें",
    how_it_works: "यह कैसे काम करता है",
    discovery: "खोज",
    location_aware: "लोकेशन अवेयर",
    location_desc: "ग्राहक आपको केवल पास होने से ढूंढ लेते हैं। जब सबसे ज्यादा जरूरत होती है, तो हम आपकी दुकान को पहले दिखाने के लिए रियल-टाइम GPS का उपयोग करते हैं।",
    intelligence: "बुद्धिमत्ता",
    zero_friction: "बिना किसी रुकावट के",
    friction_desc: "कोई ऐप डाउनलोड नहीं करना। आपके ग्राहक WhatsApp पर चैट करते हैं, बाकी हमारा AI संभालता है। कीमतें, समय, उपलब्धता—तुरंत जवाब।",
    growth: "विकास",
    verified_trust: "सत्यापित भरोसा",
    trust_desc: "भीड़ से अलग दिखें। सत्यापित पार्टनर बैज ग्राहकों को तुरंत आपसे खरीदने का भरोसा देते हैं।",
    pricing_title: "सरल मूल्य निर्धारण",
    pricing_desc: "मुफ्त में शुरू करें। जब बिक्री गिनने में व्यस्त हो जाएं, तो अपग्रेड करें।",
    free: "मुफ्त",
    forever: "हमेशा के लिए",
    per_month: "प्रति माह",
    chats_limit: "50 AI चैट/माह",
    unlimited_ai: "असीमित AI",
    verified_badge: "सत्यापित बैज"
  },
  kn: {
    login: "ಲಾಗಿನ್",
    get_started: "ಪ್ರಾರಂಭಿಸಿ",
    hero_title: "ಸ್ಥಳೀಯ ವ್ಯಾಪಾರ,\nಹೊಸ ರೂಪದಲ್ಲಿ.",
    hero_desc: "Shopper ನಿಮ್ಮ ಅಂಗಡಿಯನ್ನು WhatsApp ನೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುತ್ತದೆ. 24/7 ಗ್ರಾಹಕರನ್ನು ನಿರ್ವಹಿಸುವ, ಮಾರಾಟ ಮಾಡುವ ಮತ್ತು ಉತ್ತರಿಸುವ AI ರಿಸೆಪ್ಷನಿಸ್ಟ್.",
    start_trial: "ಉಚಿತ ಟ್ರಯಲ್ ಪ್ರಾರಂಭಿಸಿ",
    how_it_works: "ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ",
    discovery: "ಅನ್ವೇಷಣೆ",
    location_aware: "ಸ್ಥಳ ಪರಿಜ್ಞಾನ",
    location_desc: "ಗ್ರಾಹಕರು ಹತ್ತಿರದಲ್ಲಿರುವುದರಿಂದಲೇ ನಿಮ್ಮನ್ನು ಕಂಡುಕೊಳ್ಳುತ್ತಾರೆ. ನಾವು ರಿಯಲ್-ಟೈಮ್ GPS ಬಳಸಿ ನಿಮ್ಮ ಅಂಗಡಿಯನ್ನು ಮೊದಲನೆಯದಾಗಿ ತೋರಿಸುತ್ತೇವೆ.",
    intelligence: "ಬುದ್ಧಿವಂತಿಕೆ",
    zero_friction: "ಯಾವುದೇ ಅಡೆತಡೆಯಿಲ್ಲ",
    friction_desc: "ಯಾವುದೇ ಆಪ್ ಡೌನ್‌ಲೋಡ್ ಇಲ್ಲ. ನಿಮ್ಮ ಗ್ರಾಹಕರು WhatsApp ನಲ್ಲಿ ಚಾಟ್ ಮಾಡುತ್ತಾರೆ, ಉಳಿದದ್ದನ್ನು ನಮ್ಮ AI ನಿರ್ವಹಿಸುತ್ತದೆ.",
    growth: "ಬೆಳವಣಿಗೆ",
    verified_trust: "ಪರಿಶೀಲಿಸಿದ ನಂಬಿಕೆ",
    trust_desc: "verified ಬ್ಯಾಡ್ಜ್‌ಗಳು ಗ್ರಾಹಕರಿಗೆ ನಿಮ್ಮಿಂದ ಖರೀದಿಸಲು ವಿಶ್ವಾಸವನ್ನು ನೀಡುತ್ತವೆ.",
    pricing_title: "ಸರಳ ಬೆಲೆ",
    pricing_desc: "ಉಚಿತವಾಗಿ ಪ್ರಾರಂಭಿಸಿ. ಮಾರಾಟ ಹೆಚ್ಚಾದಂತೆ ಅಪ್‌ಗ್ರೇಡ್ ಮಾಡಿ.",
    free: "ಉಚಿತ",
    forever: "ಯಾವಾಗಲೂ",
    per_month: "ಪ್ರತಿ ತಿಂಗಳು",
    chats_limit: "50 AI ಚಾಟ್/ತಿಂಗಳು",
    unlimited_ai: "ಅನಿಯಮಿತ AI",
    verified_badge: "ಪರಿಶೀಲಿಸಿದ ಬ್ಯಾಡ್ಜ್"
  },
  te: {
    login: "లాగిన్",
    get_started: "ప్రారంభించండి",
    hero_title: "స్థానిక వ్యాపారం,\nకొత్త రూపంలో.",
    hero_desc: "Shopper మీ దుకాణాన్ని WhatsApp తో కలుపుతుంది. 24/7 సమాధానం ఇచ్చే, విక్రయించే మరియు కస్టమర్లను నిర్వహించే AI అసిస్టెంట్.",
    start_trial: "ఉచిత ట్రయల్ ప్రారంభించండి",
    how_it_works: "ఇది ఎలా పనిచేస్తుంది",
    discovery: "ఆవిష్కరణ",
    location_aware: "లొకేషన్ అవేర్",
    location_desc: "కస్టమర్లు దగ్గరగా ఉండటం వల్ల మిమ్మల్ని కనుగొంటారు. మేము రియల్ టైమ్ GPS ఉపయోగిస్తాము.",
    intelligence: "తెలివితేటలు",
    zero_friction: "సులభంగా",
    friction_desc: "ఏ యాప్ డౌన్లోడ్ అవసరం లేదు. కస్టమర్లు WhatsApp లో చాట్ చేస్తారు, మిగిలినది మా AI చూసుకుంటుంది.",
    growth: "వృద్ది",
    verified_trust: "నమ్మకం",
    trust_desc: "వెరిఫైడ్ బ్యాడ్జ్ కస్టమర్లకు మీపై నమ్మకాన్ని ఇస్తుంది.",
    pricing_title: "సరళమైన ధరలు",
    pricing_desc: "ఉచితంగా ప్రారంభించండి. అమ్మకాలు పెరిగినప్పుడు అప్‌గ్రేడ్ చేయండి.",
    free: "ఉచితం",
    forever: "ఎప్పటికీ",
    per_month: "నెలకి",
    chats_limit: "50 AI చాట్లు/నెల",
    unlimited_ai: "అన్లిమిటెడ్ AI",
    verified_badge: "వెరిఫైడ్ బ్యాడ్జ్"
  },
  ta: {
    login: "உள்நுழைய",
    get_started: "தொடங்கவும்",
    hero_title: "உள்ளூர் வர்த்தகம்,\nபுதிய வடிவில்.",
    hero_desc: "Shopper உங்கள் கடையை WhatsApp உடன் இணைக்கிறது. 24/7 பதிலளிக்கும் AI உதவியாளர்.",
    start_trial: "இலவசமாகத் தொடங்குங்கள்",
    how_it_works: "எப்படி வேலை செய்கிறது",
    discovery: "கண்டுபிடிப்பு",
    location_aware: "இடம் அறிதல்",
    location_desc: "வாடிக்கையாளர்கள் அருகில் இருப்பதால் உங்களைக் கண்டுபிடிக்கிறார்கள்.",
    intelligence: "அறிவுத்திறன்",
    zero_friction: "தடையற்ற சேவை",
    friction_desc: "செயலி பதிவிறக்கம் தேவையில்லை. வாடிக்கையாளர்கள் WhatsApp இல் அரட்டை அடிக்கிறார்கள்.",
    growth: "வளர்ச்சி",
    verified_trust: "நம்பிக்கை",
    trust_desc: "சரிபார்க்கப்பட்ட பேட்ஜ் நம்பிக்கையை அளிக்கிறது.",
    pricing_title: "எளிய விலை",
    pricing_desc: "இலவசமாகத் தொடங்குங்கள். விற்பனை கூடும் போது மேம்படுத்தவும்.",
    free: "இலவசம்",
    forever: "என்றென்றும்",
    per_month: "மாதத்திற்கு",
    chats_limit: "50 AI அரட்டைகள்/மாதம்",
    unlimited_ai: "வரம்பற்ற AI",
    verified_badge: "சரிபார்க்கப்பட்ட பேட்ஜ்"
  },
  ml: {
    login: "ലോഗിൻ",
    get_started: "തുടങ്ങാം",
    hero_title: "പ്രാദേശിക വ്യാപാരം,\nപുതിയ രീതിയിൽ.",
    hero_desc: "Shopper നിങ്ങളുടെ കടയെ WhatsApp-മായി ബന്ധിപ്പിക്കുന്നു. 24/7 പ്രവർത്തിക്കുന്ന AI സഹായി.",
    start_trial: "സൗജന്യ ട്രയൽ",
    how_it_works: "എങ്ങനെ പ്രവർത്തിക്കുന്നു",
    discovery: "കണ്ടെത്തൽ",
    location_aware: "സ്ഥലമറിയാം",
    location_desc: "ഉപഭോക്താക്കൾ അടുത്തുതന്നെ നിങ്ങളെ കണ്ടെത്തുന്നു.",
    intelligence: "ബുദ്ധിശക്തി",
    zero_friction: "തടസ്സങ്ങളില്ലാതെ",
    friction_desc: "ആപ്പ് ഡൗൺലോഡ് വേണ്ട. WhatsApp-ൽ ചാറ്റ് ചെയ്യാം.",
    growth: "വളർച്ച",
    verified_trust: "വിശ്വാസ്യത",
    trust_desc: "വെരിഫൈഡ് ബാഡ്ജ് ഉപഭോക്താക്കൾക്ക് വിശ്വാസം നൽകുന്നു.",
    pricing_title: "ലളിതമായ വില",
    pricing_desc: "സൗജന്യമായി തുടങ്ങാം.",
    free: "സൗജന്യം",
    forever: "എന്നും",
    per_month: "മാസം",
    chats_limit: "50 AI ചാറ്റുകൾ",
    unlimited_ai: "അൺലിമിറ്റഡ് AI",
    verified_badge: "വെരിഫൈഡ് ബാഡ്ജ്"
  },
  tulu: {
    login: "ಲಾಗಿನ್",
    get_started: "ಸುರು ಮಲ್ಪುಲೆ",
    hero_title: "ನಮ್ಮ ಊರುದ ಅಂಗಡಿ,\nಪೊಸ ರೀತಿಡ್.",
    hero_desc: "Shopper ನಮ್ಮ ಅಂಗಡಿನ್ WhatsAppಗ್ ಸೇರಾವುಂಡು. 24/7 ಬೇಲೆ ಮಲ್ಪುನ AI.",
    start_trial: "ಉಚಿತ ಟ್ರಯಲ್",
    how_it_works: "ಎಂಚ ಬೇಲೆ ಮಲ್ಪುಂಡು",
    discovery: "ತುಲೆ",
    location_aware: "ಜಾಗದ ಪರಿವು",
    location_desc: "ಗ್ರಾಹಕೆರ್ ಕೈತಲ್ ಇತ್ತಿನೆರ್ದಾವರ ತಿಕ್ಕುವೆರ್.",
    intelligence: "ಬುದ್ಧಿ",
    zero_friction: "ಒವ್ವೆ ತೊಂದರೆ ಇದ್ಯಾಂತೆ",
    friction_desc: "ಆಪ್ ಬೊಡ್ಚಿ. WhatsAppಡ್ ಪಾತೆರ್ಲಿ.",
    growth: "ಬುಳೆಚ್ಚಿಲ್",
    verified_trust: "ನಂಬಿಕೆ",
    trust_desc: "ಪರಿಶೀಲಿಸಾಯಿನ ಬ್ಯಾಡ್ಜ್ ನಂಬಿಕೆನ್ ಕೊರ್ಪುಂಡು.",
    pricing_title: "ಬೆಲೆ",
    pricing_desc: "ಉಚಿತವಾದ್ ಸುರು ಮಲ್ಪುಲೆ.",
    free: "ಉಚಿತ",
    forever: "ಏಪಲ",
    per_month: "ಪ್ರತಿ ತಿಂಗಳು",
    chats_limit: "50 AI ಚಾಟ್",
    unlimited_ai: "ಅನಿಯಮಿತ AI",
    verified_badge: "ಪರಿಶೀಲಿಸಾಯಿನ ಬ್ಯಾಡ್ಜ್"
  }
};

export default function LandingPage() {
  const [lang, setLang] = useState<Language>('en');
  const t = TRANSLATIONS[lang];

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Navbar */}
      <nav className="fixed w-full z-50 mix-blend-difference text-white">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">shopper.</Link>

          <div className="flex items-center gap-6">
            <div className="relative group">
              <button className="text-sm font-medium hover:opacity-70 flex items-center gap-1 uppercase">
                {lang} <span className="text-[10px]">▼</span>
              </button>
              <div className="absolute top-full right-0 mt-2 w-32 bg-white text-black rounded shadow-xl hidden group-hover:block pb-2">
                <button onClick={() => setLang('en')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">English</button>
                <button onClick={() => setLang('hi')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">हिंदी</button>
                <button onClick={() => setLang('kn')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">ಕನ್ನಡ</button>
                <button onClick={() => setLang('te')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">తెలుగు</button>
                <button onClick={() => setLang('ta')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">தமிழ்</button>
                <button onClick={() => setLang('ml')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">മലയാളം</button>
                <button onClick={() => setLang('tulu')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">ತುಳು</button>
              </div>
            </div>

            <div className="flex gap-4 text-sm font-medium">
              <Link href="/login" className="hover:opacity-70 transition">{t.login}</Link>
              <Link href="/signup" className="hover:opacity-70 transition">{t.get_started}</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-12 whitespace-pre-line">
            {t.hero_title}
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed text-gray-600 max-w-xl mb-12">
            {t.hero_desc}
          </p>
          <div className="flex gap-6 items-center">
            <Link href="/signup" className="bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition">
              {t.start_trial}
            </Link>
            <Link href="#demo" className="border-b border-black pb-0.5 hover:opacity-50 transition">
              {t.how_it_works}
            </Link>
          </div>
        </div>
      </section>

      {/* Minimal Feature List */}
      <section className="py-32 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 md:gap-24">
          <div>
            <span className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{t.discovery}</span>
            <h3 className="text-2xl font-semibold mb-4">{t.location_aware}</h3>
            <p className="text-gray-600 leading-relaxed">
              {t.location_desc}
            </p>
          </div>
          <div>
            <span className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{t.intelligence}</span>
            <h3 className="text-2xl font-semibold mb-4">{t.zero_friction}</h3>
            <p className="text-gray-600 leading-relaxed">
              {t.friction_desc}
            </p>
          </div>
          <div>
            <span className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{t.growth}</span>
            <h3 className="text-2xl font-semibold mb-4">{t.verified_trust}</h3>
            <p className="text-gray-600 leading-relaxed">
              {t.trust_desc}
            </p>
          </div>
        </div>
      </section>

      {/* Big Image / Demo Placeholder */}
      {/* Video Demo Section */}
      <section id="demo" className="px-2 md:px-6 pb-20 md:pb-32">
        <div className="max-w-7xl mx-auto bg-gray-900 rounded-xl md:rounded-3xl p-1 md:p-4 shadow-2xl overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-800 to-black opacity-50 z-0"></div>

          {/* Browser Mockup Header */}
          <div className="relative z-10 bg-gray-800 rounded-t-xl h-8 flex items-center px-4 gap-2 mb-[-1px]">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="ml-4 bg-gray-900 rounded-md px-3 py-0.5 text-xs text-gray-500 flex-1 text-center font-mono">
              shopper.local
            </div>
          </div>

          {/* Video Player */}
          <div className="relative z-10 rounded-b-xl overflow-hidden aspect-video bg-black">
            <video
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              controls
              poster="https://placehold.co/1600x900/1f2937/fff?text=Loading+Demo..."
            >
              <source src="/demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>


          </div>
        </div>
      </section>

      {/* Simple Pricing */}
      <section className="py-32 px-6 bg-black text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">{t.pricing_title}</h2>
            <p className="text-xl text-gray-400 max-w-md">
              {t.pricing_desc}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-12 w-full md:w-auto">
            <div>
              <div className="text-3xl font-bold mb-2">{t.free}</div>
              <div className="text-gray-500 mb-4">{t.forever}</div>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>{t.chats_limit}</li>
                <li>Basic Analytics</li>
              </ul>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">$15</div>
              <div className="text-gray-500 mb-4">{t.per_month}</div>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>{t.unlimited_ai}</li>
                <li>{t.verified_badge}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-end">
          <div className="text-sm text-gray-400">
            &copy; 2024 Shopper Inc.
          </div>
          <div className="flex gap-6 text-sm font-medium">
            <a href="#" className="hover:underline">Legal</a>
            <a href="#" className="hover:underline">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
