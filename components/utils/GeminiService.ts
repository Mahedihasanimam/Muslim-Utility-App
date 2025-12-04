// // const API_KEY = "AIzaSyB-4ymFgIBRu-2Yb2tJ83g4-dNgjikBQbg";

// import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// // ⚠️ আপনার সঠিক API Key (AIza... দিয়ে শুরু) এখানে বসান
// const API_KEY = "AIzaSyCgDXShItpvWRaYKySQNzbBWUgNIGUhvnY";

// const genAI = new GoogleGenerativeAI(API_KEY);

// // --- ফিচার ১: মানসিক প্রশান্তি (Structured JSON) ---
// export const getIslamicAdvice = async (mood: string) => {
//   try {
//     // এখানে আমরা JSON স্কিমা কনফিগার করছি, ঠিক আপনার Next.js কোডের মতো
//     const model = genAI.getGenerativeModel({
//       model: "gemini-2.5-flash",
//       generationConfig: {
//         responseMimeType: "application/json",
//         responseSchema: {
//           type: SchemaType.OBJECT,
//           properties: {
//             advice: {
//               type: SchemaType.STRING,
//               description: "Bengali advice based on Quran/Hadith",
//             },
//             dua_arabic: {
//               type: SchemaType.STRING,
//               description: "Relevant Dua in Arabic",
//             },
//             dua_meaning: {
//               type: SchemaType.STRING,
//               description: "Bengali meaning of the Dua",
//             },
//             reference: {
//               type: SchemaType.STRING,
//               description: "Source reference (e.g. Bukhari: 102)",
//             },
//           },
//           required: ["advice", "dua_arabic", "dua_meaning", "reference"],
//         },
//       },
//     });

//     const prompt = `User feels "${mood}". Provide comforting Islamic advice, a short Dua, and reference.`;

//     const result = await model.generateContent(prompt);
//     const responseText = result.response.text();

//     // JSON পার্স করে রিটার্ন করা
//     return JSON.parse(responseText);
//   } catch (error) {
//     console.error("Advice Error:", error);
//     return null;
//   }
// };

// // --- ফিচার ২: নামাজ মিস করলে মোটিভেশন (Simple Text) ---
// export const getPrayerMissedAdvice = async (prayerName: string) => {
//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

//     const prompt = `
//       User missed the "${prayerName}" prayer.
//       Act as a gentle, encouraging Muslim friend (not harsh).
//       Give a very short (2 sentences max) motivational message in Bangla.
//       End with "ইনশাআল্লাহ"।
//     `;

//     const result = await model.generateContent(prompt);
//     return result.response.text();
//   } catch (error) {
//     console.error("Prayer Missed Error:", error);
//     return "মন খারাপ করবেন না, আল্লাহ তৌফিক দাতা। আগামী ওয়াক্তের জন্য প্রস্তুত হন। ইনশাআল্লাহ।";
//   }
// };

// // --- ফিচার ৩: নির্দিষ্ট সমস্যার সমাধান (Contextual Dua - JSON) ---
// export const getContextualDua = async (userProblem: string) => {
//   try {
//     const model = genAI.getGenerativeModel({
//       model: "gemini-1.5-flash",
//       generationConfig: {
//         responseMimeType: "application/json",
//         responseSchema: {
//           type: SchemaType.OBJECT,
//           properties: {
//             solution_title: {
//               type: SchemaType.STRING,
//               description: "Short title of the solution",
//             },
//             action_plan: {
//               type: SchemaType.STRING,
//               description: "Short advice on what to do",
//             },
//             dua_arabic: { type: SchemaType.STRING },
//             dua_pronunciation: {
//               type: SchemaType.STRING,
//               description: "Bangla pronunciation",
//             },
//             dua_meaning: { type: SchemaType.STRING },
//           },
//           required: [
//             "solution_title",
//             "action_plan",
//             "dua_arabic",
//             "dua_meaning",
//           ],
//         },
//       },
//     });

