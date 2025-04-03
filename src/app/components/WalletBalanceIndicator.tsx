"use client";
import { useState, useEffect } from 'react';
import { DollarSign, Wallet, AlertCircle } from 'lucide-react';
import { getUSDTBalance, checkUSDTAllowance } from '../services/blockchain';

interface WalletBalanceIndicatorProps {
  walletConnected: boolean;
}

const WalletBalanceIndicator = ({ walletConnected }: WalletBalanceIndicatorProps) => {
  const [usdtBalance, setUsdtBalance] = useState<string>("0.00");
  const [usdtAllowance, setUsdtAllowance] = useState<string>("0.00");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  
  // Fetch balance and allowance when component mounts or wallet connects
  useEffect(() => {
    const fetchBalanceAndAllowance = async () => {
      if (!walletConnected) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError("");
      
      try {
        const balance = await getUSDTBalance();
        const allowance = await checkUSDTAllowance();
        
        setUsdtBalance(balance);
        setUsdtAllowance(allowance);
      } catch (error) {
        console.error("Error fetching balance or allowance:", error);
        setError("Failed to fetch wallet data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBalanceAndAllowance();
    
    // Refresh data every 30 seconds
    const intervalId = setInterval(fetchBalanceAndAllowance, 30000);
    return () => clearInterval(intervalId);
  }, [walletConnected]);
  
  if (!walletConnected) {
    return null;
  }
  
  if (isLoading) {
    return (
      <div className="text-gray-500 text-xs flex items-center">
        <Wallet size={16} className="mr-1" />
        <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-blue-400 rounded-full animate-spin"></span>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="text-red-500 text-xs flex items-center" title={error}>
        <AlertCircle size={16} className="mr-1" />
        Error
      </div>
    );
  }
  
  const formattedBalance = parseFloat(usdtBalance).toFixed(2);
  const hasAllowance = parseFloat(usdtAllowance) > 0;
  
  return (
    <div className="flex items-center gap-2">
      <div 
        className="text-gray-700 text-xs flex items-center px-2 py-1 bg-gray-100 rounded"
        title="Your USDT Balance"
      >
        <DollarSign size={12} className="mr-1 text-blue-500" />
        {formattedBalance}
      </div>
      
      {hasAllowance && (
        <div 
          className="text-green-700 text-xs flex items-center"
          title="Your USDT Allowance for Task Bounties"
        >
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
        </div>
      )}
    </div>
  );
};

export default WalletBalanceIndicator;