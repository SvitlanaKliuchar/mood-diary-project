import prisma from "../config/db.js"
import natural from 'natural';
import stopwords from 'natural/lib/natural/util/stopwords.js';
import { validateUserId } from '../utils/validation.js';

const tokenizer = new natural.WordTokenizer()
const stemmer = natural.PorterStemmer

export const calculateMoodStats = async (userId) => {
    //input validation
    validateUserId(userId);
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
                note: true
            }
        })

        const entries = moods.map(m => ({
            ...m,
            activities: combineFactors(m)
        }))

        const notesArray = moods
            .filter(m => m.note && m.note.trim().length > 0) //remove empty/null notes
            .map(m => m.note) //extract text only

        const streak = calculateStreak(entries)
        const moodChartData = calculateMoodChartData(entries);
        const moodCounts = calculateMoodCounts(entries);
        const stabilityScore = calculateMoodStability(entries);
        const activityPatterns = analyzeActivityPatterns(entries);
        const dayOfWeekAverages = calculateDayOfWeekAverages(entries);
        const productivityCorrelation = approximateProductivityCorrelation(entries);
        const wordCloudData = notesArray.length > 0 ? processNotes(notesArray) : [];
        const moodWordAssociations = analyzeMoodWordAssociations(entries);

        return {
            streak,
            moodChartData,
            moodCounts,
            stabilityScore,
            activityPatterns,
            dayOfWeekAverages,
            productivityCorrelation,
            wordCloudData,
            moodWordAssociations
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

// all division by zero issues resolved
const approximateProductivityCorrelation = (entries) => {
    // need at least 2 entries
    if (!entries || entries.length < 2) return 0;

    //extract pairs of (moodValue, productivityLength)
    const dataPairs = entries.map(e => {
        return [moodToNumber(e.mood), (e.productivity || []).length];
    }).filter(pair => {
        // filter out invalid data pairs
        return typeof pair[0] === 'number' && typeof pair[1] === 'number' &&
               isFinite(pair[0]) && isFinite(pair[1]);
    });

    // ensure we have valid data pairs
    if (dataPairs.length < 2) return 0;

    // 1) compute means with safety checks
    const moodMean = average(dataPairs.map(dp => dp[0]));
    const prodMean = average(dataPairs.map(dp => dp[1]));

    // ensure means are valid numbers
    if (!isFinite(moodMean) || !isFinite(prodMean)) return 0;

    // 2) compute numerator = sum( (x - mx)*(y - my ) )
    let numerator = 0;
    dataPairs.forEach(([moodVal, prodVal]) => {
        const moodDiff = moodVal - moodMean;
        const prodDiff = prodVal - prodMean;
        
        // ensure differences are valid
        if (isFinite(moodDiff) && isFinite(prodDiff)) {
            numerator += moodDiff * prodDiff;
        }
    });

    // ensure numerator is valid
    if (!isFinite(numerator)) return 0;

    // 3) compute standard deviations with safety checks
    let moodSumSquares = 0;
    let prodSumSquares = 0;
    
    dataPairs.forEach(([moodVal, prodVal]) => {
        const moodDiff = moodVal - moodMean;
        const prodDiff = prodVal - prodMean;
        
        if (isFinite(moodDiff) && isFinite(prodDiff)) {
            moodSumSquares += moodDiff * moodDiff;
            prodSumSquares += prodDiff * prodDiff;
        }
    });

    // prevent division by zero in standard deviation
    if (moodSumSquares <= 0 || prodSumSquares <= 0) return 0;

    const moodStd = Math.sqrt(moodSumSquares);
    const prodStd = Math.sqrt(prodSumSquares);

    // ensure standard deviations are valid and non-zero
    if (!isFinite(moodStd) || !isFinite(prodStd) || moodStd === 0 || prodStd === 0) {
        return 0;
    }

    // final correlation calculation with division by zero protection
    const denominator = moodStd * prodStd;
    if (denominator === 0 || !isFinite(denominator)) return 0;

    const correlation = numerator / denominator;

    // ensure correlation is a valid number within bounds
    if (!isFinite(correlation)) return 0;
    
    // ensure correlation is within valid range [-1, 1]
    const clampedCorrelation = Math.max(-1, Math.min(1, correlation));

    //round to 3 decimals for convenience
    return parseFloat(clampedCorrelation.toFixed(3));
}

//utility function with division by zero protection
const average = (nums) => {
    if (!nums || nums.length === 0) return 0; // handle empty arrays
    
    const validNums = nums.filter(n => typeof n === 'number' && isFinite(n));
    if (validNums.length === 0) return 0; // handle all invalid numbers
    
    const sum = validNums.reduce((acc, n) => acc + n, 0);
    return sum / validNums.length; // validNums.length is guaranteed > 0
}

const processNotes = (notes, allMoodNotes = null) => {
    //combine all notes into one text
    const allText = notes.join(' ').toLowerCase()

    //tokenize text
    const tokens = tokenizer.tokenize(allText)

    //remove stopwords 
    const filteredTokens = tokens.filter(token => !stopwords.words.includes(token))

    // create a mapping between stemmed words and their original forms
    const stemToOriginal = {}
    const stemmedTokens = []

    filteredTokens.forEach(token => {
        const stemmed = stemmer.stem(token)
        stemmedTokens.push(stemmed)

        //keep track of the most frequent original form for each stem
        if (!stemToOriginal[stemmed]) {
            stemToOriginal[stemmed] = { word: token, count: 1 }
        } else {
            stemToOriginal[stemmed].count += 1

            //if this original form appears more frequently, use it as the representative
            if (stemToOriginal[stemmed].count <
                filteredTokens.filter(t => stemmer.stem(t) === stemmed && t === token).length) {
                stemToOriginal[stemmed].word = token;
                stemToOriginal[stemmed].count = filteredTokens.filter(t =>
                    stemmer.stem(t) === stemmed && t === token).length;
            }
        }
    })

    //count frequencies of stemmed words
    const wordFreq = {};
    stemmedTokens.forEach(token => {
        wordFreq[token] = (wordFreq[token] || 0) + 1;
    });

    let tfidfScores = {}
    //calculate TF-IDF if allMoodNotes is provided
    if (allMoodNotes) {
        //calculate idf for each term 
        const totalMoods = Object.keys(allMoodNotes).length
        const idfScores = {}

        //for each term, count in how many moods it appears
        Object.keys(wordFreq).forEach(term => {
            let moodCount = 0
            Object.keys(allMoodNotes).forEach(mood => {
                //check if the term appears in notes for this mood
                const moodText = allMoodNotes[mood].join(' ').toLowerCase();
                if (moodText.includes(stemToOriginal[term].word)) {
                    moodCount++;
                }
            })

             // prevent division by zero in IDF calculation
             const denominator = Math.max(moodCount, 1); // ensure denominator is at least 1
             idfScores[term] = totalMoods > 0 ? Math.log(totalMoods / denominator) : 0;
            
             //calculate TF-IDF: term frequency * IDF
             tfidfScores[term] = wordFreq[term] * idfScores[term];
        })
    }

    //create the final array with original words but stemmed frequencies
    return Object.entries(wordFreq)
        .map(([stemmedWord, count]) => ({
            text: stemToOriginal[stemmedWord].word,
            stem: stemmedWord,
            value: count,
            tfidf: tfidfScores[stemmedWord] || 0
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 100); //top 100 words
}

const findCoOccurringWords = (notes, windowSize = 5) => {
    //preprocess all notes
    const allText = notes.join(' ').toLowerCase();
    const tokens = tokenizer.tokenize(allText)
        .filter(token => !stopwords.words.includes(token));
    
    //track co-occurrences within sliding window
    const coOccurrences = {};
    
    for (let i = 0; i < tokens.length; i++) {
        const currentToken = tokens[i];
        const stemmedCurrent = stemmer.stem(currentToken);
        
        //look ahead within window size
        for (let j = i + 1; j < Math.min(i + windowSize + 1, tokens.length); j++) {
            const windowToken = tokens[j];
            const stemmedWindow = stemmer.stem(windowToken);
            
            //skip if same stem word
            if (stemmedCurrent === stemmedWindow) continue;
            
            //create pair key (alphabetical ordering)
            const pairKey = [stemmedCurrent, stemmedWindow].sort().join("_");
            
            if (!coOccurrences[pairKey]) {
                coOccurrences[pairKey] = {
                    words: [currentToken, windowToken],
                    count: 1
                };
            } else {
                coOccurrences[pairKey].count++;
            }
        }
    }
    
    //convert to array and sort by frequency
    return Object.values(coOccurrences)
        .sort((a, b) => b.count - a.count)
        .slice(0, 20); //top 20 co-occurring pairs
}

const analyzeMoodWordAssociations = (entries) => {
    //group entries by mood
    const moodGroups = {}
    entries.forEach(entry => {
        if (!entry.note) return;
        
        const mood = entry.mood;
        if (!moodGroups[mood]) moodGroups[mood] = [];
        moodGroups[mood].push(entry.note);
    });
    
    //process each mood group with TF-IDF to find distinctive words
    const moodWordAssociations = {};
    Object.entries(moodGroups).forEach(([mood, notes]) => {
        moodWordAssociations[mood] = {
            words: processNotes(notes, moodGroups)
                .sort((a, b) => b.tfidf - a.tfidf) //sort by TF-IDF for distinctive words
                .slice(0, 15),  //top 15 distinctive words
            coOccurring: findCoOccurringWords(notes)
        };
    });
    
    return moodWordAssociations;
}