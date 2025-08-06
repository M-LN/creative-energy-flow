import { EnergyReading, EnergyType } from '../types/energy';
import { subDays, addHours } from 'date-fns';

export class SampleEnergyReadings {
  static generateSampleReadings(days: number = 30): EnergyReading[] {
    const readings: EnergyReading[] = [];
    const energyTypes: EnergyType[] = ['physical', 'mental', 'emotional', 'creative'];
    const now = new Date();
    
    let idCounter = 1;
    
    for (let i = days; i >= 0; i--) {
      const date = subDays(now, i);
      
      // Generate 2-4 readings per day at different times
      const readingsPerDay = Math.floor(Math.random() * 3) + 2;
      const timeSlots = [8, 12, 16, 20]; // morning, noon, afternoon, evening
      
      for (let j = 0; j < readingsPerDay; j++) {
        const randomType = energyTypes[Math.floor(Math.random() * energyTypes.length)];
        const timeSlot = timeSlots[j % timeSlots.length];
        const timestamp = addHours(date, timeSlot);
        
        // Generate realistic energy levels with some patterns
        let baseLevel = 5;
        
        // Time-based patterns
        if (timeSlot === 8) baseLevel = 6; // morning energy
        if (timeSlot === 12) baseLevel = 7; // midday peak
        if (timeSlot === 16) baseLevel = 5; // afternoon dip
        if (timeSlot === 20) baseLevel = 4; // evening low
        
        // Type-based patterns
        if (randomType === 'physical') baseLevel += Math.random() > 0.5 ? 1 : -1;
        if (randomType === 'mental') baseLevel += timeSlot === 12 ? 2 : 0;
        if (randomType === 'creative') baseLevel += timeSlot === 16 ? 2 : -1;
        if (randomType === 'emotional') baseLevel += Math.random() > 0.3 ? 1 : -2;
        
        // Add some randomness
        const variation = (Math.random() - 0.5) * 3;
        const finalLevel = Math.max(1, Math.min(10, Math.round(baseLevel + variation)));
        
        // Generate occasional notes and tags
        const notes = Math.random() > 0.7 ? this.getRandomNote(randomType, finalLevel) : undefined;
        const tags = Math.random() > 0.8 ? this.getRandomTags(randomType) : undefined;
        
        readings.push({
          id: idCounter++,
          timestamp: timestamp.toISOString(),
          type: randomType,
          level: finalLevel,
          notes,
          tags
        });
      }
    }
    
    return readings.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
  
  private static getRandomNote(type: EnergyType, level: number): string {
    const notes = {
      physical: [
        level > 7 ? "Feeling energized after workout" : "Need more sleep",
        level > 6 ? "Good energy today" : "Body feels tired",
        "Just had coffee",
        "Took a walk outside"
      ],
      mental: [
        level > 7 ? "Sharp focus and clarity" : "Brain fog today",
        level > 6 ? "Productive thinking" : "Hard to concentrate",
        "After meditation session",
        "Completed challenging task"
      ],
      emotional: [
        level > 7 ? "Feeling positive and upbeat" : "Feeling a bit down",
        level > 6 ? "Emotionally balanced" : "Stressed about deadlines",
        "Had a good conversation",
        "Dealing with some anxiety"
      ],
      creative: [
        level > 7 ? "Ideas flowing freely" : "Creative block today",
        level > 6 ? "Inspired and motivated" : "Struggling with creativity",
        "Working on new project",
        "Need creative stimulation"
      ]
    };
    
    const typeNotes = notes[type];
    return typeNotes[Math.floor(Math.random() * typeNotes.length)];
  }
  
  private static getRandomTags(type: EnergyType): string[] {
    const tagOptions = {
      physical: ["workout", "sleep", "nutrition", "health", "exercise"],
      mental: ["work", "focus", "learning", "problem-solving", "meditation"],
      emotional: ["mood", "stress", "relationships", "self-care", "anxiety"],
      creative: ["art", "writing", "music", "design", "inspiration"]
    };
    
    const typeTags = tagOptions[type];
    const numTags = Math.floor(Math.random() * 2) + 1; // 1-2 tags
    const selectedTags: string[] = [];
    
    for (let i = 0; i < numTags; i++) {
      const randomTag = typeTags[Math.floor(Math.random() * typeTags.length)];
      if (!selectedTags.includes(randomTag)) {
        selectedTags.push(randomTag);
      }
    }
    
    return selectedTags;
  }
}
