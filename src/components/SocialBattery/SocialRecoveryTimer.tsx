import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { WARM_CREATIVE_COLORS } from '../../types';
import { useSocialBattery } from '../../context/SocialBatteryContext';
import { SocialBatteryCalculator } from '../../utils/socialBatteryCalculator';

interface SocialRecoveryTimerProps {
  targetLevel?: number;
  showRecommendations?: boolean;
  className?: string;
}

// Animations
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

const progressAnimation = keyframes`
  from { width: 0%; }
  to { width: var(--progress-width); }
`;

// Styled components
const Container = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid ${WARM_CREATIVE_COLORS.LIGHT_PEACH};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TimerIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isRecovering'
})<{ isRecovering: boolean }>`
  font-size: 20px;
  ${props => props.isRecovering && css`
    animation: ${pulse} 2s infinite;
  `}
`;

const TargetSelector = styled.select`
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${WARM_CREATIVE_COLORS.GOLDEN_YELLOW};
  }
`;

const ProgressSection = styled.div`
  margin-bottom: 20px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 12px;
  background: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;
  position: relative;
`;

const ProgressFill = styled.div.withConfig({
  shouldForwardProp: (prop) => !['progress', 'animated'].includes(prop)
})<{ 
  progress: number; 
  animated: boolean 
}>`
  height: 100%;
  background: linear-gradient(90deg, 
    ${WARM_CREATIVE_COLORS.SAGE_GREEN}, 
    ${WARM_CREATIVE_COLORS.GOLDEN_YELLOW}
  );
  border-radius: 6px;
  transition: width 0.5s ease;
  --progress-width: ${props => props.progress}%;
  width: ${props => props.progress}%;
  
  ${props => props.animated && css`
    animation: ${progressAnimation} 1s ease-out;
  `}
`;

const ProgressLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
`;

const TimeDisplay = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const TimeValue = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isImmediate'
})<{ isImmediate: boolean }>`
  font-size: 32px;
  font-weight: 700;
  color: ${props => props.isImmediate ? WARM_CREATIVE_COLORS.SAGE_GREEN : WARM_CREATIVE_COLORS.GOLDEN_YELLOW};
  margin-bottom: 4px;
`;

const TimeLabel = styled.div`
  font-size: 14px;
  color: #666;
`;

const StatusMessage = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'status'
})<{ status: 'good' | 'warning' | 'critical' }>`
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 16px;
  background: ${props => {
    switch (props.status) {
      case 'good': return WARM_CREATIVE_COLORS.SAGE_GREEN + '20';
      case 'warning': return WARM_CREATIVE_COLORS.WARM_ORANGE + '20';
      case 'critical': return WARM_CREATIVE_COLORS.DEEP_CORAL + '20';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'good': return WARM_CREATIVE_COLORS.SAGE_GREEN;
      case 'warning': return WARM_CREATIVE_COLORS.WARM_ORANGE;
      case 'critical': return WARM_CREATIVE_COLORS.DEEP_CORAL;
    }
  }};
`;

const RecommendationsSection = styled.div`
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
`;

const RecommendationTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const RecommendationList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const RecommendationItem = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 14px;
  color: #666;
  
  &::before {
    content: '💡';
    font-size: 16px;
  }
`;

const formatTime = (hours: number): string => {
  if (hours === 0) return 'Ready!';
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  return `${days}d ${remainingHours}h`;
};

const getStatusMessage = (currentLevel: number, targetLevel: number, hoursRemaining: number) => {
  if (currentLevel >= targetLevel) {
    return {
      status: 'good' as const,
      message: `🎉 You've reached your target energy level of ${targetLevel}%!`
    };
  }
  
  if (hoursRemaining <= 1) {
    return {
      status: 'good' as const,
      message: `Almost there! Less than an hour to reach ${targetLevel}%`
    };
  }
  
  if (hoursRemaining <= 4) {
    return {
      status: 'warning' as const,
      message: `You'll reach ${targetLevel}% in about ${formatTime(hoursRemaining)}`
    };
  }
  
  return {
    status: 'critical' as const,
    message: `It will take ${formatTime(hoursRemaining)} to recover to ${targetLevel}%`
  };
};

