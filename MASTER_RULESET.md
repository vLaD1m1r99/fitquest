# FITNESS TRACKER — MASTER RULESET
## READ THIS AT THE START OF EVERY SESSION

Last updated: 2026-03-08
Start date: 2026-03-09

---

## 1. USERS

### Vlada
- Male, 27 years old
- Height: 177cm
- Starting weight: 90.4kg (as of 2026-03-09)
- Goal: Fat loss (~0.5kg/week)
- Starting BMR: 1,880 kcal
- Starting TDEE: 2,914 kcal
- Starting daily target: 2,414 kcal
- Protein: 199g | Fat: 67g | Carbs: 254g
- Supplements: Creatine 5g/day, Whey protein (1 scoop post-workout + cooking)

### Sneska
- Female, 28 years old
- Height: 160cm
- Starting weight: 60.5kg (as of 2026-03-09)
- Goal: Fat loss (~0.5kg/week)
- Starting BMR: 1,304 kcal
- Starting TDEE: 2,021 kcal
- Starting daily target: 1,521 kcal
- Protein: 133g | Fat: 42g | Carbs: 152g
- Supplements: Creatine 5g/day, Whey protein (1 scoop post-workout + cooking)
- Does NOT eat mushrooms

### Shared Info
- Location: Serbia
- Primary meat: Chicken (not big meat lovers, but eat it)
- Training: Currently 3 days/week gym (1-1.5h sessions), moving to 4 days soon
- Daily steps: 6,000–10,000 (average ~8,000)
- Both take creatine 5g daily
- Whey: 1 scoop post-workout + used in cooking

---

## 2. CALORIE & MACRO CALCULATION

### BMR Formula (Mifflin-St Jeor)
- Men: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
- Women: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161

### TDEE Calculation
TDEE = BMR × Activity Factor

Activity factor determination based on ACTUAL data:
- Steps + training frequency determine the multiplier
- 3x gym + 6-10k steps/day = ~1.55 (moderate)
- 4x gym + 6-10k steps/day = ~1.6 (moderate-high)
- 5x+ gym + 10k+ steps/day = ~1.7 (high)
- Adjust down if steps consistently below 6k, up if consistently above 10k

### Deficit
- Target deficit: 500 kcal/day
- Expected loss: ~0.5kg/week, ~1kg per 2 weeks
- If weight stalls for 2+ weeks with good adherence, recalculate or increase deficit by 100 kcal

### Macro Rules
- **Protein**: 1g per pound of CURRENT bodyweight (HARD target, hit within ±5g)
- **Fat**: Minimum 25% of total calories (floor for hormonal health)
- **Carbs**: Remaining calories after protein + fat
- **Daily variance allowed**: ±50 kcal total, ±10g carbs/fat, ±5g protein
- Protein is king — if anything gets sacrificed, it's never protein

### Recalculation Schedule
- Every 2 weeks on weigh-in day
- Use new weight to recalculate BMR → TDEE → targets → macros
- Adjust activity factor if training frequency or steps changed

---

## 3. NUTRITION TRACKING RULES

### Food Lookup Protocol
1. NEVER use Claude's own knowledge for nutritional data
2. Always search online databases for calories, protein, carbs, fat per 100g or per serving
3. For branded/specific products: search for the EXACT brand and product
4. If the product is Serbian or regional: ask Vlada for the label info if search fails
5. For home-cooked meals: break down into individual ingredients, look up each
6. Whey protein: confirm exact brand/product once, then reuse those numbers
7. Creatine: 0 calories, track separately as supplement taken/not taken

### Meal Logging
- Every meal logged with: time, food items, portions (g or ml), per-item macros, meal total
- Running daily total updated after each meal entry
- End of day: flag if targets were missed and by how much

### Meal Database
- Every unique meal gets saved to meal-database.json
- Includes: meal name, ingredients with portions, total macros
- Purpose: fast re-entry for repeated meals (e.g., "same breakfast as yesterday")

### Meal Suggestions
When asked "what should I eat?":
1. Check remaining macros for the day
2. First suggest from saved meal database (stuff they actually eat)
3. If nothing fits: suggest simple meals prioritizing Serbian/European foods
4. Always prioritize high-protein options if behind on protein
5. Avoid: mushrooms (Sneska), overly complicated recipes, American-specific products
6. Keep suggestions practical — stuff you can actually make in Serbia

