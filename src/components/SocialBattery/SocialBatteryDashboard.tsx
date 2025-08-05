import React, { useState } from 'react';
import styled from 'styled-components';
import { WARM_CREATIVE_COLORS } from '../../types';
import { SocialEnergyCard } from './SocialEnergyCard';
import { SocialRecoveryTimer } from './SocialRecoveryTimer';
import { SocialInteractionLog } from './SocialInteractionLog';
import { SocialTrendsPreview } from './SocialTrendsPreview';
import { useSocialBattery } from '../../context/SocialBatteryContext';

interface SocialBatteryDashboardProps {
  className?: string;
}

// Styled components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, ${WARM_CREATIVE_COLORS.SOFT_CREAM}, ${WARM_CREATIVE_COLORS.LIGHT_PEACH});
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 32px;
`;

const MainTitle = styled.h1`
  font-size: 32px;
  font-weight: 800;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, ${WARM_CREATIVE_COLORS.GOLDEN_YELLOW}, ${WARM_CREATIVE_COLORS.WARM_ORANGE});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: #666;
  margin: 0 0 24px 0;
`;

const QuickActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border: 2px solid ${props => 
    props.variant === 'primary' 
      ? WARM_CREATIVE_COLORS.GOLDEN_YELLOW 
      : WARM_CREATIVE_COLORS.WARM_ORANGE
  };
  background: ${props => 
    props.variant === 'primary' 
      ? WARM_CREATIVE_COLORS.GOLDEN_YELLOW 
      : 'white'
  };
  color: ${props => 
    props.variant === 'primary' 
      ? 'white' 
      : WARM_CREATIVE_COLORS.WARM_ORANGE
  };
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => 
      props.variant === 'primary' 
        ? WARM_CREATIVE_COLORS.GOLDEN_YELLOW + '40' 
        : WARM_CREATIVE_COLORS.WARM_ORANGE + '40'
    };
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SecondaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-bottom: 32px;
`;

const Modal = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyStateTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
`;

const EmptyStateText = styled.p`
  margin: 0 0 24px 0;
  font-size: 16px;
  color: #666;
`;

export function SocialBatteryDashboard({ className }: SocialBatteryDashboardProps) {
  const [showInteractionLog, setShowInteractionLog] = useState(false);
  const { state } = useSocialBattery();
  
  const hasInteractions = state.interactions.length > 0;
  
  const handleLogInteraction = () => {
    setShowInteractionLog(true);
  };
  
  const handleCloseModal = () => {
    setShowInteractionLog(false);
  };
  
  const handleQuickSoloTime = () => {
    // Quick log solo time
    // This could open a simplified modal or directly add a solo time entry
    setShowInteractionLog(true);
  };
  
  const handleQuickUpdate = () => {
    // Quick battery level update
    const newLevel = prompt('What\'s your current social battery level? (0-100)');
    if (newLevel && !isNaN(Number(newLevel))) {
      const level = Math.min(100, Math.max(0, Number(newLevel)));
      // This would use the context method to update
      console.log('Quick update to:', level);
    }
  };
  
  return (
    <Container className={className}>
      <Header>
        <MainTitle>Social Battery Dashboard</MainTitle>
        <Subtitle>Track your social energy and optimize your interactions</Subtitle>
        
        <QuickActions>
          <ActionButton variant="primary" onClick={handleLogInteraction}>
            📝 Log Interaction
          </ActionButton>
          <ActionButton onClick={handleQuickSoloTime}>
            🧘‍♀️ Quick Solo Time
          </ActionButton>
          <ActionButton onClick={handleQuickUpdate}>
            ⚡ Update Energy
          </ActionButton>
        </QuickActions>
      </Header>
      
      <MainGrid>
        <SocialEnergyCard showDetails={true} />
        <SocialRecoveryTimer showRecommendations={true} />
      </MainGrid>
      
      <SecondaryGrid>
        {hasInteractions ? (
          <SocialTrendsPreview />
        ) : (
          <EmptyState>
            <EmptyStateIcon>📊</EmptyStateIcon>
            <EmptyStateTitle>No interaction data yet</EmptyStateTitle>
            <EmptyStateText>
              Start logging your social interactions to see trends and patterns.
            </EmptyStateText>
            <ActionButton variant="primary" onClick={handleLogInteraction}>
              Log Your First Interaction
            </ActionButton>
          </EmptyState>
        )}
      </SecondaryGrid>
      
      <Modal isOpen={showInteractionLog}>
        <ModalContent>
          <CloseButton onClick={handleCloseModal}>×</CloseButton>
          <SocialInteractionLog onComplete={handleCloseModal} />
        </ModalContent>
      </Modal>
    </Container>
  );
}