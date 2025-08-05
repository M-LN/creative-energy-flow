import { EnergyLevel } from '../types/energy';

export interface CreativeConstraint {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  energyLevel: 'low' | 'medium' | 'high';
  tags: string[];
  materials?: string[];
  dateGenerated: Date;
  isCompleted?: boolean;
  completedAt?: Date;
  userNote?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'visual' | 'writing' | 'music' | 'physical' | 'digital' | 'mixed';
}

export interface ConstraintSession {
  id: string;
  constraintId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // actual minutes spent
  isCompleted: boolean;
  energyBefore: EnergyLevel;
  energyAfter?: EnergyLevel;
  createdWork?: {
    title?: string;
    description?: string;
    imageUrl?: string;
    notes?: string;
  };
}

interface ConstraintTemplate {
  title: string;
  description: string;
  energyLevel: 'low' | 'medium' | 'high';
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  materials?: string[];
}

interface ConstraintTemplateGroup {
  type: 'visual' | 'writing' | 'music' | 'physical' | 'digital' | 'mixed';
  templates: ConstraintTemplate[];
}

export class CreativeConstraintEngine {
  private static readonly CONSTRAINT_TEMPLATES: ConstraintTemplateGroup[] = [
    // Visual Constraints
    {
      type: 'visual',
      templates: [
        {
          title: 'Window View Color Palette',
          description: 'Create something using only circles and the colors you can see from your window right now',
          energyLevel: 'low',
          duration: 15,
          difficulty: 'easy',
          materials: ['paper', 'colored pencils', 'digital art app']
        },
        {
          title: 'One-Line Drawing',
          description: 'Draw your current mood using only one continuous line without lifting your pen',
          energyLevel: 'low',
          duration: 10,
          difficulty: 'easy',
          materials: ['pen', 'paper']
        },
        {
          title: 'Texture Treasure Hunt',
          description: 'Create a collage using only textures you can find within arm\'s reach',
          energyLevel: 'medium',
          duration: 20,
          difficulty: 'medium',
          materials: ['phone camera', 'digital art app', 'found objects']
        },
        {
          title: 'Emotion in Shapes',
          description: 'Express your current energy level using only geometric shapes and no more than 3 colors',
          energyLevel: 'medium',
          duration: 15,
          difficulty: 'medium',
          materials: ['digital art app', 'paper', 'markers']
        },
        {
          title: 'Shadow Play Art',
          description: 'Create a composition using shadows of objects around you as the main elements',
          energyLevel: 'low',
          duration: 12,
          difficulty: 'easy',
          materials: ['phone camera', 'lamp', 'various objects']
        }
      ]
    },
    // Writing Constraints
    {
      type: 'writing',
      templates: [
        {
          title: 'Six-Word Story',
          description: 'Tell a complete story about your day in exactly six words',
          energyLevel: 'low',
          duration: 8,
          difficulty: 'easy',
          materials: ['phone', 'notebook']
        },
        {
          title: 'Alphabet Feelings',
          description: 'Write 26 words describing how you feel right now, one for each letter A-Z',
          energyLevel: 'medium',
          duration: 15,
          difficulty: 'medium',
          materials: ['notebook', 'phone']
        },
        {
          title: 'Reverse Dictionary',
          description: 'Describe the concept of "creativity" without using any creative-related words',
          energyLevel: 'medium',
          duration: 10,
          difficulty: 'medium',
          materials: ['notebook', 'phone']
        },
        {
          title: 'Sound Poetry',
          description: 'Write a poem using only the sounds you can hear right now as inspiration',
          energyLevel: 'low',
          duration: 12,
          difficulty: 'easy',
          materials: ['notebook', 'phone']
        }
      ]
    },
    // Digital Constraints
    {
      type: 'digital',
      templates: [
        {
          title: 'Color Gradient Message',
          description: 'Create a digital message to your future self using only gradients and simple shapes',
          energyLevel: 'low',
          duration: 15,
          difficulty: 'easy',
          materials: ['design app', 'phone', 'computer']
        },
        {
          title: 'Emoji Story',
          description: 'Tell the story of your perfect day using only emojis (max 20)',
          energyLevel: 'low',
          duration: 8,
          difficulty: 'easy',
          materials: ['phone', 'emoji keyboard']
        },
        {
          title: 'Minimalist Interface',
          description: 'Design a simple app interface for tracking one thing you care about',
          energyLevel: 'medium',
          duration: 20,
          difficulty: 'medium',
          materials: ['design app', 'paper', 'pen']
        }
      ]
    },
    // Physical Constraints
    {
      type: 'physical',
      templates: [
        {
          title: 'Pocket Sculpture',
          description: 'Create a small sculpture using only items currently in your pockets or bag',
          energyLevel: 'low',
          duration: 10,
          difficulty: 'easy',
          materials: ['pocket contents', 'bag contents']
        },
        {
          title: 'Balance Challenge',
          description: 'Arrange 5 everyday objects into a balanced composition that tells a story',
          energyLevel: 'medium',
          duration: 15,
          difficulty: 'medium',
          materials: ['5 nearby objects']
        },
        {
          title: 'Origami from Scrap',
          description: 'Fold something beautiful from a piece of paper you were about to throw away',
          energyLevel: 'low',
          duration: 12,
          difficulty: 'easy',
          materials: ['scrap paper']
        }
      ]
    }
  ];