---

## 4. WORKOUT TRACKING RULES

### Logging
For each workout log:
- Date, session type (upper/lower/full body/etc.)
- Every exercise: name, sets × reps, weight (kg), RPE (1-10)
- Overall session RPE
- Session notes (how it felt, energy level, any pain/discomfort)
- Session duration (approximate)

### Progressive Overload Protocol
- If all prescribed reps are completed at RPE ≤ 7 → suggest weight increase next session
- Weight increase: +2.5kg for compound lifts, +1.25kg for isolation (or smallest available)
- If RPE 8-9 and all reps completed → maintain weight, try again next session
- If RPE 10 or failed reps → note it, maintain or reduce weight

### Deload Detection
Automatic deload suggestion triggers:
1. Average RPE > 8.5 for 2+ consecutive weeks with stalling/declining performance
2. 3+ consecutive sessions where prescribed reps not completed
3. Vlada reports: bad sleep, high stress, low energy for 3+ consecutive days
4. Sickness = automatic rest (no workout scheduled until cleared)
5. After every 6-8 weeks of consistent training, proactively suggest a deload week

### Deload Protocol
- Reduce all weights by 40-50%
- Reduce volume by 30-40% (fewer sets)
- Keep exercises the same
- Duration: 1 week
- Purpose: recovery, not laziness — RPG system awards deload XP

---

## 5. PROGRESS TRACKING

### Weigh-ins
- Daily morning weight (fasted, after bathroom)
- Weekly average calculated from daily weights (more reliable than single readings)
- Trend tracked over time — weekly averages are what matter, not daily fluctuations
- Note: creatine causes water retention — initial weight might not drop or might even go up slightly. This is NORMAL.

### Measurements (every 2 weeks)
- Waist (at navel)
- Hips (widest point)
- Chest (at nipple line)
- Arms/biceps (flexed, widest point)
- Thighs (widest point)
- Neck

### Life Context Log
Every session, capture (if reported):
- Mood (1-10)
- Energy level (1-10)
- Sleep hours + quality (1-10)
- Stress level (1-10)
- Any sickness or health issues
- Any life events (work stress, family stuff, travel, etc.)
- Reason for any missed workouts (categorized: sick, tired, busy, no excuse, etc.)

---

## 6. RPG / GAMIFICATION SYSTEM

### XP Awards
| Action | XP |
|---|---|
| Complete a workout | +50 |
| Hit protein target (±5g) | +20 |
| Hit calorie target (±50 kcal) | +20 |
| 10,000+ steps | +15 |
| Log daily (any data entry) | +10 |
| New PR on any lift | +30 |
| Perfect macro day (all macros within range) | +25 |
| Complete a deload week | +40 |
| 7-day logging streak bonus | +100 |
| 30-day logging streak bonus | +500 |

### Levels
- Every 500 XP = 1 level up
- Level 1 starts at 0 XP
- No level cap

### Streaks
- Consecutive days of logging ANY data (food, workout, weight, or daily check-in)
- Excused absences (sick, emergency) do NOT break streaks
- Unexcused missed days reset the streak

### Excused Absences
These do NOT incur XP penalties or break streaks:
- Sickness
- Family emergency
- Travel (if reported in advance)
- Injury
- Mental health day (if reported)

### Both Users
- Vlada and Sneska tracked independently
- Each has their own level, XP, streaks
- Can see each other's stats on dashboard (friendly competition)

---

## 7. DATA FILES — LOCATION & SCHEMA

All data files live in: `/public/data/` in the Next.js app repo

### File Structure
```
/public/data/
├── vlada/
│   ├── profile.json
│   ├── rpg.json
│   ├── weight-log.json
│   ├── measurements.json
│   ├── nutrition-log.json
│   ├── workout-log.json
│   └── daily-log.json
├── sneska/
│   ├── profile.json
│   ├── rpg.json
│   ├── weight-log.json
│   ├── measurements.json
│   ├── nutrition-log.json
│   ├── workout-log.json
│   └── daily-log.json
└── shared/
    ├── meal-database.json
    ├── workout-plan.json
    └── config.json
```

