import React from 'react';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { WARM_CREATIVE_COLORS, InteractionType } from '../../types';
import { useSocialBattery } from '../../context/SocialBatteryContext';
import { DateUtils } from '../../utils/socialBatteryCalculator';

interface SocialTrendsPreviewProps {
  className?: string;
}

// Styled components
const Container = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #333;
`;

const ViewToggle = styled.div`
  display: flex;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const ToggleButton = styled.button<{ isActive: boolean }>`
  padding: 8px 16px;
  border: none;
  background: ${props => props.isActive ? WARM_CREATIVE_COLORS.GOLDEN_YELLOW : 'white'};
  color: ${props => props.isActive ? 'white' : '#666'};
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.isActive ? WARM_CREATIVE_COLORS.GOLDEN_YELLOW : '#f5f5f5'};
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartContainer = styled.div`
  height: 200px;
  position: relative;
`;

const ChartTitle = styled.h4`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
`;

const StatCard = styled.div`
  padding: 16px;
  background: ${WARM_CREATIVE_COLORS.SOFT_CREAM};
  border-radius: 12px;
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

const InsightsList = styled.ul`
  margin: 16px 0 0 0;
  padding: 0;
  list-style: none;
`;

const InsightItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 0;
  font-size: 14px;
  color: #666;
  
  &::before {
    content: '💡';
    font-size: 16px;
    flex-shrink: 0;
  }
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
`;

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'white',
        padding: '12px',
        border: `2px solid ${WARM_CREATIVE_COLORS.GOLDEN_YELLOW}`,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ 
            margin: '4px 0 0 0', 
            fontSize: '14px',
            color: entry.color 
          }}>
            {entry.name}: {entry.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const getInteractionTypeColor = (type: InteractionType): string => {
  switch (type) {
    case InteractionType.WORK_MEETING: return WARM_CREATIVE_COLORS.DEEP_CORAL;
    case InteractionType.SOCIAL_GATHERING: return WARM_CREATIVE_COLORS.WARM_ORANGE;
    case InteractionType.CLOSE_FRIENDS: return WARM_CREATIVE_COLORS.GOLDEN_YELLOW;
    case InteractionType.FAMILY_TIME: return WARM_CREATIVE_COLORS.SAGE_GREEN;
    case InteractionType.SOLO_TIME: return WARM_CREATIVE_COLORS.CALM_BLUE;
    default: return '#666';
  }
};

export function SocialTrendsPreview({ className }: SocialTrendsPreviewProps) {
  const [activeView, setActiveView] = React.useState<'week' | 'month'>('week');
  const { getWeeklyInteractions } = useSocialBattery();
  
  const interactions = getWeeklyInteractions();
  
  if (interactions.length === 0) {
    return (
      <Container className={className}>
        <Header>
          <Title>Weekly Social Energy Trends</Title>
        </Header>
        <NoDataMessage>
          No interaction data available for this week. Start logging interactions to see trends!
        </NoDataMessage>
      </Container>
    );
  }
  
  // Prepare data for line chart (daily energy levels)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });
  
  const dailyData = last7Days.map(date => {
    const dayInteractions = interactions.filter(
      i => i.timestamp.toDateString() === date.toDateString()
    );
    
    const avgEnergyBefore = dayInteractions.length > 0
      ? dayInteractions.reduce((sum, i) => sum + i.energyBefore, 0) / dayInteractions.length
      : null;
    
    const avgEnergyAfter = dayInteractions.length > 0
      ? dayInteractions.reduce((sum, i) => sum + i.energyAfter, 0) / dayInteractions.length
      : null;
    
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      energyBefore: avgEnergyBefore ? Math.round(avgEnergyBefore) : null,
      energyAfter: avgEnergyAfter ? Math.round(avgEnergyAfter) : null,
      interactionCount: dayInteractions.length
    };
  });
  
  // Prepare data for bar chart (interaction types)
  const typeStats = interactions.reduce((acc, interaction) => {
    acc[interaction.type] = (acc[interaction.type] || 0) + interaction.duration;
    return acc;
  }, {} as Record<InteractionType, number>);
  
  const typeData = Object.entries(typeStats).map(([type, duration]) => ({
    type: type.replace('_', ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' '),
    duration: Math.round(duration / 60 * 10) / 10, // Convert to hours
    color: getInteractionTypeColor(type as InteractionType)
  }));
  
  // Calculate insights
  const totalTime = interactions.reduce((sum, i) => sum + i.duration, 0);
  const avgEnergyDrop = interactions.length > 0
    ? interactions.reduce((sum, i) => sum + (i.energyBefore - i.energyAfter), 0) / interactions.length
    : 0;
  
  const mostDrainingType = typeData.reduce((max, current) => 
    current.duration > max.duration ? current : max
  , typeData[0]);
  
  const avgEnjoyment = interactions.length > 0
    ? interactions.reduce((sum, i) => sum + i.enjoyment, 0) / interactions.length
    : 0;
  
  const insights = [
    `You spent ${DateUtils.formatDuration(totalTime)} in social interactions this week`,
    `Average energy drop per interaction: ${Math.round(avgEnergyDrop)}%`,
    mostDrainingType ? `Most time spent on: ${mostDrainingType.type}` : '',
    `Average enjoyment rating: ${avgEnjoyment.toFixed(1)}/10`
  ].filter(Boolean);
  
  return (
    <Container className={className}>
      <Header>
        <Title>Weekly Social Energy Trends</Title>
        <ViewToggle>
          <ToggleButton 
            isActive={activeView === 'week'} 
            onClick={() => setActiveView('week')}
          >
            This Week
          </ToggleButton>
          <ToggleButton 
            isActive={activeView === 'month'} 
            onClick={() => setActiveView('month')}
          >
            This Month
          </ToggleButton>
        </ViewToggle>
      </Header>
      
      <ChartsGrid>
        <ChartContainer>
          <ChartTitle>Daily Energy Levels</ChartTitle>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                fontSize={12}
              />
              <YAxis 
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="energyBefore" 
                stroke={WARM_CREATIVE_COLORS.SAGE_GREEN}
                strokeWidth={3}
                name="Before"
                connectNulls={false}
              />
              <Line 
                type="monotone" 
                dataKey="energyAfter" 
                stroke={WARM_CREATIVE_COLORS.WARM_ORANGE}
                strokeWidth={3}
                name="After"
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        <ChartContainer>
          <ChartTitle>Time by Type (hours)</ChartTitle>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={typeData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" fontSize={12} />
              <YAxis 
                dataKey="type" 
                type="category" 
                fontSize={11}
                width={80}
              />
              <Tooltip />
              <Bar 
                dataKey="duration" 
                fill={WARM_CREATIVE_COLORS.GOLDEN_YELLOW}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </ChartsGrid>
      
      <StatsGrid>
        <StatCard>
          <StatValue>{interactions.length}</StatValue>
          <StatLabel>Interactions</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatValue>{DateUtils.formatDuration(totalTime)}</StatValue>
          <StatLabel>Total Time</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatValue>{avgEnjoyment.toFixed(1)}/10</StatValue>
          <StatLabel>Avg Enjoyment</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatValue>{Math.round(avgEnergyDrop)}%</StatValue>
          <StatLabel>Avg Energy Drop</StatLabel>
        </StatCard>
      </StatsGrid>
      
      <InsightsList>
        {insights.map((insight, index) => (
          <InsightItem key={index}>{insight}</InsightItem>
        ))}
      </InsightsList>
    </Container>
  );
}