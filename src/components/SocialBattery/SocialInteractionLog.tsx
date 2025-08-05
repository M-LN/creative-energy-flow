import React, { useState } from 'react';
import styled from 'styled-components';
import { InteractionType, SocialContext, WARM_CREATIVE_COLORS } from '../../types';
import { InteractionTypeSelector } from './InteractionTypeSelector';
import { useSocialBattery } from '../../context/SocialBatteryContext';

interface SocialInteractionLogProps {
  onComplete?: () => void;
  className?: string;
}

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
`;

const Title = styled.h2`
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: #333;
  background: linear-gradient(135deg, ${WARM_CREATIVE_COLORS.GOLDEN_YELLOW}, ${WARM_CREATIVE_COLORS.WARM_ORANGE});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  margin: 0;
  color: #666;
  font-size: 16px;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const InputGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #555;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${WARM_CREATIVE_COLORS.GOLDEN_YELLOW};
    box-shadow: 0 0 0 3px ${WARM_CREATIVE_COLORS.GOLDEN_YELLOW}30;
  }
`;

const RangeInput = styled.input`
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #e0e0e0;
  outline: none;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${WARM_CREATIVE_COLORS.GOLDEN_YELLOW};
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${WARM_CREATIVE_COLORS.GOLDEN_YELLOW};
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const RangeValue = styled.span<{ value: number; max: number }>`
  font-weight: 600;
  color: ${props => {
    const ratio = props.value / props.max;
    if (ratio <= 0.3) return WARM_CREATIVE_COLORS.SAGE_GREEN;
    if (ratio <= 0.6) return WARM_CREATIVE_COLORS.GOLDEN_YELLOW;
    if (ratio <= 0.8) return WARM_CREATIVE_COLORS.WARM_ORANGE;
    return WARM_CREATIVE_COLORS.DEEP_CORAL;
  }};
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${WARM_CREATIVE_COLORS.GOLDEN_YELLOW};
    box-shadow: 0 0 0 3px ${WARM_CREATIVE_COLORS.GOLDEN_YELLOW}30;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border: 2px solid ${props => 
    props.variant === 'primary' 
      ? WARM_CREATIVE_COLORS.GOLDEN_YELLOW 
      : '#e0e0e0'
  };
  background: ${props => 
    props.variant === 'primary' 
      ? WARM_CREATIVE_COLORS.GOLDEN_YELLOW 
      : 'white'
  };
  color: ${props => props.variant === 'primary' ? 'white' : '#666'};
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px ${props => 
      props.variant === 'primary' 
        ? WARM_CREATIVE_COLORS.GOLDEN_YELLOW + '40' 
        : 'rgba(0, 0, 0, 0.1)'
    };
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ErrorMessage = styled.div`
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
`;

export function SocialInteractionLog({ onComplete, className }: SocialInteractionLogProps) {
  const { addInteraction, state } = useSocialBattery();
  
  const [selectedType, setSelectedType] = useState<InteractionType | null>(null);
  const [selectedContext, setSelectedContext] = useState<SocialContext | null>(null);
  const [duration, setDuration] = useState<number>(30);
  const [intensity, setIntensity] = useState<number>(5);
  const [peopleCount, setPeopleCount] = useState<number>(2);
  const [enjoyment, setEnjoyment] = useState<number>(7);
  const [energyBefore] = useState<number>(state.socialBattery.currentLevel);
  const [energyAfter, setEnergyAfter] = useState<number>(state.socialBattery.currentLevel);
  const [notes, setNotes] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  const handleSubmit = () => {
    setError('');
    
    // Validation
    if (!selectedType) {
      setError('Please select an interaction type');
      return;
    }
    
    if (!selectedContext) {
      setError('Please select a social context');
      return;
    }
    
    if (duration <= 0) {
      setError('Duration must be greater than 0');
      return;
    }
    
    // Add the interaction
    addInteraction({
      type: selectedType,
      context: selectedContext,
      duration,
      intensity,
      peopleCount,
      enjoyment,
      energyBefore,
      energyAfter,
      notes: notes.trim() || undefined,
      location: location.trim() || undefined
    });
    
    // Reset form
    setSelectedType(null);
    setSelectedContext(null);
    setDuration(30);
    setIntensity(5);
    setPeopleCount(2);
    setEnjoyment(7);
    setEnergyAfter(state.socialBattery.currentLevel);
    setNotes('');
    setLocation('');
    
    onComplete?.();
  };
  
  const handleCancel = () => {
    onComplete?.();
  };
  
  const isFormValid = selectedType && selectedContext && duration > 0;
  
  return (
    <Container className={className}>
      <Header>
        <Title>Log Social Interaction</Title>
        <Subtitle>Track how social activities affect your energy</Subtitle>
      </Header>
      
      <InteractionTypeSelector
        selectedType={selectedType}
        selectedContext={selectedContext}
        onTypeSelect={setSelectedType}
        onContextSelect={setSelectedContext}
      />
      
      <FormSection>
        <SectionTitle>Interaction Details</SectionTitle>
        
        <InputGrid>
          <InputGroup>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="1440"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </InputGroup>
          
          <InputGroup>
            <Label htmlFor="people">Number of People</Label>
            <Input
              id="people"
              type="number"
              min="0"
              max="100"
              value={peopleCount}
              onChange={(e) => setPeopleCount(Number(e.target.value))}
            />
          </InputGroup>
        </InputGrid>
        
        <InputGroup>
          <Label htmlFor="intensity">
            How draining was it? <RangeValue value={intensity} max={10}>{intensity}/10</RangeValue>
          </Label>
          <RangeInput
            id="intensity"
            type="range"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
          />
        </InputGroup>
        
        <InputGroup>
          <Label htmlFor="enjoyment">
            How much did you enjoy it? <RangeValue value={enjoyment} max={10}>{enjoyment}/10</RangeValue>
          </Label>
          <RangeInput
            id="enjoyment"
            type="range"
            min="1"
            max="10"
            value={enjoyment}
            onChange={(e) => setEnjoyment(Number(e.target.value))}
          />
        </InputGroup>
        
        <InputGroup>
          <Label htmlFor="energy-after">
            Social battery after interaction: <RangeValue value={energyAfter} max={100}>{energyAfter}%</RangeValue>
          </Label>
          <RangeInput
            id="energy-after"
            type="range"
            min="0"
            max="100"
            value={energyAfter}
            onChange={(e) => setEnergyAfter(Number(e.target.value))}
          />
        </InputGroup>
        
        <InputGroup>
          <Label htmlFor="location">Location (optional)</Label>
          <Input
            id="location"
            type="text"
            placeholder="e.g., Office, Home, Restaurant"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </InputGroup>
        
        <InputGroup>
          <Label htmlFor="notes">Notes (optional)</Label>
          <TextArea
            id="notes"
            placeholder="Any additional thoughts about this interaction..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </InputGroup>
      </FormSection>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <ButtonGroup>
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={!isFormValid}
        >
          Log Interaction
        </Button>
      </ButtonGroup>
    </Container>
  );
}