### Schema: profile.json
```json
{
  "name": "Vlada",
  "gender": "male",
  "age": 27,
  "heightCm": 177,
  "currentWeightKg": 90.4,
  "startingWeightKg": 90.4,
  "goalWeightKg": null,
  "bmr": 1880,
  "tdee": 2914,
  "dailyCalorieTarget": 2414,
  "macros": {
    "proteinG": 199,
    "fatG": 67,
    "carbsG": 254
  },
  "deficit": 500,
  "activityFactor": 1.55,
  "supplements": ["Creatine 5g/day", "Whey protein"],
  "restrictions": [],
  "lastRecalculation": "2026-03-09",
  "notes": ""
}
```

### Schema: rpg.json
```json
{
  "level": 1,
  "totalXP": 0,
  "xpToNextLevel": 500,
  "currentStreak": 0,
  "longestStreak": 0,
  "totalWorkouts": 0,
  "totalPRs": 0,
  "perfectMacroDays": 0,
  "xpHistory": [
    { "date": "2026-03-09", "xpGained": 0, "reason": "Day 1 - Journey begins" }
  ],
  "achievements": []
}
```

### Schema: weight-log.json
```json
{
  "entries": [
    {
      "date": "2026-03-09",
      "weightKg": 90.4,
      "weeklyAvgKg": null,
      "notes": "Starting weight"
    }
  ]
}
```

### Schema: measurements.json
```json
{
  "entries": [
    {
      "date": "2026-03-09",
      "waistCm": null,
      "hipsCm": null,
      "chestCm": null,
      "armsCm": null,
      "thighsCm": null,
      "neckCm": null,
      "notes": "Initial measurements pending"
    }
  ]
}
```

### Schema: nutrition-log.json
```json
{
  "days": [
    {
      "date": "2026-03-09",
      "meals": [
        {
          "name": "Breakfast",
          "time": "08:00",
          "items": [
            {
              "food": "Oats",
              "portionG": 80,
              "calories": 303,
              "proteinG": 10.6,
              "carbsG": 51.4,
              "fatG": 5.4,
              "source": "nutritionvalue.org"
            }
          ],
          "mealTotals": {
            "calories": 303,
            "proteinG": 10.6,
            "carbsG": 51.4,
            "fatG": 5.4
          }
        }
      ],
      "dailyTotals": {
        "calories": 0,
        "proteinG": 0,
        "carbsG": 0,
        "fatG": 0
      },
      "remaining": {
        "calories": 2414,
        "proteinG": 199,
        "carbsG": 254,
        "fatG": 67
      },
      "targetHit": false,
      "notes": ""
    }
  ]
}
```

### Schema: workout-log.json
```json
{
  "sessions": [
    {
      "date": "2026-03-09",
      "sessionType": "Upper Body",
      "exercises": [
        {
          "name": "Bench Press",
          "sets": [
            { "reps": 8, "weightKg": 60, "rpe": 7 },
            { "reps": 8, "weightKg": 60, "rpe": 8 },
            { "reps": 7, "weightKg": 60, "rpe": 9 }
          ],
          "notes": ""
        }
      ],
      "overallRPE": 8,
      "durationMin": 75,
      "notes": ""
    }
  ]
}
```

### Schema: daily-log.json
```json
{
  "entries": [
    {
      "date": "2026-03-09",
      "steps": 8500,
      "sleepHours": 7.5,
      "sleepQuality": 7,
      "energyLevel": 7,
      "mood": 7,
      "stressLevel": 4,
      "sickness": null,
      "workoutCompleted": true,
      "missedWorkoutReason": null,
      "notes": ""
    }
  ]
}
```

### Schema: meal-database.json (shared)
```json
{
  "meals": [
    {
      "id": "m001",
      "name": "Oatmeal with Whey and Banana",
      "ingredients": [
        { "food": "Oats", "portionG": 80, "calories": 303, "proteinG": 10.6, "carbsG": 51.4, "fatG": 5.4 },
        { "food": "Whey Protein (1 scoop)", "portionG": 30, "calories": 120, "proteinG": 24, "carbsG": 3, "fatG": 1.5 },
        { "food": "Banana", "portionG": 120, "calories": 107, "proteinG": 1.3, "carbsG": 27.4, "fatG": 0.4 }
      ],
      "totals": {
        "calories": 530,
        "proteinG": 35.9,
        "carbsG": 81.8,
        "fatG": 7.3
      },
      "tags": ["breakfast", "quick", "high-protein"],
      "addedDate": "2026-03-09"
    }
  ]
}
```