const getQuickRecommendations = (currentLevel: number, hoursRemaining: number) => {
  const recommendations: string[] = [];
  
  if (currentLevel < 30) {
    recommendations.push('Take immediate solo time (15-30 minutes)');
    recommendations.push('Avoid all non-essential social interactions');
    recommendations.push('Practice deep breathing or meditation');
  } else if (currentLevel < 50) {
    recommendations.push('Limit social interactions for the next few hours');
    recommendations.push('Take regular breaks from people');
    recommendations.push('Engage in a solo creative activity');
  } else if (currentLevel < 70) {
    recommendations.push('Be selective with social commitments');
    recommendations.push('Schedule some quiet time today');
    recommendations.push('Choose quality over quantity in interactions');
  }
  
  if (hoursRemaining > 8) {
    recommendations.push('Consider taking the day off from social events');
    recommendations.push('Prioritize sleep and rest tonight');
  }
  
  return recommendations.slice(0, 3); // Max 3 recommendations
};

export function SocialRecoveryTimer({ 
  targetLevel = 70, 
  showRecommendations = true, 
  className 
}: SocialRecoveryTimerProps) {
  const { state } = useSocialBattery();
  const [customTarget, setCustomTarget] = useState(targetLevel);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  const currentLevel = state.socialBattery.currentLevel;
  const recoveryRate = state.socialBattery.recoveryRate;
  
  // Calculate recovery time
  useEffect(() => {
    const hoursNeeded = SocialBatteryCalculator.estimateRecoveryTime(
      currentLevel,
      customTarget,
      recoveryRate
    );
    setTimeRemaining(hoursNeeded);
  }, [currentLevel, customTarget, recoveryRate]);
  
  // Update timer every minute
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentLevel < customTarget) {
        const hoursNeeded = SocialBatteryCalculator.estimateRecoveryTime(
          currentLevel,
          customTarget,
          recoveryRate
        );
        setTimeRemaining(hoursNeeded);
      }
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [currentLevel, customTarget, recoveryRate]);
  
  const progress = Math.min(100, (currentLevel / customTarget) * 100);
  const isRecovering = currentLevel < customTarget && timeRemaining > 0;
  const isComplete = currentLevel >= customTarget;
  
  const statusInfo = getStatusMessage(currentLevel, customTarget, timeRemaining);
  const recommendations = getQuickRecommendations(currentLevel, timeRemaining);
  
  return (
    <Container className={className}>
      <Header>
        <Title>
          <TimerIcon isRecovering={isRecovering}>
            {isComplete ? '✅' : isRecovering ? '⏳' : '⚡'}
          </TimerIcon>
          Recovery Timer
        </Title>
        
        <TargetSelector
          value={customTarget}
          onChange={(e) => setCustomTarget(Number(e.target.value))}
        >
          <option value={50}>50% - Basic Function</option>
          <option value={60}>60% - Comfortable</option>
          <option value={70}>70% - Good Energy</option>
          <option value={80}>80% - High Energy</option>
          <option value={90}>90% - Peak Performance</option>
          <option value={100}>100% - Fully Charged</option>
        </TargetSelector>
      </Header>
      
      <ProgressSection>
        <ProgressBar>
          <ProgressFill 
            progress={progress} 
            animated={true}
          />
        </ProgressBar>
        <ProgressLabels>
          <span>Current: {currentLevel}%</span>
          <span>Target: {customTarget}%</span>
        </ProgressLabels>
      </ProgressSection>
      
      <TimeDisplay>
        <TimeValue isImmediate={timeRemaining === 0}>
          {formatTime(timeRemaining)}
        </TimeValue>
        <TimeLabel>
          {isComplete ? 'Target reached!' : 'until target level'}
        </TimeLabel>
      </TimeDisplay>
      
      <StatusMessage status={statusInfo.status}>
        {statusInfo.message}
      </StatusMessage>
      
      {showRecommendations && recommendations.length > 0 && (
        <RecommendationsSection>
          <RecommendationTitle>Quick Recovery Tips</RecommendationTitle>
          <RecommendationList>
            {recommendations.map((rec, index) => (
              <RecommendationItem key={index}>
                {rec}
              </RecommendationItem>
            ))}
          </RecommendationList>
        </RecommendationsSection>
      )}
    </Container>
  );
}