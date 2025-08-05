import React from 'react';
import styled from 'styled-components';
import { WARM_CREATIVE_COLORS } from '../../types';
import { useSocialBattery } from '../../context/SocialBatteryContext';
import { SocialBatteryMeter } from './SocialBatteryMeter';
import { DateUtils } from '../../utils/socialBatteryCalculator';

interface SocialEnergyCardProps {
  showDetails?: boolean;
  className?: string;
}

// Styled components
const Card = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'riskLevel'
})<{ riskLevel: string }>`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid ${props => {
    switch (props.riskLevel) {
      case 'critical': return WARM_CREATIVE_COLORS.MUTED_RED;
      case 'high': return WARM_CREATIVE_COLORS.DEEP_CORAL;
      case 'medium': return WARM_CREATIVE_COLORS.WARM_ORANGE;
      default: return '#e0e0e0';
    }
  }};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #333;
`;

const StatusBadge = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'riskLevel'
})<{ riskLevel: string }>`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch (props.riskLevel) {
      case 'critical': return WARM_CREATIVE_COLORS.MUTED_RED + '20';
      case 'high': return WARM_CREATIVE_COLORS.DEEP_CORAL + '20';
      case 'medium': return WARM_CREATIVE_COLORS.WARM_ORANGE + '20';
      default: return WARM_CREATIVE_COLORS.SAGE_GREEN + '20';
    }
  }};
  color: ${props => {
    switch (props.riskLevel) {
      case 'critical': return WARM_CREATIVE_COLORS.MUTED_RED;
      case 'high': return WARM_CREATIVE_COLORS.DEEP_CORAL;
      case 'medium': return WARM_CREATIVE_COLORS.WARM_ORANGE;
      default: return WARM_CREATIVE_COLORS.SAGE_GREEN;
    }
  }};
`;

const MainContent = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 20px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  flex: 1;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${WARM_CREATIVE_COLORS.GOLDEN_YELLOW};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  font-weight: 500;
`;

const TrendIndicator = styled.div<{ trend: string }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
  color: ${props => {
    switch (props.trend) {
      case 'increasing': return WARM_CREATIVE_COLORS.SAGE_GREEN;
      case 'decreasing': return WARM_CREATIVE_COLORS.DEEP_CORAL;
      default: return '#666';
    }
  }};
`;

const RecoverySection = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
`;

const RecoveryText = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
`;

const RecoveryTime = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${WARM_CREATIVE_COLORS.GOLDEN_YELLOW};
`;

const DetailsSection = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
`;

const DetailLabel = styled.span`
  font-size: 14px;
  color: #666;
`;

const DetailValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const getStatusText = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'critical': return 'Critical';
    case 'high': return 'High Drain';
    case 'medium': return 'Moderate';
    default: return 'Good';
  }
};

const getTrendIcon = (trend: string): string => {
  switch (trend) {
    case 'increasing': return '↗️';
    case 'decreasing': return '↘️';
    default: return '➡️';
  }
};

const getTrendText = (trend: string): string => {
  switch (trend) {
    case 'increasing': return 'Recovering';
    case 'decreasing': return 'Declining';
    default: return 'Stable';
  }
};

export function SocialEnergyCard({ showDetails = false, className }: SocialEnergyCardProps) {
  const { getDashboardMetrics, getTodayInteractions, getWeeklyInteractions } = useSocialBattery();
  
  const metrics = getDashboardMetrics();
  const todayInteractions = getTodayInteractions();
  const weeklyInteractions = getWeeklyInteractions();
  
  const averageEnjoyment = todayInteractions.length > 0
    ? todayInteractions.reduce((sum, i) => sum + i.enjoyment, 0) / todayInteractions.length
    : 0;
  
  const weeklyAverage = weeklyInteractions.length > 0
    ? weeklyInteractions.reduce((sum, i) => sum + i.energyAfter, 0) / weeklyInteractions.length
    : metrics.currentSocialBattery;
  
  return (
    <Card className={className} riskLevel={metrics.riskLevel}>
      <Header>
        <Title>Social Energy</Title>
        <StatusBadge riskLevel={metrics.riskLevel}>
          {getStatusText(metrics.riskLevel)}
        </StatusBadge>
      </Header>
      
      <MainContent>
        <SocialBatteryMeter 
          level={metrics.currentSocialBattery} 
          size="large"
          animated={true}
        />
        
        <StatsGrid>
          <StatItem>
            <StatValue>{DateUtils.formatDuration(metrics.todayInteractionTime)}</StatValue>
            <StatLabel>Today</StatLabel>
          </StatItem>
          
          <StatItem>
            <StatValue>{DateUtils.formatDuration(metrics.weeklyInteractionTime)}</StatValue>
            <StatLabel>This Week</StatLabel>
          </StatItem>
          
          <StatItem>
            <StatValue>{todayInteractions.length}</StatValue>
            <StatLabel>Interactions</StatLabel>
          </StatItem>
          
          {averageEnjoyment > 0 && (
            <StatItem>
              <StatValue>{averageEnjoyment.toFixed(1)}/10</StatValue>
              <StatLabel>Avg Enjoyment</StatLabel>
            </StatItem>
          )}
        </StatsGrid>
      </MainContent>
      
      <TrendIndicator trend={metrics.energyTrend}>
        <span>{getTrendIcon(metrics.energyTrend)}</span>
        <span>{getTrendText(metrics.energyTrend)}</span>
      </TrendIndicator>
      
      {metrics.currentSocialBattery < 70 && (
        <RecoverySection>
          <RecoveryText>Estimated recovery time:</RecoveryText>
          <RecoveryTime>
            {DateUtils.getTimeUntil(metrics.nextRecoveryTime)}
          </RecoveryTime>
        </RecoverySection>
      )}
      
      {showDetails && (
        <DetailsSection>
          <DetailItem>
            <DetailLabel>Weekly Average:</DetailLabel>
            <DetailValue>{Math.round(weeklyAverage)}%</DetailValue>
          </DetailItem>
          
          <DetailItem>
            <DetailLabel>Weekly Interactions:</DetailLabel>
            <DetailValue>{weeklyInteractions.length}</DetailValue>
          </DetailItem>
          
          <DetailItem>
            <DetailLabel>Recovery Rate:</DetailLabel>
            <DetailValue>8%/hour</DetailValue>
          </DetailItem>
          
          <DetailItem>
            <DetailLabel>Risk Level:</DetailLabel>
            <DetailValue>{getStatusText(metrics.riskLevel)}</DetailValue>
          </DetailItem>
        </DetailsSection>
      )}
    </Card>
  );
}