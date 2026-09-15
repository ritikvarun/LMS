import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import Course from "./models/courseModel.js";
import User from "./models/userModel.js";

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to DB");

    // Find any educator user to associate with courses
    let creator = await User.findOne({ role: "educator" });
    if (!creator) {
      creator = await User.findOne();
    }
    const creatorId = creator ? creator._id : new mongoose.Types.ObjectId();

    // Check if "RWA 10th Bihar Board Toppers बैच" already exists
    const existing = await Course.findOne({ title: "RWA 10th Bihar Board Toppers बैच" });
    if (existing) {
      console.log("Course already exists, updating...");
      await Course.deleteOne({ _id: existing._id });
    }

    const course1 = new Course({
      title: "RWA 10th Bihar Board Toppers बैच",
      subTitle: "Complete Bihar Board Class 10th preparation with live and recorded classes",
      description: "Comprehensive batch for Bihar Board matric toppers with doubt classes, mock tests and PDF notes.",
      category: "Bihar Board 10th RWA",
      level: "Beginner",
      price: 0,
      isFree: true,
      isPublished: true,
      telegramLink: "https://t.me/bihar_board_toppers",
      creator: creatorId,
      thumbnail: "https://res.cloudinary.com/dfo95t5up/image/upload/v1789152359/crwyi06tg7jq3yixil3f.jpg",
      subjects: [
        {
          title: "Maths 10th Bihar Board",
          thumbnail: "https://res.cloudinary.com/dfo95t5up/image/upload/v1789152359/crwyi06tg7jq3yixil3f.jpg",
          chapters: [
            {
              title: "Maths 10th Bihar Board",
              thumbnail: "https://res.cloudinary.com/dfo95t5up/image/upload/v1789152359/crwyi06tg7jq3yixil3f.jpg",
              videos: [
                {
                  title: "Tense | Grammar",
                  videoUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
                  duration: "45:20",
                  thumbnail: "https://res.cloudinary.com/dfo95t5up/image/upload/v1789152359/crwyi06tg7jq3yixil3f.jpg"
                },
                {
                  title: "बहुपद Polynomial",
                  videoUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
                  duration: "52:10",
                  pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                  thumbnail: "https://res.cloudinary.com/dfo95t5up/image/upload/v1789152359/crwyi06tg7jq3yixil3f.jpg"
                },
                {
                  title: "बहुपद Polynomial - Class 02",
                  videoUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
                  duration: "48:30",
                  pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                  thumbnail: "https://res.cloudinary.com/dfo95t5up/image/upload/v1789152359/crwyi06tg7jq3yixil3f.jpg"
                },
                {
                  title: "बहुपद Polynomial - Objective Questions",
                  videoUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
                  duration: "40:15",
                  pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                  thumbnail: "https://res.cloudinary.com/dfo95t5up/image/upload/v1789152359/crwyi06tg7jq3yixil3f.jpg"
                }
              ]
            }
          ]
        },
        {
          title: "English 10th Bihar Board",
          thumbnail: "https://res.cloudinary.com/dfo95t5up/image/upload/v1789152359/crwyi06tg7jq3yixil3f.jpg",
          chapters: [
            {
              title: "Chapter 1: The Pace for Living",
              thumbnail: "https://res.cloudinary.com/dfo95t5up/image/upload/v1789152359/crwyi06tg7jq3yixil3f.jpg",
              videos: [
                {
                  title: "The Pace for Living - Summary & Explanation",
                  videoUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
                  duration: "38:40",
                  pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                }
              ]
            }
          ]
        },
        {
          title: "Science 10th Bihar Board",
          thumbnail: "https://res.cloudinary.com/dfo95t5up/image/upload/v1789152359/crwyi06tg7jq3yixil3f.jpg",
          chapters: [
            {
              title: "Chapter 1: रासायनिक अभिक्रियाएँ एवं समीकरण",
              thumbnail: "https://res.cloudinary.com/dfo95t5up/image/upload/v1789152359/crwyi06tg7jq3yixil3f.jpg",
              videos: [
                {
                  title: "Chemical Reactions & Equations - Class 01",
                  videoUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
                  duration: "45:00",
                  pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                }
              ]
            }
          ]
        }
      ]
    });

    await course1.save();
    console.log("Seeded Course 1 successfully:", course1.title);

    // Course 2: Bihar Daroga
    const existing2 = await Course.findOne({ title: "बिहार दरोगा बहाली 2025 (दरोगा बैच)" });
    if (!existing2) {
      const course2 = new Course({
        title: "बिहार दरोगा बहाली 2025 (दरोगा बैच)",
        subTitle: "Free YouTube & App Course for Bihar SI & Daroga 2025",
        description: "Comprehensive preparation covering GS, General Science, Current Affairs and Maths.",
        category: "बिहार दरोगा बहाली 2025 (दरोगा बैच)",
        level: "Beginner",
        price: 0,
        isFree: true,
        isPublished: true,
        telegramLink: "https://t.me/bihar_daroga_toppers",
        creator: creatorId,
        thumbnail: "https://res.cloudinary.com/dfo95t5up/image/upload/v1789292606/zciueffmr6nqr2qfx2e9.png",
        subjects: [
          {
            title: "सामान्य अध्ययन (GS) Live",
            thumbnail: "https://res.cloudinary.com/dfo95t5up/image/upload/v1789292606/zciueffmr6nqr2qfx2e9.png",
            chapters: [
              {
                title: "भारतीय संविधान एवं राजव्यवस्था",
                thumbnail: "https://res.cloudinary.com/dfo95t5up/image/upload/v1789292606/zciueffmr6nqr2qfx2e9.png",
                videos: [
                  {
                    title: "संविधान सभा एवं प्रस्तावना",
                    videoUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
                    duration: "55:00",
                    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                  }
                ]
              }
            ]
          }
        ]
      });
      await course2.save();
      console.log("Seeded Course 2 successfully:", course2.title);
    }

    // Course 3: SSC Foundation
    const existing3 = await Course.findOne({ title: "SSC FOUNDATION BATCH (नायक बैच)" });
    if (!existing3) {
      const course3 = new Course({
        title: "SSC FOUNDATION BATCH (नायक बैच)",
        subTitle: "SSC CGL, CHSL, CPO, MTS Complete Foundation Preparation",
        description: "Zero to Hero level coverage of Maths, Reasoning, English, and GS.",
        category: "RWA SSC EXAMS",
        level: "Beginner",
        price: 0,
        isFree: true,
        isPublished: true,
        telegramLink: "https://t.me/rwa_ssc_exams",
        creator: creatorId,
        thumbnail: "https://res.cloudinary.com/dfo95t5up/image/upload/v1789152359/crwyi06tg7jq3yixil3f.jpg",
        subjects: [
          {
            title: "Maths Foundation Live",
            thumbnail: "https://res.cloudinary.com/dfo95t5up/image/upload/v1789152359/crwyi06tg7jq3yixil3f.jpg",
            chapters: [
              {
                title: "Number System & Calculation Speed",
                thumbnail: "https://res.cloudinary.com/dfo95t5up/image/upload/v1789152359/crwyi06tg7jq3yixil3f.jpg",
                videos: [
                  {
                    title: "Class 01: Unit Digit & Remainder Theorem",
                    videoUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
                    duration: "1:05:00",
                    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                  }
                ]
              }
            ]
          }
        ]
      });
      await course3.save();
      console.log("Seeded Course 3 successfully:", course3.title);
    }

    console.log("All seed courses created successfully!");
    process.exit(0);
  } catch (e) {
    console.error("Seed error:", e);
    process.exit(1);
  }
}

seed();
