const express = require('express');
const app = express();
const port = 3000;

app.post('/userSolved',async(req:any, res:any) => {
  try {
    const username = req.query.username;  
    console.log(username);
    if (!username) {
        return res.status(400).json({ error: 'username is required' });
    }
    var response = await getAllData(username);
    const data = await response.json();

    if (data.errors) {
      return res.status(500).json({ error: 'GraphQL error', details: data.errors });
    }

    res.json(data.data.userProfileUserQuestionProgressV2.numAcceptedQuestions);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching' });
  }
});

app.post('/userUnsolved',async(req:any, res:any)=>{
    try {
        const username = req.query.username;  
        console.log(username);
        if (!username) {
            return res.status(400).json({ error: 'username is required' });
        }
        var response = await getAllData(username);
        const data = await response.json();
    
        if (data.errors) {
          return res.status(500).json({ error: 'GraphQL error', details: data.errors });
        }
    
        res.json(data.data.userProfileUserQuestionProgressV2.numFailedQuestions);
    
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching' });
    }
});


app.post('/userBeats',async(req:any, res:any)=>{
    try {
        const username = req.query.username;  
        console.log(username);
        if (!username) {
            return res.status(400).json({ error: 'username is required' });
        }
        var response = await getAllData(username);
        const data = await response.json();
    
        if (data.errors) {
          return res.status(500).json({ error: 'GraphQL error', details: data.errors });
        }
    
        res.json({sessionBeats: data.data.userProfileUserQuestionProgressV2.userSessionBeatsPercentage
            , overallbeats: data.data.userProfileUserQuestionProgressV2.totalQuestionBeatsPercentage});
    
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching' });
    }
});


app.post('/longestStreak',async(req:any,res:any)=>{
    try {
        const username = req.query.username; 
        const year = req.query.year; 
        console.log(username);
        if (!username) {
            return res.status(400).json({ error: 'username is required' });
        }
        var response = await getUserStreaks(username,year);
        const data = await response.json();
        console.log(data);
    
        if (data.errors) {
          return res.status(500).json({ error: 'GraphQL error', details: data.errors });
        }
        res.json({activeDays:data.data.matchedUser.userCalendar.totalActiveDays,streak:data.data.matchedUser.userCalendar.streak});
    }
    catch(error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching' });
    }
})


async function getUserStreaks(username: any, year: number) {
    const query = `
      query userProfileCalendar($username: String!, $year: Int) {
        matchedUser(username: $username) {
          userCalendar(year: $year) {
            activeYears
            streak
            totalActiveDays
            dccBadges {
              timestamp
              badge {
                name
                icon
              }
            }
            submissionCalendar
          }
        }
      }
    `;
  
    const response = await fetch('https://leetcode.com/graphql/', {  
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: {
          username,  
          year,      
        },
      }),
    });
    return response;
}


async function getAllData(username:any) {
    const query = `
      query userProfileUserQuestionProgressV2($userSlug: String!) {
        userProfileUserQuestionProgressV2(userSlug: $userSlug) {
          numAcceptedQuestions {
            count
            difficulty
          }
          numFailedQuestions {
            count
            difficulty
          }
          numUntouchedQuestions {
            count
            difficulty
          }
          userSessionBeatsPercentage {
            difficulty
            percentage
          }
          totalQuestionBeatsPercentage
        }
      }
    `;

    const response = await fetch('https://leetcode.com/graphql/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: {
          userSlug: username,  
        },
      }),
    });
    return response;
}

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
