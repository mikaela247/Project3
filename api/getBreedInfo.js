export default async function handler(req, res) {
  const { selectedBreed } = req.query;
  const apiKey = process.env.GEMINI_API_KEY;

  const prompt = `Provide information about the breed: ${selectedBreed}. Start with the breed name in uppercase. Then give a short description in sentence case. List key traits using bullet points. End with one fun fact, clearly labeled.`;

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    const data = await response.json();
    const finalResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini.";

    res.status(200).json({ message: finalResponse });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ message: "No response at the moment. Please retry." });
  }
}