//     const prompt = `
//       User's problem: "${userProblem}".
//       Provide a specific Islamic solution and Dua.
//       Output strictly in JSON.
//     `;

//     const result = await model.generateContent(prompt);
//     return JSON.parse(result.response.text());
//   } catch (error) {
//     console.error("Contextual Dua Error:", error);
//     return null;
//   }
// };

// export const startIslamicChat = async (
//   history: { role: string; parts: { text: string }[] }[],
//   newMessage: string
// ) => {
//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

//     const chat = model.startChat({
//       history: history, // আগের চ্যাট হিস্ট্রি পাঠানো হচ্ছে
//       generationConfig: {
//         maxOutputTokens: 500, // উত্তর খুব বেশি বড় না হয়
//       },
//       systemInstruction: {
//         role: "system",
//         parts: [
//           {
//             text: `
//           You are a helpful, gentle, and knowledgeable Islamic Assistant named 'দ্বীনী বন্ধু' (Deeni Bondhu).

//           Guidelines:
//           1. Answer questions based ONLY on the Quran and Sahih Hadith.
//           2. Always provide references (Surah:Verse or Hadith Book) if possible.
//           3. Be polite and empathetic. Use "ইনশাআল্লাহ", "আলহামদুলিল্লাহ" where appropriate.
//           4. If a question is about a controversial Fatwa, say: "এই বিষয়ে মতভেদ আছে, অনুগ্রহ করে একজন বিজ্ঞ আলেম বা মুফতির পরামর্শ নিন।" (There is difference of opinion, please consult a scholar).
//           5. Keep answers concise (within 3-5 sentences unless detail is needed).
//           6. Always reply in Bengali.
//         `,
//           },
//         ],
//       },
//     });

//     const result = await chat.sendMessage(newMessage);
//     return result.response.text();
//   } catch (error) {
//     console.error("Chat Error:", error);
//     return "দুঃখিত, বর্তমানে সার্ভারে সমস্যা হচ্ছে। কিছুক্ষণ পর আবার চেষ্টা করুন।";
//   }
// };

// export const getZakatTermExplanation = async (term: string) => {
//   try {
//     const prompt = `
//       Explain the term "${term}" in the context of Zakat calculation in simple Bengali.
//       Keep it short (maximum 3 sentences).
//       Target audience: General Muslim users.
//     `;
//     const result = await model.generateContent(prompt);
//     return result.response.text();
//   } catch (error) {
//     console.error("Zakat Term Error:", error);
//     return "দুঃখিত, এই মুহূর্তে ব্যাখ্যাটি লোড করা যাচ্ছে না।";
//   }
// };

// // --- ২. যাকাত পরামর্শ ও বিশ্লেষণ (নতুন) ---
// export const getZakatConsultation = async (financialData: any) => {
//   try {
//     const prompt = `
//       Act as an Islamic Scholar. Here is the user's Zakat calculation data:
//       ${JSON.stringify(financialData)}

//       Provide a short analysis in Bengali:
//       1. Confirm if Zakat is due or not.
//       2. Suggest 2-3 best ways to distribute this amount (based on Quranic recipients).
//       3. Give a short Dua for wealth purification.

//       Format: Text with bullet points.
//     `;
//     const result = await model.generateContent(prompt);
//     return result.response.text();
//   } catch (error) {
//     console.error("Zakat Consultation Error:", error);
//     return "দুঃখিত, পরামর্শ লোড করা যাচ্ছে না।";
//   }
// };

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// ⚠️ আপনার দেওয়া API Key
const API_KEY = "AIzaSyCgDXShItpvWRaYKySQNzbBWUgNIGUhvnY";

const genAI = new GoogleGenerativeAI(API_KEY);

