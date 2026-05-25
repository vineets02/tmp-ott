const campaignPlannerModel = require("../models/campaignPlannerModel");
const movieModel = require("../models/movieModel");

// Get or initialize a marketing plan for a movie
const getMarketingPlan = async (req, res) => {
  try {
    const { movieId } = req.params;
    const movie = await movieModel.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    let plan = await campaignPlannerModel.findOne({ movie: movieId });

    if (!plan) {
      const releaseDate = movie.releaseDate || new Date();
      
      // Seed default milestones relative to release date
      const defaultMilestones = [
        {
          phase: "teaser",
          task: "Upload Teaser Video & schedule Spotlight Banner on Homepage",
          scheduledDate: new Date(new Date(releaseDate).getTime() - 3 * 24 * 60 * 60 * 1000), // T-3 days
          status: "pending"
        },
        {
          phase: "teaser",
          task: "Send 'Coming Soon' Push Notification Alert to all active users",
          scheduledDate: new Date(new Date(releaseDate).getTime() - 1 * 24 * 60 * 60 * 1000), // T-1 day
          status: "pending"
        },
        {
          phase: "launch",
          task: "Launch Day Blast: Send System Notification with watch link",
          scheduledDate: new Date(releaseDate),
          status: "pending"
        },
        {
          phase: "launch",
          task: "Generate Launch Promotion Promo Code (e.g. coupon code)",
          scheduledDate: new Date(releaseDate),
          status: "pending"
        },
        {
          phase: "quotes",
          task: "Generate & share AI Dialogue Post 1:1 on Instagram feed",
          scheduledDate: new Date(new Date(releaseDate).getTime() + 1 * 24 * 60 * 60 * 1000), // T+1 day
          status: "pending"
        },
        {
          phase: "quotes",
          task: "Post Instagram Story 9:16 showcasing key dialogue",
          scheduledDate: new Date(new Date(releaseDate).getTime() + 2 * 24 * 60 * 60 * 1000), // T+2 days
          status: "pending"
        },
        {
          phase: "reviews",
          task: "Share viewer testimonial & rating cards on social channels",
          scheduledDate: new Date(new Date(releaseDate).getTime() + 4 * 24 * 60 * 60 * 1000), // T+4 days
          status: "pending"
        }
      ];

      plan = new campaignPlannerModel({
        movie: movieId,
        milestones: defaultMilestones,
        generatedAssets: []
      });

      await plan.save();
    }

    res.status(200).json({ success: true, plan });
  } catch (error) {
    console.error("Error getting marketing plan:", error);
    res.status(500).json({ success: false, message: "Error loading marketing planner", error: error.message });
  }
};

// Toggle a milestone checklist item status
const updateMilestoneStatus = async (req, res) => {
  try {
    const { planId, milestoneId } = req.body;
    const plan = await campaignPlannerModel.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }

    const milestone = plan.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({ success: false, message: "Milestone task not found" });
    }

    milestone.status = milestone.status === "completed" ? "pending" : "completed";
    await plan.save();

    res.status(200).json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating status", error: error.message });
  }
};

