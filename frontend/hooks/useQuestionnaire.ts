import { useState } from 'react';

interface Question {
  id: number;
  text: string;
}

interface Option {
  value: string;
  label: string;
}

const questions: Question[] = [
  { id: 1, text: "Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?" },
  { id: 2, text: "Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?" },
  { id: 3, text: "Over the last 2 weeks, how often have you been bothered by trouble falling or staying asleep, or sleeping too much?" },
  { id: 4, text: "Over the last 2 weeks, how often have you been bothered by feeling tired or having little energy?" },
  { id: 5, text: "Over the last 2 weeks, how often have you been bothered by poor appetite or overeating?" },
];

const options: Option[] = [
  { value: '0', label: 'Not at all' },
  { value: '1', label: 'Several days' },
  { value: '2', label: 'More than half the days' },
  { value: '3', label: 'Nearly every day' },
];

export const useQuestionnaire = () => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({ ...prev, [questions[currentQuestion].id]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const questionnaireData = questions.map(question => ({
      id: question.id,
      answer: answers[question.id],
    }));

    try {

      const res = await fetch(`/api/process-questionnaire`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          responses: questionnaireData,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setResponse(result.response);
      } else {
        console.error("Failed to submit answers");
        setResponse("There was an error submitting your answers. Please try again later.");
      }
    } catch (error) {
      console.error("Error submitting answers:", error);
      setResponse("There was an error submitting your answers. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return {
    questions,
    options,
    answers,
    currentQuestion,
    response,
    loading,
    handleAnswer,
    handleSubmit,
    setCurrentQuestion,
  };
};