### Schema: workout-plan.json (shared)
```json
{
  "currentPlan": "3-Day Full Body (Beginner Return)",
  "startDate": "2026-03-09",
  "schedule": {
    "vlada": {
      "monday": "Workout A",
      "wednesday": "Workout B",
      "friday": "Workout C"
    },
    "sneska": {
      "monday": "Workout A",
      "wednesday": "Workout B",
      "friday": "Workout C"
    }
  },
  "workouts": {
    "Workout A": {
      "focus": "Full Body - Push emphasis",
      "exercises": [
        { "name": "Barbell Squat", "sets": 3, "reps": "8-10", "restSec": 120 },
        { "name": "Bench Press", "sets": 3, "reps": "8-10", "restSec": 120 },
        { "name": "Bent Over Row", "sets": 3, "reps": "8-10", "restSec": 90 },
        { "name": "Overhead Press", "sets": 3, "reps": "8-10", "restSec": 90 },
        { "name": "Bicep Curls", "sets": 2, "reps": "10-12", "restSec": 60 },
        { "name": "Tricep Pushdowns", "sets": 2, "reps": "10-12", "restSec": 60 }
      ]
    }
  },
  "notes": "Workout plan to be defined by Vlada. This is a placeholder."
}
```

### Schema: config.json (shared)
```json
{
  "startDate": "2026-03-09",
  "appVersion": "1.0.0",
  "recalculationFrequency": "biweekly",
  "weighInFrequency": "daily",
  "measurementFrequency": "biweekly",
  "stepsGoal": 10000,
  "theme": "rose-gold-dark"
}
```

---

## 8. SESSION PROTOCOL — WHAT TO DO EVERY TIME

When Vlada starts a conversation:

1. **Read this ruleset first** — always
2. **Read current profile.json for both users** — know the current targets
3. **Read rpg.json** — know current levels and streaks
4. **Check what data is missing** — did they log yesterday? Any gaps?
5. **Ask what they need** — log food? log workout? check progress? need meal suggestions?
6. **Update the relevant JSON files** — after every data entry
7. **Remind about anything missed** — weigh-in, measurements due, streak at risk

### When Logging Food:
1. Ask what they ate (or they'll tell you)
2. Look up EVERY item online — never guess nutrition
3. Calculate meal totals
4. Update nutrition-log.json for that date
5. Show remaining macros for the day
6. If far off target, suggest what to eat for remaining meals

### When Logging Workouts:
1. Get exercises, sets, reps, weight, RPE
2. Compare to workout plan and previous sessions
3. Flag PRs
4. Suggest weight increases where appropriate
5. Update workout-log.json
6. Award XP and update rpg.json

### When Doing Weigh-in:
1. Record weight in weight-log.json
2. Calculate weekly average if enough data
3. Compare to target trajectory
4. Every 2 weeks: recalculate BMR → TDEE → macros → update profile.json
5. If weight stalled 2+ weeks: flag and discuss

### When Asked for Meal Suggestions:
1. Check remaining macros for the day
2. Search meal-database.json first
3. If nothing fits: suggest new meals, look up nutrition online
4. Keep it Serbian-friendly, practical, not overly complex
5. Prioritize protein if they're behind

---

## 9. IMPORTANT REMINDERS

- This is about Vlada and Sneska getting healthier. Keep it supportive but real.
- Don't bullshit the numbers — accuracy matters.
- Always verify nutrition data from external sources.
- Life happens — be flexible with excuses but honest about impact.
- The RPG system should motivate, not stress. Keep it fun.
- When in doubt about food items: ASK, don't guess.
- Creatine water weight is normal — don't panic about initial weight changes.
- Sneska's protein target is high relative to her calories — whey is essential.
- Both are coming back from a long break — start conservative, build up.
- When moving to 4 days/week: recalculate activity factor immediately.
