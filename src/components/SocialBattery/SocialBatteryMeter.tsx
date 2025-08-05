import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { WARM_CREATIVE_COLORS } from '../../types';

interface SocialBatteryMeterProps {
  level: number; // 0-100
  size?: 'small' | 'medium' | 'large';
  showPercentage?: boolean;
  animated?: boolean;
  className?: string;
}

const getBatteryColor = (level: number): string => {
  if (level >= 75) return WARM_CREATIVE_COLORS.GOLDEN_YELLOW;
  if (level >= 50) return WARM_CREATIVE_COLORS.WARM_ORANGE;
  if (level >= 25) return WARM_CREATIVE_COLORS.DEEP_CORAL;
  return WARM_CREATIVE_COLORS.MUTED_RED;
};

const getBatteryColorGradient = (level: number): string => {
  const color = getBatteryColor(level);
  const opacity = Math.max(0.3, level / 100);
  return `linear-gradient(180deg, ${color} 0%, ${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')} 100%)`;
};

// Animations
const chargeAnimation = keyframes`
  0% { transform: translateY(2px); opacity: 0.7; }
  50% { transform: translateY(-2px); opacity: 1; }
  100% { transform: translateY(2px); opacity: 0.7; }
`;

const criticalPulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 ${WARM_CREATIVE_COLORS.MUTED_RED}40; }
  50% { box-shadow: 0 0 0 8px ${WARM_CREATIVE_COLORS.MUTED_RED}00; }
`;

const fillAnimation = keyframes`
  from { height: 0%; }
  to { height: var(--fill-height); }
`;

// Styled components
const BatteryContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['size', 'level'].includes(prop)
})<{ size: string; level: number }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  
  ${props => props.level < 20 && css`
    animation: ${criticalPulse} 2s infinite;
    border-radius: 50%;
  `}
`;

const BatteryOuter = styled.div<{ size: string }>`
  position: relative;
  background: #f5f5f5;
  border: 3px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  
  ${props => {
    switch (props.size) {
      case 'small':
        return `
          width: 40px;
          height: 70px;
        `;
      case 'large':
        return `
          width: 80px;
          height: 140px;
        `;
      default: // medium
        return `
          width: 60px;
          height: 105px;
        `;
    }
  }}
  
  &::before {
    content: '';
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 25%;
    height: 6px;
    background: #e0e0e0;
    border-radius: 0 0 3px 3px;
  }
`;

const BatteryFill = styled.div<{ 
  level: number; 
  animated: boolean; 
  size: string 
}>`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: ${props => getBatteryColorGradient(props.level)};
  transition: all 0.5s ease-in-out;
  --fill-height: ${props => props.level}%;
  height: ${props => props.level}%;
  
  ${props => props.animated && css`
    animation: ${fillAnimation} 1s ease-out;
  `}
  
  ${props => props.level > 0 && props.level < 100 && css`
    &::after {
      content: '';
      position: absolute;
      top: -2px;
      left: 0;
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, 
        transparent 0%, 
        ${getBatteryColor(props.level)}80 25%, 
        ${getBatteryColor(props.level)} 50%, 
        ${getBatteryColor(props.level)}80 75%, 
        transparent 100%
      );
      animation: ${chargeAnimation} 2s ease-in-out infinite;
    }
  `}
`;

const BatteryPercentage = styled.div<{ level: number; size: string }>`
  font-weight: 600;
  color: ${props => getBatteryColor(props.level)};
  text-align: center;
  
  ${props => {
    switch (props.size) {
      case 'small':
        return `font-size: 12px;`;
      case 'large':
        return `font-size: 18px;`;
      default:
        return `font-size: 14px;`;
    }
  }}
`;

const BatteryLabel = styled.div<{ size: string }>`
  color: #666;
  text-align: center;
  
  ${props => {
    switch (props.size) {
      case 'small':
        return `font-size: 10px;`;
      case 'large':
        return `font-size: 14px;`;
      default:
        return `font-size: 12px;`;
    }
  }}
`;

const StatusIndicator = styled.div<{ level: number }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => getBatteryColor(props.level)};
  margin-top: 4px;
  
  ${props => props.level < 20 && `
    animation: ${criticalPulse} 1.5s infinite;
  `}
`;

export function SocialBatteryMeter({ 
  level, 
  size = 'medium', 
  showPercentage = true, 
  animated = true,
  className 
}: SocialBatteryMeterProps) {
  const clampedLevel = Math.min(100, Math.max(0, level));
  
  const getStatusText = (level: number): string => {
    if (level >= 80) return 'Fully Charged';
    if (level >= 60) return 'Good Energy';
    if (level >= 40) return 'Getting Drained';
    if (level >= 20) return 'Low Battery';
    return 'Critical - Need Recovery';
  };
  
  return (
    <BatteryContainer 
      className={className} 
      size={size} 
      level={clampedLevel}
      role="progressbar"
      aria-valuenow={clampedLevel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Social battery level: ${clampedLevel}%`}
    >
      <BatteryOuter size={size}>
        <BatteryFill 
          level={clampedLevel} 
          animated={animated} 
          size={size}
        />
      </BatteryOuter>
      
      {showPercentage && (
        <BatteryPercentage level={clampedLevel} size={size}>
          {clampedLevel}%
        </BatteryPercentage>
      )}
      
      <BatteryLabel size={size}>
        {getStatusText(clampedLevel)}
      </BatteryLabel>
      
      <StatusIndicator level={clampedLevel} />
    </BatteryContainer>
  );
}