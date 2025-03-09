'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import useMeditationStaking from '@/hooks/useMeditationStakingContract'
import { toast } from 'sonner'

const MINIMUM_STAKE = 0.1

export default function Stake() {
  const [stakeAmount, setStakeAmount] = useState('')
  const [isStaked, setIsStaked] = useState(false)
  const { stake, withdraw, isLoading, register, userData } = useMeditationStaking();

  useEffect(() => {
    console.log(userData)
    if (userData) {
      setIsStaked(userData?.hasStaked); 
    }
  }, [userData]);

  const handleCashOut = async () => {
    try {
      toast.loading('Processing cash-out...', { id: 'cash-out' });
      await withdraw();
      setIsStaked(false);
      setStakeAmount('');
    } catch (err) {
      console.error('Cash-out failed:', err);
      toast.error('Cash-out failed. Please try again!', { id: 'cash-out' });
    }
  }

  const handleStake = async () => {
    if (parseFloat(stakeAmount) < MINIMUM_STAKE) {
      toast.error(`Amount must be at least ${MINIMUM_STAKE} ETH`, { id: 'stake-error' });
      return;
    }

    if (!userData) {
      try {
        toast.loading('Registering user...', { id: 'register' });
        await register();  
        toast.success('Registration successful!', { id: 'register' });
      } catch (err) {
        console.error('Registration failed', err);
        toast.error('Registration failed. Please try again!', { id: 'register' });
        return;
      }
    }

    try {
      toast.loading('Processing stake...', { id: 'stake' });
      await stake(stakeAmount);
      setIsStaked(true);
      setStakeAmount('');
    } catch (err) {
      console.error('Staking failed', err);
      toast.error('Staking failed. Please try again!', { id: 'stake' });
    }
  }

  return (
    <div>
      <div className="space-y-6">
        <div className='flex justify-between'>
          <h1 className="text-3xl font-bold">Stake ETH for Meditation Commitment</h1>
          <Button 
            onClick={handleCashOut} 
            disabled={isLoading || !isStaked}
          >
            {isLoading ? 'Processing...' : 'Cash Out'}
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Stake Your ETH</CardTitle>
            <CardDescription>Stake ETH to commit to your daily meditation practice</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stake-amount">Stake Amount (ETH)</Label>
              <Input
                id="stake-amount"
                type="number"
                placeholder="Enter amount to stake"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                min={MINIMUM_STAKE}
                step={0.01}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Minimum stake: {MINIMUM_STAKE} ETH
            </p>
          </CardContent>

          <CardFooter>
            <Button 
              onClick={handleStake} 
              disabled={isStaked || isLoading || !stakeAmount || parseFloat(stakeAmount) < MINIMUM_STAKE}
            >
              {isStaked ? 'Staked' : isLoading ? 'Processing...' : 'Stake ETH'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