  // Generate a daily constraint based on user's energy and preferences
  static generateDailyConstraint(
    userEnergy: EnergyLevel,
    previousConstraints: CreativeConstraint[] = [],
    userPreferences?: {
      preferredTypes?: string[];
      preferredDuration?: number;
      preferredDifficulty?: string;
    }
  ): CreativeConstraint {
    // Determine appropriate energy level for constraint
    const overallEnergy = userEnergy.overall;
    let targetEnergyLevel: 'low' | 'medium' | 'high';
    
    if (overallEnergy < 40) {
      targetEnergyLevel = 'low';
    } else if (overallEnergy < 70) {
      targetEnergyLevel = 'medium';
    } else {
      targetEnergyLevel = 'high';
    }

    // Filter templates based on energy level and preferences
    const availableTemplates = this.CONSTRAINT_TEMPLATES.flatMap(category => 
      category.templates.filter(template => {
        // Energy level match
        if (template.energyLevel !== targetEnergyLevel && targetEnergyLevel === 'low') {
          return template.energyLevel === 'low';
        }
        
        // Type preference
        if (userPreferences?.preferredTypes?.length) {
          if (!userPreferences.preferredTypes.includes(category.type)) {
            return false;
          }
        }
        
        // Duration preference
        if (userPreferences?.preferredDuration) {
          const durationDiff = Math.abs(template.duration - userPreferences.preferredDuration);
          if (durationDiff > 5) return false; // Within 5 minutes
        }
        
        // Difficulty preference
        if (userPreferences?.preferredDifficulty) {
          if (template.difficulty !== userPreferences.preferredDifficulty) {
            return false;
          }
        }
        
        return true;
      }).map(template => ({ 
        ...template, 
        type: category.type as 'visual' | 'writing' | 'music' | 'physical' | 'digital' | 'mixed'
      }))
    );

    // Avoid recent constraints
    const recentConstraintTitles = previousConstraints
      .filter(c => {
        const daysSince = (Date.now() - c.dateGenerated.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince < 7; // Last week
      })
      .map(c => c.title);

    const freshTemplates = availableTemplates.filter(
      template => !recentConstraintTitles.includes(template.title)
    );

    const selectedTemplates = freshTemplates.length > 0 ? freshTemplates : availableTemplates;
    const randomTemplate = selectedTemplates[Math.floor(Math.random() * selectedTemplates.length)];

    // Add some variation to the description
    const variations = this.generateDescriptionVariations(randomTemplate);
    const selectedVariation = variations[Math.floor(Math.random() * variations.length)];

    return {
      id: `constraint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: randomTemplate.title,
      description: selectedVariation,
      duration: randomTemplate.duration,
      energyLevel: randomTemplate.energyLevel,
      difficulty: randomTemplate.difficulty,
      type: randomTemplate.type,
      tags: this.generateTags(randomTemplate),
      materials: randomTemplate.materials,
      dateGenerated: new Date(),
      isCompleted: false
    };
  }

  // Generate variations of constraint descriptions
  private static generateDescriptionVariations(template: any): string[] {
    const base = template.description;
    const variations = [base];

    // Add time-based variations
    const timeVariations = [
      base.replace('right now', 'at this moment'),
      base.replace('current', 'present'),
      base.replace('today', 'this moment')
    ];

    // Add encouragement variations
    const encouragements = [
      `${base} (Don't overthink it!)`,
      `${base} (Trust your instincts!)`,
      `${base} (Have fun with it!)`,
      `${base} (There's no wrong way!)`
    ];

    return [...variations, ...timeVariations, ...encouragements].filter(
      (v, i, arr) => arr.indexOf(v) === i
    ); // Remove duplicates
  }

  // Generate relevant tags for the constraint
  private static generateTags(template: any): string[] {
    const baseTags = [template.type, template.energyLevel, template.difficulty];
    
    const additionalTags = [];
    if (template.duration <= 10) additionalTags.push('quick');
    if (template.duration >= 20) additionalTags.push('extended');
    if (template.materials?.includes('phone')) additionalTags.push('mobile-friendly');
    if (template.materials?.some((m: string) => m.includes('digital'))) additionalTags.push('digital');
    if (template.materials?.some((m: string) => m.includes('paper'))) additionalTags.push('analog');

    return [...baseTags, ...additionalTags];
  }

  // Get constraint suggestions based on current context
  static getConstraintSuggestions(
    timeOfDay: 'morning' | 'afternoon' | 'evening',
    availableTime: number, // minutes
    energyLevel: EnergyLevel
  ): CreativeConstraint[] {
    // Time-based suggestions
    const timeBasedTemplates = this.getTimeBasedTemplates(timeOfDay);
    
    // Duration-based filtering
    const durationFiltered = timeBasedTemplates.filter(
      template => template.duration <= availableTime
    );

    // Energy-based filtering
    const energyFiltered = durationFiltered.filter(template => {
      if (energyLevel.overall < 40) return template.energyLevel === 'low';
      if (energyLevel.overall < 70) return template.energyLevel !== 'high';
      return true;
    });

    // Generate 3 suggestions
    const shuffled = energyFiltered.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3).map(template => ({
      id: `suggestion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: template.title,
      description: template.description,
      duration: template.duration,
      energyLevel: template.energyLevel as 'low' | 'medium' | 'high',
      difficulty: template.difficulty as 'easy' | 'medium' | 'hard',
      type: template.type as any,
      tags: this.generateTags(template),
      materials: template.materials,
      dateGenerated: new Date(),
      isCompleted: false
    }));
  }

  private static getTimeBasedTemplates(timeOfDay: string): any[] {
    const allTemplates = this.CONSTRAINT_TEMPLATES.flatMap(category => 
      category.templates.map(template => ({ ...template, type: category.type }))
    );

    switch (timeOfDay) {
      case 'morning':
        return allTemplates.filter(t => 
          t.energyLevel !== 'high' && t.duration <= 15
        );
      case 'afternoon':
        return allTemplates; // All available
      case 'evening':
        return allTemplates.filter(t => 
          ['low', 'medium'].includes(t.energyLevel) && t.duration <= 20
        );
      default:
        return allTemplates;
    }
  }

  // Calculate constraint success metrics
  static calculateConstraintMetrics(sessions: ConstraintSession[]): {
    completionRate: number;
    averageDuration: number;
    energyImpact: number;
    favoriteTypes: string[];
    streak: number;
  } {
    if (sessions.length === 0) {
      return {
        completionRate: 0,
        averageDuration: 0,
        energyImpact: 0,
        favoriteTypes: [],
        streak: 0
      };
    }

    const completed = sessions.filter(s => s.isCompleted);
    const completionRate = (completed.length / sessions.length) * 100;
    
    const averageDuration = completed.reduce((sum, s) => sum + s.duration, 0) / completed.length || 0;
    
    // Calculate energy impact (average change in overall energy)
    const energyChanges = completed
      .filter(s => s.energyAfter)
      .map(s => s.energyAfter!.overall - s.energyBefore.overall);
    const energyImpact = energyChanges.reduce((sum, change) => sum + change, 0) / energyChanges.length || 0;

    // Calculate current streak
    let streak = 0;
    const sortedSessions = sessions
      .filter(s => s.isCompleted)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
    
    for (const session of sortedSessions) {
      const daysDiff = (Date.now() - session.startTime.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff <= streak + 1) {
        streak++;
      } else {
        break;
      }
    }

    // Find favorite constraint types (placeholder)
    const favoriteTypes = ['visual', 'writing']; // Would be calculated from actual data

    return {
      completionRate,
      averageDuration,
      energyImpact,
      favoriteTypes,
      streak
    };
  }
}
