import prisma from "../config/db.js"

export const calculateMoodStats = async (userId) => {
    try {
        //get all mood entries for the user
        const moods = await prisma.moods.findMany({
            where: {
                user_id: userId,
            },
            orderBy: {
                date: "desc"
            },
            select: {
                id: true,
                mood: true,
                date: true,
                emotions: true,
                sleep: true,
                productivity: true,
            }
        })

        const entries = moods.map(m => ({
            ...m,
            activities: combineFactors(m)
        }))

        const streak = calculateStreak(entries)
        const moodChartData = calculateMoodChartData(entries);
        const moodCounts = calculateMoodCounts(entries);
        const stabilityScore = calculateMoodStability(entries);
        const activityPatterns = analyzeActivityPatterns(entries);

        const dayOfWeekAverages = calculateDayOfWeekAverages(entries);
        const productivityCorrelation = approximateProductivityCorrelation(entries);

        return {
            streak,
            moodChartData,
            moodCounts,
            stabilityScore,
            activityPatterns,
            dayOfWeekAverages,
            productivityCorrelation
        }
    } catch (error) {
        console.error('Error calculating mood stats:', error);
        throw error;
    }
}

//helper functions
//combine emotions, sleep, productivity into one activities array
function combineFactors(moodRecord) {
    const { emotions, sleep, productivity } = moodRecord;
    return [
        ...(emotions || []),
        ...(sleep || []),
        ...(productivity || [])
    ];
}

//to calculate streak
function calculateStreak(entries) {
    if (!entries.length) return 0;

    let currentStreak = 1;
    //normalize the first date to midnight
    let lastDate = new Date(entries[0].date);
    lastDate.setHours(0, 0, 0, 0);

    for (let i = 1; i < entries.length; i++) {
        let entryDate = new Date(entries[i].date);
        entryDate.setHours(0, 0, 0, 0);

        const diffDays = (lastDate - entryDate) / (1000 * 60 * 60 * 24);

        //if exactly 1 day apart, continue streak
        if (diffDays === 1) {
            currentStreak++;
            lastDate = entryDate;
        } else {
            break;
        }
    }

    return currentStreak;
}


//to convert mood to number scale
const moodToNumber = (mood) => {
    const moodScale = {
        great: 5,
        good: 4,
        meh: 3,
        bad: 2,
        awful: 1
    };
    return moodScale[mood];
}

//prepare mood chart data for the last 7 entries in chronological order.
const calculateMoodChartData = (entries) => {
    const lastSeven = entries.slice(0, 7)
    //reverse them to go oldest to newest for a chart
    return lastSeven
        .reverse()
        .map(entry => ({
            date: entry.date,
            mood: moodToNumber(entry.mood)
        }))

}

const calculateMoodCounts = (entries) => {
    return entries.reduce((acc, e) => {
        acc[e.mood] = (acc[e.mood] || 0) + 1;
        return acc;
    }, {});
}

const calculateMoodStability = (entries) => {
    if (entries.length < 2) return 100

    const moodValues = entries.map(entry => moodToNumber(entry.mood))
    let totalVariance = 0

    for (let i = 1; i < moodValues.length; i++) {
        totalVariance += Math.abs(moodValues[i] - moodValues[i - 1])
    }

    const avgVariance = totalVariance / (moodValues.length - 1)
    return Math.max(0, 100 - (avgVariance * 20))
}

const analyzeActivityPatterns = (entries) => {
    //group entries by mood first
    const moodActivityMap = {}

    //process each entry
    entries.forEach(entry => {
        const { mood, activities } = entry

        if (!moodActivityMap[mood]) {
            moodActivityMap[mood] = {};
        }

        //count frequency of each individual activity for this mood
        if (activities && activities.length) {
            activities.forEach(activity => {
                moodActivityMap[mood][activity] = (moodActivityMap[mood][activity] || 0) + 1;
            });
        }
    })


    //convert to array and sort by frequency
    const result = {}
    Object.entries(moodActivityMap).forEach(([mood, activities]) => {
        result[mood.toLowerCase()] = Object.entries(activities)
            .map(([activity, count]) => ({
                activity,
                count
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); //to only keep top 5 most frequent activities
    })
    return result
}

const calculateDayOfWeekAverages = (entries) => {
    if (!entries.length) return {}

    //map dayOfWeek -> {sum:X, count:Y}
    const dayMap = {}

    entries.forEach(entry => {
        const dayOfWeek = new Date(entry.date).getDay() // 0=Sun, 1=Mon...
        const moodValue = moodToNumber(entry.mood)

        if (!dayMap[dayOfWeek]) {
            dayMap[dayOfWeek] = { sum: 0, count: 0 }
        }
        dayMap[dayOfWeek].sum += moodValue
        dayMap[dayOfWeek].count++
    })

    //convert from sums to average
    const result = {}
    const dayLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    Object.entries(dayMap).forEach(([dayNumber, { sum, count }]) => {
        const averageMood = sum / count;
        result[dayLabels[dayNumber]] = averageMood;
    });

    return result;
}

const approximateProductivityCorrelation = (entries) => {
    if (entries.length < 2) return 0;

    // Extract pairs of (moodValue, productivityLength)
    const dataPairs = entries.map(e => {
        return [moodToNumber(e.mood), (e.productivity || []).length];
    });

    // Let's do a simple Cov(X,Y)/[StdDev(X)*StdDev(Y)] approach
    // 1) compute means
    const moodMean = average(dataPairs.map(dp => dp[0]));
    const prodMean = average(dataPairs.map(dp => dp[1]));

    // 2) compute numerator = sum( (x - mx)*(y - my ) )
    let numerator = 0;
    dataPairs.forEach(([moodVal, prodVal]) => {
        numerator += (moodVal - moodMean) * (prodVal - prodMean);
    });

    // 3) compute denominators = sqrt( sum((x - mx)^2) ) * sqrt( sum((y - my)^2) )
    const moodStd = Math.sqrt(
        dataPairs.reduce((acc, [mVal]) => acc + Math.pow(mVal - moodMean, 2), 0)
    );
    const prodStd = Math.sqrt(
        dataPairs.reduce((acc, [, pVal]) => acc + Math.pow(pVal - prodMean, 2), 0)
    );

    // if either std is 0, correlation is undefined or zero
    if (moodStd === 0 || prodStd === 0) return 0;

    // correlation coefficient in [-1, 1]
    const correlation = numerator / (moodStd * prodStd);

    // Round to 3 decimals for convenience
    return parseFloat(correlation.toFixed(3));
}

//utility function to compute average of the array
const average = (nums) => {
    if (!nums.length) return 0;
    return nums.reduce((acc, n) => acc + n, 0) / nums.length;
}