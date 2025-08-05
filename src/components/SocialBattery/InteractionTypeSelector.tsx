import React from 'react';
import styled from 'styled-components';
import { InteractionType, SocialContext, WARM_CREATIVE_COLORS } from '../../types';

interface InteractionTypeSelectorProps {
  selectedType: InteractionType | null;
  selectedContext: SocialContext | null;
  onTypeSelect: (type: InteractionType) => void;
  onContextSelect: (context: SocialContext) => void;
  className?: string;
}

const interactionTypeLabels: Record<InteractionType, string> = {
  [InteractionType.WORK_MEETING]: '💼 Work Meeting',
  [InteractionType.SOCIAL_GATHERING]: '🎉 Social Gathering',
  [InteractionType.CLOSE_FRIENDS]: '👫 Close Friends',
  [InteractionType.FAMILY_TIME]: '👨‍👩‍👧‍👦 Family Time',
  [InteractionType.SOLO_TIME]: '🧘‍♀️ Solo Time',
  [InteractionType.PUBLIC_EVENT]: '🏛️ Public Event',
  [InteractionType.ONLINE_MEETING]: '💻 Online Meeting',
  [InteractionType.PHONE_CALL]: '📞 Phone Call'
};

const contextLabels: Record<SocialContext, string> = {
  [SocialContext.WORK]: '💼 Work',
  [SocialContext.PERSONAL]: '💖 Personal',
  [SocialContext.PUBLIC]: '🏛️ Public',
  [SocialContext.INTIMATE]: '❤️ Intimate'
};

const getTypeColor = (type: InteractionType): string => {
  switch (type) {
    case InteractionType.WORK_MEETING:
    case InteractionType.ONLINE_MEETING:
      return WARM_CREATIVE_COLORS.DEEP_CORAL;
    case InteractionType.PUBLIC_EVENT:
      return WARM_CREATIVE_COLORS.MUTED_RED;
    case InteractionType.SOCIAL_GATHERING:
    case InteractionType.PHONE_CALL:
      return WARM_CREATIVE_COLORS.WARM_ORANGE;
    case InteractionType.CLOSE_FRIENDS:
    case InteractionType.FAMILY_TIME:
      return WARM_CREATIVE_COLORS.GOLDEN_YELLOW;
    case InteractionType.SOLO_TIME:
      return WARM_CREATIVE_COLORS.SAGE_GREEN;
    default:
      return WARM_CREATIVE_COLORS.CALM_BLUE;
  }
};

const getContextColor = (context: SocialContext): string => {
  switch (context) {
    case SocialContext.WORK:
      return WARM_CREATIVE_COLORS.DEEP_CORAL;
    case SocialContext.PUBLIC:
      return WARM_CREATIVE_COLORS.WARM_ORANGE;
    case SocialContext.PERSONAL:
      return WARM_CREATIVE_COLORS.GOLDEN_YELLOW;
    case SocialContext.INTIMATE:
      return WARM_CREATIVE_COLORS.SAGE_GREEN;
    default:
      return WARM_CREATIVE_COLORS.CALM_BLUE;
  }
};

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const OptionButton = styled.button<{ 
  isSelected: boolean; 
  color: string; 
  isDraining?: boolean 
}>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 2px solid ${props => props.isSelected ? props.color : '#e0e0e0'};
  background: ${props => props.isSelected ? `${props.color}20` : 'white'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  position: relative;
  
  &:hover {
    border-color: ${props => props.color};
    background: ${props => props.color}10;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px ${props => props.color}30;
  }
  
  &:active {
    transform: translateY(0);
  }
  
  ${props => props.isDraining && `
    &::after {
      content: '⚡';
      position: absolute;
      top: 4px;
      right: 8px;
      font-size: 12px;
    }
  `}
  
  ${props => props.isSelected && `
    box-shadow: 0 0 0 3px ${props.color}30;
  `}
`;

const DrainIndicator = styled.div<{ level: number }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
  margin-left: auto;
`;

const DrainDots = styled.div<{ level: number }>`
  display: flex;
  gap: 2px;
  
  &::before {
    content: ${props => `'${'●'.repeat(props.level)}${'○'.repeat(3 - props.level)}'`};
    color: ${props => {
      if (props.level >= 3) return WARM_CREATIVE_COLORS.MUTED_RED;
      if (props.level >= 2) return WARM_CREATIVE_COLORS.WARM_ORANGE;
      return WARM_CREATIVE_COLORS.GOLDEN_YELLOW;
    }};
  }
`;

const getDrainLevel = (type: InteractionType): number => {
  switch (type) {
    case InteractionType.WORK_MEETING:
    case InteractionType.PUBLIC_EVENT:
      return 3; // High drain
    case InteractionType.SOCIAL_GATHERING:
    case InteractionType.ONLINE_MEETING:
      return 2; // Medium drain
    case InteractionType.CLOSE_FRIENDS:
    case InteractionType.FAMILY_TIME:
    case InteractionType.PHONE_CALL:
      return 1; // Low drain
    case InteractionType.SOLO_TIME:
      return 0; // Recovery
    default:
      return 1;
  }
};

const isRecoveryType = (type: InteractionType): boolean => {
  return type === InteractionType.SOLO_TIME;
};

export function InteractionTypeSelector({
  selectedType,
  selectedContext,
  onTypeSelect,
  onContextSelect,
  className
}: InteractionTypeSelectorProps) {
  return (
    <Container className={className}>
      <Section>
        <SectionTitle>What type of interaction?</SectionTitle>
        <OptionsGrid>
          {Object.entries(interactionTypeLabels).map(([type, label]) => {
            const typedType = type as InteractionType;
            const isSelected = selectedType === typedType;
            const color = getTypeColor(typedType);
            const drainLevel = getDrainLevel(typedType);
            const isRecovery = isRecoveryType(typedType);
            
            return (
              <OptionButton
                key={type}
                isSelected={isSelected}
                color={color}
                isDraining={drainLevel >= 2}
                onClick={() => onTypeSelect(typedType)}
                aria-pressed={isSelected}
              >
                <span>{label}</span>
                <DrainIndicator level={drainLevel}>
                  {isRecovery ? (
                    <span style={{ color: WARM_CREATIVE_COLORS.SAGE_GREEN }}>
                      ⚡+ Recovery
                    </span>
                  ) : (
                    <DrainDots level={drainLevel} />
                  )}
                </DrainIndicator>
              </OptionButton>
            );
          })}
        </OptionsGrid>
      </Section>
      
      <Section>
        <SectionTitle>In what context?</SectionTitle>
        <OptionsGrid>
          {Object.entries(contextLabels).map(([context, label]) => {
            const typedContext = context as SocialContext;
            const isSelected = selectedContext === typedContext;
            const color = getContextColor(typedContext);
            
            return (
              <OptionButton
                key={context}
                isSelected={isSelected}
                color={color}
                onClick={() => onContextSelect(typedContext)}
                aria-pressed={isSelected}
              >
                <span>{label}</span>
              </OptionButton>
            );
          })}
        </OptionsGrid>
      </Section>
    </Container>
  );
}