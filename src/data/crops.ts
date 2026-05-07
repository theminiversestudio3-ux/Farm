export interface Activity {
  week: number;
  activity: string;
  description: string;
  expectedDisease?: string;
  diseaseSolution?: string;
}

export interface Crop {
  id: string;
  name: string;
  iconName: string;
  profitPerAcre: number;
  seedRatePerAcre: number;
  spacing: string;
  plantsPerAcre: number;
  fertilizerPerAcre: {
    urea: number;
    dap: number;
    mop: number;
  };
  expectedYieldPerAcre: number;
  growthPeriodDays: number;
  idealSowingWindow: number[]; // e.g. [6, 7] for June-July
  activities: Activity[];
}

export const crops: Crop[] = [
  {
    id: "soybean",
    name: "Soybean",
    iconName: "Sprout",
    profitPerAcre: 25000,
    seedRatePerAcre: 30,
    spacing: "45cm x 10cm",
    plantsPerAcre: 88888,
    fertilizerPerAcre: { urea: 25, dap: 50, mop: 20 },
    expectedYieldPerAcre: 8,
    growthPeriodDays: 100,
    idealSowingWindow: [6, 7], // June, July
    activities: [
      { week: 1, activity: "sowing_land_prep", description: "soybean_wk1_desc" },
      { week: 3, activity: "weed_control", description: "soybean_wk3_desc" },
      { week: 6, activity: "flowering_irrigation", description: "soybean_wk6_desc" },
      { week: 14, activity: "harvesting", description: "soybean_wk14_desc" }
    ]
  },
  {
    id: "cotton",
    name: "Cotton",
    iconName: "Sprout",
    profitPerAcre: 35000,
    seedRatePerAcre: 2,
    spacing: "90cm x 60cm",
    plantsPerAcre: 7400,
    fertilizerPerAcre: { urea: 100, dap: 50, mop: 25 },
    expectedYieldPerAcre: 10,
    growthPeriodDays: 160,
    idealSowingWindow: [5, 6], // May, June
    activities: [
      { week: 1, activity: "sowing", description: "cotton_wk1" },
      { week: 4, activity: "fertilizer", description: "cotton_wk4" },
      { week: 10, activity: "pest_control", description: "cotton_wk10" },
      { week: 22, activity: "harvesting", description: "cotton_wk22" }
    ]
  },
  {
    id: "pigeon_pea",
    name: "Pigeon Pea (Tur)",
    iconName: "Sprout",
    profitPerAcre: 30000,
    seedRatePerAcre: 8,
    spacing: "60cm x 20cm",
    plantsPerAcre: 33000,
    fertilizerPerAcre: { urea: 20, dap: 50, mop: 0 },
    expectedYieldPerAcre: 6,
    growthPeriodDays: 150,
    idealSowingWindow: [6, 7],
    activities: [
      { week: 1, activity: "sowing", description: "pigeon_wk1" },
      { week: 5, activity: "weeding", description: "pigeon_wk5" },
      { week: 12, activity: "pest_control", description: "pigeon_wk12" },
      { week: 21, activity: "harvesting", description: "pigeon_wk21" }
    ]
  },
  {
    id: "wheat",
    name: "Wheat",
    iconName: "Sprout",
    profitPerAcre: 22000,
    seedRatePerAcre: 40,
    spacing: "22.5cm row",
    plantsPerAcre: 150000,
    fertilizerPerAcre: { urea: 100, dap: 50, mop: 20 },
    expectedYieldPerAcre: 18,
    growthPeriodDays: 130,
    idealSowingWindow: [10, 11, 12], // Oct, Nov, Dec
    activities: [
      { week: 1, activity: "sowing", description: "wheat_wk1" },
      { week: 3, activity: "irrigation_cri", description: "wheat_wk3" },
      { week: 8, activity: "top_dressing", description: "wheat_wk8" },
      { week: 18, activity: "harvesting", description: "wheat_wk18" }
    ]
  },
  {
    id: "chickpea",
    name: "Chickpea (Chana)",
    iconName: "Sprout",
    profitPerAcre: 28000,
    seedRatePerAcre: 30,
    spacing: "30cm x 10cm",
    plantsPerAcre: 130000,
    fertilizerPerAcre: { urea: 20, dap: 50, mop: 0 },
    expectedYieldPerAcre: 8,
    growthPeriodDays: 110,
    idealSowingWindow: [10, 11],
    activities: [
      { week: 1, activity: "sowing", description: "chickpea_wk1" },
      { week: 6, activity: "nipping", description: "chickpea_wk6" },
      { week: 9, activity: "pod_borer_control", description: "chickpea_wk9" },
      { week: 15, activity: "harvesting", description: "chickpea_wk15" }
    ]
  },
  {
    id: "paddy",
    name: "Paddy (Rice)",
    iconName: "Sprout",
    profitPerAcre: 35000,
    seedRatePerAcre: 20,
    spacing: "20cm x 15cm",
    plantsPerAcre: 133000,
    fertilizerPerAcre: { urea: 100, dap: 50, mop: 25 },
    expectedYieldPerAcre: 25,
    growthPeriodDays: 120,
    idealSowingWindow: [6, 7],
    activities: [
      { week: 1, activity: "sowing", description: "paddy_wk1" },
      { week: 4, activity: "transplanting", description: "paddy_wk4" },
      { week: 8, activity: "fertilizer", description: "paddy_wk8" },
      { week: 17, activity: "harvesting", description: "paddy_wk17" }
    ]
  },
  {
    id: "potato",
    name: "Potato",
    iconName: "Sprout",
    profitPerAcre: 40000,
    seedRatePerAcre: 1000,
    spacing: "60cm x 20cm",
    plantsPerAcre: 33000,
    fertilizerPerAcre: { urea: 150, dap: 100, mop: 100 },
    expectedYieldPerAcre: 100,
    growthPeriodDays: 90,
    idealSowingWindow: [10, 11],
    activities: [
      { week: 1, activity: "sowing", description: "potato_wk1" },
      { week: 5, activity: "earthing_up", description: "potato_wk5" },
      { week: 8, activity: "irrigation_cri", description: "potato_wk8" },
      { week: 13, activity: "harvesting", description: "potato_wk13" }
    ]
  },
  {
    id: "maize",
    name: "Maize (Corn)",
    iconName: "Sprout",
    profitPerAcre: 25000,
    seedRatePerAcre: 8,
    spacing: "60cm x 25cm",
    plantsPerAcre: 26000,
    fertilizerPerAcre: { urea: 120, dap: 50, mop: 30 },
    expectedYieldPerAcre: 20,
    growthPeriodDays: 100,
    idealSowingWindow: [6, 7],
    activities: [
      { week: 1, activity: "sowing", description: "maize_wk1" },
      { week: 4, activity: "weed_control", description: "maize_wk4" },
      { week: 8, activity: "flowering_irrigation", description: "maize_wk8" },
      { week: 14, activity: "harvesting", description: "maize_wk14" }
    ]
  },
  {
    id: "mustard",
    name: "Mustard",
    iconName: "Sprout",
    profitPerAcre: 30000,
    seedRatePerAcre: 2,
    spacing: "30cm x 10cm",
    plantsPerAcre: 130000,
    fertilizerPerAcre: { urea: 60, dap: 40, mop: 0 },
    expectedYieldPerAcre: 8,
    growthPeriodDays: 120,
    idealSowingWindow: [10, 11],
    activities: [
      { week: 1, activity: "sowing", description: "mustard_wk1" },
      { week: 4, activity: "thinning", description: "mustard_wk4" },
      { week: 8, activity: "flowering_irrigation", description: "mustard_wk8" },
      { week: 16, activity: "harvesting", description: "mustard_wk16" }
    ]
  },
  {
    id: "tomato",
    name: "Tomato",
    iconName: "Sprout",
    profitPerAcre: 50000,
    seedRatePerAcre: 0.1,
    spacing: "60cm x 45cm",
    plantsPerAcre: 14800,
    fertilizerPerAcre: { urea: 100, dap: 50, mop: 50 },
    expectedYieldPerAcre: 120,
    growthPeriodDays: 90,
    idealSowingWindow: [6, 7, 8, 9, 10, 11],
    activities: [
      { week: 1, activity: "sowing", description: "tomato_sowing" },
      { week: 4, activity: "weed_control", description: "tomato_weeding" },
      { week: 13, activity: "harvesting", description: "tomato_harvesting" }
    ]
  },
  {
    id: "onion",
    name: "Onion",
    iconName: "Sprout",
    profitPerAcre: 60000,
    seedRatePerAcre: 4,
    spacing: "15cm x 10cm",
    plantsPerAcre: 260000,
    fertilizerPerAcre: { urea: 100, dap: 50, mop: 50 },
    expectedYieldPerAcre: 100,
    growthPeriodDays: 120,
    idealSowingWindow: [10, 11],
    activities: [
      { week: 1, activity: "sowing", description: "onion_sowing" },
      { week: 4, activity: "weed_control", description: "onion_weeding" },
      { week: 17, activity: "harvesting", description: "onion_harvesting" }
    ]
  },
  {
    id: "garlic",
    name: "Garlic",
    iconName: "Sprout",
    profitPerAcre: 70000,
    seedRatePerAcre: 200,
    spacing: "15cm x 10cm",
    plantsPerAcre: 260000,
    fertilizerPerAcre: { urea: 100, dap: 50, mop: 50 },
    expectedYieldPerAcre: 40,
    growthPeriodDays: 140,
    idealSowingWindow: [10, 11],
    activities: [
      { week: 1, activity: "sowing", description: "garlic_sowing" },
      { week: 4, activity: "weed_control", description: "garlic_weeding" },
      { week: 20, activity: "harvesting", description: "garlic_harvesting" }
    ]
  },
  {
    id: "cabbage",
    name: "Cabbage",
    iconName: "Sprout",
    profitPerAcre: 45000,
    seedRatePerAcre: 0.5,
    spacing: "45cm x 45cm",
    plantsPerAcre: 19700,
    fertilizerPerAcre: { urea: 120, dap: 50, mop: 50 },
    expectedYieldPerAcre: 150,
    growthPeriodDays: 90,
    idealSowingWindow: [9, 10, 11],
    activities: [
      { week: 1, activity: "sowing", description: "cabbage_sowing" },
      { week: 4, activity: "weed_control", description: "cabbage_weeding" },
      { week: 13, activity: "harvesting", description: "cabbage_harvesting" }
    ]
  },
  {
    id: "cauliflower",
    name: "Cauliflower",
    iconName: "Sprout",
    profitPerAcre: 50000,
    seedRatePerAcre: 0.5,
    spacing: "60cm x 45cm",
    plantsPerAcre: 14800,
    fertilizerPerAcre: { urea: 120, dap: 50, mop: 50 },
    expectedYieldPerAcre: 100,
    growthPeriodDays: 90,
    idealSowingWindow: [9, 10, 11],
    activities: [
      { week: 1, activity: "sowing", description: "cauliflower_sowing" },
      { week: 4, activity: "weed_control", description: "cauliflower_weeding" },
      { week: 13, activity: "harvesting", description: "cauliflower_harvesting" }
    ]
  },
  {
    id: "brinjal",
    name: "Brinjal",
    iconName: "Sprout",
    profitPerAcre: 40000,
    seedRatePerAcre: 0.3,
    spacing: "60cm x 60cm",
    plantsPerAcre: 11100,
    fertilizerPerAcre: { urea: 100, dap: 50, mop: 50 },
    expectedYieldPerAcre: 120,
    growthPeriodDays: 120,
    idealSowingWindow: [6, 7],
    activities: [
      { week: 1, activity: "sowing", description: "brinjal_sowing" },
      { week: 4, activity: "weed_control", description: "brinjal_weeding" },
      { week: 17, activity: "harvesting", description: "brinjal_harvesting" }
    ]
  },
  {
    id: "okra",
    name: "Okra",
    iconName: "Sprout",
    profitPerAcre: 35000,
    seedRatePerAcre: 6,
    spacing: "45cm x 30cm",
    plantsPerAcre: 29600,
    fertilizerPerAcre: { urea: 80, dap: 40, mop: 40 },
    expectedYieldPerAcre: 50,
    growthPeriodDays: 90,
    idealSowingWindow: [2, 3, 6, 7],
    activities: [
      { week: 1, activity: "sowing", description: "okra_sowing" },
      { week: 4, activity: "weed_control", description: "okra_weeding" },
      { week: 13, activity: "harvesting", description: "okra_harvesting" }
    ]
  },
  {
    id: "carrot",
    name: "Carrot",
    iconName: "Sprout",
    profitPerAcre: 45000,
    seedRatePerAcre: 2.5,
    spacing: "30cm x 10cm",
    plantsPerAcre: 130000,
    fertilizerPerAcre: { urea: 60, dap: 40, mop: 40 },
    expectedYieldPerAcre: 100,
    growthPeriodDays: 100,
    idealSowingWindow: [9, 10],
    activities: [
      { week: 1, activity: "sowing", description: "carrot_sowing" },
      { week: 4, activity: "weed_control", description: "carrot_weeding" },
      { week: 14, activity: "harvesting", description: "carrot_harvesting" }
    ]
  },
  {
    id: "radish",
    name: "Radish",
    iconName: "Sprout",
    profitPerAcre: 30000,
    seedRatePerAcre: 4,
    spacing: "30cm x 10cm",
    plantsPerAcre: 130000,
    fertilizerPerAcre: { urea: 50, dap: 30, mop: 30 },
    expectedYieldPerAcre: 80,
    growthPeriodDays: 45,
    idealSowingWindow: [9, 10],
    activities: [
      { week: 1, activity: "sowing", description: "radish_sowing" },
      { week: 3, activity: "weed_control", description: "radish_weeding" },
      { week: 6, activity: "harvesting", description: "radish_harvesting" }
    ]
  },
  {
    id: "spinach",
    name: "Spinach",
    iconName: "Sprout",
    profitPerAcre: 25000,
    seedRatePerAcre: 12,
    spacing: "Broadcast",
    plantsPerAcre: 500000,
    fertilizerPerAcre: { urea: 40, dap: 20, mop: 20 },
    expectedYieldPerAcre: 40,
    growthPeriodDays: 40,
    idealSowingWindow: [9, 10, 11],
    activities: [
      { week: 1, activity: "sowing", description: "spinach_sowing" },
      { week: 3, activity: "weed_control", description: "spinach_weeding" },
      { week: 6, activity: "harvesting", description: "spinach_harvesting" }
    ]
  },
  {
    id: "chilli",
    name: "Chilli",
    iconName: "Sprout",
    profitPerAcre: 60000,
    seedRatePerAcre: 0.4,
    spacing: "60cm x 45cm",
    plantsPerAcre: 14800,
    fertilizerPerAcre: { urea: 120, dap: 50, mop: 50 },
    expectedYieldPerAcre: 40,
    growthPeriodDays: 150,
    idealSowingWindow: [6, 7],
    activities: [
      { week: 1, activity: "sowing", description: "chilli_sowing" },
      { week: 4, activity: "weed_control", description: "chilli_weeding" },
      { week: 21, activity: "harvesting", description: "chilli_harvesting" }
    ]
  },
  {
    id: "bell_pepper",
    name: "Bell Pepper",
    iconName: "Sprout",
    profitPerAcre: 70000,
    seedRatePerAcre: 0.4,
    spacing: "60cm x 45cm",
    plantsPerAcre: 14800,
    fertilizerPerAcre: { urea: 150, dap: 60, mop: 60 },
    expectedYieldPerAcre: 80,
    growthPeriodDays: 120,
    idealSowingWindow: [8, 9],
    activities: [
      { week: 1, activity: "sowing", description: "bell_pepper_sowing" },
      { week: 4, activity: "weed_control", description: "bell_pepper_weeding" },
      { week: 17, activity: "harvesting", description: "bell_pepper_harvesting" }
    ]
  },
  {
    id: "cucumber",
    name: "Cucumber",
    iconName: "Sprout",
    profitPerAcre: 40000,
    seedRatePerAcre: 1,
    spacing: "150cm x 60cm",
    plantsPerAcre: 4400,
    fertilizerPerAcre: { urea: 80, dap: 40, mop: 40 },
    expectedYieldPerAcre: 60,
    growthPeriodDays: 70,
    idealSowingWindow: [2, 3],
    activities: [
      { week: 1, activity: "sowing", description: "cucumber_sowing" },
      { week: 4, activity: "weed_control", description: "cucumber_weeding" },
      { week: 10, activity: "harvesting", description: "cucumber_harvesting" }
    ]
  },
  {
    id: "watermelon",
    name: "Watermelon",
    iconName: "Sprout",
    profitPerAcre: 50000,
    seedRatePerAcre: 1.5,
    spacing: "200cm x 100cm",
    plantsPerAcre: 2000,
    fertilizerPerAcre: { urea: 100, dap: 50, mop: 50 },
    expectedYieldPerAcre: 150,
    growthPeriodDays: 90,
    idealSowingWindow: [1, 2, 3],
    activities: [
      { week: 1, activity: "sowing", description: "watermelon_sowing" },
      { week: 4, activity: "weed_control", description: "watermelon_weeding" },
      { week: 13, activity: "harvesting", description: "watermelon_harvesting" }
    ]
  },
  {
    id: "muskmelon",
    name: "Muskmelon",
    iconName: "Sprout",
    profitPerAcre: 45000,
    seedRatePerAcre: 1.5,
    spacing: "150cm x 100cm",
    plantsPerAcre: 2600,
    fertilizerPerAcre: { urea: 80, dap: 40, mop: 40 },
    expectedYieldPerAcre: 80,
    growthPeriodDays: 85,
    idealSowingWindow: [1, 2, 3],
    activities: [
      { week: 1, activity: "sowing", description: "muskmelon_sowing" },
      { week: 4, activity: "weed_control", description: "muskmelon_weeding" },
      { week: 12, activity: "harvesting", description: "muskmelon_harvesting" }
    ]
  },
  {
    id: "pumpkin",
    name: "Pumpkin",
    iconName: "Sprout",
    profitPerAcre: 35000,
    seedRatePerAcre: 2,
    spacing: "200cm x 200cm",
    plantsPerAcre: 1000,
    fertilizerPerAcre: { urea: 60, dap: 30, mop: 30 },
    expectedYieldPerAcre: 120,
    growthPeriodDays: 100,
    idealSowingWindow: [6, 7],
    activities: [
      { week: 1, activity: "sowing", description: "pumpkin_sowing" },
      { week: 4, activity: "weed_control", description: "pumpkin_weeding" },
      { week: 14, activity: "harvesting", description: "pumpkin_harvesting" }
    ]
  },
  {
    id: "bitter_gourd",
    name: "Bitter Gourd",
    iconName: "Sprout",
    profitPerAcre: 40000,
    seedRatePerAcre: 2,
    spacing: "150cm x 100cm",
    plantsPerAcre: 2600,
    fertilizerPerAcre: { urea: 80, dap: 40, mop: 40 },
    expectedYieldPerAcre: 50,
    growthPeriodDays: 90,
    idealSowingWindow: [2, 3, 6, 7],
    activities: [
      { week: 1, activity: "sowing", description: "bitter_gourd_sowing" },
      { week: 4, activity: "weed_control", description: "bitter_gourd_weeding" },
      { week: 13, activity: "harvesting", description: "bitter_gourd_harvesting" }
    ]
  },
  {
    id: "bottle_gourd",
    name: "Bottle Gourd",
    iconName: "Sprout",
    profitPerAcre: 35000,
    seedRatePerAcre: 2,
    spacing: "200cm x 100cm",
    plantsPerAcre: 2000,
    fertilizerPerAcre: { urea: 80, dap: 40, mop: 40 },
    expectedYieldPerAcre: 100,
    growthPeriodDays: 90,
    idealSowingWindow: [2, 3, 6, 7],
    activities: [
      { week: 1, activity: "sowing", description: "bottle_gourd_sowing" },
      { week: 4, activity: "weed_control", description: "bottle_gourd_weeding" },
      { week: 13, activity: "harvesting", description: "bottle_gourd_harvesting" }
    ]
  },
  {
    id: "groundnut",
    name: "Groundnut",
    iconName: "Sprout",
    profitPerAcre: 35000,
    seedRatePerAcre: 40,
    spacing: "30cm x 10cm",
    plantsPerAcre: 130000,
    fertilizerPerAcre: { urea: 20, dap: 50, mop: 0 },
    expectedYieldPerAcre: 10,
    growthPeriodDays: 110,
    idealSowingWindow: [6, 7],
    activities: [
      { week: 1, activity: "sowing", description: "groundnut_sowing" },
      { week: 4, activity: "weed_control", description: "groundnut_weeding" },
      { week: 15, activity: "harvesting", description: "groundnut_harvesting" }
    ]
  },
  {
    id: "sunflower",
    name: "Sunflower",
    iconName: "Sprout",
    profitPerAcre: 25000,
    seedRatePerAcre: 4,
    spacing: "60cm x 30cm",
    plantsPerAcre: 22000,
    fertilizerPerAcre: { urea: 60, dap: 30, mop: 20 },
    expectedYieldPerAcre: 8,
    growthPeriodDays: 90,
    idealSowingWindow: [2, 3, 6, 7],
    activities: [
      { week: 1, activity: "sowing", description: "sunflower_sowing" },
      { week: 4, activity: "weed_control", description: "sunflower_weeding" },
      { week: 13, activity: "harvesting", description: "sunflower_harvesting" }
    ]
  },
  {
    id: "sesame",
    name: "Sesame",
    iconName: "Sprout",
    profitPerAcre: 20000,
    seedRatePerAcre: 2,
    spacing: "30cm x 10cm",
    plantsPerAcre: 130000,
    fertilizerPerAcre: { urea: 40, dap: 20, mop: 0 },
    expectedYieldPerAcre: 3,
    growthPeriodDays: 85,
    idealSowingWindow: [6, 7],
    activities: [
      { week: 1, activity: "sowing", description: "sesame_sowing" },
      { week: 4, activity: "weed_control", description: "sesame_weeding" },
      { week: 12, activity: "harvesting", description: "sesame_harvesting" }
    ]
  },
  {
    id: "lentil",
    name: "Lentil",
    iconName: "Sprout",
    profitPerAcre: 25000,
    seedRatePerAcre: 15,
    spacing: "30cm x 10cm",
    plantsPerAcre: 130000,
    fertilizerPerAcre: { urea: 20, dap: 40, mop: 0 },
    expectedYieldPerAcre: 6,
    growthPeriodDays: 110,
    idealSowingWindow: [10, 11],
    activities: [
      { week: 1, activity: "sowing", description: "lentil_sowing" },
      { week: 4, activity: "weed_control", description: "lentil_weeding" },
      { week: 15, activity: "harvesting", description: "lentil_harvesting" }
    ]
  },
  {
    id: "green_gram",
    name: "Green Gram",
    iconName: "Sprout",
    profitPerAcre: 22000,
    seedRatePerAcre: 8,
    spacing: "30cm x 10cm",
    plantsPerAcre: 130000,
    fertilizerPerAcre: { urea: 10, dap: 40, mop: 0 },
    expectedYieldPerAcre: 5,
    growthPeriodDays: 65,
    idealSowingWindow: [3, 4, 6, 7],
    activities: [
      { week: 1, activity: "sowing", description: "green_gram_sowing" },
      { week: 3, activity: "weed_control", description: "green_gram_weeding" },
      { week: 9, activity: "harvesting", description: "green_gram_harvesting" }
    ]
  },
  {
    id: "black_gram",
    name: "Black Gram",
    iconName: "Sprout",
    profitPerAcre: 24000,
    seedRatePerAcre: 8,
    spacing: "30cm x 10cm",
    plantsPerAcre: 130000,
    fertilizerPerAcre: { urea: 10, dap: 40, mop: 0 },
    expectedYieldPerAcre: 5,
    growthPeriodDays: 70,
    idealSowingWindow: [6, 7],
    activities: [
      { week: 1, activity: "sowing", description: "black_gram_sowing" },
      { week: 4, activity: "weed_control", description: "black_gram_weeding" },
      { week: 10, activity: "harvesting", description: "black_gram_harvesting" }
    ]
  },
  {
    id: "pearl_millet",
    name: "Pearl Millet",
    iconName: "Sprout",
    profitPerAcre: 15000,
    seedRatePerAcre: 2,
    spacing: "45cm x 15cm",
    plantsPerAcre: 59000,
    fertilizerPerAcre: { urea: 60, dap: 30, mop: 0 },
    expectedYieldPerAcre: 10,
    growthPeriodDays: 85,
    idealSowingWindow: [6, 7],
    activities: [
      { week: 1, activity: "sowing", description: "pearl_millet_sowing" },
      { week: 4, activity: "weed_control", description: "pearl_millet_weeding" },
      { week: 12, activity: "harvesting", description: "pearl_millet_harvesting" }
    ]
  },
  {
    id: "sorghum",
    name: "Sorghum",
    iconName: "Sprout",
    profitPerAcre: 18000,
    seedRatePerAcre: 4,
    spacing: "45cm x 15cm",
    plantsPerAcre: 59000,
    fertilizerPerAcre: { urea: 60, dap: 30, mop: 0 },
    expectedYieldPerAcre: 12,
    growthPeriodDays: 110,
    idealSowingWindow: [6, 7, 9, 10],
    activities: [
      { week: 1, activity: "sowing", description: "sorghum_sowing" },
      { week: 4, activity: "weed_control", description: "sorghum_weeding" },
      { week: 15, activity: "harvesting", description: "sorghum_harvesting" }
    ]
  },
  {
    id: "sugarcane",
    name: "Sugarcane",
    iconName: "Sprout",
    profitPerAcre: 80000,
    seedRatePerAcre: 2500,
    spacing: "90cm row",
    plantsPerAcre: 12000,
    fertilizerPerAcre: { urea: 250, dap: 100, mop: 100 },
    expectedYieldPerAcre: 400,
    growthPeriodDays: 365,
    idealSowingWindow: [1, 2, 10, 11],
    activities: [
      { week: 1, activity: "sowing", description: "sugarcane_sowing" },
      { week: 4, activity: "weed_control", description: "sugarcane_weeding" },
      { week: 52, activity: "harvesting", description: "sugarcane_harvesting" }
    ]
  },
  {
    id: "banana",
    name: "Banana",
    iconName: "Sprout",
    profitPerAcre: 100000,
    seedRatePerAcre: 1000,
    spacing: "1.8m x 1.8m",
    plantsPerAcre: 1200,
    fertilizerPerAcre: { urea: 200, dap: 100, mop: 200 },
    expectedYieldPerAcre: 150,
    growthPeriodDays: 300,
    idealSowingWindow: [6, 7, 8],
    activities: [
      { week: 1, activity: "sowing", description: "banana_sowing" },
      { week: 4, activity: "weed_control", description: "banana_weeding" },
      { week: 42, activity: "harvesting", description: "banana_harvesting" }
    ]
  },
  {
    id: "papaya",
    name: "Papaya",
    iconName: "Sprout",
    profitPerAcre: 90000,
    seedRatePerAcre: 0.1,
    spacing: "1.8m x 1.8m",
    plantsPerAcre: 1200,
    fertilizerPerAcre: { urea: 200, dap: 100, mop: 200 },
    expectedYieldPerAcre: 150,
    growthPeriodDays: 270,
    idealSowingWindow: [6, 7, 9, 10],
    activities: [
      { week: 1, activity: "sowing", description: "papaya_sowing" },
      { week: 4, activity: "weed_control", description: "papaya_weeding" },
      { week: 38, activity: "harvesting", description: "papaya_harvesting" }
    ]
  },
  {
    id: "castor",
    name: "Castor",
    iconName: "Sprout",
    profitPerAcre: 35000,
    seedRatePerAcre: 2,
    spacing: "90cm x 60cm",
    plantsPerAcre: 7400,
    fertilizerPerAcre: { urea: 80, dap: 40, mop: 0 },
    expectedYieldPerAcre: 10,
    growthPeriodDays: 150,
    idealSowingWindow: [6, 7],
    activities: [
      { week: 1, activity: "sowing", description: "castor_sowing" },
      { week: 4, activity: "weed_control", description: "castor_weeding" },
      { week: 21, activity: "harvesting", description: "castor_harvesting" }
    ]
  }
];
