"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { useFitbit } from "@/hooks/useFitbit";
import { Line } from "react-chartjs-2"; // Chart.js library
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register the components with Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const FitbitIntegration = () => {
  const { connectFitbit, isLinked, activitySummary, handleClaimReward } = useFitbit();

  const calculateReward = (steps: number) => {
    return (steps / 1000) * 0.1;
  };

  // Prepare data for the charts
  const stepsData = {
    labels: ["Morning", "Afternoon", "Evening"], // Example data, adjust based on real data
    datasets: [
      {
        label: "Steps",
        data: [1000, 1500, 305], // Replace with real data from the API
        borderColor: "#4CAF50", 
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        fill: true,
      },
    ],
  };

  const caloriesData = {
    labels: ["Morning", "Afternoon", "Evening"], // Example data, adjust based on real data
    datasets: [
      {
        label: "Calories Burned",
        data: [300, 200, 137], // Replace with real data from the API
        borderColor: "#FF6347", 
        backgroundColor: "rgba(255, 99, 71, 0.2)",
        fill: true,
      },
    ],
  };

  const distanceData = {
    labels: ["Morning", "Afternoon", "Evening"], // Example data, adjust based on real data
    datasets: [
      {
        label: "Distance (km)",
        data: [1, 0.5, 0.5], // Replace with real data from the API
        borderColor: "#1E90FF", 
        backgroundColor: "rgba(30, 144, 255, 0.2)",
        fill: true,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Fitbit Integration</h1>
        <Button onClick={connectFitbit} disabled={isLinked}>
          {isLinked ? "Linked" : "Link Account"}
        </Button>
      </div>

      {isLinked && activitySummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Your Activity Summary</CardTitle>
              <CardDescription>Here&apos;s a summary of your activity today</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Steps Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Steps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{activitySummary.summary.steps}</div>
                    <Progress
                      value={(activitySummary.summary.steps / activitySummary.goals.steps) * 100}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Goal: {activitySummary.goals.steps}</p>
                  </CardContent>
                </Card>

                {/* Calories Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Calories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{activitySummary.summary.caloriesOut}</div>
                    <Progress
                      value={(activitySummary.summary.caloriesOut / activitySummary.goals.caloriesOut) * 100}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Goal: {activitySummary.goals.caloriesOut}</p>
                  </CardContent>
                </Card>

                {/* Distance Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Distance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {activitySummary.summary.distances.find(d => d.activity === "Walk")?.distance} km
                    </div>
                    <Progress
                      value={(activitySummary.summary.distances.find(d => d.activity === "Walk")?.distance || 0) /
                        activitySummary.goals.distance *
                        100}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Goal: {activitySummary.goals.distance} km</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Minutes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{activitySummary.summary.activeMinutes}</div>
                    <Progress
                      value={(activitySummary.summary.activeMinutes / activitySummary.goals.activeMinutes) * 100}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Goal: {activitySummary.goals.activeMinutes}</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Steps Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <Line data={stepsData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calories Burned Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <Line data={caloriesData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distance Covered Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <Line data={distanceData} />
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FitbitIntegration;