// Generate dialogues/quotes templates for movie using OpenAI GPT
const suggestDialogue = async (req, res) => {
  try {
    const { movieId } = req.params;
    const movie = await movieModel.findById(movieId).populate("category");
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    const genre = movie.category?.name || "Premium Movie";
    
    // Catchy static taglines as fallback
    const fallbackSuggestions = [
      `"Every choice defines your legacy. Witness the ultimate saga."`,
      `"In this game, there are no survivors. Only legends."`,
      `"Some stories are written in history. Ours is written in blood."`,
      `"They wanted a hero. They got a force of nature."`,
      `"The truth will be streaming. Are you ready for the thrill?"`,
      `"Experience ${movie.title} — Directed by ${movie.director}. Out Now!"`,
      `"From the depth of mysteries comes the year's greatest ${genre}."`
    ];

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ success: true, suggestions: fallbackSuggestions, info: "Demo Mode" });
    }

    const axios = require("axios");
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional movie copywriter. Return a JSON array containing 5 extremely punchy, high-impact marketing taglines or quotes suitable for social media promotion. Return ONLY the JSON array without any markdown wrappers."
          },
          {
            role: "user",
            content: `Movie Title: ${movie.title}\nDirector: ${movie.director}\nGenre: ${genre}\nSynopsis: ${movie.description}`
          }
        ],
        temperature: 0.8
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    let suggestions = [];
    try {
      const text = response.data.choices[0].message.content.trim().replace(/```json/g, "").replace(/```/g, "");
      suggestions = JSON.parse(text);
    } catch (e) {
      suggestions = fallbackSuggestions;
    }

    res.status(200).json({ success: true, suggestions });
  } catch (error) {
    console.error("OpenAI Dialogue suggestions error:", error.message);
    res.status(200).json({ success: true, suggestions: fallbackSuggestions });
  }
};

// Save generated creative PNG/Base64 to DB assets log
const saveCreativeAsset = async (req, res) => {
  try {
    const { movieId, imageUrl, type } = req.body;
    const plan = await campaignPlannerModel.findOne({ movie: movieId });
    if (!plan) {
      return res.status(404).json({ success: false, message: "Marketing plan not active for this movie" });
    }

    plan.generatedAssets.push({ imageUrl, type });
    await plan.save();

    res.status(200).json({ success: true, assets: plan.generatedAssets });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving asset", error: error.message });
  }
};

// Generate AI Stylized Poster using OpenAI DALL-E 3 & GPT Vision description
const generateAIPoster = async (req, res) => {
  try {
    const { imageBase64, prompt } = req.body;
    if (!imageBase64 || !prompt) {
      return res.status(400).json({ success: false, message: "Image and prompt are required" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Sandbox fallback mode
      return res.status(200).json({ 
        success: true, 
        demo: true,
        imageUrl: imageBase64, 
        message: "OPENAI_API_KEY not configured. Running in sandbox simulator mode." 
      });
    }

    const axios = require("axios");

    // Phase 1: Describe the uploaded scene photo using GPT-4o-mini (Vision)
    console.log("Analyzing scene still using GPT Vision...");
    const visionResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Describe the subjects, layout, characters, and composition of this movie scene in under 50 words to be used for an image generation prompt."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64 // Handles base64 data url directly
                }
              }
            ]
          }
        ],
        max_tokens: 100
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    const sceneDescription = visionResponse.data?.choices?.[0]?.message?.content || "a movie scene";
    console.log("Scene description compiled:", sceneDescription);

    // Phase 2: Create matching image using Hugging Face Stable Diffusion (Free, bypasses DALL-E subscription limits)
    console.log("Generating stylized poster using Hugging Face Stable Diffusion...");
    const hfResponse = await axios.post(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        inputs: `A movie promo graphic displaying: ${sceneDescription}. Artistic style: ${prompt}. Cinematic lighting, highly detailed poster, vivid colors, no text or overlays in the image itself.`
      },
      {
        responseType: "arraybuffer",
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    if (hfResponse.data) {
      const base64Data = Buffer.from(hfResponse.data).toString("base64");
      const outputBase64 = `data:image/png;base64,${base64Data}`;
      return res.status(200).json({ success: true, imageUrl: outputBase64 });
    } else {
      return res.status(500).json({ success: false, message: "Invalid response from Hugging Face Stable Diffusion" });
    }

  } catch (error) {
    console.error("OpenAI Poster Generation error:", error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: "AI Generation failed", 
      error: error.response?.data?.error?.message || error.message 
    });
  }
};

module.exports = {
  getMarketingPlan,
  updateMilestoneStatus,
  suggestDialogue,
  saveCreativeAsset,
  generateAIPoster
};
