import { GoalType, UserDataType } from '../shared/enums';
import { UserDataModel } from './user-data-model';

/**
 * Goal Model - goal-model.ts
 *
 * Model that interacts with database for goal data
 * 
 */
export class GoalModel extends UserDataModel {

  // class properties
  // document ID: [uuid]/[collectionName]/[type]/[eventDate]
  public label: string;
  public type: GoalType;
  public completion: boolean;
  public disabled: boolean;

  public constructor(data?: any) {

    if (!data) { data = {}; }
    super(data);

    // override collection type
    this.defineField('dataType', { type: 'String', defaultValue: UserDataType.Goal });

    // field definitions for class properties
    this.defineField('label', { type: 'String' });
    this.defineField('dataType', { type: 'Any', defaultValue: GoalType.ExerciseStepCount });
    this.defineField('completion', { type: 'Boolean', defaultValue: false });
    this.defineField('disabled', { type: 'Boolean', defaultValue: false });

    // populate document and commit changes
    this.populate(data);
  }

  /**
   * STATIC METHODS
   */
  public static defaultGoalList() {
    // creates default list with complete set of goals
    const goalList: GoalModel[] = [
      new GoalModel({ label: 'Sleep 8 Hours', type: GoalType.SleepHrs }),
      new GoalModel({ label: 'Sleep Bedtime Consistency', type: GoalType.SleepTimeConsistency }),
      new GoalModel({ label: 'Medication Adherence', type: GoalType.MedicationAdherence }),
      new GoalModel({ label: 'Medication Intake Consistency', type: GoalType.MedicationTimeConsistency }),
      new GoalModel({ label: 'Exercise Step Count', type: GoalType.ExerciseStepCount }),
      new GoalModel({ label: 'Exercise Active Minutes', type: GoalType.ExerciseActiveMins }),
    ];
    return goalList;
  }

}
