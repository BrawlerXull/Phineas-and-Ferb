"use client"

import { Progress } from "@/components/ui/progress"

import { jsPDF } from "jspdf";

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Mic, MicOff, Play, Pause, RotateCcw, Save, Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"


type EventDetails = {
  title: string
  date: Date | undefined
  location: string
  audience: string
  speakerName: string
  topic: string
  duration: string
  additionalNotes: string
}

type SpeechFeedback = {
  clarity: number;
  pace: number;
  content: string;
  confidence: number;
  overallScore: number;
  strengths: string[];
  improvementSuggestions?: string[]; // Optional in case it is missing
};


export default function PublicSpeaking() {
  const [activeTab, setActiveTab] = useState("event")
  const [eventDetails, setEventDetails] = useState<EventDetails>({
    title: "",
    date: undefined,
    location: "",
    audience: "",
    speakerName: "",
    topic: "",
    duration: "",
    additionalNotes: "",
  })
  const [generatedSpeech, setGeneratedSpeech] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null)
  const [transcribedText, setTranscribedText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [speechFeedback, setSpeechFeedback] = useState<SpeechFeedback | null>(null)
  const [isListening, setIsListening] = useState(false);

  let recognition: SpeechRecognition | null = null;
  if (typeof window !== "undefined") {
    recognition = new ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)();
  }

  if (recognition) {
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");
      setTranscribedText(transcript);
    };
  }

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    setTranscribedText("");
    if (recognition) recognition.start();

    const interval = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
    setRecordingInterval(interval);
    toast("Your speech is now being recorded.");
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingInterval) clearInterval(recordingInterval);
    if (recognition) recognition.stop();
    toast(`Recording saved (${formatTime(recordingTime)}).`);
  };

  const resetRecording = () => {
    setIsRecording(false);
    setRecordingTime(0);
    if (recordingInterval) clearInterval(recordingInterval);
    setTranscribedText("");
    setSpeechFeedback(null);
  };

 


  const handleInputChange = (field: keyof EventDetails, value: any) => {
    setEventDetails((prev) => ({ ...prev, [field]: value }))
  }

  const handleGenerateSpeech = async () => {
    // Validate required fields
    if (!eventDetails.title || !eventDetails.topic || !eventDetails.audience) {
      toast.warning("Please fill in the event title, topic, and audience type.");
      return;
    }
  
    setIsGenerating(true);
  
    try {
      const response = await fetch("/api/public-speaking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventDetails),
      });
  
      if (!response.ok) {
        throw new Error("Failed to generate speech. Please try again.");
      }
  
      const data = await response.json();
  
      if (data.speech) {
        setGeneratedSpeech(data.speech);
        toast.success("Your speech draft has been created successfully.");
      } else {
        throw new Error("Speech generation failed.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  };


  const saveSpeechAsPDF = () => {
    if (!generatedSpeech) {
      toast.warning("No speech content available to save.");
      return;
    }
  
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Generated Speech", 20, 20);
  
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
  
    let y = 40; // Initial vertical position
  
    // Splitting the generated speech into lines and adding it to the PDF
    const lines = doc.splitTextToSize(generatedSpeech, 170);
    lines.forEach((line, index) => {
      doc.text(line, 20, y + index * 8);
    });
  
    doc.save("generated_speech.pdf");
    toast.success("Generated speech saved as PDF!");
  };
  
  


 

  const analyzeSpeech = async () => {
    if (!transcribedText) {
      toast("Please record your speech first.");
      return;
    }
  
    setIsAnalyzing(true);
  
    try {
      const response = await fetch("/api/public-speaking/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcribedText }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to analyze speech.");
      }
  
      const feedback: SpeechFeedback = await response.json();
      setSpeechFeedback(feedback);
      toast("Your speech has been analyzed successfully.");
    } catch (error) {
      console.error("Error analyzing speech:", error);
      toast.error("Failed to analyze speech. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };
  

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Public Speaking Practice</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-10">
          <TabsTrigger value="event">Event Management</TabsTrigger>
          <TabsTrigger value="practice">Speaking Practice</TabsTrigger>
        </TabsList>
        <TabsContent value="event">
          <div className="grid gap-6 md:grid-cols-2">

            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
                <CardDescription>Enter information about your speaking event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    value={eventDetails.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter event title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Event Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {eventDetails.date ? format(eventDetails.date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={eventDetails.date}
                        onSelect={(date) => handleInputChange("date", date)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={eventDetails.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Enter event location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audience">Audience Type</Label>
                  <Select value={eventDetails.audience} onValueChange={(value) => handleInputChange("audience", value)}>
                    <SelectTrigger id="audience">
                      <SelectValue placeholder="Select audience type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Public</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="students">Students</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="speakerName">Speaker Name</Label>
                  <Input
                    id="speakerName"
                    value={eventDetails.speakerName}
                    onChange={(e) => handleInputChange("speakerName", e.target.value)}
                    placeholder="Enter speaker name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic">Speech Topic</Label>
                  <Input
                    id="topic"
                    value={eventDetails.topic}
                    onChange={(e) => handleInputChange("topic", e.target.value)}
                    placeholder="Enter speech topic"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Select value={eventDetails.duration} onValueChange={(value) => handleInputChange("duration", value)}>
                    <SelectTrigger id="duration">
                      <SelectValue placeholder="Select speech duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1min">1 minutes</SelectItem>
                      <SelectItem value="5min">5 minutes</SelectItem>
                      <SelectItem value="10min">10 minutes</SelectItem>
                      <SelectItem value="15min">15 minutes</SelectItem>
                      <SelectItem value="30min">30 minutes</SelectItem>
                      <SelectItem value="45min">45 minutes</SelectItem>
                      <SelectItem value="60min">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={eventDetails.additionalNotes}
                    onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                    placeholder="Enter any additional information"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleGenerateSpeech} disabled={isGenerating} className="w-full">
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Speech Draft"
                  )}
                </Button>
              </CardFooter>
            </Card>


            <Card>
              <CardHeader>
                <CardTitle>Generated Speech</CardTitle>
                <CardDescription>Your speech draft will appear here</CardDescription>
              </CardHeader>
              <CardContent>
                {generatedSpeech ? (
                  <ScrollArea className="h-[500px] w-full pr-4">
                    <div className="prose dark:prose-invert max-w-none">
                      {generatedSpeech.split("\n").map((line, index) => {
                        if (line.startsWith("# ")) {
                          return (
                            <h1 key={index} className="text-2xl font-bold mt-4">
                              {line.substring(2)}
                            </h1>
                          )
                        } else if (line.startsWith("## ")) {
                          return (
                            <h2 key={index} className="text-xl font-semibold mt-3">
                              {line.substring(3)}
                            </h2>
                          )
                        } else if (line.startsWith("1. ") || line.startsWith("2. ") || line.startsWith("3. ")) {
                          return (
                            <li key={index} className="ml-5">
                              {line.substring(3)}
                            </li>
                          )
                        } else if (line.trim() === "") {
                          return <br key={index} />
                        } else {
                          return <p key={index}>{line}</p>
                        }
                      })}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex items-center justify-center h-[500px] border rounded-md border-dashed">
                    <p className="text-muted-foreground">Fill in the event details and generate a speech draft</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <div className="flex space-x-2 w-full">
                <Button variant="outline" className="w-full" disabled={!generatedSpeech}  onClick={saveSpeechAsPDF}>
                  <Save className="mr-2 h-4 w-4" />
                  Save as PDF
                </Button>
                  <Button className="w-full" disabled={!generatedSpeech} onClick={() => setActiveTab("practice")}>
                    Practice Now
                  </Button>
                </div>
              </CardFooter>
            </Card>

          </div>
        </TabsContent>

        <TabsContent value="practice">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Speech Practice</CardTitle>
                <CardDescription>Record yourself practicing your speech</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center space-y-6 py-10">
                  <div className="relative w-32 h-32 rounded-full bg-secondary flex items-center justify-center">
                    {isRecording ? (
                      <div className="absolute inset-0 rounded-full animate-pulse bg-red-500/20"></div>
                    ) : null}
                    <div
                      className={`w-24 h-24 rounded-full ${isRecording ? "bg-red-500" : "bg-primary"} flex items-center justify-center`}
                    >
                      {isRecording ? (
                        <MicOff className="h-10 w-10 text-white" />
                      ) : (
                        <Mic className="h-10 w-10 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="text-2xl font-mono">{formatTime(recordingTime)}</div>
                  <div className="flex space-x-4">
                    {isRecording ? (
                      <Button variant="destructive" onClick={stopRecording}>
                        <Pause className="mr-2 h-4 w-4" /> Stop
                      </Button>
                    ) : (
                      <Button onClick={startRecording}>
                        <Play className="mr-2 h-4 w-4" /> Start Recording
                      </Button>
                    )}
                    <Button variant="outline" onClick={resetRecording}>
                      <RotateCcw className="mr-2 h-4 w-4" /> Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" disabled={!transcribedText || isAnalyzing} onClick={analyzeSpeech}>
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Speech"
                  )}
                </Button>
              </CardFooter>
            </Card>


            <Card>
              <CardHeader>
                <CardTitle>Speech Analysis</CardTitle>
                <CardDescription>Feedback on your speech performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {transcribedText ? (
                  <>
                    <div>
                      <h3 className="font-semibold mb-2">Transcribed Speech:</h3>
                      <ScrollArea className="h-[150px] w-full border rounded-md p-4">
                        <p>{transcribedText}</p>
                      </ScrollArea>
                    </div>

                    {speechFeedback ? (
                      <div className="space-y-4 mt-4">
                        <h3 className="font-semibold">Performance Analysis:</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Clarity</Label>
                            <Progress value={speechFeedback.clarity} />
                            <p className="text-xs text-right">{speechFeedback.clarity}/100</p>
                          </div>
                          <div className="space-y-2">
                            <Label>Pace</Label>
                            <Progress value={speechFeedback.pace} />
                            <p className="text-xs text-right">{speechFeedback.pace}/100</p>
                          </div>
                          <div className="space-y-2">
                            <Label>Content</Label>
                            <Progress value={speechFeedback.content} />
                            <p className="text-xs text-right">{speechFeedback.content}/100</p>
                          </div>
                          <div className="space-y-2">
                            <Label>Confidence</Label>
                            <Progress value={speechFeedback.confidence} />
                            <p className="text-xs text-right">{speechFeedback.confidence}/100</p>
                          </div>
                        </div>

                        <div className="pt-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Overall Score:</h3>
                            <Badge className="text-lg px-3 py-1">{speechFeedback.overallScore}/100</Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-semibold">Strengths:</h3>
                          <ul className="list-disc list-inside space-y-1">
                            {speechFeedback.strengths.map((strength, index) => (
                              <li key={index}>{strength}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-semibold">Areas for Improvement:</h3>
                          <ul className="list-disc list-inside space-y-1">
                            {speechFeedback.improvements.map((improvement, index) => (
                              <li key={index}>{improvement}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-[200px] border rounded-md border-dashed">
                        <p className="text-muted-foreground">Click "Analyze Speech" to get feedback</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-[400px] border rounded-md border-dashed">
                    <p className="text-muted-foreground">Record your speech to see the transcription and analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