// মডেল ইনিশিয়ালাইজেশন
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// --- ১. যাকাত টার্ম ব্যাখ্যা (Help Feature) ---
export const getZakatTermExplanation = async (term: string) => {
  try {
    const prompt = `
      Explain the term "${term}" in the context of Zakat calculation in simple Bengali.
      Keep it short (maximum 2-3 sentences).
      Target audience: General Muslim users who might not understand complex terms.
    `;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Zakat Term Error:", error);
    return "দুঃখিত, এই মুহূর্তে ব্যাখ্যাটি লোড করা যাচ্ছে না। ইন্টারনেট সংযোগ চেক করুন।";
  }
};

// --- ২. যাকাত পরামর্শ ও বিশ্লেষণ (Consultation Feature) ---
export const getZakatConsultation = async (financialData: any) => {
  try {
    const prompt = `
      Act as an Islamic Scholar. Here is the user's Zakat calculation data:
      ${JSON.stringify(financialData)}
      
      Provide a short analysis in Bengali:
      1. Confirm if Zakat is due or not based on Nisab.
      2. Suggest 2 best ways to distribute this amount (based on Quranic recipients like Fakir, Miskin, Madrasah).
      3. Give a short Dua for wealth purification.
      
      Format: Clean text with bullet points.
    `;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Zakat Consultation Error:", error);
    return "দুঃখিত, পরামর্শ লোড করা যাচ্ছে না।";
  }
};

// --- ৩. মুড ভিত্তিক পরামর্শ (আগের ফাংশন) ---
export const getIslamicAdvice = async (mood: string) => {
  try {
    const modelJson = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            advice: { type: SchemaType.STRING },
            dua_arabic: { type: SchemaType.STRING },
            dua_meaning: { type: SchemaType.STRING },
            reference: { type: SchemaType.STRING },
          },
          required: ["advice", "dua_arabic", "dua_meaning", "reference"],
        },
      },
    });

    const prompt = `User feels "${mood}". Provide comforting Islamic advice in Bangla, a short Dua, and reference.`;
    const result = await modelJson.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("Advice Error:", error);
    return null;
  }
};

// --- ৪. নামাজ মিস করলে মোটিভেশন (আগের ফাংশন) ---
export const getPrayerMissedAdvice = async (prayerName: string) => {
  try {
    const prompt = `
      User missed the "${prayerName}" prayer. 
      Act as a gentle, encouraging Muslim friend. 
      Give a very short (2 sentences max) motivational message in Bangla.
      End with "ইনশাআল্লাহ"।
    `;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return "মন খারাপ করবেন না, আল্লাহ তৌফিক দাতা। আগামী ওয়াক্তের জন্য প্রস্তুত হন। ইনশাআল্লাহ।";
  }
};

// --- ৫. নির্দিষ্ট সমস্যার সমাধান (Contextual Dua) ---
export const getContextualDua = async (userProblem: string) => {
  try {
    const modelJson = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            solution_title: { type: SchemaType.STRING },
            action_plan: { type: SchemaType.STRING },
            dua_arabic: { type: SchemaType.STRING },
            dua_pronunciation: { type: SchemaType.STRING },
            dua_meaning: { type: SchemaType.STRING },
          },
          required: [
            "solution_title",
            "action_plan",
            "dua_arabic",
            "dua_meaning",
          ],
        },
      },
    });

    const prompt = `User's problem: "${userProblem}". Provide a specific Islamic solution and Dua.`;
    const result = await modelJson.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    return null;
  }
};

// --- ৬. চ্যাটবট (আগের ফাংশন) ---
export const startIslamicChat = async (history: any[], msg: string) => {
  try {
    const chat = model.startChat({
      history: history,
      systemInstruction: {
        role: "system",
        parts: [
          {
            text: "You are a helpful Islamic Assistant named 'দ্বীনী বন্ধু'. Reply in Bengali.",
          },
        ],
      },
    });
    const result = await chat.sendMessage(msg);
    return result.response.text();
  } catch (error) {
    return "দুঃখিত, সার্ভারে সমস্যা হচ্ছে।";
  }
};
