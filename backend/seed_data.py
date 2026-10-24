import json
import sqlite3
import random
from database import get_connection, init_db, generate_supabase_schema

def seed_all():
    init_db()
    generate_supabase_schema()
    conn = get_connection()
    c = conn.cursor()

    # 1. Seed Demo Profiles (Student, Teacher, Guest)
    c.execute("""
    INSERT OR REPLACE INTO profiles (id, email, full_name, role, grade, board, preferred_language, study_hours_daily, streak, xp, level)
    VALUES 
    ('guest_user', 'guest@manovriddhi.edu', 'Guest Explorer', 'guest', 'Class 6', 'AP State Board', 'English', 1.5, 1, 50, 1),
    ('student_mohith', 'mohith@manovriddhi.edu', 'Mohith Vardhan (Student)', 'student', 'Class 6', 'AP State Board', 'Telugu', 2.5, 5, 480, 3),
    ('teacher_saritha', 'saritha@school.ap.gov.in', 'Saritha Devi (Science Teacher)', 'teacher', 'Class 6', 'AP State Board', 'Telugu', 4.0, 12, 1200, 5),
    ('admin_vidya', 'admin@manovriddhi.edu', 'Admin Vidyavriksha', 'admin', 'All Classes', 'All Boards', 'English', 5.0, 30, 3500, 10)
    """)

    # 2. Seed Subjects
    subjects = [
        ("sub_6_sci", "Class 6", "AP State Board", "Science", "సైన్స్ (సాధారణ శాస్త్రం)", "Leaf", "Explore biology, physics, and natural science fundamentals."),
        ("sub_6_math", "Class 6", "AP State Board", "Mathematics", "గణితం", "Calculator", "Numbers, shapes, algebra, and everyday mathematics."),
        ("sub_6_soc", "Class 6", "AP State Board", "Social Studies", "సాంఘిక శాస్త్రం", "Globe", "Our earth, history, governance, and culture."),
        ("sub_9_sci", "Class 9", "AP State Board", "Physical Science", "భౌతిక రసాయన శాస్త్రాలు", "Atom", "Motion, force, atoms, and chemical reactions."),
        ("sub_10_math", "Class 10", "AP State Board", "Mathematics", "గణితం", "Binary", "Real numbers, polynomials, trigonometry, and coordinate geometry.")
    ]
    for s in subjects:
        c.execute("""
        INSERT OR REPLACE INTO subjects (id, grade, board, name, name_te, icon, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, s)

    # 3. Seed Chapters
    chapters = [
        ("chap_6_sci_1", "sub_6_sci", 1, "Plants: Parts and Functions", "మొక్కలు: భాగాలు మరియు విధులు", "Understanding root systems, stems, leaves, photosynthesis, and transpiration in plants.", "మొక్కల వేరు వ్యవస్థ, కాండం, ఆకులు, కిరణజన్య సంయోగక్రియ మరియు బాష్పోత్సేకం గురించి వివరంగా అధ్యయనం చేయడం.", 45, 18),
        ("chap_6_sci_2", "sub_6_sci", 2, "Our Food & Essential Nutrients", "మన ఆహారం - ముఖ్యమైన పోషకాలు", "Components of food, carbohydrates, proteins, fats, vitamins, and balanced diet.", "ఆహారంలోని అంశాలు, పిండిపదార్థాలు, ప్రోటీన్లు, విటమిన్లు మరియు సమతుల్య ఆహారం ప్రాముఖ్యత.", 40, 14),
        ("chap_9_sci_1", "sub_9_sci", 1, "Laws of Motion", "చలన నియమాలు", "Aristotle vs Galileo, Newton's first, second, and third laws of motion, inertia, and momentum.", "న్యూటన్ మొదటి, రెండవ, మూడవ చలన నియమాలు, జడత్వం మరియు ద్రవ్యవేగం భావనలు.", 50, 22),
        ("chap_10_math_1", "sub_10_math", 1, "Real Numbers", "వాస్తవ సంఖ్యలు", "Euclid's division lemma, fundamental theorem of arithmetic, rational and irrational numbers.", "యూక్లిడ్ భాగహార న్యాయం, అంకగణిత ప్రాథమిక సిద్ధాంతం, కరణీయ మరియు అకరణీయ సంఖ్యలు.", 50, 20)
    ]
    for ch in chapters:
        c.execute("""
        INSERT OR REPLACE INTO chapters (id, subject_id, chapter_number, title, title_te, overview, overview_te, duration_minutes, total_pages)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, ch)

    # 4. Seed Grounded Textbook Chunks (with real Telugu + English translations & page numbers)
    chunks = [
        # Class 6 Science - Plants
        ("chunk_6_sci_p12", "chap_6_sci_1", "Class 6", "AP State Board", "Science", "Plants: Parts and Functions", 12,
         "Photosynthesis", "కిరణజన్య సంయోగక్రియ",
         "Photosynthesis is the fundamental biological process through which green plants utilize sunlight, water absorbed by roots, and carbon dioxide from the surrounding air to synthesize glucose (food) while discharging oxygen into the atmosphere.",
         "మొక్కలు సూర్యరశ్మి, నేల నుండి గ్రహించిన నీరు మరియు వాతావరణంలోని కార్బన్ డైఆక్సైడ్‌ను ఉపయోగించి తమ ఆహారాన్ని (గ్లూకోజ్) తయారు చేసుకునే ప్రక్రియను కిరణజన్య సంయోగక్రియ అంటారు. ఈ ప్రక్రియలో ప్రాణవాయువు (ఆక్సిజన్) విడుదలవుతుంది.",
         "photosynthesis,sunlight,food,leaves,carbon dioxide,oxygen,కిరణజన్య,సూర్యరశ్మి,ఆహారం,ఆకులు", "AP SCERT Class 6 Science Textbook"),

        ("chunk_6_sci_p13", "chap_6_sci_1", "Class 6", "AP State Board", "Science", "Plants: Parts and Functions", 13,
         "Chlorophyll and Leaf Structure", "పత్రహరితం మరియు ఆకు నిర్మాణం",
         "Chlorophyll is the vital green pigment embedded inside the chloroplasts of leaf cells. Its primary biological function is to capture light energy from the sun. The presence of chlorophyll gives leaves their characteristic green coloration.",
         "ఆకులలోని కణాలలో ఉండే పత్రహరితం (క్లోరోఫిల్) అనే ఆకుపచ్చని వర్ణద్రవ్యం సూర్యకాంతి శక్తిని గ్రహిస్తుంది. పత్రహరితం ఉండటం వల్లే ఆకులు సహజంగా ఆకుపచ్చ రంగులో కనిపిస్తాయి.",
         "chlorophyll,pigment,green,leaves,chloroplast,పత్రహరితం,క్లోరోఫిల్,ఆకుపచ్చ,సూర్యకాంతి", "AP SCERT Class 6 Science Textbook"),

        ("chunk_6_sci_p14", "chap_6_sci_1", "Class 6", "AP State Board", "Science", "Plants: Parts and Functions", 14,
         "Root System and Functions", "వేరు వ్యవస్థ మరియు విధులు",
         "The root system anchors the plant firmly in the soil. Roots absorb vital water and dissolved mineral nutrients from the earth and transport them upward to the stem. The two primary root types are tap roots and fibrous roots.",
         "వేర్లు మొక్కను నేలలో బలంగా నిలబెట్టడానికి ఆధారాన్నిస్తాయి. ఇవి నేల నుండి నీటిని మరియు ఖనిజ లవణాలను పీల్చుకుని కాండం ద్వారా పై భాగాలకు అందజేస్తాయి. వేర్లు ప్రధానంగా రెండు రకాలు: తల్లివేరు వ్యవస్థ మరియు పీచువేరు వ్యవస్థ.",
         "root,roots,soil,water,minerals,taproot,fibrous,వేర్లు,నీరు,లవణాలు,నేల,తల్లివేరు", "AP SCERT Class 6 Science Textbook"),

        ("chunk_6_sci_p15", "chap_6_sci_1", "Class 6", "AP State Board", "Science", "Plants: Parts and Functions", 15,
         "Stem and Vascular Conduction", "కాండం మరియు వాహక కణజాలం",
         "The stem provides physical support to the branches, foliage, flowers, and fruits. It houses xylem vessels that conduct water upward from roots, and phloem tissues that distribute organic nutrients prepared in leaves to all other plant organs.",
         "కాండం మొక్క యొక్క కొమ్మలు, ఆకులు, పువ్వులు మరియు కాయలకు ఆధారాన్నిస్తుంది. ఇది దారువు (Xylem) ద్వారా వేర్ల నుండి నీటిని పైకి మరియు పోషక కణజాలం (Phloem) ద్వారా ఆకులలో తయారైన ఆహారాన్ని అన్ని భాగాలకు చేరవేస్తుంది.",
         "stem,conduction,xylem,phloem,support,water,కాండం,దారువు,పోషకకణజాలం,ఆధారం", "AP SCERT Class 6 Science Textbook"),

        ("chunk_6_sci_p16", "chap_6_sci_1", "Class 6", "AP State Board", "Science", "Plants: Parts and Functions", 16,
         "Transpiration through Stomata", "బాష్పోత్సేకం మరియు పత్రరంధ్రాలు",
         "Transpiration is the evaporation of excess water from the aerial portions of a plant, primarily through microscopic apertures called stomata on the underside of leaves. This cooling mechanism also generates a suction pull that draws water from roots.",
         "ఆకుల అడుగు భాగంలో ఉండే సూక్ష్మ రంధ్రాలైన పత్రరంధ్రాల (Stomata) ద్వారా మొక్కలోని అదనపు నీరు ఆవిరి రూపంలో బయటకు విడుదలయ్యే ప్రక్రియను బాష్పోత్సేకం (Transpiration) అంటారు. ఇది మొక్కను చల్లబరుస్తూ వేర్ల నుండి నీటి ప్రసరణకు సహాయపడుతుంది.",
         "transpiration,stomata,water loss,cooling,evaporation,బాష్పోత్సేకం,పత్రరంధ్రాలు,నీరు,ఆవిరి", "AP SCERT Class 6 Science Textbook"),

        # Class 6 Science - Food
        ("chunk_6_food_p21", "chap_6_sci_2", "Class 6", "AP State Board", "Science", "Our Food & Essential Nutrients", 21,
         "Carbohydrates and Energy", "పిండిపదార్థాలు మరియు శక్తి",
         "Carbohydrates are the main energy-yielding nutrients in human nutrition. Starch in rice, wheat, and potatoes is broken down into simple sugars that furnish kinetic and metabolic energy for all bodily functions.",
         "పిండిపదార్థాలు (కార్బోహైడ్రేట్లు) మన శరీరానికి ప్రధాన శక్తినిచ్చే పోషకాలు. బియ్యం, గోధుమలు, బంగాళాదుంపలలోని పిండిపదార్థం శరీరానికి అవసరమైన తక్షణ శక్తిని అందజేస్తుంది.",
         "carbohydrates,energy,starch,rice,wheat,glucose,పిండిపదార్థాలు,శక్తి,బియ్యం,ఆహారం", "AP SCERT Class 6 Science Textbook"),

        # Class 9 Science - Motion
        ("chunk_9_mot_p4", "chap_9_sci_1", "Class 9", "AP State Board", "Physical Science", "Laws of Motion", 4,
         "Inertia and Newton's First Law", "జడత్వం మరియు న్యూటన్ మొదటి చలన నియమం",
         "Newton's First Law of Motion states that an object persists in its state of rest or uniform linear motion unless acted upon by an external unbalanced net force. Inertia is the inherent tendency of an object to resist changes in its state of motion.",
         "బాహ్య బలప్రయోగం లేనంతవరకు ప్రతి వస్తువు తన నిశ్చల స్థితిలో గాని లేదా సరళరేఖీయ సమచలన స్థితిలో గాని కొనసాగుతుంది. ఈ ధర్మాన్ని న్యూటన్ మొదటి చలన నియమం లేదా జడత్వ నియమం అంటారు.",
         "inertia,newton,first law,force,rest,motion,జడత్వం,న్యూటన్,మొదటి నియమం,బలం,చలనం", "AP SCERT Class 9 Physical Science"),

        # Class 10 Math - Real Numbers
        ("chunk_10_math_p3", "chap_10_math_1", "Class 10", "AP State Board", "Mathematics", "Real Numbers", 3,
         "Euclid's Division Lemma", "యూక్లిడ్ భాగహార న్యాయం",
         "Euclid's Division Lemma establishes that for any two positive integers a and b, there exist unique whole numbers q and r satisfying a = bq + r, where 0 <= r < b. It provides the foundation for finding the Highest Common Factor (HCF).",
         "ఏవైనా రెండు ధన పూర్ణసంఖ్యలు a మరియు b లకు a = bq + r (ఇక్కడ 0 <= r < b) అయ్యేటట్లు ఏకైక పూర్ణసంఖ్యలు q మరియు r లు వ్యవస్థితమవుతాయి. దీనిని యూక్లిడ్ భాగహార న్యాయం అంటారు. దీనిని గ.సా.భా కనుగొనడానికి ఉపయోగిస్తారు.",
         "euclid,division,lemma,hcf,remainder,quotient,యూక్లిడ్,భాగహారం,వాస్తవ సంఖ్యలు,గసాభా", "AP SCERT Class 10 Mathematics")
    ]

    for chk in chunks:
        c.execute("""
        INSERT OR REPLACE INTO textbook_chunks (id, chapter_id, grade, board, subject, chapter, page_number, topic, topic_te, text_en, text_te, keywords, source_book)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, chk)

    # 5. Seed Quiz Questions
    quiz_questions = [
        ("q_plant_1", "chap_6_sci_1", "Photosynthesis", "కిరణజన్య సంయోగక్రియ",
         "Which gas do green plants absorb from the atmosphere during photosynthesis?",
         "కిరణజన్య సంయోగక్రియ సమయంలో ఆకుపచ్చ మొక్కలు వాతావరణం నుండి ఏ వాయువును గ్రహిస్తాయి?",
         json.dumps(["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"]),
         json.dumps(["ఆక్సిజన్", "కార్బన్ డైఆక్సైడ్", "నైట్రోజన్", "హైడ్రోజన్"]),
         1,
         "Page 12: Green plants take in carbon dioxide from the air and release oxygen during photosynthesis.",
         "పేజీ 12: కిరణజన్య సంయోగక్రియలో మొక్కలు కార్బన్ డైఆక్సైడ్‌ను గ్రహించి, ఆక్సిజన్‌ను గాలిలోకి విడుదల చేస్తాయి.",
         12, "easy"),

        ("q_plant_2", "chap_6_sci_1", "Chlorophyll and Leaf Structure", "పత్రహరితం మరియు ఆకు నిర్మాణం",
         "What is the primary role of chlorophyll in leaves?",
         "ఆకులలోని పత్రహరితం యొక్క ప్రధాన విధి ఏమిటి?",
         json.dumps(["Absorbing water from soil", "Capturing sunlight energy", "Producing flowers", "Protecting against insects"]),
         json.dumps(["నేల నుండి నీటిని పీల్చడం", "సూర్యరశ్మి శక్తిని గ్రహించడం", "పువ్వులను ఉత్పత్తి చేయడం", "కీటకాల నుండి రక్షించడం"]),
         1,
         "Page 13: Chlorophyll is the green pigment in chloroplasts that absorbs sunlight energy required for food preparation.",
         "పేజీ 13: ఆకులలో ఉండే పత్రహరితం సూర్యకాంతి శక్తిని గ్రహించి ఆహార తయారీకి సహాయపడుతుంది.",
         13, "medium"),

        ("q_plant_3", "chap_6_sci_1", "Root System and Functions", "వేరు వ్యవస్థ మరియు విధులు",
         "Which plant organ primarily absorbs water and mineral nutrients from the soil?",
         "నేల నుండి నీటిని మరియు ఖనిజ లవణాలను పీల్చుకునే మొక్క భాగం ఏది?",
         json.dumps(["Stem", "Flower", "Root", "Leaf blade"]),
         json.dumps(["కాండం", "పువ్వు", "వేరు", "ఆకు పత్రదళం"]),
         2,
         "Page 14: Roots anchor the plant firmly and absorb water and dissolved minerals from the soil.",
         "పేజీ 14: వేర్లు మొక్కను నేలలో నిలబెట్టి, నీరు మరియు ఖనిజ లవణాలను గ్రహిస్తాయి.",
         14, "easy"),

        ("q_plant_4", "chap_6_sci_1", "Stem and Vascular Conduction", "కాండం మరియు వాహక కణజాలం",
         "Which vascular tissue conducts water upward from roots to the leaves?",
         "వేర్ల నుండి ఆకులకు నీటిని చేరవేసే వాహక కణజాలం ఏది?",
         json.dumps(["Xylem (దారువు)", "Phloem (పోషక కణజాలం)", "Stomata", "Chloroplast"]),
         json.dumps(["దారువు (Xylem)", "పోషక కణజాలం (Phloem)", "పత్రరంధ్రాలు", "హరితరేణువు"]),
         0,
         "Page 15: Xylem vessels conduct water and minerals upward from roots to the rest of the plant.",
         "పేజీ 15: దారువు (Xylem) వేర్ల నుండి నీటిని మరియు లవణాలను ఆకులకు చేరవేస్తుంది.",
         15, "hard"),

        ("q_plant_5", "chap_6_sci_1", "Transpiration through Stomata", "బాష్పోత్సేకం మరియు పత్రరంధ్రాలు",
         "The loss of excess water as vapor through leaf stomata is called:",
         "ఆకుల పత్రరంధ్రాల ద్వారా అదనపు నీరు ఆవిరి రూపంలో విడుదల కావడాన్ని ఏమంటారు?",
         json.dumps(["Respiration", "Transpiration", "Germination", "Digestion"]),
         json.dumps(["శ్వాసక్రియ", "బాష్పోత్సేకం (Transpiration)", "మొలకెత్తడం", "జీర్ణక్రియ"]),
         1,
         "Page 16: Transpiration is the release of excess water vapor through stomata, which also helps keep plants cool.",
         "పేజీ 16: పత్రరంధ్రాల ద్వారా నీరు ఆవిరిగా మారే ప్రక్రియను బాష్పోత్సేకం అంటారు.",
         16, "medium"),

        ("q_mot_1", "chap_9_sci_1", "Inertia and Newton's First Law", "జడత్వం మరియు న్యూటన్ మొదటి చలన నియమం",
         "Which physical property causes an object to resist changes in its state of motion?",
         "వస్తువు తన చలన స్థితిలో మార్పును వ్యతిరేకించే స్వభావాన్ని ఏమంటారు?",
         json.dumps(["Velocity", "Inertia", "Acceleration", "Friction"]),
         json.dumps(["వేగం", "జడత్వం (Inertia)", "త్వరణం", "ఘర్షణ"]),
         1,
         "Page 4: Inertia is the intrinsic property of matter to resist any change in its state of rest or uniform motion.",
         "పేజీ 4: వస్తువు తన నిశ్చల స్థితిని లేదా సమచలన స్థితిని కాపాడుకునే ధర్మాన్ని జడత్వం అంటారు.",
         4, "medium")
    ]

    for q in quiz_questions:
        c.execute("""
        INSERT OR REPLACE INTO quiz_questions (id, chapter_id, topic, topic_te, question_en, question_te, options_en, options_te, correct_index, explanation_en, explanation_te, page_number, difficulty)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, q)

    # 6. Seed Flashcards
    flashcards = [
        ("fc_1", "chap_6_sci_1", "Photosynthesis", "కిరణజన్య సంయోగక్రియ",
         "What is Photosynthesis?", "కిరణజన్య సంయోగక్రియ అంటే ఏమిటి?",
         "The process by which green plants synthesize glucose using sunlight, water, and CO2, releasing oxygen.",
         "ఆకుపచ్చని మొక్కలు సూర్యరశ్మి, నీరు మరియు CO₂ ఉపయోగించి ఆహారాన్ని తయారుచేసి, ఆక్సిజన్‌ను విడుదల చేసే ప్రక్రియ.", 12),

        ("fc_2", "chap_6_sci_1", "Chlorophyll", "పత్రహరితం",
         "What is Chlorophyll?", "పత్రహరితం (క్లోరోఫిల్) అంటే ఏమిటి?",
         "A vital green pigment in leaf chloroplasts that absorbs light energy for photosynthesis.",
         "ఆకులలో ఉండి సూర్యకాంతి శక్తిని గ్రహించే ఆకుపచ్చని వర్ణద్రవ్యం.", 13),

        ("fc_3", "chap_6_sci_1", "Transpiration", "బాష్పోత్సేకం",
         "What is Transpiration?", "బాష్పోత్సేకం అంటే ఏమిటి?",
         "Evaporation of water vapor through microscopic stomata on leaf undersides, cooling the plant.",
         "ఆకుల పత్రరంధ్రాల ద్వారా నీరు ఆవిరి రూపంలో విడుదలయ్యే ప్రక్రియ. ఇది మొక్కను చల్లబరుస్తుంది.", 16),

        ("fc_4", "chap_6_sci_1", "Xylem vs Phloem", "దారువు vs పోషక కణజాలం",
         "Differentiate Xylem and Phloem.", "దారువు మరియు పోషక కణజాలం తేడా ఏమిటి?",
         "Xylem conducts water/minerals upward from roots. Phloem distributes prepared food from leaves to all parts.",
         "దారువు వేర్ల నుండి నీటిని పైకి చేరవేస్తుంది. పోషక కణజాలం ఆకులలోని ఆహారాన్ని అన్ని భాగాలకు పంచుతుంది.", 15)
    ]

    for fc in flashcards:
        c.execute("""
        INSERT OR REPLACE INTO flashcards (id, chapter_id, topic, topic_te, front_en, front_te, back_en, back_te, page_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, fc)

    # 7. Seed Achievements
    achievements = [
        ("FIRST_LESSON", "First Step in Learning", "మొదటి పాఠం అడుగు", "Completed your very first textbook lesson session.", 50, "BookOpen"),
        ("FIRST_QUIZ", "Quiz Initiate", "మొదటి క్విజ్ విజేత", "Attempted your first chapter practice quiz.", 50, "Brain"),
        ("SEVEN_DAY_STREAK", "Seven-Day Scholar", "7 రోజుల క్రమశిక్షణ", "Studied consistently for 7 consecutive days.", 150, "Flame"),
        ("CHAPTER_CHAMPION", "Chapter Champion", "పాఠ్యాంశ ఛాంపియన్", "Scored over 80% on all topics in a chapter.", 200, "Trophy"),
        ("QUIZ_MASTER", "Quiz Master", "క్విజ్ మాస్టర్", "Answered 20 questions correctly without error.", 250, "Crown"),
        ("REVISION_HERO", "Revision Hero", "పునశ్చరణ వీరుడు", "Revised 5 weak topics and mastered them.", 120, "RotateCcw"),
        ("TELUGU_SCHOLAR", "Telugu Scholar", "తెలుగు తేజం", "Asked 10 questions in Telugu and explored bilingual learning.", 100, "Languages"),
        ("COMEBACK_LEARNER", "Comeback Learner", "తిరిగి పుంజుకున్న విద్యార్థి", "Improved a previously low quiz score by more than 30%.", 150, "TrendingUp"),
        ("CONSISTENT_LEARNER", "Consistency Ace", "క్రమశిక్షణా ధీరుడు", "Maintained daily study goal for two weeks.", 200, "Award"),
        ("TIMETABLE_BUILDER", "Master Planner", "సమయపాలనా ప్రవీణుడు", "Generated and saved your personalized study timetable.", 80, "Calendar")
    ]

    for ach in achievements:
        c.execute("""
        INSERT OR REPLACE INTO achievements (code, title, title_te, description, xp_reward, icon)
        VALUES (?, ?, ?, ?, ?, ?)
        """, ach)

    # Award initial achievements to demo student
    c.execute("""
    INSERT OR REPLACE INTO student_achievements (id, student_id, achievement_code)
    VALUES 
    ('sa_1', 'student_mohith', 'FIRST_LESSON'),
    ('sa_2', 'student_mohith', 'FIRST_QUIZ'),
    ('sa_3', 'student_mohith', 'TELUGU_SCHOLAR')
    """)

    # 8. Seed Educational Resources (YouTube, SCERT, Google References)
    resources = [
        ("res_1", "chap_6_sci_1", "Class 6 Science: Parts of a Plant (AP SCERT Telugu Medium)", "YouTube", "video",
         "https://www.youtube.com/results?search_query=class+6+science+plants+parts+and+functions+telugu+ap+scert", "Telugu",
         "Visual video walkthrough of Class 6 Science chapter on plant anatomy and root systems."),

        ("res_2", "chap_6_sci_1", "Photosynthesis in Green Plants Animated (English & Telugu)", "YouTube", "video",
         "https://www.youtube.com/results?search_query=photosynthesis+animation+explanation+telugu+for+kids", "Telugu",
         "High quality visual animation explaining how chlorophyll absorbs sunlight and releases oxygen."),

        ("res_3", "chap_6_sci_1", "AP SCERT Official E-Textbook Chapter 1 PDF", "SCERT Official", "textbook",
         "https://cse.ap.gov.in/", "Bilingual",
         "Official prescribed Andhra Pradesh government school textbook for Class 6 General Science."),

        ("res_4", "chap_6_sci_1", "Stomata and Transpiration Laboratory Experiment", "Google Search", "search",
         "https://www.google.com/search?q=stomata+transpiration+bell+jar+experiment+class+6+science", "English",
         "Practical classroom experiment setup to observe water droplets on a bell jar.")
    ]

    for res in resources:
        c.execute("""
        INSERT OR REPLACE INTO educational_resources (id, chapter_id, title, provider, resource_type, url, language, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, res)

    # 9. Seed Teacher Classes and Simulated Class Results
    # This reflects the exact YUKTHI 2026 PPT: "62% of students in this class struggled with Topic Y"
    c.execute("""
    INSERT OR REPLACE INTO teacher_classes (id, teacher_id, class_name, grade, subject, total_students)
    VALUES ('tc_6a', 'teacher_saritha', 'Class 6A (Govt High School)', 'Class 6', 'Science', 24)
    """)

    # Populate 24 realistic student quiz attempts for Class 6A
    # Topic 1: Photosynthesis (40% correct, 60% missed) -> CLEAR LEARNING GAP
    # Topic 2: Chlorophyll (38% correct, 62% missed) -> CLEAR LEARNING GAP
    # Topic 3: Root System (85% correct, 15% missed) -> HIGH MASTERY
    # Topic 4: Stem & Vascular (70% correct, 30% missed)
    # Topic 5: Transpiration (55% correct, 45% missed)
    random.seed(42)
    c.execute("DELETE FROM quiz_attempts WHERE chapter_id = 'chap_6_sci_1' AND student_id LIKE 'sim_stud_%'")
    for i in range(1, 25):
        s_id = f"sim_stud_{i}"
        ans = [
            {"topic": "Photosynthesis", "correct": random.random() < 0.40, "page": 12},
            {"topic": "Chlorophyll and Leaf Structure", "correct": random.random() < 0.38, "page": 13},
            {"topic": "Root System and Functions", "correct": random.random() < 0.85, "page": 14},
            {"topic": "Stem and Vascular Conduction", "correct": random.random() < 0.70, "page": 15},
            {"topic": "Transpiration through Stomata", "correct": random.random() < 0.55, "page": 16}
        ]
        score = sum(1 for a in ans if a["correct"])
        c.execute("""
        INSERT INTO quiz_attempts (id, student_id, chapter_id, score, total_questions, accuracy_pct, time_taken_sec, answers_json)
        VALUES (?, ?, 'chap_6_sci_1', ?, 5, ?, ?, ?)
        """, (f"qa_sim_{i}", s_id, score, round((score / 5.0) * 100, 1), random.randint(120, 240), json.dumps(ans)))

    # Also insert demo student's existing attempt
    demo_ans = [
        {"topic": "Photosynthesis", "correct": False, "page": 12},
        {"topic": "Chlorophyll and Leaf Structure", "correct": False, "page": 13},
        {"topic": "Root System and Functions", "correct": True, "page": 14},
        {"topic": "Stem and Vascular Conduction", "correct": True, "page": 15},
        {"topic": "Transpiration through Stomata", "correct": False, "page": 16}
    ]
    c.execute("""
    INSERT OR REPLACE INTO quiz_attempts (id, student_id, chapter_id, score, total_questions, accuracy_pct, time_taken_sec, answers_json)
    VALUES ('qa_demo_1', 'student_mohith', 'chap_6_sci_1', 2, 5, 40.0, 160, ?)
    """, (json.dumps(demo_ans),))

    # Topic Mastery for Mohith
    c.execute("""
    INSERT OR REPLACE INTO topic_mastery (id, student_id, topic, topic_te, total_attempts, correct_attempts, mastery_pct)
    VALUES 
    ('tm_1', 'student_mohith', 'Photosynthesis', 'కిరణజన్య సంయోగక్రియ', 3, 1, 33.3),
    ('tm_2', 'student_mohith', 'Chlorophyll and Leaf Structure', 'పత్రహరితం మరియు ఆకు నిర్మాణం', 2, 0, 0.0),
    ('tm_3', 'student_mohith', 'Root System and Functions', 'వేరు వ్యవస్థ మరియు విధులు', 4, 4, 100.0),
    ('tm_4', 'student_mohith', 'Stem and Vascular Conduction', 'కాండం మరియు వాహక కణజాలం', 3, 2, 66.7),
    ('tm_5', 'student_mohith', 'Transpiration through Stomata', 'బాష్పోత్సేకం మరియు పత్రరంధ్రాలు', 2, 1, 50.0)
    """)

    # 10. Seed Study Sessions for Progress Analytics (over past 7 days)
    c.execute("DELETE FROM study_sessions WHERE student_id = 'student_mohith'")
    dates = ["2026-10-18", "2026-10-19", "2026-10-20", "2026-10-21", "2026-10-22", "2026-10-23", "2026-10-24"]
    durations = [35, 45, 50, 40, 60, 55, 30]
    for d, dur in zip(dates, durations):
        c.execute("""
        INSERT INTO study_sessions (id, student_id, subject, chapter, activity_type, duration_minutes, created_at)
        VALUES (?, 'student_mohith', 'Science', 'Plants: Parts and Functions', 'tutor_and_quiz', ?, ? || ' 17:30:00')
        """, (f"ss_{d}", dur, d))

    # 11. Seed Evaluation Runs
    c.execute("""
    INSERT OR REPLACE INTO evaluation_runs (id, run_date, model_name, total_questions, retrieval_accuracy, citation_precision, telugu_grounding_score, avg_latency_ms, details_json)
    VALUES (
        'eval_run_latest',
        '2026-10-23 20:15:00',
        'Hybrid BM25 + Gemini 2.5 Flash',
        25,
        96.0,
        92.0,
        94.5,
        420.0,
        '{"passed": 24, "failed": 1, "test_coverage": "SCERT AP Class 6 Science & Class 9 Motion", "hallucination_rate_pct": 0.0, "strict_fallback_verified": true}'
    )
    """)

    conn.commit()
    conn.close()
    print("Seed data successfully inserted into SQLite database.")

if __name__ == "__main__":
    seed_all()
