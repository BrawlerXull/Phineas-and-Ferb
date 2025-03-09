import { useState, useEffect } from 'react';
import useMeditationStaking from './useMeditationStakingContract';

type LifetimeStepsData = {
  lifetime: {
    total: {
      steps: number;
    };
    tracker: {
      steps: number;
    };
  };
};

type FitbitData = {
  activities: Array<{
    name: string;
    calories: number;
    distance: number;
    steps: number;
    duration: number;
  }>;
  summary: {
    caloriesOut: number;
    steps: number;
    distances: Array<{ activity: string; distance: number }>;
    activeMinutes: number;
  };
  goals: {
    caloriesOut: number;
    steps: number;
    distance: number;
    activeMinutes: number;
  };
};

export const useFitbit = () => {
  const [activitySummary, setActivitySummary] = useState<FitbitData | null>(null);
  const [isLinked, setIsLinked] = useState(false);
  const [lifeTimeSteps, setLifeTimeSteps] = useState(0);
  const { addRewards } = useMeditationStaking();

  const FITBIT_CLIENT_ID = '23Q5YZ';
  const REDIRECT_URI = 'http://localhost:3000/fitbit';

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.replace('#', ''));
      const accessToken = params.get('access_token');
      if (accessToken) {
        fetchActivitySummary(accessToken);
        fetchLifetimeSteps(accessToken); 
        setIsLinked(true);
      }
    }
  }, []); 

  const handleClaimReward = async () => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', ''));
    const accessToken = params.get('access_token');
    if (accessToken) {
      const steps = await fetchLifetimeSteps(accessToken); 
      try {
        if (steps) {
          addRewards(steps);
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  const connectFitbit = () => {
    const scope = 'activity';
    const fitbitAuthUrl = `https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=${FITBIT_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&scope=${scope}`;
    window.location.href = fitbitAuthUrl;
  };

  const fetchActivitySummary = async (accessToken: string) => {
    try {
      const response = await fetch(
        'https://api.fitbit.com/1/user/-/activities/date/2025-03-09.json',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error fetching activity summary');
      }

      const data = await response.json();
      setActivitySummary(data);
      console.log(data);
    } catch (error) {
      console.error('Error fetching activity summary:', error);
    }
  };

  // Fetch lifetime steps data
  const fetchLifetimeSteps = async (accessToken: string) => {
    try {
      const response = await fetch('https://api.fitbit.com/1/user/-/activities.json', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error fetching lifetime steps data');
      }

      const data: LifetimeStepsData = await response.json();
      setLifeTimeSteps(data.lifetime.total.steps);
      console.log('Lifetime Steps:', data.lifetime.total.steps);
      return data.lifetime.total.steps;
    } catch (error) {
      console.error('Error fetching lifetime steps data:', error);
    }
  };

  return {
    connectFitbit,
    handleClaimReward,
    activitySummary,
    isLinked,
    lifeTimeSteps,
  };
};
