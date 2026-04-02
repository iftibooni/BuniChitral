// Data Seeding Script for BuniChitral
// Run this once in browser console: seedDatabase()

async function seedDatabase() {
    try {
        console.log("🌱 Starting database seeding...");

        // Sample Guides Data - EXPANDED
        const guides = [
            {
                id: "guide1",
                name: "Ahmed Hassan",
                photo: "https://via.placeholder.com/150?text=Ahmed",
                languages: ["Urdu", "English", "Khowar"],
                experience: 8,
                rating: 4.8,
                reviews: 24,
                bio: "Experienced mountain guide with 8 years in Chitral tourism",
                specialization: ["Mountain Trekking", "Cultural tours", "Photography"],
                pricePerDay: 3000,
                availability: true
            },
            {
                id: "guide2",
                name: "Fatima Khan",
                photo: "https://via.placeholder.com/150?text=Fatima",
                languages: ["Urdu", "English"],
                experience: 5,
                rating: 4.9,
                reviews: 18,
                bio: "Local guide passionate about Chitral's culture and heritage",
                specialization: ["Cultural immersion", "Local food tours", "Village visits"],
                pricePerDay: 2500,
                availability: true
            },
            {
                id: "guide3",
                name: "Ibrahim Ali",
                photo: "https://via.placeholder.com/150?text=Ibrahim",
                languages: ["Urdu", "English", "Dari"],
                experience: 12,
                rating: 4.7,
                reviews: 42,
                bio: "Senior guide specializing in adventure and off-beat routes",
                specialization: ["Adventure sports", "Rock climbing", "Mountaineering"],
                pricePerDay: 4000,
                availability: true
            },
            {
                id: "guide4",
                name: "Zainab Malik",
                photo: "https://via.placeholder.com/150?text=Zainab",
                languages: ["Urdu", "English"],
                experience: 6,
                rating: 4.6,
                reviews: 15,
                bio: "Nature lover and wildlife enthusiast",
                specialization: ["Wildlife tours", "Bird watching", "Nature photography"],
                pricePerDay: 2800,
                availability: true
            },
            {
                id: "guide5",
                name: "Rashid Ahmad",
                photo: "https://via.placeholder.com/150?text=Rashid",
                languages: ["Urdu", "English", "Punjabi"],
                experience: 10,
                rating: 4.9,
                reviews: 35,
                bio: "Expert in high-altitude Himalayan expeditions",
                specialization: ["Expeditions", "Winter trekking", "Survival training"],
                pricePerDay: 5000,
                availability: true
            },
            {
                id: "guide6",
                name: "Sara Ali",
                photo: "https://via.placeholder.com/150?text=Sara",
                languages: ["Urdu", "English", "Arabic"],
                experience: 7,
                rating: 4.8,
                reviews: 22,
                bio: "Specialized in women-only and family tours",
                specialization: ["Family trips", "Women tours", "Wellness retreats"],
                pricePerDay: 2900,
                availability: true
            },
            {
                id: "guide7",
                name: "Malik Shah",
                photo: "https://via.placeholder.com/150?text=Malik",
                languages: ["Urdu", "English", "Khowar"],
                experience: 15,
                rating: 4.9,
                reviews: 58,
                bio: "Most experienced guide with government certification",
                specialization: ["Historical tours", "Archaeological sites", "Heritage walks"],
                pricePerDay: 3500,
                availability: true
            },
            {
                id: "guide8",
                name: "Nabeel Hassan",
                photo: "https://via.placeholder.com/150?text=Nabeel",
                languages: ["Urdu", "English"],
                experience: 4,
                rating: 4.7,
                reviews: 12,
                bio: "Young enthusiastic guide, great with adventure seekers",
                specialization: ["Hiking", "Camping", "Paragliding tours"],
                pricePerDay: 2200,
                availability: true
            }
        ];

        // Sample Travel Plans Data - EXPANDED
        const plans = [
            {
                id: "plan1",
                name: "Chitral Valley Explorer",
                description: "A 3-day cultural and scenic tour of Chitral Valley",
                duration: "3 days",
                price: 8000,
                difficulty: "Easy",
                highlights: ["Tirich Mir views", "Kajar Valley", "Local markets", "Traditional meals"],
                itinerary: [
                    "Day 1: Arrive in Chitral, visit old fort and bazaar",
                    "Day 2: Excursion to Kajar Valley",
                    "Day 3: Mountain viewpoints and return"
                ],
                maxGroup: 6,
                image: "https://via.placeholder.com/300?text=Chitral+Valley"
            },
            {
                id: "plan2",
                name: "Tirich Mir Base Camp Trek",
                description: "Adventure trek to the base camp of Pakistan's 4th highest peak",
                duration: "5 days",
                price: 15000,
                difficulty: "Hard",
                highlights: ["Tirich Mir Base Camp", "Alpine meadows", "Mountain views", "Professional guides"],
                itinerary: [
                    "Day 1-2: Trek to Camp 1",
                    "Day 3: Acclimatization day",
                    "Day 4: Trek to Base Camp",
                    "Day 5: Return trek"
                ],
                maxGroup: 4,
                image: "https://via.placeholder.com/300?text=Tirich+Mir"
            },
            {
                id: "plan3",
                name: "Bumburet Valley Cultural Tour",
                description: "Immerse yourself in Kalasha culture in the scenic Bumburet Valley",
                duration: "2 days",
                price: 5500,
                difficulty: "Easy",
                highlights: ["Kalasha villages", "Traditional crafts", "Local cuisine", "Photography"],
                itinerary: [
                    "Day 1: Visit Bumburet villages, meet Kalasha people",
                    "Day 2: Craft workshops and traditional meals"
                ],
                maxGroup: 8,
                image: "https://via.placeholder.com/300?text=Bumburet"
            },
            {
                id: "plan4",
                name: "Chitral Photography Expedition",
                description: "Capture the beauty of Chitral with professional photography guide",
                duration: "4 days",
                price: 12000,
                difficulty: "Medium",
                highlights: ["Golden hour shots", "Wildlife photography", "Cultural portraits", "Sunset views"],
                itinerary: [
                    "Day 1: Foundation photography in valley",
                    "Day 2: Wildlife and nature photography",
                    "Day 3: Cultural and portrait photography",
                    "Day 4: Advanced techniques and favorites retake"
                ],
                maxGroup: 5,
                image: "https://via.placeholder.com/300?text=Photography"
            },
            {
                id: "plan5",
                name: "Family Adventure Package",
                description: "Perfect for families - safe and enjoyable Chitral experience",
                duration: "3 days",
                price: 9500,
                difficulty: "Easy",
                highlights: ["Water activities", "Picnics", "Local games", "Kids-friendly routes"],
                itinerary: [
                    "Day 1: Valley exploration and picnic",
                    "Day 2: Water sports and swimming",
                    "Day 3: Folk activities and cultural experience"
                ],
                maxGroup: 10,
                image: "https://via.placeholder.com/300?text=Family+Fun"
            },
            {
                id: "plan6",
                name: "Shandur Top & Siri Paye Trek",
                description: "Epic 4-day trek across two beautiful mountain passes",
                duration: "4 days",
                price: 10500,
                difficulty: "Hard",
                highlights: ["Shandur Pass", "Polo festival (summer)", "Panoramic views", "Alpine lakes"],
                itinerary: [
                    "Day 1: Drive to Shandur Top base",
                    "Day 2: Trek to Shandur Pass",
                    "Day 3: Traverse to Siri Paye",
                    "Day 4: Return descent"
                ],
                maxGroup: 6,
                image: "https://via.placeholder.com/300?text=Shandur+Top"
            },
            {
                id: "plan7",
                name: "Rumbur Valley Homestay Experience",
                description: "Live like a local - stay in traditional Kalasha homes",
                duration: "2 days",
                price: 6000,
                difficulty: "Easy",
                highlights: ["Homestay accommodation", "Traditional cooking", "Local ceremonies", "Handicraft lessons"],
                itinerary: [
                    "Day 1: Check-in and orientation",
                    "Day 2: Full day cultural immersion"
                ],
                maxGroup: 4,
                image: "https://via.placeholder.com/300?text=Homestay"
            },
            {
                id: "plan8",
                name: "Mastuj & Lower Chitral Tour",
                description: "Explore the lesser-known gems of lower Chitral region",
                duration: "3 days",
                price: 7500,
                difficulty: "Easy",
                highlights: ["Mastuj Valley", "Ayun Village", "Local bazaars", "River activities"],
                itinerary: [
                    "Day 1: Travel to Mastuj",
                    "Day 2: Explore Ayun & villages",
                    "Day 3: River activities & return"
                ],
                maxGroup: 8,
                image: "https://via.placeholder.com/300?text=Mastuj"
            },
            {
                id: "plan9",
                name: "Winter Wonderland - Snow Trek",
                description: "Experience Chitral's magical snow-covered landscapes",
                duration: "4 days",
                price: 11000,
                difficulty: "Hard",
                highlights: ["Snow camps", "Frozen lakes", "Winter wildlife", "Hot springs"],
                itinerary: [
                    "Day 1-2: Acclimatization",
                    "Day 3: Snow trek and camp",
                    "Day 4: Return"
                ],
                maxGroup: 5,
                image: "https://via.placeholder.com/300?text=Winter+Trek"
            },
            {
                id: "plan10",
                name: "Ayun Bridge & River Expedition",
                description: "Thrilling white-water rafting and bridge walks adventure",
                duration: "2 days",
                price: 5000,
                difficulty: "Medium",
                highlights: ["White-water rafting", "Historic bridges", "River kayaking", "Scenic camping"],
                itinerary: [
                    "Day 1: Rafting expedition",
                    "Day 2: Bridge walks and return"
                ],
                maxGroup: 10,
                image: "https://via.placeholder.com/300?text=River"
            }
        ];

        // Add guides to Firestore
        console.log("📍 Adding guides...");
        for (const guide of guides) {
            await db.collection("guides").doc(guide.id).set(guide);
        }
        console.log(`✅ Added ${guides.length} guides`);

        // Add plans to Firestore
        console.log("🗺️ Adding travel plans...");
        for (const plan of plans) {
            await db.collection("plans").doc(plan.id).set(plan);
        }
        console.log(`✅ Added ${plans.length} travel plans`);

        // Create reviews collection with sample data
        console.log("⭐ Adding sample reviews...");
        const reviews = [
            {
                guideId: "guide1",
                author: "John Smith",
                rating: 5,
                comment: "Ahmed was an excellent guide! Very knowledgeable about Chitral.",
                date: new Date(),
                verified: true
            },
            {
                guideId: "guide2",
                author: "Sarah Johnson",
                rating: 5,
                comment: "Fatima made our trip unforgettable. Highly recommended!",
                date: new Date(),
                verified: true
            },
            {
                guideId: "guide3",
                author: "Michael Brown",
                rating: 5,
                comment: "Ibrahim's expertise on mountain climbing is unmatched!",
                date: new Date(),
                verified: true
            }
        ];

        for (const review of reviews) {
            await db.collection("reviews").add(review);
        }
        console.log(`✅ Added ${reviews.length} sample reviews`);

        console.log("🎉 Database seeding completed successfully!");
        alert("✅ Database seeded successfully!\n\n" + guides.length + " Guides\n" + plans.length + " Travel Plans\n" + reviews.length + " Reviews");

    } catch (error) {
        console.error("❌ Error seeding database:", error);
        alert("❌ Error: " + error.message);
    }
}

// Run this in the browser console to seed the database
// Open your website and in console type: seedDatabase()
