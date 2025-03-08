import { useState, useCallback, useEffect } from "react";
import useMeditationStaking from "./useMeditationStakingContract";
import { ethers } from "ethers";
import { toast } from "sonner"; 

type Message = {
  role: "user" | "bot";
  content: string;
};

enum FunctionName {
  STAKE = "stake",
  WITHDRAW = "withdraw",
  CHECKIN = "checkin",
  REGISTER = "register",
  LASTCHECKTIME = "lastchecktime",
  HASSTAKED = "hasstaked",
  ADHERENCECOUNT = "adherencecount",
  CHECKBALANCE = "getbalance",
  STEPS= "numberOfSteps",
  GENERIC = "generic",
  CLAIMREWARDS = "claimRewards"
}

const useChainbot = (initialMessages: Message[] = []) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [functionName, setFunctionName] = useState<FunctionName | null>(null);

  const { stake, register, withdraw, checkIn, userData } = useMeditationStaking();
  useEffect(()=>console.log(userData), [userData])
  const handleSend = useCallback(async () => {
    if (input.trim() === "") return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/blockchain-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "An unknown error occurred");
        toast.error(data.error || "An unknown error occurred");  
        return;
      }

      const data = await response.json();

      if (data.functionName) {
        const { functionName, parameters } = data;

        setFunctionName(functionName as FunctionName);

        // const botMessage: Message = {
        //   role: "bot",
        //   content: `I detected that you want to call the function "${functionName}" with parameters: ${JSON.stringify(
        //     parameters
        //   )}`,
        // };
        // setMessages((prev) => [...prev, botMessage]);

        let botMessageUserData: Message = { role: "bot", content: "" };

        switch (functionName) {
          case FunctionName.STAKE:
            const amountToStake = parameters.amount.toString();  
            console.log(parameters.amount)
            try {
              stake(amountToStake);
            } catch (err) {
              console.error("Error staking:", err);
              toast.error("Invalid amount for staking");
            }
            break;
          case FunctionName.CLAIMREWARDS:
            // const stepsToAdd = parameters.toString();  
            // try {
            //   addRewards(stepsToAdd);
            // } catch (err) {
            //   console.error("Error claiming:", err);
            //   toast.error("Invalid amount to claim");
            // }
            break;
          case FunctionName.WITHDRAW:
            withdraw();
            break;
          case FunctionName.CHECKIN:
            checkIn();
            break;
          case FunctionName.REGISTER:
            register();
            break;
          case FunctionName.ADHERENCECOUNT:
            botMessageUserData = {
              role: "bot",
              content: `You have Checked in a total of ${Number(userData.adherencecount)}`,
            };
            setMessages((prev) => [...prev, botMessageUserData]);
            break;
          case FunctionName.HASSTAKED:
            botMessageUserData = {
              role: "bot",
              content: userData.hasStaked
                ? `You have staked a total of ${ethers.utils.formatUnits(userData.stakeAmount.toString(), 18)}`
                : "You haven't staked",
            };
            setMessages((prev) => [...prev, botMessageUserData]);
            break;
          case FunctionName.LASTCHECKTIME:
            botMessageUserData = {
              role: "bot",
              content: `Your last check time is ${userData.lastCheckInTime}`,
            };
            setMessages((prev) => [...prev, botMessageUserData]);
            break;
          case FunctionName.CHECKBALANCE:
            botMessageUserData = {
              role: "bot",
              content: `Your balance is ${ethers.utils.formatUnits(userData.stakeAmount.toString(), 18)} ETH`,
            };
            setMessages((prev) => [...prev, botMessageUserData]);
            break;
          case FunctionName.STEPS:
            botMessageUserData = {
              role: "bot",
              content: `You have walked a total of ${Math.round(+ethers.utils.formatUnits(userData.numberOfSteps.toString(), 18))} steps`,
            };
            setMessages((prev) => [...prev, botMessageUserData]);
            break;
          case FunctionName.GENERIC:
            botMessageUserData = {
              role: "bot",
              content: "I cannot answer that.",
            };
            setMessages((prev) => [...prev, botMessageUserData]);
            break;
          default:
            throw new Error(`Unsupported function: ${functionName}`);
        }
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
      toast.error(error instanceof Error ? error.message : "An unknown error occurred");  // Show error alert with Sonner
    } finally {
      setLoading(false);
    }
  }, [input, stake, register, withdraw, checkIn, userData]);

  return {
    messages,
    input,
    setInput,
    loading,
    error,
    handleSend,
    functionName,
  };
};


export default useChainbot;